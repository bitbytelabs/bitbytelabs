const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const yearTarget = document.querySelector("[data-year]");
const publishButton = document.querySelector("#publish-world");
const publishNote = document.querySelector("[data-publish-note]");
const envSelect = document.querySelector("[data-env-select]");
const gravitySlider = document.querySelector("[data-gravity-slider]");
const gravityLabel = document.querySelector("[data-gravity-label]");
const slotsInput = document.querySelector("[data-slots-input]");
const assetPackSelect = document.querySelector("[data-asset-pack]");
const placeBlockButton = document.querySelector("#place-block");
const blockNote = document.querySelector("[data-block-note]");
const studioCanvas = document.querySelector("#studio-canvas");

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (gravitySlider && gravityLabel) {
  gravitySlider.addEventListener("input", () => {
    gravityLabel.textContent = `${gravitySlider.value}%`;
  });
}

if (publishButton && publishNote && envSelect && slotsInput && assetPackSelect) {
  publishButton.addEventListener("click", () => {
    publishNote.textContent = `Published ${envSelect.value} with ${slotsInput.value} slots using ${assetPackSelect.value}.`;
  });
}

let scene;
let camera;
let renderer;

const initStudioScene = () => {
  if (!studioCanvas || !window.THREE) return;
  const { THREE } = window;
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#0a0f1d");

  const width = studioCanvas.clientWidth;
  const height = studioCanvas.clientHeight;
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(6, 6, 10);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  studioCanvas.innerHTML = "";
  studioCanvas.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(6, 12, 4);
  scene.add(directional);

  const grid = new THREE.GridHelper(20, 20, 0x00d1ff, 0x1f2b44);
  scene.add(grid);

  const baseGeo = new THREE.BoxGeometry(10, 0.4, 10);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x141925 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -0.2;
  scene.add(base);

  renderer.render(scene, camera);

  window.addEventListener("resize", () => {
    const newWidth = studioCanvas.clientWidth;
    const newHeight = studioCanvas.clientHeight;
    renderer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  });
};

if (placeBlockButton) {
  placeBlockButton.addEventListener("click", () => {
    if (!scene || !window.THREE) return;
    const { THREE } = window;
    const blockGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const blockMat = new THREE.MeshStandardMaterial({ color: 0xffd166 });
    const block = new THREE.Mesh(blockGeo, blockMat);
    block.position.set(Math.random() * 4 - 2, 0.8, Math.random() * 4 - 2);
    scene.add(block);
    renderer.render(scene, camera);
    if (blockNote) {
      blockNote.textContent = "Block placed in the Studio scene.";
    }
  });
}

initStudioScene();
