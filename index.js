new p5((sketch) => {
  let offsetAngle;
  let gridMode;
  let direction;
  let scaleFactor;
  let selectedKey;

  let baseWidth = 600; // Increased base width
  let baseHeight = 600; // Increased base height

  const numLayers = 3;
  let gridPadding = 20;

  const gridModes = ["rectangular", "reverseTriangular", "triangular"];
  let maxOffsetMultiplier = 3; // Maximum multiplier for baseOffsetStep
  let gradientStrength = 100;
  const gradientDirections = ["horizontal", "vertical"];
  const shapes = ["circle", "half-circle", "triangle", "square"];

  let animationSpeed = 0.03;
  let isAnimating = false;
  let animationProgress = 0;
  let movingToCenter = true;
  let initialShapes = [];
  let initialOffsets = [];
  let initialColors = [];
  let initialColorIndices = [];

  sketch.setup = function () {
    resizeSketchCanvas();
    sketch.pixelDensity(10); // Set higher pixel density for better quality
    sketch.noLoop();
    offsetAngle = sketch.PI / 4;
    direction =
      $fx.rand() > 0.5 ? gradientDirections[0] : gradientDirections[1];

    horizontalOffsetStep = randomChoice([6, 12, 24]);
    verticalOffsetStep = randomChoice([10, 20, 30, 40, 50, 60]);

    // Retrieve combinations and set a default index
    const colorCombinations = getColorCombinations();
    const combinationKeys = Object.keys(colorCombinations); // Get combination names
    selectedKey = randomChoice(combinationKeys); // Select a random key (combination name)
    let selectedCombination = colorCombinations[selectedKey];

    // Since colorIndex is used globally, you might initialize it here if needed
    colorIndex = Math.floor($fx.rand() * selectedCombination.length);
    gridMode = randomChoice(gridModes);

    // fxhash features
    $fx.features({
      layers: numLayers,
      horizontalOffsetStep: horizontalOffsetStep,
      verticalOffsetStep: verticalOffsetStep,
      gridMode: gridMode,
      colorPalette: selectedKey,
      cellShapes: [], // Placeholder, will be filled dynamically
    });

    // Store initial shapes, offsets, and color indices
    for (let i = 0; i < numLayers; i++) {
      const { offsetX, offsetY } = calculateOffset(i);
      let shapeType = randomChoice(shapes);
      initialShapes.push(shapeType);
      initialOffsets.push({ offsetX, offsetY });
      initialColors.push(selectedCombination); // Store initial colors
      initialColorIndices.push(
        Math.floor($fx.rand() * selectedCombination.length)
      ); // Store initial color indices
    }
  };

  sketch.draw = function () {
    sketch.background(20);
    sketch.blendMode(sketch.ADD);

    const usedShapes = [];
    for (let i = 0; i < numLayers; i++) {
      const { offsetX, offsetY } = initialOffsets[i];
      let shapeType = initialShapes[i];
      usedShapes.push(shapeType);
      let selectedCombination = initialColors[i];
      let colorIndex = initialColorIndices[i];

      let adjustedOffsetX = offsetX * (1 - animationProgress);
      let adjustedOffsetY = offsetY * (1 - animationProgress);

      if (!movingToCenter) {
        adjustedOffsetX = offsetX * animationProgress;
        adjustedOffsetY = offsetY * animationProgress;
      }

      drawGrid(
        adjustedOffsetX,
        adjustedOffsetY,
        colorIndex,
        selectedCombination,
        shapeType
      );
    }

    $fx.features({
      layers: numLayers,
      horizontalOffsetStep: horizontalOffsetStep,
      verticalOffsetStep: verticalOffsetStep,
      gridMode: gridMode,
      colorPalette: selectedKey,
      cellShapes: Array.from(new Set(usedShapes)).join(" - "), // Unique shapes
    });

    sketch.blendMode(sketch.BLEND);
  };

  function drawGrid(
    offsetX,
    offsetY,
    colorIndex,
    colorCombinations,
    shapeType
  ) {
    let selectedCombination = colorCombinations[colorIndex];

    const gridWidth = 375 * scaleFactor; // Scaled grid width
    const gridHeight = gridWidth * (baseHeight / baseWidth); // Aspect ratio based on initial setup
    const gridSizeX = 12;
    const gridSizeY = gridSizeX * (baseHeight / baseWidth);
    const padding = 8 * scaleFactor; // Global padding

    const circleSize = gridWidth / gridSizeX - padding;
    const totalWidth = gridSizeX * circleSize + (gridSizeX - 1) * padding;
    const totalHeight = gridSizeY * circleSize + (gridSizeY - 1) * padding;

    // Centralize the grid based on the new
    const startX = (sketch.width - totalWidth) / 2 + offsetX;
    const startY = (sketch.height - totalHeight) / 2 + offsetY;

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
      case "reverseTriangular":
        drawReverseTriangularGrid(
          startX,
          startY,
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
        const step = calculateStep(i, j, direction);
        const fillColor = getGradientColor(
          selectedCombination.start,
          selectedCombination.end,
          gridSizeX,
          step
        );
        sketch.noStroke();
        sketch.fill(fillColor);
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
    const centerX = sketch.width / 2;
    const centerY = sketch.height / 2;
    for (let i = 0; i < gridSizeX; i++) {
      for (let j = 0; j <= i; j++) {
        const x =
          centerX +
          j * (circleSize + padding) -
          (i * (circleSize + padding)) / 2;
        const y = startY + i * (circleSize + padding);
        const step = calculateStep(i, j, direction);
        const fillColor = getGradientColor(
          selectedCombination.start,
          selectedCombination.end,
          gridSizeX,
          step
        );
        sketch.noStroke();
        sketch.fill(fillColor);
        drawShape(x, y, circleSize, shapeType);
      }
    }
  }

  function drawReverseTriangularGrid(
    startX,
    startY,
    gridSizeX,
    circleSize,
    padding,
    shapeType,
    selectedCombination
  ) {
    const centerX = sketch.width / 2;
    const centerY = sketch.height / 2;
    for (let i = gridSizeX - 1; i >= 0; i--) {
      for (let j = 0; j <= i; j++) {
        const x =
          centerX +
          j * (circleSize + padding) -
          (i * (circleSize + padding)) / 2;
        const y = startY + (gridSizeX - 1 - i) * (circleSize + padding);
        const step = calculateStep(i, j, direction);
        const fillColor = getGradientColor(
          selectedCombination.start,
          selectedCombination.end,
          gridSizeX,
          step
        );
        sketch.noStroke();
        sketch.fill(fillColor);
        drawShape(x, y, circleSize, shapeType);
      }
    }
  }

  function drawShape(x, y, size, shapeType) {
    switch (shapeType) {
      case "circle":
        sketch.ellipse(x, y, size, size);
        break;
      case "half-circle":
        sketch.arc(x, y, size, size, 0, sketch.PI);
        break;
      case "triangle":
        sketch.triangle(
          x,
          y - size / 2,
          x - size / 2,
          y + size / 2,
          x + size / 2,
          y + size / 2
        );
        break;
      case "square":
        sketch.rect(x - size / 2, y - size / 2, size, size);
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
      Monochrome: [
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
    adjustedStep = Math.min(adjustedStep, 1);

    let startRGB = hexToRgb(startColor);
    let endRGB = hexToRgb(endColor);

    // Calculate the color for the current step
    let r = (endRGB.r - startRGB.r) * adjustedStep + startRGB.r;
    let g = (endRGB.g - startRGB.g) * adjustedStep + startRGB.g;
    let b = (endRGB.b - startRGB.b) * adjustedStep + startRGB.b;

    return sketch.color(r, g, b);
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

  function calculateOffset(layerIndex) {
    if (layerIndex === 0) {
      // First layer is centered, no offset
      return { offsetX: 0, offsetY: 0 };
    } else {
      let multiplier = Math.floor($fx.rand() * (maxOffsetMultiplier + 1)); // from 0 to maxOffsetMultiplier
      let offsetX = multiplier * horizontalOffsetStep * Math.cos(offsetAngle);
      let offsetY = multiplier * verticalOffsetStep * Math.sin(offsetAngle);
      return { offsetX, offsetY };
    }
  }

  sketch.windowResized = function () {
    resizeSketchCanvas();
    sketch.redraw();
  };

  function resizeSketchCanvas() {
    const aspectRatio = baseWidth / baseHeight;
    let newWidth = window.innerWidth - 2 * gridPadding;
    let newHeight = window.innerHeight - 2 * gridPadding;

    if (newWidth / newHeight > aspectRatio) {
      newWidth = newHeight * aspectRatio;
    } else {
      newHeight = newWidth / aspectRatio;
    }

    scaleFactor = newWidth / baseWidth;
    sketch.createCanvas(
      newWidth + 2 * gridPadding,
      newHeight + 2 * gridPadding
    );
  }

  sketch.keyPressed = function () {
    if (sketch.key === "A" || sketch.key === "a") {
      moveToCenter();
    } else if (sketch.key === "D" || sketch.key === "d") {
      moveAwayFromCenter();
    } else if (sketch.key === "R" || sketch.key === "r") {
      resetAnimation();
    }
  };

  function moveToCenter() {
    if (animationProgress < 1) {
      animationProgress += animationSpeed;
      animationProgress = Math.min(animationProgress, 1);
      sketch.redraw();
    }
  }

  function moveAwayFromCenter() {
    if (animationProgress > 0) {
      animationProgress -= animationSpeed;
      animationProgress = Math.max(animationProgress, 0);
      sketch.redraw();
    }
  }

  function resetAnimation() {
    animationProgress = 0;
    movingToCenter = true;
    sketch.redraw();
  }

  function randomChoice(array) {
    return array[Math.floor($fx.rand() * array.length)];
  }
});
