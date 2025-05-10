import { useEffect, useRef, useState } from "react";
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
  Rect,
  Circle,
  Star,
  RegularPolygon as KonvaPolygon,
  Line,
  Transformer,
  Path,
  Text as KonvaText,
  Image,
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
  setFontStyle,
  finalizePath,
  addPathPoint,
  setStrokeColor,
  setFontSize,
  setFontFamily,
  setAlignment,
  setFillColor,
  removeShape,
  addSprayShapes
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

const Panel = ({ textValue, isSidebarOpen, stageRef, printRef }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const selectedFontSize = useSelector((state) => state.tool.selectedFontSize);
  const selectedFontFamily = useSelector((state) => state.tool.selectedFontFamily);
  const selectedAlignment = useSelector((state) => state.tool.selectedAlignment);
  const selectedFontStyle = useSelector((state) => state.tool.selectedFontStyle);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShapeClosed, setIsShapeClosed] = useState(false);

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


  const selectedLayerIndex = useSelector(
    (state) => state.tool.selectedLayerIndex
  );
  const { width, height } = useSelector((state) => state.tool);

  const isDrawingRef = useRef(false);

  const transformerRef = useRef(null);
  const layerRef = useRef(null);

  const strokeWidth = 5;

  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedShapeIds.length > 0) {
      const selectedShapes = shapes.filter((shape) => {
        if (shape.type === 'Group') {
          const isGroupSelected = selectedShapeIds.includes(shape.id);

          const areChildrenSelected = shape.shapes.some((subShape) =>
            selectedShapeIds.includes(subShape.id)
          );

          return isGroupSelected || areChildrenSelected;
        }

        return selectedShapeIds.includes(shape.id);
      });

      console.log("selectedShapes:", selectedShapes);


      if (transformerRef.current) {
        const nodes = selectedShapes
          .flatMap((shape) => {
            if (shape.type === "Group") {
              const groupNode = layerRef.current.findOne(`#${shape.id}`);
              const childNodes = shape.shapes
                .map((subShape) => {
                  return layerRef.current.findOne(`#${subShape.id}`);
                })
                .filter((node) => node);

              return [groupNode, ...childNodes].filter((node) => node);
            } else {
              return layerRef.current.findOne(`#${shape.id}`);
            }
          })
          .filter((node) => node);

        transformerRef.current.nodes(nodes);
        transformerRef.current.getLayer().batchDraw();
      }
    } else {
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
      }
    }
  }, [selectedShapeIds, shapes]);

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
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      dispatch(clearSelection());
    } else if (selectedTool === "Select") {
      const clickedShape = e.target;

      if (clickedShape && clickedShape.attrs && clickedShape.attrs.type === "Text") {
        console.log("Clicked on text:", clickedShape.attrs.text);


        setTextAreaPosition({
          x: clickedShape.attrs.x * scale + position.x,
          y: clickedShape.attrs.y * scale + position.y,
        });
        setTextContent(clickedShape.attrs.text);


        setEditingTextId(clickedShape.attrs.id);
        setTextAreaVisible(true);
        return;
      } else {
        dispatch(clearSelection());
      }
    }
    const adjustedPointerPosition = getAdjustedPointerPosition(stage, position, scale);

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
    }
    if (selectedTool === "Node") {
      setIsDrawing(true);
      dispatch(addPathPoint({ x, y }));
    }

    if (selectedTool === "Rectangle") {
      setNewShape({
        id: `rect-${Date.now()}`,
        type: "Rectangle",
        x,
        y,
        width: 0,
        height: 0,
        rotation: 0,
        fill: "transparent",
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
        fill: "transparent",
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
        fill: "transparent",
        stroke: strokeColor,
        strokeWidth: 1,
      });
      setIsDrawing(true);
      setIsMouseMoved(false)
    } else if (selectedTool === "Polygon") {
      setNewShape({
        id: `polygon-${Date.now()}`,
        type: "Polygon",
        x,
        y,

        corners: 6,
        radius: 0,
        fill: "transparent",
        stroke: strokeColor,
        strokeWidth: 1
      });
      setIsDrawing(true);
      setIsMouseMoved(false)
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
        fill: "transparent",
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
    if (selectedTool === "Bezier") {
      const { x, y } = e.target.position();
      dispatch(updateControlPoint({ index, point: { x, y } }));
    }
  };

  const getBezierPath = () => {
    if (controlPoints.length < 2) return "";

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
      } else if (newShape.type === "Pen") {
        const point = [x, y];
        dispatch(addPenPoint(point));
      } else if (isDrawing && newShape && newShape.type === "Pencil") {
        setNewShape((prev) => ({
          ...prev,
          points: [...prev.points, [x, y]],
        }));
      } else if (isDrawing && newShape && newShape.type === "Calligraphy") {
        const point = { x, y };
        setNewShape((prev) => ({
          ...prev,
          points: [...prev.points, point],
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

  const handleMouseUp = () => {
    if (isDrawingRef.current && selectedTool === "Eraser") {
      isDrawingRef.current = false;
    } else if (isMouseMoved && newShape) {
      const currentStrokeColor = strokeColor;

      if (newShape.type === "Pen") {
        dispatch(addShape({ type: "Pen", points: penPoints, strokeColor: currentStrokeColor }));
      } else if (isDrawing && newShape && newShape.type === "Pencil") {
        dispatch(
          addShape({
            id: newShape.id,
            type: "Pencil",
            points: newShape.points.flatMap((p) => [p[0], p[1]]),
            strokeColor: strokeColor,
            fill: fillColor,
            closed: true,
          })
        );

        setNewShape(null);
        setIsDrawing(false);
      } else if (isDrawing && newShape && newShape.type === "Calligraphy") {
        dispatch(
          addShape({
            id: newShape.id,
            type: "Calligraphy",
            points: newShape.points,
            stroke: newShape.stroke,
            strokeWidth: newShape.strokeWidth,
            fill: "transparent",
            closed: true,
          })
        );

        setNewShape(null);
        setIsDrawing(false);
      } else if (newShape.type === "Bezier") {

        setIsMouseMoved(false);
        return;
      } else {
        dispatch(addShape(newShape));
      }

      setNewShape(null);
      setIsDrawing(false);
    } else {
      setNewShape(null);
      setIsDrawing(false);
    }
  };

  const handleDoubleClick = () => {
    if (newShape && newShape.type === "Bezier") {
      dispatch(addShape(newShape));
      setNewShape(null);
      setIsDrawing(false);
    }
  };

  const handleKeyDown = (e) => {

    if (e.ctrlKey && e.key === "z") {
      dispatch(undo());
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onChange(textarea.value);
      onClose();
    }
    if (e.ctrlKey && e.key === "y") {
      dispatch(redo());
    }


    if (e.key === "Delete" && selectedShapeId) {
      dispatch(deleteShape());
    }
  };

  useEffect(() => {
    if (transformerRef.current && layerRef.current) {
      const selectedNode = layerRef.current.findOne(`#${selectedShapeId}`);
      console.log("Selected Node for Transformer:", selectedNode);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    }
  }, [selectedShapeId, shapes]);


  const handleTransformEnd = (e, shape) => {
    const node = e.target;

    const newWidth = node.width() * node.scaleX();
    const newHeight = node.height() * node.scaleY();
    const newX = node.x();
    const newY = node.y();

    node.scaleX(1);
    node.scaleY(1);

    dispatch(updateShapePosition({
      id: shape.id,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight
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

  const selectedShape = shapes.find((shape) => shape.id === selectedShapeId);
  return (
    <>
      <div className="my-0"
        style={{
          width,
          height,
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
              onKeyDown={handleKeyDown}
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

                {/* Background Rectangle */}
                <Rect
                  x={0}
                  y={0}
                  height={width}
                  width={width}
                  fill="#ffffff"
                  listening={false}

                />

                {selectedTool === "Bezier" && (
                  <Path
                    data={getBezierPath()}
                    stroke="black"
                    strokeWidth={2}
                    fill={isShapeClosed ? "rgba(0,0,0,0.1)" : "transparent"}
                    closed={isShapeClosed}
                  />
                )}

                {controlPoints.map((point, index) => (
                  <Circle
                    key={index}
                    x={point.x}
                    y={point.y}
                    radius={5}
                    fill="red"
                    draggable
                    onDragMove={(e) => handleDragMove(e, index)}
                  />
                ))}

                {shapes.map((shape) => {
                  console.log("Rendering shape:", shape);
                  if (shape.type === "Rectangle") {
                    return (
                      <Rect
                        key={shape.id}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        fill="transparent"
                        stroke={shape.stroke || "black"}
                        strokeWidth={shape.strokeWidth || 1}
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
                        onTransformEnd={(e) => handleTransformEnd(e, shape)}
                        onDragEnd={(e) => {
                          const { x, y } = e.target.position();
                          dispatch(updateShapePosition({ id: shape.id, x, y }));
                        }}
                      />

                    );
                  } else if (shape.type === "Bezier") {
                    return (
                      <Path
                        key={shape.id}
                        id={shape.id}
                        data={getBezierPathFromPoints(shape.points, shape.closed)}
                        stroke={shape.stroke || shape.strokeColor || "black"}
                        strokeWidth={shape.strokeWidth || 2}
                        fill={shape.fill || (shape.closed ? shape.fillColor : "transparent")}
                        closed={shape.closed}
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
                        onClick={(e) => {
                          e.cancelBubble = true;
                          dispatch(selectShape(shape.id));
                        }}
                        onDragEnd={(e) => {
                          const { x, y } = e.target.position();
                          dispatch(updateShapePosition({ id: shape.id, x, y }));
                        }}
                      />
                    );
                  } else if (shape.type === "Circle") {
                    return (
                      <Circle
                        key={shape.id}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        radius={shape.radius}
                        fill={shape.fill || "transparent"}
                        stroke={shape.stroke || "black"}
                        strokeWidth={shape.strokeWidth || 1}
                        draggable={selectedShapeId === shape.id}
                        scaleX={shape.scaleX || 1}
                        scaleY={shape.scaleY || 1}
                        rotation={shape.rotation || 0}
                        onClick={(e) => {
                          e.cancelBubble = true;
                          dispatch(selectShape(shape.id));
                        }}
                        onDragEnd={(e) => {
                          const { x, y } = e.target.position();
                          dispatch(updateShapePosition({ id: shape.id, x, y, strokeWidth: shape.strokeWidth, radius: shape.radius }));
                        }}
                      />
                    );
                  } else if (shape.type === "Star") {
                    return (
                      <Star
                        key={shape.id}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        numPoints={shape.corners}
                        innerRadius={shape.innerRadius}
                        outerRadius={shape.outerRadius}
                        fill={shape.fill || "transparent"}
                        stroke={shape.stroke || "black"}
                        strokeWidth={shape.strokeWidth || 1}
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
                  } else if (shape.type === "Polygon") {
                    return (
                      <KonvaPolygon
                        key={shape.id}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        sides={shape.corners}
                        radius={shape.radius}
                        fill={shape.fill || "transparent"}
                        stroke={shape.stroke || "black"}
                        strokeWidth={shape.strokeWidth || 1}
                        draggable={selectedShapeId === shape.id}
                        scaleX={shape.scaleX || 1}
                        scaleY={shape.scaleY || 1}
                        rotation={shape.rotation || 0}
                        onClick={(e) => {
                          e.cancelBubble = true;
                          dispatch(selectShape(shape.id));
                        }}
                        onDragEnd={(e) => {
                          const { x, y } = e.target.position();
                          dispatch(updateShapePosition({ id: shape.id, x, y, strokeWidth: shape.strokeWidth }));
                        }}
                      />
                    );
                  } else if (shape.type === "Pen") {
                    return (
                      <Line
                        key={shape.id}
                        id={shape.id}
                        points={shape.points}
                        stroke={shape.strokeColor}
                        strokeWidth={shape.strokeWidth || 2}
                        lineJoin="round"
                        lineCap="round"
                        scaleX={shape.scaleX || 1}
                        scaleY={shape.scaleY || 1}
                        rotation={shape.rotation || 0}
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
                    return (
                      <Line
                        key={shape.id}
                        id={shape.id}
                        points={shape.points}
                        stroke={shape.strokeColor}
                        fill={shape.fill || "transparent"}
                        strokeWidth={shape.strokeWidth || 2}
                        lineJoin="round"
                        lineCap="round"
                        closed={shape.closed || false}
                        draggable={selectedShapeId === shape.id}
                        onClick={(e) => {
                          e.cancelBubble = true;
                          dispatch(selectShape(shape.id));
                        }}
                        onDragEnd={(e) => {
                          const { x, y } = e.target.position();
                          dispatch(updateShapePosition({ id: shape.id, x, y }));
                        }}
                      />
                    );
                  } else if (shape.type === "Calligraphy") {
                    return (
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
                        draggable={selectedShapeId === shape.id}
                        onClick={(e) => {
                          e.cancelBubble = true;
                          dispatch(selectShape(shape.id));
                        }}
                        onDragEnd={(e) => {
                          const { x, y } = e.target.position();
                          dispatch(updateShapePosition({ id: shape.id, x, y }));
                        }}
                      />
                    );
                  } else if (shape.type === "Spiral") {
                    return (
                      <Path
                        key={shape.id}
                        id={shape.id}
                        data={shape.path}
                        stroke={shape.stroke || "black"}
                        strokeWidth={shape.strokeWidth || 2}
                        fill="transparent"
                        draggable={selectedShapeId === shape.id}
                        scaleX={shape.scaleX || 1}
                        scaleY={shape.scaleY || 1}
                        rotation={shape.rotation || 0}
                        onClick={(e) => {
                          e.cancelBubble = true;
                          dispatch(selectShape(shape.id));
                        }}
                        onDragEnd={(e) => {
                          const { x, y } = e.target.position();
                          dispatch(updateShapePosition({ id: shape.id, x, y }));
                        }}

                      />
                    );
                  } else if (shape.type === "Text") {
                    return (
                      <KonvaText
                        key={shape.id}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        text={shape.text}
                        fontSize={shape.fontSize || 16}
                        fontFamily={shape.fontFamily || "Arial"}
                        fontStyle={shape.fontStyle || "normal"}
                        align={shape.alignment || "left"}
                        width={shape.width || 200}
                        fill={shape.fill || "black"}
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
                    );
                  } else if (shape.type === "Path") {
                    return (
                      <Path
                        key={shape.id}
                        id={shape.id}
                        data={`M ${shape.points[0].x} ${shape.points[0].y
                          } L ${shape.points
                            .slice(1)
                            .map((p) => `${p.x} ${p.y}`)
                            .join(" ")}`}
                        stroke={shape.stroke || "black"}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        draggable={selectedShapeId === shape.id}
                        rotation={shape.rotation || 0}
                        onClick={(e) => {
                          e.cancelBubble = true;
                          dispatch(selectShape(shape.id));
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

                {selectedShape && (
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
                    fill={newShape.fill}
                    stroke={newShape.stroke}
                    strokeWidth={newShape.strokeWidth}
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
                  <KonvaPolygon
                    x={newShape.x}
                    y={newShape.y}
                    sides={newShape.corners}
                    radius={newShape.radius}
                    fill="transparent"
                    stroke={newShape.stroke}
                    strokeWidth={newShape.strokeWidth}
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
                {/* {newShape && newShape.type === "Bezier" && (
                <Line
                  key={`bezier-segment-${i}`}
                  points={segmentPoints}
                  stroke={newShape.stroke || "black"}
                  strokeWidth={newShape.strokeWidth || 2}
                  bezier={true}
                  lineJoin="round"
                  lineCap="round"
                />
              )} */}
                {newShape && newShape.type === "Pencil" && (
                  <Line
                    points={newShape.points.flatMap((p) => [p[0], p[1]])}
                    stroke={strokeColor}
                    fill={fillColor}
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