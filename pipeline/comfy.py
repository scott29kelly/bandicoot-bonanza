"""Local ComfyUI helper for the Whisker Trek asset pipeline.

Converts a ComfyUI workflow template (UI format, with nested subgraphs) into an API prompt,
applies overrides, queues it on the local server (127.0.0.1:8188 only), waits, and downloads outputs.

Usage from Python:
    from comfy import Workflow
    wf = Workflow('templates/image_z_image_turbo.json')
    wf.set('CLIPTextEncode', 'text', 'a brass key on oak')   # class name or node title, input name
    files = wf.run(out_dir='assets-raw/key', prefix='key')
"""
import json, time, uuid, urllib.request, urllib.parse, pathlib, mimetypes

HOST = 'http://127.0.0.1:8188'
HERE = pathlib.Path(__file__).parent
_info_file = HERE / 'object_info.json'
if not _info_file.exists():  # node schemas from the running server, cached locally (git-ignored)
    _info_file.write_bytes(urllib.request.urlopen(HOST + '/object_info', timeout=120).read())
INFO = json.loads(_info_file.read_text(encoding='utf-8'))
SKIP = {'MarkdownNote', 'Note', 'Reroute', 'PrimitiveNode'}
# Preview nodes pass their input through in current ComfyUI, so they stay when something reads them.
PREVIEW = {'PreviewImage', 'PreviewAny', 'MaskPreview', 'Preview3D', 'Preview3DAdvanced', 'PreviewAudio'}
WIDGET_TYPES = {'INT', 'FLOAT', 'STRING', 'BOOLEAN', 'COMBO', 'COLOR', 'LOAD_3D', 'LOAD_3D_ANIMATION'}  # last two: frontend viewport widgets


def _get(path):
    with urllib.request.urlopen(HOST + path, timeout=60) as r:
        return json.loads(r.read())


def _post(path, body):
    req = urllib.request.Request(HOST + path, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(e.read().decode()[:4000])


def upload(path):
    """Uploads a local image to ComfyUI's input folder and returns the stored name."""
    path = pathlib.Path(path)
    boundary = uuid.uuid4().hex
    body = (f'--{boundary}\r\nContent-Disposition: form-data; name="image"; filename="{path.name}"\r\n'
            f'Content-Type: {mimetypes.guess_type(path.name)[0] or "application/octet-stream"}\r\n\r\n').encode() + path.read_bytes() + \
           f'\r\n--{boundary}\r\nContent-Disposition: form-data; name="overwrite"\r\n\r\ntrue\r\n--{boundary}--\r\n'.encode()
    req = urllib.request.Request(HOST + '/upload/image', data=body, headers={'Content-Type': f'multipart/form-data; boundary={boundary}'})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read())['name']


def _assign(spec, values, out, prefix='', top=True, ui_widgets=()):
    """Consumes widgets_values in schema order into out{name: value}. Handles V3 dynamic combos,
    whose chosen option's own widgets follow the combo value and are named "<combo>.<input>"."""
    for group in ('required', 'optional'):
        for name, s in spec.get(group, {}).items():
            t, opts = s[0], (s[1] if len(s) > 1 and isinstance(s[1], dict) else {})
            if opts.get('forceInput') and name not in ui_widgets:
                continue
            if t == 'COMFY_DYNAMICCOMBO_V3':
                if not values:
                    return
                key = values.pop(0)
                out[prefix + name] = key
                chosen = next((o for o in opts.get('options', []) if o.get('key') == key), None)
                if chosen:
                    _assign(chosen.get('inputs', {}), values, out, prefix + name + '.', False)
                continue
            multi = isinstance(t, str) and ',' in t and (opts.get('widgetType') or any(x in WIDGET_TYPES for x in t.split(',')))
            if isinstance(t, list) or t in WIDGET_TYPES or multi or (top and name in ui_widgets):
                if not values:
                    return
                out[prefix + name] = values.pop(0)
                if values and (opts.get('control_after_generate') or (top and t == 'INT' and name in ('seed', 'noise_seed'))):
                    values.pop(0)  # the "control after generate" value that follows a seed


