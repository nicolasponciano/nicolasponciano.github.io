const layer = document.querySelector(".scroll-mesh");
const motion = matchMedia("(prefers-reduced-motion: reduce)");

function createMesh(THREE) {
  const vertices = [];
  const columns = 120;
  const rows = 28;
  const ridges = [
    // Center, depth, width, slope length and summit height.
    [-2.8, -.45, 1.35, .62, .84],
    [-1.6, -.73, .76, .5, .63],
    [.48, .27, 1.05, .53, .7],
    [2.75, -.51, 1.3, .72, 1.03]
  ];
  function point(column, row) {
    const x = (column / columns - .5) * 8.4;
    const z = (row / rows - .5) * 2.4;
    const warpedDepth = z + .19 * Math.sin(2.2 * x) + .12 * Math.sin(3.1 * z + x);
    let elevation = -.44 + .055 * Math.sin(4 * x + 3 * z);
    for (const [cx, cz, width, length, height] of ridges) {
      const dx = (x - cx) / width;
      const dz = (warpedDepth - cz) / length;
      elevation += height * Math.exp(-dx * dx - dz * dz);
    }
    return [x, elevation, z];
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
  mesh.rotation.x = .28 + progress * .36;
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
