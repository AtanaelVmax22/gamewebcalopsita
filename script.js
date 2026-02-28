const screenCustom = document.getElementById("screen-custom");
const screenGame = document.getElementById("screen-game");

const bodyColorInput = document.getElementById("bodyColor");
const headColorInput = document.getElementById("headColor");
const cheekColorInput = document.getElementById("cheekColor");
const crestStyleSelect = document.getElementById("crestStyle");

const previewBird = document.getElementById("previewBird");
const gameBird = document.getElementById("gameBird");

const waterBar = document.getElementById("waterBar");
const foodBar = document.getElementById("foodBar");
const affectionBar = document.getElementById("affectionBar");

const waterValue = document.getElementById("waterValue");
const foodValue = document.getElementById("foodValue");
const affectionValue = document.getElementById("affectionValue");
const moodText = document.getElementById("moodText");

const startBtn = document.getElementById("startBtn");
const waterBtn = document.getElementById("waterBtn");
const foodBtn = document.getElementById("foodBtn");
const affectionBtn = document.getElementById("affectionBtn");
const feedGrainBtn = document.getElementById("feedGrainBtn");
const grain = document.getElementById("grain");
const rescueBtn = document.getElementById("rescueBtn");
const xpBar = document.getElementById("xpBar");
const xpValue = document.getElementById("xpValue");
const levelValue = document.getElementById("levelValue");
const missionList = document.getElementById("missionList");
const logList = document.getElementById("logList");
const talentShowBtn = document.getElementById("talentShowBtn");
const talentStatus = document.getElementById("talentStatus");
const comboValue = document.getElementById("comboValue");
const bestComboValue = document.getElementById("bestComboValue");

class CockatielModel {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.mood = "feliz";
    this.pettingBoost = 0;
    this.blinkTimer = 0;
    this.beakOpen = 0;
    this.wanderTimer = 0;
    this.wanderInterval = 1.4;
    this.wanderTarget = new THREE.Vector2(0, 0);
    this.level = 1;
    this.scaleTarget = 1;
    this.drinkTimer = 0;

    this.scene = new THREE.Scene();

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    this.camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    this.camera.position.set(0, 1.16, 7.5);

    this.enabled = true;

    try {
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(width, height);
      container.appendChild(this.renderer.domElement);
    } catch (error) {
      this.enabled = false;
      container.classList.add("bird-fallback");
      container.innerHTML = '<div class="bird-fallback-label">🪶 Visual 3D indisponível neste dispositivo</div>';
      console.warn("WebGL indisponível, fallback 2D ativado.", error);
      return;
    }

