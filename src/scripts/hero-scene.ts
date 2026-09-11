import * as THREE from 'three';

// One point cloud: no models, textures, lights or post-processing passes.
export function mountHeroScene(host: HTMLElement) {
  const hero = host.closest<HTMLElement>('.hero')!;
  const surface = host.querySelector<HTMLElement>('.hero-art-inner')!;
  const pause = hero.querySelector<HTMLButtonElement>('[data-pause-motion]')!;
  const status = hero.querySelector<HTMLElement>('[data-scene-status]')!;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  surface.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-6, 6, 4, -4, 0.1, 30);
  camera.position.z = 10;
  const count = window.matchMedia('(max-width: 760px)').matches ? 9000 : 24000;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  // A deterministic distribution keeps the shape stable on every visit.
  let randomState = 71;
  const random = () => ((randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < count; i++) {
    const u = random() * Math.PI * 2;
    const v = random() * Math.PI * 2;
    const width = 0.4 + 0.14 * Math.sin(u * 3);
    const radius = 2.25 + width * Math.cos(v);
    positions.set([
      radius * Math.cos(u),
      radius * Math.sin(u) * 0.8,
      width * Math.sin(v) + 0.6 * Math.sin(u * 2),
    ], i * 3);
    seeds[i] = random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));
  const uniforms = {
    time: { value: 0 },
    pointer: { value: new THREE.Vector2(3, 3) },
    influence: { value: 0 },
    aspect: { value: 1 },
    pixelRatio: { value: renderer.getPixelRatio() },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float seed;
      uniform float time, influence, aspect, pixelRatio;
      uniform vec2 pointer;
      varying float brightness, tint;
      void main() {
        vec3 p = position;
        float angle = atan(p.y, p.x);
        p *= 1.0 + 0.055 * sin(angle * 3.0 + time * 0.45);
        p.z += 0.19 * sin(angle * 5.0 - time * 0.55 + seed * 2.0);
        vec4 view = modelViewMatrix * vec4(p, 1.0);
        vec4 projected = projectionMatrix * view;
        vec2 offset = (projected.xy / projected.w - pointer) * vec2(aspect, 1.0);
        float disturbance = exp(-dot(offset, offset) * 7.0) * influence;
        view.xy += normalize(offset + vec2(0.001)) * disturbance * 0.36;
        view.z += disturbance * sin(seed * 24.0 + time * 2.0) * 0.32;
        gl_Position = projectionMatrix * view;
        gl_PointSize = (0.95 + seed * 1.5) * pixelRatio;
        brightness = (0.22 + seed * 0.55) * smoothstep(-13.0, -7.0, view.z);
        tint = smoothstep(-1.5, 1.5, p.z);
      }
    `,
    fragmentShader: `
      varying float brightness, tint;
      void main() {
        float distanceToCenter = length(gl_PointCoord - 0.5);
        if (distanceToCenter > 0.5) discard;
        float edge = 1.0 - smoothstep(0.1, 0.5, distanceToCenter);
        vec3 color = mix(vec3(0.29, 0.52, 0.88), vec3(0.83, 0.92, 1.0), tint);
        gl_FragColor = vec4(color, edge * brightness);
      }
    `,
  });
  const formation = new THREE.Points(geometry, material);
  formation.rotation.set(0.4, -0.35, -0.4);
  formation.frustumCulled = false; // Shader displacement extends beyond the base bounds.
  scene.add(formation);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointerTarget = new THREE.Vector2(3, 3);
  let pointerActive = false;
  let paused = false;
  let visible = true;
  let disposed = false;
  let failed = false;
  let frameId = 0;
  let previousTime = 0;
  const events = new AbortController();
  const options = { signal: events.signal };

  function requestDraw() {
    if (!frameId && visible && !document.hidden && !failed && !disposed) frameId = requestAnimationFrame(draw);
  }
  function stop() {
    cancelAnimationFrame(frameId);
    frameId = 0;
    previousTime = 0;
  }
  function unavailable() {
    failed = true;
    stop();
    host.dataset.sceneState = 'unavailable';
    pause.hidden = true;
    status.textContent = '';
  }
  renderer.debug.onShaderError = () => unavailable();
  function draw(time: number) {
    frameId = 0;
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 1 / 60;
    previousTime = time;
    const moving = !paused && !reducedMotion.matches;
    if (moving) {
      uniforms.time.value += delta;
      const damping = 1 - Math.exp(-5 * delta);
      uniforms.pointer.value.lerp(pointerTarget, damping);
      uniforms.influence.value += ((pointerActive ? 1 : 0) - uniforms.influence.value) * damping;
      formation.rotation.y = -0.35 + Math.sin(uniforms.time.value * 0.13) * 0.22;
      formation.rotation.z = -0.4 + Math.sin(uniforms.time.value * 0.09) * 0.1;
    }
    try { renderer.render(scene, camera); } catch { unavailable(); }
    if (failed) return;
    host.dataset.sceneState = 'ready';
    pause.hidden = false;
    if (moving) requestDraw();
  }
  function updateMotion() {
    pause.disabled = reducedMotion.matches;
    pause.textContent = reducedMotion.matches ? 'Motion reduced' : paused ? 'Resume motion' : 'Pause motion';
    pause.setAttribute('aria-pressed', String(paused || reducedMotion.matches));
    status.textContent = reducedMotion.matches ? '' : 'Move to explore';
    if (reducedMotion.matches) uniforms.influence.value = 0;
    stop();
    requestDraw();
  }
  hero.addEventListener('pointermove', event => {
    if (paused || reducedMotion.matches) return;
    const bounds = hero.getBoundingClientRect();
    pointerTarget.set((event.clientX - bounds.left) / bounds.width * 2 - 1, 1 - (event.clientY - bounds.top) / bounds.height * 2);
    pointerActive = true;
  }, { ...options, passive: true });
  for (const event of ['pointerleave', 'pointercancel', 'pointerup']) {
    hero.addEventListener(event, () => { pointerActive = false; }, options);
  }
  canvas.addEventListener('webglcontextlost', unavailable, options);
  pause.addEventListener('click', () => { paused = !paused; updateMotion(); }, options);
  reducedMotion.addEventListener('change', updateMotion, options);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else requestDraw(); }, options);
  const resize = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    if (!width || !height) return;
    const aspect = width / height;
    const halfWidth = Math.max(3.5, aspect * 3.7);
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfWidth / aspect;
    camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
    formation.position.set(halfWidth * (width <= 760 ? 0.42 : 0.45), width <= 760 ? -0.7 : 0.15, 0);
    uniforms.aspect.value = aspect;
    renderer.setSize(width, height, false);
    requestDraw();
  });
  resize.observe(surface);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestDraw(); else stop();
  });
  intersection.observe(hero);
  updateMotion();
  window.addEventListener('pagehide', event => {
    stop();
    if (event.persisted) return;
    disposed = true;
    events.abort();
    resize.disconnect();
    intersection.disconnect();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  }, options);
  window.addEventListener('pageshow', requestDraw, options);
}
