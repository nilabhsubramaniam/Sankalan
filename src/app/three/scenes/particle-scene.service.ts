import { inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// ─── Public API ───────────────────────────────────────────────────────────────
export interface ParticleSceneOptions {
  canvas: HTMLCanvasElement;
  particleCount?: number;
  accentColor?: number;
}

// Easing: easeOutQuart — fast rush then smooth deceleration (warp feel)
function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}

// ─── Comet ────────────────────────────────────────────────────────────────────
interface CometData {
  points:    THREE.Points;
  posAttr:   THREE.BufferAttribute;
  alphaAttr: THREE.BufferAttribute;
  sizeAttr:  THREE.BufferAttribute;
  head:      THREE.Vector3;
  dir:       THREE.Vector3;
  speed:     number;
  traveled:  number;
  travelMax: number;
}

// ─── Solar Flare ──────────────────────────────────────────────────────────────
interface FlareData {
  points:    THREE.Points;
  posAttr:   THREE.BufferAttribute;
  alphaAttr: THREE.BufferAttribute;
  sizeAttr:  THREE.BufferAttribute;
  age:       number;
  duration:  number;
  eruptAxis: THREE.Vector3;   // outward normal from sun surface
  perpAxis:  THREE.Vector3;   // arc bow direction
  arcLen:    number;          // how far flare extends
  arcBow:    number;          // lateral bow amount
}

