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

class CockatielModel {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.mood = "feliz";
    this.pettingBoost = 0;
    this.blinkTimer = 0;
    this.randomMoveTimer = 0;
    this.randomMoveInterval = 1.8;
    this.randomOffset = new THREE.Vector2(0, 0);
    this.randomOffsetTarget = new THREE.Vector2(0, 0);
    this.singTimer = 0;

    this.scene = new THREE.Scene();

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    this.camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    this.camera.position.set(0, 1.16, 7.5);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

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

    this.upperBeak = new THREE.Mesh(new THREE.ConeGeometry(0.145, 0.34, 24), this.materials.beak);
    this.upperBeak.rotation.x = Math.PI / 2;
    this.upperBeak.scale.set(1.03, 0.9, 1.28);
    this.upperBeak.position.set(0, -0.12, 0.81);
    this.headPivot.add(this.upperBeak);

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

    this.songNotes = [];
    const noteBase = new THREE.MeshStandardMaterial({
      color: 0xffe680,
      emissive: 0xff9f66,
      emissiveIntensity: 0.35,
      roughness: 0.45,
      metalness: 0.04,
      transparent: true,
      opacity: 0,
    });

    for (let i = 0; i < 3; i += 1) {
      const note = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), noteBase.clone());
      note.visible = false;
      note.userData.seed = i * 0.8;
      this.scene.add(note);
      this.songNotes.push(note);
    }
  }

  setColors({ bodyColor, headColor, cheekColor }) {
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
  }

  pet() {
    this.pettingBoost = 1;
  }

  onResize() {
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
      feliz: { sway: 0.17, speed: 1.5, bob: 0.05, head: 0.085, wing: 0.09, wingOpen: 0.33, random: 0.17 },
      estressada: { sway: 0.27, speed: 3.8, bob: 0.04, head: 0.14, wing: 0.085, wingOpen: 0.16, random: 0.06 },
      triste: { sway: 0.08, speed: 0.75, bob: 0.02, head: 0.035, wing: 0.02, wingOpen: 0.12, random: 0.03 },
    }[this.mood];

    const happyMood = this.mood === "feliz";

    this.randomMoveTimer += delta;
    if (this.randomMoveTimer >= this.randomMoveInterval) {
      this.randomMoveTimer = 0;
      this.randomMoveInterval = 1.2 + Math.random() * 2.1;
      this.randomOffsetTarget.set((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
    }
    this.randomOffset.lerp(this.randomOffsetTarget, 0.025);

    const petWiggle = this.pettingBoost * Math.sin(elapsed * 12.5) * 0.28;
    this.pettingBoost = Math.max(0, this.pettingBoost - delta * 2.3);

    const randomX = this.randomOffset.x * moodFactor.random;
    const randomZ = this.randomOffset.y * moodFactor.random * 0.45;

    this.root.rotation.y = Math.sin(elapsed * moodFactor.speed) * moodFactor.sway + petWiggle + randomX * 0.25;
    this.root.rotation.x = -0.04 + Math.sin(elapsed * moodFactor.speed * 0.56) * 0.02;
    this.root.position.y = -0.3 + Math.sin(elapsed * moodFactor.speed * 1.1) * moodFactor.bob;
    this.root.position.x = randomX;
    this.root.position.z = randomZ;

    this.headPivot.rotation.z = Math.sin(elapsed * moodFactor.speed * 0.82) * moodFactor.head + randomX * 0.12;
    this.headPivot.rotation.x = Math.sin(elapsed * moodFactor.speed * 0.54) * 0.04;

    const wingBase = moodFactor.wingOpen + Math.sin(elapsed * moodFactor.speed * 1.2) * moodFactor.wing;
    this.leftWing.rotation.x = wingBase;
    this.rightWing.rotation.x = moodFactor.wingOpen + Math.sin(elapsed * moodFactor.speed * 1.2 + 0.5) * moodFactor.wing;

    this.tailGroup.rotation.z = Math.sin(elapsed * moodFactor.speed * 0.8) * 0.06 + randomX * 0.08;

    if (this.lowerBeak) {
      if (happyMood) {
        this.singTimer += delta * 4.8;
        this.lowerBeak.rotation.x = Math.PI / 2.03 + Math.max(0, Math.sin(this.singTimer)) * 0.25;
      } else {
        this.singTimer = 0;
        this.lowerBeak.rotation.x += (Math.PI / 2.03 - this.lowerBeak.rotation.x) * 0.2;
      }
    }

    if (this.songNotes) {
      this.songNotes.forEach((note, idx) => {
        if (!happyMood) {
          note.visible = false;
          note.material.opacity = 0;
          return;
        }

        const t = (elapsed * 0.9 + idx * 0.33) % 1;
        const lift = t * 0.75;
        note.visible = true;
        note.position.set(
          this.root.position.x + 0.55 + idx * 0.1,
          1.65 + lift + Math.sin(elapsed * 4 + note.userData.seed) * 0.06,
          0.65 + Math.cos(elapsed * 3 + note.userData.seed) * 0.12
        );
        note.material.opacity = Math.max(0, 0.85 - t);
        const s = 0.7 + t * 0.9;
        note.scale.set(s, s, s);
      });
    }

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

const state = {
  water: 100,
  food: 100,
  affection: 100,
  mood: "feliz",
  loopId: null,
};

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

  state.loopId = setInterval(() => {
    state.water = Math.max(0, state.water - 3.8);
    state.food = Math.max(0, state.food - 3.2);
    state.affection = Math.max(0, state.affection - 4.4);

    updateBars();
    updateMood();
  }, 1500);
}

function addWater() {
  state.water = Math.min(100, state.water + 25);
  updateBars();
  updateMood();
}

function addFood() {
  state.food = Math.min(100, state.food + 25);
  updateBars();
  updateMood();
}

function addAffection() {
  state.affection = Math.min(100, state.affection + 30);
  gameModel.pet();
  updateBars();
  updateMood();
}

function startGame() {
  applyCustomization();
  screenCustom.classList.remove("active");
  screenGame.classList.add("active");

  updateBars();
  updateMood();
  startGameLoop();
}

[bodyColorInput, headColorInput, cheekColorInput, crestStyleSelect].forEach((input) => {
  input.addEventListener("input", applyCustomization);
  input.addEventListener("change", applyCustomization);
});

startBtn.addEventListener("click", startGame);
waterBtn.addEventListener("click", addWater);
foodBtn.addEventListener("click", addFood);
affectionBtn.addEventListener("click", addAffection);
gameBird.addEventListener("click", addAffection);

applyCustomization();
updateBars();
updateMood();
