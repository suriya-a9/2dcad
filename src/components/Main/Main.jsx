import { useState, useRef, useEffect } from 'react'
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
const Main = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [unit, setUnit] = useState("px");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [guidelines, setGuidelines] = useState([]);
  const [draggingGuide, setDraggingGuide] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [canvasRotation, setCanvasRotation] = useState(0);
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

  const [panelScale, setPanelScale] = useState(1);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();

      const scaleBy = 1.1;
      const newScale = e.deltaY > 0 ? panelScale / scaleBy : panelScale * scaleBy;


      const clampedScale = Math.max(0.5, Math.min(newScale, 3));

      setPanelScale(clampedScale);
    }
  };
  const handleDragGuide = (orientation, position) => {
    setGuidelines((prev) => [
      ...prev,
      { orientation, position }, // Add a new guideline
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
  };

  const handleMouseMove = (e) => {
    if (draggingGuide) {
      const updatedGuide = { ...draggingGuide };

      if (updatedGuide.orientation === "horizontal") {
        updatedGuide.position = (e.clientY - canvasPosition.y) / panelScale;
      } else if (updatedGuide.orientation === "vertical") {
        updatedGuide.position = (e.clientX - canvasPosition.x) / panelScale;
      }

      setDraggingGuide(updatedGuide);
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
      setPanelScale(clampedScale);
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


  return (
    <>
      <div className="main-panel"
        style={{
          overflow: 'hidden',
          width: '100vw',
          height: '100vh',
          position: 'relative',
        }}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={closeContextMenu}
      >

        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div style={{ flexGrow: '1', position: 'fixed', width: '100%', zIndex: '1' }}>
            <Topbar editorState={editorState} onEditorStateChange={onEditorStateChange} handleSave={handleSave} setIsSidebarOpen={setIsSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} handleDownloadPdf={handleDownloadPdf} selectedGroupId={selectedGroupId} setSelectedGroupId={setSelectedGroupId} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div style={{ flexGrow: '1', position: 'fixed', top: '125px' }}>
            <LeftSidebar />
          </div>
          <Ruler
            orientation="horizontal"
            length={width * panelScale + 1000}
            scale={panelScale}
            position={canvasPosition}
            canvasSize={{ width, height }}
            canvasPosition={canvasPosition}
            unit={unit}
            onClick={handleRulerClick}
            onRightClick={handleRulerRightClick}
            highlightRange={
              selectedBounds
                ? {
                  start: selectedBounds.x * panelScale + canvasPosition.x,
                  end: (selectedBounds.x + selectedBounds.width) * panelScale + canvasPosition.x
                }
                : null
            }
            onDragGuide={(orientation, position) => handleDragGuide(orientation, position)}
            style={{ zIndex: '20' }}
          />

          <Ruler
            orientation="vertical"
            length={height * panelScale + 1000}
            scale={panelScale}
            position={canvasPosition}
            canvasSize={{ width, height }}
            canvasPosition={canvasPosition}
            unit={unit}
            onClick={handleRulerClick}
            highlightRange={
              selectedBounds
                ? {
                  start: selectedBounds.y * panelScale + canvasPosition.y,
                  end: (selectedBounds.y + selectedBounds.height) * panelScale + canvasPosition.y
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
              style={{
                position: "absolute",
                top: guide.orientation === "horizontal" ? `${guide.position * panelScale}px` : "0",
                left: guide.orientation === "vertical" ? `${guide.position * panelScale}px` : "0",
                width: guide.orientation === "horizontal" ? "100%" : "1px",
                height: guide.orientation === "vertical" ? "100%" : "1px",
                backgroundColor: "blue",
                cursor: "move",
                zIndex: 1,
              }}
            ></div>
          ))}
          {draggingGuide && (
            <div
              draggable
              style={{
                position: "absolute",
                top: draggingGuide.orientation === "horizontal" ? `${draggingGuide.position * panelScale}px` : "0",
                left: draggingGuide.orientation === "vertical" ? `${draggingGuide.position * panelScale}px` : "0",
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
            }}
            onWheel={handleWheel}
          >
            <div
              style={{
                transform: `scale(${panelScale}) rotate(${canvasRotation}deg)`,
                transformOrigin: 'top center',
                width: `${width} px`,
                height: `${height}px`,
              }}
            >
              {/* <canvas
                id="drawingCanvas"
                ref={canvasRef}
                width={5000}
                height={5000}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: -1,
                  cursor: 'crosshair',
                }}
              /> */}
              <Panel
                printRef={printRef}
                isSidebarOpen={isSidebarOpen}
                stageRef={stageRef}
                textValue={textValue}
                width={width}
                setActiveTab={(tab) => console.log("Active Tab:", tab)}
                toggleSidebar={toggleSidebar}
                height={height}
                className="center-panel"
                style={{
                  backgroundColor: 'white',
                }}
              />
            </div>
          </div>

          <div style={{ flexGrow: '1', position: 'fixed', top: '125px', bottom: '50px', right: '0px' }}>
            <RightSidebar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} handleSave={handleSave} activeTab={activeTab} setActiveTab={(tab) => console.log("Active Tab:", tab)} handleDownloadPdf={handleDownloadPdf} selectedGroupId={selectedGroupId} setSelectedGroupId={setSelectedGroupId} />
          </div>
        </div>
        {/* <div style={{ display: 'flex', alignItems: 'stretch' }}>
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
                value={panelScale.toFixed(2)}
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
        </div> */}
      </div >
    </>
  )
}

export default Main