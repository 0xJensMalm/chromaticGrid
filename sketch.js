let offsetAngle;
let colorIndex;
let gradientStrength = 100;
let gridPadding = 150; // Padding from the canvas edges

const numLayers = 2; // Use this variable to control the number of grids

let offsetRange1 = 0; // Offset range for the first grid
let offsetRange2 = 1; // Offset range for the second grid
let offsetRange3 = 2; // Offset range for the third grid

const gradientDirections = ["horizontal", "vertical"];
let direction; // Shared gradient direction for all grids

let offsetSteps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]; // Steps in pixels

function setup() {
  createCanvas(500 + 2 * gridPadding, 700 + 2 * gridPadding);
  noLoop();
  offsetAngle = PI / 4;
  direction = random(gradientDirections);
  colorIndex = floor(random(Combination1.length));
}

function draw() {
  background(20);
  blendMode(ADD);

  const shapes = ["circle", "half-circle", "triangle", "square"];
  const combinationSets = [
    Combination1,
    Combination2,
    Combination3,
    Combination4,
    Combination5,
    Combination6,
  ];

  // Loop over the number of layers and draw each grid
  for (let i = 0; i < numLayers; i++) {
    let offsetX = random(offsetSteps) * cos(offsetAngle);
    let offsetY = random(offsetSteps) * sin(offsetAngle);
    let shapeType = random(shapes);
    let selectedCombination = random(combinationSets);
    let colorIndex = floor(random(selectedCombination.length));

    drawGrid(offsetX, offsetY, colorIndex, selectedCombination, shapeType);

    // Console output for debugging
    console.log(
      `Layer ${i + 1} Color:`,
      selectedCombination[colorIndex].start,
      "Shape:",
      shapeType,
      "Offset X:",
      offsetX,
      "Offset Y:",
      offsetY
    );
  }

  blendMode(BLEND);
}

function drawGrid(offsetX, offsetY, colorIndex, colorCombinations, shapeType) {
  let selectedCombination = colorCombinations[colorIndex];

  const gridWidth = 375; // Fixed grid width
  const gridHeight = gridWidth * (700 / 500); // Aspect ratio based on initial setup
  const gridSizeX = 12;
  const gridSizeY = gridSizeX * (700 / 500);
  const padding = 10;

  const circleSize = gridWidth / gridSizeX - padding;
  const totalWidth = gridSizeX * circleSize + (gridSizeX - 1) * padding;
  const totalHeight = gridSizeY * circleSize + (gridSizeY - 1) * padding;

  // Centralize the grid based on the new canvas size
  const startX = (width - totalWidth) / 2 + offsetX;
  const startY = (height - totalHeight) / 2 + offsetY;

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

      // Draw different shapes based on shapeType
      switch (shapeType) {
        case "circle":
          ellipse(x, y, circleSize, circleSize);
          break;
        case "half-circle":
          arc(x, y, circleSize, circleSize, 0, PI);
          break;
        case "triangle":
          triangle(
            x,
            y - circleSize / 2,
            x - circleSize / 2,
            y + circleSize / 2,
            x + circleSize / 2,
            y + circleSize / 2
          );
          break;
        case "square":
          // Draw a square
          rect(x - circleSize / 2, y - circleSize / 2, circleSize, circleSize);
          break;
      }
    }
  }
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

const Combination4 = [
  { start: "#FFFFFF", end: "#FFFFFF" }, // Completely White
];

const Combination5 = [
  { start: "#6A0DAD", end: "#D8BFD8" }, // Purple to Thistle
  { start: "#FF6347", end: "#FFA07A" }, // Tomato to Light Salmon
  { start: "#40E0D0", end: "#AFEEEE" }, // Turquoise to Pale Turquoise
];

const Combination6 = [
  { start: "#3CB371", end: "#8FBC8F" }, // Medium Sea Green to Dark Sea Green
  { start: "#FFD700", end: "#FFFACD" }, // Gold to Lemon Chiffon
  { start: "#00CED1", end: "#E0FFFF" }, // Dark Turquoise to Light Cyan
];

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
