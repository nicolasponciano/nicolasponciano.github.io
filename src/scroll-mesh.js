const layer = document.querySelector(".scroll-mesh");
const motion = matchMedia("(prefers-reduced-motion: reduce)");

function createMesh(THREE) {
  const vertices = [];
  const shades = [];
  const columns = 180;
  const rows = 48;
  // Put the coarser lattice first so small screens can draw it without rebuilding geometry.
  let mobileCount = 0;
  for (const coarse of [true, false]) {
    for (let row = 0; row <= rows; row++) {
      const depth = row / rows;
      const z = (depth - .5) * 2.15;
      for (let column = 0; column <= columns; column++) {
        if ((row % 2 === 0 && column % 2 === 0) !== coarse) continue;
        const x = (column / columns - .5) * (8.7 + depth * 1.8);
        const ridge = z - .36 * Math.sin(1.35 * x) + .12 * x;
        const shoulder = Math.exp(-2.8 * ridge * ridge);
        const crest = shoulder * (.43 + .23 * Math.sin(2.15 * x - .7))
          + .19 * Math.sin(1.6 * x + 2.7 * z) - .24;
        vertices.push(x, crest, z);
        const shade = .56 + .26 * depth + .18 * shoulder;
        shades.push(shade, shade, shade);
      }
    }
    if (coarse) mobileCount = vertices.length / 3;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(shades, 3));
  const material = new THREE.PointsMaterial({
    color: 0x45ae9f, size: 1.6, sizeAttenuation: false, vertexColors: true,
    transparent: true, opacity: .76, depthWrite: false
  });
  const turn = { value: 0 };
  material.onBeforeCompile = shader => {
    shader.uniforms.scrollTurn = turn;
    shader.vertexShader = "uniform float scrollTurn;\n" + shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
       float offset = position.x * 0.8;
       float angle = scrollTurn + 0.38 * (sin(offset - scrollTurn) - sin(offset));
       float c = cos(angle), s = sin(angle);
       transformed.yz = mat2(c, s, -s, c) * transformed.yz;`
    ).replace("gl_PointSize = size;", "gl_PointSize = size * clamp(1.1 + transformed.z * .34, .78, 1.52);");
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <alphamap_fragment>",
      `#include <alphamap_fragment>
       float radius = length(gl_PointCoord - 0.5);
       diffuseColor.a *= 1.0 - smoothstep(0.29, 0.5, radius);`
    );
  };
  const mesh = new THREE.Points(geometry, material);
  mesh.rotation.x = .15;
  mesh.userData.turn = turn;
  mesh.userData.mobileCount = mobileCount;
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
  const progress = Math.min(range, Math.max(0, scrollY)) / Math.max(1, innerHeight);
  const elapsed = previousTime === undefined ? 16 : Math.min(time - previousTime, 64);
  displayedProgress ??= progress;
  displayedProgress += (progress - displayedProgress) * (1 - Math.exp(-elapsed / 85));
  const settling = Math.abs(progress - displayedProgress) > .0001;
  if (!settling) displayedProgress = progress;
  // One full turn every six viewport heights keeps the gesture consistent across pages.
  mesh.userData.turn.value = displayedProgress * Math.PI / 3;
  previousTime = settling ? time : undefined;
  const ratio = Math.min(devicePixelRatio, 1.5);
  const compact = layer.clientWidth < 700;
  mesh.geometry.setDrawRange(0, compact ? mesh.userData.mobileCount : Infinity);
  mesh.material.size = (compact ? 1.8 : 2.1) * ratio;
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
