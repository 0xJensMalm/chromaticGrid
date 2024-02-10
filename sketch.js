const colorCombinations = [
  { start: "#8B0000", end: "#FFD700" }, // Dark Red -> Yellow
  { start: "#00008B", end: "#800080" }, // Dark Blue -> Purple
];

function setup() {
  createCanvas(500, 700); // Set canvas size
  noLoop(); // No need to loop since the grid doesn't change
}

function draw() {
  background(40); // Set background color
  drawGrid();
}
function drawGrid() {
  let selectedCombination = colorCombinations[0];
  const gradientDirections = ["horizontal", "vertical", "diagonal"];
  let direction = random(gradientDirections); // Select a random gradient direction

  const aspectRatio = width / height; // Canvas aspect ratio
  const gridWidth = width * 0.75;
  const gridHeight = gridWidth / aspectRatio; // Maintain canvas aspect ratio for the grid
  const gridSizeX = 8; // Number of circles horizontally
  const gridSizeY = gridSizeX / aspectRatio; // Adjust number of circles vertically based on aspect ratio
  const padding = 10; // Consistent padding between circles

  // Calculate the size of each circle based on the grid's width
  const circleSize = gridWidth / gridSizeX - padding;

  // Calculate the starting position to center the grid
  const totalWidth = gridSizeX * (circleSize + padding);
  const totalHeight = gridSizeY * (circleSize + padding);
  const startX = (width - totalWidth + padding) / 2;
  const startY = (height - totalHeight + padding) / 2;

  for (let i = 0; i < gridSizeX; i++) {
    for (let j = 0; j < gridSizeY; j++) {
      const x = startX + i * (circleSize + padding);
      const y = startY + j * (circleSize + padding);

      // Determine the total number of steps based on the direction
      let totalSteps;
      switch (direction) {
        case "horizontal":
          totalSteps = gridSizeX;
          break;
        case "vertical":
          totalSteps = gridSizeY;
          break;
        case "diagonal":
          totalSteps = gridSizeX + gridSizeY - 1; // Max sum of positions in a diagonal direction
          break;
      }

      // Calculate the step for the current circle based on direction
      const step = calculateStep(i, j, gridSizeX, gridSizeY, direction);

      // Get the gradient color for the current circle
      const fillColor = getGradientColor(
        selectedCombination.start,
        selectedCombination.end,
        totalSteps,
        step
      );
      fill(fillColor);

      // Draw the circle
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