    this.addLights();
    this.createBird();

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);

    this.animate = this.animate.bind(this);
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  addLights() {
    const key = new THREE.DirectionalLight(0xfffbe8, 1.2);
    key.position.set(4, 7, 6);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xdbeeff, 0.7);
    fill.position.set(-5, 2, -2);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.5);
    rim.position.set(0, 3, -7);
    this.scene.add(rim);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  }

  createBird() {
    this.root = new THREE.Group();
    this.root.position.y = -0.3;
    this.scene.add(this.root);

    const mat = (color, roughness = 0.65) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02 });

    this.materials = {
      body: mat("#dce7be", 0.72),
      chest: mat("#eef6cf", 0.75),
      head: mat("#ecf2b3", 0.7),
      cheek: mat("#ef4e61", 0.56),
      beak: mat("#e9ad8d", 0.55),
      eyeWhite: mat("#f5f7fb", 0.22),
      iris: mat("#2f3338", 0.25),
      pupil: mat("#0d0f12", 0.18),
      crest: mat("#e2e890", 0.68),
      wing: mat("#d2deb4", 0.72),
      tail: mat("#cad8a4", 0.72),
      leg: mat("#efae95", 0.58),
      toe: mat("#eb9f81", 0.56),
      eyeGloss: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.06, metalness: 0 }),
    };

    this.bodyPivot = new THREE.Group();
    this.root.add(this.bodyPivot);

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.9, 48, 42), this.materials.body);
    body.scale.set(0.9, 1.26, 0.76);
    body.position.set(0, 0.08, 0.02);
    this.bodyPivot.add(body);

    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.57, 34, 30), this.materials.chest);
    chest.scale.set(0.84, 1.58, 0.58);
    chest.position.set(0.01, 0.03, 0.65);
    this.bodyPivot.add(chest);

    const lowerBody = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.02, 22), this.materials.body);
    lowerBody.scale.set(0.92, 1.18, 0.74);
    lowerBody.position.set(0, -0.9, 0.12);
    this.bodyPivot.add(lowerBody);

    const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 1.28, 8, 16), this.materials.head);
    neck.scale.set(0.8, 1.45, 0.66);
    neck.position.set(0, 0.98, 0.26);
    this.bodyPivot.add(neck);

    this.headPivot = new THREE.Group();
    this.headPivot.position.set(0, 1.93, 0.56);
    this.bodyPivot.add(this.headPivot);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.66, 42, 32), this.materials.head);
    head.scale.set(1.06, 0.97, 0.9);
    this.headPivot.add(head);

    const face = new THREE.Mesh(new THREE.SphereGeometry(0.44, 32, 26), this.materials.head);
    face.scale.set(1.03, 0.85, 0.9);
    face.position.set(0, -0.1, 0.36);
    this.headPivot.add(face);

    const eyeWhiteGeom = new THREE.SphereGeometry(0.2, 20, 20);
    this.leftEyeWhite = new THREE.Mesh(eyeWhiteGeom, this.materials.eyeWhite);
    this.leftEyeWhite.scale.set(1.1, 1.16, 0.4);
    this.leftEyeWhite.position.set(-0.295, 0.06, 0.43);
    this.headPivot.add(this.leftEyeWhite);

    this.rightEyeWhite = this.leftEyeWhite.clone();
    this.rightEyeWhite.position.x = 0.295;
    this.headPivot.add(this.rightEyeWhite);

    const irisGeom = new THREE.SphereGeometry(0.105, 16, 16);
    this.leftIris = new THREE.Mesh(irisGeom, this.materials.iris);
    this.leftIris.scale.set(1, 1, 0.45);
    this.leftIris.position.set(-0.295, 0.06, 0.56);
    this.headPivot.add(this.leftIris);

    this.rightIris = this.leftIris.clone();
    this.rightIris.position.x = 0.295;
    this.headPivot.add(this.rightIris);

    const pupilGeom = new THREE.SphereGeometry(0.05, 14, 14);
    this.leftPupil = new THREE.Mesh(pupilGeom, this.materials.pupil);
    this.leftPupil.scale.set(1, 1, 0.45);
    this.leftPupil.position.set(-0.295, 0.06, 0.62);
    this.headPivot.add(this.leftPupil);

    this.rightPupil = this.leftPupil.clone();
    this.rightPupil.position.x = 0.295;
    this.headPivot.add(this.rightPupil);

    const eyeGlossGeom = new THREE.SphereGeometry(0.018, 8, 8);
    const glossL = new THREE.Mesh(eyeGlossGeom, this.materials.eyeGloss);
    glossL.position.set(-0.255, 0.12, 0.61);
    this.headPivot.add(glossL);

    const glossR = glossL.clone();
    glossR.position.x = 0.335;
    this.headPivot.add(glossR);

    const cheekGeom = new THREE.SphereGeometry(0.09, 14, 14);
    const cheekL = new THREE.Mesh(cheekGeom, this.materials.cheek);
    cheekL.scale.set(1.18, 1.05, 0.45);
    cheekL.position.set(-0.34, -0.2, 0.54);
    this.headPivot.add(cheekL);

    const cheekR = cheekL.clone();
    cheekR.position.x = 0.34;
    this.headPivot.add(cheekR);

    const upperBeak = new THREE.Mesh(new THREE.ConeGeometry(0.145, 0.34, 24), this.materials.beak);
    upperBeak.rotation.x = Math.PI / 2;
    upperBeak.scale.set(1.03, 0.9, 1.28);
    upperBeak.position.set(0, -0.12, 0.81);
    this.headPivot.add(upperBeak);

    this.lowerBeak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 20), this.materials.beak);
    this.lowerBeak.rotation.x = Math.PI / 2.03;
    this.lowerBeak.scale.set(1, 0.78, 0.9);
    this.lowerBeak.position.set(0, -0.24, 0.73);
    this.headPivot.add(this.lowerBeak);

    this.crestGroup = new THREE.Group();
    this.crestGroup.position.set(0, 0.54, 0.04);
    this.headPivot.add(this.crestGroup);

    const crestGeom = new THREE.CapsuleGeometry(0.024, 0.35, 6, 10);
    this.crestFeathers = [];
    [-0.32, -0.12, 0.12, 0.32].forEach((angle, index) => {
      const feather = new THREE.Mesh(crestGeom, this.materials.crest);
      feather.position.set((index - 1.5) * 0.056, 0.18 + index * 0.012, 0.02);
      feather.rotation.z = angle;
      feather.rotation.x = -0.08;
      this.crestGroup.add(feather);
      this.crestFeathers.push(feather);
    });

    const wingGeom = new THREE.SphereGeometry(0.47, 28, 24);
    this.leftWing = new THREE.Mesh(wingGeom, this.materials.wing);
    this.leftWing.scale.set(0.56, 1.62, 0.45);
    this.leftWing.rotation.set(0.19, 0.22, Math.PI / 6.3);
    this.leftWing.position.set(-0.66, -0.05, 0.12);
    this.bodyPivot.add(this.leftWing);

    this.rightWing = this.leftWing.clone();
    this.rightWing.rotation.y *= -1;
    this.rightWing.rotation.z *= -1;
    this.rightWing.position.x = 0.72;
    this.bodyPivot.add(this.rightWing);

    this.tailGroup = new THREE.Group();
    this.tailGroup.position.set(0, -0.54, -0.66);
    this.tailGroup.rotation.x = -0.95;
    this.bodyPivot.add(this.tailGroup);

    const tailMiddle = new THREE.Mesh(new THREE.ConeGeometry(0.1, 1.35, 16), this.materials.tail);
    tailMiddle.scale.set(0.95, 1, 0.38);
    tailMiddle.position.set(0, -0.36, -0.08);
    this.tailGroup.add(tailMiddle);

    const tailSideGeom = new THREE.ConeGeometry(0.06, 1.02, 12);
    const tailL = new THREE.Mesh(tailSideGeom, this.materials.tail);
    tailL.rotation.z = 0.32;
    tailL.position.set(-0.11, -0.31, -0.03);
    this.tailGroup.add(tailL);

    const tailR = tailL.clone();
    tailR.rotation.z = -0.32;
    tailR.position.x = 0.11;
    this.tailGroup.add(tailR);

    const legGeom = new THREE.CylinderGeometry(0.033, 0.043, 0.57, 10);
    const leftLeg = new THREE.Mesh(legGeom, this.materials.leg);
    leftLeg.position.set(-0.16, -1.5, 0.14);
    this.root.add(leftLeg);

    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.16;
    this.root.add(rightLeg);

    const toeGeom = new THREE.CylinderGeometry(0.011, 0.015, 0.21, 8);
    const addFoot = (x, y, z, side) => {
      const foot = new THREE.Group();
      foot.position.set(x, y, z);

      [-0.52, -0.08, 0.45].forEach((rot, idx) => {
        const toe = new THREE.Mesh(toeGeom, this.materials.toe);
        toe.rotation.set(Math.PI / 2.45, 0, rot + side * 0.08);
        toe.position.set((idx - 1) * 0.06, -0.02, 0.1);
        foot.add(toe);
      });

      const backToe = new THREE.Mesh(toeGeom, this.materials.toe);
      backToe.rotation.set(Math.PI / 2.1, 0, Math.PI + side * 0.07);
      backToe.position.set(0, -0.02, -0.07);
      foot.add(backToe);

      this.root.add(foot);
    };

    addFoot(-0.16, -1.78, 0.23, -1);
    addFoot(0.16, -1.78, 0.23, 1);

    this.floorShadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.22, 36),
      new THREE.MeshBasicMaterial({ color: 0x8ea1c4, transparent: true, opacity: 0.24 })
    );
    this.floorShadow.rotation.x = -Math.PI / 2;
    this.floorShadow.position.y = -1.82;
    this.scene.add(this.floorShadow);
  }

  setColors({ bodyColor, headColor, cheekColor }) {
    if (!this.materials) return;

    this.materials.body.color.set(bodyColor);

    const chestTone = new THREE.Color(bodyColor).lerp(new THREE.Color("#ffffff"), 0.28);
    this.materials.chest.color.copy(chestTone);

    const wingTone = new THREE.Color(bodyColor).multiplyScalar(0.92);
    this.materials.wing.color.copy(wingTone);

    const tailTone = new THREE.Color(bodyColor).multiplyScalar(0.82);
    this.materials.tail.color.copy(tailTone);

    this.materials.head.color.set(headColor);
    this.materials.crest.color.set(headColor);
    this.materials.cheek.color.set(cheekColor);
  }

  setCrestStyle(style) {
    const styleMap = {
      up: { x: -0.05, y: 0.03, z: 0 },
      down: { x: 0.46, y: 0.03, z: -0.22 },
      messy: { x: 0.08, y: 0.12, z: 0.28 },
    };

    this.crestTarget = styleMap[style] || styleMap.up;
  }

  setMood(mood) {
    this.mood = mood;

    if (mood !== "feliz" && this.wanderTarget) {
      this.wanderTarget.set(0, 0);
    }
  }

  pet() {
    this.pettingBoost = 1;
  }

  drink() {
    this.drinkTimer = 0.65;
  }

  setLevel(level) {
    const clampedLevel = Math.max(1, level);
    this.level = clampedLevel;
    this.scaleTarget = Math.min(1.65, 1 + (clampedLevel - 1) * 0.035);
  }

  onResize() {
    if (!this.enabled || !this.renderer) return;

    const width = this.container.clientWidth || 300;
    const height = this.container.clientHeight || 300;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    const delta = this.clock.getDelta();
    const elapsed = this.clock.elapsedTime;

    const moodFactor = {
      feliz: { sway: 0.14, speed: 1.35, bob: 0.045, head: 0.07, wing: 0.045 },
      estressada: { sway: 0.27, speed: 3.8, bob: 0.04, head: 0.14, wing: 0.085 },
      triste: { sway: 0.08, speed: 0.75, bob: 0.02, head: 0.035, wing: 0.02 },
    }[this.mood];

    const petWiggle = this.pettingBoost * Math.sin(elapsed * 12.5) * 0.28;
    this.pettingBoost = Math.max(0, this.pettingBoost - delta * 2.3);

    const isDrinking = this.drinkTimer > 0;
    if (isDrinking) this.drinkTimer = Math.max(0, this.drinkTimer - delta);

    this.root.rotation.y = Math.sin(elapsed * moodFactor.speed) * moodFactor.sway + petWiggle;
    this.root.rotation.x = -0.04 + Math.sin(elapsed * moodFactor.speed * 0.56) * 0.02;
    this.root.position.y = -0.3 + Math.sin(elapsed * moodFactor.speed * 1.1) * moodFactor.bob;

    const currentScale = this.root.scale.x;
    const smoothedScale = currentScale + (this.scaleTarget - currentScale) * 0.06;
    this.root.scale.setScalar(smoothedScale);
    this.floorShadow.scale.setScalar(0.9 + smoothedScale * 0.45);

    const drinkProgress = isDrinking ? Math.sin((1 - this.drinkTimer / 0.65) * Math.PI) : 0;
    this.headPivot.rotation.z = Math.sin(elapsed * moodFactor.speed * 0.82) * moodFactor.head;
    this.headPivot.rotation.x = Math.sin(elapsed * moodFactor.speed * 0.54) * 0.04 + drinkProgress * 0.52;

    const isHappy = this.mood === "feliz";
    const wingBase = isHappy ? 0.32 : 0.16;
    const wingExtra = isHappy ? 0.06 : 0;
    this.leftWing.rotation.x = wingBase + Math.sin(elapsed * moodFactor.speed * 1.2) * (moodFactor.wing + wingExtra);
    this.rightWing.rotation.x =
      wingBase + Math.sin(elapsed * moodFactor.speed * 1.2 + 0.5) * (moodFactor.wing + wingExtra);

    const singWave = (Math.sin(elapsed * 10.5) + 1) / 2;
    const singingTarget = isDrinking ? 0.22 : isHappy ? singWave : 0;
    this.beakOpen += (singingTarget - this.beakOpen) * 0.2;
    this.lowerBeak.rotation.x = Math.PI / 2.03 + this.beakOpen * 0.4;
    this.lowerBeak.position.y = -0.24 - this.beakOpen * 0.03;

    this.wanderTimer += delta;
    if (isHappy && this.wanderTimer >= this.wanderInterval) {
      this.wanderTimer = 0;
      this.wanderInterval = 1 + Math.random() * 1.6;
      this.wanderTarget.set((Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 0.6);
    }

    this.root.position.x += (this.wanderTarget.x - this.root.position.x) * 0.045;
    this.root.position.z += (this.wanderTarget.y - this.root.position.z) * 0.045;

    this.tailGroup.rotation.z = Math.sin(elapsed * moodFactor.speed * 0.8) * 0.06;

    if (this.crestTarget) {
      this.crestGroup.rotation.x += (this.crestTarget.x - this.crestGroup.rotation.x) * 0.1;
      this.crestGroup.rotation.y += (this.crestTarget.y - this.crestGroup.rotation.y) * 0.1;
      this.crestGroup.rotation.z += (this.crestTarget.z - this.crestGroup.rotation.z) * 0.1;
    }

    this.blinkTimer += delta;
    const randomBlinkGap = 2.4 + Math.random() * 2;
    const closing = this.blinkTimer > 0.02 && this.blinkTimer < 0.11;
    const opening = this.blinkTimer >= 0.11 && this.blinkTimer < 0.2;

    let eyeScale = 1;
    if (closing) eyeScale = 1 - (this.blinkTimer - 0.02) * 11;
    if (opening) eyeScale = 0.03 + (this.blinkTimer - 0.11) * 11;

    const clamped = Math.max(0.06, Math.min(1, eyeScale));
    this.leftEyeWhite.scale.y = 1.12 * clamped;
    this.rightEyeWhite.scale.y = 1.12 * clamped;
    this.leftIris.scale.y = clamped;
    this.rightIris.scale.y = clamped;
    this.leftPupil.scale.y = clamped;
    this.rightPupil.scale.y = clamped;

    if (this.blinkTimer > randomBlinkGap) this.blinkTimer = 0;

    this.renderer.render(this.scene, this.camera);
    this.animationFrame = requestAnimationFrame(this.animate);
  }
}

