import { createSlice } from "@reduxjs/toolkit";
import { shapes } from "konva/lib/Shape";
import { generateSpiralPath } from "../../components/Panel/Panel"


const toolSlice = createSlice({
  name: "tool",
  initialState: {
    selectedTool: null,
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
    pencilSmoothing: 20,
    pencilOption: "None",
    pencilMode: "Bezier Path",
    pencilScale: 0,
    showInitialScreen: JSON.parse(localStorage.getItem("showEveryTime")) ?? true,
    shapeBuilderMode: "combine",
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
  },

  reducers: {

    clearSelectedNodePoints: (state) => {
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
      if (state.selectedNodePoints.length === 2) {
        const [firstNode, secondNode] = state.selectedNodePoints;

        const layer = state.layers[state.selectedLayerIndex];
        if (!layer) {
          console.error("No layer selected.");
          return;
        }

        const firstShape = layer.shapes.find((shape) => shape.id === firstNode.shapeId);
        const secondShape = layer.shapes.find((shape) => shape.id === secondNode.shapeId);

        if (!firstShape || !secondShape) {
          console.error("One or both shapes not found.");
          return;
        }

        const firstPoint = firstShape.points[firstNode.index];
        const secondPoint = secondShape.points[secondNode.index];

        if (!firstPoint || !secondPoint) {
          console.error("Invalid node points selected.");
          return;
        }


        const adjustedSecondPoint = Array.isArray(secondPoint)
          ? [
            secondPoint[0] + (secondShape.x - firstShape.x || 0),
            secondPoint[1] + (secondShape.y - firstShape.y || 0),
          ]
          : {
            x: secondPoint.x + (secondShape.x - firstShape.x || 0),
            y: secondPoint.y + (secondShape.y - firstShape.y || 0),
          };


        const connectingPath = Array.isArray(firstPoint)
          ? [
            [firstPoint[0], firstPoint[1]],
            [adjustedSecondPoint[0], adjustedSecondPoint[1]],
          ]
          : [
            { x: firstPoint.x, y: firstPoint.y },
            { x: adjustedSecondPoint.x, y: adjustedSecondPoint.y },
          ];


        const mergedPoints = [
          ...firstShape.points.slice(0, firstNode.index + 1),
          ...connectingPath,
          ...secondShape.points.slice(secondNode.index),
          ...secondShape.points.slice(0, secondNode.index),
          ...firstShape.points.slice(firstNode.index + 1),
        ];


        firstShape.points = mergedPoints;


        layer.shapes = layer.shapes.filter((shape) => shape.id !== secondShape.id);

        console.log("Shapes connected and merged successfully!");
      } else {
        console.error("Exactly two nodes must be selected to join end nodes.");
      }
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
      state.shapes.push(action.payload);
      console.log("New shape added with name:", newShape.name);
    },
    addShapes: (state, action) => {
      const selectedLayer = state.layers[state.selectedLayerIndex];
      selectedLayer.shapes.push(...action.payload);
    },
    zoomIn: (state) => {
      state.zoomLevel = Math.min(state.zoomLevel + 0.1, 3);
    },
    zoomOut: (state) => {
      state.zoomLevel = Math.max(state.zoomLevel - 0.1, 0.5);
    },
    copy: (state) => {
      if (state.selectedShapeId) {
        const selectedLayer = state.layers[state.selectedLayerIndex];
        const shape = selectedLayer.shapes.find(
          (shape) => shape.id === state.selectedShapeId
        );
        if (shape) {
          state.clipboard = { ...shape };
          state.clipboadType = "shape";
        }
      } else if (state.selectedLayerIndex !== null) {
        const selectedLayer = state.layers[state.selectedLayerIndex];
        state.clipboard = {
          ...selectedLayer,
          shapes: [...selectedLayer.shapes],
        };
        state.clipboadType = "layer";
      }
    },
    cut: (state) => {
      if (state.selectedShapeId) {
        const selectedLayer = state.layers[state.selectedLayerIndex];
        const shapeIndex = selectedLayer.shapes.findIndex(
          (shape) => shape.id === state.selectedShapeId
        );
        if (shapeIndex !== -1) {
          state.clipboard = selectedLayer.shapes[shapeIndex];
          state.clipboadType = "shape";
          selectedLayer.shapes.splice(shapeIndex, 1);
          state.selectedShapeId = null;
        }
      } else if (state.selectedLayerIndex !== null) {
        state.clipboard = {
          ...state.layers[state.selectedLayerIndex],
          shapes: [...state.layers[state.selectedLayerIndex].shapes],
        };
        state.clipboadType = "layer";
        state.layers.splice(state.selectedLayerIndex, 1);
        state.selectedLayerIndex = Math.max(0, state.selectedLayerIndex - 1);
      }

      state.history.push(JSON.parse(JSON.stringify(state)));
      state.future = [];
    },
    paste: (state) => {
      if (state.clipboadType === "shape" && state.clipboard) {
        const targetLayer = state.layers[state.selectedLayerIndex];
        const newShape = {
          ...state.clipboard,
          id: `shape-${Date.now()}`,
          x: state.clipboard.x + 10,
          y: state.clipboard.y + 10,
        };
        targetLayer.shapes.push(newShape);
        state.selectedShapeId = newShape.id;
      } else if (state.clipboadType === "layer" && state.clipboard) {
        const newLayer = {
          ...state.clipboard,
          name: `${state.clipboard.name}`,
          shapes: state.clipboard.shapes.map((shape) => ({
            ...shape,
            id: `shape-${Date.now()}-${Math.random()}`,
          })),
        };
        state.layers.splice(state.selectedLayerIndex + 1, 0, newLayer);
        state.selectedLayerIndex += 1;
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
        const newShape = {
          ...shapeToDuplicate,
          id: `shape-${Date.now()}`,
          x: shapeToDuplicate.x + 10,
          y: shapeToDuplicate.y + 10,
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
      const { groupId } = action.payload;
      const selectedLayer = state.layers[state.selectedLayerIndex];

      const groupShapeIndex = selectedLayer.shapes.findIndex(
        (shape) => shape.id === groupId
      );

      if (groupShapeIndex !== -1) {
        const groupShape = selectedLayer.shapes[groupShapeIndex];

        selectedLayer.shapes.splice(groupShapeIndex, 1);

        groupShape.shapes.forEach((shape) => {
          selectedLayer.shapes.push({ ...shape });
        });

        state.selectedShapeIds = [];
      }
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
      const newLayerName = `Layer ${state.layers.length + 1}`;
      state.layers.push({ name: newLayerName, shapes: [] });
      state.selectedLayerIndex = state.layers.length - 1;

      state.history.push(JSON.parse(JSON.stringify(state)));
      state.future = [];
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
      if (state.selectedNodePoints.length === 2) {
        const [firstNode, secondNode] = state.selectedNodePoints;

        const layer = state.layers[state.selectedLayerIndex];
        if (!layer) {
          console.error("No layer selected.");
          return;
        }

        const firstShape = layer.shapes.find((shape) => shape.id === firstNode.shapeId);
        const secondShape = layer.shapes.find((shape) => shape.id === secondNode.shapeId);

        if (!firstShape || !secondShape) {
          console.error("One or both shapes not found.");
          return;
        }

        if (firstShape.type === "Polygon" && secondShape.type === "Polygon") {

          const mergedPoints = [
            ...firstShape.points,
            ...secondShape.points.map((point) => ({
              x: point.x + (secondShape.x - firstShape.x),
              y: point.y + (secondShape.y - firstShape.y),
            })),
          ];
          firstShape.points = mergedPoints;
        } else if (firstShape.type === "Rectangle" && secondShape.type === "Rectangle") {

          const x1 = Math.min(firstShape.x, secondShape.x);
          const y1 = Math.min(firstShape.y, secondShape.y);
          const x2 = Math.max(firstShape.x + firstShape.width, secondShape.x + secondShape.width);
          const y2 = Math.max(firstShape.y + firstShape.height, secondShape.y + secondShape.height);

          firstShape.x = x1;
          firstShape.y = y1;
          firstShape.width = x2 - x1;
          firstShape.height = y2 - y1;
        } else if (firstShape.type === "Circle" && secondShape.type === "Circle") {

          const x1 = Math.min(firstShape.x - firstShape.radius, secondShape.x - secondShape.radius);
          const y1 = Math.min(firstShape.y - firstShape.radius, secondShape.y - secondShape.radius);
          const x2 = Math.max(firstShape.x + firstShape.radius, secondShape.x + secondShape.radius);
          const y2 = Math.max(firstShape.y + firstShape.radius, secondShape.y + secondShape.radius);

          firstShape.x = (x1 + x2) / 2;
          firstShape.y = (y1 + y2) / 2;
          firstShape.radius = Math.max((x2 - x1) / 2, (y2 - y1) / 2);
        } else if (firstShape.type === "Star" && secondShape.type === "Star") {

          const x1 = Math.min(firstShape.x - firstShape.outerRadius, secondShape.x - secondShape.outerRadius);
          const y1 = Math.min(firstShape.y - firstShape.outerRadius, secondShape.y - secondShape.outerRadius);
          const x2 = Math.max(firstShape.x + firstShape.outerRadius, secondShape.x + secondShape.outerRadius);
          const y2 = Math.max(firstShape.y + firstShape.outerRadius, secondShape.y + secondShape.outerRadius);

          firstShape.x = (x1 + x2) / 2;
          firstShape.y = (y1 + y2) / 2;
          firstShape.outerRadius = Math.max((x2 - x1) / 2, (y2 - y1) / 2);
          firstShape.innerRadius = firstShape.outerRadius / 2;
        } else if (firstShape.type === "Calligraphy" && secondShape.type === "Calligraphy") {
          const firstPoint = firstShape.points[firstNode.index];
          const secondPoint = secondShape.points[secondNode.index];


          const adjustedSecondPoint = [
            secondPoint[0] + (secondShape.x - firstShape.x),
            secondPoint[1] + (secondShape.y - firstShape.y),
          ];


          const connectingPath = [
            [firstPoint[0], firstPoint[1]],
            [adjustedSecondPoint[0], adjustedSecondPoint[1]],
          ];


          const firstShapeBefore = firstShape.points.slice(0, firstNode.index + 1);
          const firstShapeAfter = firstShape.points.slice(firstNode.index + 1);

          const secondShapeBefore = secondShape.points.slice(0, secondNode.index + 1);
          const secondShapeAfter = secondShape.points.slice(secondNode.index + 1);


          const reshapedPoints = [
            ...firstShapeBefore,
            ...connectingPath,
            ...secondShapeAfter,
            ...secondShapeBefore,
            ...firstShapeAfter,
          ];


          firstShape.points = reshapedPoints;


          layer.shapes = layer.shapes.filter((shape) => shape.id !== secondShape.id);

          console.log("Calligraphy shapes connected successfully!");
        } else if (firstShape.type === "Pencil" && secondShape.type === "Pencil") {
          const firstPoint = firstShape.points[firstNode.index];
          const secondPoint = secondShape.points[secondNode.index];


          const adjustedSecondPoint = [
            secondPoint[0] + (secondShape.x - firstShape.x),
            secondPoint[1] + (secondShape.y - firstShape.y),
          ];


          const connectingPath = [
            [firstPoint[0], firstPoint[1]],
            [adjustedSecondPoint[0], adjustedSecondPoint[1]],
          ];


          const firstShapeBefore = firstShape.points.slice(0, firstNode.index + 1);
          const firstShapeAfter = firstShape.points.slice(firstNode.index + 1);

          const secondShapeBefore = secondShape.points.slice(0, secondNode.index + 1);
          const secondShapeAfter = secondShape.points.slice(secondNode.index + 1);


          const reshapedPoints = [
            ...firstShapeBefore,
            ...connectingPath,
            ...secondShapeAfter,
            ...secondShapeBefore,
            ...firstShapeAfter,
          ];


          firstShape.points = reshapedPoints;


          layer.shapes = layer.shapes.filter((shape) => shape.id !== secondShape.id);

          console.log("Pencil shapes connected successfully!");
        } else {
          console.error("Joining is not supported for these shape types.");
          return;
        }


        layer.shapes = layer.shapes.filter((shape) => shape.id !== secondShape.id);

        console.log("Shapes joined successfully!");


        state.selectedNodePoints = [];
      } else {
        console.error("You must select exactly two nodes to join them.");
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

      state.selectedNodePoints.forEach((node) => {
        const shape = layer.shapes.find((shape) => shape.id === node.shapeId);

        if (!shape) {
          console.error(`Shape with ID ${node.shapeId} not found.`);
          return;
        }

        if (Array.isArray(shape.points)) {
          if (shape.type === "Pencil") {
            if (Array.isArray(shape.points[node.index]) && shape.points[node.index].length === 2) {

              shape.points[node.index] = [
                shape.points[node.index][0] + 5,
                shape.points[node.index][1] + 5,
              ];
              console.log(
                `Node at index ${node.index} in Pencil shape ${node.shapeId} has been updated to [${shape.points[node.index][0]}, ${shape.points[node.index][1]}].`
              );
            } else {
              console.error(`Invalid point structure at index ${node.index} in Pencil shape.`);
            }
          } else {
            const point = shape.points[node.index];
            if (point && typeof point === "object") {

              shape.points[node.index] = {
                x: point.x + 5,
                y: point.y + 5,
              };
              console.log(
                `Node at index ${node.index} in shape ${node.shapeId} has been updated to {x: ${point.x + 20}, y: ${point.y + 20}}.`
              );
            } else {
              console.error(`Invalid point structure at index ${node.index} in shape ${node.shapeId}.`);
            }
          }


          if (shape.type === "Rectangle") {
            const xs = shape.points.map((p) => p.x);
            const ys = shape.points.map((p) => p.y);

            shape.x = Math.min(...xs);
            shape.y = Math.min(...ys);
            shape.width = Math.max(...xs) - shape.x;
            shape.height = Math.max(...ys) - shape.y;
          } else if (shape.type === "Polygon" || shape.type === "Pencil") {
            const xs = shape.points.map((p) => (Array.isArray(p) ? p[0] : p.x));
            const ys = shape.points.map((p) => (Array.isArray(p) ? p[1] : p.y));

            shape.x = Math.min(...xs);
            shape.y = Math.min(...ys);
          }
        } else {
          console.error(`Shape with ID ${node.shapeId} does not have a valid points array.`);
        }
      });


      layer.shapes = [...layer.shapes];

      console.log("The selected node point has been updated with x and y increased by 20px.");
    },
    makeSelectedNodesSmooth: (state) => {
      if (state.selectedNodePoints.length === 0) {
        console.error("No nodes selected to make smooth.");
        return;
      }

      const layer = state.layers[state.selectedLayerIndex];
      if (!layer) {
        console.error("No layer selected.");
        return;
      }


      const updatedShapes = layer.shapes.map((shape) => {
        const selectedNode = state.selectedNodePoints.find((node) => node.shapeId === shape.id);

        if (!selectedNode) {
          return shape;
        }

        if (Array.isArray(shape.points)) {
          const point = shape.points[selectedNode.index];

          if (point && typeof point === "object") {
            const prevPoint = shape.points[selectedNode.index - 1] || point;
            const nextPoint = shape.points[selectedNode.index + 1] || point;

            const radius = 50;

            const angleToPrev = Math.atan2(prevPoint.y - point.y, prevPoint.x - point.x);
            const angleToNext = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x);

            const controlPoint1 = {
              x: point.x + radius * Math.cos(angleToPrev + Math.PI / 2),
              y: point.y + radius * Math.sin(angleToPrev + Math.PI / 2),
            };

            const controlPoint2 = {
              x: point.x + radius * Math.cos(angleToNext - Math.PI / 2),
              y: point.y + radius * Math.sin(angleToNext - Math.PI / 2),
            };


            const updatedPoints = [...shape.points];
            updatedPoints[selectedNode.index] = {
              ...point,
              controlPoint1,
              controlPoint2,
              smooth: true,
            };

            return {
              ...shape,
              points: updatedPoints,
            };
          }
        }

        return shape;
      });


      layer.shapes = updatedShapes;

      console.log("Selected nodes have been made smooth and circular.");
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
      if (!layer) {
        console.error("No layer selected.");
        return;
      }

      const shape = layer.shapes.find((shape) => shape.id === state.selectedShapeId);
      if (!shape) {
        console.error("Shape not found.");
        return;
      }


      const strokeWidth = shape.strokeWidth || 1;
      const boundingBox = {
        x: shape.x - strokeWidth / 2,
        y: shape.y - strokeWidth / 2,
        width: (shape.width || 0) + strokeWidth,
        height: (shape.height || 0) + strokeWidth,
      };


      const strokeControlPoints = [
        { x: boundingBox.x, y: boundingBox.y, position: "top-left" },
        { x: boundingBox.x + boundingBox.width, y: boundingBox.y, position: "top-right" },
        { x: boundingBox.x + boundingBox.width, y: boundingBox.y + boundingBox.height, position: "bottom-right" },
        { x: boundingBox.x, y: boundingBox.y + boundingBox.height, position: "bottom-left" },
      ];


      state.controlPoints = strokeControlPoints;

      console.log("Stroke control points added for the selected shape:", strokeControlPoints);
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
} = toolSlice.actions;

export default toolSlice.reducer;