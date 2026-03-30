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

  // Mouse / camera
  private mouseX = 0;
  private mouseY = 0;
  private camRotX = 0;
  private camRotY = 0;

  // ─── Lifecycle ─────────────────────────────────────────────────────────────
  init(options: ParticleSceneOptions): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const { canvas } = options;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;

    this.buildScene();
    this.buildCamera(w, h);
    this.buildRenderer(canvas, w, h);
    this.buildBloom(w, h);
    this.buildStars();
    this.buildTrails();

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

    this.scene?.traverse((obj) => {
      if (obj instanceof THREE.Points) {
        obj.geometry?.dispose();
        (obj.material as THREE.Material)?.dispose();
      }
    });

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
    // subtle bloom — just enough to make bright stars glint
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.55, 0.25, 0.88);
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
      this.stepDrift();
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
    }
  }

  private stepDrift(): void {
    // Very slow stellar drift — mimics the idle camera sway of SpaceX ISS sim
    if (this.stars) {
      this.stars.rotation.y += 0.000028;
      this.stars.rotation.x += 0.000009;
    }
  }

  // ─── Event handlers ────────────────────────────────────────────────────────
  private readonly onMouseMove = (e: MouseEvent): void => {
    this.mouseX =  (e.clientX / window.innerWidth)  - 0.5;
    this.mouseY = -((e.clientY / window.innerHeight) - 0.5);
  };
}
