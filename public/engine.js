const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const yearTarget = document.querySelector("[data-year]");
const playerNameLabel = document.querySelector("[data-player-name]");
const worldNameLabel = document.querySelector("[data-world-name]");
const fpsLabel = document.querySelector("[data-fps]");
const engineNote = document.querySelector("[data-engine-note]");
const resetEngineButton = document.querySelector("#reset-engine");
const serverStatus = document.querySelector("[data-server-status]");
const reconnectButton = document.querySelector("#reconnect");

const PLAYER_KEY = "roblox-universe-player";
const PLAYER_ID_KEY = "roblox-universe-player-id";
const engineContainer = document.querySelector("#engine-canvas");

const getPlayerId = () => {
  const stored = localStorage.getItem(PLAYER_ID_KEY);
  if (stored) return stored;
  const id = `player-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(PLAYER_ID_KEY, id);
  return id;
};

const playerId = getPlayerId();
let playerProfile = { name: "Guest" };

const loadProfile = () => {
  const stored = localStorage.getItem(PLAYER_KEY);
  if (stored) {
    playerProfile = JSON.parse(stored);
  }
  if (playerNameLabel) {
    playerNameLabel.textContent = playerProfile.name || "Guest";
  }
};

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

loadProfile();

let scene;
let camera;
let renderer;
let controls;
let playerMesh;
let clock;
let frameCount = 0;
let lastFpsTime = 0;
let eventSource;
let lastStateSent = 0;

const initEngine = () => {
  if (!engineContainer || !window.THREE) return;
  const { THREE } = window;
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#0a0f1d");

  const width = engineContainer.clientWidth;
  const height = engineContainer.clientHeight;
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(6, 6, 10);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  engineContainer.innerHTML = "";
  engineContainer.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(6, 12, 4);
  scene.add(directional);

  const grid = new THREE.GridHelper(40, 40, 0x00d1ff, 0x1f2b44);
  scene.add(grid);

  const groundGeo = new THREE.BoxGeometry(40, 0.4, 40);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x141925 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.2;
  scene.add(ground);

  const playerGeo = new THREE.BoxGeometry(1, 1.8, 1);
  const playerMat = new THREE.MeshStandardMaterial({ color: 0xff2d2d });
  playerMesh = new THREE.Mesh(playerGeo, playerMat);
  playerMesh.position.set(0, 1, 0);
  scene.add(playerMesh);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.copy(playerMesh.position);
  controls.enableDamping = true;

  clock = new THREE.Clock();

  window.addEventListener("resize", () => {
    const newWidth = engineContainer.clientWidth;
    const newHeight = engineContainer.clientHeight;
    renderer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
  });

  renderer.domElement.addEventListener("click", () => {
    const beaconGeo = new THREE.CylinderGeometry(0.2, 0.6, 1.6, 8);
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0x00d1ff });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(playerMesh.position.x, 0.8, playerMesh.position.z);
    scene.add(beacon);
    if (engineNote) {
      engineNote.textContent = "Beacon dropped in the world.";
    }
  });

  animate();
};

const movement = {
  forward: false,
  back: false,
  left: false,
  right: false,
  sprint: false,
};

const handleKey = (event, isDown) => {
  switch (event.key.toLowerCase()) {
    case "w":
    case "arrowup":
      movement.forward = isDown;
      break;
    case "s":
    case "arrowdown":
      movement.back = isDown;
      break;
    case "a":
    case "arrowleft":
      movement.left = isDown;
      break;
    case "d":
    case "arrowright":
      movement.right = isDown;
      break;
    case "shift":
      movement.sprint = isDown;
      break;
    default:
      break;
  }
};

window.addEventListener("keydown", (event) => handleKey(event, true));
window.addEventListener("keyup", (event) => handleKey(event, false));

const animate = () => {
  if (!renderer || !scene || !camera || !playerMesh) return;
  const delta = clock.getDelta();
  const speed = movement.sprint ? 6 : 3.5;
  const direction = new window.THREE.Vector3();

  if (movement.forward) direction.z -= 1;
  if (movement.back) direction.z += 1;
  if (movement.left) direction.x -= 1;
  if (movement.right) direction.x += 1;

  if (direction.length() > 0) {
    direction.normalize();
    playerMesh.position.x += direction.x * speed * delta;
    playerMesh.position.z += direction.z * speed * delta;
  }

  controls.target.copy(playerMesh.position);
  controls.update();

  frameCount += 1;
  const now = performance.now();
  if (now - lastFpsTime > 1000) {
    const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
    if (fpsLabel) {
      fpsLabel.textContent = String(fps);
    }
    frameCount = 0;
    lastFpsTime = now;
  }

  sendPlayerState();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

if (resetEngineButton) {
  resetEngineButton.addEventListener("click", () => {
    if (camera && controls && playerMesh) {
      camera.position.set(6, 6, 10);
      controls.target.copy(playerMesh.position);
      controls.update();
    }
  });
}

const connectEvents = () => {
  if (eventSource) {
    eventSource.close();
  }
  eventSource = new EventSource("/events");

  eventSource.addEventListener("open", () => {
    if (serverStatus) {
      serverStatus.textContent = "Connected";
    }
  });

  eventSource.addEventListener("error", () => {
    if (serverStatus) {
      serverStatus.textContent = "Disconnected";
    }
  });
};

const sendPlayerState = () => {
  if (!playerMesh) return;
  const now = performance.now();
  if (now - lastStateSent < 200) return;
  lastStateSent = now;

  fetch("/state", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: playerId,
      name: playerProfile.name,
      position: {
        x: Number(playerMesh.position.x.toFixed(2)),
        y: Number(playerMesh.position.y.toFixed(2)),
        z: Number(playerMesh.position.z.toFixed(2)),
      },
    }),
  }).catch(() => {
    if (serverStatus) {
      serverStatus.textContent = "Disconnected";
    }
  });
};

if (reconnectButton) {
  reconnectButton.addEventListener("click", () => {
    connectEvents();
  });
}

if (worldNameLabel) {
  worldNameLabel.textContent = "Neon Plaza";
}

initEngine();
connectEvents();