const previewModel = new CockatielModel(previewBird);
const gameModel = new CockatielModel(gameBird);

const STORAGE_KEY = "cockatiel_guardian_v2";

const state = {
  water: 100,
  food: 100,
  affection: 100,
  mood: "feliz",
  bowlStock: 6,
  isFeeding: false,
  loopId: null,
  eventLoopId: null,
  level: 1,
  xp: 0,
  missions: [],
  missionProgress: { water: 0, feed: 0, affection: 0 },
  logs: [],
  talentActive: false,
  talentCombo: 0,
  talentBestCombo: 0,
  talentPrompt: null,
  talentPromptTimeoutId: null,
  talentEndTimeoutId: null,
};

function addLog(message) {
  const now = new Date();
  const stamp = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  state.logs.unshift(`[${stamp}] ${message}`);
  state.logs = state.logs.slice(0, 8);
  renderLogs();
}

function renderLogs() {
  logList.innerHTML = "";
  state.logs.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    logList.appendChild(li);
  });
}

function getXpTarget() {
  return 80 + state.level * 30;
}

function gainXp(value, reason) {
  state.xp += value;
  let target = getXpTarget();

  while (state.xp >= target) {
    state.xp -= target;
    state.level += 1;
    state.water = Math.min(100, state.water + 10);
    state.food = Math.min(100, state.food + 10);
    state.affection = Math.min(100, state.affection + 10);
    addLog(`🌟 Subiu para o nível ${state.level}! Bônus de recuperação aplicado.`);
    target = getXpTarget();
  }

  if (reason) addLog(`+${value} XP: ${reason}.`);
  updateXpUI();
}

