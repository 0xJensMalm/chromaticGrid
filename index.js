new p5((sketch) => {
  let offsetAngle;
  let gridMode;
  let direction;
  let scaleFactor;
  let selectedKey;

  let baseWidth = 400;
  let baseHeight = 400;

  const numLayers = 3;
  let gridPadding = 100;

  const gridModes = ["rectangular", "reverseTriangular", "triangular"];
  let maxOffsetMultiplier = 3;
  let gradientStrength = 100;
  const gradientDirections = ["horizontal", "vertical"];
  const shapes = ["circle", "half-circle", "triangle", "square"];

  let animationSpeed = 0.02;
  let animationProgress = 0;
  let movingToCenter = true;
  let initialShapes = [];
  let initialOffsets = [];
  let initialColors = [];
  let initialColorIndices = [];
  let moveToCenterFlag = false;
  let moveAwayFromCenterFlag = false;

  sketch.setup = function () {
    resizeSketchCanvas();
    let canvas = sketch.createCanvas(sketch.width, sketch.height);
    canvas.id("myCanvas");
    sketch.pixelDensity(10);
    sketch.noLoop();
    offsetAngle = sketch.PI / 4;
    direction =
      $fx.rand() > 0.5 ? gradientDirections[0] : gradientDirections[1];

    horizontalOffsetStep = randomChoice([6, 12, 24]);
    verticalOffsetStep = randomChoice([10, 20, 30, 40, 50, 60]);

    const colorCombinations = getColorCombinations();
    const selectedCombinationObj = weightedRandomChoice(colorCombinations);
    selectedKey = selectedCombinationObj.name;
    let selectedCombination = selectedCombinationObj.colors;

    colorIndex = Math.floor($fx.rand() * selectedCombination.length);
    gridMode = randomChoice(gridModes);

    $fx.features({
      layers: numLayers,
      horizontalOffsetStep: horizontalOffsetStep,
      verticalOffsetStep: verticalOffsetStep,
      gridMode: gridMode,
      colorPalette: selectedKey,
      cellShapes: [],
    });

    for (let i = 0; i < numLayers; i++) {
      const { offsetX, offsetY } = calculateOffset(i);
      let shapeType = randomChoice(shapes);
      initialShapes.push(shapeType);
      initialOffsets.push({ offsetX, offsetY });
      initialColors.push(selectedCombination);
      initialColorIndices.push(
        Math.floor($fx.rand() * selectedCombination.length)
      );
    }

    sketch.loop();
  };

  sketch.draw = function () {
    if (moveToCenterFlag) {
      moveToCenter();
    }
    if (moveAwayFromCenterFlag) {
      moveAwayFromCenter();
    }
    renderToCanvas(sketch, sketch.width, sketch.height, scaleFactor);
  };

  function renderToCanvas(p, width, height, scale, paddingScale = 1) {
    p.background(20);
    p.blendMode(p.ADD);

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
        p,
        adjustedOffsetX,
        adjustedOffsetY,
        colorIndex,
        selectedCombination,
        shapeType,
        width,
        height,
        scale,
        paddingScale
      );
    }

    $fx.features({
      layers: numLayers,
      horizontalOffsetStep: horizontalOffsetStep,
      verticalOffsetStep: verticalOffsetStep,
      gridMode: gridMode,
      colorPalette: selectedKey,
      cellShapes: Array.from(new Set(usedShapes)).join(" - "),
    });

    p.blendMode(p.BLEND);
  }

  function drawGrid(
    p,
    offsetX,
    offsetY,
    colorIndex,
    colorCombinations,
    shapeType,
    width,
    height,
    scale
  ) {
    let selectedCombination = colorCombinations[colorIndex];

    const gridWidth = 375 * scale;
    const gridHeight = gridWidth * (baseHeight / baseWidth);
    const gridSizeX = 12;
    const gridSizeY = gridSizeX * (baseHeight / baseWidth);
    const padding = 8 * scale;

    const circleSize = gridWidth / gridSizeX - padding;
    const totalWidth = gridSizeX * circleSize + (gridSizeX - 1) * padding;
    const totalHeight = gridSizeY * circleSize + (gridSizeY - 1) * padding;

    const startX = (width - totalWidth) / 2 + offsetX;
    const startY = (height - totalHeight) / 2 + offsetY;

    switch (gridMode) {
      case "rectangular":
        drawRectangularGrid(
          p,
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
          p,
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
          p,
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
    p,
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
        p.noStroke();
        p.fill(fillColor);
        drawShape(p, x, y, circleSize, shapeType);
      }
    }
  }

  function drawTriangularGrid(
    p,
    startX,
    startY,
    gridSizeX,
    circleSize,
    padding,
    shapeType,
    selectedCombination
  ) {
    const centerX = p.width / 2;
    const centerY = p.height / 2;
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
        p.noStroke();
        p.fill(fillColor);
        drawShape(p, x, y, circleSize, shapeType);
      }
    }
  }

  function drawReverseTriangularGrid(
    p,
    startX,
    startY,
    gridSizeX,
    circleSize,
    padding,
    shapeType,
    selectedCombination
  ) {
    const centerX = p.width / 2;
    const centerY = p.height / 2;
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
        p.noStroke();
        p.fill(fillColor);
        drawShape(p, x, y, circleSize, shapeType);
      }
    }
  }

  function drawShape(p, x, y, size, shapeType) {
    switch (shapeType) {
      case "circle":
        p.ellipse(x, y, size, size);
        break;
      case "half-circle":
        p.arc(x, y, size, size, 0, p.PI);
        break;
      case "triangle":
        p.triangle(
          x,
          y - size / 2,
          x - size / 2,
          y + size / 2,
          x + size / 2,
          y + size / 2
        );
        break;
      case "square":
        p.rect(x - size / 2, y - size / 2, size, size);
        break;
    }
  }

  function getColorCombinations() {
    return [
      {
        name: "Capella",
        weight: 0.15,
        colors: [
          { start: "#FF0000", end: "#E00000" },
          { start: "#FFFF00", end: "#E0E000" },
          { start: "#FFA500", end: "#E09500" },
          { start: "#00FF00", end: "#00E000" },
          { start: "#FF69B4", end: "#E06090" },
          { start: "#00FFFF", end: "#00E0E0" },
        ],
      },
      {
        name: "Byzantium",
        weight: 0.15,
        colors: [
          { start: "#0000FF", end: "#0000E0" },
          { start: "#800080", end: "#700070" },
          { start: "#0000FF", end: "#0000E0" },
          { start: "#FFD700", end: "#E0C300" },
          { start: "#FF4500", end: "#E03E00" },
          { start: "#BA55D3", end: "#A050C0" },
        ],
      },
      {
        name: "Istanbul",
        weight: 0.15,
        colors: [
          { start: "#00FF00", end: "#00E000" },
          { start: "#FF00FF", end: "#E000E0" },
          { start: "#FFFF00", end: "#E0E000" },
          { start: "#1E90FF", end: "#1A80E0" },
          { start: "#32CD32", end: "#2EB82E" },
          { start: "#FF1493", end: "#E01283" },
        ],
      },
      {
        name: "Berlin",
        weight: 0.15,
        colors: [
          { start: "#6A0DAD", end: "#D8BFD8" },
          { start: "#FF6347", end: "#FFA07A" },
          { start: "#40E0D0", end: "#AFEEEE" },
        ],
      },
      {
        name: "Paris",
        weight: 0.15,
        colors: [
          { start: "#3CB371", end: "#8FBC8F" },
          { start: "#FFD700", end: "#FFFACD" },
          { start: "#00CED1", end: "#E0FFFF" },
        ],
      },
      {
        name: "Shanghai",
        weight: 0.15,
        colors: [
          { start: "#FF4500", end: "#E03E00" },
          { start: "#8A2BE2", end: "#7A1BE2" },
          { start: "#00FA9A", end: "#00E89A" },
          { start: "#7FFF00", end: "#6FEF00" },
          { start: "#D2691E", end: "#C2691E" },
          { start: "#DC143C", end: "#CC143C" },
        ],
      },
      {
        name: "London",
        weight: 0.15,
        colors: [
          { start: "#FF8C00", end: "#E08C00" },
          { start: "#00BFFF", end: "#00AFFF" },
          { start: "#8B0000", end: "#7B0000" },
          { start: "#ADFF2F", end: "#9DFF2F" },
          { start: "#FF69B4", end: "#E060A4" },
          { start: "#4B0082", end: "#3B0072" },
        ],
      },
      {
        name: "Altair",
        weight: 1,
        colors: [
          { start: "#ec1c24", end: "#04a4ec" },
          { start: "#fcf404", end: "#24b44c" },
          { start: "#fcf404", end: "#28287c" },
          { start: "#fc7c24", end: "#24b44c" },
        ],
      },
      {
        name: "Monochrome White",
        weight: 0.02,
        colors: [{ start: "#FFFFFF", end: "#FFFFFF" }],
      },
      {
        name: "Monochrome Azure",
        weight: 0.02,
        colors: [{ start: "#1c1e8a", end: "#1c1e8a" }],
      },
    ];
  }

  function weightedRandomChoice(array) {
    let totalWeight = array.reduce((sum, item) => sum + item.weight, 0);
    let randomNum = $fx.rand() * totalWeight;

    for (let i = 0; i < array.length; i++) {
      if (randomNum < array[i].weight) {
        return array[i];
      }
      randomNum -= array[i].weight;
    }
    return array[array.length - 1];
  }

  function getGradientColor(startColor, endColor, totalSteps, step) {
    let adjustedStep = step / (totalSteps * (gradientStrength / 100));
    adjustedStep = Math.min(adjustedStep, 1);

    let startRGB = hexToRgb(startColor);
    let endRGB = hexToRgb(endColor);

    let r = (endRGB.r - startRGB.r) * adjustedStep + startRGB.r;
    let g = (endRGB.g - startRGB.g) * adjustedStep + startRGB.g;
    let b = (endRGB.b - startRGB.b) * adjustedStep + startRGB.b;

    return sketch.color(r, g, b);
  }

  function hexToRgb(hex) {
    let r = 0,
      g = 0,
      b = 0;
    if (hex.length == 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length == 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return { r, g, b };
  }

  function calculateStep(i, j, direction) {
    switch (direction) {
      case "horizontal":
        return i;
      case "vertical":
        return j;
      case "diagonal":
        return i + j;
      default:
        return 0;
    }
  }

  function calculateOffset(layerIndex) {
    if (layerIndex === 0) {
      return { offsetX: 0, offsetY: 0 };
    } else {
      let multiplier = Math.floor($fx.rand() * (maxOffsetMultiplier + 1));
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
      moveToCenterFlag = true;
      moveAwayFromCenterFlag = false;
    } else if (sketch.key === "D" || sketch.key === "d") {
      moveToCenterFlag = false;
      moveAwayFromCenterFlag = true;
    }
  };

  sketch.keyReleased = function () {
    if (sketch.key === "A" || sketch.key === "a") {
      moveToCenterFlag = false;
    } else if (sketch.key === "D" || sketch.key === "d") {
      moveAwayFromCenterFlag = false;
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

  function randomChoice(array) {
    return array[Math.floor($fx.rand() * array.length)];
  }
});
