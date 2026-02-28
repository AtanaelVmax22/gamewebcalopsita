const screenCustom = document.getElementById("screen-custom");
const screenGame = document.getElementById("screen-game");

const bodyColorInput = document.getElementById("bodyColor");
const headColorInput = document.getElementById("headColor");
const cheekColorInput = document.getElementById("cheekColor");
const crestStyleSelect = document.getElementById("crestStyle");

const previewBird = document.getElementById("previewBird");
const gameBird = document.getElementById("gameBird");
const gameCage = document.getElementById("gameCage");

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

const state = {
  water: 100,
  food: 100,
  affection: 100,
  mood: "feliz",
  loopId: null,
};

/**
 * Aplica as cores escolhidas no pássaro e em elementos da interface.
 */
function applyCustomization() {
  const bodyColor = bodyColorInput.value;
  const headColor = headColorInput.value;
  const cheekColor = cheekColorInput.value;
  const crestStyle = crestStyleSelect.value;

  [previewBird, gameBird].forEach((bird) => {
    bird.querySelector(".body").style.background = bodyColor;
    bird.querySelector(".head").style.background = headColor;
    bird.querySelector(".cheek").style.background = cheekColor;

    const crest = bird.querySelector(".crest");
    crest.classList.remove("up", "down", "messy");
    crest.classList.add(crestStyle);
    crest.style.setProperty("--crestColor", headColor);
    crest.style.background = "transparent";
    crest.style.color = headColor;
    crest.style.filter = "drop-shadow(0 2px 0 #00000010)";

  });

  document.documentElement.style.setProperty("--accent", bodyColor);
  document.documentElement.style.setProperty("--accent-2", cheekColor);
  gameCage.style.borderColor = headColor;
}

/**
 * Atualiza largura/cor das barras e textos percentuais.
 */
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

/**
 * Calcula o humor com base na média dos três status e troca animação.
 */
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

  gameBird.classList.remove("mood-feliz", "mood-estressada", "mood-triste");
  gameBird.classList.add(`mood-${state.mood}`);
}

/**
 * Loop principal: reduz status com o tempo.
 */
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
  updateBars();
  updateMood();

  // Pequena animação extra ao ganhar carinho.
  gameBird.classList.add("petting");
  setTimeout(() => gameBird.classList.remove("petting"), 500);
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
