/* MTS Portfolio — Three.js showpiece (isolated module).
   Imported dynamically ONLY after the visitor presses "Load the 3D showpiece".
   Renders the MTS diamond mark as a real-time 3D object: a lime wireframe
   octahedron shell around a dark faceted core, ringed by a thin torus —
   black / white / lime only. Drag to rotate; gentle auto-rotation otherwise.
   Pauses when off-screen. Exposes window.__threeShowpiece for verification. */
import * as THREE from '../assets/vendor/three.module.min.js';

export function initShowpiece(canvas) {
  if (!canvas) return Promise.reject(new Error('no canvas'));
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.4, 7.2);
  camera.lookAt(0, 0, 0);

  var group = new THREE.Group();
  scene.add(group);

  /* Diamond core — dark facets, lime edge lines */
  var core = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.45, 0),
    new THREE.MeshStandardMaterial({ color: 0x121214, metalness: 0.35, roughness: 0.4, flatShading: true })
  );
  group.add(core);
  var edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.OctahedronGeometry(1.46, 0)),
    new THREE.LineBasicMaterial({ color: 0xa4d65e })
  );
  group.add(edges);

  /* Outer wireframe shell */
  var shell = new THREE.Mesh(
    new THREE.OctahedronGeometry(2.05, 0),
    new THREE.MeshBasicMaterial({ color: 0xa4d65e, wireframe: true, transparent: true, opacity: 0.28 })
  );
  group.add(shell);

  /* Orbit ring */
  var ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.7, 0.035, 12, 96),
    new THREE.MeshStandardMaterial({ color: 0xf4f4ef, metalness: 0.6, roughness: 0.3 })
  );
  ring.rotation.x = Math.PI / 2.4;
  group.add(ring);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  var key = new THREE.DirectionalLight(0xa4d65e, 2.2);
  key.position.set(3, 4, 5);
  scene.add(key);
  var fill = new THREE.DirectionalLight(0xffffff, 0.9);
  fill.position.set(-4, -1, 3);
  scene.add(fill);

  group.rotation.x = 0.35;

  function resize() {
    var w = canvas.clientWidth || canvas.parentElement.clientWidth;
    var h = canvas.clientHeight || 420;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* Drag interaction */
  var dragging = false, px = 0, py = 0, vx = 0.0035, vy = 0.0012;
  canvas.style.touchAction = 'none';
  canvas.style.cursor = 'grab';
  canvas.addEventListener('pointerdown', function (e) { dragging = true; px = e.clientX; py = e.clientY; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; });
  canvas.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    vy = (e.clientX - px) * 0.00045; vx = (e.clientY - py) * 0.00045;
    group.rotation.y += (e.clientX - px) * 0.008;
    group.rotation.x += (e.clientY - py) * 0.008;
    px = e.clientX; py = e.clientY;
  });
  function endDrag() { dragging = false; canvas.style.cursor = 'grab'; }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  var visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.05 }).observe(canvas);
  }

  var state = { frames: 0, ready: true, revision: THREE.REVISION };
  window.__threeShowpiece = state;

  renderer.setAnimationLoop(function () {
    if (!visible) return;
    if (!dragging) { group.rotation.y += vy + 0.0035; group.rotation.x += vx * 0.4; vx *= 0.98; }
    ring.rotation.z += 0.0022;
    shell.rotation.y -= 0.0012;
    renderer.render(scene, camera);
    state.frames++;
  });

  return Promise.resolve(state);
}
