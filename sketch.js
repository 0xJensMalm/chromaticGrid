let offsetMagnitude = 10; // This can stay outside because it's not using p5.js constants or functions
let offsetAngle; // Declare the variable here without initializing i
let colorIndex; // Declare a global variable for the color combination index

function setup() {
  createCanvas(500, 700);
  noLoop();
  offsetAngle = PI / 4;
  direction = random(gradientDirections);
  colorIndex = floor(random(mainColorCombinations.length)); // Select a random index
}

const mainColorCombinations = [
  { start: "#FF004D", end: "#FAEF5D" }, // PinkRed -> Yellow
  { start: "#FF6400", end: "#fffd00" }, // Orange -> Yellow
  { start: "#96EFFF", end: "#7B66FF" }, //skyBlue -> Purple
];

// Complementary colors for the secondary grid
const complementaryColorCombinations = [
  { start: "#00FFB2", end: "#5D68FA" }, //green yellow
  { start: "#009BFF", end: "#0002FF" },
  { start: "#FFA696", end: "#EAFF66" },
];

const gradientDirections = ["horizontal", "vertical", "diagonal"];
let direction; // Shared gradient direction for both grids

function setup() {
  createCanvas(500, 700); // Set canvas size
  noLoop(); // No need to loop since the grid doesn't change
  offsetAngle = PI / 4; // Correctly assign to the global variable
  direction = random(gradientDirections); // Select a random gradient direction for both grids
  colorIndex = floor(random(mainColorCombinations.length));
}

function draw() {
  background(40);

  let offsetX = offsetMagnitude * cos(offsetAngle);
  let offsetY = offsetMagnitude * sin(offsetAngle);

  // Use the same colorIndex for both grids
  drawGrid(offsetX, offsetY, colorIndex, complementaryColorCombinations);
  drawGrid(0, 0, colorIndex, mainColorCombinations);
}

function drawGrid(offsetX, offsetY, colorIndex, colorCombinations) {
  let selectedCombination = colorCombinations[colorIndex];

  const aspectRatio = width / height;
  const gridWidth = width * 0.75;
  const gridHeight = gridWidth / aspectRatio;
  const gridSizeX = 6;
  const gridSizeY = gridSizeX / aspectRatio;
  const padding = 10;

  const circleSize = gridWidth / gridSizeX - padding;
  const totalWidth = gridSizeX * (circleSize + padding);
  const totalHeight = gridSizeY * (circleSize + padding);
  const startX = (width - totalWidth + padding) / 2 + offsetX;
  const startY = (height - totalHeight + padding) / 2 + offsetY;

  for (let i = 0; i < gridSizeX; i++) {
    for (let j = 0; j < gridSizeY; j++) {
      const x = startX + i * (circleSize + padding);
      const y = startY + j * (circleSize + padding);

      let totalSteps;
      switch (direction) {
        case "horizontal":
          totalSteps = gridSizeX;
          break;
        case "vertical":
          totalSteps = gridSizeY;
          break;
        case "diagonal":
          totalSteps = gridSizeX + gridSizeY - 1;
          break;
      }

      const step = calculateStep(i, j, gridSizeX, gridSizeY, direction);
      const fillColor = getGradientColor(
        selectedCombination.start,
        selectedCombination.end,
        totalSteps,
        step
      );
      noStroke();
      fill(fillColor);
      ellipse(x, y, circleSize, circleSize);
    }
  }
}
function getGradientColor(startColor, endColor, totalSteps, step) {
  // Convert HEX colors to RGB
  let startRGB = hexToRgb(startColor);
  let endRGB = hexToRgb(endColor);

  // Calculate the color for the current step
  let r = ((endRGB.r - startRGB.r) / totalSteps) * step + startRGB.r;
  let g = ((endRGB.g - startRGB.g) / totalSteps) * step + startRGB.g;
  let b = ((endRGB.b - startRGB.b) / totalSteps) * step + startRGB.b;

  return color(r, g, b);
}

function hexToRgb(hex) {
  let r = 0,
    g = 0,
    b = 0;
  // 3 digits
  if (hex.length == 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  }
  // 6 digits
  else if (hex.length == 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return { r, g, b };
}
function calculateStep(i, j, gridSizeX, gridSizeY, direction) {
  switch (direction) {
    case "horizontal":
      return i; // Step based on horizontal position
    case "vertical":
      return j; // Step based on vertical position
    case "diagonal":
      return i + j; // Step based on the sum of positions (diagonal)
    default:
      return 0; // Default case, should not be reached
  }
}