function updateXpUI() {
  const target = getXpTarget();
  const progress = Math.min(100, (state.xp / target) * 100);
  xpBar.style.width = `${progress}%`;
  xpValue.textContent = `${Math.round(state.xp)} / ${target} XP`;
  levelValue.textContent = `Nível ${state.level}`;
  gameModel.setLevel(state.level);
}

function ensureMissions() {
  if (state.missions.length) return;

  state.missions = [
    { id: "water", label: "Reabasteça água", goal: 3 + Math.floor(Math.random() * 2), reward: 22, done: false },
    { id: "feed", label: "Alimente com grãos", goal: 4 + Math.floor(Math.random() * 3), reward: 28, done: false },
    { id: "affection", label: "Faça carinho", goal: 5 + Math.floor(Math.random() * 3), reward: 20, done: false },
  ];
}

function renderMissions() {
  ensureMissions();
  missionList.innerHTML = "";

  state.missions.forEach((mission) => {
    const progress = Math.min(mission.goal, state.missionProgress[mission.id] || 0);
    const li = document.createElement("li");
    li.className = mission.done ? "done" : "";
    li.textContent = `${mission.done ? "✅" : "🎯"} ${mission.label}: ${progress}/${mission.goal}`;
    missionList.appendChild(li);
  });
}

