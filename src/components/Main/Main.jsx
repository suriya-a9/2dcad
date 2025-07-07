import { useState, useRef, useEffect } from 'react'
import { useDispatch } from "react-redux";
import './Main.css'
import Panel from '../Panel/Panel'
import ColorPalette from '../Sidebars/ColorPalette'
import LeftSidebar from '../Sidebars/LeftSidebar'
import RightSidebar from '../Sidebars/RightSidebar'
import Topbar from '../Topbar/Topbar'
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { jsPDF } from "jspdf";
import * as React from "react";
import Ruler from "../Ruler/Ruler";
import html2canvas from "html2canvas";
import { useSelector } from "react-redux";
import { zoomIn, zoomOut, setZoomLevel } from "../../Redux/Slice/toolSlice";
const Main = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [unit, setUnit] = useState("px");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [guidelines, setGuidelines] = useState([]);
  const guideliness = useSelector(state => state.tool.guidelines);
  const showGuides = useSelector(state => state.tool.showGuides);
  const guideColor = useSelector(state => state.tool.guideColor);
  const [draggingGuide, setDraggingGuide] = useState(null);
  const [shiftPressed, setShiftPressed] = useState(false);
  const [hasRotatedGuide, setHasRotatedGuide] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [canvasRotation, setCanvasRotation] = useState(0);
  // const zoomLevel = useSelector(state => state.tool.zoomLevel);
  const [zoomHistory, setZoomHistory] = useState([{ zoom: 1, position: { x: 0, y: 0 } }]);
  const pages = useSelector(state => state.tool.pages || []);
  const currentPageIndex = useSelector(state => state.tool.currentPageIndex || 0);
  const currentPage = pages[currentPageIndex] || {};
  const layers = currentPage.layers || [];
  const selectedLayerIndex = currentPage.selectedLayerIndex || 0;
  const shapes = layers[selectedLayerIndex]?.shapes || [];
  const [zoomHistoryIndex, setZoomHistoryIndex] = useState(0);
  const dispatch = useDispatch();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const selectedTool = useSelector(state => state.tool.selectedTool);
  const selectedShapeId = useSelector(state => state.tool.selectedShapeId);
  const pageColor = useSelector(state => state.tool.pageColor || "#fff");
  const borderColor = useSelector(state => state.tool.borderColor || "#ccc");
  const deskColor = useSelector(state => state.tool.deskColor || "#e5e5e5");
  const pageMargin = useSelector(state => state.tool.pageMargin || { top: 0, right: 40, bottom: 40, left: 40 });
  const [hoveredGuideIndex, setHoveredGuideIndex] = useState(null);
  const grids = useSelector(state => state.tool.grids);
  const showGrids = true;
  const showCheckerboard = useSelector(state => state.tool.showCheckerboard);
  const [isFillStrokeDialogOpen, setIsFillStrokeDialogOpen] = useState(false);
  const [isAlignPanelOpen, setIsAlignPanelOpen] = useState(false);
  const handleOpenFillStrokeDialog = () => {
    console.log("Open Fill & Stroke dialog");
    setIsFillStrokeDialogOpen(true);
  };
  useEffect(() => {
    function handleAddGuides(e) {
      setGuidelines(prev => [...prev, ...(e.detail || [])]);
    }
    window.addEventListener("addGuides", handleAddGuides);
    return () => window.removeEventListener("addGuides", handleAddGuides);
  }, []);
  const handleCloseFillStrokeDialog = () => setIsFillStrokeDialogOpen(false);
  // const width = useSelector(state => state.tool.width);
  // const height = useSelector(state => state.tool.height);
  const setZoomAndPosition = (zoom, position) => {
    setZoomLevel(zoom);
    setCanvasPosition(position);
    setZoomHistory(prev => {
      const current = prev[zoomHistoryIndex];
      if (current && current.zoom === zoom && current.position.x === position.x && current.position.y === position.y) {
        return prev;
      }
      const newHistory = prev.slice(0, zoomHistoryIndex + 1).concat([{ zoom, position }]);
      setZoomHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  };

  // const handleSetZoom = (zoom) => {
  //   setZoomAndPosition(zoom, canvasPosition);
  // };

  const handleZoomPrevious = () => {
    if (zoomHistoryIndex > 0) {
      const prev = zoomHistory[zoomHistoryIndex - 1];
      setZoomLevel(prev.zoom);
      setCanvasPosition(prev.position);
      setZoomHistoryIndex(zoomHistoryIndex - 1);
    }
  };

  const handleZoomNext = () => {
    if (zoomHistoryIndex < zoomHistory.length - 1) {
      const next = zoomHistory[zoomHistoryIndex + 1];
      setZoomLevel(next.zoom);
      setCanvasPosition(next.position);
      setZoomHistoryIndex(zoomHistoryIndex + 1);
    }
  };
  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel * 1.1, 3);
    setZoomAndPosition(newZoom, canvasPosition);
  };
  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel / 1.1, 0.5);
    setZoomAndPosition(newZoom, canvasPosition);
  };
  const handleSetZoom = (value) => {
    setZoomAndPosition(Number(value), canvasPosition);
  };
  // const handleSetZoom = (zoom) => {
  //   setZoomAndPosition(zoom, canvasPosition);
  // };
  const toggleSidebar = (state) => {
    if (typeof state === "boolean") {
      setIsSidebarOpen(state);
    } else {
      setIsSidebarOpen((prev) => !prev);
    }
  };
  const { width, height } = useSelector((state) => state.tool);
  console.log("main width and height", width, height);
  const stageRef = useRef(null);

  const downloadURI = (uri, name) => {
    const link = document.createElement("a");
    link.href = uri;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleRulerRightClick = (e) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
    });
  };
  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Shift") setShiftPressed(true);
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        hoveredGuideIndex !== null
      ) {
        setGuidelines((prev) => prev.filter((_, idx) => idx !== hoveredGuideIndex));
        setHoveredGuideIndex(null);
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === "Shift") setShiftPressed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [hoveredGuideIndex]);
  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0 });
  };
  const exportToSVG = (stage) => {
    if (!stage) {
      console.error("Stage is not initialized.");
      return;
    }


    const stageWidth = stage.width();
    const stageHeight = stage.height();
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${stageWidth}" height="${stageHeight}" viewBox="0 0 ${stageWidth} ${stageHeight}">`;


    stage.getChildren().forEach((layer) => {
      layer.getChildren().forEach((shape) => {
        console.log("Shape Class Name: ", shape.className);
        const {
          x,
          y,
          fill,
          stroke,
          strokeWidth,
          scaleX,
          scaleY,
          rotation,
          radius,
          corners,
          width,
          height,
          innerRadius,
          outerRadius,
          points,
          path,
          text,
          fontSize
        } = shape.attrs;


        if (shape.className === "Rect") {
          const transformedWidth = width * scaleX;
          const transformedHeight = height * scaleY;

          const centerX = x + width / 2;
          const centerY = y + height / 2;
          const rad = (rotation * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);

          const rotatedX = cos * (x - centerX) - sin * (y - centerY) + centerX;
          const rotatedY = sin * (x - centerX) + cos * (y - centerY) + centerY;

          svgContent += `
            <rect
              x="${rotatedX}"
              y="${rotatedY}"
              width="${transformedWidth}"
              height="${transformedHeight}"
              fill="${fill || "none"}"
              stroke="${stroke || "none"}"
              stroke-width="${strokeWidth || 1}"
              transform="rotate(${rotation}, ${centerX}, ${centerY})"
            />
          `;
        }


        if (shape.className === "Image") {
          const img = shape.attrs.image;
          const imageUrl = img.src || img;

          svgContent += `
            <image
              x="${x}"
              y="${y}"
              width="${width}"
              height="${height}"
              href="${imageUrl}"
              transform="rotate(${rotation}, ${x + width / 2}, ${y + height / 2})"
            />
          `;
        }


        if (shape.className === "Circle") {
          svgContent += `
            <circle
              cx="${x}"
              cy="${y}"
              r="${radius}"
              fill="${fill || "none"}"
              stroke="${stroke || "none"}"
              stroke-width="${strokeWidth || 1}"
              transform="rotate(${rotation}, ${x}, ${y})"
            />
          `;
        }


        if (shape.className === "Star") {
          svgContent += `
            <polygon
              points="${generateStarPoints(x, y, innerRadius, outerRadius, corners)}"
              fill="${fill || "none"}"
              stroke="${stroke || "none"}"
              stroke-width="${strokeWidth || 1}"
              transform="rotate(${rotation}, ${x}, ${y})"
            />
          `;
        }


        if (shape.className === "Path") {
          svgContent += `
            <path
              d="${path}"
              fill="${fill || "none"}"
              stroke="${stroke || "none"}"
              stroke-width="${strokeWidth || 1}"
              transform="rotate(${rotation}, ${x}, ${y})"
            />
          `;
        }


        if (shape.className === "Line") {
          svgContent += `
            <line
              x1="${points[0]}"
              y1="${points[1]}"
              x2="${points[2]}"
              y2="${points[3]}"
              stroke="${stroke || "none"}"
              stroke-width="${strokeWidth || 2}"
              transform="rotate(${rotation}, ${x}, ${y})"
            />
          `;
        }


        if (shape.className === "Text") {
          svgContent += `
            <text
              x="${x}"
              y="${y}"
              font-size="${fontSize || 12}"
              fill="${fill || 'black'}"
              transform="rotate(${rotation}, ${x}, ${y})"
            >
              ${text}
            </text>
          `;
        }
      });
    });


    svgContent += `</svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    downloadURI(url, "stage.svg");
  };


  const generateStarPoints = (x, y, innerRadius, outerRadius, numPoints) => {
    const points = [];
    const angle = Math.PI / numPoints;

    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const currentAngle = i * angle;
      points.push(
        x + radius * Math.cos(currentAngle),
        y + radius * Math.sin(currentAngle)
      );
    }

    return points.join(" ");
  };



  const handleSave = async (format = "png") => {
    if (!stageRef.current) {
      console.error("stageRef.current is not a valid Konva Stage instance");
      return;
    }

    let blob, suggestedName, mimeType;

    switch (format) {
      case "svg":
        const svgString = (() => {
          const stage = stageRef.current;
          const stageWidth = stage.width();
          const stageHeight = stage.height();
          let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${stageWidth}" height="${stageHeight}" viewBox="0 0 ${stageWidth} ${stageHeight}">`;
          svgContent += `<rect width="${stageWidth}" height="${stageHeight}" fill="white"/>`;
          svgContent += `</svg>`;
          return svgContent;
        })();
        blob = new Blob([svgString], { type: "image/svg+xml" });
        suggestedName = "2DCAD.svg";
        mimeType = "image/svg+xml";
        break;
      case "jpg":
      case "png":
      case "webp":
        const stage = stageRef.current;
        const layer = stage.getLayers()[0];
        const bgRect = layer.findOne('Rect');
        const originalFill = bgRect ? bgRect.fill() : null;
        if (bgRect) bgRect.fill('white');
        stage.draw();

        const canvas = stage.toCanvas({ pixelRatio: 3 });
        const dataUrl = canvas.toDataURL(`image/${format}`);

        if (bgRect && originalFill !== null) {
          bgRect.fill(originalFill);
          stage.draw();
        }

        blob = await (await fetch(dataUrl)).blob();
        suggestedName = `2DCAD.${format}`;
        mimeType = `image/${format}`;
        break;
      case "pdf":
        exportToPDF(stageRef.current);
        return;
      case "eps":
        exportToEPS(stageRef.current);
        return;
      default:
        const fallbackCanvas = stageRef.current.toCanvas({ pixelRatio: 3 });
        const fallbackDataUrl = fallbackCanvas.toDataURL("image/png");
        blob = await (await fetch(fallbackDataUrl)).blob();
        suggestedName = "2DCAD.png";
        mimeType = "image/png";
    }

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName,
          types: [
            {
              description: `${format.toUpperCase()} File`,
              accept: { [mimeType]: [`.${format}`] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (err) { }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };
  const exportToPDF = (stage) => {
    const canvas = stage.toCanvas({ pixelRatio: 3 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 150);
    pdf.save("stage.pdf");
  };

  const exportToEPS = (stage) => {
    if (!stage) {
      console.error("Stage is not initialized.");
      return;
    }


    const stageWidth = stage.width();
    const stageHeight = stage.height();


    const epsHeader = `%!PS-Adobe-3.0 EPSF-3.0
  %%BoundingBox: 0 0 ${stageWidth} ${stageHeight}
  %%Title: Stage Export
  %%Creator: YourApp
  %%CreationDate: ${new Date().toISOString()}
  %%EndComments
  `;


    let epsContent = "";


    const convertColorToEPS = (color) => {
      const ctx = document.createElement("canvas").getContext("2d");


      if (color === "transparent") {
        return null;
      }


      ctx.fillStyle = color;
      const rgb = ctx.fillStyle.match(/\d+/g);


      return rgb ? `${rgb[0] / 255} ${rgb[1] / 255} ${rgb[2] / 255}` : "0 0 0";
    };


    stage.getChildren().forEach((layer) => {
      layer.getChildren().forEach((shape) => {
        if (shape.className === "Rect") {
          const { x, y, width, height, stroke, fill, strokeWidth } = shape.attrs;

          const fillColor = fill ? convertColorToEPS(fill) : null;
          const strokeColor = stroke ? convertColorToEPS(stroke) : null;

          epsContent += `
    ${fillColor ? `${fillColor} setrgbcolor` : ""}
    newpath
    ${x} ${stageHeight - y - height} moveto
    ${x + width} ${stageHeight - y - height} lineto
    ${x + width} ${stageHeight - y} lineto
    ${x} ${stageHeight - y} lineto
    closepath
    ${fillColor ? "fill" : ""}
    ${strokeColor ? `${strokeWidth || 1} setlinewidth ${strokeColor} setrgbcolor stroke` : ""}
    `;
        }


      });
    });


    const epsFooter = `showpage
  %%EOF
  `;


    const fullEPSContent = epsHeader + epsContent + epsFooter;


    const blob = new Blob([fullEPSContent], { type: "application/postscript" });
    const url = URL.createObjectURL(blob);


    downloadURI(url, "stage.eps");
  };
  const printRef = React.useRef();

  const handleDownloadPdf = async () => {
    const element = printRef.current;

    if (!element) {
      console.error('Element not found!');
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        width: 794,
        height: 1123,
        scale: 1,
      });

      const data = canvas.toDataURL("image/png");

      const width = window.innerWidth;
      const height = window.innerHeight;

      const printWindow = window.open('', '', `width=${width},height=${height}`);
      printWindow.document.write(`
          <html>
            <head>
              <title>Print Canvas</title>
              <style>
                @page {
                  margin: 0; /* Remove default print margins */
                }
                body {
                  margin: 0;
                  text-align: center;
                }
                img {
                  max-width: 100%;
                  height: auto;
                }
              </style>
            </head>
            <body>
              <img src="${data}" />
            </body>
          </html>
        `);

      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };

      printWindow.onafterprint = () => {
        printWindow.close();
      };
    } catch (error) {
      console.error('Error capturing the screenshot:', error);
    }
  };

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const onEditorStateChange = (newState) => {
    setEditorState(newState);
  };
  const htmlValue = draftToHtml(convertToRaw(editorState.getCurrentContent()));
  const textValue = htmlValue


  const [activeTab, setActiveTab] = useState("layers");

  // const [panelScale, setPanelScale] = useState(1);
  // const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();

      const scaleBy = 1.1;
      const newScale = e.deltaY > 0 ? zoomLevel / scaleBy : zoomLevel * scaleBy;


      const clampedScale = Math.max(0.5, Math.min(newScale, 3));

      setZoomAndPosition(clampedScale, canvasPosition);
    }
  };
  const handleDragGuide = (orientation, position) => {
    setGuidelines((prev) => [
      ...prev,
      { orientation, position },
    ]);
  };

  const handleRulerClick = () => {
    const units = ["px", "mm", "cm", "in", "pt", "pc"];
    const currentIndex = units.indexOf(unit);
    const nextUnit = units[(currentIndex + 1) % units.length];
    setUnit(nextUnit);
  };

  const handleMouseDown = (index) => {
    setDraggingGuide(index);
  };

  const handleGuideMouseDown = (e, index) => {
    e.preventDefault();
    setDraggingGuide({ ...guidelines[index], index });
    setHasRotatedGuide(false);
  };

  const handleMouseMove = (e) => {
    if (draggingGuide) {
      if (shiftPressed && !hasRotatedGuide) {
        setDraggingGuide((prev) => {
          if (!prev) return prev;
          const newOrientation = prev.orientation === "horizontal" ? "vertical" : "horizontal";
          let newPosition;
          if (newOrientation === "horizontal") {
            newPosition = (e.clientY - canvasPosition.y) / zoomLevel;
          } else {
            newPosition = (e.clientX - canvasPosition.x) / zoomLevel;
          }
          return { ...prev, orientation: newOrientation, position: newPosition };
        });
        setHasRotatedGuide(true);
      } else if (!shiftPressed) {
        setHasRotatedGuide(false);
        setDraggingGuide((prev) => {
          if (!prev) return prev;
          let newPosition = prev.position;
          if (prev.orientation === "horizontal") {
            newPosition = (e.clientY - canvasPosition.y) / zoomLevel;
          } else if (prev.orientation === "vertical") {
            newPosition = (e.clientX - canvasPosition.x) / zoomLevel;
          }
          return { ...prev, position: newPosition };
        });
      }
    }
    setCursorPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseUp = () => {
    if (draggingGuide) {
      setGuidelines((prev) =>
        prev.map((guide, index) =>
          index === draggingGuide.index ? { ...draggingGuide } : guide
        )
      );
      setDraggingGuide(null);
    }
  };

  const handleZoomChange = (value) => {
    const newScale = parseFloat(value);

    if (!isNaN(newScale)) {
      const clampedScale = Math.max(0.5, Math.min(newScale, 3));
      dispatch(setZoomLevel(clampedScale));
    }
  };
  const handleRotationChange = (value) => {
    const newRotation = parseFloat(value);

    if (!isNaN(newRotation)) {
      setCanvasRotation(newRotation);
    }
  };
  const selectedShape = useSelector((state) =>
    state.tool.layers[state.tool.selectedLayerIndex]?.shapes.find(
      (shape) => shape.id === state.tool.selectedShapeId
    )
  );
  const selectedBounds = selectedShape
    ? {
      x: selectedShape.x || 0,
      y: selectedShape.y || 0,
      width: selectedShape.width || selectedShape.radius * 2 || 0,
      height: selectedShape.height || selectedShape.radius * 2 || 0,
    }
    : null;
  // const canvasRef = useRef(null);

  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   const ctx = canvas.getContext('2d');
  //   let drawing = false;

  //   const getPos = (e) => {
  //     const rect = canvas.getBoundingClientRect();
  //     return {
  //       x: e.clientX - rect.left,
  //       y: e.clientY - rect.top,
  //     };
  //   };

  //   const startDraw = (e) => {
  //     drawing = true;
  //     const { x, y } = getPos(e);
  //     ctx.beginPath();
  //     ctx.moveTo(x, y);
  //   };

  //   const draw = (e) => {
  //     if (!drawing) return;
  //     const { x, y } = getPos(e);
  //     ctx.lineTo(x, y);
  //     ctx.stroke();
  //   };

  //   const stopDraw = () => {
  //     drawing = false;
  //   };

  //   canvas.addEventListener('mousedown', startDraw);
  //   canvas.addEventListener('mousemove', draw);
  //   canvas.addEventListener('mouseup', stopDraw);
  //   canvas.addEventListener('mouseleave', stopDraw);

  //   return () => {
  //     canvas.removeEventListener('mousedown', startDraw);
  //     canvas.removeEventListener('mousemove', draw);
  //     canvas.removeEventListener('mouseup', stopDraw);
  //     canvas.removeEventListener('mouseleave', stopDraw);
  //   };
  // }, []);
  const mainPanelRef = useRef();

  useEffect(() => {
    const panel = mainPanelRef.current;
    if (!panel) return;

    const handleWheelNonPassive = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const scaleBy = 1.1;
        const newScale = e.deltaY > 0 ? zoomLevel / scaleBy : zoomLevel * scaleBy;
        const clampedScale = Math.max(0.5, Math.min(newScale, 3));
        dispatch(setZoomLevel(clampedScale));
      }
    };

    panel.addEventListener('wheel', handleWheelNonPassive, { passive: false });

    return () => {
      panel.removeEventListener('wheel', handleWheelNonPassive);
    };
  }, [zoomLevel, dispatch]);
  const panelRef = useRef();
  const handleZoomSelected = () => {
    panelRef.current?.zoomToSelectedShape();
  };
  const handleZoomDrawing = () => {
    panelRef.current?.zoomToDrawing();
  };
  const handleZoomPage = () => {
    const zoom = 1;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    setZoomAndPosition(zoom, {
      x: (viewportWidth - width * zoom) / 2,
      y: (viewportHeight - height * zoom) / 2,
    });
  };

  const handleZoomPageWidth = () => {
    const zoom = 2;
    const viewportWidth = window.innerWidth;
    setZoomAndPosition(zoom, {
      x: (viewportWidth - width * zoom) / 2,
      y: canvasPosition.y,
    });
  };

  const handleZoomCenterPage = () => {
    const viewportWidth = window.innerWidth;
    setZoomAndPosition(zoomLevel, {
      x: (viewportWidth - width * zoomLevel) / 2,
      y: canvasPosition.y,
    });
  };

  const handleCanvasMouseDown = (e) => {
    if (selectedTool !== "Zoom") return;

    if (e.button === 0) {
      e.preventDefault();
      handleZoomIn();
    } else if (e.button === 2) {
      e.preventDefault();
      handleZoomOut();
    }
  };
  const handleCanvasContextMenu = (e) => {
    if (selectedTool === "Zoom") {
      e.preventDefault();
    }
  };
  return (
    <>
      <div ref={mainPanelRef} className="main-panel"
        style={{
          overflow: 'hidden',
          width: '100vw',
          height: '100vh',
          position: 'relative',
          background: showCheckerboard
            ? "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 40px 40px"
            : deskColor,
        }}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={closeContextMenu}
      >
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div style={{ flexGrow: '1', position: 'fixed', width: '100%', zIndex: '1' }}>
            <Topbar editorState={editorState} onEditorStateChange={onEditorStateChange} handleSave={handleSave} setIsSidebarOpen={setIsSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} handleDownloadPdf={handleDownloadPdf} selectedGroupId={selectedGroupId} setSelectedGroupId={setSelectedGroupId} zoomLevel={zoomLevel}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onSetZoom={handleSetZoom}
              onZoomSelected={handleZoomSelected}
              onZoomDrawing={handleZoomDrawing}
              onZoomPage={handleZoomPage}
              onZoomPageWidth={handleZoomPageWidth}
              onZoomCenterPage={handleZoomCenterPage}
              onZoomPrevious={handleZoomPrevious}
              onZoomNext={handleZoomNext}
              handleOpenFillStrokeDialog={handleOpenFillStrokeDialog}
              setIsAlignPanelOpen={setIsAlignPanelOpen}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div style={{ flexGrow: '1', position: 'fixed', top: '125px' }}>
            <LeftSidebar />
          </div>
          <Ruler
            orientation="horizontal"
            length={width * zoomLevel + 1000}
            scale={zoomLevel}
            position={canvasPosition}
            canvasSize={{ width, height }}
            canvasPosition={canvasPosition}
            unit={unit}
            onClick={handleRulerClick}
            onRightClick={handleRulerRightClick}
            highlightRange={
              selectedBounds
                ? {
                  start: selectedBounds.x * zoomLevel + canvasPosition.x,
                  end: (selectedBounds.x + selectedBounds.width) * zoomLevel + canvasPosition.x
                }
                : null
            }
            onDragGuide={(orientation, position) => handleDragGuide(orientation, position)}
            style={{ zIndex: '20' }}
          />

          <Ruler
            orientation="vertical"
            length={height * zoomLevel + 1000}
            scale={zoomLevel}
            position={canvasPosition}
            canvasSize={{ width, height }}
            canvasPosition={canvasPosition}
            unit={unit}
            onClick={handleRulerClick}
            highlightRange={
              selectedBounds
                ? {
                  start: selectedBounds.y * zoomLevel + canvasPosition.y,
                  end: (selectedBounds.y + selectedBounds.height) * zoomLevel + canvasPosition.y
                }
                : null
            }
            onDragGuide={(orientation, position) => handleDragGuide(orientation, position)}
            onRightClick={handleRulerRightClick}
            style={{ zIndex: '20' }}
          />
          {contextMenu.visible && (
            <div
              className="context-menu"
              style={{
                position: "absolute",
                top: `${contextMenu.y}px`,
                left: `${contextMenu.x}px`,
                background: "black",
                border: "1px solid black",
                color: "white",
                zIndex: 1000,
                padding: "10px",
              }}
            >
              <div>
                {["px", "mm", "cm", "in", "pt", "pc"].map((unitOption) => (
                  <div key={unitOption}>
                    <label style={{ display: 'flex', gap: '15px', alignItems: 'center', flexDirection: 'row' }}>
                      <input
                        type="radio"
                        name="unit"
                        value={unitOption}
                        checked={unit === unitOption}
                        onChange={() => handleUnitChange(unitOption)}
                      />
                      {unitOption}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {guidelines.map((guide, index) => (
            <div
              key={index}
              draggable
              onMouseDown={(e) => handleGuideMouseDown(e, index)}
              onMouseEnter={() => setHoveredGuideIndex(index)}
              onMouseLeave={() => setHoveredGuideIndex((prev) => (prev === index ? null : prev))}
              style={{
                position: "absolute",
                top: guide.orientation === "horizontal"
                  ? `${guide.position * zoomLevel}px`
                  : "0",
                left: guide.orientation === "vertical"
                  ? `${guide.position * zoomLevel}px`
                  : "0",
                width: guide.orientation === "horizontal" ? "100%" : "1px",
                height: guide.orientation === "vertical" ? "100%" : "1px",
                backgroundColor: hoveredGuideIndex === index ? "red" : "blue",
                cursor: "move",
                zIndex: 1,
                opacity: hoveredGuideIndex === index ? 0.8 : 1,
              }}
            ></div>
          ))}
          {draggingGuide && (
            <div
              draggable
              style={{
                position: "absolute",
                top: draggingGuide.orientation === "horizontal" ? `${draggingGuide.position * zoomLevel}px` : "0",
                left: draggingGuide.orientation === "vertical" ? `${draggingGuide.position * zoomLevel}px` : "0",
                width: draggingGuide.orientation === "horizontal" ? "100%" : "1px",
                height: draggingGuide.orientation === "vertical" ? "100%" : "1px",
                backgroundColor: "red",
                zIndex: 20,
              }}
            ></div>
          )}
          <div
            style={{
              flexGrow: '10',
              position: 'relative',
              marginLeft: '6%',
              top: '160px',
              overflow: 'auto',
              scrollbarWidth: 'none',
              marginBottom: '20%',
              width: 'calc(100% - 12%)',
              height: 'calc(100vh - 160px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              paddingBottom: '150px'
            }}
            onWheel={handleWheel}
            onMouseDown={handleCanvasMouseDown}
            onContextMenu={handleCanvasContextMenu}
          >
            <div
              style={{
                transform: `scale(${zoomLevel}) rotate(${canvasRotation}deg)`,
                transformOrigin: 'top center',
              }}>
              {pages.map((page, idx) => (
                <div
                  key={page.id}
                  style={{
                    border: idx === currentPageIndex ? `2px solid ${borderColor}` : `1px solid ${borderColor}`,
                    background: pageColor,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    marginTop: pageMargin.top,
                    marginBottom: pageMargin.bottom,
                    marginLeft: pageMargin.left,
                    marginRight: pageMargin.right,
                    position: 'relative',
                  }}
                  onClick={() => dispatch({ type: "tool/selectPage", payload: idx })}
                >
                  {showGuides && guideliness.map((guide, index) => {
                    if (guide.orientation === "horizontal") {
                      return (
                        <div
                          key={index}
                          style={{
                            position: "absolute",
                            left: "-20px",
                            width: `calc(100% + 40px)`,
                            height: "1px",
                            backgroundColor: guideColor,
                            opacity: 0.7,
                            pointerEvents: "none",
                            zIndex: 100,
                            top: `${Math.max(0, Math.min(guide.position, height - 1))}px`,
                          }}
                        />
                      );
                    } else {
                      return (
                        <div
                          key={index}
                          style={{
                            position: "absolute",
                            top: "-20px",
                            height: `calc(100% + 40px)`,
                            width: "1px",
                            backgroundColor: guideColor,
                            opacity: 0.7,
                            pointerEvents: "none",
                            zIndex: 100,
                            left: `${Math.max(0, Math.min(guide.position, width - 1))}px`,
                          }}
                        />
                      );
                    }
                  })}
                  {grids.map((grid, idx) => {
                    if (!grid.visible) return null;
                    if (grid.type === "rectangular") {
                      const lines = [];
                      const step = 50;
                      for (let x = 0; x <= width; x += step) {
                        lines.push(
                          <div key={`rect-v-${x}`} style={{
                            position: "absolute",
                            left: x,
                            top: 0,
                            width: 1,
                            height: "100%",
                            background: "#bbb",
                            opacity: 0.5,
                            pointerEvents: "none",
                            zIndex: 10,
                          }} />
                        );
                      }
                      for (let y = 0; y <= height; y += step) {
                        lines.push(
                          <div key={`rect-h-${y}`} style={{
                            position: "absolute",
                            top: y,
                            left: 0,
                            height: 1,
                            width: "100%",
                            background: "#bbb",
                            opacity: 0.5,
                            pointerEvents: "none",
                            zIndex: 10,
                          }} />
                        );
                      }
                      return lines;
                    }
                    if (grid.type === "axonometric") {
                      const lines = [];
                      const step = 50;
                      for (let y = 0; y <= height; y += step) {
                        lines.push(
                          <div key={`axo-h-${y}`} style={{
                            position: "absolute",
                            top: y,
                            left: 0,
                            height: 1,
                            width: "100%",
                            background: "#8af",
                            opacity: 0.4,
                            pointerEvents: "none",
                            zIndex: 10,
                          }} />
                        );
                      }
                      for (let x = -width; x < width * 2; x += step) {
                        lines.push(
                          <div key={`axo-30-${x}`} style={{
                            position: "absolute",
                            left: x,
                            top: 0,
                            width: 1,
                            height: "100%",
                            background: "#8af",
                            opacity: 0.4,
                            pointerEvents: "none",
                            zIndex: 10,
                            transform: `rotate(30deg)`,
                            transformOrigin: "top left",
                          }} />
                        );
                      }
                      for (let x = -width; x < width * 2; x += step) {
                        lines.push(
                          <div key={`axo-150-${x}`} style={{
                            position: "absolute",
                            left: x,
                            top: 0,
                            width: 1,
                            height: "100%",
                            background: "#8af",
                            opacity: 0.4,
                            pointerEvents: "none",
                            zIndex: 10,
                            transform: `rotate(-30deg)`,
                            transformOrigin: "top left",
                          }} />
                        );
                      }
                      return lines;
                    }
                    if (grid.type === "modular") {
                      const lines = [];
                      const majorStep = 100;
                      const minorStep = 20;
                      for (let x = 0; x <= width; x += minorStep) {
                        lines.push(
                          <div key={`mod-v-${x}`} style={{
                            position: "absolute",
                            left: x,
                            top: 0,
                            width: x % majorStep === 0 ? 2 : 1,
                            height: "100%",
                            background: x % majorStep === 0 ? "#fa8" : "#fa8",
                            opacity: x % majorStep === 0 ? 0.7 : 0.3,
                            pointerEvents: "none",
                            zIndex: 10,
                          }} />
                        );
                      }
                      for (let y = 0; y <= height; y += minorStep) {
                        lines.push(
                          <div key={`mod-h-${y}`} style={{
                            position: "absolute",
                            top: y,
                            left: 0,
                            height: y % majorStep === 0 ? 2 : 1,
                            width: "100%",
                            background: y % majorStep === 0 ? "#fa8" : "#fa8",
                            opacity: y % majorStep === 0 ? 0.7 : 0.3,
                            pointerEvents: "none",
                            zIndex: 10,
                          }} />
                        );
                      }
                      return lines;
                    }
                    return null;
                  })}
                  <Panel
                    pageIndex={idx}
                    ref={idx === currentPageIndex ? panelRef : null}
                    printRef={printRef}
                    isSidebarOpen={isSidebarOpen}
                    stageRef={stageRef}
                    textValue={textValue}
                    setActiveTab={setActiveTab}
                    toggleSidebar={toggleSidebar}
                    zoomLevel={zoomLevel}
                    className="center-panel"
                  />
                  <div style={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    background: 'rgba(0,0,0,0.1)',
                    color: '#333',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                  }}>
                    {page.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flexGrow: '1', position: 'fixed', top: '125px', bottom: '50px', right: '0px' }}>
            <RightSidebar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} handleSave={handleSave} activeTab={activeTab} setActiveTab={(tab) => console.log("Active Tab:", tab)} handleDownloadPdf={handleDownloadPdf} selectedGroupId={selectedGroupId} setSelectedGroupId={setSelectedGroupId} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} handleOpenFillStrokeDialog={handleOpenFillStrokeDialog} isFillStrokeDialogOpen={isFillStrokeDialogOpen} handleCloseFillStrokeDialog={handleCloseFillStrokeDialog} isAlignPanelOpen={isAlignPanelOpen} setIsAlignPanelOpen={setIsAlignPanelOpen} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div style={{ flexGrow: '1', position: 'fixed', bottom: '0px', overflowY: 'scroll', scrollbarWidth: 'thin' }}>
            <ColorPalette />
            <div
              style={{
                marginTop: '10px',
                textAlign: 'right',
                fontSize: '14px',
                color: '#333',
                backgroundColor: 'white'
              }}
            >
              <span>X: {cursorPosition.x.toFixed(2)}</span> |{' '}
              <span>Y: {cursorPosition.y.toFixed(2)}</span> &nbsp; |{' '}
              <label htmlFor="zoom">Z: </label>
              <input
                title='Zoom Canvas'
                type="number"
                id="zoom"
                name="zoom"
                step={0.1}
                min={0.5}
                max={3}
                value={zoomLevel.toFixed(2)}
                onChange={(e) => handleZoomChange(e.target.value)}
                style={{
                  width: '60px',
                  textAlign: 'center',
                }}
              />
              &nbsp; |{' '}
              <label htmlFor="rotation">R: </label>
              <input
                title='Rotate Canvas'
                type="number"
                id="rotation"
                name="rotation"
                step={1}
                min={-360}
                max={360}
                value={canvasRotation.toFixed(0)}
                onChange={(e) => handleRotationChange(e.target.value)}
                style={{
                  width: '60px',
                  textAlign: 'center',
                }}
              />
            </div>
          </div>
        </div>
      </div >
    </>
  )
}

export default Main