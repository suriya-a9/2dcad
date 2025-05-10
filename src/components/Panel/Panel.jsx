import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { BsPaintBucket, BsPencil, BsVectorPen } from "react-icons/bs";
import { FaRegCircle, FaRegSquare, FaRegStar } from "react-icons/fa";
import { BiPolygon, BiSolidEraser, BiSolidEyedropper } from "react-icons/bi";
import { LuTextCursor } from "react-icons/lu";
import { TiSpiral } from "react-icons/ti";
import { PiPaintBrush } from "react-icons/pi";
import { GrSelect } from "react-icons/gr";
import * as React from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import './Panel.css'
import {
  Stage,
  Layer,
  FastLayer,
  Rect,
  Circle,
  Star,
  RegularPolygon as KonvaPolygon,
  Line,
  Transformer,
  Path,
  Text as KonvaText,
  Image,
  Group,
  Shape,
} from "react-konva";
import { useSelector, useDispatch } from "react-redux";
import {
  addShape,
  addPenPoint,
  addBezierPoint,
  clearPen,
  addPencilPoint,
  clearPencil,
  addCalligraphyPoint,
  selectShape,
  addControlPoint,
  updateControlPoint,
  clearSelection,
  updateShapePosition,
  clearControlPoints,
  setFontStyle,
  finalizePath,
  addPathPoint,
  redo,
  setStrokeColor,
  setFontSize,
  setFontFamily,
  setAlignment,
  setFillColor,
  removeShape,
  addSpiroPoint,
  addBSplinePoint,
  addParaxialPoint,
  clearSpiroPoints,
  clearParaxialPoints,
  addSprayShapes,
  clearBSplinePoints,
  deleteShape,
  selecteAllShapes,
  undo,
  cut,
  zoomIn,
  zoomOut,
  paste,
  addText,
  setControlPoints,
  insertNode,
  selectNodePoint,
  separateSelectedPaths,
  updateNodePosition,
  updateStrokeControlPoint,
  setStrokeToPathMode,
} from "../../Redux/Slice/toolSlice";

const generateSpiralPath = (x, y, turns = 5, radius = 50, divergence = 1) => {
  const path = [];
  const angleStep = (Math.PI * 2 * turns) / 100;

  for (let i = 0; i <= 100; i++) {
    const angle = i * angleStep;
    const spiralX = x + ((radius + (divergence * i)) * Math.cos(angle));
    const spiralY = y + ((radius + (divergence * i)) * Math.sin(angle));
    path.push(i === 0 ? `M ${spiralX},${spiralY}` : `L ${spiralX},${spiralY}`);
  }

  return path.join(" ");
};

const toolCursors = {
  Bezier: <BsVectorPen size={20} color="black" />,
  Pencil: <BsPencil size={20} color="black" />,
  Calligraphy: <PiPaintBrush size={20} color="black" />,
  Eraser: <BiSolidEraser size={20} color="black" />,
  Text: <LuTextCursor size={20} color="black" />,
  Spiral: <TiSpiral size={20} color="black" />,
  Circle: <FaRegCircle size={20} color="black" />,
  Rectangle: <FaRegSquare size={20} color="black" />,
  Star: <FaRegStar size={20} color="black" />,
  Polygon: <BiPolygon size={20} color="black" />,
};

