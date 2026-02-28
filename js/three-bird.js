import { els } from "./dom.js";

// Prioridade: modelo realista local de calopsita com animações (adicione em assets/models/cockatiel.glb)
// Fallback automático: parrot animado da Khronos para garantir funcionamento imediato.
const MODEL_CANDIDATES = [
  {
    name: "Calopsita (local)",
    url: "./assets/models/cockatiel.glb",
    scale: [1.2, 1.2, 1.2],
    position: [0, -1.1, 0],
    rotationY: Math.PI / 2,
  },
  {
    name: "Parrot (fallback)",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Parrot/glTF-Binary/Parrot.glb",
    scale: [0.015, 0.015, 0.015],
    position: [0, -0.8, 0],
    rotationY: Math.PI / 2,
  },
];

export function createThreeBirdController(onPet, getMood) {
  const bird3d = {
    enabled: false,
    renderer: null,
    scene: null,
    camera: null,
    root: null,
    mixer: null,
    clock: null,
    action: null,
    raycaster: null,
    pointer: null,
    petBoostUntil: 0,
    hueShift: 0,
    baseY: -1.1,
  };

  function setupThreeBird() {
    if (!window.THREE || !window.THREE.GLTFLoader || bird3d.enabled) return;

    const { THREE } = window;
    const width = els.bird3dContainer.clientWidth || 350;
    const height = els.bird3dContainer.clientHeight || 320;

    bird3d.scene = new THREE.Scene();
    bird3d.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
    bird3d.camera.position.set(0, 1.2, 6.5);

    bird3d.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    bird3d.renderer.setSize(width, height);
    bird3d.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    els.bird3dContainer.appendChild(bird3d.renderer.domElement);

    // Luz mais "realista" para geometria detalhada.
    const hemi = new THREE.HemisphereLight(0xffffff, 0xbdd1e8, 0.9);
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(4, 7, 5);
    const fill = new THREE.DirectionalLight(0xcfe4ff, 0.5);
    fill.position.set(-3, 2, -4);
    bird3d.scene.add(hemi, key, fill);

    const perch = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.1, 0.1, 24),
      new THREE.MeshStandardMaterial({ color: 0xc39d71, roughness: 0.75 })
    );
    perch.rotation.z = Math.PI / 2;
    perch.position.set(0, -1.25, 0);
    bird3d.scene.add(perch);

    bird3d.raycaster = new THREE.Raycaster();
    bird3d.pointer = new THREE.Vector2();
    bird3d.clock = new THREE.Clock();

    loadFirstAvailableModel(0);

    window.addEventListener("resize", () => {
      if (!bird3d.renderer) return;
      const nextWidth = els.bird3dContainer.clientWidth;
      const nextHeight = els.bird3dContainer.clientHeight;
      bird3d.camera.aspect = nextWidth / nextHeight;
      bird3d.camera.updateProjectionMatrix();
      bird3d.renderer.setSize(nextWidth, nextHeight);
    });
  }

  function loadFirstAvailableModel(index) {
    const option = MODEL_CANDIDATES[index];
    if (!option) {
      els.gameBird.classList.remove("hidden-fallback");
      els.gameBird.style.pointerEvents = "auto";
      els.bird3dContainer.style.display = "none";
      return;
    }

    const loader = new window.THREE.GLTFLoader();
    loader.load(
      option.url,
      (gltf) => {
        mountLoadedModel(gltf, option);
      },
      undefined,
      () => loadFirstAvailableModel(index + 1)
    );
  }

  function mountLoadedModel(gltf, option) {
    bird3d.root = gltf.scene;
    bird3d.root.scale.set(...option.scale);
    bird3d.root.position.set(...option.position);
    bird3d.baseY = option.position[1];
    bird3d.root.rotation.y = option.rotationY;
    bird3d.scene.add(bird3d.root);

    if (gltf.animations.length) {
      bird3d.mixer = new window.THREE.AnimationMixer(bird3d.root);
      bird3d.action = bird3d.mixer.clipAction(gltf.animations[0]);
      bird3d.action.play();
    }

    bird3d.renderer.domElement.addEventListener("click", onBirdClick3D);
    bird3d.enabled = true;
    animateThreeBird();
  }

  function onBirdClick3D(event) {
    if (!bird3d.root) return;

    const rect = bird3d.renderer.domElement.getBoundingClientRect();
    bird3d.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    bird3d.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    bird3d.raycaster.setFromCamera(bird3d.pointer, bird3d.camera);
    const hits = bird3d.raycaster.intersectObject(bird3d.root, true);
    if (hits.length > 0) onPet();
  }

  function animateThreeBird() {
    if (!bird3d.enabled || !bird3d.root) return;

    const t = performance.now() * 0.001;
    const delta = bird3d.clock.getDelta();
    if (bird3d.mixer) bird3d.mixer.update(delta);

    const mood = getMood();
    if (mood === "feliz") {
      bird3d.root.position.x = Math.sin(t * 1.3) * 1.1;
      bird3d.root.position.y = bird3d.baseY + Math.sin(t * 2.8) * 0.06;
      bird3d.root.rotation.z = Math.sin(t * 2.2) * 0.06;
      if (bird3d.action) bird3d.action.timeScale = 1.05;
    } else if (mood === "estressada") {
      bird3d.root.position.x = Math.sin(t * 4.6) * 1.35;
      bird3d.root.position.y = bird3d.baseY + Math.sin(t * 7.8) * 0.08;
      bird3d.root.rotation.z = Math.sin(t * 14) * 0.12;
      if (bird3d.action) bird3d.action.timeScale = 1.7;
    } else {
      bird3d.root.position.x = Math.sin(t * 0.45) * 0.16;
      bird3d.root.position.y = bird3d.baseY + Math.sin(t * 1.2) * 0.02;
      bird3d.root.rotation.z = Math.sin(t * 0.8) * 0.015;
      if (bird3d.action) bird3d.action.timeScale = 0.5;
    }

    if (performance.now() < bird3d.petBoostUntil) {
      bird3d.root.rotation.y += Math.sin(t * 32) * 0.04;
    }

    const uiColor = new window.THREE.Color().setHSL(bird3d.hueShift || 0.57, 0.35, 0.93);
    bird3d.scene.background = uiColor;

    bird3d.renderer.render(bird3d.scene, bird3d.camera);
    requestAnimationFrame(animateThreeBird);
  }

  return {
    setupThreeBird,
    setHueFromColor(hexColor) {
      if (!window.THREE) return;
      bird3d.hueShift = new window.THREE.Color(hexColor).getHSL({ h: 0, s: 0, l: 0 }).h;
    },
    triggerPetAnimation() {
      bird3d.petBoostUntil = performance.now() + 500;
    },
  };
}
