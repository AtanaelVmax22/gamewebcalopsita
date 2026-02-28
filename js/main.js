import { els } from "./dom.js";
import { applyCustomization, updateBars, startGame, addWater, addFood, addAffection } from "./game.js";

[els.bodyColorInput, els.headColorInput, els.cheekColorInput, els.crestStyleSelect].forEach((input) => {
  input.addEventListener("input", applyCustomization);
  input.addEventListener("change", applyCustomization);
});

els.startBtn.addEventListener("click", startGame);
els.waterBtn.addEventListener("click", addWater);
els.foodBtn.addEventListener("click", addFood);
els.affectionBtn.addEventListener("click", addAffection);
els.gameBird.addEventListener("click", addAffection);

applyCustomization();
updateBars();
