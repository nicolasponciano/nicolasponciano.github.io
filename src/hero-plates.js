const layer = document.querySelector(".hero-plates");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let visible = false;
let loading = false;
let sceneView;

function createView(THREE) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, .1, 20);
  camera.position.z = 6;
  const plates = new THREE.Group();
  plates.rotation.set(-.28, .65, -.25, "ZXY");
  scene.add(plates);
  const geometry = new THREE.PlaneGeometry(2.5, 1.6);
  const outline = new THREE.EdgesGeometry(geometry);
  const face = new THREE.MeshBasicMaterial({
    color: 0x55d6be, side: THREE.DoubleSide, transparent: true, opacity: .09, depthWrite: false
  });
  const edge = new THREE.LineBasicMaterial({ color: 0x55d6be, transparent: true, opacity: .78 });
  for (const depth of [-.48, 0, .48]) {
    const plate = new THREE.Mesh(geometry, face);
    plate.position.z = depth;
    plate.add(new THREE.LineSegments(outline, edge));
    plates.add(plate);
  }
  let previous;
  const canvas = renderer.domElement;
  const resize = new ResizeObserver(() => {
    const size = Math.max(1, Math.round(layer.clientWidth * Math.min(devicePixelRatio, 1.5)));
    renderer.setSize(size, size, false);
  });
  resize.observe(layer);
  canvas.addEventListener("webglcontextlost", () => {
    renderer.setAnimationLoop(null);
    resize.disconnect();
    canvas.remove();
    sceneView = { update() {} };
  });
  return {
    update(active) {
      previous = undefined;
      if (active) {
        layer.append(canvas);
        renderer.setAnimationLoop(time => {
          if (previous !== undefined) plates.rotation.y += (time - previous) * Math.PI / 20000;
          previous = time;
          renderer.render(scene, camera);
        });
      } else {
        renderer.setAnimationLoop(null);
        canvas.remove();
      }
    }
  };
}

async function sync() {
  const active = visible && !document.hidden && !reducedMotion.matches;
  if (sceneView) return sceneView.update(active);
  if (!active || loading) return;
  loading = true;
  try {
    sceneView = createView(await import("./three.module.min.js"));
    sync();
  } catch {
    // The transparent PNG is already visible if WebGL is unavailable.
  }
}

new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  sync();
}).observe(layer.closest(".hero"));
document.addEventListener("visibilitychange", sync);
reducedMotion.addEventListener("change", sync);
