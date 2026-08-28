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
      toneMappingExposure:{value:1.12},
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
          // Shadow split-tone: the dark end slides toward teal, the lit end
          // stays warm. This is where "shadow is blue-green" actually comes
          // from at this bar — not from the light rig.
          float sh=pow(1.0-l,2.2);
          c=mix(c,c*vec3(0.80,1.02,1.22)+vec3(0.0,0.018,0.045),sh*0.6);
          // Mild vibrance: boost muted pixels, spare the saturated ones.
          float mx=max(c.r,max(c.g,c.b)),mn=min(c.r,min(c.g,c.b));
          c=mix(vec3(dot(c,vec3(0.2126,0.7152,0.0722))),c,1.0+0.14*(1.0-(mx-mn)));
        }
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
