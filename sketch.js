let offsetMagnitude = 10; // This can stay outside because it's not using p5.js constants or functions
let offsetAngle; // Declare the variable here without initializing it
let colorIndex; // Declare a global variable for the color combination index
let gradientStrength = 100;

const gradientDirections = ["horizontal", "vertical", "diagonal"];
let direction; // Shared gradient direction for all grids

function setup() {
  createCanvas(500, 700);
  noLoop();
  offsetAngle = PI / 4;
  direction = random(gradientDirections);
  colorIndex = floor(random(Combination1.length)); // Select a random index for color combinations
}

const Combination1 = [
  { start: "#FF0000", end: "#E00000" }, // Red to Darker Red
  { start: "#FFFF00", end: "#E0E000" }, // Yellow to Darker Yellow
  { start: "#FFA500", end: "#E09500" }, // Orange to Darker Orange
  { start: "#00FF00", end: "#00E000" }, // Green to Darker Green
  { start: "#FF69B4", end: "#E06090" }, // Hot Pink to Darker Hot Pink
  { start: "#00FFFF", end: "#00E0E0" }, // Cyan to Darker Cyan
];

const Combination2 = [
  { start: "#0000FF", end: "#0000E0" }, // Blue to Darker Blue
  { start: "#800080", end: "#700070" }, // Purple to Darker Purple
  { start: "#0000FF", end: "#0000E0" }, // Blue to Darker Blue
  { start: "#FFD700", end: "#E0C300" }, // Gold to Darker Gold
  { start: "#FF4500", end: "#E03E00" }, // OrangeRed to Darker OrangeRed
  { start: "#BA55D3", end: "#A050C0" }, // Medium Orchid to Darker Medium Orchid
];

const Combination3 = [
  { start: "#00FF00", end: "#00E000" }, // Green to Darker Green
  { start: "#FF00FF", end: "#E000E0" }, // Magenta to Darker Magenta
  { start: "#FFFF00", end: "#E0E000" }, // Yellow to Darker Yellow
  { start: "#1E90FF", end: "#1A80E0" }, // Dodger Blue to Darker Dodger Blue
  { start: "#32CD32", end: "#2EB82E" }, // LimeGreen to Darker LimeGreen
  { start: "#FF1493", end: "#E01283" }, // DeepPink to Darker DeepPink
];

function draw() {
  background(40);
  blendMode(ADD);

  let offsetX = offsetMagnitude * cos(offsetAngle);
  let offsetY = offsetMagnitude * sin(offsetAngle);

  // Draw three grids with different offsets and color combinations
  drawGrid(offsetX, offsetY, colorIndex, Combination2); // Second grid with complementary colors
  drawGrid(0, 0, colorIndex, Combination1); // First grid with main colors
  drawGrid(-offsetX, -offsetY, colorIndex, Combination3); // Third grid with its own color scheme

  blendMode(ADD); // Reset blend mode after drawing grids
}

function drawGrid(offsetX, offsetY, colorIndex, colorCombinations) {
  let selectedCombination = colorCombinations[colorIndex];

  const aspectRatio = width / height;
  const gridWidth = width * 0.75;
  const gridHeight = gridWidth / aspectRatio;
  const gridSizeX = 10;
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
  // Adjust the step based on the gradient strength
  let adjustedStep = step / (totalSteps * (gradientStrength / 100));

  // Ensure the adjusted step doesn't exceed 1
  adjustedStep = min(adjustedStep, 1);

  let startRGB = hexToRgb(startColor);
  let endRGB = hexToRgb(endColor);

  // Calculate the color for the current step
  let r = (endRGB.r - startRGB.r) * adjustedStep + startRGB.r;
  let g = (endRGB.g - startRGB.g) * adjustedStep + startRGB.g;
  let b = (endRGB.b - startRGB.b) * adjustedStep + startRGB.b;

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
