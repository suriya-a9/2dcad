import { createSlice } from "@reduxjs/toolkit";
import { shapes } from "konva/lib/Shape";
import { generateSpiralPath } from "../../components/Panel/Panel"
import { act } from "react";


const toolSlice = createSlice({
  name: "tool",
  initialState: {
    selectedTool: "Select",
    isStrokeToPathMode: false,
    layers: [{ name: "Layer 1", shapes: [], visible: true }],
    strokeColor: "#000000",
    fillColor: "black",
    selectedLayerIndex: 0,
    selectedShapeId: null,
    bezierOption: "Spiro Path",
    spiroPoints: [],
    bsplinePoints: [],
    shapes: [],
    calligraphyOption: "Marker",
    calligraphyWidth: 5,
    calligraphySettings: {
      Marker: { strokeWidth: 5, smoothing: 0.2 },
      DipPen: { strokeWidth: 3, smoothing: 0.1 },
      Brush: { strokeWidth: 8, smoothing: 0.3 },
      Wiggly: { strokeWidth: 4, smoothing: 0.5, wigglyEffect: true },
      Tracing: { strokeWidth: 2, smoothing: 0.05 },
      Splotchy: { strokeWidth: 6, smoothing: 0.4 },
    },
    scale: 1.0,
    paraxialPoints: [],
    selectedNodePoints: [],
    zoomLevel: 1,
    clipboard: null,
    clipboadType: null,
    history: [],
    width: parseInt(localStorage.getItem("canvasWidth"), 10) || 800,
    height: parseInt(localStorage.getItem("canvasHeight"), 10) || 600,
    future: [],
    drawingPath: [],
    selectedShapeIds: [],
    undoHistory: [],
    sprayWidth: 100,
    sprayAmount: 1,
    sprayScale: 1,
    sprayScatter: 1,
    sprayFocus: 1,
    sprayMode: "random",
    turns: 5,
    divergence: 1,
    innerRadius: 10,
    controlPoints: [],
    selectedFontSize: 16,
    selectedFontFamily: "Arial",
    selectedAlignment: "left",
    selectedFontStyle: "normal",
    calligraphyThinning: 0,
    calligraphyMass: 0,
    pencilSmoothing: 0,
    pencilOption: "None",
    pencilMode: "Bezier Path",
    pencilScale: 1,
    showInitialScreen: JSON.parse(localStorage.getItem("showEveryTime")) ?? true,
    shapeBuilderMode: null,
    sprayEraserMode: false,
    calligraphyAngle: 0,
    calligraphyFixation: 0,
    calligraphyCaps: 0,
    eraserMode: "delete",
    eraserWidth: 10,
    eraserThinning: 0,
    eraserCaps: 0,
    eraserTremor: 0,
    eraserMass: 0,
    pickedColor: null,
    dropperMode: "pick",
    dropperTarget: "fill",
    assignAverage: false,
    altInverse: false,
    gradientType: "linear",
    pressureEnabled: false,
    pressureMin: 0,
    pressureMax: 1,
    brushCaps: "round",
    measurementFontSize: 16,
    measurementPrecision: 2,
    measurementScale: 100,
    measurementUnit: "px",
    measurementLines: [],
    measurementDraft: null,
    showMeasureBetween: false,
    ignoreFirstLast: false,
    reverseMeasure: false,
    toGuides: false,
    phantomMeasure: false,
    markDimension: false,
    measurementOffset: 16,
    convertToItem: false,
    replaceShapes: true,
    paintBucketFillBy: "visible colors",
    paintBucketThreshold: 20,
    paintBucketGrowSink: 0,
    paintBucketCloseGaps: "none",
    meshMode: "mesh-gradient",
    meshRows: 4,
    meshCols: 4,
    gradientTarget: "fill",
    zoomLevel: 1,
    pages: [
      {
        id: 1,
        name: "Page 1",
        layers: [{ name: "Layer 1", shapes: [], visible: true }],
        selectedLayerIndex: 0,
        width: 800,
        height: 600,
      }
    ],
    currentPageIndex: 0,
    pageMargin: { top: 0, right: 40, bottom: 40, left: 40 },
    connectorMode: "ignore",
    connectorOrthogonal: true,
    connectorCurvature: 0,
    connectorSpacing: 0,
    connectorLength: 0,
    connectorLineStyle: "solid",
    connectorNoOverlap: false,
    tweakMode: "move",
    tweakRadius: 40,
    tweakForce: 1,
    tweakFidelity: 50,
    blockProgression: "normal",
  },

  reducers: {

    clearSelectedNodePoints: (state) => {
      const layer = state.layers[state.selectedLayerIndex];
      if (!layer) return;

      const nodesByShape = {};
      state.selectedNodePoints.forEach(({ shapeId, index }) => {
        if (!nodesByShape[shapeId]) nodesByShape[shapeId] = [];
        nodesByShape[shapeId].push(index);
      });

      Object.entries(nodesByShape).forEach(([shapeId, indices]) => {
        const shape = layer.shapes.find(s => s.id === shapeId);
        if (shape && Array.isArray(shape.points)) {

          indices.sort((a, b) => b - a).forEach(idx => {
            if (idx >= 0 && idx < shape.points.length) {
              shape.points.splice(idx, 1);
            }
          });
          shape.points = [...shape.points];

          if (state.selectedShapeId === shapeId) {
            state.controlPoints = [...shape.points];
          }
        }
      });

      layer.shapes = [...layer.shapes];
      state.selectedNodePoints = [];
    },

    separateSelectedPaths: (state) => {
      console.log("Separate Selected Paths action triggered", state);

    },
    setScale: (state, action) => {
      state.scale = action.payload;
    },
    setFontStyle: (state, action) => {
      state.selectedFontStyle = action.payload;
    },
    joinSelectedEndNodesWithSegment: (state) => {
      if (state.selectedNodePoints.length !== 2) {
        console.error("You must select exactly two nodes to join them.");
        return;
      }

      const [nodeA, nodeB] = state.selectedNodePoints;
      const layer = state.layers[state.selectedLayerIndex];
      if (!layer) return;

      const shapeA = layer.shapes.find(s => s.id === nodeA.shapeId);
      const shapeB = layer.shapes.find(s => s.id === nodeB.shapeId);

      if (!shapeA || !shapeB) {
        console.error("One or both shapes not found.");
        return;
      }


      const normPoints = pts =>
        pts.map(pt =>
          Array.isArray(pt)
            ? { x: pt[0], y: pt[1] }
            : { x: pt.x, y: pt.y }
        );


      if (nodeA.shapeId === nodeB.shapeId) {
        const points = normPoints(shapeA.points);


        points.push({ x: points[nodeB.index].x, y: points[nodeB.index].y });
        shapeA.points = points;
        state.controlPoints = [...points];
        state.selectedNodePoints = [];
        return;
      }


      const pointsA = normPoints(shapeA.points);
      const pointsB = normPoints(shapeB.points);


      const reorderedA = [
        ...pointsA.slice(nodeA.index),
        ...pointsA.slice(0, nodeA.index + 1),
      ];

      const reorderedB = [
        ...pointsB.slice(nodeB.index),
        ...pointsB.slice(0, nodeB.index + 1),
      ];


      const mergedPoints = [
        ...pointsA,
        { x: pointsB[nodeB.index].x, y: pointsB[nodeB.index].y },
        ...pointsB.slice(nodeB.index + 1),
      ];


      shapeA.points = mergedPoints;

      layer.shapes = layer.shapes.filter(s => s.id !== shapeB.id);

      state.controlPoints = [...mergedPoints];
      state.selectedNodePoints = [];
    },
    setFontSize: (state, action) => {
      state.selectedFontSize = action.payload;
    },
    setFontFamily: (state, action) => {
      state.selectedFontFamily = action.payload;
    },
    setAlignment: (state, action) => {
      state.selectedAlignment = action.payload;
    },
    setBezierOption: (state, action) => {
      state.bezierOption = action.payload;
    },
    addSpiroPoint: (state, action) => {
      state.spiroPoints.push(action.payload);
    },
    addBSplinePoint: (state, action) => {
      const point = action.payload;
      if (point && typeof point.x === "number" && typeof point.y === "number") {
        state.bsplinePoints.push(point);
      } else {
        console.error("Invalid point format in reducer:", point);
      }
    },
    clearBSplinePoints: (state) => {
      state.bsplinePoints = [];
    },
    addControlPoint: (state, action) => {
      state.controlPoints.push(action.payload);
      console.log("Updated controlPoints in Redux:", [...state.controlPoints]);
    },
    setControlPoints: (state, action) => {
      console.log("Setting control points in Redux:", action.payload);
      state.controlPoints = action.payload;
    },
    clearControlPoints: (state) => {
      state.controlPoints = [];
    },
    addParaxialPoint: (state, action) => {
      state.paraxialPoints.push(action.payload);
    },
    updateParaxialPoint: (state, action) => {
      const { index, point } = action.payload;
      state.paraxialPoints[index] = point;
    },
    clearParaxialPoints: (state) => {
      state.paraxialPoints = [];
    },
    clearPoints: (state) => {
      state.spiroPoints = [];
      state.bsplinePoints = [];
      state.paraxialPoints = [];
    },
    clearSpiroPoints: (state) => {
      state.spiroPoints = [];
    },


    setSelectedTool: (state, action) => {
      state.selectedTool = action.payload;
    },

    selecteAllShapes: (state) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      if (selectedLayer) {
        state.selectedShapeIds = selectedLayer.shapes.map((shape) => shape.id);
      }
    },
    deselectAllShapes: (state) => {
      state.selectedShapeIds = [];
    },
    updateSelection: (state, action) => {
      state.selectedShapeIds = action.payload;
    },

    addShape: (state, action) => {
      if (state.history.length === 0) {
        state.history.push(JSON.parse(JSON.stringify(state)));
      }
      const newShape = action.payload;

      if (newShape.type === "Rectangle") {
        newShape.points = [
          { x: newShape.x, y: newShape.y },
          { x: newShape.x + newShape.width, y: newShape.y },
          { x: newShape.x + newShape.width, y: newShape.y + newShape.height },
          { x: newShape.x, y: newShape.y + newShape.height },
        ];
      } else if (newShape.type === "Circle") {
        const { x, y, radius } = newShape;
        newShape.points = [
          { x: x, y: y - radius },
        ];
      } else if (newShape.type === "Star") {
        const { x, y, innerRadius, outerRadius, numPoints } = newShape;
        newShape.points = [];
        for (let i = 0; i < numPoints * 2; i++) {
          const angle = (Math.PI * i) / numPoints;
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          newShape.points.push({
            x: x + radius * Math.cos(angle),
            y: y + radius * Math.sin(angle),
          });
        }
      }

      const selectedLayer = state.layers[state.selectedLayerIndex];
      const shapeType = newShape.type.toLowerCase();
      const shapeCount = selectedLayer.shapes.filter(
        (shape) => shape.type.toLowerCase() === shapeType
      ).length;

      newShape.name = `${shapeType} ${shapeCount + 1}`;
      selectedLayer.shapes.push(newShape);

      state.undoHistory.push({
        action: `Create ${newShape.type} ${shapeCount + 1}`,
      });
      state.history.push(JSON.parse(JSON.stringify(state)));
      state.future = [];
      console.log("New shape added with name:", newShape.name);
    },
    addShapes: (state, action) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      selectedLayer.shapes.push(...action.payload);
    },
    setZoomLevel: (state, action) => {
      state.zoomLevel = action.payload;
    },
    zoomIn: (state) => { state.zoomLevel = Math.min(state.zoomLevel * 1.25, 16); },
    zoomOut: (state) => { state.zoomLevel = Math.max(state.zoomLevel / 1.25, 0.05); },
    copy: (state) => {
      console.log("copy clikced");
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const selectedShapes = selectedLayer.shapes.filter(shape =>
        state.selectedShapeIds.includes(shape.id)
      );

      state.clipboard = selectedShapes.map(shape => ({
        ...JSON.parse(JSON.stringify(shape)),
        id: `shape-${Date.now()}-${Math.random()}`
      }));
      console.log("state clip", state.clipboard);
      state.clipboadType = "copy";
    },

    cut: (state) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const selectedShapes = selectedLayer.shapes.filter(shape =>
        state.selectedShapeIds.includes(shape.id)
      );

      state.clipboard = selectedShapes;
      state.clipboadType = "cut";

      selectedLayer.shapes = selectedLayer.shapes.filter(
        shape => !state.selectedShapeIds.includes(shape.id)
      );
      state.selectedShapeIds = [];
      state.selectedShapeId = null;
      state.history.push(JSON.parse(JSON.stringify(state)));
      state.future = [];
    },

    paste: (state) => {
      const targetLayer = state.layers[state.selectedLayerIndex];
      if (state.clipboadType === "copy" && Array.isArray(state.clipboard)) {
        let counter = 0;
        function assignNewIds(shape) {
          counter += 1;
          const newId = `shape-${Date.now()}-${Math.random()}-${counter}`;
          const newShape = {
            ...JSON.parse(JSON.stringify(shape)),
            id: newId,
            x: (shape.x || 0) + 20,
            y: (shape.y || 0) + 20,
          };

          if (Array.isArray(newShape.shapes)) {
            newShape.shapes = newShape.shapes.map(assignNewIds);
          }

          if (newShape.groupId) {
            newShape.groupId = undefined;
          }
          return newShape;
        }
        const pastedShapes = state.clipboard.map(assignNewIds);
        targetLayer.shapes.push(...pastedShapes);
        state.selectedShapeIds = pastedShapes.map(s => s.id);
        state.selectedShapeId = pastedShapes.length === 1 ? pastedShapes[0].id : null;
      } else if (state.clipboadType === "cut" && Array.isArray(state.clipboard)) {
        targetLayer.shapes.push(...state.clipboard);
        state.selectedShapeIds = state.clipboard.map(s => s.id);
        state.selectedShapeId = state.clipboard.length === 1 ? state.clipboard[0].id : null;

        state.clipboard = null;
        state.clipboadType = null;
      }
      state.history.push(JSON.parse(JSON.stringify(state)));
      state.future = [];
    },
    undo: (state) => {
      if (state.history.length > 0) {
        const lastState = state.history.pop();
        state.future.push({
          layers: JSON.parse(JSON.stringify(state.layers)),
          drawingPath: [...state.drawingPath],
          strokeColor: state.strokeColor,
          fillColor: state.fillColor,
          selectedShapeId: state.selectedShapeId,
        });

        state.layers = lastState.layers;
        state.drawingPath = lastState.drawingPath;
        state.strokeColor = lastState.strokeColor;
        state.fillColor = lastState.fillColor;
        state.selectedShapeId = lastState.selectedShapeId;
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        const nextState = state.future.pop();
        state.history.push({
          layers: JSON.parse(JSON.stringify(state.layers)),
          drawingPath: [...state.drawingPath],
          strokeColor: state.strokeColor,
          fillColor: state.fillColor,
          selectedShapeId: state.selectedShapeId,
        });

        state.layers = nextState.layers;
        state.drawingPath = nextState.drawingPath;
        state.strokeColor = nextState.strokeColor;
        state.fillColor = nextState.fillColor;
        state.selectedShapeId = nextState.selectedShapeId;
      }
    },
    setStrokeColor: (state, action) => {
      state.strokeColor = action.payload || "#000000";
    },
    setFillColor: (state, action) => {
      state.fillColor = action.payload || "#000000";
    },
    removeShape: (state, action) => {
      const shapeId = action.payload;
      state.shapes = state.shapes.filter((shape) => shape.id !== shapeId);
    },

    setFillColorForSelectedShape: (state, action) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const selectedShape = selectedLayer.shapes.find(
        (shape) => shape.id === state.selectedShapeId
      );
      if (selectedShape) {
        if (selectedShape.type === "Bezier") {
          selectedShape.fill = action.payload || "transparent";
        } else {
          selectedShape.fill = action.payload || "#000000";
        }
      }
    },

    setStrokeColorForSelectedShape: (state, action) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const selectedShape = selectedLayer.shapes.find(
        (shape) => shape.id === state.selectedShapeId
      );
      if (selectedShape) {
        selectedShape.stroke = action.payload || "#000000";
      }
    },

    setStrokeWidthForSelectedShape: (state, action) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const selectedShape = selectedLayer.shapes.find(
        (shape) => shape.id === state.selectedShapeId
      );
      if (selectedShape) {
        selectedShape.strokeWidth = action.payload || 1;
      }
    },











    setStrokeWidthForSelectedShape: (state, action) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const selectedShape = selectedLayer.shapes.find(
        (shape) => shape.id === state.selectedShapeId
      );
      if (selectedShape) {
        selectedShape.strokeWidth = action.payload || 1;
      }
    },

    setStrokeStyleForSelectedShape: (state, action) => {
      const { selectedShapeId, layers } = state;
      if (selectedShapeId) {
        for (const layer of layers) {
          const shape = layer.shapes.find((shape) => shape.id === selectedShapeId);
          if (shape) {
            shape.strokeStyle = action.payload;
            break;
          }
        }
      }
    },

    clearSelection: (state) => {
      console.log("Clearing selection.");
      state.selectedShapeId = null;
      state.selectedShapeIds = [];
      state.controlPoints = [];
    },
    addPathPoint: (state, action) => {
      if (state.selectedTool === "NodeTool") {
        state.drawingPath.push(action.payload);
      }
    },
    finalizePath: (state) => {
      if (state.controlPoints.length > 2) {

        const selectedLayer = state.layers[state.selectedLayerIndex];
        const bezierCount = selectedLayer.shapes.filter(
          (shape) => shape.type === "Bezier"
        ).length;

        const newShape = {
          id: `bezier-${Date.now()}`,
          type: "Bezier",
          name: `Bezier ${bezierCount + 1}`,
          points: [...state.controlPoints],
          strokeColor: state.strokeColor,
          fillColor: state.fillColor,
          closed: true,
        };

        if (selectedLayer) {
          selectedLayer.shapes.push(newShape);
          console.log("Bézier shape added to layer:", selectedLayer.name, newShape);
        } else {
          console.error("No selected layer found to add the Bézier shape.");
        }


        state.controlPoints = [];
      }
    },
    addText: (state, action) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      selectedLayer.shapes.push({
        id: `text-${Date.now()}`,
        type: "Text",
        x: action.payload.x,
        y: action.payload.y,
        text: action.payload.text,
        fontSize: action.payload.fontSize || 16,
        fill: action.payload.fill || "#000000",
      });
    },
    updateText: (state, action) => {
      const { id, text, x, y, fontSize, fill } = action.payload;
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const shape = selectedLayer.shapes.find((s) => s.id === id);

      if (shape) {
        if (text !== undefined) shape.text = text;
        if (x !== undefined) shape.x = x;
        if (y !== undefined) shape.y = y;
        if (fontSize !== undefined) shape.fontSize = fontSize;
        if (fill !== undefined) shape.fill = fill;
      }
    },
    updateShapePosition: (state, action) => {
      const { id, ...updates } = action.payload;
      const selectedLayer = state.layers[state.selectedLayerIndex];
      if (selectedLayer) {
        const shape = selectedLayer.shapes.find((shape) => shape.id === id);
        if (shape) {
          Object.assign(shape, updates);
          console.log("Updated Shape:", shape);
        } else {
          console.error("Shape not found in the current layer.");
        }
      } else {
        console.error("No selected layer found.");
      }
    },
    raiseShapeToTop: (state, action) => {
      const shapeId = action.payload;
      const selectedLayer = state.layers[state.selectedLayerIndex];
      if (selectedLayer) {
        const shapeIndex = selectedLayer.shapes.findIndex((shape) => shape.id === shapeId);
        if (shapeIndex > -1) {
          const [shape] = selectedLayer.shapes.splice(shapeIndex, 1);
          selectedLayer.shapes.push(shape);
          console.log("Shape raised to top:", shape);
        } else {
          console.error("Shape not found in the current layer.");
        }
      } else {
        console.error("No selected layer found.");
      }
    },

    lowerShape: (state, action) => {
      const shapeId = action.payload;
      const selectedLayer = state.layers[state.selectedLayerIndex];
      if (selectedLayer) {
        const shapeIndex = selectedLayer.shapes.findIndex((shape) => shape.id === shapeId);
        if (shapeIndex > -1) {
          const [shape] = selectedLayer.shapes.splice(shapeIndex, 1);
          selectedLayer.shapes.unshift(shape);
          console.log("Shape lowered to bottom:", shape);
        } else {
          console.error("Shape not found in the current layer.");
        }
      } else {
        console.error("No selected layer found.");
      }
    },
    updateNodePosition: (state, action) => {
      const { shapeId, nodeIndex, newPosition } = action.payload;

      const shape = state.layers[state.selectedLayerIndex].shapes.find(
        (shape) => shape.id === shapeId
      );

      if (shape && shape.type === "Circle") {
        if (nodeIndex === 0) {

          const center = { x: shape.x, y: shape.y };
          const newRadius = Math.sqrt(
            Math.pow(newPosition.x - center.x, 2) + Math.pow(newPosition.y - center.y, 2)
          );
          shape.radius = newRadius;


          shape.points = [
            { x: shape.x, y: shape.y - shape.radius },
          ];

          console.log("Updated circle radius:", newRadius);
          console.log("Updated circle points:", shape.points);
        }
      } else if (shape && Array.isArray(shape.points)) {

        shape.points[nodeIndex] = newPosition;


        if (shape.type === "Rectangle") {
          const [topLeft, topRight, bottomRight, bottomLeft] = shape.points;

          shape.x = topLeft.x;
          shape.y = topLeft.y;
          shape.width = topRight.x - topLeft.x;
          shape.height = bottomLeft.y - topLeft.y;

          console.log("Updated rectangle dimensions:", {
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
          });
        }


        state.controlPoints = [...shape.points];
        console.log("Updated control points:", state.controlPoints);
      }
    },
    updateToolState: (state, action) => {
      const { fillColor, strokeColor } = action.payload;
      if (fillColor !== undefined) state.fillColor = fillColor;
      if (strokeColor !== undefined) state.strokeColor = strokeColor;
    },
    addLayer: (state) => {
      const newLayerName = `Layer ${state.layers.length + 1}`;
      state.layers.push({ name: newLayerName, shapes: [], visible: true });

      state.history.push(JSON.parse(JSON.stringify(state)));
      state.future = [];
    },
    renameLayer: (state, action) => {
      const { index, newName } = action.payload;
      if (state.layers[index]) {
        state.layers[index].name = newName;
      }
    },
    duplicateLayer: (state) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      if (selectedLayer) {
        const newLayer = {
          ...selectedLayer,
          name: `${selectedLayer.name} Copy`,
        };
        state.layers.splice(state.selectedLayerIndex + 1, 0, newLayer);
      }

      state.history.push(JSON.parse(JSON.stringify(state)));
      state.future = [];
    },
    clearLayerShapes: (state) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      if (selectedLayer) {
        selectedLayer.shapes = [];
      }

      state.history.push(JSON.parse(JSON.stringify(state)));
      state.future = [];
    },
    toggleLayerVisibility: (state) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      if (selectLayer) {
        selectedLayer.visible = !selectedLayer.visible;
      }
    },
    deleteLayer: (state) => {
      if (state.layers.length > 1) {
        state.layers.splice(state.selectedLayerIndex, 1);
        state.selectedLayerIndex = Math.max(0, state.selectedLayerIndex - 1);

        state.history.push(JSON.parse(JSON.stringify(state)));
        state.future = [];
      }
    },
    moveLayer: (state, action) => {
      const { draggedIndex, targetIndex } = action.payload;
      const layers = [...state.layers];
      const [movedLayer] = layers.splice(draggedIndex, 1);
      layers.splice(targetIndex, 0, movedLayer);
      state.layers = layers;

      state.history.push(JSON.parse(JSON.stringify(state)));
      state.future = [];
    },
    selectLayer: (state, action) => {
      state.selectedLayerIndex = action.payload;
    },
    selectShape: (state, action) => {
      const shapeId = action.payload;

      console.log("Shape ID to select:", shapeId);
      console.log("Current selectedShapeId:", state.selectedShapeId);
      console.log("Current selectedShapeIds:", state.selectedShapeIds);


      const isAlreadySelected = state.selectedShapeIds.includes(shapeId);

      if (isAlreadySelected) {

        state.selectedShapeIds = state.selectedShapeIds.filter((id) => id !== shapeId);
        state.selectedShapeId = null;
      } else {

        state.selectedShapeIds.push(shapeId);
        state.selectedShapeId = shapeId;
      }

      console.log("Updated selectedShapeId:", state.selectedShapeId);
      console.log("Updated selectedShapeIds:", state.selectedShapeIds);
    },
    duplicateShape: (state) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const shapeToDuplicate = selectedLayer.shapes.find(
        (shape) => shape.id === state.selectedShapeId
      );

      if (shapeToDuplicate) {
        const shapeType = shapeToDuplicate.type.toLowerCase();
        const shapeCount = selectedLayer.shapes.filter(
          (shape) => shape.type.toLowerCase() === shapeType
        ).length;

        const newShape = {
          ...shapeToDuplicate,
          id: `shape-${Date.now()}`,
          x: (shapeToDuplicate.x || 0) + 10,
          y: (shapeToDuplicate.y || 0) + 10,
          name: `${shapeType} ${shapeCount + 1}`,
        };
        selectedLayer.shapes.push(newShape);
      }

      state.history.push(JSON.parse(JSON.stringify(state)));
      state.future = [];
    },
    groupShapes: (state) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const selectedShapeIds = state.selectedShapeIds;

      if (selectedShapeIds.length > 0) {

        const groupCount = selectedLayer.shapes.filter(
          (shape) => shape.type === "Group"
        ).length;


        const groupName = `Group${groupCount + 1}`;


        const groupId = `group-${Date.now()}`;
        const groupShape = {
          id: groupId,
          type: "Group",
          name: groupName,
          shapes: selectedShapeIds.map((shapeId) =>
            selectedLayer.shapes.find((shape) => shape.id === shapeId)
          ).filter(shape => shape),
        };


        selectedLayer.shapes.push(groupShape);


        selectedShapeIds.forEach((shapeId) => {
          const shape = selectedLayer.shapes.find((s) => s.id === shapeId);
          if (shape) {
            shape.groupId = groupId;
          }
        });


        state.selectedShapeIds = [];
      }
    },
    ungroupShapes: (state, action) => {
      const { ids } = action.payload;
      const selectedLayer = state.layers[state.selectedLayerIndex];


      ids.forEach(groupId => {
        const groupShapeIndex = selectedLayer.shapes.findIndex(
          (shape) => shape.id === groupId && shape.type === "Group"
        );

        if (groupShapeIndex !== -1) {
          const groupShape = selectedLayer.shapes[groupShapeIndex];


          selectedLayer.shapes.splice(groupShapeIndex, 1);


          groupShape.shapes.forEach((shape) => {
            const child = { ...shape };
            delete child.groupId;
            selectedLayer.shapes.push(child);
          });
        }
      });

      state.selectedShapeIds = [];
    },
    deleteShape: (state, action) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const shapeId = action.payload;
      const shapeIndex = selectedLayer.shapes.findIndex(
        (shape) => shape.id === shapeId
      );
      if (shapeIndex !== -1) {
        selectedLayer.shapes.splice(shapeIndex, 1);
        if (state.selectedShapeId === shapeId) {
          state.selectedShapeId = null;
        }
        state.selectedShapeIds = state.selectedShapeIds.filter(id => id !== shapeId);

        state.history.push(JSON.parse(JSON.stringify(state)));
        state.future = [];
      }
    },
    moveLayerUp: (state) => {
      if (state.selectedLayerIndex > 0) {
        const layers = [...state.layers];
        const temp = layers[state.selectedLayerIndex];
        layers[state.selectedLayerIndex] = layers[state.selectedLayerIndex - 1];
        layers[state.selectedLayerIndex - 1] = temp;

        const selectedLayer = layers[state.selectedLayerIndex];
        const selectedShapes = [...selectedLayer.shapes];
        layers[state.selectedLayerIndex].shapes = selectedShapes;

        state.layers = layers;
        state.selectedLayerIndex -= 1;

        state.history.push(JSON.parse(JSON.stringify(state)));
        state.future = [];
      }
    },
    moveLayerDown: (state) => {
      if (state.selectedLayerIndex < state.layers.length - 1) {
        const layers = [...state.layers];
        const temp = layers[state.selectedLayerIndex];
        layers[state.selectedLayerIndex] = layers[state.selectedLayerIndex + 1];
        layers[state.selectedLayerIndex + 1] = temp;

        const selectedLayer = layers[state.selectedLayerIndex];
        const selectedShapes = [...selectedLayer.shapes];
        layers[state.selectedLayerIndex].shapes = selectedShapes;

        state.layers = layers;
        state.selectedLayerIndex += 1;

        state.history.push(JSON.parse(JSON.stringify(state)));
        state.future = [];
      }
    },
    moveShapeUp: (state) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const shapeIndex = selectedLayer.shapes.findIndex(
        (shape) => shape.id === state.selectedShapeId
      );

      if (shapeIndex > 0) {
        const temp = selectedLayer.shapes[shapeIndex];
        selectedLayer.shapes[shapeIndex] = selectedLayer.shapes[shapeIndex - 1];
        selectedLayer.shapes[shapeIndex - 1] = temp;

        state.history.push(JSON.parse(JSON.stringify(state)));
        state.future = [];
      }
    },
    moveShapeDown: (state) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const shapeIndex = selectedLayer.shapes.findIndex(
        (shape) => shape.id === state.selectedShapeId
      );

      if (shapeIndex < selectedLayer.shapes.length - 1) {
        const temp = selectedLayer.shapes[shapeIndex];
        selectedLayer.shapes[shapeIndex] = selectedLayer.shapes[shapeIndex + 1];
        selectedLayer.shapes[shapeIndex + 1] = temp;

        state.history.push(JSON.parse(JSON.stringify(state)));
        state.future = [];
      }
    },
    moveShapeToLayer: (state, action) => {
      const { shapeId, targetLayerIndex } = action.payload;
      const sourceLayer = state.layers.find((layer) =>
        layer.shapes.some((shape) => shape.id === shapeId)
      );
      const targetLayer = state.layers[targetLayerIndex];

      if (sourceLayer && targetLayer) {
        const shapeIndex = sourceLayer.shapes.findIndex(
          (shape) => shape.id === shapeId
        );
        const [movedShape] = sourceLayer.shapes.splice(shapeIndex, 1);
        targetLayer.shapes.push(movedShape);

        state.history.push(JSON.parse(JSON.stringify(state)));
        state.future = [];
      }
    },
    createNewPage: (state) => {
      if (!state.pages) state.pages = [];
      const newPageId = Date.now();
      state.pages.push({
        id: newPageId,
        name: `Page ${state.pages.length + 1}`,
        layers: [{ name: "Layer 1", shapes: [], visible: true }],
        selectedLayerIndex: 0,
        width: 800,
        height: 600,
      });
      state.currentPageIndex = state.pages.length - 1;
    },
    addPenPoint: (state, action) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const lastPenShape = selectedLayer.shapes.find(
        (shape) => shape.type === "Pen"
      );
      if (lastPenShape) {
        lastPenShape.points.push(...action.payload);
      } else {
        selectedLayer.shapes.push({
          type: "Pen",
          points: action.payload,
          strokeColor: state.strokeColor,
        });
      }
    },
    clearPen: (state) => {
      state.shapes = state.shapes.filter((shape) => shape.type !== "Pen");
    },
    addPencilPoint: (state, action) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const lastPencilShape = selectedLayer.shapes.find(
        (shape) => shape.type === "Pencil"
      );
      if (lastPencilShape) {
        lastPencilShape.points.push(...action.payload);
      } else {
        selectedLayer.shapes.push({
          type: "Pencil",
          points: action.payload,
          strokeColor: state.strokeColor,
        });
      }
    },
    clearPencil: (state) => {
      state.shapes = state.shapes.filter((shape) => shape.type !== "Pencil");
    },
    addBezierPoint: (state, action) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const lastBezierShape = selectedLayer.shapes.find(
        (shape) => shape.type === "Bezier"
      );
      if (lastBezierShape) {
        lastBezierShape.points.push(...action.payload);
        console.log("Updated Bezier points in Redux:", lastBezierShape.points);
      } else {
        selectedLayer.shapes.push({
          id: `bezier-${Date.now()}`,
          type: "Bezier",
          points: action.payload,
          strokeColor: state.strokeColor,
          strokeWidth: 2,
        });
        console.log("New Bezier shape added:", action.payload);
      }
    },
    clearBezier: (state) => {
      state.shapes = state.shapes.filter((shape) => shape.type !== "Bezier");
    },
    addCalligraphyPoint: (state, action) => {
      const { point, strokeWidth } = action.payload;
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const lastCalligraphyShape = selectedLayer.shapes.find(
        (shape) => shape.type === "Calligraphy"
      );

      if (lastCalligraphyShape) {
        lastCalligraphyShape.points.push(point);
      } else {
        selectedLayer.shapes.push({
          type: "Calligraphy",
          points: [point],
          strokeWidth: strokeWidth,
          strokeColor: state.strokeColor,
        });
      }
    },
    clearCalligraphy: (state) => {
      state.shapes = state.shapes.filter(
        (shape) => shape.type !== "Calligraphy"
      );
    },
    clearShape: (state, action) => {
      const { x, y, width, height } = action.payload;
      state.shapes = state.shapes.filter((shape) => {
        if (shape.type === "Rectangle") {
          return !(
            x < shape.x + shape.width &&
            x + width > shape.x &&
            y < shape.y + shape.height &&
            y + height > shape.y
          );
        } else if (shape.type === "Circle") {
          const dx = shape.x - x;
          const dy = shape.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance > shape.radius;
        }
        return true;
      });
    },
    addImage: (state, action) => {
      const { url, name } = action.payload;
      const newShape = {
        id: `image-${Date.now()}`,
        type: "Image",
        url,
        name,
        x: 50,
        y: 50,
        width: 100,
        height: 100,
      };
      const selectedLayer = state.layers[state.selectedLayerIndex];
      selectedLayer.shapes.push(newShape);

      state.history.push(JSON.parse(JSON.stringify(state)));
      state.future = [];
    },
    uploadImage: (state, action) => {
      const { url, name } = action.payload;
      const newShape = {
        id: `image-${Date.now()}`,
        type: "Image",
        url,
        name,
        x: 50,
        y: 50,
        width: 100,
        height: 100,
      };

      const selectedLayer = state.layers[state.selectedLayerIndex];
      selectedLayer.shapes.push(newShape);
    },
    saveState: (state) => {
      const savedData = {
        layers: state.layers,
        selectedTool: state.selectedTool,
        strokeColor: state.strokeColor,
        fillColor: state.fillColor,
      };
      localStorage.setItem("designData", JSON.stringify(savedData));
    },
    saveAsState: (state, action) => {
      const { name } = action.payload;
      const savedData = {
        layers: state.layers,
        selectedTool: state.selectedTool,
        strokeColor: state.strokeColor,
        fillColor: state.fillColor,
      };
      localStorage.setItem(`designData_${name}`, JSON.stringify(savedData));
    },
    setSprayProperties: (state, action) => {
      const {
        sprayWidth,
        sprayAmount,
        sprayScale,
        sprayFocus,
        sprayMode,
        sprayRotation,
        sprayScatter,
      } = action.payload;
      state.sprayWidth = sprayWidth || state.sprayWidth;
      state.sprayAmount = sprayAmount || state.sprayAmount;
      state.sprayScale = sprayScale || state.sprayScale;
      state.sprayFocus = sprayFocus || state.sprayFocus;
      state.sprayMode = sprayMode || state.sprayMode;
      state.sprayRotation = sprayRotation || state.sprayRotation;
      state.sprayScatter = sprayScatter || state.sprayScatter;
      console.log("sprayScale", sprayScale);
    },
    addSprayShapes: (state, action) => {
      const { pathPoints, bounds } = action.payload;

      if (!state.selectedShapeId) {
        console.error("No shape selected for spraying.");
        return;
      }

      const selectedLayer = state.layers[state.selectedLayerIndex];
      const baseShape = selectedLayer.shapes.find(
        (shape) => shape.id === state.selectedShapeId
      );

      if (!baseShape) {
        console.error("Base shape not found.");
        return;
      }

      if (state.sprayMode === "path" && pathPoints) {
        pathPoints.forEach((point, index) => {
          for (let i = 0; i < state.sprayAmount; i++) {
            const offsetX =
              Math.random() * state.sprayWidth - state.sprayWidth / 2;
            const offsetY =
              Math.random() * state.sprayWidth - state.sprayWidth / 2;

            const newShape = {
              ...baseShape,
              id: `spray-shape-${Date.now()}-${index}-${i}`,
              x: point.x + offsetX,
              y: point.y + offsetY,
              scaleX: baseShape.scaleX * state.sprayScale,
              scaleY: baseShape.scaleY * state.sprayScale,
            };

            selectedLayer.shapes.push(newShape);
          }
        });
      } else if (state.sprayMode === "random" && bounds) {
        for (let i = 0; i < state.sprayAmount; i++) {
          const randomX = Math.random() * bounds.width + bounds.x;
          const randomY = Math.random() * bounds.height + bounds.y;

          const newShape = {
            ...baseShape,
            id: `spray-shape-${Date.now()}-${i}`,
            x: randomX,
            y: randomY,
            scaleX: baseShape.scaleX * state.sprayScale,
            scaleY: baseShape.scaleY * state.sprayScale,
          };

          selectedLayer.shapes.push(newShape);
        }
      }
    },
    updateSpiralProperties: (state, action) => {
      const { key, value } = action.payload;


      state[key] = value;


      const selectedShape = state.layers[state.selectedLayerIndex].shapes.find(
        (shape) => shape.id === state.selectedShapeId
      );

      if (selectedShape && selectedShape.type === "Spiral") {
        selectedShape[key] = value;


        selectedShape.path = generateSpiralPath(
          selectedShape.x,
          selectedShape.y,
          selectedShape.turns,
          selectedShape.innerRadius,
          selectedShape.divergence
        );
      }
    },
    jumpToHistory: (state, action) => {
      const targetIndex = action.payload;


      if (targetIndex < 0 || targetIndex >= state.history.length) return;


      if (targetIndex < state.currentIndex) {
        state.future.push({
          layers: JSON.parse(JSON.stringify(state.layers)),
          drawingPath: [...state.drawingPath],
          strokeColor: state.strokeColor,
          fillColor: state.fillColor,
          selectedShapeId: state.selectedShapeId,
        });
      }


      const targetState = state.history[targetIndex];
      state.layers = JSON.parse(JSON.stringify(targetState.layers));
      state.drawingPath = [...targetState.drawingPath];
      state.strokeColor = targetState.strokeColor;
      state.fillColor = targetState.fillColor;
      state.selectedShapeId = targetState.selectedShapeId;


      state.currentIndex = targetIndex;


      if (targetIndex > state.history.length - 1) {
        const nextState = state.future.pop();
        state.history.push({
          layers: JSON.parse(JSON.stringify(nextState.layers)),
          drawingPath: [...nextState.drawingPath],
          strokeColor: nextState.strokeColor,
          fillColor: nextState.fillColor,
          selectedShapeId: nextState.selectedShapeId,
        });
      }
    },
    moveShapeIntoGroup: (state, action) => {
      const { shapeId, groupId } = action.payload;
      const selectedLayer = state.layers[state.selectedLayerIndex];

      const groupShape = selectedLayer.shapes.find(
        (shape) => shape.id === groupId && shape.type === "Group"
      );

      if (groupShape) {
        const shape = selectedLayer.shapes.find((shape) => shape.id === shapeId);

        if (shape) {

          groupShape.shapes.push(shape);


          shape.groupId = groupId;


          state.selectedShapeIds = [];
        }
      }
    },
    selectAllShapesInGroup: (state, action) => {
      const { groupId } = action.payload;
      const selectedLayer = state.layers[state.selectedLayerIndex];

      const groupShape = selectedLayer.shapes.find(
        (shape) => shape.id === groupId && shape.type === "Group"
      );

      if (groupShape) {
        state.selectedShapeIds = groupShape.shapes.map((shape) => shape.id);
      }
    },
    updateControlPoint: (state, action) => {
      const { index, point } = action.payload;
      state.controlPoints[index] = point;
    },
    setPageSize: (state, action) => {
      const { width, height } = action.payload;
      state.width = width;
      state.height = height;
      localStorage.setItem("canvasWidth", width);
      localStorage.setItem("canvasHeight", height);
    },
    toggleShowInitialScreen: (state) => {
      state.showInitialScreen = !state.showInitialScreen
      localStorage.setItem("showEveryTime", JSON.stringify(state.showInitialScreen))
    },
    setCalligraphyOption: (state, action) => {
      state.calligraphyOption = action.payload;
    },
    setCalligraphyWidth: (state, action) => {
      state.calligraphyWidth = action.payload;
    },
    setCalligraphyThinning: (state, action) => {
      state.calligraphyThinning = action.payload;
    },
    setCalligraphyMass: (state, action) => {
      state.calligraphyMass = action.payload;
    },
    setPencilOption(state, action) {
      state.pencilOption = action.payload;
    },
    setPencilSmoothing(state, action) {
      state.pencilSmoothing = action.payload;
    },
    setPencilMode(state, action) {
      state.pencilMode = action.payload;
    },
    setPencilScale(state, action) {
      state.pencilScale = action.payload;
    },
    insertNode: (state) => {
      console.log("Insert Node Reducer Triggered");

      const selectedShape = state.layers[state.selectedLayerIndex].shapes.find(
        (shape) => shape.id === state.selectedShapeId
      );

      if (!selectedShape) {
        console.log("No shape found with the selectedShapeId:", state.selectedShapeId);
        return;
      }

      console.log("Selected Shape:", selectedShape);

      if (Array.isArray(selectedShape.points)) {
        const points = selectedShape.points;

        console.log("Current Points:", points);

        if (points.length > 1) {
          const edgeIndex = 0;
          const nextIndex = (edgeIndex + 1) % points.length;

          if (selectedShape.type === "Circle") {
            const center = { x: selectedShape.x, y: selectedShape.y };
            const radius = selectedShape.radius;


            const angle1 = Math.atan2(points[edgeIndex].y - center.y, points[edgeIndex].x - center.x);
            const angle2 = Math.atan2(points[nextIndex].y - center.y, points[nextIndex].x - center.x);


            const midAngle = (angle1 + angle2) / 2;


            const midPoint = {
              x: center.x + radius * Math.cos(midAngle),
              y: center.y + radius * Math.sin(midAngle),
            };

            console.log("Midpoint to Insert (Circle):", midPoint);

            points.splice(nextIndex, 0, midPoint);
          } else if (selectedShape.type === "Star") {

            const { x, y, innerRadius, outerRadius, numPoints } = selectedShape;
            selectedShape.points = [];
            for (let i = 0; i < numPoints * 2; i++) {
              const angle = (Math.PI * i) / numPoints;
              const radius = i % 2 === 0 ? outerRadius : innerRadius;
              selectedShape.points.push({
                x: x + radius * Math.cos(angle),
                y: y + radius * Math.sin(angle),
              });
            }
            console.log("Reinitialized points for Star:", selectedShape.points);
          } else if (selectedShape.type === "Polygon") {

            const midPoint = {
              x: (points[edgeIndex].x + points[nextIndex].x) / 2,
              y: (points[edgeIndex].y + points[nextIndex].y) / 2,
            };

            console.log("Midpoint to Insert (Polygon):", midPoint);

            points.splice(nextIndex, 0, midPoint);
          } else if (selectedShape.type === "Pencil") {

            const midPoint = {
              x: (points[edgeIndex][0] + points[nextIndex][0]) / 2,
              y: (points[edgeIndex][1] + points[nextIndex][1]) / 2,
            };

            console.log("Midpoint to Insert (Pencil):", midPoint);

            points.splice(nextIndex, 0, [midPoint.x, midPoint.y]);
          } else if (selectedShape.type === "Calligraphy") {

            const midPoint = {
              x: (points[edgeIndex][0] + points[nextIndex][0]) / 2,
              y: (points[edgeIndex][1] + points[nextIndex][1]) / 2,
            };

            console.log("Midpoint to Insert (Calligraphy):", midPoint);

            points.splice(nextIndex, 0, [midPoint.x, midPoint.y]);
          } else {

            const midPoint = {
              x: (points[edgeIndex].x + points[nextIndex].x) / 2,
              y: (points[edgeIndex].y + points[nextIndex].y) / 2,
            };

            console.log("Midpoint to Insert (Default):", midPoint);

            points.splice(nextIndex, 0, midPoint);
          }

          selectedShape.points = points;


          state.controlPoints = [...points];
          console.log("Updated control points after inserting node:", state.controlPoints);
        } else {
          console.log("Not enough points to insert a node.");
        }
      } else {
        console.log("Invalid points array for the selected shape.");
      }
    },
    joinSelectedNodePoints: (state) => {
      if (state.selectedNodePoints.length !== 2) {
        console.error("You must select exactly two nodes to join them.");
        return;
      }

      const [nodeA, nodeB] = state.selectedNodePoints;
      const layer = state.layers[state.selectedLayerIndex];
      if (!layer) return;

      const shapeA = layer.shapes.find(s => s.id === nodeA.shapeId);
      const shapeB = layer.shapes.find(s => s.id === nodeB.shapeId);

      if (!shapeA || !Array.isArray(shapeA.points) || !shapeB || !Array.isArray(shapeB.points)) {
        console.error("Shape(s) not found or has no points array.");
        return;
      }

      if (nodeA.shapeId === nodeB.shapeId) {
        const idxA = nodeA.index;
        const idxB = nodeB.index;

        if (shapeA.type === "Pencil") {
          if (
            Math.abs(idxA - idxB) === 1 ||
            Math.abs(idxA - idxB) === shapeA.points.length - 1
          ) {
            shapeA.points.push([...shapeA.points[idxA]]);
            state.controlPoints = [...shapeA.points];
            state.selectedNodePoints = [];
            return;
          }
          const [startIdx, endIdx] = idxA < idxB ? [idxA, idxB] : [idxB, idxA];
          const newPoints = [
            ...shapeA.points.slice(startIdx, endIdx + 1),
            [...shapeA.points[startIdx]],
          ];
          shapeA.points = newPoints;
          state.controlPoints = [...newPoints];
          state.selectedNodePoints = [];
          return;
        }

        if (
          Math.abs(idxA - idxB) === 1 ||
          Math.abs(idxA - idxB) === shapeA.points.length - 1
        ) {
          shapeA.points.push({ ...shapeA.points[idxA] });
          state.controlPoints = [...shapeA.points];
          state.selectedNodePoints = [];
          return;
        }

        const [startIdx, endIdx] = idxA < idxB ? [idxA, idxB] : [idxB, idxA];
        const newPoints = [
          ...shapeA.points.slice(startIdx, endIdx + 1),
          { ...shapeA.points[startIdx] },
        ];
        shapeA.points = newPoints;
        state.controlPoints = [...newPoints];
        state.selectedNodePoints = [];
        return;
      }

      if (shapeA.type === "Pencil" && shapeB.type === "Pencil") {

        const pointsA = [
          ...shapeA.points.slice(nodeA.index),
          ...shapeA.points.slice(0, nodeA.index + 1)
        ];
        const pointsB = [
          ...shapeB.points.slice(nodeB.index),
          ...shapeB.points.slice(0, nodeB.index + 1)
        ];

        if (
          pointsA[pointsA.length - 1][0] === pointsB[0][0] &&
          pointsA[pointsA.length - 1][1] === pointsB[0][1]
        ) {
          pointsB.shift();
        }
        shapeA.points = [...pointsA, ...pointsB];
        layer.shapes = layer.shapes.filter(s => s.id !== shapeB.id);
        state.controlPoints = [...shapeA.points];
        state.selectedNodePoints = [];
        return;
      }

      const pointsA = [
        ...shapeA.points.slice(nodeA.index),
        ...shapeA.points.slice(0, nodeA.index + 1)
      ];
      const pointsB = [
        ...shapeB.points.slice(nodeB.index),
        ...shapeB.points.slice(0, nodeB.index + 1)
      ];

      if (
        pointsA[pointsA.length - 1].x === pointsB[0].x &&
        pointsA[pointsA.length - 1].y === pointsB[0].y
      ) {
        pointsB.shift();
      }
      shapeA.points = [...pointsA, ...pointsB];
      layer.shapes = layer.shapes.filter(s => s.id !== shapeB.id);
      state.controlPoints = [...shapeA.points];
      state.selectedNodePoints = [];
    },
    breakPathAtSelectedNode: (state) => {
      if (state.selectedNodePoints.length !== 1) {
        console.error("Select a single node to break the path.");
        return;
      }
      const { shapeId, index } = state.selectedNodePoints[0];
      const layer = state.layers[state.selectedLayerIndex];
      const shape = layer.shapes.find(s => s.id === shapeId);
      if (!shape || !Array.isArray(shape.points)) return;


      if (shape.type === "Pencil" && shape.points.length > 2) {
        const part1 = shape.points.slice(0, index + 1);
        const part2 = shape.points.slice(index);

        const { id, isSelected, selected, ...rest } = shape;
        const newShape = {
          ...rest,
          id: `shape-${Date.now()}-${Math.random()}`,
          points: part2,
        };

        shape.points = part1;
        layer.shapes.push(newShape);

        state.selectedShapeId = null;
        state.selectedShapeIds = [];
        state.selectedNodePoints = [];
        state.controlPoints = [];
        return;
      }


      if (shape.type === "Calligraphy" && shape.points.length > 2) {
        const part1 = shape.points.slice(0, index + 1);
        const part2 = shape.points.slice(index);

        const { id, isSelected, selected, ...rest } = shape;
        const newShape = {
          ...rest,
          id: `shape-${Date.now()}-${Math.random()}`,
          points: part2,
        };

        shape.points = part1;
        layer.shapes.push(newShape);

        state.selectedShapeId = null;
        state.selectedShapeIds = [];
        state.selectedNodePoints = [];
        state.controlPoints = [];
        return;
      }
    },
    selectNodePoint: (state, action) => {
      const node = action.payload;


      const isAlreadySelected = state.selectedNodePoints.some(
        (selectedNode) =>
          selectedNode.shapeId === node.shapeId && selectedNode.index === node.index
      );

      if (isAlreadySelected) {
        state.selectedNodePoints = state.selectedNodePoints.filter(
          (selectedNode) =>
            !(selectedNode.shapeId === node.shapeId && selectedNode.index === node.index)
        );
      } else {
        state.selectedNodePoints.push(node);
      }
    },
    makeSelectedNodesCorner: (state) => {
      if (state.selectedNodePoints.length === 0) {
        console.error("No nodes selected to make corners.");
        return;
      }

      const layer = state.layers[state.selectedLayerIndex];
      if (!layer) {
        console.error("No layer selected.");
        return;
      }


      const processedShapeIds = new Set();
      state.selectedNodePoints.forEach((node) => {
        const shape = layer.shapes.find((shape) => shape.id === node.shapeId);
        if (!shape || !Array.isArray(shape.points) || processedShapeIds.has(shape.id)) return;


        if (shape.type === "Pencil") {
          shape.points = shape.points.map(pt =>
            Array.isArray(pt) && pt.length >= 2 ? [pt[0], pt[1]] : pt
          );
        }

        else if (shape.type === "Calligraphy") {
          shape.points = shape.points.map(pt =>
            pt && typeof pt === "object" && pt.x !== undefined && pt.y !== undefined
              ? { x: pt.x, y: pt.y }
              : pt
          );
        }
        processedShapeIds.add(shape.id);
      });

      layer.shapes = [...layer.shapes];
    },
    makeSelectedNodesSmooth: (state) => {
      if (state.selectedNodePoints.length === 0) return;

      const layer = state.layers[state.selectedLayerIndex];
      if (!layer) return;

      state.selectedNodePoints.forEach((node) => {
        const shape = layer.shapes.find((shape) => shape.id === node.shapeId);
        if (!shape || !Array.isArray(shape.points)) return;

        let pt = shape.points[node.index];


        if (Array.isArray(pt) && pt.length >= 2) {
          function chaikin(points, iterations = 2) {
            let pts = points;
            for (let iter = 0; iter < iterations; iter++) {
              const newPts = [];
              for (let i = 0; i < pts.length - 1; i++) {
                const [x0, y0] = pts[i];
                const [x1, y1] = pts[i + 1];
                newPts.push(
                  [0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1],
                  [0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1]
                );
              }
              newPts.unshift(pts[0]);
              newPts.push(pts[pts.length - 1]);
              pts = newPts;
            }
            return pts;
          }
          shape.points = chaikin(shape.points, 3);
          return;
        }


        if (
          pt &&
          typeof pt === "object" &&
          pt.x !== undefined &&
          pt.y !== undefined &&
          shape.type === "Calligraphy"
        ) {
          function chaikinObj(points, iterations = 2) {
            let pts = points;
            for (let iter = 0; iter < iterations; iter++) {
              const newPts = [];
              for (let i = 0; i < pts.length - 1; i++) {
                const p0 = pts[i];
                const p1 = pts[i + 1];
                newPts.push(
                  {
                    x: 0.75 * p0.x + 0.25 * p1.x,
                    y: 0.75 * p0.y + 0.25 * p1.y,
                  },
                  {
                    x: 0.25 * p0.x + 0.75 * p1.x,
                    y: 0.25 * p0.y + 0.75 * p1.y,
                  }
                );
              }
              newPts.unshift({ ...pts[0] });
              newPts.push({ ...pts[pts.length - 1] });
              pts = newPts;
            }
            return pts;
          }
          shape.points = chaikinObj(shape.points, 3);
          return;
        }


        if (pt && typeof pt === "object" && pt.x !== undefined && pt.y !== undefined) {
          const x = pt.x, y = pt.y;
          const prevPt = shape.points[node.index - 1] || pt;
          const nextPt = shape.points[node.index + 1] || pt;

          const prev = Array.isArray(prevPt)
            ? { x: prevPt[0], y: prevPt[1] }
            : { x: prevPt.x, y: prevPt.y };
          const next = Array.isArray(nextPt)
            ? { x: nextPt[0], y: nextPt[1] }
            : { x: nextPt.x, y: nextPt.y };

          const toPrev = { x: x - prev.x, y: y - prev.y };
          const toNext = { x: next.x - x, y: next.y - y };

          let dirX = 0, dirY = 0;
          if (prev !== pt && next !== pt) {
            dirX = (toPrev.x / (Math.hypot(toPrev.x, toPrev.y) || 1)) + (toNext.x / (Math.hypot(toNext.x, toNext.y) || 1));
            dirY = (toPrev.y / (Math.hypot(toPrev.x, toPrev.y) || 1)) + (toNext.y / (Math.hypot(toNext.x, toNext.y) || 1));
          } else if (next !== pt) {
            dirX = toNext.x / (Math.hypot(toNext.x, toNext.y) || 1);
            dirY = toNext.y / (Math.hypot(toNext.x, toNext.y) || 1);
          } else if (prev !== pt) {
            dirX = toPrev.x / (Math.hypot(toPrev.x, toPrev.y) || 1);
            dirY = toPrev.y / (Math.hypot(toPrev.x, toPrev.y) || 1);
          }

          const dirLen = Math.hypot(dirX, dirY) || 1;
          const handleLength = 40;

          const controlPoint1 = {
            x: x - (dirX / dirLen) * handleLength,
            y: y - (dirY / dirLen) * handleLength,
          };
          const controlPoint2 = {
            x: x + (dirX / dirLen) * handleLength,
            y: y + (dirY / dirLen) * handleLength,
          };

          shape.points[node.index] = {
            x,
            y,
            controlPoint1,
            controlPoint2,
            smooth: true,
          };
        }
      });

      layer.shapes = [...layer.shapes];
    },
    makeSelectedNodesCurve: (state) => {
      if (state.selectedNodePoints.length !== 2) {
        console.error("You must select exactly two nodes to create a curve.");
        return;
      }

      const [startNode, endNode] = state.selectedNodePoints;

      const layer = state.layers[state.selectedLayerIndex];
      if (!layer) {
        console.error("No layer selected.");
        return;
      }

      const shape = layer.shapes.find((shape) => shape.id === startNode.shapeId);
      if (!shape || shape.id !== endNode.shapeId) {
        console.error("Both nodes must belong to the same shape.");
        return;
      }

      if (Array.isArray(shape.points)) {
        const startIndex = Math.min(startNode.index, endNode.index);
        const endIndex = Math.max(startNode.index, endNode.index);

        const startPoint = shape.points[startIndex];
        const endPoint = shape.points[endIndex];

        if (!startPoint || !endPoint) {
          console.error("Invalid node points selected.");
          return;
        }


        const controlPoint = {
          x: (startPoint.x + endPoint.x) / 2,
          y: (startPoint.y + endPoint.y) / 2 - 100,
        };


        const curvePoints = [];
        const steps = 50;
        for (let t = 0; t <= 1; t += 1 / steps) {
          const x =
            Math.pow(1 - t, 2) * startPoint.x +
            2 * (1 - t) * t * controlPoint.x +
            Math.pow(t, 2) * endPoint.x;
          const y =
            Math.pow(1 - t, 2) * startPoint.y +
            2 * (1 - t) * t * controlPoint.y +
            Math.pow(t, 2) * endPoint.y;
          curvePoints.push({ x, y });
        }


        const updatedPoints = [
          ...shape.points.slice(0, startIndex),
          ...curvePoints,
          ...shape.points.slice(endIndex + 1),
        ];


        shape.points = updatedPoints;


        state.controlPoints = [];


        layer.shapes = [...layer.shapes];

        console.log("More pronounced curve created between the selected nodes.");
      } else {
        console.error("Shape does not have a valid points array.");
      }
    },
    makeSelectedNodesStraight: (state) => {
      if (state.selectedNodePoints.length !== 2) {
        console.error("You must select exactly two nodes to make a straight line.");
        return;
      }

      const [startNode, endNode] = state.selectedNodePoints;

      const layer = state.layers[state.selectedLayerIndex];
      if (!layer) {
        console.error("No layer selected.");
        return;
      }

      const shape = layer.shapes.find((shape) => shape.id === startNode.shapeId);
      if (!shape || shape.id !== endNode.shapeId) {
        console.error("Both nodes must belong to the same shape.");
        return;
      }

      if (Array.isArray(shape.points)) {
        const startIndex = Math.min(startNode.index, endNode.index);
        const endIndex = Math.max(startNode.index, endNode.index);

        const startPoint = shape.points[startIndex];
        const endPoint = shape.points[endIndex];

        if (!startPoint || !endPoint) {
          console.error("Invalid node points selected.");
          return;
        }


        const straightPoints = [];
        const steps = endIndex - startIndex;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const x = startPoint.x + t * (endPoint.x - startPoint.x);
          const y = startPoint.y + t * (endPoint.y - startPoint.y);
          straightPoints.push({ x, y });
        }


        const updatedPoints = [
          ...shape.points.slice(0, startIndex),
          ...straightPoints,
          ...shape.points.slice(endIndex + 1),
        ];


        shape.points = updatedPoints;


        state.controlPoints = [];


        layer.shapes = [...layer.shapes];

        console.log("Straight line created between the selected nodes.");
      } else {
        console.error("Shape does not have a valid points array.");
      }
    },
    makeShapeCorner: (state, action) => {
      const { radius = 20 } = action.payload || {};
      const layer = state.layers[state.selectedLayerIndex];
      if (!layer) {
        console.error("No layer selected.");
        return;
      }

      const shape = layer.shapes.find((shape) => shape.id === state.selectedShapeId);
      if (!shape) {
        console.error("Shape not found.");
        return;
      }

      let effectiveRadius = radius;

      if (shape.type === "Rectangle") {
        const { width, height } = shape;
        effectiveRadius = Math.min(radius, width / 2, height / 2);

        shape.radius = effectiveRadius;

        if (shape.konvaNode) {
          shape.konvaNode.cornerRadius(effectiveRadius);
          shape.konvaNode.getLayer().batchDraw();
        }

        layer.shapes = [...layer.shapes];
        console.log(`Rounded corners applied with radius ${effectiveRadius}px to RECTANGLE ID ${state.selectedShapeId}.`);
        return;
      }


      if (!Array.isArray(shape.points)) {
        console.error("Shape does not have a valid points array.");
        return;
      }

      const updatedPoints = [];
      const arcSteps = 20;

      for (let i = 0; i < shape.points.length; i++) {
        const prev = shape.points[(i - 1 + shape.points.length) % shape.points.length];
        const curr = shape.points[i];
        const next = shape.points[(i + 1) % shape.points.length];

        const v1 = { x: prev.x - curr.x, y: prev.y - curr.y };
        const v2 = { x: next.x - curr.x, y: next.y - curr.y };

        const len1 = Math.hypot(v1.x, v1.y);
        const len2 = Math.hypot(v2.x, v2.y);
        const u1 = { x: v1.x / len1, y: v1.y / len1 };
        const u2 = { x: v2.x / len2, y: v2.y / len2 };

        const dot = u1.x * u2.x + u1.y * u2.y;
        const angle = Math.acos(dot);
        const halfAngle = angle / 2;

        const offsetDist = effectiveRadius / Math.tan(halfAngle);

        const start = {
          x: curr.x + u1.x * effectiveRadius,
          y: curr.y + u1.y * effectiveRadius,
        };
        const end = {
          x: curr.x + u2.x * effectiveRadius,
          y: curr.y + u2.y * effectiveRadius,
        };

        const bisector = { x: u1.x + u2.x, y: u1.y + u2.y };
        const bisLen = Math.hypot(bisector.x, bisector.y);
        const bisUnit = { x: bisector.x / bisLen, y: bisector.y / bisLen };

        const center = {
          x: curr.x + bisUnit.x * offsetDist,
          y: curr.y + bisUnit.y * offsetDist,
        };

        const startAngle = Math.atan2(start.y - center.y, start.x - center.x);
        const endAngle = Math.atan2(end.y - center.y, end.x - center.x);

        let sweep = endAngle - startAngle;
        if (sweep <= 0) sweep += Math.PI * 2;

        for (let j = 0; j <= arcSteps; j++) {
          const t = j / arcSteps;
          const angle = startAngle + sweep * t;
          updatedPoints.push({
            x: center.x + Math.cos(angle) * effectiveRadius,
            y: center.y + Math.sin(angle) * effectiveRadius,
          });
        }
      }

      shape.points = updatedPoints;

      if (shape.konvaNode) {
        shape.konvaNode.points(updatedPoints.flatMap((p) => [p.x, p.y]));
        shape.konvaNode.getLayer().batchDraw();
      }

      layer.shapes = [...layer.shapes];
      console.log(`Rounded corners applied with radius ${effectiveRadius}px to shape ID ${state.selectedShapeId}.`);
    },
    strokePath: (state) => {
      const layer = state.layers[state.selectedLayerIndex];
      if (!layer) return;
      const shape = layer.shapes.find(s => s.id === state.selectedShapeId);
      if (!shape) return;


      let outline = [];
      if (shape.type === "Rectangle") {
        const half = (shape.strokeWidth || 1) / 2;


        const outer = [
          { x: shape.x - half, y: shape.y - half },
          { x: shape.x + shape.width + half, y: shape.y - half },
          { x: shape.x + shape.width + half, y: shape.y + shape.height + half },
          { x: shape.x - half, y: shape.y + shape.height + half },
        ];


        const inner = [
          { x: shape.x + half, y: shape.y + half },
          { x: shape.x + shape.width - half, y: shape.y + half },
          { x: shape.x + shape.width - half, y: shape.y + shape.height - half },
          { x: shape.x + half, y: shape.y + shape.height - half },
        ].reverse();

        const outline = [...outer, ...inner];


        const newStrokeShape = {
          id: `stroke-path-${Date.now()}`,
          type: "Polygon",
          points: outline,
          closed: true,
          fill: shape.stroke || "#000",
          stroke: undefined,
          strokeWidth: 1,
          name: "Stroke Outline",
        };


        shape.stroke = undefined;
        shape.strokeWidth = 0;


        layer.shapes.push(newStrokeShape);


        state.selectedTool = "Node";
        state.selectedShapeId = newStrokeShape.id;
        state.selectedShapeIds = [newStrokeShape.id];
        state.controlPoints = outline;
        return;
      } else if (shape.type === "Circle") {
        const numPoints = 36;
        const half = (shape.strokeWidth || 1) / 2;
        const outer = [];
        const inner = [];


        for (let i = 0; i < numPoints; i++) {
          const angle = (2 * Math.PI * i) / numPoints;
          outer.push({
            x: shape.x + (shape.radius + half) * Math.cos(angle),
            y: shape.y + (shape.radius + half) * Math.sin(angle),
          });
        }

        for (let i = numPoints - 1; i >= 0; i--) {
          const angle = (2 * Math.PI * i) / numPoints;
          inner.push({
            x: shape.x + (shape.radius - half) * Math.cos(angle),
            y: shape.y + (shape.radius - half) * Math.sin(angle),
          });
        }
        const outline = [...outer, ...inner];


        const newStrokeShape = {
          id: `stroke-path-${Date.now()}`,
          type: "Polygon",
          points: outline,
          closed: true,
          fill: shape.stroke || "#000",
          stroke: undefined,
          strokeWidth: 1,
          name: "Stroke Outline",
        };


        shape.stroke = undefined;
        shape.strokeWidth = 0;


        layer.shapes.push(newStrokeShape);


        state.selectedTool = "Node";
        state.selectedShapeId = newStrokeShape.id;
        state.selectedShapeIds = [newStrokeShape.id];
        state.controlPoints = outline;
        return;
      } else if (shape.type === "Star") {
        const half = (shape.strokeWidth || 1) / 2;
        const corners = shape.corners || 5;
        const numPoints = corners * 2;
        const outer = [];
        const inner = [];


        for (let i = 0; i < numPoints; i++) {
          const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
          const baseRadius = i % 2 === 0 ? shape.outerRadius : shape.innerRadius;
          outer.push({
            x: shape.x + (baseRadius + half) * Math.cos(angle),
            y: shape.y + (baseRadius + half) * Math.sin(angle),
          });
        }

        for (let i = numPoints - 1; i >= 0; i--) {
          const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
          const baseRadius = i % 2 === 0 ? shape.outerRadius : shape.innerRadius;
          inner.push({
            x: shape.x + (baseRadius - half) * Math.cos(angle),
            y: shape.y + (baseRadius - half) * Math.sin(angle),
          });
        }
        const outline = [...outer, ...inner];


        const newStrokeShape = {
          id: `stroke-path-${Date.now()}`,
          type: "Polygon",
          points: outline,
          closed: true,
          fill: shape.stroke || "#000",
          stroke: undefined,
          strokeWidth: 1,
          name: "Stroke Outline",
        };


        shape.stroke = undefined;
        shape.strokeWidth = 0;


        layer.shapes.push(newStrokeShape);


        state.selectedTool = "Node";
        state.selectedShapeId = newStrokeShape.id;
        state.selectedShapeIds = [newStrokeShape.id];
        state.controlPoints = outline;
        return;
      } else if (shape.type === "Polygon") {
        outline = shape.points.map(p => ({ x: p.x, y: p.y }));
      } else if (shape.type === "Pencil" || shape.type === "Calligraphy") {
        outline = shape.points.map(p => ({ x: p.x, y: p.y }));
      } else {

        return;
      }
    },
    updateStrokeControlPoint: (state, action) => {
      const { index, newPosition } = action.payload;
      const controlPoint = state.controlPoints[index];
      if (!controlPoint) return;

      const layer = state.layers[state.selectedLayerIndex];
      const shape = layer.shapes.find((s) => s.id === state.selectedShapeId);
      if (!shape) return;


      if (state.isStrokeToPathMode) {
        const centerX = shape.x + (shape.width || 0) / 2;
        const centerY = shape.y + (shape.height || 0) / 2;
        const distance = Math.hypot(newPosition.x - centerX, newPosition.y - centerY);
        const shapeRadius = Math.min(shape.width || 0, shape.height || 0) / 2;

        let newStrokeWidth = Math.max(1, Math.round((distance - shapeRadius) * 2));
        shape.strokeWidth = newStrokeWidth;

        const halfStroke = newStrokeWidth / 2;
        state.controlPoints = [
          { x: shape.x - halfStroke, y: shape.y - halfStroke, position: "top-left" },
          { x: shape.x + shape.width + halfStroke, y: shape.y - halfStroke, position: "top-right" },
          { x: shape.x + shape.width + halfStroke, y: shape.y + shape.height + halfStroke, position: "bottom-right" },
          { x: shape.x - halfStroke, y: shape.y + shape.height + halfStroke, position: "bottom-left" },
        ];
      } else {
        console.log("Stroke-to-path mode is not active, ignoring stroke drag.");
      }

      layer.shapes = [...layer.shapes];
    },
    setStrokeToPathMode: (state, action) => {
      state.isStrokeToPathMode = action.payload;
    },
    handleUnion: (state) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const selectedShapeIds = state.selectedShapeIds;

      if (selectedShapeIds.length < 2) {
        console.error("Please select at least two shapes to combine.");
        return;
      }

      const shapesToCombine = selectedShapeIds.map((id) =>
        selectedLayer.shapes.find((shape) => shape.id === id)
      );

      if (shapesToCombine.some((shape) => !shape)) {
        console.error("One or more selected shapes not found.");
        return;
      }


      const groupX = Math.min(...shapesToCombine.map((shape) => shape.x || 0));
      const groupY = Math.min(...shapesToCombine.map((shape) => shape.y || 0));


      const adjustedShapes = shapesToCombine.map((shape) => ({
        ...shape,
        x: (shape.x || 0) - groupX,
        y: (shape.y || 0) - groupY,
      }));


      const groupShape = {
        id: `group-${Date.now()}`,
        type: "Group",
        shapes: adjustedShapes,
        x: groupX,
        y: groupY,
      };


      selectedLayer.shapes = selectedLayer.shapes.filter(
        (shape) => !selectedShapeIds.includes(shape.id)
      );


      selectedLayer.shapes.push(groupShape);


      state.selectedShapeIds = [groupShape.id];
      console.log("Shapes combined into a single group:", groupShape);
    },

    intersection: (state) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const selectedShapeIds = state.selectedShapeIds;

      if (selectedShapeIds.length !== 2) {
        console.error("Please select exactly two shapes to perform an intersection.");
        return;
      }

      const [shape1, shape2] = selectedShapeIds.map((id) =>
        selectedLayer.shapes.find((shape) => shape.id === id)
      );

      if (!shape1 || !shape2) {
        console.error("Selected shapes not found.");
        return;
      }

      let intersectionShape = null;


      if (shape1.type === "Rectangle" && shape2.type === "Rectangle") {
        const x1 = Math.max(shape1.x, shape2.x);
        const y1 = Math.max(shape1.y, shape2.y);
        const x2 = Math.min(shape1.x + shape1.width, shape2.x + shape2.width);
        const y2 = Math.min(shape1.y + shape1.height, shape2.y + shape2.height);

        if (x1 < x2 && y1 < y2) {
          intersectionShape = {
            id: `intersection-${Date.now()}`,
            type: "Rectangle",
            x: x1,
            y: y1,
            width: x2 - x1,
            height: y2 - y1,
            fill: shape1.fill || shape2.fill,
            stroke: shape1.stroke || shape2.stroke,
            strokeWidth: Math.max(shape1.strokeWidth || 1, shape2.strokeWidth || 1),
          };
        }
      } else {
        console.error("Intersection logic for this shape type is not implemented.");
        return;
      }

      if (intersectionShape) {

        selectedLayer.shapes = selectedLayer.shapes.filter(
          (shape) => !selectedShapeIds.includes(shape.id)
        );
        state.layers[state.selectedLayerIndex] = {
          ...selectedLayer,
          shapes: [
            ...selectedLayer.shapes.filter((s) => !selectedShapeIds.includes(s.id)),
            intersectionShape,
          ],
        };
        state.selectedShapeIds = [intersectionShape.id];

        console.log("Intersection shape added:", intersectionShape);
      } else {
        console.error("Intersection failed. Ensure the shapes overlap.");

        state.selectedShapeIds = [...selectedShapeIds];
      }
    },
    setSnapping: (state, action) => {
      state.isSnappingEnabled = action.payload;
    },
    setShapeBuilderMode: (state, action) => {
      state.shapeBuilderMode = action.payload;
    },
    setSprayMode: (state, action) => {
      state.sprayMode = action.payload;
    },
    setSprayEraserMode: (state, action) => {
      state.sprayEraserMode = action.payload;
    },
    removeShapes: (state, action) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      selectedLayer.shapes = selectedLayer.shapes.filter(
        (shape) => !action.payload.includes(shape.id)
      );

      state.shapes = state.shapes.filter(
        (shape) => !action.payload.includes(shape.id)
      );

      state.selectedShapeIds = [];
      state.selectedShapeId = null;
    },
    setCalligraphyAngle: (state, action) => {
      state.calligraphyAngle = action.payload;
    },
    setCalligraphyFixation: (state, action) => {
      state.calligraphyFixation = action.payload;
    },
    setCalligraphyCaps: (state, action) => {
      state.calligraphyCaps = action.payload;
    },
    setEraserMode: (state, action) => {
      state.eraserMode = action.payload;
    },
    updateShapeVisibility: (state, action) => {
      const { id, visible } = action.payload;
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const shape = selectedLayer.shapes.find((shape) => shape.id === id);
      if (shape) {
        shape.visible = visible;
      }
    },
    updateShapeOpacity: (state, action) => {
      const { id, opacity } = action.payload;
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const shape = selectedLayer.shapes.find((shape) => shape.id === id);
      if (shape) {
        shape.opacity = opacity;
      }
    },
    setEraserWidth: (state, action) => {
      state.eraserWidth = action.payload;
    },
    setEraserThinning: (state, action) => {
      state.eraserThinning = action.payload;
    },
    setEraserCaps: (state, action) => {
      state.eraserCaps = action.payload;
    },
    setEraserTremor: (state, action) => {
      state.eraserTremor = action.payload;
    },
    setEraserMass: (state, action) => {
      state.eraserMass = action.payload;
    },
    setPickedColor: (state, action) => {
      state.pickedColor = action.payload;
    },
    setDropperMode: (state, action) => {
      state.dropperMode = action.payload;
    },
    setDropperTarget: (state, action) => {
      state.dropperTarget = action.payload;
    },
    setAssignAverage: (state, action) => {
      state.assignAverage = action.payload;
    },
    setAltInverse: (state, action) => {
      state.altInverse = action.payload;
    },
    setGradientType: (state, action) => {
      state.gradientType = action.payload;
    },
    setPressureEnabled: (state, action) => { state.pressureEnabled = action.payload; },
    setPressureMin: (state, action) => { state.pressureMin = action.payload; },
    setPressureMax: (state, action) => { state.pressureMax = action.payload; },
    setBrushCaps: (state, action) => { state.brushCaps = action.payload; },

    addMeasurementLine: (state, action) => {
      state.measurementLines.push(action.payload);
      console.log("measurementLines", state.measurementLines);
    },
    setMeasurementDraft: (state, action) => {
      state.measurementDraft = action.payload;
    },
    setMeasurementFontSize: (state, action) => {
      state.measurementFontSize = action.payload;
    },
    setMeasurementPrecision: (state, action) => {
      state.measurementPrecision = action.payload;
    },
    setMeasurementScale: (state, action) => {
      state.measurementScale = action.payload;
    },
    setMeasurementUnit: (state, action) => {
      state.measurementUnit = action.payload;
    },
    setShowMeasureBetween(state, action) {
      state.showMeasureBetween = action.payload;
    },
    setIgnoreFirstLast(state, action) {
      state.ignoreFirstLast = action.payload;
    },
    setReverseMeasure(state, action) {
      state.reverseMeasure = action.payload;
    },
    setToGuides(state, action) {
      state.toGuides = action.payload;
    },
    setPhantomMeasure(state, action) {
      state.phantomMeasure = action.payload;
    },
    setMarkDimension(state, action) {
      state.markDimension = action.payload;
    },
    setMeasurementOffset: (state, action) => {
      state.measurementOffset = action.payload;
    },
    setConvertToItem: (state, action) => {
      state.convertToItem = action.payload;
    },
    removeMeasurementLine: (state, action) => {

      const line = action.payload;
      state.measurementLines = state.measurementLines.filter(
        l =>
          !(
            l.x1 === line.x1 &&
            l.y1 === line.y1 &&
            l.x2 === line.x2 &&
            l.y2 === line.y2
          )
      );
    },
    setReplaceShapes: (state, action) => {
      state.replaceShapes = action.payload;
    },
    setPaintBucketFillBy: (state, action) => {
      state.paintBucketFillBy = action.payload;
    },
    setPaintBucketThreshold: (state, action) => {
      state.paintBucketThreshold = action.payload;
    },
    setPaintBucketGrowSink: (state, action) => {
      state.paintBucketGrowSink = action.payload;
    },
    setPaintBucketCloseGaps: (state, action) => {
      state.paintBucketCloseGaps = action.payload;
    },
    setMeshMode: (state, action) => {
      state.meshMode = action.payload;
    },
    setMeshRows: (state, action) => { state.meshRows = action.payload; },
    setMeshCols: (state, action) => { state.meshCols = action.payload; },
    updateMeshNode: (state, action) => {
      const { meshId, nodeIdx, x, y } = action.payload;
      const mesh = state.layers[state.selectedLayerIndex].shapes.find(s => s.id === meshId);
      if (!mesh || !mesh.mesh || !mesh.mesh.nodes) return;
      let flat = mesh.mesh.nodes.flat();
      flat[nodeIdx].x = x;
      flat[nodeIdx].y = y;
    },
    setGradientTarget: (state, action) => {
      console.log("setGradientTarget Reducer Triggered:", action.payload);
      state.gradientTarget = action.payload;
    },
    selectPage: (state, action) => {
      state.currentPageIndex = action.payload;
    },
    renamePage: (state, action) => {
      const { pageIndex, newName } = action.payload;
      if (state.pages[pageIndex]) {
        state.pages[pageIndex].name = newName;
      }
    },
    setPageMargin: (state, action) => {
      state.pageMargin = { ...state.pageMargin, ...action.payload };
    },
    movePage: (state, action) => {
      const { from, to } = action.payload;
      if (
        from < 0 ||
        to < 0 ||
        from >= state.pages.length ||
        to >= state.pages.length ||
        from === to
      ) return;
      const [moved] = state.pages.splice(from, 1);
      state.pages.splice(to, 0, moved);
      state.currentPageIndex = to;
    },
    setConnectorMode: (state, action) => {
      state.connectorMode = action.payload;
    },
    setConnectorOrthogonal: (state, action) => {
      state.connectorOrthogonal = action.payload;
    },
    setConnectorCurvature: (state, action) => {
      state.connectorCurvature = action.payload;
    },
    setConnectorSpacing(state, action) {
      state.connectorSpacing = action.payload;
    },
    setConnectorLength(state, action) {
      state.connectorLength = action.payload;
    },
    setConnectorLineStyle(state, action) {
      state.connectorLineStyle = action.payload;
    },
    setConnectorNoOverlap(state, action) {
      state.connectorNoOverlap = action.payload;
    },
    setTweakMode(state, action) {
      state.tweakMode = action.payload;
    },
    setTweakRadius(state, action) {
      state.tweakRadius = action.payload;
    },
    setTweakForce(state, action) {
      state.tweakForce = action.payload;
    },
    setTweakFidelity(state, action) {
      state.tweakFidelity = action.payload;
    },
    cloneShape: (state, action) => {
      const { id } = action.payload;
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const shape = selectedLayer.shapes.find(s => s.id === id);
      if (!shape) return;


      const shapeClone = JSON.parse(JSON.stringify(shape));

      const newShape = {
        ...shapeClone,
        id: `shape-${Date.now()}-${Math.random()}`,
        x: (shape.x || 0) + 10,
        y: (shape.y || 0) + 10,
        name: (shape.name || shape.type || "Shape") + " (clone)",
        isClone: true,
      };

      selectedLayer.shapes.push(newShape);
      state.selectedShapeIds = [newShape.id];
    },
    unlinkClone: (state, action) => {
      const { id } = action.payload;
      const selectedLayer = state.layers[state.selectedLayerIndex];
      const shape = selectedLayer.shapes.find(s => s.id === id);
      if (shape && shape.isClone) {
        delete shape.isClone;

        if (shape.name && shape.name.endsWith(" (clone)")) {
          shape.name = shape.name.replace(/ \(clone\)$/, "");
        }
      }
    },
    makeSelectedNodesSymmetric: (state) => {
      if (state.selectedNodePoints.length === 0) return;
      const layer = state.layers[state.selectedLayerIndex];
      if (!layer) return;

      state.selectedNodePoints.forEach((node) => {
        const shape = layer.shapes.find((shape) => shape.id === node.shapeId);
        if (!shape || !Array.isArray(shape.points)) return;
        let pt = shape.points[node.index];

        if (shape.type === "Calligraphy" && pt && typeof pt === "object" && pt.x !== undefined && pt.y !== undefined) {
          const defaultLen = 40;
          shape.points[node.index] = {
            ...pt,
            controlPoint1: { x: pt.x - defaultLen, y: pt.y },
            controlPoint2: { x: pt.x + defaultLen, y: pt.y },
            symmetric: true,
          };
          return;
        }


        if (pt && typeof pt === "object" && pt.x !== undefined && pt.y !== undefined) {
          let cp1 = pt.controlPoint1;
          let cp2 = pt.controlPoint2;
          const defaultLen = 40;

          if (cp1 && cp2) {
            const dx = cp1.x - pt.x;
            const dy = cp1.y - pt.y;
            shape.points[node.index] = {
              ...pt,
              controlPoint1: { x: pt.x + dx, y: pt.y + dy },
              controlPoint2: { x: pt.x - dx, y: pt.y - dy },
              symmetric: true,
            };
          } else if (cp1) {
            const dx = cp1.x - pt.x;
            const dy = cp1.y - pt.y;
            shape.points[node.index] = {
              ...pt,
              controlPoint1: { x: pt.x + dx, y: pt.y + dy },
              controlPoint2: { x: pt.x - dx, y: pt.y - dy },
              symmetric: true,
            };
          } else if (cp2) {
            const dx = cp2.x - pt.x;
            const dy = cp2.y - pt.y;
            shape.points[node.index] = {
              ...pt,
              controlPoint1: { x: pt.x - dx, y: pt.y - dy },
              controlPoint2: { x: pt.x + dx, y: pt.y + dy },
              symmetric: true,
            };
          } else {
            shape.points[node.index] = {
              ...pt,
              controlPoint1: { x: pt.x - defaultLen, y: pt.y },
              controlPoint2: { x: pt.x + defaultLen, y: pt.y },
              symmetric: true,
            };
          }
        }

      });

      layer.shapes = [...layer.shapes];
    },
    autoSmoothSelectedNodes: (state) => {
      if (state.selectedNodePoints.length === 0) return;

      const layer = state.layers[state.selectedLayerIndex];
      if (!layer) return;

      state.selectedNodePoints.forEach((node) => {
        const shape = layer.shapes.find((shape) => shape.id === node.shapeId);
        if (!shape || !Array.isArray(shape.points)) return;

        let pt = shape.points[node.index];


        if (Array.isArray(pt) && pt.length >= 2) {
          function chaikin(points, iterations = 2) {
            let pts = points;
            for (let iter = 0; iter < iterations; iter++) {
              const newPts = [];
              for (let i = 0; i < pts.length - 1; i++) {
                const [x0, y0] = pts[i];
                const [x1, y1] = pts[i + 1];
                newPts.push(
                  [0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1],
                  [0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1]
                );
              }
              newPts.unshift(pts[0]);
              newPts.push(pts[pts.length - 1]);
              pts = newPts;
            }
            return pts;
          }
          shape.points = chaikin(shape.points, 3);
          return;
        }


        if (
          pt &&
          typeof pt === "object" &&
          pt.x !== undefined &&
          pt.y !== undefined &&
          shape.type === "Calligraphy"
        ) {
          function chaikinObj(points, iterations = 2) {
            let pts = points;
            for (let iter = 0; iter < iterations; iter++) {
              const newPts = [];
              for (let i = 0; i < pts.length - 1; i++) {
                const p0 = pts[i];
                const p1 = pts[i + 1];
                newPts.push(
                  {
                    x: 0.75 * p0.x + 0.25 * p1.x,
                    y: 0.75 * p0.y + 0.25 * p1.y,
                  },
                  {
                    x: 0.25 * p0.x + 0.75 * p1.x,
                    y: 0.25 * p0.y + 0.75 * p1.y,
                  }
                );
              }
              newPts.unshift({ ...pts[0] });
              newPts.push({ ...pts[pts.length - 1] });
              pts = newPts;
            }
            return pts;
          }
          shape.points = chaikinObj(shape.points, 3);
          return;
        }


        if (pt && typeof pt === "object" && pt.x !== undefined && pt.y !== undefined) {
          const x = pt.x, y = pt.y;
          const prevPt = shape.points[node.index - 1] || pt;
          const nextPt = shape.points[node.index + 1] || pt;

          const prev = Array.isArray(prevPt)
            ? { x: prevPt[0], y: prevPt[1] }
            : { x: prevPt.x, y: prevPt.y };
          const next = Array.isArray(nextPt)
            ? { x: nextPt[0], y: nextPt[1] }
            : { x: nextPt.x, y: nextPt.y };

          const toPrev = { x: x - prev.x, y: y - prev.y };
          const toNext = { x: next.x - x, y: next.y - y };

          let dirX = 0, dirY = 0;
          if (prev !== pt && next !== pt) {
            dirX = (toPrev.x / (Math.hypot(toPrev.x, toPrev.y) || 1)) + (toNext.x / (Math.hypot(toNext.x, toNext.y) || 1));
            dirY = (toPrev.y / (Math.hypot(toPrev.x, toPrev.y) || 1)) + (toNext.y / (Math.hypot(toNext.x, toNext.y) || 1));
          } else if (next !== pt) {
            dirX = toNext.x / (Math.hypot(toNext.x, toNext.y) || 1);
            dirY = toNext.y / (Math.hypot(toNext.x, toNext.y) || 1);
          } else if (prev !== pt) {
            dirX = toPrev.x / (Math.hypot(toPrev.x, toPrev.y) || 1);
            dirY = toPrev.y / (Math.hypot(toPrev.x, toPrev.y) || 1);
          }

          const dirLen = Math.hypot(dirX, dirY) || 1;
          const handleLength = 40;

          const controlPoint1 = {
            x: x - (dirX / dirLen) * handleLength,
            y: y - (dirY / dirLen) * handleLength,
          };
          const controlPoint2 = {
            x: x + (dirX / dirLen) * handleLength,
            y: y + (dirY / dirLen) * handleLength,
          };

          shape.points[node.index] = {
            x,
            y,
            controlPoint1,
            controlPoint2,
            smooth: true,
          };
        }
      });

      layer.shapes = [...layer.shapes];
    },
    addCornerLPE: (state) => {
      if (!state.selectedNodePoints?.length) return;
      const layer = state.layers[state.selectedLayerIndex];
      if (!layer) return;

      layer.shapes = layer.shapes.map((shape) => {
        const selectedNodes = state.selectedNodePoints.filter(n => n.shapeId === shape.id);
        console.log("addCornerLPE called", state.selectedNodePoints);
        if (!selectedNodes.length) return shape;

        const updatedPoints = shape.points.map((pt, idx) => {
          if (!selectedNodes.some(sel => sel.index === idx)) return pt;

          return {
            ...pt,
            cornerLPE: { radius: pt.cornerLPE?.radius || 10 }
          };
        });

        return { ...shape, points: updatedPoints };
      });
    },
    updateCornerLPE: (state, action) => {
      const { shapeId, pointIdx, radius } = action.payload;
      const layer = state.layers[state.selectedLayerIndex];
      if (!layer) return;
      const shape = layer.shapes.find(s => s.id === shapeId);
      if (!shape) return;
      if (!shape.points[pointIdx]) return;
      shape.points[pointIdx].cornerLPE = { radius };
    },
    objectToPath: (state) => {
      const layer = state.layers[state.selectedLayerIndex];
      if (!layer) return;

      state.selectedShapeIds.forEach((shapeId) => {
        const shape = layer.shapes.find(s => s.id === shapeId);
        if (!shape) return;


        if (shape.type === "Rectangle") {
          const { x, y, width, height } = shape;
          shape.type = "Polygon";
          shape.points = [
            { x: x, y: y },
            { x: x + width, y: y },
            { x: x + width, y: y + height },
            { x: x, y: y + height }
          ];
        }

        else if (shape.type === "Circle") {
          const { x, y, radius } = shape;
          const numPoints = 36;
          shape.type = "Polygon";
          shape.points = Array.from({ length: numPoints }, (_, i) => {
            const angle = (2 * Math.PI * i) / numPoints;
            return {
              x: x + radius * Math.cos(angle),
              y: y + radius * Math.sin(angle)
            };
          });
        }

        else if (shape.type === "Star") {
          const { x, y, innerRadius, outerRadius, corners } = shape;
          const numPoints = (corners || 5) * 2;
          shape.type = "Polygon";
          shape.points = Array.from({ length: numPoints }, (_, i) => {
            const angle = (Math.PI * i) / corners;
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            return {
              x: x + r * Math.cos(angle),
              y: y + r * Math.sin(angle)
            };
          });
        }

      });


      if (state.selectedShapeIds.length === 1) {
        const shape = layer.shapes.find(s => s.id === state.selectedShapeIds[0]);
        if (shape && Array.isArray(shape.points)) {
          state.controlPoints = shape.points.map(pt =>
            Array.isArray(pt) ? { x: pt[0], y: pt[1] } : pt
          );
        }
      }
    },
    setBlockProgression: (state, action) => {
      state.blockProgression = action.payload;
    },
    selectAllShapesInAllLayers: (state) => {

      const allShapeIds = state.layers.flatMap(layer => layer.shapes.map(shape => shape.id));
      state.selectedShapeIds = allShapeIds;
    },
  },

});

