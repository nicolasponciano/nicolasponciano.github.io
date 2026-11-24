const layer = document.querySelector(".scroll-mesh");
const motion = matchMedia("(prefers-reduced-motion: reduce)");

function createMesh(THREE) {
  // A half twist joins the two ends into one continuous Möbius surface.
  function point(angle, width) {
    const radius = 1.1 + width * Math.cos(angle / 2);
    return new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle), width * Math.sin(angle / 2));
  }
  const vertices = [];
  function segment(a, b) {
    vertices.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }
  for (let ring = 0; ring < 96; ring++) {
    const angle = ring * Math.PI / 48;
    for (let strand = 0; strand <= 12; strand++) {
      const width = (strand - 6) * .083;
      segment(point(angle, width), point(angle + Math.PI / 48, width));
    }
    if (ring % 2 === 0) segment(point(angle, -.498), point(angle, .498));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
    color: 0x45ae9f, transparent: true, opacity: .76
  }));
}

let view;
let pending;
let frame;

function draw() {
  frame = 0;
  if (!view || motion.matches || document.hidden) return;
  const { renderer, scene, camera, mesh } = view;
  const range = document.documentElement.scrollHeight - innerHeight;
  const progress = range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0;
  mesh.rotation.set(.78 + .55 * Math.sin(progress * Math.PI), -.32 + progress * Math.PI * 2, -.42 + .65 * progress);
  const size = Math.max(1, Math.round(layer.clientWidth * Math.min(devicePixelRatio, 1.5)));
  if (renderer.domElement.width !== size) renderer.setSize(size, size, false);
  renderer.render(scene, camera);
}

function schedule() {
  if (view && !frame && !motion.matches && !document.hidden) frame = requestAnimationFrame(draw);
}

async function sync() {
  if (motion.matches) {
    view?.renderer.domElement.remove();
    return;
  }
  if (!pending) pending = import("./three.module.min.js").then(THREE => {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const scene = new THREE.Scene();
    const mesh = createMesh(THREE);
    scene.add(mesh);
    const camera = new THREE.OrthographicCamera(-1.8, 1.8, 1.8, -1.8, .1, 20);
    camera.position.z = 6;
    renderer.domElement.addEventListener("webglcontextlost", () => renderer.domElement.remove());
    renderer.domElement.addEventListener("webglcontextrestored", sync);
    return { renderer, scene, camera, mesh };
  });
  try {
    view = await pending;
    if (motion.matches || view.renderer.getContext().isContextLost()) return;
    layer.append(view.renderer.domElement);
    schedule();
  } catch {
    // The image provides the same silhouette when WebGL is unavailable.
  }
}

addEventListener("scroll", schedule, { passive: true });
addEventListener("resize", schedule);
new ResizeObserver(schedule).observe(document.body);
document.addEventListener("visibilitychange", schedule);
motion.addEventListener("change", sync);
sync();
