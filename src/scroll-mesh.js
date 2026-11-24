const layer = document.querySelector(".scroll-mesh");
const motion = matchMedia("(prefers-reduced-motion: reduce)");

function createMesh(THREE) {
  const vertices = [];
  const columns = 120;
  const rows = 16;
  function point(column, row) {
    const t = column / columns;
    const offset = (row / rows - .5) * 1.15;
    const twist = t * Math.PI * 2.4 - .7;
    return [
      (t - .5) * 8.2,
      .43 * Math.sin(t * Math.PI * 2.7) + offset * Math.cos(twist),
      .34 * Math.cos(t * Math.PI * 2) + offset * Math.sin(twist)
    ];
  }
  for (let column = 0; column <= columns; column++) {
    for (let row = 0; row <= rows; row++) {
      const position = point(column, row);
      if (column < columns) vertices.push(...position, ...point(column + 1, row));
      if (row < rows && column % 3 === 0) vertices.push(...position, ...point(column, row + 1));
    }
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
  mesh.rotation.x = .22 + progress * Math.PI * 2;
  const ratio = Math.min(devicePixelRatio, 1.5);
  const width = Math.max(1, Math.round(layer.clientWidth * ratio));
  const height = Math.max(1, Math.round(layer.clientHeight * ratio));
  if (renderer.domElement.width !== width || renderer.domElement.height !== height) {
    renderer.setSize(width, height, false);
  }
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
    const camera = new THREE.OrthographicCamera(-4, 4, 1.2, -1.2, .1, 20);
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