// ─────────────────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ThreeSceneService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  // Core Three.js
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private composer?: EffectComposer;
  private frameId?: number;
  private readonly timer = new THREE.Timer();

  // Star layers
  private stars?: THREE.Points;      // final crisp stars
  private trails?: THREE.Points;     // soft streak layer during warp

  // Warp state
  private finalPositions!: Float32Array;
  private warpProgress = 0;
  private readonly WARP_DURATION = 3.0;  // seconds
  private readonly STAR_COUNT    = 5000;
  private isWarping = true;

  // ─── Sun
  private readonly SUN_POS    = new THREE.Vector3(-18, 12, -120);
  private readonly SUN_RADIUS = 38;
  private sun?:        THREE.Mesh;
  private sunCorona?:  THREE.Mesh;
  private sunCorona2?: THREE.Mesh;
  private sunScaleIn   = 0;

  // ─── Solar flares
  private readonly FLARE_SEGS   = 58;
  private readonly MAX_FLARES   = 6;
  private flares:       FlareData[] = [];
  private flareTimer    = 0;
  private flareInterval = 1.8 + Math.random() * 2.4;
  private flareMaterial?: THREE.ShaderMaterial;

  // ─── Solar wind
  private solarWind?:    THREE.Points;
  private swPositions?:  Float32Array;   // world xyz per particle
  private swSpeeds?:     Float32Array;   // radial drift speed per particle
  private swDirs?:       Float32Array;   // unit direction xyz per particle
  private readonly SW_COUNT = 1400;

  // ─── Comets
  private readonly TAIL_SEGS   = 40;          // particles per comet tail
  private readonly MAX_COMETS  = 3;           // concurrent cap
  private comets:      CometData[] = [];
  private cometTimer   = 0;                   // seconds since last spawn
  private cometInterval = 7 + Math.random() * 4;  // randomised interval
  private cometMaterial?: THREE.ShaderMaterial;

  // Mouse / camera
  private mouseX = 0;
  private mouseY = 0;
  private camRotX = 0;
  private camRotY = 0;

  // ─── Lifecycle ─────────────────────────────────────────────────────────────
  init(options: ParticleSceneOptions): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Reset animation state so re-navigation (singleton service) starts fresh
    this.warpProgress    = 0;
    this.isWarping       = true;
    this.sunScaleIn      = 0;
    this.flares          = [];
    this.flareTimer      = 0;
    this.flareInterval   = 1.8 + Math.random() * 2.4;
    this.flareMaterial   = undefined;
    this.cometTimer      = 0;
    this.cometInterval   = 7 + Math.random() * 4;
    this.comets          = [];
    this.cometMaterial   = undefined;

    const { canvas } = options;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;

    this.buildScene();
    this.buildCamera(w, h);
    this.buildRenderer(canvas, w, h);
    this.buildBloom(w, h);
    this.buildStars();
    this.buildTrails();
    this.buildSun();

    canvas.ownerDocument.addEventListener('mousemove', this.onMouseMove);
    this.ngZone.runOutsideAngular(() => this.animate());
  }

  resize(width: number, height: number): void {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.composer?.setSize(width, height);
  }

  destroy(): void {
    if (this.frameId !== undefined) cancelAnimationFrame(this.frameId);

    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('mousemove', this.onMouseMove);
    }

    // Dispose flares
    this.flares.forEach(f => {
      this.scene?.remove(f.points);
      f.points.geometry.dispose();
    });
    this.flares = [];
    this.flareMaterial?.dispose();
    this.flareMaterial = undefined;

    // Remove active comets from scene and dispose their geometries first
    // so the traverse below doesn't encounter the shared cometMaterial
    this.comets.forEach(c => {
      this.scene?.remove(c.points);
      c.points.geometry.dispose();
    });
    this.comets = [];
    this.cometMaterial?.dispose();
    this.cometMaterial = undefined;

    this.scene?.traverse((obj) => {
      if (obj instanceof THREE.Points) {
        obj.geometry?.dispose();
        (obj.material as THREE.Material)?.dispose();
      }
    });

    [this.sun, this.sunCorona, this.sunCorona2].forEach(mesh => {
      if (mesh) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
    });
    this.sunCorona2 = undefined;

    this.composer?.dispose();
    this.renderer?.dispose();
  }

  // ─── Builders ──────────────────────────────────────────────────────────────
  private buildScene(): void {
    this.scene = new THREE.Scene();
    // Pure near-black with a trace of blue — matches SpaceX ISS sim background
    this.scene.background = new THREE.Color(0x000008);
  }

  private buildCamera(w: number, h: number): void {
    // Camera sits at origin, looking forward — stars surround it on a sphere
    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 2000);
    this.camera.position.set(0, 0, 0);
    this.camera.rotation.order = 'YXZ';
  }

  private buildRenderer(canvas: HTMLCanvasElement, w: number, h: number): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
  }

  private buildBloom(w: number, h: number): void {
    if (!this.renderer || !this.scene || !this.camera) return;
    const renderPass = new RenderPass(this.scene, this.camera);
    // Strong bloom — sun glow is the hero centrepiece
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.35, 0.55, 0.60);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderPass);
    this.composer.addPass(bloomPass);
  }

  private buildStars(): void {
    const count = this.STAR_COUNT;
    const pos   = new Float32Array(count * 3);
    const col   = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3    = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 280 + Math.random() * 720;

      pos[i3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);

      // SpaceX palette: predominantly cool blue-white, minority warm
      const t = Math.random();
      if (t < 0.55) {
        // Blue-white (O/B class) — dominant
        col[i3]     = 0.78 + Math.random() * 0.22;
        col[i3 + 1] = 0.87 + Math.random() * 0.13;
        col[i3 + 2] = 1.0;
      } else if (t < 0.88) {
        // Cold white (A/F class)
        const v     = 0.93 + Math.random() * 0.07;
        col[i3] = v; col[i3 + 1] = v; col[i3 + 2] = v;
      } else {
        // Faint warm white (G class — rare)
        col[i3]     = 1.0;
        col[i3 + 1] = 0.92 + Math.random() * 0.08;
        col[i3 + 2] = 0.70 + Math.random() * 0.18;
      }
    }

    // Save final positions; warp compresses them near the origin to start
    this.finalPositions = pos.slice();

    const warpPos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      warpPos[i] = pos[i] * 0.005; // ~0 — all stars at vanishing point
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(warpPos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('color',    new THREE.BufferAttribute(col,     3));

    this.stars = new THREE.Points(geo, new THREE.PointsMaterial({
      size:            3.0,      // will shrink to 1.1 as warp ends
      vertexColors:    true,
      transparent:     true,
      opacity:         0.0,      // fades in during warp
      blending:        THREE.AdditiveBlending,
      depthWrite:      false,
      sizeAttenuation: true,
    }));
    this.scene!.add(this.stars);
  }

  private buildTrails(): void {
    // Slightly-lagging soft glow layer — gives the elongated streak illusion
    const count = this.STAR_COUNT;
    const pos   = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = this.finalPositions[i] * 0.005;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));

    this.trails = new THREE.Points(geo, new THREE.PointsMaterial({
      size:        8.0,
      color:       0x99bbff,
      transparent: true,
      opacity:     0.0,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      sizeAttenuation: true,
    }));
    this.scene!.add(this.trails);
  }

  // ─── Render loop ───────────────────────────────────────────────────────────
  private animate(): void {
    this.frameId = requestAnimationFrame(() => this.animate());

    this.timer.update();
    const dt = this.timer.getDelta();

    if (this.isWarping) {
      this.stepWarp(dt);
    } else {
      this.stepDrift(dt);
    }

    // Smooth mouse parallax → subtle camera tilt
    this.camRotY += (this.mouseX * 0.045 - this.camRotY) * 0.04;
    this.camRotX += (this.mouseY * 0.025 - this.camRotX) * 0.04;
    if (this.camera) {
      this.camera.rotation.y = this.camRotY;
      this.camera.rotation.x = this.camRotX;
    }

    if (this.composer) {
      this.composer.render();
    } else if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private stepWarp(dt: number): void {
    this.warpProgress = Math.min(1, this.warpProgress + dt / this.WARP_DURATION);
    const eased    = easeOutQuart(this.warpProgress);
    // Trail lags 8% of warp-progress behind the star front
    const trailLag = easeOutQuart(Math.max(0, this.warpProgress - 0.08));

    const starAttr  = this.stars!.geometry.attributes['position']  as THREE.BufferAttribute;
    const trailAttr = this.trails!.geometry.attributes['position'] as THREE.BufferAttribute;
    const starMat   = this.stars!.material  as THREE.PointsMaterial;
    const trailMat  = this.trails!.material as THREE.PointsMaterial;

    for (let i = 0; i < this.STAR_COUNT * 3; i++) {
      const f           = this.finalPositions[i];
      starAttr.array[i]  = f * (0.005 + eased    * 0.995);
      trailAttr.array[i] = f * (0.005 + trailLag * 0.995);
    }
    starAttr.needsUpdate  = true;
    trailAttr.needsUpdate = true;

    // Stars: fade in + shrink from blob (3.0) to crisp point (1.1)
    starMat.opacity = Math.min(1.0, eased * 1.4);
    starMat.size    = 3.0 - eased * 1.9;

    // Trail: arc envelope — ramps up to mid-warp then fades cleanly
    const peak       = 1 - Math.abs(this.warpProgress - 0.42) / 0.58;
    trailMat.opacity = Math.max(0, peak * 0.18);

    if (this.warpProgress >= 1) {
      this.isWarping   = false;
      trailMat.opacity = 0;
      starMat.size     = 1.1;
      starMat.opacity  = 0.92;
      // Prime comet timer so first comet appears ~1 second into drift
      this.cometTimer = this.cometInterval - 1;
    }
  }

  private stepDrift(dt: number): void {
    // Sun scale-in after warp
    if (this.sunScaleIn < 1) {
      this.sunScaleIn = Math.min(1, this.sunScaleIn + dt * 0.42);
      const s = easeOutQuart(this.sunScaleIn);
      this.sun?.scale.setScalar(s);
      this.sunCorona?.scale.setScalar(s);
      this.sunCorona2?.scale.setScalar(s);
      if (this.solarWind) this.solarWind.visible = this.sunScaleIn > 0.3;
    }

    // Billboard sun toward camera every frame — keeps it a perfect circle
    // regardless of how far off-axis SUN_POS is
    if (this.camera) {
      this.sun?.lookAt(this.camera.position);
      this.sunCorona?.lookAt(this.camera.position);
      this.sunCorona2?.lookAt(this.camera.position);
    }

    // Solar flare system
    this.flareTimer += dt;
    if (this.flareTimer >= this.flareInterval && this.flares.length < this.MAX_FLARES) {
      this.flareTimer    = 0;
      this.flareInterval = 1.8 + Math.random() * 2.4;
      this.spawnFlare();
    }
    this.updateFlares(dt);

    // Solar wind drift
    this.updateSolarWind(dt);

    // Comet system
    this.cometTimer += dt;
    if (this.cometTimer >= this.cometInterval && this.comets.length < this.MAX_COMETS) {
      this.cometTimer    = 0;
      this.cometInterval = 6 + Math.random() * 6;
      this.spawnComet();
    }
    this.updateComets(dt);

    // Very slow stellar drift
    if (this.stars) {
      this.stars.rotation.y += 0.000028;
      this.stars.rotation.x += 0.000009;
    }
  }

  // ─── Flare system ─────────────────────────────────────────────────────────
  private spawnFlare(): void {
    if (!this.scene) return;

    // Random point on upper-left hemisphere of sun (facing viewer)
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.random() * Math.PI * 0.7;   // bias toward viewer-facing hemisphere
    const erupt = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi),
    ).normalize();

    // Perpendicular axis for arc bow — cross with a random non-collinear vec
    const seed = Math.abs(erupt.y) < 0.9
      ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(1, 0, 0);
    const perp = new THREE.Vector3().crossVectors(erupt, seed).normalize();

    const arcLen = 22 + Math.random() * 30;
    const arcBow = 8  + Math.random() * 14;
    const dur    = 3.0 + Math.random() * 2.5;

    const flare = this.makeFlare(erupt, perp, arcLen, arcBow, dur);
    this.flares.push(flare);
    this.scene.add(flare.points);
  }

  private makeFlare(
    eruptAxis: THREE.Vector3,
    perpAxis:  THREE.Vector3,
    arcLen:    number,
    arcBow:    number,
    duration:  number,
  ): FlareData {
    const N   = this.FLARE_SEGS;
    const pos = new Float32Array(N * 3);
    const alp = new Float32Array(N);
    const sz  = new Float32Array(N);

    // Pre-bake particle positions along quadratic bezier arc
    const sunSurface = this.SUN_POS.clone().addScaledVector(eruptAxis, this.SUN_RADIUS);
    const p0 = sunSurface.clone();
    const p1 = sunSurface.clone()
      .addScaledVector(eruptAxis, arcLen * 0.6)
      .addScaledVector(perpAxis,  arcBow);
    const p2 = sunSurface.clone()
      .addScaledVector(eruptAxis, arcLen);

    for (let i = 0; i < N; i++) {
      const t  = i / (N - 1);
      const mt = 1 - t;
      // Quadratic bezier
      const bx = mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x;
      const by = mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y;
      const bz = mt * mt * p0.z + 2 * mt * t * p1.z + t * t * p2.z;
      pos[i * 3]     = bx;
      pos[i * 3 + 1] = by;
      pos[i * 3 + 2] = bz;
      alp[i] = 0;
      sz[i]  = i === 0 ? 5 : Math.max(1.5, 4.5 - t * 3.2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aAlpha',   new THREE.BufferAttribute(alp, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sz,  1));

    if (!this.flareMaterial) {
      this.flareMaterial = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(0xffd97a) } },  // gold-warm
        vertexShader: `
          attribute float aAlpha;
          attribute float aSize;
          varying   float vAlpha;
          void main() {
            vAlpha = aAlpha;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * (280.0 / max(1.0, -mv.z));
            gl_Position  = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform vec3  uColor;
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            float a = (1.0 - smoothstep(0.2, 0.5, d)) * vAlpha;
            if (a < 0.01) discard;
            gl_FragColor = vec4(uColor, a);
          }
        `,
        transparent: true,
        blending:    THREE.AdditiveBlending,
        depthWrite:  false,
      });
    }

    return {
      points: new THREE.Points(geo, this.flareMaterial),
      posAttr:   geo.attributes['position'] as THREE.BufferAttribute,
      alphaAttr: geo.attributes['aAlpha']   as THREE.BufferAttribute,
      sizeAttr:  geo.attributes['aSize']    as THREE.BufferAttribute,
      age: 0, duration, eruptAxis, perpAxis, arcLen, arcBow,
    };
  }

  private updateFlares(dt: number): void {
    for (let fi = this.flares.length - 1; fi >= 0; fi--) {
      const f = this.flares[fi];
      f.age += dt;
      const progress = f.age / f.duration;
      const envelope = Math.sin(Math.PI * Math.min(1, progress));  // 0→1→0

      const N   = this.FLARE_SEGS;
      const alp = f.alphaAttr.array as Float32Array;

      for (let i = 0; i < N; i++) {
        const t  = i / (N - 1);
        // Arc-shaped reveal: tip leads, base follows
        const reveal = Math.max(0, Math.min(1, progress * 2.2 - t));
        alp[i] = Math.sin(Math.PI * t) * envelope * reveal * 0.90;
      }
      f.alphaAttr.needsUpdate = true;

      if (f.age >= f.duration) {
        this.scene!.remove(f.points);
        f.points.geometry.dispose();
        this.flares.splice(fi, 1);
      }
    }
  }

  // ─── Solar wind ───────────────────────────────────────────────────────────
  private updateSolarWind(dt: number): void {
    if (!this.solarWind || !this.swPositions || !this.swSpeeds || !this.swDirs) return;

    const pos  = this.swPositions;
    const spd  = this.swSpeeds;
    const dirs = this.swDirs;
    const N    = this.SW_COUNT;
    const sx   = this.SUN_POS.x;
    const sy   = this.SUN_POS.y;
    const sz   = this.SUN_POS.z;
    const maxR = this.SUN_RADIUS + 70;

    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      pos[i3]     += dirs[i3]     * spd[i] * dt;
      pos[i3 + 1] += dirs[i3 + 1] * spd[i] * dt;
      pos[i3 + 2] += dirs[i3 + 2] * spd[i] * dt;

      const dx = pos[i3] - sx;
      const dy = pos[i3 + 1] - sy;
      const dz = pos[i3 + 2] - sz;
      if (dx*dx + dy*dy + dz*dz > maxR * maxR) {
        this.respawnWindParticle(i);
      }
    }

    const attr = this.solarWind.geometry.attributes['position'] as THREE.BufferAttribute;
    (attr.array as Float32Array).set(pos);
    attr.needsUpdate = true;
  }

  private respawnWindParticle(i: number): void {
    if (!this.swPositions || !this.swSpeeds || !this.swDirs) return;
    const i3  = i * 3;
    const sr  = this.SUN_RADIUS;
    const sx  = this.SUN_POS.x;
    const sy  = this.SUN_POS.y;
    const sz  = this.SUN_POS.z;

    // Random point on sun surface hemisphere toward camera (z > sunZ)
    let dx: number, dy: number, dz: number, len: number;
    do {
      dx = (Math.random() - 0.5) * 2;
      dy = (Math.random() - 0.5) * 2;
      dz = -(Math.random() * 0.7 + 0.3);   // bias toward camera
      len = Math.sqrt(dx*dx + dy*dy + dz*dz);
    } while (len < 1e-6);
    dx /= len;  dy /= len;  dz /= len;

    // Start just outside the surface
    const startR = sr + Math.random() * 5;
    this.swPositions[i3]     = sx + dx * startR;
    this.swPositions[i3 + 1] = sy + dy * startR;
    this.swPositions[i3 + 2] = sz + dz * startR;
    this.swDirs[i3]     = dx;
    this.swDirs[i3 + 1] = dy;
    this.swDirs[i3 + 2] = dz;
    this.swSpeeds[i]    = 3 + Math.random() * 6;
  }

  // ─── Sun builders ─────────────────────────────────────────────────────────
  private buildSun(): void {
    // Billboarded disc — PlaneGeometry + lookAt(camera) every frame = perfect circle at any viewport position
    const size = this.SUN_RADIUS * 2;
    const geo  = new THREE.PlaneGeometry(size, size);
    const mat  = new THREE.MeshBasicMaterial({ map: this.buildSunTexture(), transparent: true, depthWrite: false });
    this.sun   = new THREE.Mesh(geo, mat);
    this.sun.position.copy(this.SUN_POS);
    this.sun.scale.setScalar(0);
    this.scene!.add(this.sun);

    // Scene lighting — warm point from sun position
    const pt = new THREE.PointLight(0xffcc55, 1.2, 400);
    pt.position.copy(this.SUN_POS);
    this.scene!.add(pt);

    const ambient = new THREE.AmbientLight(0x04080f, 2.5);
    this.scene!.add(ambient);

    // Corona Fresnel glow — inner (tighter, brighter)
    this.buildCorona(this.SUN_RADIUS * 1.07, 0xffdd88, 2.4, 0.80);
    // Corona halo — outer (wide, softer, deep gold)
    this.buildCorona(this.SUN_RADIUS * 1.38, 0xc9802a, 1.6, 0.38);

    this.buildSolarWind();
  }

  private buildCorona(radius: number, color: number, _power: number, maxAlpha: number): void {
    // Billboarded glow ring — PlaneGeometry so lookAt keeps it circular
    const size = radius * 2;
    const geo  = new THREE.PlaneGeometry(size, size);
    const mat  = new THREE.MeshBasicMaterial({
      map:         this.buildCoronaGlowTexture(color, maxAlpha),
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.SUN_POS);
    mesh.scale.setScalar(0);
    this.scene!.add(mesh);

    if (!this.sunCorona) {
      this.sunCorona = mesh;
    } else {
      this.sunCorona2 = mesh;
    }
  }

  private buildCoronaGlowTexture(color: number, maxAlpha: number): THREE.CanvasTexture {
    const S   = 256;
    const c   = new THREE.Color(color);
    const cr  = Math.round(c.r * 255);
    const cg  = Math.round(c.g * 255);
    const cb  = Math.round(c.b * 255);
    const canvas = document.createElement('canvas');
    canvas.width = S;  canvas.height = S;
    const ctx    = canvas.getContext('2d')!;

    // Soft ring: transparent at center and rim, peak glow at ~50% radius
    const grad = ctx.createRadialGradient(S/2, S/2, S * 0.30, S/2, S/2, S/2);
    grad.addColorStop(0.00, `rgba(${cr},${cg},${cb},0)`);
    grad.addColorStop(0.40, `rgba(${cr},${cg},${cb},${maxAlpha})`);
    grad.addColorStop(1.00, `rgba(0,0,0,0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, S, S);

    return new THREE.CanvasTexture(canvas);
  }

  private buildSolarWind(): void {
    const N   = this.SW_COUNT;
    const pos = new Float32Array(N * 3);
    this.swPositions = pos;
    this.swSpeeds    = new Float32Array(N);
    this.swDirs      = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      this.respawnWindParticle(i);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));

    this.solarWind = new THREE.Points(geo, new THREE.PointsMaterial({
      size:        1.4,
      color:       0xffc84a,
      transparent: true,
      opacity:     0.28,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      sizeAttenuation: true,
    }));
    this.solarWind.visible = false;
    this.scene!.add(this.solarWind);
  }

  private buildSunTexture(): THREE.CanvasTexture {
    const S      = 512;
    const canvas = document.createElement('canvas');
    canvas.width = S;  canvas.height = S;
    const ctx    = canvas.getContext('2d')!;

    // Radial gradient: white-hot core → gold mid → deep amber rim
    const grad = ctx.createRadialGradient(S/2, S/2, 0, S/2, S/2, S/2);
    grad.addColorStop(0.00, '#fffdf0');   // white core
    grad.addColorStop(0.18, '#fff0a0');   // bright yellow
    grad.addColorStop(0.42, '#ffcc44');   // gold
    grad.addColorStop(0.70, '#e8851a');   // orange
    grad.addColorStop(0.88, '#c04808');   // deep amber
    grad.addColorStop(1.00, '#6a1a00');   // dark rim
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, S, S);

    // Surface granulation — tiny bright/dark speckles
    for (let i = 0; i < 4800; i++) {
      const x  = Math.random() * S;
      const y  = Math.random() * S;
      const r  = 1 + Math.random() * 2.5;
      // Only inside circle
      if ((x - S/2)**2 + (y - S/2)**2 > (S/2 - 2)**2) continue;
      const bright = Math.random() > 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = bright
        ? `rgba(255,240,160,${0.12 + Math.random() * 0.18})`
        : `rgba(100,30,0,${0.08 + Math.random() * 0.14})`;
      ctx.fill();
    }

    // Circular alpha mask — feathered 4px at rim for anti-aliased disc edge
    ctx.globalCompositeOperation = 'destination-in';
    const maskGrad = ctx.createRadialGradient(S/2, S/2, S/2 - 4, S/2, S/2, S/2);
    maskGrad.addColorStop(0, 'rgba(255,255,255,1)');
    maskGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = maskGrad;
    ctx.beginPath();
    ctx.arc(S/2, S/2, S/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    return new THREE.CanvasTexture(canvas);
  }

  // ─── Comet system ─────────────────────────────────────────────────────────
  private spawnComet(): void {
    if (!this.scene) return;

    // Randomise path: upper-right ↔ lower-left with slight z variation
    const z    = -60 - Math.random() * 40;   // z=-60 to -100, same depth band as planet
    const sign = Math.random() < 0.5 ? 1 : -1;
    // At z=-80, frustum half-width ≈ tan(30°)*80 ≈ 46. Spawn just outside.
    const startX =  sign * (50 + Math.random() * 15);
    const startY =  5   + Math.random() * 12;
    const endX   = -sign * (45 + Math.random() * 15);
    const endY   = -5   - Math.random() * 10;

    const dir      = new THREE.Vector3(endX - startX, endY - startY, 0).normalize();
    const speed    = 55 + Math.random() * 35;
    const travelMax = new THREE.Vector3(endX - startX, endY - startY, 0).length() + 30;

    const comet = this.makeComet(new THREE.Vector3(startX, startY, z), dir, speed, travelMax);
    this.comets.push(comet);
    this.scene.add(comet.points);
  }

  private makeComet(start: THREE.Vector3, dir: THREE.Vector3, speed: number, travelMax: number): CometData {
    const N   = this.TAIL_SEGS;
    const pos = new Float32Array(N * 3);
    const alp = new Float32Array(N);
    const sz  = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      pos[i * 3]     = start.x;
      pos[i * 3 + 1] = start.y;
      pos[i * 3 + 2] = start.z;
      alp[i] = 0;
      sz[i]  = 0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aAlpha',   new THREE.BufferAttribute(alp, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sz,  1).setUsage(THREE.DynamicDrawUsage));

    if (!this.cometMaterial) {
      this.cometMaterial = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(0xfff8e8) } },
        vertexShader: `
          attribute float aAlpha;
          attribute float aSize;
          varying   float vAlpha;
          void main() {
            vAlpha = aAlpha;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * (300.0 / max(1.0, -mv.z));
            gl_Position  = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform vec3  uColor;
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            float a = (1.0 - smoothstep(0.25, 0.5, d)) * vAlpha;
            if (a < 0.01) discard;
            gl_FragColor = vec4(uColor, a);
          }
        `,
        transparent: true,
        blending:    THREE.AdditiveBlending,
        depthWrite:  false,
      });
    }

    return {
      points:    new THREE.Points(geo, this.cometMaterial),
      posAttr:   geo.attributes['position'] as THREE.BufferAttribute,
      alphaAttr: geo.attributes['aAlpha']   as THREE.BufferAttribute,
      sizeAttr:  geo.attributes['aSize']    as THREE.BufferAttribute,
      head:      start.clone(),
      dir,
      speed,
      traveled:  0,
      travelMax,
    };
  }

  private updateComets(dt: number): void {
    const segSpacing = 1.8;   // world-units between tail segments

    for (let ci = this.comets.length - 1; ci >= 0; ci--) {
      const c = this.comets[ci];
      c.traveled += c.speed * dt;
      c.head.addScaledVector(c.dir, c.speed * dt);

      const N   = this.TAIL_SEGS;
      const pos = c.posAttr.array as Float32Array;
      const alp = c.alphaAttr.array as Float32Array;
      const sz  = c.sizeAttr.array as Float32Array;

      for (let i = 0; i < N; i++) {
        const offset   = i * segSpacing;
        pos[i * 3]     = c.head.x - c.dir.x * offset;
        pos[i * 3 + 1] = c.head.y - c.dir.y * offset;
        pos[i * 3 + 2] = c.head.z;

        const t  = i / (N - 1);
        alp[i]   = Math.max(0, (1 - t) * (1 - t));
        sz[i]    = i === 0 ? 14 : Math.max(1.5, 9 * (1 - t) * (1 - t));
      }

      c.posAttr.needsUpdate   = true;
      c.alphaAttr.needsUpdate = true;
      c.sizeAttr.needsUpdate  = true;

      if (c.traveled >= c.travelMax) {
        this.scene!.remove(c.points);
        c.points.geometry.dispose();
        this.comets.splice(ci, 1);
      }
    }
  }

  // ─── Event handlers ────────────────────────────────────────────────────────
  private readonly onMouseMove = (e: MouseEvent): void => {
    this.mouseX =  (e.clientX / window.innerWidth)  - 0.5;
    this.mouseY = -((e.clientY / window.innerHeight) - 0.5);
  };
}
