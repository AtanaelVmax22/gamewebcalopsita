import { els } from "./dom.js";
import { createThreeBirdController } from "./three-bird.js";

const state = {
  water: 100,
  food: 100,
  affection: 100,
  mood: "feliz",
  loopId: null,
};

const threeBird = createThreeBirdController(addAffection, () => state.mood);

export function updateBars() {
  const setBar = (bar, valueEl, value) => {
    bar.style.width = `${value}%`;
    valueEl.textContent = `${Math.round(value)}%`;

    let color = "#56cc9d";
    if (value < 40) color = "#e35f68";
    else if (value < 70) color = "#e7b952";

    bar.style.background = `linear-gradient(90deg, ${color}, #ffffff)`;
  };

  setBar(els.waterBar, els.waterValue, state.water);
  setBar(els.foodBar, els.foodValue, state.food);
  setBar(els.affectionBar, els.affectionValue, state.affection);
}

export function updateMood() {
  const average = (state.water + state.food + state.affection) / 3;

  if (average > 70) {
    state.mood = "feliz";
    els.moodText.textContent = "Feliz";
  } else if (average >= 40) {
    state.mood = "estressada";
    els.moodText.textContent = "Estressada";
  } else {
    state.mood = "triste";
    els.moodText.textContent = "Triste";
  }

  els.gameBird.classList.remove("mood-feliz", "mood-estressada", "mood-triste");
  els.gameBird.classList.add(`mood-${state.mood}`);
}

export function startGameLoop() {
  if (state.loopId) clearInterval(state.loopId);

  state.loopId = setInterval(() => {
    state.water = Math.max(0, state.water - 3.8);
    state.food = Math.max(0, state.food - 3.2);
    state.affection = Math.max(0, state.affection - 4.4);

    updateBars();
    updateMood();
  }, 1500);
}

export function addWater() {
  state.water = Math.min(100, state.water + 25);
  updateBars();
  updateMood();
}

export function addFood() {
  state.food = Math.min(100, state.food + 25);
  updateBars();
  updateMood();
}

export function addAffection() {
  state.affection = Math.min(100, state.affection + 30);
  updateBars();
  updateMood();

  els.gameBird.classList.add("petting");
  setTimeout(() => els.gameBird.classList.remove("petting"), 500);
  threeBird.triggerPetAnimation();
}

export function applyCustomization() {
  const bodyColor = els.bodyColorInput.value;
  const headColor = els.headColorInput.value;
  const cheekColor = els.cheekColorInput.value;
  const crestStyle = els.crestStyleSelect.value;

  [els.previewBird, els.gameBird].forEach((bird) => {
    bird.querySelector(".body").style.background = bodyColor;
    bird.querySelector(".head").style.background = headColor;
    bird.querySelector(".cheek").style.background = cheekColor;

    const crest = bird.querySelector(".crest");
    crest.classList.remove("up", "down", "messy");
    crest.classList.add(crestStyle);
    crest.style.setProperty("--crestColor", headColor);
  });

  document.documentElement.style.setProperty("--accent", bodyColor);
  document.documentElement.style.setProperty("--accent-2", cheekColor);
  els.gameCage.style.borderColor = headColor;

  threeBird.setHueFromColor(bodyColor);
}

export function startGame() {
  applyCustomization();
  threeBird.setupThreeBird();

  els.screenCustom.classList.remove("active");
  els.screenGame.classList.add("active");

  updateBars();
  updateMood();
  startGameLoop();
}