const Panel = ({ textValue, isSidebarOpen, stageRef, printRef, setActiveTab, toggleSidebar }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const selectedNodePoints = useSelector((state) => state.tool.selectedNodePoints);
  const selectedFontSize = useSelector((state) => state.tool.selectedFontSize);
  const selectedFontFamily = useSelector((state) => state.tool.selectedFontFamily);
  const selectedAlignment = useSelector((state) => state.tool.selectedAlignment);
  const isStrokeToPathMode = useSelector((state) => state.tool.isStrokeToPathMode);
  const selectedFontStyle = useSelector((state) => state.tool.selectedFontStyle);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShapeClosed, setIsShapeClosed] = useState(false);
  const bezierOption = useSelector((state) => state.tool.bezierOption);
  const controlPoints = useSelector((state) => state.tool.controlPoints);
  console.log("Redux Control Points:", controlPoints);
  const [newShape, setNewShape] = useState(null);
  const [isMouseMoved, setIsMouseMoved] = useState(false);
  const [eraserLines, setEraserLines] = useState([]);
  const shapes = useSelector((state) => {
    const layers = state.tool.layers || [];
    const selectedLayer = layers[state.tool.selectedLayerIndex] || {};
    return selectedLayer.shapes || [];
  });
  const penPoints = useSelector((state) => state.tool.penPoints);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isCustomCursorVisible, setIsCustomCursorVisible] = useState(false);
  const selectedTool = useSelector((state) => state.tool.selectedTool);
  const isSnappingEnabled = useSelector((state) => state.tool.isSnappingEnabled);
  const selectedShapeId = useSelector((state) => state.tool.selectedShapeId);
  const strokeColor = useSelector((state) => state.tool.strokeColor);
  const drawingPath = useSelector((state) => state.tool.drawingPath);
  const fillColor = useSelector((state) => state.tool.fillColor);
  const zoomLevel = useSelector((state) => state.tool.zoomLevel);
  const sprayAmount = useSelector((state) => state.tool.sprayAmount);
  const sprayWidth = useSelector((state) => state.tool.sprayWidth)
  const sprayScale = useSelector((state) => state.tool.sprayScale);
  const sprayFocus = useSelector((state) => state.tool.sprayFocus)
  const layers = useSelector((state) => state.tool.layers)
  const [isMouseDown, setIsMouseDown] = useState(false);
  const turns = useSelector((state) => state.tool.turns);
  const divergence = useSelector((state) => state.tool.divergence);
  const innerRadius = useSelector((state) => state.tool.innerRadius);
  const selectedShapeIds = useSelector((state) => state.tool.selectedShapeIds);
  const [snappingLines, setSnappingLines] = useState([]);

  const selectedLayerIndex = useSelector(
    (state) => state.tool.selectedLayerIndex
  );
  const { width, height } = useSelector((state) => state.tool);
  console.log("Canvas dimensions in Panel:", { width, height });

  const isDrawingRef = useRef(false);

  const transformerRef = useRef(null);
  const layerRef = useRef(null);

  const strokeWidth = 5;

  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(() => {
      if (selectedTool !== "Node" && selectedShapeIds.length > 0) {
        const selectedNodes = selectedShapeIds
          .map((id) => {
            const node = layerRef.current?.findOne(`#${id}`);
            if (!node) {
              console.error(`Node with ID ${id} not found.`);
            } else {
              console.log(`Node with ID ${id} found:`, node);
            }
            return node;
          })
          .filter(Boolean);

        if (transformerRef.current) {
          transformerRef.current.nodes(selectedNodes);
          transformerRef.current.getLayer().batchDraw();
        }
      } else {
        if (transformerRef.current) {
          transformerRef.current.nodes([]);
        }
      }
    }, 50);
  }, [selectedTool, selectedShapeIds, shapes]);

  const handleSprayTool = (e) => {

    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();

    if (!pointerPosition) return;

    const { x, y } = pointerPosition;

    const bounds = {
      x: x - sprayWidth / 2,
      y: y - sprayWidth / 2,
      width: sprayWidth,
      height: sprayWidth,
    };

    if (!selectedShapeId) {
      console.error("No shape selected for spraying");
      return;
    }

    const selectedLayer = layers[selectedLayerIndex];
    const baseShape = selectedLayer.shapes.find((shape) => shape.id === selectedShapeId);

    if (!baseShape) {
      console.error("Selected shape not found in the current layer");
      return;
    }

    const sprayBaseShape = {
      ...baseShape,
      id: `spray-clone-${Date.now()}`,
      x: 0,
      y: 0,
      width: baseShape.width * sprayScale,
      height: baseShape.height * sprayScale,
    };

    dispatch(
      addSprayShapes({
        baseShape: sprayBaseShape,
        count: sprayAmount,
        bounds,
        focus: sprayFocus,
      })
    );
  };
  const getAdjustedPointerPosition = (stage, position, scale) => {
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return null;

    return {
      x: (pointerPosition.x - position.x) / scale,
      y: (pointerPosition.y - position.y) / scale,
    };
  };
  const [textAreaVisible, setTextAreaVisible] = useState(false);
  const [textAreaPosition, setTextAreaPosition] = useState({ x: 0, y: 0 });
  const [textContent, setTextContent] = useState("");
  const spiroPoints = useSelector((state) => state.tool.spiroPoints);
  const bsplinePoints = useSelector((state) => state.tool.bsplinePoints);
  console.log("bsplinePoints in Panel:", bsplinePoints);
  const paraxialPoints = useSelector((state) => state.tool.paraxialPoints);
  const [editingTextId, setEditingTextId] = useState(null);
  const handleTextAreaBlur = () => {
    if (textContent) {
      if (editingTextId) {

        dispatch(
          updateShapePosition({
            id: editingTextId,
            text: textContent,
            fontSize: selectedFontSize,
            fontFamily: selectedFontFamily,
            fontStyle: selectedFontStyle,
            alignment: selectedAlignment,
          })
        );
      } else {

        const newTextShape = {
          id: `text-${Date.now()}`,
          type: "Text",
          x: (textAreaPosition.x - position.x) / scale,
          y: (textAreaPosition.y - position.y) / scale,
          text: textContent,
          fontSize: selectedFontSize,
          fontFamily: selectedFontFamily,
          fontStyle: selectedFontStyle,
          alignment: selectedAlignment,
          fill: strokeColor,
          width: 200,
        };
        dispatch(addShape(newTextShape));
      }
    }
    setTextAreaVisible(false);
    setEditingTextId(null);
  };

  const handleTextAreaKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTextAreaBlur();
    }
  };
  const [tempCornerRadius, setTempCornerRadius] = useState(null);
  const [isDraggingBlueCircle, setIsDraggingBlueCircle] = useState(false);
  const handleMouseDown = (e) => {
    console.log("Mouse Down Target:", e.target);
    console.log("Stage:", e.target.getStage());
    setIsMouseDown(true);
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) {
      console.error("Pointer position is null");
      return;
    }
    if (isDraggingBlueCircle) {
      console.log("Dragging blue circle, skipping rectangle creation.");
      return;
    }
    const clickedShape = e.target;
    console.log("Clicked Shape:", clickedShape);
    console.log("Clicked Shape ID:", clickedShape.attrs.id);
    console.log("Clicked Shape Attributes:", clickedShape?.attrs);
    if (clickedShape && clickedShape.attrs && clickedShape.attrs.id) {
      const shape = shapes.find((shape) => shape.id === clickedShape.attrs.id);
      if (shape) {
        const controlPoints = generateNodePoints(shape);

        dispatch(selectShape(shape.id));
        dispatch(setControlPoints(controlPoints));
      }
    } else if (selectedTool === "Node" && clickedShape && clickedShape.attrs && clickedShape.attrs.id) {
      const shapeId = clickedShape.attrs.id;
      console.log("Node Tool: Selecting shape with ID:", shapeId);


      dispatch(selectShape(shapeId));

      const shape = shapes.find((shape) => shape.id === shapeId);
      if (shape) {
        const controlPoints = generateNodePoints(shape);
        console.log("Generated Control Points:", controlPoints);


        dispatch(setControlPoints(controlPoints));
      }
    } else if (e.target === e.target.getStage()) {

      dispatch(clearSelection());
    }
    console.log("Clicked Shape:", clickedShape);

    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      dispatch(clearSelection());
    } else if (selectedTool === "Node" && clickedShape && clickedShape.attrs && clickedShape.attrs.id) {
      dispatch(selectShape(clickedShape.attrs.id));

      const shape = shapes.find((shape) => shape.id === clickedShape.attrs.id);
      if (shape) {
        console.log("Selected Shape:", shape);
        const controlPoints = generateControlPoints(shape);
        let nodes = [];
        if (shape.type === "Rectangle") {
          nodes = [
            { x: shape.x, y: shape.y },
            { x: shape.x + shape.width, y: shape.y },
            { x: shape.x + shape.width, y: shape.y + shape.height },
            { x: shape.x, y: shape.y + shape.height },
          ];
        } else if (shape.type === "Circle") {
          const numPoints = 36;
          for (let i = 0; i < numPoints; i++) {
            const angle = (i * 2 * Math.PI) / numPoints;
            nodes.push({
              x: shape.x + shape.radius * Math.cos(angle),
              y: shape.y + shape.radius * Math.sin(angle),
            });
          }
        } else if (shape.type === "Polygon") {
          if (Array.isArray(shape.points)) {
            nodes = shape.points.map((point) => ({
              x: shape.x + point.x,
              y: shape.y + point.y,
            }));
          } else {
            console.error("Polygon points are not an array:", shape.points);
          }
        } else if (shape.type === "Star") {
          const numPoints = shape.corners * 2;
          for (let i = 0; i < numPoints; i++) {
            const angle = (i * Math.PI) / shape.corners;
            const radius = i % 2 === 0 ? shape.outerRadius : shape.innerRadius;
            nodes.push({
              x: shape.x + radius * Math.cos(angle),
              y: shape.y + radius * Math.sin(angle),
            });
          }
        } else if (shape.type === "Pencil" || shape.type === "Calligraphy") {
          if (Array.isArray(shape.points)) {
            nodes = shape.points.map((point) => ({
              x: point[0] || point.x,
              y: point[1] || point.y,
            }));
          } else {
            console.error("Pencil/Calligraphy points are not an array:", shape.points);
          }
        }

        console.log("Generated Control Points:", nodes);
        dispatch(setControlPoints(nodes));
      }
    } else if (e.target === e.target.getStage()) {

      dispatch(clearSelection());
    } else if (selectedTool === "Select") {
      if (clickedShape && clickedShape.attrs && clickedShape.attrs.id) {
        console.log("Select Tool: Selecting shape with ID:", clickedShape.attrs.id);
        dispatch(selectShape(clickedShape.attrs.id));
      } else {
        console.log("No shape selected, clearing selection.");
        dispatch(clearSelection());
      }
      return;
    }


    if (selectedTool === "Node") {
      if (clickedShape && clickedShape.attrs && clickedShape.attrs.id) {
        const shapeId = clickedShape.attrs.id;
        console.log("Node Tool: Selecting shape with ID:", shapeId);


        dispatch(selectShape(shapeId));


        dispatch(clearControlPoints());
      } else if (e.target === e.target.getStage()) {

        dispatch(clearSelection());
      }
    }

    if (selectedTool === "Rectangle") {
      if (clickedShape && clickedShape.attrs && clickedShape.attrs.id) {
        const shape = shapes.find((shape) => shape.id === clickedShape.attrs.id);
        if (shape) {
          console.log("Rectangle Tool: Selecting existing shape with ID:", shape.id);
          dispatch(selectShape(shape.id));
          return;
        }
      }
    }

    const adjustedPointerPosition = getAdjustedPointerPosition(stage, position, scale);
    console.log("Selected fillColor:", fillColor);
    if (!adjustedPointerPosition) {
      console.error("Pointer position is null");
      return;
    }

    const { x, y } = adjustedPointerPosition;
    if (selectedTool === "Eraser") {
      isDrawingRef.current = true;
      setEraserLines([...eraserLines, { points: [x, y] }]);
      return;
    }

    if (e.target === stage) {
      dispatch(clearSelection());
    }

    if (selectedTool === "Select") {
      const clickedShape = e.target;


      e.cancelBubble = true;

      if (clickedShape && clickedShape.attrs && clickedShape.attrs.id) {
        console.log("Selected Shape ID:", clickedShape.attrs.id);
        dispatch(selectShape(clickedShape.attrs.id));
      } else {
        console.log("No shape selected, clearing selection.");
        dispatch(clearSelection());
      }
      return;
    } else if (selectedTool === "Node" && clickedShape && clickedShape.attrs && clickedShape.attrs.id) {
      dispatch(selectShape(clickedShape.attrs.id));

      const shape = shapes.find((shape) => shape.id === clickedShape.attrs.id);
      if (shape) {
        console.log("Selected Shape:", shape);
        const controlPoints = generateControlPoints(shape);
        let nodes = [];
        if (shape.type === "Rectangle") {
          nodes = [
            { x: shape.x, y: shape.y },
            { x: shape.x + shape.width, y: shape.y },
            { x: shape.x + shape.width, y: shape.y + shape.height },
            { x: shape.x, y: shape.y + shape.height },
          ];
        } else if (shape.type === "Circle") {
          const numPoints = 36;
          for (let i = 0; i < numPoints; i++) {
            const angle = (i * 2 * Math.PI) / numPoints;
            nodes.push({
              x: shape.x + shape.radius * Math.cos(angle),
              y: shape.y + shape.radius * Math.sin(angle),
            });
          }
        } else if (shape.type === "Polygon") {
          if (Array.isArray(shape.points)) {
            nodes = shape.points.map((point) => ({
              x: shape.x + point.x,
              y: shape.y + point.y,
            }));
          } else {
            console.error("Polygon points are not an array:", shape.points);
          }
        } else if (shape.type === "Star") {
          const numPoints = shape.corners * 2;
          for (let i = 0; i < numPoints; i++) {
            const angle = (i * Math.PI) / shape.corners;
            const radius = i % 2 === 0 ? shape.outerRadius : shape.innerRadius;
            nodes.push({
              x: shape.x + radius * Math.cos(angle),
              y: shape.y + radius * Math.sin(angle),
            });
          }
        } else if (shape.type === "Pencil" || shape.type === "Calligraphy") {
          if (Array.isArray(shape.points)) {
            nodes = shape.points.map((point) => ({
              x: point[0] || point.x,
              y: point[1] || point.y,
            }));
          } else {
            console.error("Pencil/Calligraphy points are not an array:", shape.points);
          }
        }

        console.log("Generated Control Points:", nodes);
        dispatch(setControlPoints(nodes));
      }
    } else if (selectedTool === "Rectangle") {
      setNewShape({
        id: `rect-${Date.now()}`,
        type: "Rectangle",
        x,
        y,
        width: 0,
        height: 0,
        cornerRadius: 0,
        rotation: 0,
        fill: fillColor || "black",
        stroke: strokeColor,
        strokeWidth: 1,
      });
      setIsDrawing(true);
      setIsMouseMoved(false);
    } else if (selectedTool === "Circle") {
      setNewShape({
        id: `circle-${Date.now()}`,
        type: "Circle",
        x,
        y,
        radius: 0,
        fill: fillColor || "black",
        stroke: strokeColor,
        strokeWidth: 1,
      });
      setIsDrawing(true);
      setIsMouseMoved(false)
    } else if (selectedTool === "Star") {
      setNewShape({
        id: `star-${Date.now()}`,
        type: "Star",
        x,
        y,
        corners: 5,
        innerRadius: 0,
        outerRadius: 0,
        fill: fillColor || "black",
        stroke: strokeColor,
        strokeWidth: 1,
      });
      setIsDrawing(true);
      setIsMouseMoved(false)
    } else if (selectedTool === "Polygon") {
      const corners = 6;
      const angleStep = (2 * Math.PI) / corners;

      setNewShape({
        id: `polygon-${Date.now()}`,
        type: "Polygon",
        x,
        y,
        corners,
        radius: 0,
        points: [],
        fill: fillColor || "black",
        stroke: strokeColor,
        strokeWidth: 1,
      });
      setIsDrawing(true);
      setIsMouseMoved(false);
    } else if (selectedTool === "Spiral") {
      setNewShape({
        id: `spiral-${Date.now()}`,
        type: "Spiral",
        x,
        y,
        path: "",
        turns,
        radius: innerRadius,
        divergence,
        fill: fillColor || "black",
        stroke: strokeColor,
        strokeWidth: 1
      });
      setIsDrawing(true);
      setIsMouseMoved(false)
    } else if (selectedTool === "Text") {
      console.log("Text tool clicked at:", x, y);
      setTextAreaPosition({ x: x * scale + position.x, y: y * scale + position.y });
      setTimeout(() => {
        setTextAreaVisible(true);
      }, 0);
      setTextContent("");
      setEditingTextId(null);
    } else if (selectedTool === "PaintBucket") {
      const clickedShape = e.target;
      if (clickedShape && clickedShape.attrs.id) {
        dispatch(
          updateShapePosition({ id: clickedShape.attrs.id, fill: fillColor })
        );
      }
    } else if (selectedTool === "Dropper") {
      const clickedShape = e.target;
      if (clickedShape && clickedShape.attrs.fill) {
        const pickedColor = clickedShape.attrs.fill;

        dispatch(setFillColor(pickedColor));
        dispatch(setStrokeColor(pickedColor));
      } else {
        console.log("No color found to pick.");
      }
    } else if (selectedTool === "Pen") {
      setNewShape({ type: "Pen", points: [] });
      const point = [x, y];
      dispatch(addPenPoint(point));
      setIsDrawing(true);
      setIsMouseMoved(false)
    } else if (selectedTool === "Bezier") {
      if (selectedTool === "Bezier" && bezierOption === "Spiro Path") {
        if (
          spiroPoints.length > 1 &&
          Math.hypot(x - spiroPoints[0].x, y - spiroPoints[0].y) < 10
        ) {
          console.log("Finalizing Spiro Path: Clicked near the starting point");


          const pathData = generateSpiroPath(spiroPoints, 0.5, true);

          dispatch(
            addShape({
              id: `spiro-${Date.now()}`,
              type: "Spiro Path",
              path: pathData,
              stroke: strokeColor,
              strokeWidth: 2,
              fill: fillColor || "black",
              closed: true,
            })
          );


          dispatch(clearSpiroPoints());
          setIsDrawing(false);
          return;
        }


        dispatch(addSpiroPoint({ x, y }));
        console.log("Added Spiro Point:", { x, y });
        return;
      } else if (selectedTool === "Bezier" && bezierOption === "BSpline Path") {
        if (
          bsplinePoints.length > 1 &&
          Math.hypot(x - bsplinePoints[0].x, y - bsplinePoints[0].y) < 10
        ) {

          console.log("Finalizing B-spline Path: Clicked near the starting point");

          const pathData = generateBSplinePath(bsplinePoints, 0.5, true);

          dispatch(
            addShape({
              id: `bspline-${Date.now()}`,
              type: "Path",
              path: pathData,
              stroke: strokeColor,
              strokeWidth: 2,
              fill: fillColor || "black",
            })
          );


          dispatch(clearBSplinePoints());
          dispatch(clearControlPoints());
          setIsDrawing(false);
          return;
        }


        dispatch(addBSplinePoint({ x, y }));
        console.log("Added B-spline Point:", { x, y });
      } else if (selectedTool === "Bezier" && bezierOption === "Paraxial Line Segments") {
        if (
          paraxialPoints.length > 1 &&
          Math.hypot(x - paraxialPoints[0].x, y - paraxialPoints[0].y) < 10
        ) {
          console.log("Finalizing Paraxial Line Segments: Clicked near the starting point");


          let pathData = paraxialPoints
            .map((point, index) => {
              return index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`;
            })
            .join(" ");


          pathData += " Z";


          dispatch(
            addShape({
              id: `paraxial-${Date.now()}`,
              type: "Path",
              path: pathData,
              stroke: strokeColor,
              strokeWidth: 2,
              fill: fillColor || "black",
            })
          );


          dispatch(clearParaxialPoints());
          setIsDrawing(false);
          return;
        }


        if (paraxialPoints.length === 0) {
          dispatch(addParaxialPoint({ x, y }));
        } else {
          const lastPoint = paraxialPoints[paraxialPoints.length - 1];
          const dx = Math.abs(x - lastPoint.x);
          const dy = Math.abs(y - lastPoint.y);

          if (dx > dy) {

            dispatch(addParaxialPoint({ x, y: lastPoint.y }));
          } else {

            dispatch(addParaxialPoint({ x: lastPoint.x, y }));
          }
        }
        return;
      }
      if (
        controlPoints.length > 2 &&
        Math.hypot(x - controlPoints[0].x, y - controlPoints[0].y) < 10
      ) {
        setIsShapeClosed(true);
        dispatch(finalizePath());
        setIsShapeClosed(false);
        return;
      }


      dispatch(addControlPoint({ x, y }));
      console.log("Control Points after adding:", [...controlPoints]);
    } else if (selectedTool === "Pencil") {
      setNewShape({
        id: `pencil-${Date.now()}`,
        type: "Pencil",
        points: [[x, y]],
      });
      setIsDrawing(true);
    } else if (selectedTool === "Calligraphy") {
      setNewShape({
        id: `calligraphy-${Date.now()}`,
        type: "Calligraphy",
        points: [{ x, y }],
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        fill: "transparent",
      });
      setIsDrawing(true);
      setIsMouseMoved(false);
    }
    const handleTextAreaBlur = () => {
      if (textContent) {
        const newTextShape = {
          id: `text-${Date.now()}`,
          type: "Text",
          x: textAreaPosition.x / scale - position.x / scale,
          y: textAreaPosition.y / scale - position.y / scale,
          text: textContent,
          fontSize: 16,
          fill: strokeColor,
        };
        dispatch(addShape(newTextShape));
      }
      setTextAreaVisible(false);
    };

    const handleTextAreaKeyDown = (e) => {
      if (e.key === "Enter") {
        handleTextAreaBlur();
      }
    };
  };

  useEffect(() => {
    console.log("TextArea Visible:", textAreaVisible);
    console.log("TextArea Position:", textAreaPosition);
    console.log("Text Content:", textContent);
  }, [textAreaVisible, textAreaPosition, textContent]);

  const handleDragMove = (e, index) => {
    console.log("handleDragMove triggered for:", e.target);
    const node = e.target;
    if (selectedTool === "Node" && selectedShapeId) {
      const { x, y } = e.target.position();
      dispatch(updateNodePosition({ shapeId: selectedShapeId, nodeIndex: index, newPosition: { x, y } }));
      console.log(`Control point dragged to: x=${x}, y=${y}`);
    }
    if (selectedTool === "Bezier" && bezierOption === "Spiro Path") {
      const { x, y } = e.target.position();
      dispatch(updateControlPoint({ index, point: { x, y } }));
    }
    if (selectedTool === "Bezier" && bezierOption === "BSpline Path") {
      const { x, y } = e.target.position();
      dispatch(updateControlPoint({ index, point: { x, y } }));
    }
    if (isSnappingEnabled) {
      console.log("Snapping is enabled. Calling snapToObjects...");
      const otherObjects = shapes.filter((shape) => shape.id !== node.id());
      snapToObjects(node, otherObjects);
    }
  };

  const generateSpiroPath = (points, tension = 0.5, isClosed = false) => {
    if (points.length < 2) return "";

    let path = `M ${points[0].x},${points[0].y}`;

    const getCatmullRomPoint = (p0, p1, p2, p3, t) => {
      const t2 = t * t;
      const t3 = t2 * t;

      const x =
        0.5 *
        ((2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

      const y =
        0.5 *
        ((2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

      return { x, y };
    };

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[0];
      const p1 = points[i];
      const p2 = points[i + 1] || points[points.length - 1];
      const p3 = points[i + 2] || points[points.length - 1];

      for (let t = 0; t <= 1; t += 0.1) {
        const { x, y } = getCatmullRomPoint(p0, p1, p2, p3, t);
        path += ` L ${x},${y}`;
      }
    }


    if (isClosed) {
      const p0 = points[points.length - 2] || points[points.length - 1];
      const p1 = points[points.length - 1];
      const p2 = points[0];
      const p3 = points[1] || points[0];

      for (let t = 0; t <= 1; t += 0.1) {
        const { x, y } = getCatmullRomPoint(p0, p1, p2, p3, t);
        path += ` L ${x},${y}`;
      }

      path += " Z";
    }

    return path;
  };
  const renderSpiroPath = () => {
    if (spiroPoints.length < 2) return null;

    const pathData = generateSpiroPath(spiroPoints, 0.5, isShapeClosed);

    return (
      <Path
        data={pathData}
        stroke={strokeColor}
        strokeWidth={2}
        fill={"transparent"}
        closed={isShapeClosed}
      />
    );
  };

  const handleOptionSelect = (option) => {
    dispatch(setBezierOption(option));
    dispatch(clearSpiroPoints());
  };

  const generateKnotVector = (n, degree) => {
    const knots = [];
    const d = degree;

    for (let i = 0; i <= n + d + 1; i++) {
      if (i <= d) knots.push(0);
      else if (i > n) knots.push(n - d + 1);
      else knots.push(i - d);
    }

    return knots;
  };

  const deBoor = (k, i, t, points, degree, knots) => {
    if (k === 0) {
      return points[i];
    }

    const denominator1 = knots[i + degree - k + 1] - knots[i];
    const denominator2 = knots[i + degree - k + 2] - knots[i + 1];

    const alpha =
      denominator1 === 0 ? 0 : (t - knots[i]) / denominator1;

    const beta =
      denominator2 === 0 ? 0 : (knots[i + degree - k + 2] - t) / denominator2;

    const p1 = deBoor(k - 1, i - 1, t, points, degree, knots);
    const p2 = deBoor(k - 1, i, t, points, degree, knots);

    return {
      x: (1 - alpha) * p1.x + alpha * p2.x,
      y: (1 - alpha) * p1.y + alpha * p2.y,
    };
  };

  const generateBSplinePath = (points, tension = 0.5, isClosed = false) => {
    if (points.length < 2) return "";

    const getCatmullRomPoint = (p0, p1, p2, p3, t) => {
      const t2 = t * t;
      const t3 = t2 * t;

      const x =
        0.5 *
        ((2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

      const y =
        0.5 *
        ((2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

      return { x: x * scale, y: y * scale };
    };


    const centroid = points.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
      { x: 0, y: 0 }
    );
    centroid.x /= points.length;
    centroid.y /= points.length;

    const inwardFactor = 0.1;
    const curvePoints = [];


    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[0];
      const p1 = points[i];
      const p2 = points[i + 1] || points[points.length - 1];
      const p3 = points[i + 2] || points[points.length - 1];

      for (let t = 0; t <= 1; t += 0.1) {
        let { x, y } = getCatmullRomPoint(p0, p1, p2, p3, t);


        x += (centroid.x - x) * inwardFactor;
        y += (centroid.y - y) * inwardFactor;

        curvePoints.push({ x, y });
      }
    }


    if (isClosed) {
      const p0 = points[points.length - 2] || points[points.length - 1];
      const p1 = points[points.length - 1];
      const p2 = points[0];
      const p3 = points[1] || points[0];

      for (let t = 0; t <= 1; t += 0.1) {
        let { x, y } = getCatmullRomPoint(p0, p1, p2, p3, t);

        x += (centroid.x - x) * inwardFactor;
        y += (centroid.y - y) * inwardFactor;

        curvePoints.push({ x, y });
      }


      curvePoints.push(curvePoints[0]);
    }


    let path = "";
    curvePoints.forEach(({ x, y }, index) => {
      path += index === 0 ? `M ${x},${y}` : ` L ${x},${y}`;
    });

    if (isClosed) path += " Z";

    return path;
  };

  console.log("bsplinePoints:", bsplinePoints);
  if (!bsplinePoints.every((point) => point && typeof point.x === "number" && typeof point.y === "number")) {
    console.error("Invalid points detected in bsplinePoints:", bsplinePoints);
  }

  const renderBSplinePath = () => {
    if (bsplinePoints.length < 2) return null;


    const pathData = generateBSplinePath(bsplinePoints, 0.5, isShapeClosed, scale);

    return (
      <>
        <Path
          data={getBezierPathFromPoints(bsplinePoints, isShapeClosed)}
          stroke="black"
          strokeWidth={1}
          dash={[5, 5]}
          scale={{ x: 1 / scale, y: 1 / scale }}
          fill="transparent"
        />

        <Path
          data={pathData}
          stroke="blue"
          strokeWidth={2}
          fill={"transparent"}
        />

        {bsplinePoints.map((point, index) => (
          <Circle
            key={index}
            x={point.x}
            y={point.y}
            radius={5}
            fill="red"
            draggable
            onDragMove={(e) => {
              const { x, y } = e.target.position();
              dispatch(updateControlPoint({ index, point: { x, y } }));
            }}
          />
        ))}
      </>
    );
  };

  const renderParaxialSegments = () => {
    if (paraxialPoints.length < 2) return null;

    let pathData = paraxialPoints
      .map((point, index) => {
        return index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`;
      })
      .join(" ");


    if (isShapeClosed) {
      pathData += " Z";
    }

    return (
      <>
        <Path
          data={pathData}
          stroke="red"
          strokeWidth={2}
          fill={"transparent"}
        />

        {paraxialPoints.length > 0 && (
          <Circle
            x={paraxialPoints[0].x}
            y={paraxialPoints[0].y}
            radius={5}
            fill="blue"
          />
        )}
      </>
    );
  };

  const getBezierPath = () => {
    if (controlPoints.length < 2) {
      console.warn("Not enough control points to generate a path.");
      return "";
    }

    const [start, ...rest] = controlPoints;
    let path = `M ${start.x},${start.y}`;

    for (let i = 0; i < rest.length; i++) {
      const point = rest[i];
      path += ` L ${point.x},${point.y}`;
    }

    if (isShapeClosed) {
      path += ` Z`;
    }

    return path;
  };
  {
    selectedTool === "Bezier" && (
      <Path
        data={getBezierPath()}
        stroke="black"
        strokeWidth={2}
        fill={isShapeClosed ? "rgba(0,0,0,0.1)" : "transparent"}
        closed={isShapeClosed}
      />
    )
  }

  const getBezierPathFromPoints = (points, isClosed) => {
    if (points.length < 1) return "";

    const [start, ...rest] = points;
    let path = `M ${start.x},${start.y}`;

    for (let i = 0; i < rest.length; i++) {
      const point = rest[i];
      path += ` L ${point.x},${point.y}`;
    }

    if (isClosed) {
      path += ` Z`;
    }
    return path;
  };
  function smoothShape(points, smoothingLevel = 0) {
    if (!Array.isArray(points) || points.length < 2) return points;


    const iterations = Math.min(Math.floor(smoothingLevel / 10), 10);
    let smoothedPoints = points;

    for (let i = 0; i < iterations; i++) {
      const newPoints = [];
      for (let j = 0; j < smoothedPoints.length - 1; j++) {
        const [x1, y1] = smoothedPoints[j];
        const [x2, y2] = smoothedPoints[j + 1];


        const q = [0.75 * x1 + 0.25 * x2, 0.75 * y1 + 0.25 * y2];
        const r = [0.25 * x1 + 0.75 * x2, 0.25 * y1 + 0.75 * y2];

        newPoints.push(q, r);
      }
      newPoints.push(smoothedPoints[smoothedPoints.length - 1]);
      smoothedPoints = newPoints;
    }

    return smoothedPoints;
  }

  const calligraphyThinning = useSelector((state) => state.tool.calligraphyThinning);
  const calligraphyMass = useSelector((state) => state.tool.calligraphyMass);
  const calligraphyWidth = useSelector((state) => state.tool.calligraphyWidth);
  const pencilSmoothing = useSelector((state) => state.tool.pencilSmoothing);
  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;


    const adjustedPointerPosition = getAdjustedPointerPosition(stage, position, scale);

    if (!adjustedPointerPosition) return;

    const { x, y } = adjustedPointerPosition;
    setCursorPosition({ x, y });

    if (selectedTool === "Spray" && isMouseDown) {
      handleSprayTool(e);
    }

    if (isDrawingRef.current && selectedTool === "Eraser") {
      const lastLine = eraserLines[eraserLines.length - 1];
      lastLine.points = lastLine.points.concat([x, y]);
      setEraserLines([...eraserLines.slice(0, -1), lastLine]);
    }

    if (toolCursors[selectedTool]) {
      setIsCustomCursorVisible(true);
    } else {
      setIsCustomCursorVisible(false);
    }

    if (isDrawing && newShape) {
      setIsMouseMoved(true);
      const path = generateSpiralPath(
        newShape.x,
        newShape.y,
        turns,
        innerRadius,
        divergence
      );

      if (newShape.type === "Bezier") {
        setNewShape((prev) => {
          if (!prev.points || prev.points.length < 6) {
            console.warn("Bezier points array is not initialized properly.");
            return prev;
          }

          const updatedPoints = [...prev.points];
          updatedPoints[updatedPoints.length - 2] = x;
          updatedPoints[updatedPoints.length - 1] = y;
          console.log("Updated Bezier points:", updatedPoints);
          return { ...prev, points: updatedPoints };
        });
      } else if (selectedTool === "Bezier" && bezierOption === "Paraxial Line Segments" && isDrawing) {
        const lastPoint = paraxialPoints[paraxialPoints.length - 1];
        const dx = Math.abs(x - lastPoint.x);
        const dy = Math.abs(y - lastPoint.y);


        if (dx > dy) {
          dispatch(updateParaxialPoint({ index: paraxialPoints.length - 1, point: { x, y: lastPoint.y } }));
        } else {
          dispatch(updateParaxialPoint({ index: paraxialPoints.length - 1, point: { x: lastPoint.x, y } }));
        }
      } else if (newShape.type === "Pen") {
        const point = [x, y];
        dispatch(addPenPoint(point));
      } else if (isDrawing && newShape && newShape.type === "Polygon") {
        const radius = Math.sqrt((x - newShape.x) ** 2 + (y - newShape.y) ** 2);
        const angleStep = (2 * Math.PI) / newShape.corners;


        const points = Array.from({ length: newShape.corners }).map((_, i) => {
          const angle = i * angleStep;
          return {
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
          };
        });


        setNewShape((prev) => ({
          ...prev,
          radius,
          points,
        }));
      } else if (isDrawing && newShape && newShape.type === "Pencil") {
        setNewShape((prev) => ({
          ...prev,
          points: [...prev.points, [x, y]],
        }));
      } else if (isDrawing && newShape && newShape.type === "Calligraphy") {
        const point = { x, y };
        const lastPoint = newShape.points[newShape.points.length - 1];
        if (lastPoint) {
          const dx = x - lastPoint.x;
          const dy = y - lastPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);


          const speed = distance / (Date.now() - (lastPoint.timestamp || Date.now()));
          const adjustedWidth = calligraphyWidth * (1 + calligraphyThinning * speed);


          const smoothedX = lastPoint.x + dx / (1 + calligraphyMass);
          const smoothedY = lastPoint.y + dy / (1 + calligraphyMass);

          point.x = smoothedX;
          point.y = smoothedY;
          point.strokeWidth = Math.max(1, adjustedWidth);
          point.timestamp = Date.now();
        } else {

          point.strokeWidth = calligraphyWidth;
          point.timestamp = Date.now();
        }
        if (calligraphyOption === "Wiggly") {
          const time = performance.now() / 100;
          const amplitude = 5;
          const frequency = 10;


          point.x += Math.sin(time * frequency) * amplitude + (Math.random() - 0.5) * amplitude;
          point.y += Math.cos(time * frequency) * amplitude + (Math.random() - 0.5) * amplitude;


          const minWidth = 2;
          const maxWidth = calligraphyWidth;
          point.strokeWidth = Math.random() * (maxWidth - minWidth) + minWidth;

          console.log("Wiggly Point:", point);
        } else if (calligraphyOption === "Marker") {
          console.log("Marker logic triggered");


          point.x = x;
          point.y = y;
          point.strokeWidth = calligraphyWidth;

          console.log("Marker Point:", point);
        } else if (calligraphyOption === "Brush") {
          console.log("Brush logic triggered");
          const lastPoint = newShape.points[newShape.points.length - 1];
          if (lastPoint) {
            const dx = x - lastPoint.x;
            const dy = y - lastPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);


            const movementAngle = Math.atan2(dy, dx);


            const minWidth = 2;
            const maxWidth = calligraphyWidth;
            const speedFactor = Math.max(1, 10 - distance);
            const baseWidth = Math.min(maxWidth, Math.max(minWidth, maxWidth / speedFactor));


            const randomFactor = 0.2;
            const ellipseWidth = baseWidth + (Math.random() - 0.5) * baseWidth * randomFactor;
            const ellipseHeight = baseWidth * 0.5 + (Math.random() - 0.5) * baseWidth * 0.5 * randomFactor;


            const positionOffset = 1;
            const smoothedX = (lastPoint.x + x) / 2 + (Math.random() - 0.5) * positionOffset;
            const smoothedY = (lastPoint.y + y) / 2 + (Math.random() - 0.5) * positionOffset;


            point.x = smoothedX;
            point.y = smoothedY;
            point.ellipseWidth = ellipseWidth;
            point.ellipseHeight = ellipseHeight;
            point.angle = movementAngle;

            console.log("Brush Point:", point);
          }
        } else if (calligraphyOption === "DipPen") {
          console.log("DipPen logic triggered");
          const lastPoint = newShape.points[newShape.points.length - 1];
          if (lastPoint) {
            const dx = x - lastPoint.x;
            const dy = y - lastPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);


            const movementAngle = Math.atan2(dy, dx);


            const minWidth = 1;
            const maxWidth = calligraphyWidth;
            const speedFactor = Math.max(1, 10 - distance);
            const baseWidth = Math.min(maxWidth, Math.max(minWidth, maxWidth / speedFactor));


            const nibAngle = Math.PI / 4;
            const angleDiff = movementAngle - nibAngle;


            const squeezeFactor = 0.5;
            const squeezedWidth = baseWidth * (1 - squeezeFactor * Math.abs(Math.sin(angleDiff)));


            const smoothedX = (lastPoint.x + x) / 2;
            const smoothedY = (lastPoint.y + y) / 2;


            point.x = smoothedX;
            point.y = smoothedY;
            point.strokeWidth = squeezedWidth;
            point.angle = movementAngle;

            console.log("DipPen Point:", point);
          }
        } else if (calligraphyOption === "Tracing") {
          console.log("Tracing logic triggered");

          const lastPoint = newShape.points[newShape.points.length - 1];
          if (lastPoint) {
            const dx = x - lastPoint.x;
            const dy = y - lastPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const shapeSpacing = 10;
            const shapeRadius = 5;
            const shapes = [];

            for (let i = 0; i < distance; i += shapeSpacing) {
              const offsetX = (i / distance) * dx;
              const offsetY = (i / distance) * dy;

              shapes.push({
                x: lastPoint.x + offsetX,
                y: lastPoint.y + offsetY,
                radius: shapeRadius,
              });
            }


            point.shapes = shapes || [];
            console.log("Tracing Point Shapes:", point.shapes);
          }
        } else if (calligraphyOption === "Splotchy") {
          console.log("Splotchy logic triggered");

          const lastPoint = newShape.points[newShape.points.length - 1];
          if (lastPoint) {
            const dx = x - lastPoint.x;
            const dy = y - lastPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);


            const movementAngle = Math.atan2(dy, dx);


            const minWidth = 1;
            const maxWidth = calligraphyWidth * 3;
            const randomWidth = minWidth + Math.random() * (maxWidth - minWidth);


            const randomOffsetX = (Math.random() - 0.5) * 10;
            const randomOffsetY = (Math.random() - 0.5) * 10;


            const randomOpacity = 0.5 + Math.random() * 0.5;


            const skipPoint = Math.random() < 0.2;

            if (!skipPoint) {

              const point = {
                x: x + randomOffsetX,
                y: y + randomOffsetY,
                strokeWidth: randomWidth,
                opacity: randomOpacity,
                angle: movementAngle,
              };

              console.log("Splotchy Point:", point);

              setNewShape((prev) => ({
                ...prev,
                points: [...prev.points, point],
              }));
            }
          }
        }
        setNewShape((prev) => ({
          ...prev,
          points: [...prev.points, point],
          strokeWidth: calligraphyOption === "DipPen" ? point.strokeWidth : calligraphyWidth,
        }));
      } else {
        setNewShape((prev) => {
          const commonUpdates = { path, turns };

          if (prev.type === "Rectangle") {
            return { ...prev, width: x - prev.x, height: y - prev.y };
          } else if (prev.type === "Circle") {
            const radius = Math.sqrt((x - prev.x) ** 2 + (y - prev.y) ** 2);
            return { ...prev, radius };
          } else if (prev.type === "Star") {
            const outerRadius = Math.sqrt(
              (x - prev.x) ** 2 + (y - prev.y) ** 2
            );
            const innerRadius = outerRadius / 2;
            return { ...prev, innerRadius, outerRadius };
          } else if (prev.type === "Polygon") {
            const radius = Math.sqrt((x - prev.x) ** 2 + (y - prev.y) ** 2);
            return { ...prev, radius };
          } else if (prev.type === "Spiral") {
            const path = generateSpiralPath(
              prev.x,
              prev.y,
              turns,
              innerRadius,
              divergence
            );
            return { ...prev, path };
          }

          return { ...prev, commonUpdates, points: [...(prev.points || []), x, y] };
        });
      }
    }
  };

  function convertToBezierPath(points) {

    return points;
  }
  function generatePencilSpiroPath(points) {

    return points;
  }
  function generatePencilBSplinePath(points) {

    return points;
  }
  function downsamplePoints(points, maxPoints = 500) {
    if (points.length <= maxPoints) return points;

    const factor = Math.ceil(points.length / maxPoints);
    const downsampled = [];
    for (let i = 0; i < points.length; i += factor) {
      downsampled.push(points[i]);
    }
    downsampled.push(points[points.length - 1]);
    return downsampled;
  }

  function generateEllipsePath(points) {
    if (!Array.isArray(points) || points.length < 2) return points;


    const minX = Math.min(...points.map(([x]) => x));
    const maxX = Math.max(...points.map(([x]) => x));
    const minY = Math.min(...points.map(([, y]) => y));
    const maxY = Math.max(...points.map(([, y]) => y));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const radiusX = (maxX - minX) / 2;
    const radiusY = (maxY - minY) / 2;


    const ellipsePoints = [];
    const numSegments = 100;
    for (let i = 0; i <= numSegments; i++) {
      const angle = (i / numSegments) * 2 * Math.PI;
      const x = centerX + radiusX * Math.cos(angle);
      const y = centerY + radiusY * Math.sin(angle);
      ellipsePoints.push([x, y]);
    }

    return ellipsePoints;
  }

  const generateNodePoints = (shape) => {
    if (shape.type === "Rectangle") {
      return [
        { x: shape.x, y: shape.y },
        { x: shape.x + shape.width, y: shape.y },
        { x: shape.x + shape.width, y: shape.y + shape.height },
        { x: shape.x, y: shape.y + shape.height },
      ];
    } else if (shape.type === "Circle") {
      return [
        { x: shape.x, y: shape.y },
        { x: shape.x + shape.radius, y: shape.y },
      ];
    } else if (shape.type === "Star") {
      const points = [];
      const numPoints = shape.corners * 2;
      for (let i = 0; i < numPoints; i++) {
        const angle = (i * Math.PI) / shape.corners;
        const radius = i % 2 === 0 ? shape.outerRadius : shape.innerRadius;
        points.push({
          x: shape.x + radius * Math.cos(angle),
          y: shape.y + radius * Math.sin(angle),
        });
      }
      return points;
    } else if (shape.type === "Polygon") {
      return shape.points.map((point) => ({
        x: shape.x + point.x,
        y: shape.y + point.y,
      }));
    } else if (shape.type === "Pencil") {
      console.log("Generating Node Points for Pencil Tool:", shape.points);
      return shape.points.map((point) => ({
        x: point[0],
        y: point[1],
      }));
    } else if (shape.type === "Calligraphy") {
      console.log("Generating Node Points for Calligraphy Tool:", shape.points);


      return shape.points.map((point) => ({
        x: point.x,
        y: point.y,
      }));
    } else if (shape.type === "DipPen" || shape.type === "Splotchy") {
      return shape.points.map((point) => ({
        x: point.x,
        y: point.y,
      }));
    } else if (shape.type === "Tracing") {
      const nodePoints = [];
      shape.points.forEach((point) => {
        if (Array.isArray(point.shapes)) {
          point.shapes.forEach((subShape) => {
            nodePoints.push({ x: subShape.x, y: subShape.y });
          });
        }
      });
      return nodePoints;
    }
    return [];
  };
  const handleJoinSelectedNode = () => {
    if (controlPoints.length < 2) {
      console.error("Not enough control points to join.");
      return;
    }

    const updatedPoints = [...controlPoints];
    const firstPoint = updatedPoints[0];
    const lastPoint = updatedPoints[updatedPoints.length - 1];


    updatedPoints.push({ x: firstPoint.x, y: firstPoint.y });

    console.log("Joined Control Points:", updatedPoints);

    if (selectedShape) {
      const newShapeData = {
        ...selectedShape,
        points: updatedPoints.map((point) => [point.x, point.y]),
      };

      dispatch(updateShapePosition(newShapeData));
      dispatch(setControlPoints(updatedPoints));
    }
  };
  const handleNodeDrag = (e, index) => {
    const { x, y } = e.target.position();
    console.log("Dragged Node Position:", { x, y });

    const updatedPoints = controlPoints.map((point, i) =>
      i === index ? { x, y } : point
    );
    console.log("Updated Control Points:", updatedPoints);
    if (selectedShape) {
      let newShapeData = {};

      if (selectedShape.type === "Rectangle") {
        const xs = updatedPoints.map((p) => p.x);
        const ys = updatedPoints.map((p) => p.y);

        const newX = Math.min(...xs);
        const newY = Math.min(...ys);
        const newWidth = Math.max(...xs) - newX;
        const newHeight = Math.max(...ys) - newY;

        newShapeData = {
          id: selectedShape.id,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        };
      } else if (selectedShape.type === "Circle") {
        const center = updatedPoints[0];
        const edge = updatedPoints[1];
        const newRadius = Math.sqrt(
          Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2)
        );

        newShapeData = {
          id: selectedShape.id,
          x: center.x,
          y: center.y,
          radius: newRadius,
        };
      } else if (selectedShape.type === "Star") {
        const center = { x: selectedShape.x, y: selectedShape.y };
        const numPoints = selectedShape.corners * 2;


        const isOuterPoint = index % 2 === 0;
        const radius = Math.sqrt(
          Math.pow(updatedPoints[index].x - center.x, 2) +
          Math.pow(updatedPoints[index].y - center.y, 2)
        );

        if (isOuterPoint) {
          newShapeData = { ...selectedShape, outerRadius: radius };
        } else {
          newShapeData = { ...selectedShape, innerRadius: radius };
        }
      } else if (selectedShape && selectedShape.type === "Polygon") {

        const newPoints = updatedPoints.map((point) => ({
          x: point.x - selectedShape.x,
          y: point.y - selectedShape.y,
        }));
        console.log("Updated Polygon Points:", newPoints);


        dispatch(
          updateShapePosition({
            id: selectedShape.id,
            points: newPoints,
          })
        );


        const regeneratedPoints = generateNodePoints({
          ...selectedShape,
          points: newPoints,
        });
        dispatch(setControlPoints(regeneratedPoints));
      } else if (selectedShape && selectedShape.type === "Pencil") {
        const newPoints = updatedPoints.map((point) => [point.x, point.y]);
        console.log("Updated Pencil Points:", newPoints);

        dispatch(
          updateShapePosition({
            id: selectedShape.id,
            points: newPoints,
          })
        );

        const regeneratedPoints = generateNodePoints({
          ...selectedShape,
          points: newPoints,
        });
        dispatch(setControlPoints(regeneratedPoints));
      } else if (selectedShape && selectedShape.type === "Calligraphy") {
        const newPoints = updatedPoints.map((point) => ({
          x: point.x,
          y: point.y,
        }));
        console.log("Updated Calligraphy Points:", newPoints);

        dispatch(
          updateShapePosition({
            id: selectedShape.id,
            points: newPoints,
          })
        );

        const regeneratedPoints = generateNodePoints({
          ...selectedShape,
          points: newPoints,
        });
        dispatch(setControlPoints(regeneratedPoints));
      }

      dispatch(updateShapePosition(newShapeData));

      dispatch(setControlPoints(updatedPoints));
    }


  };
  const handleModeCompletion = () => {
    dispatch(setStrokeToPathMode(false));
  };
  const handleMouseUp = () => {
    if (isDrawingRef.current && selectedTool === "Eraser") {
      isDrawingRef.current = false;
    } else if (isMouseMoved && newShape) {
      const currentStrokeColor = strokeColor;

      if (newShape.type === "Pen") {
        setActiveTab("layers");
        dispatch(addShape({ type: "Pen", points: penPoints, strokeColor: currentStrokeColor }));
      } else if (isDrawing && newShape && newShape.type === "Pencil") {
        let fillColor = pencilOption === "None" ? "transparent" : strokeColor;
        let isClosed = pencilOption !== "None";

        if (pencilOption !== "None") {
          fillColor = fillColor || strokeColor;
          isClosed = true;
        }

        const smoothedPoints = smoothShape(newShape.points, pencilSmoothing);
        let finalPoints = smoothedPoints;

        if (pencilOption === "Ellipse") {
          finalPoints = generateEllipsePath(smoothedPoints);
        }
        console.log("Finalizing Pencil Shape:", smoothedPoints);
        finalPoints = downsamplePoints(finalPoints, 5000);

        dispatch(
          addShape({
            id: newShape.id,
            type: "Pencil",
            points: finalPoints,
            strokeColor: strokeColor,
            fill: fillColor || "black",
            closed: isClosed,
          })
        );
        setActiveTab("layers");
        setNewShape(null);
        setIsDrawing(false);
      } else if (newShape.type === "Calligraphy") {
        if (calligraphyOption === "Brush") {
          console.log("Finalizing Brush stroke...");

          dispatch(
            addShape({
              id: newShape.id,
              type: "Calligraphy",
              points: newShape.points,
              stroke: newShape.stroke,
              strokeWidth: newShape.strokeWidth,
              opacity: newShape.opacity || 1,
              fill: "transparent",
              closed: true,
            })
          );
          setActiveTab("layers");
          setNewShape(null);
          setIsDrawing(false);
        } else if (calligraphyOption === "Marker") {
          console.log("Finalizing Marker stroke...");

          dispatch(
            addShape({
              id: newShape.id,
              type: "Calligraphy",
              points: newShape.points,
              stroke: newShape.stroke,
              strokeWidth: newShape.strokeWidth,
              opacity: 1,
              fill: "transparent",
              closed: true,
            })
          );

          setNewShape(null);
          setIsDrawing(false);
        } else if (calligraphyOption === "DipPen") {
          console.log("Finalizing DipPen stroke...");

          dispatch(
            addShape({
              id: `dippen-${Date.now()}`,
              type: "DipPen",
              points: newShape.points,
              stroke: newShape.stroke,
              strokeWidth: newShape.strokeWidth,
              opacity: newShape.opacity || 1,
              fill: "transparent",
              closed: false,
            })
          );

          setNewShape(null);
          setIsDrawing(false);
        } else if (calligraphyOption === "Wiggly") {
          console.log("Finalizing Wiggly stroke...");

          dispatch(
            addShape({
              id: newShape.id,
              type: "Calligraphy",
              points: newShape.points,
              stroke: newShape.stroke,
              strokeWidth: newShape.strokeWidth,
              opacity: newShape.opacity || 1,
              fill: "transparent",
              closed: true,
            })
          );

          setNewShape(null);
          setIsDrawing(false);
        } else if (calligraphyOption === "Tracing") {
          console.log("Finalizing Tracing stroke...");

          const tracedShape = {
            id: newShape.id,
            type: "Tracing",
            points: newShape.points,
            stroke: newShape.stroke,
            strokeWidth: newShape.strokeWidth,
            fill: "transparent",
            closed: false,
          };

          console.log("Traced Shape:", tracedShape);

          dispatch(addShape(tracedShape));

          setNewShape(null);
          setIsDrawing(false);
        } else if (calligraphyOption === "Splotchy") {
          console.log("Finalizing Splotchy stroke...");

          dispatch(
            addShape({
              id: `splotchy-${Date.now()}`,
              type: "Splotchy",
              points: newShape.points,
              stroke: newShape.stroke,
              strokeWidth: newShape.strokeWidth,
              opacity: newShape.opacity || 1,
              fill: "transparent",
              closed: false,
            })
          );

          setNewShape(null);
          setIsDrawing(false);
        }
        setNewShape(null);
        setIsDrawing(false);
      } else if (isDrawing && newShape && newShape.type === "Pencil") {
        const fillColor = pencilOption === "None" ? "transparent" : strokeColor;
        const isClosed = pencilOption !== "None";


        const smoothedPoints = smoothShape(newShape.points, pencilSmoothing);

        dispatch(
          addShape({
            id: newShape.id,
            type: "Pencil",
            points: smoothedPoints,
            strokeColor: strokeColor,
            fill: fillColor || "black",
            closed: isClosed,
          })
        );

        setNewShape(null);
        setIsDrawing(false);
      } else if (isDrawing && selectedTool === "Bezier" && bezierOption === "Spiro Path") {
        if (spiroPoints.length < 2) {
          console.warn("Not enough points to create a Spiro Path.");
          return;
        }


        const pathData = generateSpiroPath(spiroPoints, 0.5, isShapeClosed);


        dispatch(
          addShape({
            id: `spiro-${Date.now()}`,
            type: "Spiro Path",
            path: pathData,
            stroke: strokeColor,
            strokeWidth: 2,
            fill: fillColor || "transparent",
            closed: isShapeClosed,
          })
        );


        dispatch(clearSpiroPoints());
        setIsDrawing(false);
        return;
      } else if (isDrawing && selectedTool === "Bezier" && bezierOption === "BSpline Path") {
        if (bsplinePoints.length < 2) {
          console.warn("Not enough points to create a BSpline Path.");
          return;
        }


        const pathData = generateCatmullRomPath(bsplinePoints, 0.5, isShapeClosed);


        dispatch(
          addShape({
            id: `bspline-${Date.now()}`,
            type: "Path",
            path: pathData,
            stroke: strokeColor,
            strokeWidth: 2,
            fill: fillColor || "transparent",
          })
        );


        dispatch(clearBSplinePoints());
        setIsDrawing(false);
      } else if (isDrawing && selectedTool === "Bezier" && bezierOption === "Paraxial Line Segments") {
        if (paraxialPoints.length < 2) {
          console.warn("Not enough points to create paraxial shapes.");
          return;
        }


        let pathData = paraxialPoints
          .map((point, index) => {
            return index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`;
          })
          .join(" ");


        if (isShapeClosed) {
          pathData += " Z";
        }


        dispatch(
          addShape({
            id: `paraxial-${Date.now()}`,
            type: "Path",
            path: pathData,
            stroke: strokeColor,
            strokeWidth: 2,
            fill: fillColor || "transparent",
          })
        );


        dispatch(clearParaxialPoints());
        setIsDrawing(false);
        return;
      } else if (isDrawing && selectedTool === "Bezier" && bezierOption === "Spiro Path") {

      } else if (isDrawing && selectedTool === "Bezier" && bezierOption === "BSpline Path") {

      } else if (isDrawing && newShape) {

        dispatch(addShape(newShape));
        setNewShape(null);
        setIsDrawing(false);
      } else {
        dispatch(addShape(newShape));
      }
      toggleSidebar(true);
      setActiveTab("layers");
      setNewShape(null);
      setIsDrawing(false);
    } else {
      setNewShape(null);
      setIsDrawing(false);
    }
    if (isStrokeToPathMode) {
      handleModeCompletion();
    }
    if (!isSnappingEnabled) {
      setSnappingLines([]);
    }
  };
  const getDashArray = (strokeStyle) => {
    switch (strokeStyle) {
      case "dotted":
        return [2, 4];
      case "dashed":
        return [8, 4];
      default:
        return [];
    }
  };
  const handleDragEnd = (e, shapeId) => {
    const { x, y } = e.target.position();
    dispatch(updateShapePosition({ id: shapeId, x, y }));
    setSnappingLines([]);
  };

  const handleResizeEnd = (e, shapeId) => {
    const node = e.target;


    const width = node.width() * node.scaleX();
    const height = node.height() * node.scaleY();
    const { x, y } = node.position();
    const skewX = node.skewX();
    const skewY = node.skewY();


    node.scale({ x: 1, y: 1 });


    dispatch(updateShapePosition({
      id: shapeId,
      x,
      y,
      width,
      height,
      skewX,
      skewY,
    }));
  };
  const handleDoubleClick = () => {
    if (newShape && newShape.type === "Bezier") {
      dispatch(addShape(newShape));
      setNewShape(null);
      setIsDrawing(false);
    }
    if (selectedTool === "Bezier" && bezierOption === "Spiro Path" && spiroPoints.length > 1) {
      const pathData = generateSpiroPath(spiroPoints, 0.5, isShapeClosed);


      dispatch(
        addShape({
          id: `spiro-${Date.now()}`,
          type: "Spiro Path",
          path: pathData,
          stroke: strokeColor,
          strokeWidth: 2,
          fill: fillColor || "black",
        })
      );

      dispatch(clearSpiroPoints());
      return;
    }

    if (selectedTool === "Bezier" && bezierOption === "BSpline Path" && bsplinePoints.length > 1) {
      const pathData = generateBSplinePath(bsplinePoints, 0.5, true);

      dispatch(
        addShape({
          id: `bspline-${Date.now()}`,
          type: "Path",
          path: pathData,
          stroke: strokeColor,
          strokeWidth: 2,
          fill: isShapeClosed ? fillColor : "black",
        })
      );


      dispatch(clearBSplinePoints());
      setIsDrawing(false);
    }

    if (selectedTool === "Bezier" && bezierOption === "Paraxial Line Segments") {
      if (paraxialPoints.length < 2) {
        console.warn("Not enough points to create a shape.");
        return;
      }


      let pathData = paraxialPoints
        .map((point, index) => {
          return index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`;
        })
        .join(" ");


      if (isShapeClosed) {
        pathData += " Z";
      }


      dispatch(
        addShape({
          id: `paraxial-${Date.now()}`,
          type: "Path",
          path: pathData,
          stroke: strokeColor,
          strokeWidth: 2,
          fill: isShapeClosed ? fillColor : "black",
        })
      );


      dispatch(clearParaxialPoints());
      setIsDrawing(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      console.log("Key pressed:", e.key, "Ctrl:", e.ctrlKey);

      if (e.ctrlKey && e.key === "z") {
        console.log("Undo triggered");
        dispatch(undo());
      }

      if (e.ctrlKey && e.key === "y") {
        console.log("Redo triggered");
        dispatch(redo());
      }

      if (e.key === "Delete" && selectedShapeId) {
        console.log("Deleting shape with ID:", selectedShapeId);
        dispatch(deleteShape());
      }
      if (e.key === "Backspace" && selectedShapeId) {
        console.log("Deleting shape with ID:", selectedShapeId);
        dispatch(deleteShape());
      }
      if (e.key === "Backspace" && selectedShapeId) {
        console.log("Deleting shape with ID:", selectedShapeId);
        dispatch(deleteShape());
      }
      if (e.ctrlKey && e.key === "a") {
        dispatch(selecteAllShapes());
      }
      if (e.ctrlKey && e.key === "x") {
        dispatch(cut());
      }
      if (e.ctrlKey && e.key === "v") {
        dispatch(paste());
      }
    };


    window.addEventListener("keydown", handleKeyDown);


    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, selectedShapeId]);
  const shapeRefs = useRef({});
  useLayoutEffect(() => {
    if (!transformerRef.current || !layerRef.current) return;

    requestAnimationFrame(() => {
      const selectedNodes = selectedShapeIds
        .map((id) => shapeRefs.current[id])
        .filter(Boolean);

      if (selectedNodes.length > 0) {
        try {
          transformerRef.current.nodes(selectedNodes);
          transformerRef.current.getLayer().batchDraw();
        } catch (err) {
          console.error("Failed to assign transformer nodes:", err);
        }
      } else {
        transformerRef.current.nodes([]);
      }
    });
  }, [selectedShapeIds, shapes]);


  const handleTransform = (e, shapeId) => {
    const node = e.target;


    const skewX = node.skewX();
    const skewY = node.skewY();
    const { x, y } = node.position();
    const width = node.width() * node.scaleX();
    const height = node.height() * node.scaleY();


    node.scaleX(1);
    node.scaleY(1);


    dispatch(updateShapePosition({
      id: shapeId,
      x,
      y,
      width,
      height,
      skewX,
      skewY,
    }));
  };

  useEffect(() => {
    console.log("TextArea Visible Updated:", textAreaVisible);
  }, [textAreaVisible]);

  useEffect(() => {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;

    const initialX = (containerWidth - width) / 2;
    const initialY = (containerHeight - height) / 2;

    setPosition({ x: initialX, y: initialY });
  }, [width, height]);

  useEffect(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const initialX = (viewportWidth - width * scale) / 2;
    const initialY = (viewportHeight - height * scale) / 2;

    setPosition({ x: initialX, y: initialY });
  }, [width, height, scale]);
  const handleWheel = (e) => {
    e.evt.preventDefault();

    if (e.evt.ctrlKey) {
      const scaleBy = 1.1;
      const oldScale = scale;

      const pointer = {
        x: e.evt.offsetX,
        y: e.evt.offsetY,
      };

      const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;


      const clampedScale = Math.max(0.5, Math.min(newScale, 3));


      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const newX = (viewportWidth - width * clampedScale) / 2;
      const newY = (viewportHeight - height * clampedScale) / 2;

      setScale(clampedScale);
      setPosition({ x: newX, y: newY });
    }
  };
  const rotatePoint = (x, y, cx, cy, angle) => {
    const radians = (Math.PI / 180) * angle;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const nx = cos * (x - cx) - sin * (y - cy) + cx;
    const ny = sin * (x - cx) + cos * (y - cy) + cy;

    return { x: nx, y: ny };
  };
  const flipPoint = (x, y, cx, cy, axis) => {
    if (axis === "horizontal") {
      return { x: 2 * cx - x, y };
    } else if (axis === "vertical") {
      return { x, y: 2 * cy - y };
    }
    return { x, y };
  };
  const selectedShape = shapes.find((shape) => shape.id === selectedShapeId);
  const calligraphyOption = useSelector((state) => state.tool.calligraphyOption);
  const calligraphySettings = useSelector((state) => state.tool.calligraphySettings);
  const pencilOption = useSelector((state) => state.tool.pencilOption);
  const pencilMode = useSelector((state) => state.tool.pencilMode);
  function scalePoints(points, scale, centerX, centerY) {
    return points.map(([x, y]) => {
      const dx = x - centerX;
      const dy = y - centerY;
      return [centerX + dx * scale, centerY + dy * scale];
    });
  }
  function scaleShapePoints(points, scale, centerX, centerY) {
    return points.map(([x, y]) => {
      const dx = x - centerX;
      const dy = y - centerY;
      return [centerX + dx * scale, centerY + dy * scale];
    });
  }

  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.content.tabIndex = 0;
      stageRef.current.content.focus();
    }
  }, []);

  const pencilScale = useSelector((state) => state.tool.pencilScale);
  const generateControlPoints = (shape) => {
    if (shape.type === "Rectangle") {
      return [
        { x: shape.x, y: shape.y },
        { x: shape.x + shape.width, y: shape.y },
        { x: shape.x + shape.width, y: shape.y + shape.height },
        { x: shape.x, y: shape.y + shape.height },
      ];
    } else if (shape.type === "Circle") {
      return [
        { x: shape.x, y: shape.y },
        { x: shape.x + shape.radius, y: shape.y },
      ];
    }
    return [];
  };
  const generatePolygonPath = (points) => {
    if (!points || points.length === 0) return "";

    const path = points
      .map((point, index) =>
        index === 0
          ? `M ${point.x} ${point.y}`
          : `L ${point.x} ${point.y}`
      )
      .join(" ");

    return `${path} Z`;
  };
  useEffect(() => {
    if (!isSnappingEnabled) {
      setSnappingLines([]);
    }
  }, [isSnappingEnabled]);
  const renderGrid = () => {
    const gridSize = 20;
    const lines = [];


    for (let i = 0; i <= Math.ceil(width / gridSize); i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridSize, 0, i * gridSize, height]}
          stroke="#ddd"
          strokeWidth={0.5}
          listening={false}
        />
      );
    }

    for (let i = 0; i <= Math.ceil(height / gridSize); i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridSize, width, i * gridSize]}
          stroke="#ddd"
          strokeWidth={0.5}
          listening={false}
        />
      );
    }

    return lines;
  };

  const snapToObjects = (node, objects, threshold = 10) => {
    console.log("snapToObjects called with:", { node, objects, threshold });
    const newSnappingLines = [];

    objects.forEach((obj) => {

      if (Math.abs(node.x() - obj.x) < threshold) {
        console.log(`Snapping to left edge of object:`, obj);
        node.x(obj.x);
        newSnappingLines.push({
          points: [obj.x, 0, obj.x, height],
          orientation: "vertical",
        });
      }


      if (Math.abs(node.x() + node.width() - (obj.x + obj.width)) < threshold) {
        console.log(`Snapping to right edge of object:`, obj);
        node.x(obj.x + obj.width - node.width());
        newSnappingLines.push({
          points: [obj.x + obj.width, 0, obj.x + obj.width, height],
          orientation: "vertical",
        });
      }


      if (Math.abs(node.x() + node.width() / 2 - (obj.x + obj.width / 2)) < threshold) {
        console.log(`Snapping to center of object:`, obj);
        node.x(obj.x + obj.width / 2 - node.width() / 2);
        newSnappingLines.push({
          points: [obj.x + obj.width / 2, 0, obj.x + obj.width / 2, height],
          orientation: "vertical",
        });
      }


      if (Math.abs(node.y() - obj.y) < threshold) {
        console.log(`Snapping to top edge of object:`, obj);
        node.y(obj.y);
        newSnappingLines.push({
          points: [0, obj.y, width, obj.y],
          orientation: "horizontal",
        });
      }


      if (Math.abs(node.y() + node.height() - (obj.y + obj.height)) < threshold) {
        console.log(`Snapping to bottom edge of object:`, obj);
        node.y(obj.y + obj.height - node.height());
        newSnappingLines.push({
          points: [0, obj.y + obj.height, width, obj.y + obj.height],
          orientation: "horizontal",
        });
      }


      if (Math.abs(node.y() + node.height() / 2 - (obj.y + obj.height / 2)) < threshold) {
        console.log(`Snapping to vertical center of object:`, obj);
        node.y(obj.y + obj.height / 2 - node.height() / 2);
        newSnappingLines.push({
          points: [0, obj.y + obj.height / 2, width, obj.y + obj.height / 2],
          orientation: "horizontal",
        });
      }
    });

    setSnappingLines(newSnappingLines);
  };

  {
    selectedShape && selectedTool === "Select" && (
      <Transformer
        ref={transformerRef}
        nodes={[layerRef.current?.findOne(`#${selectedShape.id}`)]}
        boundBoxFunc={(oldBox, newBox) => {
          if (newBox.width < 5 || newBox.height < 5) {
            return oldBox;
          }
          return newBox;
        }}
        enabledAnchors={[
          "top-left",
          "top-center",
          "top-right",
          "middle-left",
          "middle-right",
          "bottom-left",
          "bottom-center",
          "bottom-right",
        ]}
        rotateEnabled={true}
        skewEnabled={true}
      />
    )
  }
  useEffect(() => {
    if (transformerRef.current) {
      console.log("Transformer nodes:", transformerRef.current.nodes());
    }
  }, [selectedShape]);
  const handleRadiusChange = (e, radiusType) => {
    const newValue = parseFloat(e.target.value);

    if (!isNaN(newValue) && selectedShapeId) {
      dispatch(
        updateShapePosition({
          id: selectedShapeId,
          [radiusType]: newValue,
        })
      );
    }
  };
  return (
    <>
      <div className="my-0"
        style={{


          marginRight: isSidebarOpen ? "10em" : "5em",
          position: "relative"
        }}
      >
        <div>
          <div ref={printRef}>
            <Stage
              width={width}
              height={height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseEnter={(e) => {
                const stage = e.target.getStage();
                const adjustedPointerPosition = getAdjustedPointerPosition(stage, position, scale);
                if (adjustedPointerPosition) {
                  setCursorPosition(adjustedPointerPosition);
                }
                setIsCustomCursorVisible(true);
              }}
              onMouseLeave={() => {
                setIsCustomCursorVisible(false);
              }}
              onDblClick={handleDoubleClick}
              tabIndex={0}
              scaleX={scale}
              scaleY={scale}
              x={position.x}
              y={position.y}
              ref={stageRef}
              onWheel={handleWheel}
              style={{
                cursor: toolCursors[selectedTool] ? "none" : "default",
              }}
            >

              <Layer ref={layerRef}>
                <Rect
                  x={0}
                  y={0}
                  height={width}
                  width={width}
                  fill="#ffffff"
                  listening={false}
                  draggable
                />
                {isSnappingEnabled && renderGrid()}
                {snappingLines.map((line, index) => (
                  <Line
                    key={index}
                    points={line.points}
                    stroke="blue"
                    strokeWidth={1}
                    dash={[5, 5]}
                  />
                ))}
                {selectedTool === "Bezier" && (
                  <Path
                    data={getBezierPath()}
                    stroke="black"
                    strokeWidth={2}
                    fill={isShapeClosed ? fillColor : "black"}
                    closed={isShapeClosed}
                  />
                )}

                {selectedTool === "Bezier" && bezierOption !== "Spiro Path" && (
                  <Path
                    data={getBezierPath()}
                    stroke="black"
                    strokeWidth={2}
                    fill={isShapeClosed ? fillColor : "black"}
                    closed={isShapeClosed}
                  />
                )}

                {selectedTool === "Bezier" && bezierOption == "Paraxial Line Segments" && (
                  <Path
                    data={getBezierPath()}
                    stroke="black"
                    strokeWidth={2}
                    fill={isShapeClosed ? fillColor : "black"}
                    closed={isShapeClosed}
                  />
                )}

                {renderSpiroPath()}

                {renderBSplinePath()}

                {renderParaxialSegments()}

                {shapes.map((shape) => {
                  const isSelected = selectedShapeIds.includes(shape.id);
                  console.log("Rendering shape:", shape);
                  if (shape.type === "Line") {

                    if (!Array.isArray(shape.points)) {
                      console.error("Invalid points structure for Line shape:", shape);
                      return null;
                    }


                    const points =
                      typeof shape.points[0] === "number"
                        ? shape.points.reduce((acc, val, index) => {
                          if (index % 2 === 0) acc.push({ x: val, y: shape.points[index + 1] });
                          return acc;
                        }, [])
                        : shape.points;


                    if (!points.every((point) => point && typeof point.x === "number" && typeof point.y === "number")) {
                      console.error("Invalid points structure for Line shape:", shape);
                      return null;
                    }

                    return (
                      <Line
                        key={shape.id}
                        points={points.flatMap((point) => [point.x, point.y])}
                        stroke={shape.strokeColor || "black"}
                        strokeWidth={shape.strokeWidth || 2}
                        lineJoin="round"
                        lineCap="round"
                      />
                    );
                  }
                  if (shape.type === "Group") {
                    return (
                      <Group
                        key={shape.id}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        draggable
                        onClick={(e) => {
                          e.cancelBubble = true;
                          dispatch(selectShape(shape.id));
                        }}
                        onDragEnd={(e) => {
                          const { x, y } = e.target.position();
                          dispatch(updateShapePosition({ id: shape.id, x, y }));
                        }}
                      >
                        {shape.shapes.map((childShape) => {
                          if (childShape.type === "Rectangle") {
                            return (
                              <Rect
                                key={childShape.id}
                                x={childShape.x}
                                y={childShape.y}
                                width={childShape.width}
                                height={childShape.height}
                                fill={childShape.fill || "black"}
                                stroke={childShape.stroke || "black"}
                                strokeWidth={childShape.strokeWidth || 1}
                              />
                            );
                          } else if (childShape.type === "Circle") {
                            return (
                              <Circle
                                key={childShape.id}
                                x={childShape.x}
                                y={childShape.y}
                                radius={childShape.radius}
                                fill={childShape.fill || "transparent"}
                                stroke={childShape.stroke || "black"}
                                strokeWidth={childShape.strokeWidth || 1}
                              />
                            );
                          } else if (childShape.type === "Star") {
                            return (
                              <Star
                                key={childShape.id}
                                x={childShape.x}
                                y={childShape.y}
                                numPoints={childShape.corners}
                                innerRadius={childShape.innerRadius}
                                outerRadius={childShape.outerRadius}
                                fill={childShape.fill || "transparent"}
                                stroke={childShape.stroke || "black"}
                                strokeWidth={childShape.strokeWidth || 1}
                              />
                            );
                          } else if (childShape.type === "Polygon") {
                            return (
                              <Path
                                key={childShape.id}
                                x={childShape.x}
                                y={childShape.y}
                                data={generatePolygonPath(childShape.points)}
                                fill={childShape.fill || "transparent"}
                                stroke={childShape.stroke || "black"}
                                strokeWidth={childShape.strokeWidth || 1}
                              />
                            );
                          } else if (childShape.type === "Pencil") {
                            return (
                              <Line
                                key={childShape.id}
                                points={childShape.points.flatMap((p) => [p[0], p[1]])}
                                stroke={childShape.strokeColor || "black"}
                                fill={childShape.fill || "transparent"}
                                strokeWidth={childShape.strokeWidth || 1}
                                lineJoin="round"
                                lineCap="round"
                                closed={childShape.closed || false}
                              />
                            );
                          } else if (childShape.type === "Calligraphy") {
                            return (
                              <Line
                                key={childShape.id}
                                points={childShape.points.flatMap((p) => [p.x, p.y])}
                                stroke={childShape.stroke || "black"}
                                fill={childShape.fill || "transparent"}
                                strokeWidth={childShape.strokeWidth || 1}
                                lineJoin="round"
                                lineCap="round"
                                closed={false}
                              />
                            );
                          }
                          return null;
                        })}
                      </Group>
                    );
                  }
                  if (shape.type === "Rectangle") {
                    return (
                      <React.Fragment key={shape.id}>
                        <Rect
                          ref={(node) => {
                            if (node) shapeRefs.current[shape.id] = node;
                            else delete shapeRefs.current[shape.id];
                          }}
                          key={shape.id}
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          width={shape.width}
                          height={shape.height}
                          fill={shape.fill || "black"}
                          stroke={shape.stroke || "black"}
                          strokeWidth={shape.strokeWidth || 1}
                          cornerRadius={tempCornerRadius !== null ? tempCornerRadius : shape.cornerRadius}
                          dash={getDashArray(shape.strokeStyle)}
                          rotation={shape.rotation || 0}
                          scaleX={shape.scaleX || 1}
                          scaleY={shape.scaleY || 1}
                          draggable={selectedTool !== "Node"}
                          onDragMove={handleDragMove}
                          onDragEnd={(e) => handleDragEnd(e, shape.id)}
                          onTransformEnd={(e) => handleResizeEnd(e, shape.id)}
                          skewX={shape.skewX || 0}
                          skewY={shape.skewY || 0}
                          onClick={(e) => {
                            e.cancelBubble = true;

                            if (e.evt.ctrlKey && selectedShape) {

                              dispatch(
                                selectNodePoint({
                                  shapeId: selectedShape.id,
                                  index,
                                  x: point.x,
                                  y: point.y,
                                })
                              );
                            } else {

                              dispatch(selectShape(shape.id));
                            }
                          }}
                        />
                        {isSelected && selectedTool !== "Node" && (
                          <Transformer
                            nodes={[layerRef.current.findOne(`#${shape.id}`)]}
                            boundBoxFunc={(oldBox, newBox) => {
                              if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                              }
                              return newBox;
                            }}
                            enabledAnchors={[
                              "top-left",
                              "top-center",
                              "top-right",
                              "middle-left",
                              "middle-right",
                              "bottom-left",
                              "bottom-center",
                              "bottom-right",
                            ]}
                            skewEnabled={true}
                          />
                        )}
                        {isSelected && selectedTool === "Rectangle" && (
                          <>
                            <Circle
                              x={shape.x + shape.width / 2}
                              y={shape.y - 80}
                              radius={5}
                              fill="blue"
                              draggable
                              onDragStart={() => {
                                setIsDraggingBlueCircle(true);
                                setTempCornerRadius(shape.cornerRadius);
                              }}
                              onDragMove={(e) => {
                                e.cancelBubble = true;

                                const { x, y } = e.target.position();
                                const centerX = shape.x + shape.width / 2;
                                const centerY = shape.y - 80;

                                const deltaX = x - centerX;
                                const deltaY = y - centerY;


                                const horizontalCornerRadius = Math.max(0, shape.cornerRadius + deltaX);


                                const maxCornerRadius = Math.min(shape.width, shape.height) / 2;
                                const verticalCornerRadius = Math.min(maxCornerRadius, Math.max(0, shape.cornerRadius + deltaY));

                                console.log("Horizontal Corner Radius (interactive):", horizontalCornerRadius);
                                console.log("Vertical Corner Radius (interactive):", verticalCornerRadius);


                                setTempCornerRadius(Math.max(horizontalCornerRadius, verticalCornerRadius));
                              }}
                              onDragEnd={(e) => {
                                e.cancelBubble = true;

                                const { x, y } = e.target.position();
                                const centerX = shape.x + shape.width / 2;
                                const centerY = shape.y - 80;

                                const deltaX = x - centerX;
                                const deltaY = y - centerY;


                                const maxCornerRadius = Math.min(shape.width, shape.height) / 2;
                                const horizontalCornerRadius = Math.max(0, shape.cornerRadius + deltaX);
                                const verticalCornerRadius = Math.min(maxCornerRadius, Math.max(0, shape.cornerRadius + deltaY));
                                const finalCornerRadius = Math.max(horizontalCornerRadius, verticalCornerRadius);

                                console.log("Final Corner Radius:", finalCornerRadius);


                                dispatch(updateShapePosition({ id: shape.id, cornerRadius: finalCornerRadius }));


                                setTempCornerRadius(null);
                                setIsDraggingBlueCircle(false);
                              }}
                              onClick={(e) => {
                                e.cancelBubble = true;
                              }}
                            />
                          </>
                        )}
                      </React.Fragment>
                    );
                  } else if (shape.type === "Bezier") {
                    const isSelected = selectedShapeIds.includes(shape.id);
                    return (
                      <React.Fragment key={shape.id}>
                        <Path
                          id={shape.id}
                          data={getBezierPathFromPoints(shape.points, shape.closed)}
                          stroke={isSelected ? "blue" : shape.stroke || shape.strokeColor || "black"}
                          strokeWidth={shape.strokeWidth || 2}
                          fill={shape.fill || (shape.closed ? shape.fillColor : "transparent")}
                          closed={shape.closed}
                          rotation={shape.rotation || 0}
                          draggable
                          onDragMove={handleDragMove}
                          dash={getDashArray(shape.strokeStyle)}
                          onClick={(e) => {
                            e.cancelBubble = true;
                            dispatch(selectShape(shape.id));
                          }}
                          onMouseDown={(e) => {
                            e.cancelBubble = true;
                          }}
                          onTransformStart={(e) => {
                            e.cancelBubble = true;
                          }}
                          onTransformEnd={(e) => handleBezierTransformEnd(e, shape)}
                          onDragEnd={(e) => {
                            const { x, y } = e.target.position();
                            dispatch(updateShapePosition({ id: shape.id, x, y }));
                          }}
                        />
                        {isSelected && (
                          <Transformer
                            nodes={[layerRef.current.findOne(`#${shape.id}`)]}
                            boundBoxFunc={(oldBox, newBox) => {
                              if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                              }
                              return newBox;
                            }}
                          />
                        )}
                      </React.Fragment>
                    );
                  } else if (shape.type === "Spiro Path") {
                    const isSelected = selectedShapeIds.includes(shape.id);
                    return (
                      <React.Fragment key={shape.id}>
                        <Path
                          id={shape.id}
                          data={shape.path}
                          stroke={shape.stroke || "black"}
                          strokeWidth={shape.strokeWidth || 2}
                          fill={shape.fill || (shape.closed ? shape.fill : "black")}
                          closed={shape.closed || false}
                          rotation={shape.rotation || 0}
                          draggable={selectedTool !== "Node"}
                          onDragMove={handleDragMove}
                          dash={getDashArray(shape.strokeStyle)}
                          onClick={(e) => {
                            e.cancelBubble = true;

                            if (e.evt.ctrlKey && selectedShape) {

                              dispatch(
                                selectNodePoint({
                                  shapeId: selectedShape.id,
                                  index,
                                  x: point.x,
                                  y: point.y,
                                })
                              );
                            } else {

                              dispatch(selectShape(shape.id));
                            }
                          }}
                          onMouseDown={(e) => {
                            e.cancelBubble = true;
                          }}
                          onDragEnd={(e) => {
                            const { x, y } = e.target.position();
                            dispatch(updateShapePosition({ id: shape.id, x, y }));
                          }}
                        />
                        {isSelected && selectedTool !== "Node" && (
                          <Transformer
                            nodes={[layerRef.current.findOne(`#${shape.id}`)]}
                            boundBoxFunc={(oldBox, newBox) => {
                              if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                              }
                              return newBox;
                            }}
                          />
                        )}
                      </React.Fragment>
                    );
                  }
                  else if (shape.type === "Image") {
                    const img = new window.Image();
                    img.src = shape.url;
                    return (
                      <Image
                        key={shape.id}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        image={img}
                        draggable={selectedShapeId === shape.id}
                        dash={getDashArray(shape.strokeStyle)}
                        onClick={(e) => {
                          e.cancelBubble = true;

                          if (e.evt.ctrlKey && selectedShape) {

                            dispatch(
                              selectNodePoint({
                                shapeId: selectedShape.id,
                                index,
                                x: point.x,
                                y: point.y,
                              })
                            );
                          } else {

                            dispatch(selectShape(shape.id));
                          }
                        }}
                        onDragEnd={(e) => {
                          const { x, y } = e.target.position();
                          dispatch(updateShapePosition({ id: shape.id, x, y }));
                        }}
                      />
                    );
                  } else if (shape.type === "Circle") {
                    const isSelected = selectedShapeIds.includes(shape.id);
                    return (
                      <React.Fragment key={shape.id}>
                        <Circle
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          radius={shape.radius}
                          fill={shape.fill || "transparent"}
                          stroke={shape.stroke || "black"}
                          strokeWidth={shape.strokeWidth || 1}
                          rotation={shape.rotation || 0}
                          scaleX={shape.horizontalRadius / shape.radius || 1}
                          scaleY={shape.verticalRadius / shape.radius || 1}
                          draggable={selectedTool !== "Node"}
                          onDragMove={handleDragMove}
                          onClick={(e) => {
                            e.cancelBubble = true;

                            if (e.evt.ctrlKey && selectedShape) {

                              dispatch(
                                selectNodePoint({
                                  shapeId: selectedShape.id,
                                  index,
                                  x: point.x,
                                  y: point.y,
                                })
                              );
                            } else {

                              dispatch(selectShape(shape.id));
                            }
                          }}
                          onTransformEnd={(e) => handleResizeEnd(e, shape.id)}
                          onDragEnd={(e) => {
                            const { x, y } = e.target.position();
                            dispatch(updateShapePosition({ id: shape.id, x, y }));
                          }}
                        />
                        {isSelected && selectedTool !== "Node" && (
                          <Transformer
                            nodes={[layerRef.current.findOne(`#${shape.id}`)]}
                            boundBoxFunc={(oldBox, newBox) => {
                              if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                              }
                              return newBox;
                            }}
                          />
                        )}
                        {selectedTool === "Node" && shape.points.map((point, index) => (
                          <Circle
                            key={index}
                            x={point.x}
                            y={point.y}
                            radius={5}
                            fill="blue"
                            draggable
                            onDragMove={(e) => {
                              const newPosition = { x: e.target.x(), y: e.target.y() };
                              dispatch(updateNodePosition({ shapeId: shape.id, nodeIndex: index, newPosition }));
                            }}
                          />
                        ))}
                      </React.Fragment>
                    );
                  } else if (shape.type === "Star") {
                    const isSelected = selectedShapeIds.includes(shape.id);
                    return (
                      <React.Fragment key={shape.id}>
                        <Star
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          numPoints={shape.corners}
                          innerRadius={shape.innerRadius}
                          outerRadius={shape.outerRadius}
                          rotation={shape.rotation || 0}
                          scaleX={shape.scaleX || 1}
                          scaleY={shape.scaleY || 1}
                          fill={shape.fill || "transparent"}
                          stroke={shape.stroke || "black"}
                          strokeWidth={shape.strokeWidth || 1}
                          onDragMove={handleDragMove}
                          draggable={selectedTool !== "Node"}
                          onTransformEnd={(e) => handleBezierTransformEnd(e, shape)}
                          onClick={(e) => {
                            e.cancelBubble = true;

                            if (e.evt.ctrlKey && selectedShape) {

                              dispatch(
                                selectNodePoint({
                                  shapeId: selectedShape.id,
                                  index,
                                  x: point.x,
                                  y: point.y,
                                })
                              );
                            } else {

                              dispatch(selectShape(shape.id));
                            }
                          }}
                          onDragEnd={(e) => {
                            const { x, y } = e.target.position();
                            dispatch(updateShapePosition({ id: shape.id, x, y }));
                          }}
                        />
                        {isSelected && selectedTool !== "Node" && (
                          <Transformer
                            nodes={[layerRef.current.findOne(`#${shape.id}`)]}
                            boundBoxFunc={(oldBox, newBox) => {
                              if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                              }
                              return newBox;
                            }}
                          />
                        )}
                      </React.Fragment>
                    );
                  } else if (shape.type === "Polygon") {
                    const isSelected = selectedShapeIds.includes(shape.id);
                    return (
                      <React.Fragment key={shape.id}>
                        <Path
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          data={generatePolygonPath(shape.points)}
                          stroke={shape.stroke || "black"}
                          strokeWidth={shape.strokeWidth || 1}
                          rotation={shape.rotation || 0}
                          scaleX={shape.scaleX || 1}
                          scaleY={shape.scaleY || 1}
                          fill={shape.fill || "transparent"}
                          closed
                          draggable={selectedTool !== "Node"}
                          onDragMove={handleDragMove}
                          onClick={(e) => {
                            e.cancelBubble = true;

                            if (e.evt.ctrlKey && selectedShape) {

                              dispatch(
                                selectNodePoint({
                                  shapeId: selectedShape.id,
                                  index,
                                  x: point.x,
                                  y: point.y,
                                })
                              );
                            } else {

                              dispatch(selectShape(shape.id));
                            }
                          }}
                          onDragEnd={(e) => {
                            const { x, y } = e.target.position();
                            dispatch(updateShapePosition({ id: shape.id, x, y }));
                          }}
                        />
                        {isSelected && selectedTool !== "Node" && (
                          <Transformer
                            nodes={[layerRef.current.findOne(`#${shape.id}`)]}
                            boundBoxFunc={(oldBox, newBox) => {
                              if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                              }
                              return newBox;
                            }}
                          />
                        )}
                      </React.Fragment>
                    );
                  } else if (shape.type === "Pen") {
                    if (!Array.isArray(shape.points) || !shape.points.every((p) => Array.isArray(p) && p.length === 2)) {
                      console.error("Invalid points structure for Pen shape:", shape);
                      return null;
                    }

                    const centerX = shape.points.reduce((sum, [x]) => sum + x, 0) / shape.points.length;
                    const centerY = shape.points.reduce((sum, [, y]) => sum + y, 0) / shape.points.length;

                    const rotatedPoints = shape.points.map(([x, y]) => {
                      const { x: nx, y: ny } = rotatePoint(x, y, centerX, centerY, shape.rotation || 0);
                      return [nx, ny];
                    });
                    return (
                      <Line
                        key={shape.id}
                        id={shape.id}
                        points={rotatedPoints.flat()}
                        stroke={shape.strokeColor}
                        strokeWidth={shape.strokeWidth || 2}
                        lineJoin="round"
                        lineCap="round"
                        rotation={shape.rotation || 0}
                        dash={getDashArray(shape.strokeStyle)}
                        scaleX={shape.scaleX || 1}
                        scaleY={shape.scaleY || 1}
                        draggable
                        onClick={(e) => {
                          e.cancelBubble = true;
                          dispatch(selectShape(shape.id));
                        }}
                        onMouseDown={(e) => {
                          e.cancelBubble = true;
                        }}
                        onTransformStart={(e) => {
                          e.cancelBubble = true;
                        }}
                        onTransformEnd={(e) => handleBezierTransformEnd(e, shape)}
                        onDragEnd={(e) => {
                          const { x, y } = e.target.position();
                          dispatch(updateShapePosition({ id: shape.id, x, y }));
                        }}
                      />
                    );
                  } else if (shape.type === "Pencil") {
                    if (!Array.isArray(shape.points) || !shape.points.every((p) => Array.isArray(p) && p.length === 2)) {
                      console.error("Invalid points structure for Pencil shape:", shape);
                      return null;
                    }

                    const centerX = shape.points.reduce((sum, [x]) => sum + x, 0) / shape.points.length;
                    const centerY = shape.points.reduce((sum, [, y]) => sum + y, 0) / shape.points.length;

                    const rotatedPoints = shape.points.map(([x, y]) => {
                      const { x: nx, y: ny } = rotatePoint(x, y, centerX, centerY, shape.rotation || 0);
                      return [nx, ny];
                    });
                    const scaledPoints = scaleShapePoints(shape.points, 1 + pencilScale, centerX, centerY);
                    const isSelected = selectedShapeIds.includes(shape.id);

                    return (
                      <React.Fragment key={shape.id}>
                        <Line
                          key={shape.id}
                          id={shape.id}
                          points={shape.points.flatMap((p) => [p[0], p[1]])}
                          stroke={shape.strokeColor}
                          fill={shape.fill || "transparent"}
                          strokeWidth={shape.strokeWidth || 1}
                          lineJoin="round"
                          lineCap="round"
                          closed={shape.closed || false}
                          draggable={selectedTool !== "Node"}
                          dash={getDashArray(shape.strokeStyle)}
                          rotation={shape.rotation || 0}
                          onDragMove={handleDragMove}
                          scaleX={shape.scaleX || 1}
                          scaleY={shape.scaleY || 1}
                          onClick={(e) => {
                            e.cancelBubble = true;

                            if (e.evt.ctrlKey && selectedShape) {

                              dispatch(
                                selectNodePoint({
                                  shapeId: selectedShape.id,
                                  index,
                                  x: point.x,
                                  y: point.y,
                                })
                              );
                            } else {

                              dispatch(selectShape(shape.id));
                            }
                          }}
                          onDragEnd={(e) => {
                            const { x, y } = e.target.position();
                            dispatch(updateShapePosition({ id: shape.id, x, y }));
                          }}
                        />
                        {isSelected && selectedTool !== "Node" && (
                          <Transformer
                            nodes={[layerRef.current.findOne(`#${shape.id}`)]}
                            boundBoxFunc={(oldBox, newBox) => {
                              if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                              }
                              return newBox;
                            }}
                          />
                        )}
                      </React.Fragment>
                    );
                  } else if (shape.type === "Calligraphy") {
                    const isSelected = selectedShapeIds.includes(shape.id);
                    return (
                      <React.Fragment key={shape.id}>
                        <Line
                          key={shape.id}
                          id={shape.id}
                          points={shape.points.flatMap((p) => [p.x, p.y])}
                          stroke={shape.stroke}
                          fill={shape.fill || "transparent"}
                          strokeWidth={shape.strokeWidth}
                          lineJoin="round"
                          lineCap="round"
                          closed={false}
                          draggable={selectedTool !== "Node"}
                          dash={getDashArray(shape.strokeStyle)}
                          onDragMove={handleDragMove}
                          rotation={shape.rotation || 0}
                          scaleX={shape.scaleX || 1}
                          scaleY={shape.scaleY || 1}
                          offsetX={shape.width / 2}
                          offsetY={shape.height / 2}
                          onClick={(e) => {
                            e.cancelBubble = true;

                            if (e.evt.ctrlKey && selectedShape) {

                              dispatch(
                                selectNodePoint({
                                  shapeId: selectedShape.id,
                                  index,
                                  x: point.x,
                                  y: point.y,
                                })
                              );
                            } else {

                              dispatch(selectShape(shape.id));
                            }
                          }}
                          onDragEnd={(e) => {
                            const { x, y } = e.target.position();
                            dispatch(updateShapePosition({ id: shape.id, x, y }));
                          }}
                        />
                        {isSelected && selectedTool !== "Node" && (
                          <Transformer
                            nodes={[layerRef.current.findOne(`#${shape.id}`)]}
                            boundBoxFunc={(oldBox, newBox) => {
                              if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                              }
                              return newBox;
                            }}
                          />
                        )}
                      </React.Fragment>
                    );
                  } else if (shape.type === "DipPen") {
                    return (
                      <Group key={shape.id}>
                        {shape.points.map((point, index) => {
                          if (index === 0) return null;

                          const prevPoint = shape.points[index - 1];
                          const angle = point.angle || 0;


                          const taperFactorStart = index < 3 ? index / 3 : 1;
                          const taperFactorEnd =
                            index > shape.points.length - 4
                              ? (shape.points.length - index) / 3
                              : 1;
                          const taperFactor = Math.min(taperFactorStart, taperFactorEnd);

                          const nibWidth = point.strokeWidth * taperFactor;


                          const topX1 = prevPoint.x - (nibWidth / 2) * Math.cos(angle + Math.PI / 2);
                          const topY1 = prevPoint.y - (nibWidth / 2) * Math.sin(angle + Math.PI / 2);
                          const bottomX1 = prevPoint.x + (nibWidth / 2) * Math.cos(angle + Math.PI / 2);
                          const bottomY1 = prevPoint.y + (nibWidth / 2) * Math.sin(angle + Math.PI / 2);

                          const topX2 = point.x - (nibWidth / 2) * Math.cos(angle + Math.PI / 2);
                          const topY2 = point.y - (nibWidth / 2) * Math.sin(angle + Math.PI / 2);
                          const bottomX2 = point.x + (nibWidth / 2) * Math.cos(angle + Math.PI / 2);
                          const bottomY2 = point.y + (nibWidth / 2) * Math.sin(angle + Math.PI / 2);

                          return (
                            <Shape
                              key={index}
                              id={`${shape.id}`}
                              sceneFunc={(context, shape) => {
                                context.beginPath();
                                context.moveTo(topX1, topY1);
                                context.lineTo(topX2, topY2);
                                context.lineTo(bottomX2, bottomY2);
                                context.lineTo(bottomX1, bottomY1);
                                context.closePath();
                                context.fillStrokeShape(shape);
                              }}
                              fill={shape.stroke}
                              stroke={shape.stroke}
                              strokeWidth={1}
                              onDragMove={handleDragMove}
                            />
                          );
                        })}
                      </Group>
                    );
                  } else if (shape.type === "Tracing") {
                    return (
                      <Group key={shape.id} id={shape.id}>
                        {Array.isArray(shape.points) &&
                          shape.points.map((point, index) => {
                            if (!Array.isArray(point.shapes)) return null;

                            return point.shapes.map((subShape, shapeIndex) => (
                              <Circle
                                key={`${index}-${shapeIndex}`}
                                id={`${shape.id}`}
                                x={subShape.x}
                                y={subShape.y}
                                radius={subShape.radius}
                                fill={shape.stroke || "black"}
                                onDragMove={handleDragMove}
                              />
                            ));
                          })}
                      </Group>
                    );
                  } else if (shape.type === "Splotchy") {
                    return (
                      <Group key={shape.id}>
                        {shape.points.map((point, index) => {
                          if (index === 0) return null;

                          const prevPoint = shape.points[index - 1];

                          return (
                            <Line
                              key={index}
                              id={`${shape.id}`}
                              points={[prevPoint.x, prevPoint.y, point.x, point.y]}
                              stroke={shape.stroke}
                              strokeWidth={point.strokeWidth}
                              opacity={point.opacity}
                              lineJoin="round"
                              lineCap="round"
                              onDragMove={handleDragMove}
                            />
                          );
                        })}

                        {shape.points.map((point, index) => (
                          <Circle
                            key={`blotch-${index}`}
                            x={point.x}
                            y={point.y}
                            radius={point.strokeWidth / 2}
                            fill={shape.stroke}
                            opacity={point.opacity * 0.8}
                          />
                        ))}
                      </Group>
                    );
                  } else if (shape.type === "Spiral") {
                    const isSelected = selectedShapeIds.includes(shape.id);
                    return (
                      <React.Fragment key={shape.id}>
                        <Path
                          id={shape.id}
                          data={shape.path}
                          stroke={shape.stroke || "black"}
                          strokeWidth={shape.strokeWidth || 2}
                          fill="transparent"
                          draggable={selectedShapeId === shape.id}
                          dash={getDashArray(shape.strokeStyle)}
                          rotation={shape.rotation || 0}
                          scaleX={shape.scaleX || 1}
                          onDragMove={handleDragMove}
                          scaleY={shape.scaleY || 1}
                          onClick={(e) => {
                            e.cancelBubble = true;

                            if (e.evt.ctrlKey && selectedShape) {

                              dispatch(
                                selectNodePoint({
                                  shapeId: selectedShape.id,
                                  index,
                                  x: point.x,
                                  y: point.y,
                                })
                              );
                            } else {

                              dispatch(selectShape(shape.id));
                            }
                          }}
                          onDragEnd={(e) => {
                            const { x, y } = e.target.position();
                            dispatch(updateShapePosition({ id: shape.id, x, y }));
                          }}

                        />
                        {isSelected && selectedTool !== "Node" && (
                          <Transformer
                            nodes={[layerRef.current.findOne(`#${shape.id}`)]}
                            boundBoxFunc={(oldBox, newBox) => {
                              if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                              }
                              return newBox;
                            }}
                          />
                        )}
                      </React.Fragment>
                    );
                  } else if (shape.type === "Text") {
                    const isSelected = selectedShapeIds.includes(shape.id);
                    return (
                      <React.Fragment key={shape.id}>
                        <KonvaText
                          key={shape.id}
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          text={shape.text}
                          fontSize={shape.fontSize || 16}
                          fontFamily={shape.fontFamily || "Arial"}
                          dash={getDashArray(shape.strokeStyle)}
                          fontStyle={shape.fontStyle || "normal"}
                          align={shape.alignment || "left"}
                          width={shape.width || 200}
                          fill={shape.fill || "black"}
                          rotation={shape.rotation || 0}
                          offsetX={shape.width / 2}
                          offsetY={shape.height / 2}
                          scaleX={shape.scaleX || 1}
                          scaleY={shape.scaleY || 1}
                          onDragMove={handleDragMove}
                          draggable
                          onClick={(e) => {
                            e.cancelBubble = true;
                            console.log("Text clicked:", shape.text);
                            setTextAreaPosition({
                              x: shape.x * scale + position.x,
                              y: shape.y * scale + position.y,
                            });
                            setTextContent(shape.text);
                            setEditingTextId(shape.id);
                            setTextAreaVisible(true);
                          }}
                        />
                        {isSelected && selectedTool !== "Node" && (
                          <Transformer
                            nodes={[layerRef.current.findOne(`#${shape.id}`)]}
                            boundBoxFunc={(oldBox, newBox) => {
                              if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                              }
                              return newBox;
                            }}
                          />
                        )}
                      </React.Fragment>
                    );
                  } else if (shape.type === "Path") {
                    return (
                      <Path
                        key={shape.id}
                        id={shape.id}
                        data={shape.path}
                        stroke={shape.stroke || "black"}
                        strokeWidth={shape.strokeWidth || 2}
                        dash={getDashArray(shape.strokeStyle)}
                        fill={shape.fill || "transparent"}
                        draggable
                        onClick={(e) => {
                          e.cancelBubble = true;

                          if (e.evt.ctrlKey && selectedShape) {

                            dispatch(
                              selectNodePoint({
                                shapeId: selectedShape.id,
                                index,
                                x: point.x,
                                y: point.y,
                              })
                            );
                          } else {

                            dispatch(selectShape(shape.id));
                          }
                        }}
                        onDragEnd={(e) => {
                          const { x, y } = e.target.position();
                          dispatch(updateShapePosition({ id: shape.id, x, y }));
                        }}
                      />
                    );
                  }
                  return null;
                })}

                {selectedTool === "Node" &&
                  controlPoints.length > 0 &&
                  controlPoints.map((point, index) => (
                    <Circle
                      key={index}
                      x={point.x}
                      y={point.y}
                      radius={5}
                      fill={
                        selectedShape &&
                          selectedNodePoints.some(
                            (node) => node.shapeId === selectedShape.id && node.index === index
                          )
                          ? "green"
                          : "red"
                      }
                      draggable
                      onClick={(e) => {
                        e.cancelBubble = true;
                        if (selectedShape) {
                          dispatch(
                            selectNodePoint({
                              shapeId: selectedShape.id,
                              index,
                              x: point.x,
                              y: point.y,
                            })
                          );
                        }
                      }}
                      onDragMove={(e) => {
                        if (isStrokeToPathMode) {
                          dispatch(updateStrokeControlPoint({
                            index,
                            newPosition: { x: e.target.x(), y: e.target.y() },
                          }));
                        } else {
                          handleNodeDrag(e, index);
                        }
                      }}

                    />
                  ))}

                {eraserLines.map((line, i) => (
                  <Line
                    key={i}
                    points={line.points}
                    stroke="black"
                    strokeWidth={10}
                    tension={0.5}
                    lineCap="round"
                    globalCompositeOperation="destination-out"
                  />
                ))}

                {spiroPoints.map((point, index) => (
                  <Circle
                    key={index}
                    x={point.x}
                    y={point.y}
                    radius={5}
                    fill="red"
                    draggable
                    onDragMove={(e) => {
                      const { x, y } = e.target.position();
                      dispatch(updateControlPoint({ index, point: { x, y } }));
                    }}
                  />
                ))}

                {selectedShape && selectedTool !== "Node" && (
                  <Transformer
                    ref={transformerRef}
                    nodes={[layerRef.current?.findOne(`#${selectedShape.id}`)]}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 5 || newBox.height < 5) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                    onMouseDown={(e) => {
                      e.cancelBubble = true;
                    }}
                  />
                )}

                {newShape && newShape.type === "Rectangle" && (
                  <Rect
                    x={newShape.x}
                    y={newShape.y}
                    width={newShape.width}
                    height={newShape.height}
                    fill={newShape.fill || "black"}
                    stroke={newShape.stroke}
                    strokeWidth={newShape.strokeWidth}
                    draggable
                    onDragEnd={(e) => handleDragEnd(e, shape.id)}
                    onTransformEnd={(e) => handleResizeEnd(e, shape.id)}
                    onDragMove={handleDragMove}
                  />
                )}
                {newShape && newShape.type === "Circle" && (
                  <Circle
                    x={newShape.x}
                    y={newShape.y}
                    radius={newShape.radius}
                    fill="transparent"
                    stroke={newShape.stroke}
                    strokeWidth={newShape.strokeWidth}
                  />
                )}
                {newShape && newShape.type === "Star" && (
                  <Star
                    x={newShape.x}
                    y={newShape.y}
                    numPoints={newShape.corners}
                    innerRadius={newShape.innerRadius}
                    outerRadius={newShape.outerRadius}
                    fill="transparent"
                    stroke={newShape.stroke}
                    strokeWidth={newShape.strokeWidth}
                  />
                )}
                {newShape && newShape.type === "Polygon" && (
                  <Path
                    x={newShape.x}
                    y={newShape.y}
                    data={generatePolygonPath(newShape.points)}
                    stroke={newShape.stroke}
                    strokeWidth={newShape.strokeWidth}
                    fill={newShape.fill || "transparent"}
                    closed
                  />
                )}
                {newShape && newShape.type === "Spiral" && (
                  <Path
                    x={newShape.x}
                    y={newShape.y}
                    data={newShape.path}

                    strokeWidth={newShape.strokeWidth}
                    fill="transparent"
                  />
                )}
                {newShape && newShape.type === "Pen" && (
                  <Line
                    points={newShape.points}
                    stroke={newShape.stroke}
                    strokeWidth={newShape.strokeWidth}
                    lineJoin="round"
                    lineCap="round"
                  />
                )}
                {newShape && newShape.type === "Bezier" && (
                  <>
                    {console.log("Rendering Bézier Curve:", newShape.points)}
                    {newShape.points.length >= 6 &&
                      Array.from({ length: Math.floor(newShape.points.length / 6) }).map((_, i) => {
                        const segmentPoints = newShape.points.slice(i * 6, i * 6 + 6);
                        return (
                          <Line
                            key={`bezier-segment-${i}`}
                            points={segmentPoints}
                            stroke={newShape.stroke || "black"}
                            strokeWidth={newShape.strokeWidth || 2}
                            bezier={true}
                            lineJoin="round"
                            lineCap="round"
                          />
                        );
                      })}
                  </>
                )}
                {newShape && newShape.type === "Pencil" && (
                  <Line
                    points={newShape.points.flatMap((p) => [p[0], p[1]])}
                    stroke={strokeColor}
                    fill={fillColor || "black"}
                    strokeWidth={2}
                    lineJoin="round"
                    lineCap="round"
                    closed={false}
                  />
                )}
                {newShape && newShape.type === "Calligraphy" && (
                  <Line
                    points={newShape.points.flatMap((p) => [p.x, p.y])}
                    stroke={newShape.stroke}
                    fill="transparent"
                    strokeWidth={newShape.strokeWidth}
                    lineJoin="round"
                    lineCap="round"
                    closed={false}
                  />
                )}
                {newShape && calligraphyOption === "Brush" && (
                  <Group>
                    {newShape.points.map((point, index) => {
                      if (index === 0) return null;

                      const prevPoint = newShape.points[index - 1];
                      const angle = point.angle || 0;


                      const topX1 = prevPoint.x - (prevPoint.ellipseWidth / 2) * Math.cos(angle + Math.PI / 2);
                      const topY1 = prevPoint.y - (prevPoint.ellipseHeight / 2) * Math.sin(angle + Math.PI / 2);
                      const bottomX1 = prevPoint.x + (prevPoint.ellipseWidth / 2) * Math.cos(angle + Math.PI / 2);
                      const bottomY1 = prevPoint.y + (prevPoint.ellipseHeight / 2) * Math.sin(angle + Math.PI / 2);

                      const topX2 = point.x - (point.ellipseWidth / 2) * Math.cos(angle + Math.PI / 2);
                      const topY2 = point.y - (point.ellipseHeight / 2) * Math.sin(angle + Math.PI / 2);
                      const bottomX2 = point.x + (point.ellipseWidth / 2) * Math.cos(angle + Math.PI / 2);
                      const bottomY2 = point.y + (point.ellipseHeight / 2) * Math.sin(angle + Math.PI / 2);

                      return (
                        <Shape
                          key={index}
                          sceneFunc={(context, shape) => {
                            context.beginPath();
                            context.moveTo(topX1, topY1);
                            context.lineTo(topX2, topY2);
                            context.lineTo(bottomX2, bottomY2);
                            context.lineTo(bottomX1, bottomY1);
                            context.closePath();
                            context.fillStrokeShape(shape);
                          }}
                          fill={newShape.stroke}
                          stroke={newShape.stroke}
                          strokeWidth={1}
                        />
                      );
                    })}
                  </Group>
                )}
                {newShape && calligraphyOption === "DipPen" && (
                  <Group>
                    {newShape.points.map((point, index) => {
                      if (index === 0) return null;

                      const prevPoint = newShape.points[index - 1];
                      const angle = point.angle || 0;


                      const taperFactorStart = index < 3 ? index / 3 : 1;
                      const taperFactorEnd =
                        index > newShape.points.length - 4
                          ? (newShape.points.length - index) / 3
                          : 1;
                      const taperFactor = Math.min(taperFactorStart, taperFactorEnd);

                      const nibWidth = point.strokeWidth * taperFactor;


                      const topX1 = prevPoint.x - (nibWidth / 2) * Math.cos(angle + Math.PI / 2);
                      const topY1 = prevPoint.y - (nibWidth / 2) * Math.sin(angle + Math.PI / 2);
                      const bottomX1 = prevPoint.x + (nibWidth / 2) * Math.cos(angle + Math.PI / 2);
                      const bottomY1 = prevPoint.y + (nibWidth / 2) * Math.sin(angle + Math.PI / 2);

                      const topX2 = point.x - (nibWidth / 2) * Math.cos(angle + Math.PI / 2);
                      const topY2 = point.y - (nibWidth / 2) * Math.sin(angle + Math.PI / 2);
                      const bottomX2 = point.x + (nibWidth / 2) * Math.cos(angle + Math.PI / 2);
                      const bottomY2 = point.y + (nibWidth / 2) * Math.sin(angle + Math.PI / 2);

                      return (
                        <Shape
                          key={index}
                          sceneFunc={(context, shape) => {
                            context.beginPath();
                            context.moveTo(topX1, topY1);
                            context.lineTo(topX2, topY2);
                            context.lineTo(bottomX2, bottomY2);
                            context.lineTo(bottomX1, bottomY1);
                            context.closePath();
                            context.fillStrokeShape(shape);
                          }}
                          fill={newShape.stroke}
                          stroke={newShape.stroke}
                          strokeWidth={1}
                        />
                      );
                    })}
                  </Group>
                )}
                {newShape && calligraphyOption === "Wiggly" && (
                  <Group>
                    {newShape.points.map((point, index) => {
                      if (index === 0) return null;

                      const prevPoint = newShape.points[index - 1];

                      return (
                        <Line
                          key={index}
                          points={[prevPoint.x, prevPoint.y, point.x, point.y]}
                          stroke={newShape.stroke}
                          strokeWidth={point.strokeWidth}
                          lineJoin="round"
                          lineCap="round"
                        />
                      );
                    })}
                  </Group>
                )}
                {newShape && calligraphyOption === "Marker" && Array.isArray(newShape.points) && (
                  <Line
                    points={newShape.points.flatMap((p) => [p.x, p.y])}
                    stroke={newShape.stroke}
                    strokeWidth={newShape.strokeWidth}
                    lineJoin="round"
                    lineCap="round"
                    closed={false}
                  />
                )}
                {newShape && calligraphyOption === "Tracing" && Array.isArray(newShape.points) && (
                  <Group>
                    {newShape.points.map((point, index) => {
                      if (!point.shapes || !Array.isArray(point.shapes)) return null;

                      return point.shapes.map((shape, shapeIndex) => (
                        <Circle
                          key={`${index}-${shapeIndex}`}
                          x={shape.x}
                          y={shape.y}
                          radius={shape.radius}
                          fill={newShape.stroke}
                        />
                      ));
                    })}
                  </Group>
                )}
                {newShape && calligraphyOption === "Splotchy" && (
                  <Group>
                    {newShape.points.map((point, index) => {
                      if (index === 0) return null;

                      const prevPoint = newShape.points[index - 1];

                      return (
                        <Line
                          key={index}
                          points={[prevPoint.x, prevPoint.y, point.x, point.y]}
                          stroke={newShape.stroke}
                          strokeWidth={point.strokeWidth}
                          opacity={point.opacity}
                          lineJoin="round"
                          lineCap="round"
                        />
                      );
                    })}

                    {newShape.points.map((point, index) => (
                      <Circle
                        key={`blotch-${index}`}
                        x={point.x}
                        y={point.y}
                        radius={point.strokeWidth / 2}
                        fill={newShape.stroke}
                        opacity={point.opacity * 0.8}
                      />
                    ))}
                  </Group>
                )}
                {newShape && newShape.type === "Text" && (
                  <KonvaText
                    x={newShape.x}
                    y={newShape.y}
                    text={newShape.text}
                    fontSize={newShape.fontSize}
                    fill={newShape.fill}
                  />
                )}
              </Layer>

            </Stage>
          </div>

        </div>
      </div>
      {isCustomCursorVisible && toolCursors[selectedTool] && (
        <div
          style={{
            position: "absolute",
            top: `${(cursorPosition.y * scale) + position.y}px`,
            left: `${(cursorPosition.x * scale) + position.x}px`,
            pointerEvents: "none",
            zIndex: 1000,
            transform: `translate(-30%, -100%)`,
          }}
        >
          {toolCursors[selectedTool]}
        </div>
      )}
      {console.log("Rendering TextArea:", textAreaVisible, "Position:", textAreaPosition)}
      {textAreaVisible && (
        <textarea
          style={{
            position: "absolute",
            top: `${textAreaPosition.y}px`,
            left: `${textAreaPosition.x}px`,
            fontSize: "16px",
            border: "1px solid black",
            resize: "none",
            zIndex: 1000,
          }}
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          onBlur={handleTextAreaBlur}
          onKeyDown={handleTextAreaKeyDown}
          autoFocus
        />
      )}
    </>
  );
};

export default Panel;