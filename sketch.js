let offsetAngle;
let colorIndex;
let gradientStrength = 100;
let gridPadding = 150; // Padding from the canvas edges

const numLayers = 3; // Use this variable to control the number of grids

const gridModes = ["rectangular", "circular", "triangular"];
let gridMode;

let baseOffsetStep = 10; // Base step in pixels for offsets
let maxOffsetMultiplier = 3; // Maximum multiplier for baseOffsetStep

const gradientDirections = ["horizontal", "vertical"];
let direction; // Shared gradient direction for all grids

function setup() {
  createCanvas(500 + 2 * gridPadding, 700 + 2 * gridPadding);
  noLoop();
  offsetAngle = PI / 4;
  direction = random(gradientDirections);

  // Retrieve combinations and set a default index
  const colorCombinations = getColorCombinations();
  const combinationKeys = Object.keys(colorCombinations); // Get combination names
  let selectedKey = random(combinationKeys); // Select a random key (combination name)
  let selectedCombination = colorCombinations[selectedKey];

  // Since colorIndex is used globally, you might initialize it here if needed
  colorIndex = floor(random(selectedCombination.length));
  gridMode = random(gridModes);
}

function draw() {
  background(20);
  blendMode(ADD);

  const shapes = ["circle", "half-circle", "triangle", "square"];
  const colorCombinations = getColorCombinations();
  const combinationKeys = Object.keys(colorCombinations); // Get combination names

  for (let i = 0; i < numLayers; i++) {
    const { offsetX, offsetY } = calculateOffset(i);
    let shapeType = random(shapes);
    let selectedKey = random(combinationKeys); // Select a random key (combination name)
    let selectedCombination = colorCombinations[selectedKey];
    let colorIndex = floor(random(selectedCombination.length));

    drawGrid(offsetX, offsetY, colorIndex, selectedCombination, shapeType);

    console.log(
      `Layer ${
        i + 1
      }: Colors: ${selectedKey}, Shape ${shapeType}, Offset X ${offsetX.toFixed(
        2
      )}, Offset Y ${offsetY.toFixed(2)}`
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

  switch (gridMode) {
    case "rectangular":
      drawRectangularGrid(
        startX,
        startY,
        gridSizeX,
        gridSizeY,
        circleSize,
        padding,
        shapeType,
        selectedCombination
      );
      break;
    case "circular":
      drawCircularGrid(
        offsetX,
        offsetY,
        gridSizeX,
        circleSize,
        padding,
        shapeType,
        selectedCombination
      );
      break;
    case "triangular":
      drawTriangularGrid(
        startX,
        startY,
        gridSizeX,
        circleSize,
        padding,
        shapeType,
        selectedCombination
      );
      break;
  }
}

function drawRectangularGrid(
  startX,
  startY,
  gridSizeX,
  gridSizeY,
  circleSize,
  padding,
  shapeType,
  selectedCombination
) {
  for (let i = 0; i < gridSizeX; i++) {
    for (let j = 0; j < gridSizeY; j++) {
      const x = startX + i * (circleSize + padding);
      const y = startY + j * (circleSize + padding);
      const step = calculateStep(i, j, gridSizeX, gridSizeY, direction);
      const fillColor = getGradientColor(
        selectedCombination.start,
        selectedCombination.end,
        gridSizeX,
        step
      );
      noStroke();
      fill(fillColor);
      drawShape(x, y, circleSize, shapeType);
    }
  }
}

function drawCircularGrid(
  offsetX,
  offsetY,
  gridSizeX,
  circleSize,
  padding,
  shapeType,
  selectedCombination
) {
  const centerX = width / 2 + offsetX;
  const centerY = height / 2 + offsetY;
  const radius = (gridSizeX * (circleSize + padding)) / 2;

  for (let i = 0; i < gridSizeX; i++) {
    for (let j = 0; j < gridSizeX; j++) {
      const angle = (TWO_PI / gridSizeX) * j;
      const x = centerX + cos(angle) * radius;
      const y = centerY + sin(angle) * radius;
      const step = calculateStep(i, j, gridSizeX, gridSizeX, direction);
      const fillColor = getGradientColor(
        selectedCombination.start,
        selectedCombination.end,
        gridSizeX,
        step
      );
      noStroke();
      fill(fillColor);
      drawShape(x, y, circleSize, shapeType);
    }
  }
}

function drawTriangularGrid(
  startX,
  startY,
  gridSizeX,
  circleSize,
  padding,
  shapeType,
  selectedCombination
) {
  const centerX = width / 2;
  const centerY = height / 2;
  for (let i = 0; i < gridSizeX; i++) {
    for (let j = 0; j <= i; j++) {
      const x =
        centerX + j * (circleSize + padding) - (i * (circleSize + padding)) / 2;
      const y = startY + i * (circleSize + padding);
      const step = calculateStep(i, j, gridSizeX, gridSizeX, direction);
      const fillColor = getGradientColor(
        selectedCombination.start,
        selectedCombination.end,
        gridSizeX,
        step
      );
      noStroke();
      fill(fillColor);
      drawShape(x, y, circleSize, shapeType);
    }
  }
}

function drawShape(x, y, size, shapeType) {
  switch (shapeType) {
    case "circle":
      ellipse(x, y, size, size);
      break;
    case "half-circle":
      arc(x, y, size, size, 0, PI);
      break;
    case "triangle":
      triangle(
        x,
        y - size / 2,
        x - size / 2,
        y + size / 2,
        x + size / 2,
        y + size / 2
      );
      break;
    case "square":
      rect(x - size / 2, y - size / 2, size, size);
      break;
  }
}

function getColorCombinations() {
  return {
    Combination1: [
      { start: "#FF0000", end: "#E00000" }, // Red to Darker Red
      { start: "#FFFF00", end: "#E0E000" }, // Yellow to Darker Yellow
      { start: "#FFA500", end: "#E09500" }, // Orange to Darker Orange
      { start: "#00FF00", end: "#00E000" }, // Green to Darker Green
      { start: "#FF69B4", end: "#E06090" }, // Hot Pink to Darker Hot Pink
      { start: "#00FFFF", end: "#00E0E0" }, // Cyan to Darker Cyan
    ],
    Combination2: [
      { start: "#0000FF", end: "#0000E0" }, // Blue to Darker Blue
      { start: "#800080", end: "#700070" }, // Purple to Darker Purple
      { start: "#0000FF", end: "#0000E0" }, // Blue to Darker Blue again
      { start: "#FFD700", end: "#E0C300" }, // Gold to Darker Gold
      { start: "#FF4500", end: "#E03E00" }, // OrangeRed to Darker OrangeRed
      { start: "#BA55D3", end: "#A050C0" }, // Medium Orchid to Darker Medium Orchid
    ],
    Combination3: [
      { start: "#00FF00", end: "#00E000" }, // Green to Darker Green
      { start: "#FF00FF", end: "#E000E0" }, // Magenta to Darker Magenta
      { start: "#FFFF00", end: "#E0E000" }, // Yellow to Darker Yellow
      { start: "#1E90FF", end: "#1A80E0" }, // Dodger Blue to Darker Dodger Blue
      { start: "#32CD32", end: "#2EB82E" }, // LimeGreen to Darker LimeGreen
      { start: "#FF1493", end: "#E01283" }, // DeepPink to Darker DeepPink
    ],
    Combination4: [
      { start: "#FFFFFF", end: "#FFFFFF" }, // Completely White
    ],
    Combination5: [
      { start: "#6A0DAD", end: "#D8BFD8" }, // Purple to Thistle
      { start: "#FF6347", end: "#FFA07A" }, // Tomato to Light Salmon
      { start: "#40E0D0", end: "#AFEEEE" }, // Turquoise to Pale Turquoise
    ],
    Combination6: [
      { start: "#3CB371", end: "#8FBC8F" }, // Medium Sea Green to Dark Sea Green
      { start: "#FFD700", end: "#FFFACD" }, // Gold to Lemon Chiffon
      { start: "#00CED1", end: "#E0FFFF" }, // Dark Turquoise to Light Cyan
    ],
  };
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
function calculateStep(i, j, direction) {
  switch (direction) {
    case "horizontal":
      return i; // Step based on horizontal position
    case "vertical":
      return j; // Step based on vertical position
    case "diagonal":
      // Assuming a simple diagonal where we sum the indices
      return i + j; // Step based on the sum of positions (diagonal)
    default:
      return 0; // Default case, should not be reached
  }
}

function calculateOffset() {
  let multiplier = floor(random(maxOffsetMultiplier + 1)); // from 0 to maxOffsetMultiplier
  let offsetX = multiplier * baseOffsetStep * cos(offsetAngle);
  let offsetY = multiplier * baseOffsetStep * sin(offsetAngle);
  return { offsetX, offsetY };
}
