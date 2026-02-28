import { els } from "./dom.js";

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
    procedural: false,
    parts: {},
  };

  function setupThreeBird() {
    if (!window.THREE || bird3d.enabled) return;

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

    // Tenta carregar modelos externos; se falhar, usa calopsita procedural feita no código.
    if (window.THREE.GLTFLoader) {
      loadFirstAvailableModel(0);
    } else {
      mountProceduralCockatiel();
    }

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
      mountProceduralCockatiel();
      return;
    }

    const loader = new window.THREE.GLTFLoader();
    loader.load(
      option.url,
      (gltf) => mountLoadedModel(gltf, option),
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

    finishMount();
  }

  function mountProceduralCockatiel() {
    const { root, parts } = createProceduralCockatiel(window.THREE);
    bird3d.root = root;
    bird3d.parts = parts;
    bird3d.procedural = true;
    bird3d.baseY = -1.03;
    bird3d.root.position.set(0, bird3d.baseY, 0);
    bird3d.root.rotation.y = Math.PI / 2;
    bird3d.scene.add(bird3d.root);
    finishMount();
  }

  function finishMount() {
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

    if (bird3d.procedural) animateProceduralParts(t, mood);

    if (performance.now() < bird3d.petBoostUntil) {
      bird3d.root.rotation.y += Math.sin(t * 32) * 0.04;
    }

    const uiColor = new window.THREE.Color().setHSL(bird3d.hueShift || 0.57, 0.35, 0.93);
    bird3d.scene.background = uiColor;

    bird3d.renderer.render(bird3d.scene, bird3d.camera);
    requestAnimationFrame(animateThreeBird);
  }

  function animateProceduralParts(t, mood) {
    const wingAmp = mood === "estressada" ? 0.5 : mood === "feliz" ? 0.28 : 0.12;
    const wingSpeed = mood === "estressada" ? 14 : mood === "feliz" ? 8 : 3;

    bird3d.parts.wingL.rotation.z = -0.25 + Math.sin(t * wingSpeed) * wingAmp * 0.18;
    bird3d.parts.wingR.rotation.z = 0.25 - Math.sin(t * wingSpeed) * wingAmp * 0.18;
    bird3d.parts.head.rotation.x = Math.sin(t * (wingSpeed * 0.42)) * 0.05;
    bird3d.parts.tail.rotation.x = -0.3 + Math.sin(t * (wingSpeed * 0.4)) * 0.06;
    bird3d.parts.crest.rotation.z = Math.sin(t * 4) * 0.08;
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

function createProceduralCockatiel(THREE) {
  const root = new THREE.Group();

  const matBody = new THREE.MeshStandardMaterial({ color: 0x9da5ae, roughness: 0.62, metalness: 0.02 });
  const matHead = new THREE.MeshStandardMaterial({ color: 0xf5e2aa, roughness: 0.55, metalness: 0.02 });
  const matCheek = new THREE.MeshStandardMaterial({ color: 0xf1975f, roughness: 0.45 });
  const matDark = new THREE.MeshStandardMaterial({ color: 0x1f2328, roughness: 0.4 });
  const matBeak = new THREE.MeshStandardMaterial({ color: 0xd9a464, roughness: 0.48 });
  const matLeg = new THREE.MeshStandardMaterial({ color: 0x8a8f96, roughness: 0.7 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.88, 42, 32), matBody);
  body.scale.set(1, 1.15, 0.86);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 24), matBody);
  chest.scale.set(0.9, 1.05, 0.78);
  chest.position.set(0.38, -0.05, 0);

  const head = new THREE.Group();
  head.position.set(0.72, 0.82, 0);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.54, 36, 28), matHead);
  const throat = new THREE.Mesh(new THREE.SphereGeometry(0.38, 26, 20), matHead);
  throat.position.set(-0.2, -0.28, 0);
  throat.scale.set(0.9, 1.1, 0.9);

  const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 16), matCheek);
  cheekL.position.set(0.18, -0.03, 0.33);
  const cheekR = cheekL.clone();
  cheekR.position.z = -0.33;

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.058, 16, 12), matDark);
  eyeL.position.set(0.3, 0.08, 0.19);
  const eyeR = eyeL.clone();
  eyeR.position.z = -0.19;

  const beakTop = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.34, 24), matBeak);
  beakTop.rotation.z = -Math.PI / 2;
  beakTop.position.set(0.53, -0.03, 0);
  const beakBottom = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 18), matBeak);
  beakBottom.rotation.z = -Math.PI / 2;
  beakBottom.position.set(0.44, -0.11, 0);
  beakBottom.scale.y = 0.6;

  const crest = new THREE.Group();
  crest.position.set(0.16, 0.58, 0);
  for (let i = 0; i < 5; i += 1) {
    const feather = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.42, 4, 8), matHead);
    feather.position.set(0.05 * i, 0.22 + i * 0.05, (i - 2) * 0.045);
    feather.rotation.z = -0.8 + i * 0.09;
    feather.rotation.x = (i - 2) * 0.06;
    crest.add(feather);
  }

  head.add(skull, throat, cheekL, cheekR, eyeL, eyeR, beakTop, beakBottom, crest);

  const wingGeo = new THREE.SphereGeometry(0.54, 28, 20);
  const wingL = new THREE.Mesh(wingGeo, matBody);
  wingL.position.set(0.04, 0.2, 0.66);
  wingL.scale.set(1.25, 0.72, 0.5);
  wingL.rotation.y = 0.22;
  wingL.rotation.z = -0.24;

  const wingR = wingL.clone();
  wingR.position.z = -0.66;
  wingR.rotation.y = -0.22;
  wingR.rotation.z = 0.24;

  const tail = new THREE.Group();
  tail.position.set(-0.72, -0.28, 0);
  for (let i = -2; i <= 2; i += 1) {
    const feather = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.07, 0.14), matBody);
    feather.position.set(-0.3, -0.06, i * 0.1);
    feather.rotation.z = -0.32;
    feather.rotation.x = i * 0.04;
    tail.add(feather);
  }

  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.44, 10), matLeg);
  legL.position.set(0.2, -0.96, 0.18);
  const legR = legL.clone();
  legR.position.z = -0.18;

  const footL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.26, 8), matLeg);
  footL.rotation.z = Math.PI / 2;
  footL.position.set(0.2, -1.16, 0.2);
  const footR = footL.clone();
  footR.position.z = -0.2;

  root.add(body, chest, head, wingL, wingR, tail, legL, legR, footL, footR);

  return { root, parts: { head, wingL, wingR, crest, tail } };
}
