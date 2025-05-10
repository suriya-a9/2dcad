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
import html2canvas from "html2canvas";
import { useSelector } from "react-redux";





const Main = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const { width, height } = useSelector((state) => state.tool);

  const stageRef = useRef(null);

  const downloadURI = (uri, name) => {
    const link = document.createElement("a");
    link.href = uri;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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



  const handleSave = (format = "png") => {
    if (stageRef.current) {
      let uri;
      switch (format) {
        case "svg":
          exportToSVG(stageRef.current);
          break;
        case "jpg":
        case "png":
        case "webp":
          const canvas = stageRef.current.toCanvas({ pixelRatio: 3 });
          uri = canvas.toDataURL(`image/${format}`);
          downloadURI(uri, `stage.${format}`);
          break;
        case "avif":
          console.warn("AVIF format is not natively supported by Konva. Falling back to PNG.");
          const fallbackCanvas = stageRef.current.toCanvas({ pixelRatio: 3 });
          uri = fallbackCanvas.toDataURL("image/png");
          downloadURI(uri, "stage.png");
          break;
        case "pdf":
          exportToPDF(stageRef.current);
          break;
        case "eps":
          exportToEPS(stageRef.current);
          break;
        default:
          uri = stageRef.current.toDataURL({
            mimeType: "image/png",
            quality: 1,
            pixelRatio: 3,
          });
          downloadURI(uri, `stage.${format}`);
      }
    } else {
      console.error("stageRef.current is not a valid Konva Stage instance");
    }
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
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();

      const scaleBy = 1.1;
      const newScale = e.deltaY > 0 ? panelScale / scaleBy : panelScale * scaleBy;


      const clampedScale = Math.max(0.5, Math.min(newScale, 3));

      setPanelScale(clampedScale);
    }
  };

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
          overflow: 'scroll',
          width: '100vw',
          height: '100vh',
          position: 'relative',
        }}
        onWheel={handleWheel}
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
          {/* Horizontal Ruler */}
          <div
            style={{
              position: "absolute",
              top: "19.5%",
              left: "4%",
              width: "calc(100% - 12%)",
              height: "20px",
              backgroundColor: "#f0f0f0",
              borderBottom: "1px solid #ccc",
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {Array.from({ length: Math.ceil((width * panelScale) / 50) }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: `${50 * panelScale}px`,
                  height: "100%",
                  borderRight: "1px solid #ccc",
                  textAlign: "center",
                  fontSize: "10px",
                  lineHeight: "20px",
                  color: "#666",
                }}
              >
                {Math.round(i * 50 / panelScale)} {/* Adjust for zoom */}
              </div>
            ))}
          </div>

          {/* Vertical Ruler */}
          <div
            style={{
              position: "absolute",
              top: "125px",
              left: "2.5%",
              width: "20px",
              height: "calc(100vh - 160px)",
              backgroundColor: "#f0f0f0",
              borderRight: "1px solid #ccc",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {Array.from({ length: Math.ceil((height * panelScale) / 50) }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: "100%",
                  height: `${50 * panelScale}px`,
                  borderBottom: "1px solid #ccc",
                  textAlign: "center",
                  fontSize: "10px",
                  lineHeight: `${50 * panelScale}px`,
                  color: "#666",
                }}
              >
                {Math.round(i * 50 / panelScale)} {/* Adjust for zoom */}
              </div>
            ))}
          </div>
          <div
            style={{
              flexGrow: '10',
              position: 'relative',
              marginLeft: '4%',
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
                transform: `scale(${panelScale})`,
                transformOrigin: 'top center',
                width: `${width}px`,
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
                height={height}
                className="center-panel"
                style={{
                  backgroundColor: 'white',
                }}
              />
            </div>
          </div>

          <div style={{ flexGrow: '1', position: 'fixed', top: '125px', bottom: '50px', right: '0px' }}>
            <RightSidebar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} handleSave={handleSave} activeTab={activeTab} setActiveTab={setActiveTab} handleDownloadPdf={handleDownloadPdf} selectedGroupId={selectedGroupId} setSelectedGroupId={setSelectedGroupId} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div style={{ flexGrow: '1', position: 'fixed', bottom: '0px', overflowY: 'scroll', scrollbarWidth: 'thin' }}>
            <ColorPalette />
          </div>
        </div>
      </div>
    </>
  )
}

export default Main