function incrementMission(id, amount = 1) {
  state.missionProgress[id] = (state.missionProgress[id] || 0) + amount;

  state.missions.forEach((mission) => {
    if (mission.id !== id || mission.done) return;

    if (state.missionProgress[id] >= mission.goal) {
      mission.done = true;
      gainXp(mission.reward, `Missão concluída (${mission.label.toLowerCase()})`);
      addLog(`🏆 Missão concluída: ${mission.label}.`);
    }
  });

  if (state.missions.every((mission) => mission.done)) {
    addLog("📦 Todas as missões concluídas! Novo ciclo de missões criado.");
    state.missions = [];
    state.missionProgress = { water: 0, feed: 0, affection: 0 };
    ensureMissions();
  }

  renderMissions();
}

function updateRescueVisibility() {
  const needsSOS = state.water < 20 || state.food < 20 || state.affection < 20;
  rescueBtn.classList.toggle("hidden", !needsSOS);
}

function saveGame() {
  const payload = {
    state: {
      water: state.water,
      food: state.food,
      affection: state.affection,
      bowlStock: state.bowlStock,
      level: state.level,
      xp: state.xp,
      missions: state.missions,
      missionProgress: state.missionProgress,
      logs: state.logs,
      talentBestCombo: state.talentBestCombo,
    },
    customization: {
      bodyColor: bodyColorInput.value,
      headColor: headColorInput.value,
      cheekColor: cheekColorInput.value,
      crestStyle: crestStyleSelect.value,
    },
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadGame() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (parsed.customization) {
      bodyColorInput.value = parsed.customization.bodyColor || bodyColorInput.value;
      headColorInput.value = parsed.customization.headColor || headColorInput.value;
      cheekColorInput.value = parsed.customization.cheekColor || cheekColorInput.value;
      crestStyleSelect.value = parsed.customization.crestStyle || crestStyleSelect.value;
    }

    if (parsed.state) {
      Object.assign(state, parsed.state);
      state.loopId = null;
      state.eventLoopId = null;
      state.isFeeding = false;
    }
  } catch {
    addLog("Falha ao carregar save antigo. Um novo ciclo foi iniciado.");
  }
}

