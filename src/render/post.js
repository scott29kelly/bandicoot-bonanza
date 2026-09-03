/**
 * The post chain — part of the render/ single-owner system.
 *
 * Pipeline law (docs/QUALITY-BAR.md): render LINEAR into a float buffer and
 * tone map ONCE, at the very end. Round-2 measurement forced this into
 * existence: lights multiply albedo, so no light rig can push a warm sand
 * shadow toward teal — the blue floor of the reference look is a GRADE
 * (split-toned shadows), which needs display-referred pixels to work on.
 *
 * One MSAA HDR target, one composite pass: AgX -> shadow split-tone ->
 * vibrance -> sRGB. `?ablate=grade` bypasses the grade (tonemap stays) so a
 * critic's claim about it is a ten-second A/B, not an argument.
 */
import * as THREE from 'three';
import {ablated} from '../core/config.js';

export function createPost(renderer){
  const size=new THREE.Vector2();
  renderer.getDrawingBufferSize(size);
  const rt=new THREE.WebGLRenderTarget(size.x,size.y,{
    type:THREE.HalfFloatType,
    samples:4,               // the RT path skips canvas MSAA; bring our own
    depthBuffer:true
  });

  const mat=new THREE.ShaderMaterial({
    uniforms:{
      tDiffuse:{value:rt.texture},
      toneMappingExposure:{value:1.0},
      uGrade:{value:ablated('grade')?0:1}
    },
    depthTest:false,
    depthWrite:false,
    vertexShader:`
      varying vec2 vUv;
      void main(){
        vUv=uv;
        gl_Position=vec4(position.xy,0.0,1.0);
      }`,
    fragmentShader:`
      #include <tonemapping_pars_fragment>
      uniform sampler2D tDiffuse;
      uniform float uGrade;
      varying vec2 vUv;
      void main(){
        vec3 c=texture2D(tDiffuse,vUv).rgb;
        c=AgXToneMapping(c);
        if(uGrade>0.5){
          float l=dot(c,vec3(0.2126,0.7152,0.0722));
          // Shadow split-tone: MULTIPLICATIVE only. The round-2 version
          // added a lift, which fixed shadow hue by paying with the key
          // contrast two critics then flagged. Tint, never lift.
          float sh=pow(1.0-l,2.2);
          c=mix(c,c*vec3(0.70,1.0,1.34),sh*0.65);
          // Contrast S-curve: AgX alone is deliberately flat; the refs are
          // not. Applied after the split-tone so shadows deepen INTO teal.
          c=mix(c,c*c*(3.0-2.0*c),0.42);
          // Saturation: global push, then extra for muted pixels.
          l=dot(c,vec3(0.2126,0.7152,0.0722));
          c=mix(vec3(l),c,1.22);
          float mx=max(c.r,max(c.g,c.b)),mn=min(c.r,min(c.g,c.b));
          c=mix(vec3(dot(c,vec3(0.2126,0.7152,0.0722))),c,1.0+0.18*(1.0-(mx-mn)));
          // Highlight knee: AgX rolls 1.0 linear to ~0.85 display and the
          // S-curve leaves it there — round 21 measured max L 0.85–0.91 in
          // every still, 0.00% of pixels above 0.85. Foam, eye whites and
          // the fruit rim get the last stop back; mids are barely touched.
          float hl=smoothstep(0.58,0.92,dot(c,vec3(0.2126,0.7152,0.0722)));
          c*=1.0+0.24*hl;
        }
        // Black floor (Pillar B: nothing crushes to black). Surfaces lit by
        // ambient alone — crevices, undersides, the shade side of a clump —
        // landed at rgb sum ~5 in round-19/20 stills (magenta-clear probe:
        // rendered surfaces, not holes). A soft floor, teal like every other
        // shadow here: unchanged above ~0.03, never flat below it.
        vec3 fl=vec3(0.0035,0.0065,0.011); // round 27: every frame's min was the floor at L 0.101
        c=sqrt(c*c+fl*fl);
        c=clamp(c,0.0,1.0);
        // Manual sRGB OETF — this pass owns the canvas, nothing runs after.
        c=mix(c*12.92,1.055*pow(c,vec3(1.0/2.4))-0.055,step(vec3(0.0031308),c));
        gl_FragColor=vec4(c,1.0);
      }`
  });
  // One oversized triangle beats a quad: no diagonal seam interpolation.
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute([-1,-1,0, 3,-1,0, -1,3,0],3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0, 2,0, 0,2],2));
  const quad=new THREE.Mesh(geo,mat);
  quad.frustumCulled=false;
  const postScene=new THREE.Scene();
  postScene.add(quad);
  const postCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);

  return {
    render(scene,camera){
      renderer.setRenderTarget(rt);
      renderer.render(scene,camera);
      renderer.setRenderTarget(null);
      renderer.render(postScene,postCam);
    },
    setSize(){
      renderer.getDrawingBufferSize(size);
      rt.setSize(size.x,size.y);
    }
  };
}