export const {
  addControlPoint,
  updateControlPoint,
  setSelectedTool,
  setFontSize,
  addText,
  setBezierOption,
  bezierOption,
  setFontFamily,
  setAlignment,
  setStrokeStyleForSelectedShape,
  addShape,
  setStrokeColor,
  setStrokeWidth,
  addPenPoint,
  clearPen,
  addPencilPoint,
  clearPencil,
  addCalligraphyPoint,
  clearCalligraphy,
  selectShape,
  clearSelection,
  addPathPoint,
  finalizePath,
  setFillColor,
  updateToolState,
  removeShape,
  selecteAllShapes,
  deselectAllShapes,
  updateSelection,
  addLayer,
  deleteLayer,
  selectLayer,
  moveLayerUp,
  moveLayerDown,
  updateShapePosition,
  addSpiroPoint,
  addBSplinePoint,
  addParaxialPoint,
  clearBSplinePoints,
  clearPoints,
  moveLayer,
  deleteShape,
  moveShapeUp,
  moveShapeDown,
  moveShapeToLayer,
  createNewPage,
  zoomIn,
  zoomOut,
  cut,
  paste,
  autoSmoothSelectedNodes,
  copy,
  undo,
  redo,
  addImage,
  uploadImage,
  renameLayer,
  duplicateLayer,
  duplicateShape,
  toggleLayerVisibility,
  groupShapes,
  ungroupShapes,
  clearLayerShapes,
  clearControlPoints,
  setControlPoints,
  saveState,
  saveAsState,
  strokeColor,
  fillColor,
  selectedShapeIds,
  setSprayProperties,
  addSprayShapes,
  addBezierPoint,
  clearBezier,
  updateSpiralProperties,
  jumpToHistory,
  moveShapeIntoGroup,
  selectAllShapesInGroup,
  setFillColorForSelectedShape,
  setStrokeColorForSelectedShape,
  setStrokeWidthForSelectedShape,
  setPageSize,
  clearSpiroPoints,
  clearParaxialPoints,
  updateParaxialPoint,
  toggleShowInitialScreen,
  setFontStyle,
  setScale,
  setCalligraphyOption,
  setCalligraphyWidth,
  setCalligraphyThinning,
  setCalligraphyMass,
  setPencilOption,
  setPencilSmoothing,
  setPencilMode,
  setPencilScale,
  insertNode,
  joinSelectedNodePoints,
  joinSelectedEndNodesWithSegment,
  separateSelectedPaths,
  selectNodePoint,
  updateNodePosition,
  makeSelectedNodesCorner,
  makeSelectedNodesSmooth,
  makeSelectedNodesCurve,
  makeSelectedNodesStraight,
  makeShapeCorner,
  strokePath,
  updateStrokeControlPoint,
  setStrokeToPathMode,
  handleUnion,
  intersection,
  setSnapping,
  raiseShapeToTop,
  lowerShape,
  setShapeBuilderMode,
  setSprayMode,
  setSprayEraserMode,
  addShapes,
  removeShapes,
  setCalligraphyAngle,
  setCalligraphyFixation,
  setCalligraphyCaps,
  setEraserMode,
  updateShapeVisibility,
  updateShapeOpacity,
  setEraserWidth,
  setEraserThinning,
  setEraserCaps,
  setEraserTremor,
  setEraserMass,
  setPickedColor,
  setDropperMode,
  setDropperTarget,
  setAssignAverage,
  setAltInverse,
  setGradientType,
  setPressureEnabled,
  setPressureMin,
  setPressureMax,
  setBrushCaps,
  addMeasurementLine,
  setMeasurementDraft,
  setMeasurementFontSize,
  setMeasurementPrecision,
  setMeasurementScale,
  setMeasurementUnit,
  setShowMeasureBetween,
  setIgnoreFirstLast,
  setReverseMeasure,
  setToGuides,
  setPhantomMeasure,
  setMarkDimension,
  setMeasurementOffset,
  setConvertToItem,
  removeMeasurementLine,
  setReplaceShapes,
  setPaintBucketFillBy,
  setPaintBucketThreshold,
  setPaintBucketGrowSink,
  setPaintBucketCloseGaps,
  setMeshMode,
  setMeshRows,
  setMeshCols,
  updateMeshNode,
  setGradientTarget,
  setZoomLevel,
  selectPage,
  renamePage,
  setPageMargin,
  movePage,
  setConnectorMode,
  setConnectorOrthogonal,
  setConnectorCurvature,
  setConnectorSpacing,
  setConnectorLength,
  setConnectorLineStyle,
  setConnectorNoOverlap,
  setTweakMode,
  setTweakRadius,
  setTweakForce,
  setTweakFidelity,
  cloneShape,
  unlinkClone,
  clearSelectedNodePoints,
  breakPathAtSelectedNode,
  makeSelectedNodesSymmetric,
  addCornerLPE,
  updateCornerLPE,
  objectToPath,
  setBlockProgression,
  selectAllShapesInAllLayers,
} = toolSlice.actions;

export default toolSlice.reducer;