function triggerRandomEvent() {
  const events = [
    {
      text: "Um barulho externo assustou a calopsita.",
      apply: () => {
        state.affection = Math.max(0, state.affection - 7);
      },
    },
    {
      text: "A calopsita cantou animada e ficou com sede.",
      apply: () => {
        state.water = Math.max(0, state.water - 8);
        gainXp(8, "Reação ao evento");
      },
    },
    {
      text: "Ela te recebeu com alegria!",
      apply: () => {
        state.affection = Math.min(100, state.affection + 5);
        gainXp(6, "Conexão positiva");
      },
    },
  ];

  if (Math.random() > 0.45) return;
  const selected = events[Math.floor(Math.random() * events.length)];
  selected.apply();
  addLog(`🎲 Evento: ${selected.text}`);
  updateBars();
  updateMood();
}

function updateTalentUI() {
  comboValue.textContent = `${state.talentCombo}`;
  bestComboValue.textContent = `${state.talentBestCombo}`;

  if (!state.talentActive) {
    talentStatus.textContent = "Comece o show e responda aos comandos rápidos da calopsita!";
    talentShowBtn.disabled = false;
    return;
  }

  const promptMap = {
    water: "💧 Rápido! Clique em ENCHER ÁGUA!",
    food: "🥣 Agora! Clique em ENCHER POTE DE RAÇÃO!",
    affection: "💛 Hora do carinho! Clique em FAZER CARINHO!",
  };

  talentStatus.textContent = promptMap[state.talentPrompt] || "Prepare-se para o próximo comando...";
}