def _ordered(cls):
    """Schema inputs in the server's declared order."""
    spec = INFO[cls]['input']
    order = INFO[cls].get('input_order')
    if not order:
        return spec
    return {g: {n: spec[g][n] for n in order.get(g, []) if n in spec.get(g, {})} for g in ('required', 'optional')}


class Workflow:
    def __init__(self, template):
        self.ui = json.loads(pathlib.Path(template).read_text(encoding='utf-8'))
        self.defs = {s['id']: s for s in self.ui.get('definitions', {}).get('subgraphs', [])}
        self.api = {}
        self.titles = {}
        self._flatten(self.ui['nodes'], self._links(self.ui['links']), '', None)

    @staticmethod
    def _links(raw):
        out = {}
        for l in raw:
            if isinstance(l, list):
                out[l[0]] = (l[1], l[2], l[3], l[4])
            else:
                out[l['id']] = (l['origin_id'], l['origin_slot'], l['target_id'], l['target_slot'])
        return out

    def _flatten(self, nodes, links, prefix, parent):
        """parent: (resolve_fn_for_parent_scope, instance_node) for subgraph scopes."""
        by_id = {n['id']: n for n in nodes}
        scope = {'nodes': by_id, 'links': links, 'prefix': prefix, 'parent': parent}

        def resolve(node_id, slot, depth=0):
            """Follows a link source to a real API node: returns [api_id, slot] or None."""
            if depth > 50:
                return None
            if node_id == -10:  # subgraph input
                if not parent:
                    return None
                presolve, inst = parent
                # Match the subgraph's input slot to the instance input by name; instance order can differ.
                d_inputs = self.defs[inst['type']]['inputs']
                want = d_inputs[slot]['name'] if slot < len(d_inputs) else None
                inp = next((i for i in inst.get('inputs', []) if i.get('name') == want), None)
                if not inp or inp.get('link') is None:
                    return None
                o = presolve['links'][inp['link']]
                return presolve['resolve'](o[0], o[1], depth + 1)
            n = by_id.get(node_id)
            if n is None:
                return None
            if n['type'] in self.defs:  # output of a nested subgraph instance
                sub = scope['subs'][node_id]
                out = self.defs[n['type']]['outputs'][slot]
                if not out.get('linkIds'):
                    return None
                o = sub['links'][out['linkIds'][0]]
                return sub['resolve'](o[0], o[1], depth + 1)
            if n['type'] == 'Reroute' or n.get('mode') == 4:  # pass-through
                ins = [i for i in n.get('inputs', []) if i.get('link') is not None]
                match = [i for i in ins if i.get('type') == (n['outputs'][slot]['type'] if n.get('outputs') else None)] or ins
                if not match:
                    return None
                o = links[match[0]['link']]
                return resolve(o[0], o[1], depth + 1)
            if n.get('mode') == 2:
                return None
            return [prefix + str(node_id), slot]

        scope['resolve'] = resolve
        scope['subs'] = {}
        # Nested subgraphs first, so resolve() can reach into them.
        for n in nodes:
            if n['type'] in self.defs:
                d = self.defs[n['type']]
                scope['subs'][n['id']] = self._flatten(d['nodes'], self._links(d['links']), f"{prefix}{n['id']}:", (scope, n))
        for n in nodes:
            cls = n['type']
            if cls in self.defs or cls in SKIP or n.get('mode') in (2, 4) or cls not in INFO:
                continue
            api_id = prefix + str(n['id'])
            inputs = {}
            wv = n.get('widgets_values', [])
            if isinstance(wv, dict):
                inputs.update({k: v for k, v in wv.items() if k in INFO[cls]['input'].get('required', {}) or k in INFO[cls]['input'].get('optional', {})})
            else:
                _assign(_ordered(cls), list(wv), inputs, ui_widgets={i['name'] for i in n.get('inputs', []) if i.get('widget')})
            for inp in n.get('inputs', []):
                if inp.get('link') is None:
                    continue
                o = links[inp['link']]
                src = resolve(o[0], o[1])
                if src is not None:
                    inputs[inp['name']] = src
            # Templates can predate a node's newer required inputs; fall back to the schema default.
            for name, spec in INFO[cls]['input'].get('required', {}).items():
                if name not in inputs and len(spec) > 1 and isinstance(spec[1], dict) and 'default' in spec[1]:
                    inputs[name] = spec[1]['default']
            self.api[api_id] = {'class_type': cls, 'inputs': inputs, '_meta': {'title': n.get('title') or cls}}
            self.titles.setdefault(n.get('title') or cls, []).append(api_id)
        return scope

    def set(self, key, name, value):
        """Sets an input on every node whose class or title matches key (exact first, then title prefix), or on an API id."""
        hits = [i for i, n in self.api.items() if i == key or n['class_type'] == key or n['_meta']['title'] == key]
        hits = hits or [i for i, n in self.api.items() if n['_meta']['title'].startswith(key)]
        if not hits:
            raise KeyError(f'no node matches {key}')
        for i in hits:
            self.api[i]['inputs'][name] = value
        return hits

    def find(self, cls):
        return [i for i, n in self.api.items() if n['class_type'] == cls]

    def prune(self):
        """Drops nodes nothing depends on, except output nodes."""
        while True:
            used = {v[0] for n in self.api.values() for v in n['inputs'].values() if isinstance(v, list) and len(v) == 2 and isinstance(v[0], str)}
            dead = [i for i, n in self.api.items() if i not in used and (n['class_type'] in PREVIEW or not INFO[n['class_type']].get('output_node'))]
            if not dead:
                return
            for i in dead:
                del self.api[i]

    def run(self, out_dir, prefix='out', timeout=3600):
        self.prune()
        out_dir = pathlib.Path(out_dir)
        out_dir.mkdir(parents=True, exist_ok=True)
        r = _post('/prompt', {'prompt': self.api, 'client_id': 'bandicoot-bonanza'})
        if r.get('node_errors'):
            # ComfyUI still runs the valid outputs; treat any rejected output as a failure.
            raise RuntimeError(json.dumps(r['node_errors'])[:4000])
        pid = r['prompt_id']
        t0 = time.time()
        while time.time() - t0 < timeout:
            h = _get('/history/' + pid)
            if pid in h:
                st = h[pid].get('status', {})
                if st.get('status_str') == 'error':
                    raise RuntimeError(json.dumps(st.get('messages', []))[-3000:])
                files = []
                for node_out in h[pid]['outputs'].values():
                    for key in ('images', 'gifs', 'video', 'videos', 'audio', '3d', 'meshes', 'files', 'result'):
                        for f in node_out.get(key, []) or []:
                            if not isinstance(f, dict) or 'filename' not in f:
                                continue
                            q = urllib.parse.urlencode({'filename': f['filename'], 'subfolder': f.get('subfolder', ''), 'type': f.get('type', 'output')})
                            data = urllib.request.urlopen(f'{HOST}/view?{q}', timeout=300).read()
                            dest = out_dir / f"{prefix}{pathlib.Path(f['filename']).suffix}" if len(files) == 0 else out_dir / f"{prefix}-{len(files)}{pathlib.Path(f['filename']).suffix}"
                            dest.write_bytes(data)
                            files.append(dest)
                return files, round(time.time() - t0, 1)
            time.sleep(2)
        raise TimeoutError(pid)


def free():
    """Unloads models and frees GPU memory between heavy jobs."""
    _post('/free', {'unload_models': True, 'free_memory': True}) if False else urllib.request.urlopen(
        urllib.request.Request(HOST + '/free', data=json.dumps({'unload_models': True, 'free_memory': True}).encode(), headers={'Content-Type': 'application/json'}), timeout=60).read()
    time.sleep(3)
