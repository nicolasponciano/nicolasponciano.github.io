const layer = document.querySelector(".scroll-mesh");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const compactLayout = matchMedia("(max-width: 700px)");
const baseOpacity = .76;
const fieldWidth = 9.2 * .92;
const fieldDepth = 2.3;
const cameraHalfWidth = 4;

function createMesh(THREE) {
  const vertices = [];
  const shades = [];
  const mobilePoints = [];
  const columns = 170;
  const rows = 44;
  for (let row = 0; row <= rows; row++) {
    const depth = row / rows;
    const z = (depth - .5) * fieldDepth;
    // Wider spacing toward the viewer gives the point field a low horizon.
    const spread = .92 + .37 * depth;
    for (let column = 0; column <= columns; column++) {
      const x = (column / columns - .5) * fieldWidth * spread / .92;
      const crest = .39 * Math.sin(1.55 * x + 1.9 * z)
        + .13 * Math.sin(2.8 * x - 2.5 * z)
        + .045 * Math.cos(4.2 * x + 3 * z);
      if (row % 2 === 0 && column % 2 === 0) mobilePoints.push(vertices.length / 3);
      vertices.push(x, crest - .12, z);
      const shade = .75 + .25 * depth;
      shades.push(shade, shade, shade);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(shades, 3));
  const material = new THREE.PointsMaterial({
    color: 0x45ae9f, size: 1.6, sizeAttenuation: false, vertexColors: true,
    transparent: true, opacity: baseOpacity, depthWrite: false
  });
  const mesh = new THREE.Points(geometry, material);
  mesh.rotation.x = .15;
  mesh.userData.mobileIndex = new THREE.Uint16BufferAttribute(mobilePoints, 1);
  return mesh;
}

let view;
let pending;
let frame;

let displayedProgress;
let previousTime;

function draw(time) {
  frame = 0;
  if (!view || motion.matches || document.hidden) return;
  const { renderer, scene, camera, mesh } = view;
  const range = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const progress = range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0;
  const elapsed = previousTime === undefined ? 16 : Math.min(time - previousTime, 64);
  displayedProgress ??= progress;
  displayedProgress += (progress - displayedProgress) * (1 - Math.exp(-elapsed / 115));
  const settling = Math.abs(progress - displayedProgress) > .0001;
  if (!settling) displayedProgress = progress;
  const angle = displayedProgress * 2 * Math.PI;
  const facing = Math.abs(Math.cos(angle));
  mesh.rotation.y = angle;
  // Frame the projection of the field's inscribed rectangle, even edge-on.
  const projectedHalfWidth = (fieldWidth * facing + fieldDepth * Math.abs(Math.sin(angle))) / 2;
  camera.right = Math.min(cameraHalfWidth, projectedHalfWidth * .98);
  camera.left = -camera.right;
  camera.updateProjectionMatrix();
  mesh.material.opacity = baseOpacity * (.38 + .62 * facing);
  previousTime = settling ? time : undefined;
  const ratio = Math.min(devicePixelRatio, 1.5);
  const compact = compactLayout.matches;
  const pointIndex = compact ? mesh.userData.mobileIndex : null;
  if (mesh.geometry.index !== pointIndex) mesh.geometry.setIndex(pointIndex);
  mesh.material.size = (compact ? 1.4 : 1.6) * ratio;
  const width = Math.max(1, Math.round(layer.clientWidth * ratio));
  const height = Math.max(1, Math.round(layer.clientHeight * ratio));
  if (renderer.domElement.width !== width || renderer.domElement.height !== height) {
    renderer.setSize(width, height, false);
  }
  renderer.render(scene, camera);
  if (settling) schedule();
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
    const camera = new THREE.OrthographicCamera(-cameraHalfWidth, cameraHalfWidth, 1.2, -1.2, .1, 20);
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