function failTalentPrompt(reasonText) {
  if (!state.talentActive) return;
  state.talentCombo = 0;
  state.affection = Math.max(0, state.affection - 8);
  addLog(`🎭 Show falhou: ${reasonText}. A plateia vaiou!`);
  updateBars();
  updateMood();
  state.talentPrompt = null;
  updateTalentUI();
  setTimeout(scheduleTalentPrompt, 550);
}

function scheduleTalentPrompt() {
  if (!state.talentActive) return;

  if (state.talentPromptTimeoutId) {
    clearTimeout(state.talentPromptTimeoutId);
    state.talentPromptTimeoutId = null;
  }

  const prompts = ["water", "food", "affection"];
  state.talentPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  updateTalentUI();

  state.talentPromptTimeoutId = setTimeout(() => {
    failTalentPrompt("demorou para responder");
  }, 2200);
}

function resolveTalentInput(action) {
  if (!state.talentActive || !state.talentPrompt) return;

  if (state.talentPromptTimeoutId) {
    clearTimeout(state.talentPromptTimeoutId);
    state.talentPromptTimeoutId = null;
  }

  if (state.talentPrompt === action) {
    state.talentCombo += 1;
    state.talentBestCombo = Math.max(state.talentBestCombo, state.talentCombo);
    gainXp(18 + state.talentCombo * 2, "Acerto no show de talentos");
    addLog(`🎶 Acerto no show! Combo x${state.talentCombo}.`);
    state.affection = Math.min(100, state.affection + 4);
    updateBars();
    updateMood();
    state.talentPrompt = null;
    updateTalentUI();
    setTimeout(scheduleTalentPrompt, 380);
    return;
  }

  failTalentPrompt("comando errado");
}

function endTalentShow() {
  if (!state.talentActive) return;

  state.talentActive = false;
  state.talentPrompt = null;
  if (state.talentPromptTimeoutId) clearTimeout(state.talentPromptTimeoutId);
  if (state.talentEndTimeoutId) clearTimeout(state.talentEndTimeoutId);
  state.talentPromptTimeoutId = null;
  state.talentEndTimeoutId = null;

  const bonusXp = state.talentBestCombo >= 8 ? 95 : state.talentBestCombo >= 5 ? 55 : 25;
  gainXp(bonusXp, "Encerramento do show");
  addLog(`🏁 Show encerrado! Melhor combo: ${state.talentBestCombo}. Bônus: ${bonusXp} XP.`);
  state.talentCombo = 0;
  updateTalentUI();
}

function startTalentShow() {
  if (state.talentActive) return;
  state.talentActive = true;
  state.talentCombo = 0;
  state.talentPrompt = null;
  talentShowBtn.disabled = true;
  addLog("🎤 Show de talentos começou! Responda rápido aos comandos.");
  updateTalentUI();

  scheduleTalentPrompt();
  state.talentEndTimeoutId = setTimeout(endTalentShow, 30000);
}

function applyCustomization() {
  const config = {
    bodyColor: bodyColorInput.value,
    headColor: headColorInput.value,
    cheekColor: cheekColorInput.value,
  };

  previewModel.setColors(config);
  gameModel.setColors(config);

  const crestStyle = crestStyleSelect.value;
  previewModel.setCrestStyle(crestStyle);
  gameModel.setCrestStyle(crestStyle);
}

function updateBars() {
  const setBar = (bar, valueEl, value) => {
    bar.style.width = `${value}%`;
    valueEl.textContent = `${Math.round(value)}%`;

    let color = "#56cc9d";
    if (value < 40) color = "#e35f68";
    else if (value < 70) color = "#e7b952";

    bar.style.background = `linear-gradient(90deg, ${color}, #ffffff)`;
  };

  setBar(waterBar, waterValue, state.water);
  setBar(foodBar, foodValue, state.food);
  setBar(affectionBar, affectionValue, state.affection);
  updateRescueVisibility();
  saveGame();
}

function updateFeedControls() {
  const hasGrain = state.bowlStock > 0;
  grain.classList.toggle("hidden", !hasGrain);
  feedGrainBtn.disabled = !hasGrain || state.isFeeding;
}

function updateMood() {
  const average = (state.water + state.food + state.affection) / 3;

  if (average > 70) {
    state.mood = "feliz";
    moodText.textContent = "Feliz";
  } else if (average >= 40) {
    state.mood = "estressada";
    moodText.textContent = "Estressada";
  } else {
    state.mood = "triste";
    moodText.textContent = "Triste";
  }

  gameModel.setMood(state.mood);
}

function startGameLoop() {
  if (state.loopId) clearInterval(state.loopId);
  if (state.eventLoopId) clearInterval(state.eventLoopId);

  state.loopId = setInterval(() => {
    const levelReduction = Math.min(1.7, (state.level - 1) * 0.08);
    const moodPenalty = state.mood === "triste" ? 1.2 : state.mood === "estressada" ? 1.05 : 0.9;

    state.water = Math.max(0, state.water - (3.8 - levelReduction) * moodPenalty);
    state.food = Math.max(0, state.food - (3.2 - levelReduction) * moodPenalty);
    state.affection = Math.max(0, state.affection - (4.4 - levelReduction) * moodPenalty);

    gainXp(2, "Cuidado contínuo");
    updateBars();
    updateMood();
  }, 1500);

  state.eventLoopId = setInterval(triggerRandomEvent, 12000);
}

function addWater() {
  state.water = Math.min(100, state.water + 25);
  gainXp(12, "Hidratação");
  incrementMission("water");
  gameModel.drink();
  addLog("💧 A calopsita bebeu água fresquinha.");
  resolveTalentInput("water");
  updateBars();
  updateMood();
}

function addFood() {
  state.food = Math.min(100, state.food + 12);
  state.bowlStock = Math.min(12, state.bowlStock + 4);
  gainXp(9, "Reposição de ração");
  resolveTalentInput("food");
  updateBars();
  updateMood();
  updateFeedControls();
}

function feedGrainToCockatiel() {
  if (state.bowlStock <= 0 || state.isFeeding) return;

  state.isFeeding = true;
  state.bowlStock -= 1;
  feedGrainBtn.disabled = true;

  grain.classList.remove("feed-anim");
  void grain.offsetWidth;
  grain.classList.add("feed-anim");

  setTimeout(() => {
    grain.classList.remove("feed-anim");
    state.food = Math.min(100, state.food + 18);
    state.affection = Math.min(100, state.affection + 6);
    gainXp(14, "Alimentação manual");
    incrementMission("feed");
    resolveTalentInput("food");
    gameModel.pet();

    state.isFeeding = false;
    updateBars();
    updateMood();
    updateFeedControls();
  }, 560);
}

function addAffection() {
  state.affection = Math.min(100, state.affection + 30);
  gainXp(10, "Carinho");
  incrementMission("affection");
  resolveTalentInput("affection");
  gameModel.pet();
  updateBars();
  updateMood();
}

function useRescueMode() {
  state.water = Math.min(100, state.water + 18);
  state.food = Math.min(100, state.food + 18);
  state.affection = Math.min(100, state.affection + 18);
  gameModel.drink();
  gainXp(16, "Ação SOS");
  addLog("⚡ Modo SOS acionado para estabilizar a calopsita.");
  updateBars();
  updateMood();
}

function startGame() {
  applyCustomization();
  screenCustom.classList.remove("active");
  screenGame.classList.add("active");

  ensureMissions();
  renderMissions();
  renderLogs();
  updateXpUI();
  updateBars();
  updateMood();
  updateFeedControls();
  startGameLoop();
  updateTalentUI();
  addLog("🐣 Turno iniciado. Cuide bem da sua calopsita!");
}

[bodyColorInput, headColorInput, cheekColorInput, crestStyleSelect].forEach((input) => {
  input.addEventListener("input", applyCustomization);
  input.addEventListener("change", applyCustomization);
});

startBtn.addEventListener("click", startGame);
waterBtn.addEventListener("click", addWater);
foodBtn.addEventListener("click", addFood);
feedGrainBtn.addEventListener("click", feedGrainToCockatiel);
affectionBtn.addEventListener("click", addAffection);
rescueBtn.addEventListener("click", useRescueMode);
talentShowBtn.addEventListener("click", startTalentShow);
gameBird.addEventListener("click", addAffection);

loadGame();
applyCustomization();
ensureMissions();
renderMissions();
renderLogs();
updateXpUI();
updateBars();
updateMood();
updateFeedControls();
updateTalentUI();
