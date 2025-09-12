import { useEffect, useRef, useState, useLayoutEffect, useImperativeHandle, forwardRef } from "react";
import paper from 'paper';
import Offset from "polygon-offset";
import polygonClipping from "polygon-clipping";
import opentype from "opentype.js";
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
import { DropperTopbar } from "../Topbar/Topbar";
import useImage from 'use-image';
import './Panel.css'
import {
  Stage,
  Layer,
  FastLayer,
  Rect,
  Arrow,
  Circle,
  Arc,
  Star,
  RegularPolygon as KonvaPolygon,
  Line,
  Transformer,
  Path,
  Text as KonvaText,
  Image,
  Group,
  Shape,
  TextPath,
  Ellipse,
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
  copy,
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
  addShapes,
  removeShapes,
  setPickedColor,
  addMeasurementLine,
  setMeasurementDraft,
  setConvertToItem,
  removeMeasurementLine,
  deselectAllShapes,
  setDynamicOffsetAmount,
  setDynamicOffsetMode,
  REPLACE_TEXT_WITH_GLYPHS,
  addStraightPoint,
  clearStraightPoints,
  setSplitPosition,
} from "../../Redux/Slice/toolSlice";
function applyRoughenEffect(points, amplitude = 10, frequency = 3) {
  if (!Array.isArray(points) || points.length < 2) return points;
  const roughened = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const prev = points[i - 1] || points[0];
    const next = points[i + 1] || points[points.length - 1];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const t = i * frequency;
    const offset = Math.sin(t) * amplitude + (Math.random() - 0.5) * amplitude;
    roughened.push({
      x: p.x + nx * offset,
      y: p.y + ny * offset,
    });
  }
  return roughened;
}
export function shapeToPoints(shape) {
  if (shape.type === "Polygon") {
    // Only use static points if NOT a regular polygon (i.e., custom shape)
    if (Array.isArray(shape.points) && shape.points.length > 2 && !shape.corners && !shape.spokeRatio) {
      return shape.points.map(p => ({ x: p.x ?? p[0], y: p.y ?? p[1] }));
    }
    // Otherwise, generate regular/star-like polygon using corners and spokeRatio
    const corners = shape.corners || 5;
    const spokeRatio = shape.spokeRatio ?? 1;
    const radius = shape.radius || 50;
    const centerX = shape.x || 0;
    const centerY = shape.y || 0;
    const double = spokeRatio !== 1;
    const numPoints = double ? corners * 2 : corners;
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (2 * Math.PI * i) / numPoints - Math.PI / 2;
      const r = double
        ? (i % 2 === 0 ? radius : radius * spokeRatio)
        : radius;
      points.push({
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      });
    }
    return points;
  }
  if (shape.type === "Pencil" && Array.isArray(shape.points)) {
    return shape.points.map(p => ({ x: p.x ?? p[0], y: p.y ?? p[1] }));
  }
  if (shape.type === "Calligraphy" && Array.isArray(shape.points)) {
    return shape.points.map(p => ({ x: p.x, y: p.y }));
  }
  if (shape.type === "Circle") {

    const num = 60;
    return Array.from({ length: num }).map((_, i) => {
      const angle = (i / num) * 2 * Math.PI;
      return {
        x: shape.x + shape.radius * Math.cos(angle),
        y: shape.y + shape.radius * Math.sin(angle),
      };
    });
  }
  if (shape.type === "Rectangle") {
    return [
      { x: shape.x, y: shape.y },
      { x: shape.x + shape.width, y: shape.y },
      { x: shape.x + shape.width, y: shape.y + shape.height },
      { x: shape.x, y: shape.y + shape.height },
    ];
  }
  if (shape.type === "Star") {
    const num = (shape.corners || 5) * 2;
    return Array.from({ length: num }).map((_, i) => {
      const angle = (i / num) * 2 * Math.PI - Math.PI / 2;
      const r = i % 2 === 0 ? shape.outerRadius : shape.innerRadius;
      return {
        x: shape.x + r * Math.cos(angle),
        y: shape.y + r * Math.sin(angle),
      };
    });
  }
  return [];
}
function generateKnotEffectPath(points, gapLength = 10) {
  if (!paper.project) {
    const canvas = document.createElement('canvas');
    paper.setup(canvas);
  }
  const path = new paper.Path();
  points.forEach((pt, i) => {
    if (i === 0) path.moveTo(new paper.Point(pt.x, pt.y));
    else path.lineTo(new paper.Point(pt.x, pt.y));
  });
  path.closed = false;

  const intersections = [];
  for (let i = 0; i < path.segments.length - 1; i++) {
    for (let j = i + 2; j < path.segments.length - 1; j++) {
      const inter = path.getIntersections(path);
      intersections.push(...inter);
    }
  }

  intersections.forEach(inter => {
    const loc = inter;
    const offset = gapLength / 2;
    const t1 = Math.max(0, loc.offset - offset);
    const t2 = Math.min(path.length, loc.offset + offset);
    path.divideAt(t1);
    path.divideAt(t2);
  });

  const svgPath = path.exportSVG({ asString: true });
  const dMatch = svgPath.match(/d="([^"]+)"/);
  return dMatch ? dMatch[1] : '';
}
export const generateSpiralPath = (x, y, turns = 5, radius = 50, divergence = 1) => {
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

function generateKnotPath(x, y, width, height, knotSize = 10, gapLength = 5) {
  const minSide = Math.min(width, height);
  knotSize = Math.max(1, Math.min(knotSize, minSide / 2));
  gapLength = Math.max(0, gapLength);

  let path = "";
  for (let px = x; px < x + width; px += knotSize + gapLength) {
    const seg = Math.min(knotSize, x + width - px);
    path += `M${px},${y}h${seg} `;
  }
  for (let py = y; py < y + height; py += knotSize + gapLength) {
    const seg = Math.min(knotSize, y + height - py);
    path += `M${x + width},${py}v${seg} `;
  }
  for (let px = x + width; px > x; px -= knotSize + gapLength) {
    const seg = Math.min(knotSize, px - x);
    path += `M${px},${y + height}h-${seg} `;
  }
  for (let py = y + height; py > y; py -= knotSize + gapLength) {
    const seg = Math.min(knotSize, py - y);
    path += `M${x},${py}v-${seg} `;
  }
  return path.trim();
}

export async function textToGlyphsHandler(dispatch, textShape, layerIndex) {
  const response = await fetch('/fonts/Arial.ttf');
  if (!response.ok) {
    alert("Font file not found! Please add Arial.ttf to public/fonts.");
    return;
  }
  const arrayBuffer = await response.arrayBuffer();
  const font = opentype.parse(arrayBuffer);
  const fontSize = textShape.fontSize || 16;
  let x = textShape.x;
  let y = textShape.y + fontSize;
  const glyphShapes = [];
  for (let i = 0; i < textShape.text.length; i++) {
    const char = textShape.text[i];
    const glyph = font.charToGlyph(char);
    const path = glyph.getPath(x, y, fontSize);
    const svgPath = path.toPathData();

    glyphShapes.push({
      id: `glyph-${textShape.id}-${i}-${Date.now()}`,
      name: `glyph-${textShape.id}-${i}`,
      type: "Path",
      path: svgPath,
      fill: textShape.fill || "#000",
      stroke: textShape.stroke || "#000",
      strokeWidth: 1,
      x: 0,
      y: 0,
      draggable: true,
      selected: false,
    });

    x += glyph.advanceWidth * (fontSize / font.unitsPerEm);
  }

  dispatch({
    type: "tool/REPLACE_TEXT_WITH_GLYPHS",
    payload: {
      textShapeId: textShape.id,
      glyphShapes,
      layerIndex,
    }
  });
}
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
function lineIntersectsRect(x1, y1, x2, y2, rect) {

  const { x, y, width, height } = rect;
  function between(a, b1, b2) {
    return (a >= Math.min(b1, b2) && a <= Math.max(b1, b2));
  }

  const edges = [
    [x, y, x + width, y],
    [x + width, y, x + width, y + height],
    [x + width, y + height, x, y + height],
    [x, y + height, x, y],
  ];
  for (const [ex1, ey1, ex2, ey2] of edges) {

    const denom = (x1 - x2) * (ey1 - ey2) - (y1 - y2) * (ex1 - ex2);
    if (denom === 0) continue;
    const t = ((x1 - ex1) * (ey1 - ey2) - (y1 - ey1) * (ex1 - ex2)) / denom;
    const u = -((x1 - x2) * (y1 - ey1) - (y1 - y2) * (x1 - ex1)) / denom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return true;
  }
  return false;
}
function findGridPath(start, end, obstacles, gridSize = 20, maxTries = 500) {

  function snap(p) {
    return {
      x: Math.round(p.x / gridSize) * gridSize,
      y: Math.round(p.y / gridSize) * gridSize,
    };
  }
  function isBlocked(x, y) {
    return obstacles.some(obs => {
      if (obs.type === "Rectangle") {
        return (
          x >= obs.x - gridSize / 2 &&
          x <= obs.x + obs.width + gridSize / 2 &&
          y >= obs.y - gridSize / 2 &&
          y <= obs.y + obs.height + gridSize / 2
        );
      }
      if (obs.type === "Circle") {
        const dx = x - obs.x;
        const dy = y - obs.y;
        return Math.sqrt(dx * dx + dy * dy) <= obs.radius + gridSize / 2;
      }
      if (obs.type === "Star") {

        const dx = x - obs.x;
        const dy = y - obs.y;
        return Math.sqrt(dx * dx + dy * dy) <= (obs.outerRadius || obs.radius || 0) + gridSize / 2;
      }
      if (obs.type === "Polygon" && Array.isArray(obs.points)) {

        let inside = false;
        const pts = obs.points.map(p =>
          Array.isArray(p) ? { x: p[0] + (obs.x || 0), y: p[1] + (obs.y || 0) } : { x: p.x + (obs.x || 0), y: p.y + (obs.y || 0) }
        );
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          if (
            (pts[i].y > y) !== (pts[j].y > y) &&
            x < ((pts[j].x - pts[i].x) * (y - pts[i].y)) / (pts[j].y - pts[i].y) + pts[i].x
          ) {
            inside = !inside;
          }
        }
        return inside;
      }
      return false;
    });
  }
  const startNode = snap(start);
  const endNode = snap(end);
  const open = [startNode];
  const cameFrom = {};
  const cost = {};
  const key = (p) => `${p.x},${p.y}`;
  cost[key(startNode)] = 0;
  let tries = 0;
  while (open.length && tries++ < maxTries) {
    open.sort((a, b) =>
      (cost[key(a)] + Math.abs(a.x - endNode.x) + Math.abs(a.y - endNode.y)) -
      (cost[key(b)] + Math.abs(b.x - endNode.x) + Math.abs(b.y - endNode.y))
    );
    const current = open.shift();
    if (current.x === endNode.x && current.y === endNode.y) {
      const path = [];
      let cur = current;
      let c = key(cur);
      while (cameFrom[c]) {
        path.push(cur);
        cur = cameFrom[c];
        c = key(cur);
      }
      path.push(startNode);
      path.reverse();
      return path.map(p => [p.x, p.y]).flat();
    }
    for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
      const nx = current.x + dx * gridSize;
      const ny = current.y + dy * gridSize;
      if (isBlocked(nx, ny)) continue;
      const neighbor = { x: nx, y: ny };
      const nKey = key(neighbor);
      const newCost = cost[key(current)] + 1;
      if (cost[nKey] === undefined || newCost < cost[nKey]) {
        cost[nKey] = newCost;
        cameFrom[nKey] = current;
        open.push(neighbor);
      }
    }
  }
  return [start.x, start.y, end.x, end.y];
}
const CanvasImage = React.forwardRef(({ shape, ...props }, ref) => {
  const [img, setImg] = useState(null);

  useEffect(() => {
    const image = new window.Image();
    image.src = shape.url;
    image.onload = () => setImg(image);
  }, [shape.url]);

  return (
    <Image
      ref={ref}
      {...props}
      image={img}
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      draggable={props.draggable}
      onClick={props.onClick}
      onDragEnd={props.onDragEnd}
    />
  );
});
function renderMarker(markerId, x, y, angle, color = "#222") {
  if (markerId === "arrow") {
    const len = 18;
    return (
      <Arrow
        key={`marker-arrow-${x}-${y}`}
        points={[
          x - len * Math.cos(angle), y - len * Math.sin(angle),
          x, y
        ]}
        pointerLength={12}
        pointerWidth={12}
        fill={color}
        stroke={color}
        strokeWidth={0}
        listening={false}
      />
    );
  }
  if (markerId === "dot") {
    return (
      <Circle
        key={`marker-dot-${x}-${y}`}
        x={x}
        y={y}
        radius={6}
        fill={color}
        stroke={color}
        strokeWidth={0}
        listening={false}
      />
    );
  }
  return null;
}
function generatePolygonPath(points) {
  if (!points || points.length === 0) return "";

  let path = "";
  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    const prev = points[(i - 1 + points.length) % points.length];
    const next = points[(i + 1) % points.length];

    if (curr.cornerLPE && curr.cornerLPE.radius > 0) {

      const v1 = { x: curr.x - prev.x, y: curr.y - prev.y };
      const v2 = { x: next.x - curr.x, y: next.y - curr.y };
      const len1 = Math.hypot(v1.x, v1.y);
      const len2 = Math.hypot(v2.x, v2.y);


      const p1 = {
        x: curr.x - (v1.x / len1) * curr.cornerLPE.radius,
        y: curr.y - (v1.y / len1) * curr.cornerLPE.radius,
      };
      const p2 = {
        x: curr.x + (v2.x / len2) * curr.cornerLPE.radius,
        y: curr.y + (v2.y / len2) * curr.cornerLPE.radius,
      };

      if (i === 0) {
        path += `M ${p1.x} ${p1.y} `;
      } else {
        path += `L ${p1.x} ${p1.y} `;
      }

      path += `A ${curr.cornerLPE.radius} ${curr.cornerLPE.radius} 0 0 1 ${p2.x} ${p2.y} `;
    } else {
      if (i === 0) {
        path += `M ${curr.x} ${curr.y} `;
      } else {
        path += `L ${curr.x} ${curr.y} `;
      }
    }
  }
  path += "Z";
  return path;
}
export function renderShape(shape, { dispatch, selectedShapeId, selectedShapeIds, shapeRefs, ...extraProps } = {}) {
  if (shape.type === "Rectangle") {
    return (
      <Rect
        key={shape.id}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        fill={shape.fill || "transparent"}
        stroke={shape.stroke || "black"}
        strokeWidth={shape.strokeWidth || 1}
        listening={false}
        {...extraProps}
      />
    );
  }
  if (shape.type === "3DBox") {
    const { x, y, width, height, fill, stroke, strokeWidth, id } = shape;
    const depth = Math.abs(Math.min(width, height) / 2);

    const front = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height }
    ];
    const top = [
      { x: 0, y: 0 },
      { x: depth, y: -depth },
      { x: width + depth, y: -depth },
      { x: width, y: 0 }
    ];
    const side = [
      { x: width, y: 0 },
      { x: width + depth, y: -depth },
      { x: width + depth, y: height - depth },
      { x: width, y: height }
    ];

    const handleRadius = 8;
    const handlePoints = [
      ...front,
      ...top,
      ...side
    ];

    const midPoints = [
      { x: width / 2, y: 0 },
      { x: width, y: height / 2 },
      { x: width / 2, y: height },
      { x: 0, y: height / 2 }
    ];

    return (
      <Group
        key={id}
        id={id}
        x={x}
        y={y}
        draggable={shape.locked ? false : true}
        ref={node => {
          if (node) shapeRefs.current[id] = node;
          else delete shapeRefs.current[id];
        }}
        onDragEnd={e => {
          const { x, y } = e.target.position();
          dispatch(updateShapePosition({ id, x, y }));
        }}
        onClick={e => {
          e.cancelBubble = true;
          if (!selectedShapeIds.includes(id)) {
            dispatch(selectShape(id));
          }
        }}
      >
        <Line
          points={front.flatMap(p => [p.x, p.y])}
          closed
          fill={fill || "#e0e0e0"}
          stroke={stroke || "#222"}
          strokeWidth={strokeWidth || 2}
        />
        <Line
          points={top.flatMap(p => [p.x, p.y])}
          closed
          fill="#cccccc"
          stroke={stroke || "#222"}
          strokeWidth={strokeWidth || 2}
        />
        <Line
          points={side.flatMap(p => [p.x, p.y])}
          closed
          fill="#b0b0b0"
          stroke={stroke || "#222"}
          strokeWidth={strokeWidth || 2}
        />
        {selectedShapeId === shape.id && (
          <>
            {handlePoints.map((pt, idx) => (
              <Circle
                key={`handle-${idx}`}
                x={pt.x}
                y={pt.y}
                radius={handleRadius}
                fill="#007bff"
                stroke="#fff"
                strokeWidth={2}
                draggable
                onDragMove={e => {
                  const newX = e.target.x();
                  const newY = e.target.y();
                  let updates = { id };

                  if (idx === 0) {
                    updates.x = x + (newX - pt.x);
                    updates.y = y + (newY - pt.y);
                    updates.width = width - (newX - pt.x);
                    updates.height = height - (newY - pt.y);
                  } else if (idx === 1) {
                    updates.y = y + (newY - pt.y);
                    updates.width = width + (newX - pt.x);
                    updates.height = height - (newY - pt.y);
                  } else if (idx === 2) {
                    updates.width = width + (newX - pt.x);
                    updates.height = height + (newY - pt.y);
                  } else if (idx === 3) {
                    updates.x = x + (newX - pt.x);
                    updates.width = width - (newX - pt.x);
                    updates.height = height + (newY - pt.y);
                  }

                  dispatch(updateShapePosition(updates));
                }}
                onMouseEnter={e => {
                  e.target.getStage().container().style.cursor = "pointer";
                }}
                onMouseLeave={e => {
                  e.target.getStage().container().style.cursor = "default";
                }}
              />
            ))}
            {midPoints.map((pt, idx) => (
              <Circle
                key={`mid-handle-${idx}`}
                x={pt.x}
                y={pt.y}
                radius={handleRadius - 2}
                fill="#00bfff"
                stroke="#fff"
                strokeWidth={2}
                draggable
                onDragMove={e => {
                  if (idx === 0) {
                    const newY = e.target.y();
                    const newHeight = height + (y - newY);
                    dispatch(updateShapePosition({ id, y: newY, height: newHeight }));
                  }
                }}
                onMouseEnter={e => {
                  e.target.getStage().container().style.cursor = "pointer";
                }}
                onMouseLeave={e => {
                  e.target.getStage().container().style.cursor = "default";
                }}
              />
            ))}
          </>
        )}
      </Group>
    );
  }
  if (shape.type === "Circle") {
    return (
      <Circle
        key={shape.id}
        x={shape.x}
        y={shape.y}
        radius={shape.radius}
        fill={shape.fill || "transparent"}
        stroke={shape.stroke || "black"}
        strokeWidth={shape.strokeWidth || 1}
        listening={false}
        {...extraProps}
      />
    );
  }
  if (shape.type === "Star") {
    return (
      <Star
        key={shape.id}
        x={shape.x}
        y={shape.y}
        numPoints={shape.corners}
        innerRadius={shape.innerRadius}
        outerRadius={shape.outerRadius}
        fill={shape.fill || "transparent"}
        stroke={shape.stroke || "black"}
        strokeWidth={shape.strokeWidth || 1}
        listening={false}
        {...extraProps}
      />
    );
  }
  if (shape.type === "Polygon") {
    const points = shapeToPoints(shape);
    return (
      <Path
        key={shape.id}
        x={shape.x}
        y={shape.y}
        data={generatePolygonPath(shape.points)}
        fill={shape.fill || "transparent"}
        stroke={shape.stroke || "black"}
        strokeWidth={shape.strokeWidth || 1}
        closed
        listening={false}
        {...extraProps}
      />
    );
  }
  if (shape.type === "Pencil") {
    return (
      <Line
        key={shape.id}
        points={shape.points.flatMap((p) => [p.x, p.y])}
        stroke={shape.stroke || shape.strokeColor || "black"}
        fill={shape.fill || "transparent"}
        strokeWidth={shape.strokeWidth || 2}
        lineJoin="round"
        lineCap="round"
        closed={shape.closed || false}
        listening={false}
        {...extraProps}
      />
    );
  }
  if (shape.type === "Calligraphy") {
    return (
      <Line
        key={shape.id}
        points={shape.points.flatMap((p) => [p.x, p.y])}
        stroke={shape.stroke || "black"}
        fill={shape.fill || "transparent"}
        strokeWidth={shape.strokeWidth || 2}
        lineJoin="round"
        lineCap="round"
        closed={false}
        listening={false}
        {...extraProps}
      />
    );
  }
  if (shape.type === "Bezier") {
    const bezierShape = useSelector(state => state.tool.bezierShape) || "plain";
    const bezierScale = useSelector(state => state.tool.bezierScale) || 1;
    const pathData = getBezierPathFromPoints(shape.points, shape.closed);

    let stroke = shape.stroke || "black";
    let strokeWidth = (shape.strokeWidth || 2) * bezierScale;
    let lineCap = "butt";
    let lineJoin = "miter";

    if (bezierShape === "triangle-in") {
      strokeWidth = 10 * bezierScale;
    } else if (bezierShape === "triangle-out") {
      strokeWidth = 10 * bezierScale;
    } else if (bezierShape === "ellipse") {
      strokeWidth = 16 * bezierScale;
      lineCap = "round";
      lineJoin = "round";
    }

    return (
      <Path
        data={pathData}
        stroke={stroke}
        strokeWidth={strokeWidth}
        lineCap={lineCap}
        lineJoin={lineJoin}
        fill="none"
        {...extraProps}
      />
    );
  }
  if (shape.type === "Ellipse") {
    return (
      <Ellipse
        key={shape.id}
        x={shape.x}
        y={shape.y}
        radiusX={shape.radiusX}
        radiusY={shape.radiusY}
        fill={shape.fill || "transparent"}
        stroke={shape.stroke || "#000"}
        strokeWidth={shape.strokeWidth || 1}
        rotation={shape.rotation || 0}
        listening={false}
        {...extraProps}
      />
    );
  }
  if (shape.type === "Text") {
    let y = shape.y;
    let fontSize = shape.fontSize;
    if (shape.verticalAlign === "super") {
      y -= fontSize * 0.3;
      fontSize *= 0.7;
    } else if (shape.verticalAlign === "sub") {
      y += fontSize * 0.3;
      fontSize *= 0.7;
    }
    return (
      <KonvaText
        x={shape.x}
        y={y}
        text={shape.text}
        fontSize={fontSize}
        fill={shape.fill}
        rotation={shape.rotation || 0}
        scaleX={shape.scaleX || 1}
        scaleY={shape.scaleY || 1}
      />
    );
  }
  return null;
}
const Panel = React.forwardRef(({
  textValue,
  isSidebarOpen,
  stageRef,
  printRef,
  setActiveTab,
  toggleSidebar
}, ref) => {
  const shapeRefs = useRef({});
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
  const pressureMin = useSelector(state => state.tool.pressureMin);
  const pressureMax = useSelector(state => state.tool.pressureMax);
  const penPoints = useSelector((state) => state.tool.penPoints);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isCustomCursorVisible, setIsCustomCursorVisible] = useState(false);
  const [boxStart, setBoxStart] = useState(null);
  const selectedTool = useSelector((state) => state.tool.selectedTool);
  console.log("Selected tool:", selectedTool);
  const gradientType = useSelector(state => state.tool.gradientType);
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
  const sprayMode = useSelector((state) => state.tool.sprayMode)
  const sprayRotation = useSelector((state) => state.tool.sprayRotation);
  const sprayScatter = useSelector((state) => state.tool.sprayScatter);
  const sprayEraserMode = useSelector((state) => state.tool.sprayEraserMode);
  const eraserMode = useSelector((state) => state.tool.eraserMode);
  const dropperMode = useSelector(state => state.tool.dropperMode);
  const pickedColor = useSelector(state => state.tool.pickedColor);
  const dropperTarget = useSelector(state => state.tool.dropperTarget || "stroke");
  const [colorPicker, setColorPicker] = useState({ visible: false, x: 0, y: 0, idx: null });
  const pressureEnabled = useSelector(state => state.tool.pressureEnabled);
  const brushCaps = useSelector((state) => state.tool.brushCaps);
  const measurementLines = useSelector(state => state.tool.measurementLines);
  const measurementDraft = useSelector(state => state.tool.measurementDraft);
  const measurementFontSize = useSelector(state => state.tool.measurementFontSize);
  const measurementPrecision = useSelector(state => state.tool.measurementPrecision);
  const measurementScale = useSelector(state => state.tool.measurementScale);
  const measurementUnit = useSelector(state => state.tool.measurementUnit);
  const measureAllLayers = useSelector(state => state.tool.measureAllLayers);
  const measureOnlySelected = useSelector(state => state.tool.measureOnlySelected);
  const ignoreFirstLast = useSelector(state => state.tool.ignoreFirstLast);
  const showMeasureBetween = useSelector(state => state.tool.showMeasureBetween);
  const showHiddenIntersections = useSelector(state => state.tool.showHiddenIntersections);
  const [guides, setGuides] = useState([]);
  const phantomMeasure = useSelector(state => state.tool.phantomMeasure);
  const reverseMeasure = useSelector(state => state.tool.reverseMeasure);
  const markDimension = useSelector(state => state.tool.markDimension);
  const measurementOffset = useSelector(state => state.tool.measurementOffset || 16);
  const convertToItem = useSelector(state => state.tool.convertToItem);
  const shapeBuilderMode = useSelector(state => state.tool.shapeBuilderMode);
  const replaceShapes = useSelector(state => state.tool.replaceShapes);
  const [shapeBuilderRegions, setShapeBuilderRegions] = useState([]);
  const [selectedRegionIndices, setSelectedRegionIndices] = useState([]);
  const [shapeBuilderShapes, setShapeBuilderShapes] = useState([]);
  const paintBucketFillBy = useSelector(state => state.tool.paintBucketFillBy);
  const paintBucketThreshold = useSelector(state => state.tool.paintBucketThreshold);
  const paintBucketGrowSink = useSelector(state => state.tool.paintBucketGrowSink || 0);
  const paintBucketCloseGaps = useSelector(state => state.tool.paintBucketCloseGaps || "none");
  const meshRows = useSelector(state => state.tool.meshRows || 4);
  const meshCols = useSelector(state => state.tool.meshCols || 4);
  const meshMode = useSelector(state => state.tool.meshMode || "mesh-gradient");
  const [meshStart, setMeshStart] = useState(null);
  const [meshPreview, setMeshPreview] = useState(null);
  const connectorMode = useSelector(state => state.tool.connectorMode);
  const connectorOrthogonal = useSelector(state => state.tool.connectorOrthogonal);
  const [connectorDrag, setConnectorDrag] = useState(null);
  const [connectorPreview, setConnectorPreview] = useState(null);
  const connectorLength = useSelector(state => state.tool.connectorLength ?? 0);
  const spacing = useSelector(state => state.tool.connectorSpacing ?? 0);
  const connectorLineStyle = useSelector(state => state.tool.connectorLineStyle || "solid");
  const connectorNoOverlap = useSelector(state => state.tool.connectorNoOverlap);
  const tweakMode = useSelector(state => state.tool.tweakMode);
  const tweakRadius = useSelector(state => state.tool.tweakRadius || 40);
  const tweakForce = useSelector(state => state.tool.tweakForce || 1);
  const tweakFidelity = useSelector(state => state.tool.tweakFidelity || 50);
  const dynamicOffsetMode = useSelector(state => state.tool.dynamicOffsetMode);
  const dynamicOffsetShapeId = useSelector(state => state.tool.dynamicOffsetShapeId);
  const dynamicOffsetAmount = useSelector(state => state.tool.dynamicOffsetAmount);
  const straightPoints = useSelector((state) => state.tool.straightPoints);
  const [snapText, setSnapText] = useState(null);
  const [patternImages, setPatternImages] = React.useState({});
  const [xraySplit, setXraySplit] = useState(0.5);
  const [xrayHoveredId, setXrayHoveredId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const showPageGrid = useSelector(state => state.tool.showPageGrid);
  const showHandlesShapeId = useSelector(state => state.tool.showHandlesShapeId);
  const [dragSelectRect, setDragSelectRect] = useState(null);
  const [dragStartPos, setDragStartPos] = useState(null);
  const shapeBuilderTemplate = useSelector(state => state.tool.shapeBuilderTemplate);
  console.log("showPageGrid:", showPageGrid);
  window.showPageGrid = showPageGrid;
  const splitContainerRef = useRef();
  function addGuidesAtLine(x1, y1, x2, y2) {
    setGuides(prev => [
      ...prev,
      { orientation: "vertical", position: x1 },
      { orientation: "horizontal", position: y1 },
      { orientation: "vertical", position: x2 },
      { orientation: "horizontal", position: y2 }
    ]);
  }
  function showMessage(type, text) {
    setMessages(msgs => [...msgs, { type, text }]);
    setShowMessagesModal(true);
  }

  const snappingOptions = useSelector(state => state.tool.snappingOptions);
  const grids = useSelector(state => state.tool.grids || []);

  const pageMargin = useSelector(state => state.tool.pageMargin || { left: 0, right: 0, top: 0, bottom: 0 });


  function getSnappedPosition(pos, shapes, grids, guides = []) {
    let snapped = { ...pos };
    let snapLabel = null;

    if (!isSnappingEnabled) {
      setSnapText(null);
      return snapped;
    }

    // --- Bounding Box Snapping ---
    if (snappingOptions.boundingBoxes) {
      shapes.forEach(shape => {
        // Edges
        if (snappingOptions.edges) {
          if (Math.abs(pos.x - shape.x) < 10) { snapped.x = shape.x; snapLabel = "Edge Snap"; }
          if (Math.abs(pos.x - (shape.x + shape.width)) < 10) { snapped.x = shape.x + shape.width; snapLabel = "Edge Snap"; }
          if (Math.abs(pos.y - shape.y) < 10) { snapped.y = shape.y; snapLabel = "Edge Snap"; }
          if (Math.abs(pos.y - (shape.y + shape.height)) < 10) { snapped.y = shape.y + shape.height; snapLabel = "Edge Snap"; }
        }
        // Corners
        if (snappingOptions.corners) {
          [
            { x: shape.x, y: shape.y },
            { x: shape.x + shape.width, y: shape.y },
            { x: shape.x, y: shape.y + shape.height },
            { x: shape.x + shape.width, y: shape.y + shape.height }
          ].forEach(corner => {
            if (Math.abs(pos.x - corner.x) < 10 && Math.abs(pos.y - corner.y) < 10) {
              snapped.x = corner.x; snapped.y = corner.y; snapLabel = "Corner Snap";
            }
          });
        }
        // Edge Midpoints
        if (snappingOptions.edgeMidpoints) {
          [
            { x: shape.x + shape.width / 2, y: shape.y },
            { x: shape.x + shape.width / 2, y: shape.y + shape.height },
            { x: shape.x, y: shape.y + shape.height / 2 },
            { x: shape.x + shape.width, y: shape.y + shape.height / 2 }
          ].forEach(mid => {
            if (Math.abs(pos.x - mid.x) < 10 && Math.abs(pos.y - mid.y) < 10) {
              snapped.x = mid.x; snapped.y = mid.y; snapLabel = "Edge Midpoint Snap";
            }
          });
        }
        // Center
        if (snappingOptions.centers) {
          const center = { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 };
          if (Math.abs(pos.x - center.x) < 10 && Math.abs(pos.y - center.y) < 10) {
            snapped.x = center.x; snapped.y = center.y; snapLabel = "Center Snap";
          }
        }
      });
    }

    // --- Nodes / Paths Snapping ---
    shapes.forEach(shape => {
      if (Array.isArray(shape.points)) {
        // Nodes
        if (snappingOptions.nodes) {
          shape.points.forEach(pt => {
            const px = pt.x ?? pt[0];
            const py = pt.y ?? pt[1];
            if (Math.abs(pos.x - px) < 10 && Math.abs(pos.y - py) < 10) {
              snapped.x = px; snapped.y = py; snapLabel = "Node Snap";
            }
          });
        }
        // Path Intersections (stub, needs real intersection logic)
        if (snappingOptions.pathIntersections) {
          // TODO: Implement intersection detection between paths
        }
        // Cusp Nodes (stub, needs node type info)
        if (snappingOptions.cuspNodes) {
          // TODO: Snap to sharp nodes if shape.points[i].type === "cusp"
        }
        // Smooth Nodes (stub, needs node type info)
        if (snappingOptions.smoothNodes) {
          // TODO: Snap to smooth nodes if shape.points[i].type === "smooth"
        }
        // Line Midpoints
        if (snappingOptions.lineMidpoints) {
          for (let i = 1; i < shape.points.length; i++) {
            const p1 = shape.points[i - 1];
            const p2 = shape.points[i];
            const mx = ((p1.x ?? p1[0]) + (p2.x ?? p2[0])) / 2;
            const my = ((p1.y ?? p1[1]) + (p2.y ?? p2[1])) / 2;
            if (Math.abs(pos.x - mx) < 10 && Math.abs(pos.y - my) < 10) {
              snapped.x = mx; snapped.y = my; snapLabel = "Segment Midpoint Snap";
            }
          }
        }
        // Perpendicular Lines (stub)
        if (snappingOptions.perpendicularLines) {
          // TODO: Implement perpendicular snapping
        }
        // Tangential Lines (stub)
        if (snappingOptions.tangentialLines) {
          // TODO: Implement tangent snapping
        }
        // Alignment Nodes (nodes in same path)
        if (snappingOptions.alignmentNodes) {
          shape.points.forEach(pt => {
            if (Math.abs(pos.x - pt.x) < 10 || Math.abs(pos.y - pt.y) < 10) {
              snapped.x = pt.x; snapped.y = pt.y; snapLabel = "Alignment Node Snap";
            }
          });
        }
        // Same Distances (equal spacing)
        if (snappingOptions.alignmentDistances) {
          let referenceDistance = 50; // Example, make configurable
          shape.points.forEach(pt => {
            const dx = Math.abs(pos.x - pt.x);
            const dy = Math.abs(pos.y - pt.y);
            if (Math.abs(dx - referenceDistance) < 10 || Math.abs(dy - referenceDistance) < 10) {
              snapLabel = "Same Distance Snap";
            }
          });
        }
      }
    });
    for (const shape of shapes) {
      if (shape.id === pos.id) continue;
      // Rectangle, Polygon, Star, etc.
      let corners = [];
      if (shape.type === "Rectangle") {
        corners = [
          { x: shape.x, y: shape.y },
          { x: shape.x + shape.width, y: shape.y },
          { x: shape.x, y: shape.y + shape.height },
          { x: shape.x + shape.width, y: shape.y + shape.height }
        ];
      } else if (Array.isArray(shape.points)) {
        corners = shape.points.map(pt => ({
          x: pt.x ?? pt[0],
          y: pt.y ?? pt[1]
        }));
      } else if (shape.type === "Circle") {
        // Circles don't have corners, skip
        continue;
      }
      for (const corner of corners) {
        if (Math.abs(pos.x - corner.x) < 10 && Math.abs(pos.y - corner.y) < 10) {
          snapped.x = corner.x;
          snapped.y = corner.y;
          snapLabel = "Corner Snap";
          break;
        }
      }
      if (snapLabel) break;
    }
    // Object Midpoints
    if (snappingOptions.objectMidpoints) {
      shapes.forEach(shape => {
        const midX = shape.x + (shape.width || shape.radius || 0) / 2;
        const midY = shape.y + (shape.height || shape.radius || 0) / 2;
        if (Math.abs(pos.x - midX) < 10 && Math.abs(pos.y - midY) < 10) {
          snapped.x = midX; snapped.y = midY; snapLabel = "Object Midpoint Snap";
        }
      });
    }

    // Rotation Center
    if (snappingOptions.objectRotationCenters) {
      shapes.forEach(shape => {
        if (shape.rotationCenter) {
          if (Math.abs(pos.x - shape.rotationCenter.x) < 10 && Math.abs(pos.y - shape.rotationCenter.y) < 10) {
            snapped.x = shape.rotationCenter.x; snapped.y = shape.rotationCenter.y; snapLabel = "Rotation Center Snap";
          }
        }
      });
    }

    // Text Baselines
    if (snappingOptions.textBaselines) {
      shapes.forEach(shape => {
        if (shape.type === "Text" && shape.y !== undefined) {
          if (Math.abs(pos.y - shape.y) < 10) {
            snapped.y = shape.y; snapLabel = "Text Baseline Snap";
          }
        }
      });
    }

    // Masks and Clips (stub)
    if (snappingOptions.masks || snappingOptions.clips) {
      // TODO: Snap to mask/clip edges if shape data supports it
    }

    // --- Edges / Segments Snapping ---
    // Grids
    if (snappingOptions.grids && grids.length) {
      const gridSize = grids[0]?.size || 20;
      const gridX = Math.round(pos.x / gridSize) * gridSize;
      const gridY = Math.round(pos.y / gridSize) * gridSize;
      if (Math.abs(pos.x - gridX) < 10 || Math.abs(pos.y - gridY) < 10) {
        snapped.x = gridX; snapped.y = gridY; snapLabel = "Grid Snap";
      }
    }
    // Guide Lines
    if (snappingOptions.guideLines && guides.length) {
      guides.forEach(guide => {
        if (guide.orientation === "vertical" && Math.abs(pos.x - guide.position) < 10) {
          snapped.x = guide.position; snapLabel = "Guide Snap";
        }
        if (guide.orientation === "horizontal" && Math.abs(pos.y - guide.position) < 10) {
          snapped.y = guide.position; snapLabel = "Guide Snap";
        }
      });
    }
    // Page Borders
    if (snappingOptions.pageBorders) {
      if (Math.abs(pos.x) < 10) { snapped.x = 0; snapLabel = "Page Border Snap"; }
      if (Math.abs(pos.y) < 10) { snapped.y = 0; snapLabel = "Page Border Snap"; }
      if (Math.abs(pos.x - width) < 10) { snapped.x = width; snapLabel = "Page Border Snap"; }
      if (Math.abs(pos.y - height) < 10) { snapped.y = height; snapLabel = "Page Border Snap"; }
    }
    // Page Margins
    if (snappingOptions.pageMargins && pageMargin) {
      if (Math.abs(pos.x - pageMargin.left) < 10) { snapped.x = pageMargin.left; snapLabel = "Page Margin Snap"; }
      if (Math.abs(pos.x - (width - pageMargin.right)) < 10) { snapped.x = width - pageMargin.right; snapLabel = "Page Margin Snap"; }
      if (Math.abs(pos.y - pageMargin.top) < 10) { snapped.y = pageMargin.top; snapLabel = "Page Margin Snap"; }
      if (Math.abs(pos.y - (height - pageMargin.bottom)) < 10) { snapped.y = height - pageMargin.bottom; snapLabel = "Page Margin Snap"; }
    }

    // --- Tooltip ---
    if (snapLabel) {
      setSnapText({
        x: snapped.x * scale + position.x + 12,
        y: snapped.y * scale + position.y - 24,
        text: snapLabel
      });
    } else {
      setSnapText(null);
    }

    return snapped;
  }
  function pushMeasurementLine(x1, y1, x2, y2) {
    if (reverseMeasure) {
      extraMeasurementLines.push({ x1: x2, y1: y2, x2: x1, y2: y1 });
    } else {
      extraMeasurementLines.push({ x1, y1, x2, y2 });
    }
  }


  const shapesToMeasure = measureAllLayers
    ? layers.flatMap(layer => layer.shapes)
    : shapes;


  const filteredShapes = measureOnlySelected
    ? shapesToMeasure.filter(s => selectedShapeIds.includes(s.id))
    : shapesToMeasure;


  const shapesWithPoints = filteredShapes.map(shape => {
    let points = shape.points;
    if (ignoreFirstLast && Array.isArray(points) && points.length > 2) {
      points = points.slice(1, -1);
    }
    return { ...shape, points };
  });


  let extraMeasurementLines = [];
  if (showMeasureBetween) {
    shapesWithPoints.forEach(shape => {
      const pts = shape.points;
      if (Array.isArray(pts) && pts.length > 1) {
        for (let i = 1; i < pts.length; i++) {
          const p0 = Array.isArray(pts[i - 1]) ? { x: pts[i - 1][0], y: pts[i - 1][1] } : pts[i - 1];
          const p1 = Array.isArray(pts[i]) ? { x: pts[i][0], y: pts[i][1] } : pts[i];
          pushMeasurementLine(p0.x, p0.y, p1.x, p1.y);
        }
      }
    });
  }

  if (showMeasureBetween && shapesWithPoints.length > 1) {
    for (let i = 0; i < shapesWithPoints.length; i++) {
      for (let j = i + 1; j < shapesWithPoints.length; j++) {
        const a = shapesWithPoints[i];
        const b = shapesWithPoints[j];

        const aPt = Array.isArray(a.points) && a.points.length > 0
          ? (Array.isArray(a.points[0]) ? { x: a.points[0][0], y: a.points[0][1] } : a.points[0])
          : { x: a.x, y: a.y };
        const bPt = Array.isArray(b.points) && b.points.length > 0
          ? (Array.isArray(b.points[0]) ? { x: b.points[0][0], y: b.points[0][1] } : b.points[0])
          : { x: b.x, y: b.y };
        pushMeasurementLine(aPt.x, aPt.y, bPt.x, bPt.y);
      }
    }
  }

  if (showHiddenIntersections) {
    for (let i = 0; i < shapesWithPoints.length; i++) {
      for (let j = i + 1; j < shapesWithPoints.length; j++) {
        const a = shapesWithPoints[i];
        const b = shapesWithPoints[j];
        if (
          a.x !== undefined && a.y !== undefined && a.width && a.height &&
          b.x !== undefined && b.y !== undefined && b.width && b.height
        ) {
          const ix = Math.max(a.x, b.x);
          const iy = Math.max(a.y, b.y);
          const ax2 = a.x + a.width, ay2 = a.y + a.height;
          const bx2 = b.x + b.width, by2 = b.y + b.height;
          const ix2 = Math.min(ax2, bx2);
          const iy2 = Math.min(ay2, by2);
          if (ix < ix2 && iy < iy2) {

            extraMeasurementLines.push({ x1: ix, y1: iy, x2: ix2, y2: iy2 });
          }
        }
      }
    }
  }

  if (showMeasureBetween) {
    shapesWithPoints.forEach(shape => {
      const pts = shape.points;
      if (Array.isArray(pts) && pts.length > 1) {
        for (let i = 1; i < pts.length; i++) {
          const p0 = Array.isArray(pts[i - 1]) ? { x: pts[i - 1][0], y: pts[i - 1][1] } : pts[i - 1];
          const p1 = Array.isArray(pts[i]) ? { x: pts[i][0], y: pts[i][1] } : pts[i];
          pushMeasurementLine(p0.x, p0.y, p1.x, p1.y);
        }
      }
    });
  }

  if (showMeasureBetween && shapesWithPoints.length > 1) {
    for (let i = 0; i < shapesWithPoints.length; i++) {
      for (let j = i + 1; j < shapesWithPoints.length; j++) {
        const a = shapesWithPoints[i];
        const b = shapesWithPoints[j];
        const aPt = Array.isArray(a.points) && a.points.length > 0
          ? (Array.isArray(a.points[0]) ? { x: a.points[0][0], y: a.points[0][1] } : a.points[0])
          : { x: a.x, y: a.y };
        const bPt = Array.isArray(b.points) && b.points.length > 0
          ? (Array.isArray(b.points[0]) ? { x: b.points[0][0], y: b.points[0][1] } : b.points[0])
          : { x: b.x, y: b.y };
        pushMeasurementLine(aPt.x, aPt.y, bPt.x, bPt.y);
      }
    }
  }
  console.log("SelectedShapeIds:", selectedShapeIds);
  console.log("filteredShapes:", filteredShapes);
  console.log("showMeasureBetween:", showMeasureBetween);
  console.log("shapesWithPoints.length:", shapesWithPoints.length);
  console.log("extraMeasurementLines after loop:", extraMeasurementLines);

  const allMeasurementLines = [...measurementLines, ...extraMeasurementLines];
  console.log("allMeasurementLines:", allMeasurementLines);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [hoveredShape, setHoveredShape] = useState(null);
  const measurementDraftRef = useRef(null);

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
    const adjustedPointerPosition = getAdjustedPointerPosition(stage, position, scale);
    if (!adjustedPointerPosition) return;
    const { x, y } = adjustedPointerPosition;

    const bounds = {
      x: x - sprayWidth / 2,
      y: y - sprayWidth / 2,
      width: sprayWidth,
      height: sprayWidth,
    };

    if (!selectedShapeId) {
      showMessage("warning", "No shape selected for spraying. Please select a shape first.");
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


    const rotationRad = (sprayRotation || 0) * (Math.PI / 180);

    if (sprayMode === "singlePath") {
      const shapesInPath = [];
      const amount = Math.max(2, sprayAmount);
      const radius = Math.max(50, sprayWidth / 2);

      for (let i = 0; i < amount; i++) {
        const angle = (2 * Math.PI * i) / amount;
        const px0 = Math.cos(angle) * radius;
        const py0 = Math.sin(angle) * radius;
        const px = x + (px0 * Math.cos(rotationRad) - py0 * Math.sin(rotationRad));
        const py = y + (px0 * Math.sin(rotationRad) + py0 * Math.cos(rotationRad));
        const randomScale = sprayScale * (0.7 + Math.random() * 0.6);

        let shapeData = {
          ...sprayBaseShape,
          id: `spray-singlepath-${Date.now()}-${i}`,
          x: px,
          y: py,
          rotation: sprayRotation,
        };

        if (baseShape.type === "Rectangle") {
          shapeData.width = baseShape.width * randomScale;
          shapeData.height = baseShape.height * randomScale;
        } else if (baseShape.type === "Circle") {
          shapeData.radius = baseShape.radius * randomScale;
        } else if (baseShape.type === "Star") {
          shapeData.innerRadius = baseShape.innerRadius * randomScale;
          shapeData.outerRadius = baseShape.outerRadius * randomScale;
        } else if (baseShape.type === "Polygon") {
          shapeData.radius = baseShape.radius * randomScale;

          const corners = baseShape.corners || (baseShape.points ? baseShape.points.length : 6);
          const angleStep = (2 * Math.PI) / corners;
          shapeData.points = Array.from({ length: corners }).map((_, i) => {
            const angle = i * angleStep;
            return {
              x: shapeData.radius * Math.cos(angle),
              y: shapeData.radius * Math.sin(angle),
            };
          });
        } else if (baseShape.type === "Pencil") {
          shapeData.points = baseShape.points.map(p =>
            Array.isArray(p)
              ? [p[0] + dx, p[1] + dy]
              : { x: p.x + dx, y: p.y + dy }
          );
          shapeData.x = px;
          shapeData.y = py;
        } else if (baseShape.type === "Calligraphy") {
          shapeData.points = baseShape.points.map(p => ({
            ...p,
            x: p.x + dx,
            y: p.y + dy
          }));
          shapeData.x = px;
          shapeData.y = py;
        }

        shapesInPath.push(shapeData);
      }


      const groupShape = {
        id: `spray-group-${Date.now()}`,
        type: "Group",
        shapes: shapesInPath,
        x: 0,
        y: 0,
      };

      dispatch(addShape(groupShape));
      return;
    }


    const sprayShapes = [];
    const points = [];
    for (let i = 0; i < sprayAmount; i++) {
      const angle = (2 * Math.PI * i) / sprayAmount;
      const radius = sprayWidth / 2;
      const scatterX = (Math.random() - 0.5) * 2 * sprayScatter;
      const scatterY = (Math.random() - 0.5) * 2 * sprayScatter;
      const px0 = Math.cos(angle) * radius + scatterX;
      const py0 = Math.sin(angle) * radius + scatterY;

      const px = x + (px0 * Math.cos(rotationRad) - py0 * Math.sin(rotationRad));
      const py = y + (px0 * Math.sin(rotationRad) + py0 * Math.cos(rotationRad));

      const randomScale = sprayScale * (0.7 + Math.random() * 0.6);

      let shapeData = {
        ...sprayBaseShape,
        id: `spray-clone-${Date.now()}-${i}`,
        x: px,
        y: py,
        rotation: sprayRotation,
      };
      const dx = px - (baseShape.x || 0);
      const dy = py - (baseShape.y || 0);

      if (baseShape.type === "Pencil") {
        shapeData.points = baseShape.points.map(p =>
          Array.isArray(p)
            ? [p[0] + dx, p[1] + dy]
            : { x: p.x + dx, y: p.y + dy }
        );
        shapeData.x = px;
        shapeData.y = py;
      } else if (baseShape.type === "Calligraphy") {
        shapeData.points = baseShape.points.map(p => ({
          ...p,
          x: p.x + dx,
          y: p.y + dy
        }));
        shapeData.x = px;
        shapeData.y = py;
      }
      if (baseShape.type === "Rectangle") {
        shapeData.width = baseShape.width * randomScale;
        shapeData.height = baseShape.height * randomScale;
      } else if (baseShape.type === "Circle") {
        shapeData.radius = baseShape.radius * randomScale;
      } else if (baseShape.type === "Star") {
        shapeData.innerRadius = baseShape.innerRadius * randomScale;
        shapeData.outerRadius = baseShape.outerRadius * randomScale;
      } else if (baseShape.type === "Polygon") {
        shapeData.radius = baseShape.radius * randomScale;

        const corners = baseShape.corners || (baseShape.points ? baseShape.points.length : 6);
        const angleStep = (2 * Math.PI) / corners;
        shapeData.points = Array.from({ length: corners }).map((_, i) => {
          const angle = i * angleStep;
          return {
            x: shapeData.radius * Math.cos(angle),
            y: shapeData.radius * Math.sin(angle),
          };
        });
      }


      sprayShapes.push(shapeData);
    }


    dispatch(addShapes(sprayShapes));
  };

  function getPointerPosition(e) {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    return pointer ? { x: pointer.x, y: pointer.y } : { x: 0, y: 0 };
  }
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
            textDirection: selectedShape?.textDirection || "ltr",
            blockProgression: selectedShape?.blockProgression || "normal",
            verticalAlign: selectedShape?.verticalAlign || "normal",
          })
        );
      } else {

        const newTextShape = {
          id: `text-${Date.now()}`,
          type: "Text",
          blockProgression: "normal",
          textDirection: selectedShape?.textDirection || "ltr",
          x: (textAreaPosition.x - position.x) / scale,
          y: (textAreaPosition.y - position.y) / scale,
          text: textContent,
          fontSize: selectedFontSize,
          fontFamily: selectedFontFamily,
          fontStyle: selectedFontStyle,
          alignment: selectedAlignment,
          fill: strokeColor,
          width: 200,
          verticalAlign: "normal",
        };
        console.log("Selected Text Direction:", selectedShape?.textDirection);
        console.log("Textarea Direction Attribute:", selectedShape?.textDirection || "ltr");
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
  const [gradientDrag, setGradientDrag] = useState(null);
  const handleMouseDown = (e) => {
    console.log("handleMouseDown", { selectedTool, bezierOption });
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
    const clickedOnEmpty = e.target === e.target.getStage();
    // if (selectedTool === "Select" && pointerPosition) {
    //   setDragStartPos(pointerPosition);
    //   setDragSelectRect({ x: pointerPosition.x, y: pointerPosition.y, width: 0, height: 0 });
    // }
    // if (selectedTool === "Select" && clickedOnEmpty) {
    //   dispatch(clearSelection());
    //   return;
    // }
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


      if (!selectedShapeIds.includes(shapeId)) {
        dispatch(selectShape(shapeId));
      }

      const shape = shapes.find((shape) => shape.id === shapeId);
      if (shape) {
        const controlPoints = generateNodePoints(shape);
        console.log("Generated Control Points:", controlPoints);


        dispatch(setControlPoints(controlPoints));
      }
    }
    console.log("Clicked Shape:", clickedShape);
    if (selectedTool === "3DBox") {
      console.log("3DBox mouse down");
      const pos = getPointerPosition(e);
      setBoxStart(pos);
      setNewShape(null);
    }
    if (clickedOnEmpty) {
      if (selectedTool !== "Node") {
        dispatch(clearSelection());
      }
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
        } else if (shape.type === "Bezier") {
          if (Array.isArray(shape.points)) {
            nodes = shape.points.map(p =>
              Array.isArray(p)
                ? { x: p[0], y: p[1] }
                : { x: p.x, y: p.y }
            );
          } else {
            nodes = [];
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
    } else if (selectedTool === "Select") {
      if (clickedShape && clickedShape.attrs && clickedShape.attrs.id) {
        console.log("Select Tool: Selecting shape with ID:", clickedShape.attrs.id);
        dispatch(selectShape(clickedShape.attrs.id));
      } else {
        console.log("No shape selected, clearing selection.");
        if (e.target === stage) {
          if (selectedTool !== "Node") {
            dispatch(clearSelection());
          }
        }
      }
      return;
    }

    if (selectedTool === "Spiral" && clickedShape && clickedShape.attrs && clickedShape.attrs.id) {
      const shape = shapes.find((shape) => shape.id === clickedShape.attrs.id);
      if (shape && shape.type === "Spiral") {
        dispatch(selectShape(shape.id));
        return;
      }
    }
    if (selectedTool === "Node") {
      if (clickedShape && clickedShape.attrs && clickedShape.attrs.id) {
        const shapeId = clickedShape.attrs.id;
        console.log("Node Tool: Selecting shape with ID:", shapeId);


        dispatch(selectShape(shapeId));


        dispatch(clearControlPoints());
      }
    }
    if (selectedTool === "Connector" && clickedShape && clickedShape.attrs && clickedShape.attrs.id) {
      const shape = shapes.find(s => s.id === clickedShape.attrs.id);
      if (shape) {
        const pointer = getAdjustedPointerPosition(e.target.getStage(), position, scale);
        let startOffset = { x: pointer.x - shape.x, y: pointer.y - shape.y };
        setConnectorDrag({
          startId: shape.id,
          startPos: { x: pointer.x, y: pointer.y },
          startOffset,
          currentPos: { x: pointer.x, y: pointer.y }
        });
      }
      return;
    }
    if (selectedTool === "Mesh" && clickedShape && clickedShape.attrs && clickedShape.attrs.id) {
      const shape = shapes.find(s => s.id === clickedShape.attrs.id);
      if (!shape) return;


      let x = shape.x, y = shape.y, width = 100, height = 100;
      if (shape.type === "Rectangle") {
        width = shape.width;
        height = shape.height;
      } else if (shape.type === "Circle") {
        x = shape.x - shape.radius;
        y = shape.y - shape.radius;
        width = shape.radius * 2;
        height = shape.radius * 2;
      } else if (shape.type === "Polygon" && Array.isArray(shape.points)) {
        const pts = shape.points.map(p => ({
          x: (p.x ?? p[0]) + (shape.x || 0),
          y: (p.y ?? p[1]) + (shape.y || 0)
        }));
        const minX = Math.min(...pts.map(p => p.x));
        const minY = Math.min(...pts.map(p => p.y));
        const maxX = Math.max(...pts.map(p => p.x));
        const maxY = Math.max(...pts.map(p => p.y));
        x = minX;
        y = minY;
        width = maxX - minX;
        height = maxY - minY;
      }

      const nodes = [];
      for (let row = 0; row < meshRows; row++) {
        const rowNodes = [];
        for (let col = 0; col < meshCols; col++) {
          rowNodes.push({
            x: x + (col / (meshCols - 1)) * width,
            y: y + (row / (meshRows - 1)) * height,
            color: fillColor || "#ffffff"
          });
        }
        nodes.push(rowNodes);
      }
      dispatch(updateShapePosition({
        id: shape.id,
        mesh: {
          rows: meshRows,
          cols: meshCols,
          nodes,
          mode: meshMode
        }
      }));
      return;
    }
    if (selectedTool === "PaintBucket") {
      const clickedShape = e.target;
      if (clickedShape && clickedShape.attrs.id) {
        const shape = shapes.find(s => s.id === clickedShape.attrs.id);
        if (!shape) return;

        const currentFill = shape.fill || "#fff";
        const targetFill = fillColor;

        function hexToRgb(hex) {
          hex = hex.replace(/^#/, "");
          if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
          const num = parseInt(hex, 16);
          return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255,
            a: 255
          };
        }
        function rgbToHsl({ r, g, b }) {
          r /= 255; g /= 255; b /= 255;
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          let h, s, l = (max + min) / 2;
          if (max === min) {
            h = s = 0;
          } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
          }
          return { h: h * 360, s: s * 100, l: l * 100 };
        }

        const rgbCurrent = hexToRgb(currentFill);
        const rgbTarget = hexToRgb(targetFill);
        const hslCurrent = rgbToHsl(rgbCurrent);
        const hslTarget = rgbToHsl(rgbTarget);

        let shouldFill = false;
        const t = paintBucketThreshold;
        let gapThreshold = 0;
        if (paintBucketCloseGaps === "small") gapThreshold = 5;
        else if (paintBucketCloseGaps === "medium") gapThreshold = 15;
        else if (paintBucketCloseGaps === "large") gapThreshold = 30;

        switch (paintBucketFillBy) {
          case "visible colors":
            shouldFill =
              Math.abs(rgbCurrent.r - rgbTarget.r) <= t &&
              Math.abs(rgbCurrent.g - rgbTarget.g) <= t &&
              Math.abs(rgbCurrent.b - rgbTarget.b) <= t;
            break;
          case "red":
            shouldFill = rgbCurrent.r === 255 && Math.abs(rgbTarget.r - 255) <= t;
            break;
          case "green":
            shouldFill = rgbCurrent.g === 255 && Math.abs(rgbTarget.g - 255) <= t;
            break;
          case "blue":
            shouldFill = rgbCurrent.b === 255 && Math.abs(rgbTarget.b - 255) <= t;
            break;
          case "hue":
            const hueDiff = Math.abs(hslCurrent.h - hslTarget.h);
            shouldFill = Math.min(hueDiff, 360 - hueDiff) <= t;
            break;
          case "saturation":
            shouldFill = Math.abs(hslCurrent.s - hslTarget.s) <= t;
            break;
          case "lightness":
            shouldFill = Math.abs(hslCurrent.l - hslTarget.l) <= t;
            break;
          case "alpha":
            shouldFill = Math.abs(rgbCurrent.a - rgbTarget.a) <= t;
            break;
          default:
            shouldFill = true;
        }

        if (shouldFill) {
          dispatch(
            updateShapePosition({ id: clickedShape.attrs.id, fill: fillColor })
          );


          if (shape.type === "Rectangle") {
            let points = [
              { x: shape.x, y: shape.y },
              { x: shape.x + shape.width, y: shape.y },
              { x: shape.x + shape.width, y: shape.y + shape.height },
              { x: shape.x, y: shape.y + shape.height }
            ];
            if (paintBucketGrowSink !== 0) {
              points = offsetPoints(points, paintBucketGrowSink);
            }
            console.log(paintBucketGrowSink, points)
            dispatch(addShape({
              id: `path-${Date.now()}`,
              type: "Path",
              path: `M ${points.map(p => `${p.x},${p.y}`).join(" L ")} Z`,
              stroke: "#000",
              strokeWidth: 2,
              fill: fillColor
            }));
          } else if (shape.type === "Circle") {

            const numPoints = 36;
            let points = [];
            for (let i = 0; i < numPoints; i++) {
              const angle = (2 * Math.PI * i) / numPoints;
              points.push({
                x: shape.x + shape.radius * Math.cos(angle),
                y: shape.y + shape.radius * Math.sin(angle)
              });
            }
            if (paintBucketGrowSink !== 0) {
              points = offsetPoints(points, paintBucketGrowSink);
            }
            dispatch(addShape({
              id: `path-${Date.now()}`,
              type: "Path",
              path: `M ${points.map(p => `${p.x},${p.y}`).join(" L ")} Z`,
              stroke: "#000",
              strokeWidth: 2,
              fill: fillColor
            }));
          } else if (shape.type === "Polygon" && Array.isArray(shape.points)) {
            let points = shape.points.map(p =>
              Array.isArray(p)
                ? { x: p[0] + (shape.x || 0), y: p[1] + (shape.y || 0) }
                : { x: p.x + (shape.x || 0), y: p.y + (shape.y || 0) }
            );
            if (paintBucketGrowSink !== 0) {
              points = offsetPoints(points, paintBucketGrowSink);
            }
            dispatch(addShape({
              id: `path-${Date.now()}`,
              type: "Path",
              path: `M ${points.map(p => `${p.x},${p.y}`).join(" L ")} Z`,
              stroke: "#000",
              strokeWidth: 2,
              fill: fillColor
            }));
          } else if (shape.type === "Star") {
            const numPoints = (shape.corners || 5) * 2;
            let points = [];
            for (let i = 0; i < numPoints; i++) {

              const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
              const radius = i % 2 === 0 ? shape.outerRadius : shape.innerRadius;
              points.push({
                x: shape.x + radius * Math.cos(angle),
                y: shape.y + radius * Math.sin(angle)
              });
            }
            if (paintBucketGrowSink !== 0) {
              points = offsetPoints(points, paintBucketGrowSink);
            }
            dispatch(addShape({
              id: `path-${Date.now()}`,
              type: "Path",
              path: `M ${points.map(p => `${p.x},${p.y}`).join(" L ")} Z`,
              stroke: "#000",
              strokeWidth: 2,
              fill: fillColor
            }));
          }

          else if (shape.type === "Pencil" && Array.isArray(shape.points)) {
            let points = shape.points.map(p =>
              Array.isArray(p)
                ? { x: p[0] + (shape.x || 0), y: p[1] + (shape.y || 0) }
                : { x: p.x + (shape.x || 0), y: p.y + (shape.y || 0) }
            );

            let shouldClose = false;
            if (gapThreshold > 0 && points.length > 2) {
              const first = points[0];
              const last = points[points.length - 1];
              const dist = Math.hypot(first.x - last.x, first.y - last.y);
              if (dist <= gapThreshold) {
                points.push({ ...first });
                shouldClose = true;
              }
            }

            if (paintBucketGrowSink !== 0) {
              points = offsetPoints(points, paintBucketGrowSink);
            }

            const pathStr = `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}${shouldClose ? " Z" : ""}`;

            dispatch(addShape({
              id: `path-${Date.now()}`,
              type: "Path",
              path: pathStr,
              stroke: "#000",
              strokeWidth: 2,
              fill: fillColor
            }));
          }

          else if (shape.type === "Calligraphy" && Array.isArray(shape.points)) {
            let points = shape.points.map(p => ({ x: p.x, y: p.y }));

            let shouldClose = false;
            if (gapThreshold > 0 && points.length > 2) {
              const first = points[0];
              const last = points[points.length - 1];
              const dist = Math.hypot(first.x - last.x, first.y - last.y);
              if (dist <= gapThreshold) {
                points.push({ ...first });
                shouldClose = true;
              }
            }

            if (paintBucketGrowSink !== 0) {
              points = offsetPoints(points, paintBucketGrowSink);
            }

            const pathStr = `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}${shouldClose ? " Z" : ""}`;

            dispatch(addShape({
              id: `path-${Date.now()}`,
              type: "Path",
              path: pathStr,
              stroke: "#000",
              strokeWidth: 2,
              fill: fillColor,
              listening: false
            }));
          }
        }
      }
    }
    if (selectedTool === "Gradient") {
      if (clickedShape && clickedShape.attrs && clickedShape.attrs.id) {
        dispatch(selectShape(clickedShape.attrs.id));
      }
      if (selectedShapeId) {
        const pos = e.target.getStage().getPointerPosition();
        const shape = shapes.find(s => s.id === selectedShapeId);
        if (!shape) return;
        setGradientDrag({
          start: { x: pos.x - shape.x, y: pos.y - shape.y },
          end: { x: pos.x - shape.x, y: pos.y - shape.y }
        });
      }
    }
    if (selectedTool === "ShapeBuilder") {
      console.log("Shape Builder Tool is active.");
      if (clickedShape && clickedShape.attrs && clickedShape.attrs.id) {
        console.log("Shape Builder Tool: Selecting shape with ID:", clickedShape.attrs.id);
        dispatch(selectShape(clickedShape.attrs.id));
      } else {
        console.log("Shape Builder Tool: No shape selected.");
        if (e.target === stage) {
          if (selectedTool !== "Node") {
            dispatch(clearSelection());
          }
        }
      }
      handleShapeBuilder(pointerPosition);
      return;
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
      const stage = e.target.getStage();
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;


      const clickedShape = e.target;
      const shapeId = clickedShape?.attrs?.id;

      if (eraserMode === "delete" && shapeId) {
        dispatch(deleteShape(shapeId));
        return;
      } else if (eraserMode === "cut") {

        isDrawingRef.current = true;
        setEraserLines([...eraserLines, { points: [pointerPosition.x, pointerPosition.y] }]);

        return;
      } else if (eraserMode === "clip") {

        isDrawingRef.current = true;
        setEraserLines([...eraserLines, { points: [pointerPosition.x, pointerPosition.y] }]);
        return;
      }
    }
    console.log("clicked eraser mode", eraserMode)

    if (e.target === stage) {
      if (selectedTool !== "Node") {
        dispatch(clearSelection());
      }
    }

    if (selectedTool === "Select") {
      const clickedShape = e.target;


      e.cancelBubble = true;

      if (clickedShape && clickedShape.attrs && clickedShape.attrs.id) {
        console.log("Selected Shape ID:", clickedShape.attrs.id);
        dispatch(selectShape(clickedShape.attrs.id));
      } else {
        console.log("No shape selected, clearing selection.");
        if (selectedTool !== "Node") {
          dispatch(clearSelection());
        }
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
        } else if (shape.type === "Bezier") {
          if (Array.isArray(shape.points)) {
            nodes = shape.points.map(p =>
              Array.isArray(p)
                ? { x: p[0], y: p[1] }
                : { x: p.x, y: p.y }
            );
          } else {
            nodes = [];
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
        spokeRatio: 0.5,
        rounded: 0,
        randomized: 0,
        cornerRadius: 0,
        randomOffsets: [],
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
        id: `polygon-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
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
      else if (selectedTool === "Bezier" && bezierOption === "Straight Segments") {
        if (
          straightPoints.length > 1 &&
          Math.hypot(x - straightPoints[0].x, y - straightPoints[0].y) < 10
        ) {

          let pathData = straightPoints
            .map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
            .join(" ");
          pathData += " Z";
          dispatch(
            addShape({
              id: `straight-${Date.now()}`,
              type: "Path",
              path: pathData,
              stroke: strokeColor,
              strokeWidth: 2,
              fill: fillColor || "transparent",
            })
          );
          dispatch(clearStraightPoints());
          setIsDrawing(false);
          setIsShapeClosed(false);
          return;
        }
        dispatch(addStraightPoint({ x, y }));
        setIsDrawing(true);
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
        points: [{ x, y }],
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
          textDirection: "ltr",
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

  const handleDragMove = (e, index, shapeId) => {
    const node = e.target;
    const pos = { x: e.target.x(), y: e.target.y(), id: shapeId };
    const snapped = getSnappedPosition(pos, shapes, grids, guides);
    // Update shape position
    dispatch(updateShapePosition({ id: shapeId, x: snapped.x, y: snapped.y }));

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
    dispatch(clearBSplinePoints());
    dispatch(clearParaxialPoints());
    dispatch(clearStraightPoints());
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
  const eraserMass = useSelector((state) => state.tool.eraserMass || 0);

  const lerp = (a, b, t) => a + (b - a) * t;
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
    // if (selectedTool === "Select" && dragStartPos && pointerPosition) {
    //   setDragSelectRect({
    //     x: Math.min(dragStartPos.x, pointerPosition.x),
    //     y: Math.min(dragStartPos.y, pointerPosition.y),
    //     width: Math.abs(pointerPosition.x - dragStartPos.x),
    //     height: Math.abs(pointerPosition.y - dragStartPos.y),
    //   });
    // }
    if (selectedTool === "Gradient" && gradientDrag && selectedShapeId) {
      const pos = e.target.getStage().getPointerPosition();
      const shape = shapes.find(s => s.id === selectedShapeId);
      if (!shape) return;
      setGradientDrag(drag => ({
        ...drag,
        end: { x: pos.x - shape.x, y: pos.y - shape.y }
      }));
    }
    if (selectedTool === "3DBox" && boxStart) {
      console.log("3DBox mouse move");
      const pos = getPointerPosition(e);
      setNewShape({
        type: "3DBox",
        x: boxStart.x,
        y: boxStart.y,
        width: pos.x - boxStart.x,
        height: pos.y - boxStart.y,
        fill: fillColor || "#e0e0e0",
        stroke: strokeColor || "#222",
        strokeWidth: 2,
      });
    }
    if (selectedTool === "Connector" && connectorDrag) {
      const pointer = getAdjustedPointerPosition(e.target.getStage(), position, scale);
      setConnectorDrag(drag => drag ? { ...drag, currentPos: { x: pointer.x, y: pointer.y } } : null);
    }
    if (selectedTool === "Tweak" && isMouseDown) {

      const radius = 100;
      const affectedShapes = shapes.filter(shape => {
        if (shape.x !== undefined && shape.y !== undefined) {
          const dx = x - shape.x;
          const dy = y - shape.y;
          return Math.sqrt(dx * dx + dy * dy) < radius;
        }
        return false;
      });
      handleTweakAction({ x, y }, affectedShapes);
    }
    if (isDrawingRef.current && selectedTool === "Eraser") {
      const lastLine = eraserLines[eraserLines.length - 1];
      let lastX = x, lastY = y;
      if (lastLine.points.length >= 2) {
        lastX = lastLine.points[lastLine.points.length - 2];
        lastY = lastLine.points[lastLine.points.length - 1];
      }

      const massFactor = 1 - eraserMass;
      const newX = lerp(lastX, x, massFactor);
      const newY = lerp(lastY, y, massFactor);

      lastLine.points = lastLine.points.concat([newX, newY]);
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
      if (selectedTool === "Mesh" && isDrawing && meshStart) {
        const stage = e.target.getStage();
        const pointer = getAdjustedPointerPosition(stage, position, scale);
        setMeshPreview({
          x: Math.min(meshStart.x, pointer.x),
          y: Math.min(meshStart.y, pointer.y),
          width: Math.abs(pointer.x - meshStart.x),
          height: Math.abs(pointer.y - meshStart.y),
        });
      }
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
      } if (isDrawing && newShape && newShape.type === "Pencil") {
        if (pressureEnabled) {
          let pressure = 1;
          if (e.evt && typeof e.evt.pressure === "number") {
            pressure = e.evt.pressure;
          }
          const width = pressureMin + (pressureMax - pressureMin) * pressure;
          setNewShape((prev) => ({
            ...prev,
            points: [...prev.points, [x, y, width]],
          }));
        } else {
          setNewShape((prev) => ({
            ...prev,
            points: [...prev.points, { x, y }],
          }));
        }
      } else if (isDrawing && newShape && newShape.type === "Calligraphy") {
        const point = { x, y };
        const lastPoint = newShape.points[newShape.points.length - 1];
        if (lastPoint) {
          const dx = x - lastPoint.x;
          const dy = y - lastPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);


          const speed = distance / (Date.now() - (lastPoint.timestamp || Date.now()));
          const adjustedWidth = calligraphyWidth * (1 + calligraphyThinning * speed);



          const inertia = Math.max(0, Math.min(calligraphyMass, 10)) / 10;
          const follow = 1 - inertia;

          point.x = lastPoint.x + (x - lastPoint.x) * follow;
          point.y = lastPoint.y + (y - lastPoint.y) * follow;
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

          const minWidth = 0.5;
          const thinningFactor = 2 - calligraphyThinning * 2;
          const maxWidth = Math.max(minWidth, calligraphyWidth * thinningFactor);
          point.strokeWidth = Math.random() * (maxWidth - minWidth) + minWidth;

          console.log("Wiggly Point:", point);
        } else if (calligraphyOption === "Marker") {
          console.log("Marker logic triggered");




          const minWidth = 1;
          const thinningFactor = 1 - calligraphyThinning;
          const maxWidth = Math.max(minWidth, calligraphyWidth * thinningFactor);
          point.strokeWidth = maxWidth;

          console.log("Marker Point:", point);
        } else if (calligraphyOption === "Brush") {
          console.log("Brush logic triggered");
          const lastPoint = newShape.points[newShape.points.length - 1];
          if (lastPoint) {
            const dx = x - lastPoint.x;
            const dy = y - lastPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);


            const movementAngle = Math.atan2(dy, dx);


            const minWidth = 1;
            const thinningFactor = 2 - calligraphyThinning * 2;
            const baseWidth = Math.max(0.5, calligraphyWidth * thinningFactor);


            const randomFactor = 0.2;
            const ellipseWidth = baseWidth + (Math.random() - 0.5) * baseWidth * randomFactor;
            const ellipseHeight = baseWidth * 0.5 + (Math.random() - 0.5) * baseWidth * 0.5 * randomFactor;


            const positionOffset = 1;
            const smoothedX = (lastPoint.x + x) / 2 + (Math.random() - 0.5) * positionOffset;
            const smoothedY = (lastPoint.y + y) / 2 + (Math.random() - 0.5) * positionOffset;




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
            const thinningFactor = 1 - calligraphyThinning;
            const adjustedWidth = Math.max(minWidth, calligraphyWidth * thinningFactor);

            const speedFactor = Math.max(1, 10 - distance);
            const baseWidth = Math.min(adjustedWidth, Math.max(minWidth, adjustedWidth / speedFactor));


            const nibAngle = Math.PI / 4;
            const angleDiff = movementAngle - nibAngle;


            const squeezeFactor = 0.5;
            const squeezedWidth = baseWidth * (1 - squeezeFactor * Math.abs(Math.sin(angleDiff)));


            const smoothedX = (lastPoint.x + x) / 2;
            const smoothedY = (lastPoint.y + y) / 2;




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
            const thinningFactor = 1 - calligraphyThinning;
            const maxWidth = calligraphyWidth * 3 * thinningFactor;
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
  function downsamplePoints(points, maxPoints = 200) {
    if (!Array.isArray(points) || points.length <= maxPoints) return points;
    const factor = Math.ceil(points.length / maxPoints);
    return points.filter((_, i) => i % factor === 0);
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
      return shape.points.map((point) => ({ ...point }));
    } else if (shape.type === "Pencil") {
      return shape.points.map((point) =>
        Array.isArray(point)
          ? { x: point[0], y: point[1] }
          : { x: point.x, y: point.y }
      );
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
    } else if (shape.type === "Bezier") {
      if (Array.isArray(shape.points)) {
        return shape.points.map(p =>
          Array.isArray(p)
            ? { x: p[0], y: p[1] }
            : { x: p.x, y: p.y }
        );
      }
      return [];
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
      if (selectedShape && selectedShape.type === "Polygon") {
        let newPoints;
        if (
          typeof selectedShape.x === "number" &&
          typeof selectedShape.y === "number"
        ) {

          newPoints = updatedPoints.map((point) => ({
            x: point.x - selectedShape.x,
            y: point.y - selectedShape.y,
          }));
        } else {

          newPoints = updatedPoints.map((point) => ({
            x: point.x,
            y: point.y,
          }));
        }
        dispatch(
          updateShapePosition({
            id: selectedShape.id,
            points: newPoints,
          })
        );
        dispatch(setControlPoints(updatedPoints));
      }
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
      } else if (selectedShape && selectedShape.type === "Bezier") {
        dispatch(updateShapePosition({
          id: selectedShape.id,
          points: updatedPoints,
        }));
        dispatch(setControlPoints(updatedPoints));
      } else if (selectedShape && selectedShape.type === "Pencil") {
        const newPoints = updatedPoints.map((point) => ({ x: point.x, y: point.y }));
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
  function bufferLineToPolygon(points, width) {
    if (points.length < 4) return [points];
    const left = [];
    const right = [];
    for (let i = 0; i < points.length - 2; i += 2) {
      const x1 = points[i], y1 = points[i + 1];
      const x2 = points[i + 2], y2 = points[i + 3];
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      left.push([x1 + nx * width / 2, y1 + ny * width / 2]);
      right.push([x1 - nx * width / 2, y1 - ny * width / 2]);
    }
    const lx = points[points.length - 2], ly = points[points.length - 1];
    left.push([lx, ly]);
    right.push([lx, ly]);
    return [left.concat(right.reverse())];
  }
  const handleMouseUp = (e) => {
    if (isDrawingRef.current && selectedTool === "Eraser" && eraserMode === "cut") {
      isDrawingRef.current = false;
      if (eraserLines.length > 0) {
        const lastEraserLine = eraserLines[eraserLines.length - 1];
        const eraserPoly = bufferLineToPolygon(lastEraserLine.points, eraserWidth);

        shapes.forEach((shape) => {
          const shapePoly = shapeToPolygon(shape);
          if (!shapePoly) return;

          const poly = shapePoly[0];
          if (poly.length < 3) return;
          const first = poly[0];
          const last = poly[poly.length - 1];
          if (first[0] !== last[0] || first[1] !== last[1]) {
            poly.push([...first]);
          }

          const diff = polygonClipping.difference([poly], eraserPoly);


          if (!diff || diff.length === 0 || (diff.length === 1 && diff[0][0].length < 3)) {
            dispatch(deleteShape(shape.id));
            return;
          }


          dispatch(deleteShape(shape.id));
          diff.forEach((polyPart, i) => {
            if (polyPart[0].length > 2) {
              dispatch(addShape({
                id: `cut-${shape.id}-${i}-${Date.now()}`,
                type: "Polygon",
                points: polyPart[0].map(([x, y]) => ({ x, y })),
                fill: shape.fill,
                stroke: shape.stroke,
                strokeWidth: shape.strokeWidth,
                closed: true,
              }));
            }
          });
        });
        setEraserLines([]);
      }
    }
    // if (selectedTool === "Select" && dragSelectRect) {
    //   if (dragSelectRect.width > 2 && dragSelectRect.height > 2) {
    //     const selectedIds = shapes
    //       .filter(shape => isShapeInRect(shape, dragSelectRect))
    //       .map(shape => shape.id);
    //     dispatch(selecteAllShapes(selectedIds));
    //   }
    //   setDragSelectRect(null);
    //   setDragStartPos(null);
    // }
    if (selectedTool === "3DBox" && newShape) {
      console.log("3DBox mouse up, adding shape:", newShape);
      dispatch(addShape({ ...newShape, id: `box-${Date.now()}` }));
      setBoxStart(null);
      setNewShape(null);
    }
    if (isDrawingRef.current && selectedTool === "Eraser" && eraserMode === "clip") {
      isDrawingRef.current = false;
      if (eraserLines.length > 0) {
        const lastEraserLine = eraserLines[eraserLines.length - 1];
        const eraserPoly = bufferLineToPolygon(lastEraserLine.points, eraserWidth);

        shapes.forEach((shape) => {
          const shapePoly = shapeToPolygon(shape);
          if (!shapePoly) return;

          const poly = shapePoly[0];
          if (poly.length < 3) return;
          const first = poly[0];
          const last = poly[poly.length - 1];
          if (first[0] !== last[0] || first[1] !== last[1]) {
            poly.push([...first]);
          }


          const clipped = polygonClipping.difference([poly], eraserPoly);


          if (!clipped || clipped.length === 0 || (clipped.length === 1 && clipped[0][0].length < 3)) {
            dispatch(updateShapePosition({ id: shape.id, visible: false }));
            return;
          }


          dispatch(deleteShape(shape.id));


          clipped.forEach((polyPart, i) => {
            if (polyPart[0].length > 2) {
              dispatch(addShape({
                id: `clip-${shape.id}-${i}-${Date.now()}`,
                type: "Polygon",
                points: polyPart[0].map(([x, y]) => ({ x, y })),
                fill: shape.fill,
                stroke: shape.stroke,
                strokeWidth: shape.strokeWidth,
                closed: true,
                clipped: true,
              }));
            }
          });
        });
        setEraserLines([]);
      }
    }
    function clampToRect(x, y, width, height) {
      return {
        x: Math.max(0, Math.min(width, x)),
        y: Math.max(0, Math.min(height, y)),
      };
    }

    if (selectedTool === "Mesh" && isDrawing && meshStart && meshPreview) {

      const { x, y, width, height } = meshPreview;
      const nodes = [];
      for (let row = 0; row < meshRows; row++) {
        const rowNodes = [];
        for (let col = 0; col < meshCols; col++) {
          rowNodes.push({
            x: x + (col / (meshCols - 1)) * width,
            y: y + (row / (meshRows - 1)) * height,
            color: fillColor || "#ffffff"
          });
        }
        nodes.push(rowNodes);
      }
      const overlapsShape = shapes.some(shape => {
        if (shape.type === "Rectangle") {

          return !(
            meshPreview.x + meshPreview.width < shape.x ||
            meshPreview.x > shape.x + shape.width ||
            meshPreview.y + meshPreview.height < shape.y ||
            meshPreview.y > shape.y + shape.height
          );
        }

        return false;
      });
      if (!overlapsShape) {
        setIsDrawing(false);
        setMeshStart(null);
        setMeshPreview(null);
        setNewShape(null);
        return;
      }
      dispatch(addShape({
        id: `mesh-${Date.now()}`,
        type: "Mesh",
        x,
        y,
        rows: meshRows,
        cols: meshCols,
        nodes,
        mode: meshMode
      }));
      setIsDrawing(false);
      setMeshStart(null);
      setMeshPreview(null);
      setNewShape(null);
      return;
    }
    if (selectedTool === "Connector" && connectorDrag) {
      const pointer = getAdjustedPointerPosition(e.target.getStage(), position, scale);

      const endShape = shapes.find(s =>
        s.id !== connectorDrag.startId &&
        isPointerInsideShape(s, pointer)
      );
      if (endShape) {
        let endOffset = { x: pointer.x - endShape.x, y: pointer.y - endShape.y };
        dispatch(addShape({
          id: `connector-${Date.now()}`,
          type: "Connector",
          startId: connectorDrag.startId,
          endId: endShape.id,
          startOffset: connectorDrag.startOffset,
          endOffset
        }));
      }
      setConnectorDrag(null);
    }
    if (selectedTool === "Gradient" && gradientDrag && selectedShapeId) {
      const shape = shapes.find(s => s.id === selectedShapeId);
      if (!shape) return;

      const localStart = clampToRect(gradientDrag.start.x, gradientDrag.start.y, shape.width, shape.height);
      const localEnd = clampToRect(gradientDrag.end.x, gradientDrag.end.y, shape.width, shape.height);

      if (gradientType === "linear") {
        dispatch(updateShapePosition({
          id: selectedShapeId,
          [applyTo]: {
            ...(shape[applyTo] || {}),
            type: "linear-gradient",
            start: localStart,
            end: localEnd,
            colors: (shape[applyTo]?.colors && shape[applyTo]?.colors.length > 0)
              ? shape[applyTo].colors
              : [
                { color: (applyTo === "fill" ? (shape.fill || "#000") : (shape.stroke || "#000")), pos: 0 },
                { color: "#ffffff", pos: 1 }
              ]
          },
          ...(applyTo === "stroke"
            ? { fill: "transparent" }
            : { stroke: typeof shape.stroke === "object" ? "#000" : shape.stroke }),
          gradientTarget: applyTo,
        }));
      } else if (gradientType === "radial") {

        const center = localStart;
        const dx = localEnd.x - localStart.x;
        const dy = localEnd.y - localStart.y;
        const radius = Math.sqrt(dx * dx + dy * dy);

        dispatch(updateShapePosition({
          id: selectedShapeId,
          [applyTo]: {
            ...(shape[applyTo] || {}),
            type: "radial-gradient",
            center,
            radius,
            colors: (shape[applyTo]?.colors && shape[applyTo]?.colors.length > 0)
              ? shape[applyTo].colors
              : (
                applyTo === "stroke"
                  ? [
                    { color: typeof shape.stroke === "string" ? shape.stroke : "#000", pos: 0 },
                    { color: typeof shape.stroke === "string" ? shape.stroke : "#000", pos: 1 }
                  ]
                  : [
                    { color: typeof shape.fill === "string" ? shape.fill : "#000", pos: 0 },
                    { color: "#ffffff", pos: 1 }
                  ]
              )
          },
          ...(applyTo === "stroke"
            ? { fill: "transparent" }
            : { stroke: typeof shape.stroke === "object" ? "#000" : shape.stroke }),
          gradientTarget: applyTo,
        }));
      }
      setGradientDrag(null);
    } if (isDrawingRef.current && selectedTool === "Eraser" && eraserMode === "clip") {
      isDrawingRef.current = false;
      if (eraserLines.length > 0) {
        const lastEraserLine = eraserLines[eraserLines.length - 1];
        shapes.forEach((shape) => {
          if (!shape.points) return;
          const shapePoints = Array.isArray(shape.points[0])
            ? shape.points
            : shape.points.map((p) => [p.x, p.y]);
          const isErased = shapePoints.some(([sx, sy]) =>
            lastEraserLine.points.some((_, i, arr) =>
              i % 2 === 0 &&
              Math.hypot(arr[i] - sx, arr[i + 1] - sy) < 10
            )
          );
          if (isErased) {
            dispatch(updateShapeVisibility({ id: shape.id, visible: false }));
          }
        });
        setEraserLines([]);
      }
    } else if (isDrawingRef.current && selectedTool === "Eraser") {
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




        console.log("Finalizing Pencil Shape:", smoothedPoints);
        finalPoints = downsamplePoints(finalPoints, 5000);
        if (!pressureEnabled) {
          if (pencilOption !== "None") {
            fillColor = strokeColor;
            isClosed = true;




          }
          finalPoints = smoothShape(finalPoints, pencilSmoothing);
          finalPoints = downsamplePoints(finalPoints, 5000);
        } else {

          fillColor = "transparent";
          isClosed = false;
        }
        let pencilStrokeWidth = 2;
        if (pressureEnabled) {
          const points = newShape.points;
          const left = [];
          const right = [];
          for (let i = 0; i < points.length - 1; i++) {
            const [x1, y1] = points[i];
            const [x2, y2] = points[i + 1];
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = -dy / len;
            const ny = dx / len;
            const width = 40;
            left.push([x1 + nx * width / 2, y1 + ny * width / 2]);
            right.push([x1 - nx * width / 2, y1 - ny * width / 2]);
          }

          const [xLast, yLast] = points[points.length - 1];
          left.push([xLast, yLast]);
          right.push([xLast, yLast]);
          const polygonPoints = [...left, ...right.reverse()];
          const pathData = polygonPoints.map(
            ([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)
          ).join(" ") + " Z";
          dispatch(
            addShape({
              id: newShape.id,
              type: "BrushStroke",
              points: newShape.points,
              strokeColor: strokeColor,
            })
          );
          setActiveTab("layers");
          setNewShape(null);
          setIsDrawing(false);
          return;
        }
        dispatch(
          addShape({
            id: newShape.id,
            type: "Pencil",
            points: finalPoints.map(p =>
              Array.isArray(p) ? { x: p[0], y: p[1] } : { x: p.x, y: p.y }
            ),
            strokeColor: strokeColor,
            fill: fillColor || "black",
            closed: isClosed,
            strokeWidth: pencilStrokeWidth,
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
        if (pressureEnabled) {

          dispatch(
            addShape({
              id: newShape.id,
              type: "BrushStroke",
              points: newShape.points,
              strokeColor: strokeColor,
            })
          );
          setActiveTab("layers");
          setNewShape(null);
          setIsDrawing(false);
          return;
        }
        let fillColor = pencilOption === "None" ? "transparent" : strokeColor;
        let isClosed = pencilOption !== "None";

        if (pencilOption !== "None") {
          fillColor = fillColor || strokeColor;
          isClosed = true;
        }

        const smoothedPoints = smoothShape(newShape.points, pencilSmoothing);
        let finalPoints = smoothedPoints;




        finalPoints = downsamplePoints(finalPoints, 5000);

        dispatch(
          addShape({
            id: newShape.id,
            type: "Pencil",
            points: finalPoints.map(p =>
              Array.isArray(p) ? { x: p[0], y: p[1] } : { x: p.x, y: p.y }
            ),
            strokeColor: strokeColor,
            fill: fillColor || "black",
            closed: isClosed,
            strokeWidth: 2,
          })
        );
        setActiveTab("layers");
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
      } else if (isDrawing && selectedTool === "Bezier" && bezierOption === "Straight Segments") {
        if (straightPoints.length < 2) {
          console.warn("Not enough points to create straight segments.");
          return;
        }
        let pathData = straightPoints
          .map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
          .join(" ");
        if (isShapeClosed) {
          pathData += " Z";
        }
        dispatch(
          addShape({
            id: `straight-${Date.now()}`,
            type: "Path",
            path: pathData,
            stroke: strokeColor,
            strokeWidth: 2,
            fill: isShapeClosed ? fillColor : "transparent",
          })
        );
        dispatch(clearStraightPoints());
        setIsDrawing(false);
        setIsShapeClosed(false);
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
    if (Array.isArray(strokeStyle)) return strokeStyle;
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
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scale({ x: 1, y: 1 });

    const shape = shapes.find(s => s.id === shapeId);
    if (shape?.type === "Circle") {
      const averageScale = (scaleX + scaleY) / 2;
      const newRadius = Math.max(1, shape.radius * averageScale);

      dispatch(updateShapePosition({
        id: shapeId,
        x: node.x(),
        y: node.y(),
        radius: newRadius,
        skewX: node.skewX(),
        skewY: node.skewY(),
      }));
    } else {
      const newWidth = node.width() * scaleX;
      const newHeight = node.height() * scaleY;

      dispatch(updateShapePosition({
        id: shapeId,
        x: node.x(),
        y: node.y(),
        width: newWidth,
        height: newHeight,
        skewX: node.skewX(),
        skewY: node.skewY(),
      }));
    }
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

    if (selectedTool === "Bezier" && bezierOption === "Straight Segments" && straightPoints.length > 1) {
      let pathData = straightPoints
        .map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
        .join(" ");
      if (isShapeClosed) pathData += " Z";
      dispatch(
        addShape({
          id: `straight-${Date.now()}`,
          type: "Path",
          path: pathData,
          stroke: strokeColor,
          strokeWidth: 2,
          fill: isShapeClosed ? fillColor : "transparent",
        })
      );
      dispatch(clearStraightPoints());
      setIsDrawing(false);
      setIsShapeClosed(false);
      return;
    }
  };
  function isShapeInRect(shape, rect) {
    if (shape.type === "Rectangle") {
      return (
        shape.x >= rect.x &&
        shape.x + shape.width <= rect.x + rect.width &&
        shape.y >= rect.y &&
        shape.y + shape.height <= rect.y + rect.height
      );
    }
    if (shape.type === "Circle") {
      return (
        shape.x - shape.radius >= rect.x &&
        shape.x + shape.radius <= rect.x + rect.width &&
        shape.y - shape.radius >= rect.y &&
        shape.y + shape.radius <= rect.y + rect.height
      );
    }
    if (Array.isArray(shape.points)) {
      return shape.points.every(p => {
        const px = typeof p.x === "number" ? p.x + (shape.x || 0) : p[0] + (shape.x || 0);
        const py = typeof p.y === "number" ? p.y + (shape.y || 0) : p[1] + (shape.y || 0);
        return (
          px >= rect.x &&
          px <= rect.x + rect.width &&
          py >= rect.y &&
          py <= rect.y + rect.height
        );
      });
    }
    if (shape.type === "Star") {
      const numPoints = (shape.corners || 5) * 2;
      return Array.from({ length: numPoints }).every((_, i) => {
        const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
        const r = i % 2 === 0 ? shape.outerRadius : shape.innerRadius;
        const px = shape.x + r * Math.cos(angle);
        const py = shape.y + r * Math.sin(angle);
        return (
          px >= rect.x &&
          px <= rect.x + rect.width &&
          py >= rect.y &&
          py <= rect.y + rect.height
        );
      });
    }
    return false;
  }
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
      if (e.ctrlKey && e.key === "a") {
        e.preventDefault();
        dispatch(selecteAllShapes());
      }
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedShapeIds.length > 0
      ) {
        dispatch(removeShapes(selectedShapeIds));
      }
      if (e.key === "Escape") {
        dispatch(deselectAllShapes());
      }
      if (e.ctrlKey && e.key === "c") {
        dispatch(copy());
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
  useLayoutEffect(() => {
    if (!transformerRef.current || !layerRef.current) return;

    requestAnimationFrame(() => {
      const selectedNodes = selectedShapeIds
        .map((id) => shapeRefs.current[id])
        .filter(Boolean);

      if (selectedNodes.length === selectedShapeIds.length && selectedNodes.length > 0) {
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
  const applyTo = selectedShape?.gradientTarget || "fill";
  const gradientObj = selectedShape ? selectedShape[applyTo] : null;
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
    } else if (shape.type === "Bezier") {
      if (Array.isArray(shape.points)) {
        return shape.points.map(p =>
          Array.isArray(p)
            ? { x: p[0], y: p[1] }
            : { x: p.x, y: p.y }
        );
      }
      return [];
    }
    return [];
  };
  function generatePolygonPath(points) {
    if (!points || points.length === 0) return "";

    let path = "";
    for (let i = 0; i < points.length; i++) {
      const curr = points[i];
      const prev = points[(i - 1 + points.length) % points.length];
      const next = points[(i + 1) % points.length];

      if (curr.cornerLPE && curr.cornerLPE.radius > 0) {

        const v1 = { x: curr.x - prev.x, y: curr.y - prev.y };
        const v2 = { x: next.x - curr.x, y: next.y - curr.y };
        const len1 = Math.hypot(v1.x, v1.y);
        const len2 = Math.hypot(v2.x, v2.y);


        const p1 = {
          x: curr.x - (v1.x / len1) * curr.cornerLPE.radius,
          y: curr.y - (v1.y / len1) * curr.cornerLPE.radius,
        };
        const p2 = {
          x: curr.x + (v2.x / len2) * curr.cornerLPE.radius,
          y: curr.y + (v2.y / len2) * curr.cornerLPE.radius,
        };

        if (i === 0) {
          path += `M ${p1.x} ${p1.y} `;
        } else {
          path += `L ${p1.x} ${p1.y} `;
        }

        path += `A ${curr.cornerLPE.radius} ${curr.cornerLPE.radius} 0 0 1 ${p2.x} ${p2.y} `;
      } else {
        if (i === 0) {
          path += `M ${curr.x} ${curr.y} `;
        } else {
          path += `L ${curr.x} ${curr.y} `;
        }
      }
    }
    path += "Z";
    return path;
  }
  useEffect(() => {
    if (!isSnappingEnabled) {
      setSnappingLines([]);
    }
  }, [isSnappingEnabled]);
  const snapToObjects = (node, objects, threshold = 10) => {
    let snappedX = node.x();
    let snappedY = node.y();
    let snapped = false;
    const newSnappingLines = [];

    objects.forEach((obj) => {

      if (Math.abs(node.x() - obj.x) < threshold) {
        snappedX = obj.x;
        snapped = true;
        newSnappingLines.push({
          points: [obj.x, 0, obj.x, height],
          orientation: "vertical",
        });
      }

      if (Math.abs(node.x() + node.width() - (obj.x + obj.width)) < threshold) {
        snappedX = obj.x + obj.width - node.width();
        snapped = true;
        newSnappingLines.push({
          points: [obj.x + obj.width, 0, obj.x + obj.width, height],
          orientation: "vertical",
        });
      }

      if (Math.abs(node.x() + node.width() / 2 - (obj.x + obj.width / 2)) < threshold) {
        snappedX = obj.x + obj.width / 2 - node.width() / 2;
        snapped = true;
        newSnappingLines.push({
          points: [obj.x + obj.width / 2, 0, obj.x + obj.width / 2, height],
          orientation: "vertical",
        });
      }

      if (Math.abs(node.y() - obj.y) < threshold) {
        snappedY = obj.y;
        snapped = true;
        newSnappingLines.push({
          points: [0, obj.y, width, obj.y],
          orientation: "horizontal",
        });
      }

      if (Math.abs(node.y() + node.height() - (obj.y + obj.height)) < threshold) {
        snappedY = obj.y + obj.height - node.height();
        snapped = true;
        newSnappingLines.push({
          points: [0, obj.y + obj.height, width, obj.y + obj.height],
          orientation: "horizontal",
        });
      }

      if (Math.abs(node.y() + node.height() / 2 - (obj.y + obj.height / 2)) < threshold) {
        snappedY = obj.y + obj.height / 2 - node.height() / 2;
        snapped = true;
        newSnappingLines.push({
          points: [0, obj.y + obj.height / 2, width, obj.y + obj.height / 2],
          orientation: "horizontal",
        });
      }
    });

    setSnappingLines(newSnappingLines);


    if (snapped && node.id()) {
      dispatch(updateShapePosition({ id: node.id(), x: snappedX, y: snappedY }));

      node.x(snappedX);
      node.y(snappedY);
    }
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
  function isPointerInsideShape(shape, pointer) {
    if (shape.type === "Rectangle") {
      return (
        pointer.x >= shape.x &&
        pointer.x <= shape.x + shape.width &&
        pointer.y >= shape.y &&
        pointer.y <= shape.y + shape.height
      );
    }
    if (shape.type === "Circle") {
      const dx = pointer.x - shape.x;
      const dy = pointer.y - shape.y;
      return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
    }
    if (shape.type === "Polygon" && Array.isArray(shape.points)) {

      let inside = false;
      const pts = shape.points.map(p =>
        Array.isArray(p) ? { x: p[0] + (shape.x || 0), y: p[1] + (shape.y || 0) } : { x: p.x + (shape.x || 0), y: p.y + (shape.y || 0) }
      );
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        if (
          (pts[i].y > pointer.y) !== (pts[j].y > pointer.y) &&
          pointer.x < ((pts[j].x - pts[i].x) * (pointer.y - pts[i].y)) / (pts[j].y - pts[i].y) + pts[i].x
        ) {
          inside = !inside;
        }
      }
      return inside;
    }

    if (shape.type === "Star") {

      const numPoints = (shape.corners || 5) * 2;
      const pts = [];
      const rotation = -Math.PI / 2;
      for (let i = 0; i < numPoints; i++) {
        const angle = (Math.PI * 2 * i) / numPoints + rotation;
        const radius = i % 2 === 0 ? shape.outerRadius : shape.innerRadius;
        pts.push({ x: shape.x + radius * Math.cos(angle), y: shape.y + radius * Math.sin(angle) });
      }

      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        if (
          (pts[i].y > pointer.y) !== (pts[j].y > pointer.y) &&
          pointer.x < ((pts[j].x - pts[i].x) * (pointer.y - pts[i].y)) / (pts[j].y - pts[i].y) + pts[i].x
        ) {
          inside = !inside;
        }
      }
      return inside;
    }
    if ((shape.type === "Pencil" || shape.type === "Calligraphy") && Array.isArray(shape.points)) {
      for (let i = 1; i < shape.points.length; i++) {
        const p0 = shape.points[i - 1];
        const p1 = shape.points[i];

        const x0 = (Array.isArray(p0) ? p0[0] : p0.x) + (shape.x || 0);
        const y0 = (Array.isArray(p0) ? p0[1] : p0.y) + (shape.y || 0);
        const x1 = (Array.isArray(p1) ? p1[0] : p1.x) + (shape.x || 0);
        const y1 = (Array.isArray(p1) ? p1[1] : p1.y) + (shape.y || 0);

        const dx = x1 - x0;
        const dy = y1 - y0;
        const len2 = dx * dx + dy * dy;
        let t = ((pointer.x - x0) * dx + (pointer.y - y0) * dy) / (len2 || 1);
        t = Math.max(0, Math.min(1, t));
        const projX = x0 + t * dx;
        const projY = y0 + t * dy;
        const dist = Math.hypot(pointer.x - projX, pointer.y - projY);
        if (dist < 6) return true;
      }
      return false;
    }
    return false;
  }
  const handleShapeBuilder = (pointerPosition) => {
    console.log("Pointer Position:", pointerPosition);

    const overlappingShapes = shapes.filter(shape => isPointerInsideShape(shape, pointerPosition));
    const selectedShapesList = shapes.filter(shape => selectedShapeIds.includes(shape.id));


    const shapesToUse = selectedShapesList.length > 1 ? selectedShapesList : overlappingShapes;
    if (selectedTool === "ShapeBuilder" && shapesToUse.length > 1) {

      const polygons = shapesToUse.map(shapeToPolygon).filter(Boolean);


      const regions = polygonClipping.xor(...polygons);


      setShapeBuilderRegions(regions);
      setSelectedRegionIndices([]);
      setShapeBuilderShapes(shapesToUse);
      return;
    }


    if (overlappingShapes.length > 1) {
      if (shapeBuilderMode === "combine") {
        combineShapes(overlappingShapes);
      } else if (shapeBuilderMode === "subtract") {
        subtractShapes(overlappingShapes);
      }
    } else if (overlappingShapes.length === 1) {
      dispatch(selectShape(overlappingShapes[0].id));
    } else {
      if (selectedTool !== "Node") {
        dispatch(clearSelection());
      }
    }
  };
  function shapeToPolygon(shape) {

    if (shape.type === "Polygon" && Array.isArray(shape.points)) {
      return [shape.points.map(p => [p.x + (shape.x || 0), p.y + (shape.y || 0)])];
    }

    if (shape.type === "Rectangle") {
      return [[
        [shape.x, shape.y],
        [shape.x + shape.width, shape.y],
        [shape.x + shape.width, shape.y + shape.height],
        [shape.x, shape.y + shape.height],
      ]];
    }

    if (shape.type === "Circle") {
      const numPoints = 36;
      const points = [];
      for (let i = 0; i < numPoints; i++) {
        const angle = (2 * Math.PI * i) / numPoints;
        points.push([
          shape.x + shape.radius * Math.cos(angle),
          shape.y + shape.radius * Math.sin(angle)
        ]);
      }
      return [points];
    }

    if (shape.type === "Star") {
      const numPoints = (shape.corners || 5) * 2;
      const points = [];
      const rotation = -Math.PI / 2;
      for (let i = 0; i < numPoints; i++) {
        const angle = (Math.PI * 2 * i) / numPoints + rotation;
        const radius = i % 2 === 0 ? shape.outerRadius : shape.innerRadius;
        points.push([
          shape.x + radius * Math.cos(angle),
          shape.y + radius * Math.sin(angle)
        ]);
      }
      return [points];
    }
    if (shape.type === "Pencil" && Array.isArray(shape.points)) {

      if (shape.closed || shape.points.length > 2) {
        return [shape.points.map(p => Array.isArray(p) ? [p[0], p[1]] : [p.x, p.y])];
      }
    }

    if (shape.type === "Calligraphy" && Array.isArray(shape.points)) {
      if (shape.closed || shape.points.length > 2) {
        return [shape.points.map(p => [p.x, p.y])];
      }
    }
    return null;
  }


  function polygonToShape(polygon, baseShape, shapesToCombine = []) {
    const points = polygon[0].map(([x, y]) => ({ x: x, y: y }));


    let fill = baseShape?.fill || "gray";
    let stroke = baseShape?.stroke || "black";
    let strokeWidth = baseShape?.strokeWidth || 1;

    if (Array.isArray(shapesToCombine) && shapesToCombine.length > 0) {

      fill = shapesToCombine[0].fill || fill;
      stroke = shapesToCombine[0].stroke || stroke;
      strokeWidth = shapesToCombine[0].strokeWidth || strokeWidth;
    }

    return {
      id: `shape-builder-${Date.now()}`,
      type: "Polygon",
      x: 0,
      y: 0,
      points,
      fill,
      stroke,
      strokeWidth,
    };
  }

  const combineShapes = (shapesToCombine, replace = true) => {
    const polygons = shapesToCombine.map(shapeToPolygon).filter(Boolean);
    if (polygons.length < 2) return;

    let result = polygons[0];
    for (let i = 1; i < polygons.length; i++) {
      result = polygonClipping.union(result, polygons[i]);
    }
    if (!result || !result[0]) return;

    const newShape = polygonToShape(result[0], shapesToCombine[0], shapesToCombine);
    if (replace) {
      dispatch(removeShapes(shapesToCombine.map(s => s.id)));
    }
    dispatch(addShape(newShape));
  };

  const subtractShapes = (shapesToSubtract, replace = true) => {
    const polygons = shapesToSubtract.map(shapeToPolygon).filter(Boolean);
    if (polygons.length < 2) return;

    let result = polygons[0];
    for (let i = 1; i < polygons.length; i++) {
      result = polygonClipping.difference(result, polygons[i]);
    }
    if (!result || !result[0]) return;

    const newShape = polygonToShape(result[0], shapesToSubtract[0], shapesToSubtract);
    if (replace) {
      dispatch(removeShapes(shapesToSubtract.map(s => s.id)));
    }
    dispatch(addShape(newShape));
  };
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
  const eraserWidth = useSelector((state) => state.tool.eraserWidth || 10);
  const eraserThinning = useSelector((state) => state.tool.eraserThinning || 0);

  const eraserCaps = useSelector((state) => state.tool.eraserCaps || 0);
  const eraserCapOptions = ["butt", "square", "round"];
  const eraserCapString = eraserCapOptions[Math.round(eraserCaps * 2)] || "round";
  const eraserTremor = useSelector((state) => state.tool.eraserTremor || 0);
  function applyTremorToPoints(points, tremor = 0.5, frequency = 0.3, amplitude = 5) {
    if (!tremor || tremor <= 0) return points;

    const jittered = [];
    for (let i = 0; i < points.length; i += 2) {
      const x = points[i];
      const y = points[i + 1];


      const jitterX = (Math.random() - 0.5 + Math.sin(i * frequency)) * amplitude * tremor;
      const jitterY = (Math.random() - 0.5 + Math.cos(i * frequency)) * amplitude * tremor;

      jittered.push(x + jitterX, y + jitterY);
    }
    return jittered;
  }

  function blendWithWhite(hex, factor = 0.5) {
    if (typeof hex !== "string") return "#ccc";
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex.split("").map(x => x + x).join("");
    }
    const num = parseInt(hex, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    r = Math.round(r + (255 - r) * factor);
    g = Math.round(g + (255 - g) * factor);
    b = Math.round(b + (255 - b) * factor);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function averageColor(color) {
    if (typeof color !== "string") return "#ccc";
    return blendWithWhite(color, 0.5);
  }
  const assignAverage = useSelector(state => state.tool.assignAverage);

  function invertColor(hex) {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex.split("").map(x => x + x).join("");
    }
    const num = parseInt(hex, 16);
    let r = 255 - ((num >> 16) & 255);
    let g = 255 - ((num >> 8) & 255);
    let b = 255 - (num & 255);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  const altInverse = useSelector(state => state.tool.altInverse);

  const handleShapeClick = (shape) => {
    if (selectedTool === "Dropper") {
      if (dropperMode === "pick") {
        let color = shape.fill || shape.stroke || "#000";
        if (altInverse) {
          color = invertColor(color);
        }
        dispatch(setPickedColor(color));
        dispatch(setFillColor(color));
        dispatch(setStrokeColor(color));
      } else if (dropperMode === "assign" && pickedColor) {
        let colorToAssign = pickedColor;
        if (assignAverage) {
          colorToAssign = blendWithWhite(pickedColor, 0.5);
        }
        if (dropperTarget === "fill") {
          dispatch(updateShapePosition({ id: shape.id, fill: colorToAssign }));
        } else if (dropperTarget === "stroke") {
          dispatch(updateShapePosition({ id: shape.id, stroke: colorToAssign }));
        }
      }
    }
  };
  const shapeX = selectedShape ? selectedShape.x || 0 : 0;
  const shapeY = selectedShape ? selectedShape.y || 0 : 0;
  function getLinearGradientColorStops(fill) {
    if (!fill?.colors) return [];

    const validStops = fill.colors.filter(
      stop => typeof stop.pos === "number" && isFinite(stop.pos) && stop.pos >= 0 && stop.pos <= 1
    );

    if (fill.repeat === "reflected" && validStops.length > 1) {

      const forward = validStops.map(stop => [stop.pos * 0.5, stop.color]);

      const backward = validStops.slice(0, -1).reverse().map(stop => [0.5 + stop.pos * 0.5, stop.color]);

      const allStops = [...forward, ...backward].sort((a, b) => a[0] - b[0]);
      return allStops.flat();
    }

    if (fill.repeat === "direct" && validStops.length > 1) {
      const repeated = [
        ...validStops.map(stop => [stop.pos * 0.5, stop.color]),
        ...validStops.map(stop => [0.5 + stop.pos * 0.5, stop.color])
      ];
      return repeated.flat();
    }

    return validStops.flatMap(stop => [stop.pos, stop.color]);
  }
  const handleMeasurementMouseDown = (e) => {
    if (selectedTool !== "Measurement") return;
    const stage = e.target.getStage();
    const pointer = getAdjustedPointerPosition(stage, position, scale);
    setIsMeasuring(true);
    const draft = { x1: pointer.x, y1: pointer.y, x2: pointer.x, y2: pointer.y };
    measurementDraftRef.current = draft;
    dispatch({ type: "tool/setMeasurementDraft", payload: draft });
  };

  const handleMeasurementMouseMove = (e) => {
    if (!isMeasuring || selectedTool !== "Measurement") return;
    const stage = e.target.getStage();
    const pointer = getAdjustedPointerPosition(stage, position, scale);
    const draft = { ...measurementDraftRef.current, x2: pointer.x, y2: pointer.y };
    measurementDraftRef.current = draft;
    dispatch({ type: "tool/setMeasurementDraft", payload: draft });
  };
  const toGuides = useSelector(state => state.tool.toGuides);
  const handleMeasurementMouseUp = (e) => {
    if (!isMeasuring || selectedTool !== "Measurement") return;
    setIsMeasuring(false);
    const draft = measurementDraftRef.current;
    if (draft && (draft.x1 !== draft.x2 || draft.y1 !== draft.y2)) {
      dispatch({ type: "tool/addMeasurementLine", payload: draft });
      if (toGuides) {
        addGuidesAtLine(draft.x1, draft.y1, draft.x2, draft.y2);
      }
    }
    measurementDraftRef.current = null;
    dispatch({ type: "tool/setMeasurementDraft", payload: null });
  };
  const unitConversionFactors = {
    px: 1,
    mm: 3.779528,
    cm: 37.79528,
    in: 96,
    pt: 1.333333,
    pc: 16,
  };
  function formatMeasurement(line, scale, precision, unit, showAngle = false) {
    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;
    const distPx = Math.sqrt(dx * dx + dy * dy) * (scale / 100);
    const dist = distPx / (unitConversionFactors[unit] || 1);
    let label = dist.toFixed(precision) + " " + unit;
    if (showAngle) {
      let angle = Math.atan2(dy, dx) * 180 / Math.PI;
      if (angle < 0) angle += 360;
      label += `\n${angle.toFixed(1)}°`;
    }
    return label;
  }
  function renderAngleArc(x1, y1, x2, y2, arcRadius = 32, color = "orange") {
    const dx = x2 - x1;
    const dy = y2 - y1;
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += 2 * Math.PI;



    if (Math.abs(angle) < 0.05) return null;

    return (
      <Arc
        x={x1}
        y={y1}
        innerRadius={arcRadius - 4}
        outerRadius={arcRadius}
        angle={angle * 180 / Math.PI}
        rotation={0}
        fillEnabled={false}
        stroke={color}
        strokeWidth={2}
        dash={[4, 4]}
        listening={false}
      />
    );
  }
  useEffect(() => {
    if (toGuides && allMeasurementLines.length > 0) {
      allMeasurementLines.forEach(line => {
        addGuidesAtLine(line.x1, line.y1, line.x2, line.y2);
      });
    }


  }, [toGuides, allMeasurementLines.length]);
  function renderDimensionMarkers(line, length = 16, offset = 16) {
    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return null;

    const px = -dy / len;
    const py = dx / len;


    const tick1 = {
      x1: line.x1 + px * length / 2,
      y1: line.y1 + py * length / 2,
      x2: line.x1 - px * length / 2,
      y2: line.y1 - py * length / 2,
    };
    const tick2 = {
      x1: line.x2 + px * length / 2,
      y1: line.y2 + py * length / 2,
      x2: line.x2 - px * length / 2,
      y2: line.y2 - py * length / 2,
    };


    const labelX = line.x1 - px * (offset + length / 2);
    const labelY = line.y1 - py * (offset + length / 2) - 10;

    return (
      <>
        <Line
          points={[tick1.x1, tick1.y1, tick1.x2, tick1.y2]}
          stroke="black"
          strokeWidth={2}
          listening={false}
        />
        <Line
          points={[tick2.x1, tick2.y1, tick2.x2, tick2.y2]}
          stroke="black"
          strokeWidth={2}
          listening={false}
        />
        <KonvaText
          x={labelX}
          y={labelY}
          text={formatMeasurement(line, measurementScale, measurementPrecision, measurementUnit, true)}
          fontSize={measurementFontSize}
          fill="black"
          align="center"
        />
      </>
    );
  }

  function convertMeasurementToItem(line) {
    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    const px = -dy / len;
    const py = dx / len;
    const length = 16;


    const tick1 = {
      type: "Line",
      points: [
        line.x1 + px * length / 2, line.y1 + py * length / 2,
        line.x1 - px * length / 2, line.y1 - py * length / 2
      ],
      stroke: "black",
      strokeWidth: 2,
    };
    const tick2 = {
      type: "Line",
      points: [
        line.x2 + px * length / 2, line.y2 + py * length / 2,
        line.x2 - px * length / 2, line.y2 - py * length / 2
      ],
      stroke: "black",
      strokeWidth: 2,
    };

    const mainLine = {
      type: "Line",
      points: [line.x1, line.y1, line.x2, line.y2],
      stroke: "orange",
      strokeWidth: 2,
      dash: [4, 4],
    };

    const label = {
      type: "Text",
      x: line.x1 - px * (length + 8),
      y: line.y1 - py * (length + 8) - 10,
      text: formatMeasurement(line, measurementScale, measurementPrecision, measurementUnit, true),
      fontSize: measurementFontSize,
      fill: "black",
    };


    dispatch(addShape(tick1));
    dispatch(addShape(tick2));
    dispatch(addShape(mainLine));
    dispatch(addShape(label));
    dispatch(removeMeasurementLine(line));
    dispatch(setConvertToItem(false));
  }
  function handleConvertToItem(line) {

    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    const px = -dy / len;
    const py = dx / len;
    const length = 16;


    const tick1 = {
      type: "Line",
      points: [
        line.x1 + px * length / 2, line.y1 + py * length / 2,
        line.x1 - px * length / 2, line.y1 - py * length / 2
      ],
      stroke: "black",
      strokeWidth: 2,
    };
    const tick2 = {
      type: "Line",
      points: [
        line.x2 + px * length / 2, line.y2 + py * length / 2,
        line.x2 - px * length / 2, line.y2 - py * length / 2
      ],
      stroke: "black",
      strokeWidth: 2,
    };

    const mainLine = {
      type: "Line",
      points: [line.x1, line.y1, line.x2, line.y2],
      stroke: "orange",
      strokeWidth: 2,
      dash: [4, 4],
    };

    const label = {
      type: "Text",
      x: line.x1 - px * (length + 8),
      y: line.y1 - py * (length + 8) - 10,
      text: formatMeasurement(line, measurementScale, measurementPrecision, measurementUnit, true),
      fontSize: measurementFontSize,
      fill: "black",
    };


    dispatch({
      type: "tool/convertMeasurementToItem",
      payload: { shapes: [tick1, tick2, mainLine, label], line }
    });
  }
  useEffect(() => {
    if (convertToItem && allMeasurementLines.length > 0) {
      allMeasurementLines.forEach(line => {
        convertMeasurementToItem(line);
      });
    }

  }, [convertToItem]);
  useEffect(() => {
    window.shapeBuilderRegions = shapeBuilderRegions;
    window.selectedRegionIndices = selectedRegionIndices;
  }, [shapeBuilderRegions, selectedRegionIndices]);
  useEffect(() => {
    function handleCombine() {
      if (
        shapeBuilderRegions.length > 0 &&
        selectedRegionIndices.length > 0
      ) {
        const selectedPolygons = selectedRegionIndices.map(idx => shapeBuilderRegions[idx]);
        const result = polygonClipping.union(...selectedPolygons);
        if (result && result.length > 0) {
          result.forEach((poly, i) => {
            const newShape = polygonToShape(poly, shapeBuilderShapes[0], shapeBuilderShapes);
            dispatch(addShape(newShape));
          });
          if (replaceShapes) {
            dispatch(removeShapes(shapeBuilderShapes.map(s => s.id)));
          }
          setShapeBuilderRegions([]);
          setSelectedRegionIndices([]);
        }
      }
    }
    function handleSubtract() {
      if (
        shapeBuilderRegions.length > 0 &&
        selectedRegionIndices.length > 0
      ) {
        const restPolygons = shapeBuilderRegions.filter((_, idx) => !selectedRegionIndices.includes(idx));
        if (restPolygons.length === 0) return;
        const result = polygonClipping.union(...restPolygons);
        if (result && result.length > 0) {
          result.forEach((poly, i) => {
            const newShape = polygonToShape(poly, shapeBuilderShapes[0], shapeBuilderShapes);
            dispatch(addShape(newShape));
          });
          if (replaceShapes) {
            dispatch(removeShapes(shapeBuilderShapes.map(s => s.id)));
          }
          setShapeBuilderRegions([]);
          setSelectedRegionIndices([]);
        }
      }
    }
    window.addEventListener("shapeBuilderCombine", handleCombine);
    window.addEventListener("shapeBuilderSubtract", handleSubtract);
    return () => {
      window.removeEventListener("shapeBuilderCombine", handleCombine);
      window.removeEventListener("shapeBuilderSubtract", handleSubtract);
    };
  }, [shapeBuilderRegions, selectedRegionIndices, shapeBuilderShapes, replaceShapes, dispatch]);
  function offsetPoints(points, offset) {

    const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    return points.map(p => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      return {
        x: cx + dx / len * (len + offset),
        y: cy + dy / len * (len + offset)
      };
    });
  }
  function calculateMeshGradientStroke(nodes) {
    if (!nodes || nodes.length === 0) return "black";

    const hexToRgb = (hex) => {
      hex = hex.replace(/^#/, "");
      if (hex.length === 3) hex = hex.split("").map((x) => x + x).join("");
      const num = parseInt(hex, 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    };

    const rgbToHex = ({ r, g, b }) =>
      `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;

    const colors = nodes.flatMap((row) => row.map((node) => hexToRgb(node.color)));
    const avgRgb = {
      r: Math.round(colors.reduce((sum, c) => sum + c.r, 0) / colors.length),
      g: Math.round(colors.reduce((sum, c) => sum + c.g, 0) / colors.length),
      b: Math.round(colors.reduce((sum, c) => sum + c.b, 0) / colors.length),
    };

    return rgbToHex(avgRgb);
  }

  const zoomToSelectedShape = () => {
    if (!selectedShape) return;


    let shapeX = selectedShape.x || 0;
    let shapeY = selectedShape.y || 0;
    let shapeWidth = selectedShape.width || (selectedShape.radius ? selectedShape.radius * 2 : 100);
    let shapeHeight = selectedShape.height || (selectedShape.radius ? selectedShape.radius * 2 : 100);

    if (selectedShape.radius !== undefined) {
      shapeX = (selectedShape.x || 0) - selectedShape.radius;
      shapeY = (selectedShape.y || 0) - selectedShape.radius;
      shapeWidth = selectedShape.radius * 2;
      shapeHeight = selectedShape.radius * 2;
    }


    const viewportWidth = width;
    const viewportHeight = height;
    const margin = 40;
    const scaleX = (viewportWidth - margin) / shapeWidth;
    const scaleY = (viewportHeight - margin) / shapeHeight;
    const zoom = Math.max(0.1, Math.min(3, Math.min(scaleX, scaleY)));

    setScale(zoom);


    const shapeCenterX = shapeX + shapeWidth / 2;
    const shapeCenterY = shapeY + shapeHeight / 2;
    const viewportCenterX = viewportWidth / 2;
    const viewportCenterY = viewportHeight / 2;

    setPosition({
      x: viewportCenterX - shapeCenterX * zoom,
      y: viewportCenterY - shapeCenterY * zoom,
    });
  };
  const zoomToDrawing = () => {
    if (!shapes || shapes.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    shapes.forEach(shape => {
      let x = shape.x || 0;
      let y = shape.y || 0;
      let w = shape.width || (shape.radius ? shape.radius * 2 : 0);
      let h = shape.height || (shape.radius ? shape.radius * 2 : 0);

      if (shape.radius !== undefined) {
        x = (shape.x || 0) - shape.radius;
        y = (shape.y || 0) - shape.radius;
        w = shape.radius * 2;
        h = shape.radius * 2;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });

    const drawingWidth = maxX - minX;
    const drawingHeight = maxY - minY;

    const margin = 40;
    const viewportWidth = width;
    const viewportHeight = height;
    const scaleX = (viewportWidth - margin) / drawingWidth;
    const scaleY = (viewportHeight - margin) / drawingHeight;
    const zoom = Math.max(0.1, Math.min(3, Math.min(scaleX, scaleY)));

    setScale(() => zoom);


    setPosition(() => {
      const drawingCenterX = minX + drawingWidth / 2;
      const drawingCenterY = minY + drawingHeight / 2;
      const viewportCenterX = viewportWidth / 2;
      const viewportCenterY = viewportHeight / 2;
      return {
        x: viewportCenterX - drawingCenterX * zoom,
        y: viewportCenterY - drawingCenterY * zoom,
      };
    });
  };

  useImperativeHandle(ref, () => ({
    zoomToSelectedShape,
    zoomToDrawing,
  }));

  function handleTweakAction(point, affectedShapes) {
    const fidelity = Math.max(0, Math.min(100, tweakFidelity));
    switch (tweakMode) {
      case "move":
        affectedShapes.forEach(shape => {
          if (Math.random() > fidelity / 100) return;
          const dx = point.x - shape.x;
          const dy = point.y - shape.y;

          dispatch(updateShapePosition({
            id: shape.id,
            x: shape.x + dx * 0.1 * tweakForce,
            y: shape.y + dy * 0.1 * tweakForce,
          }));
        });
        break;
      case "moveToCursor":

        affectedShapes.forEach(shape => {
          if (Math.random() > fidelity / 100) return;
          dispatch(updateShapePosition({
            id: shape.id,
            x: point.x,
            y: point.y,
          }));
        });
        break;
      case "shrink":
        affectedShapes.forEach(shape => {
          if (Math.random() > fidelity / 100) return;
          if (shape.type === "Rectangle") {
            dispatch(updateShapePosition({
              id: shape.id,
              width: Math.max(1, shape.width * 0.95),
              height: Math.max(1, shape.height * 0.95),
            }));
          } else if (shape.type === "Circle") {
            dispatch(updateShapePosition({
              id: shape.id,
              radius: Math.max(1, shape.radius * 0.95),
            }));
          } else if (shape.type === "Star") {
            dispatch(updateShapePosition({
              id: shape.id,
              outerRadius: Math.max(1, shape.outerRadius * 0.95),
              innerRadius: Math.max(1, shape.innerRadius * 0.95),
            }));
          } else if (shape.type === "Polygon") {
            dispatch(updateShapePosition({
              id: shape.id,
              radius: Math.max(1, (shape.radius || 1) * 0.95),
              points: shape.points.map(p => ({
                x: p.x * 0.95,
                y: p.y * 0.95,
              })),
            }));
          } else if (shape.type === "Pencil" || shape.type === "Calligraphy") {

            const cx = shape.points.reduce((sum, p) => sum + (p.x ?? p[0]), 0) / shape.points.length;
            const cy = shape.points.reduce((sum, p) => sum + (p.y ?? p[1]), 0) / shape.points.length;
            const newPoints = shape.points.map(p => {
              const x = (p.x ?? p[0]) - cx;
              const y = (p.y ?? p[1]) - cy;
              return {
                ...(p.x !== undefined ? p : { x: p[0], y: p[1] }),
                x: cx + x * 0.95,
                y: cy + y * 0.95,
              };
            });
            dispatch(updateShapePosition({
              id: shape.id,
              points: newPoints,
            }));
          } else {

            dispatch(updateShapePosition({
              id: shape.id,
              scaleX: (shape.scaleX || 1) * 0.95,
              scaleY: (shape.scaleY || 1) * 0.95,
            }));
          }
        });
        break;
      case "randomMove":

        if (!window._tweakRandomDirs) window._tweakRandomDirs = {};
        affectedShapes.forEach(shape => {
          if (Math.random() > fidelity / 100) return;
          if (!window._tweakRandomDirs[shape.id]) {

            const angle = Math.random() * 2 * Math.PI;
            window._tweakRandomDirs[shape.id] = {
              dx: Math.cos(angle),
              dy: Math.sin(angle),
            };
          }
          const { dx, dy } = window._tweakRandomDirs[shape.id];
          dispatch(updateShapePosition({
            id: shape.id,
            x: shape.x + dx * 3 * tweakForce,
            y: shape.y + dy * 3 * tweakForce,
          }));
        });
        break;
      case "rotate":

        affectedShapes.forEach(shape => {
          if (Math.random() > fidelity / 100) return;
          dispatch(updateShapePosition({
            id: shape.id,
            rotation: (shape.rotation || 0) + 10 * tweakForce,
          }));
        });
        break;
      case "duplicate":
        affectedShapes.forEach(shape => {
          if (Math.random() > fidelity / 100) return;
          const newShape = {
            ...shape,
            id: `${shape.id}-copy-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            x: (shape.x || 0) + 10,
            y: (shape.y || 0) + 10,
          };
          dispatch(addShape(newShape));
        });
        break;
      case "push":

        affectedShapes.forEach(shape => {
          if (Math.random() > fidelity / 100) return;
          const dx = shape.x - point.x;
          const dy = shape.y - point.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          dispatch(updateShapePosition({
            id: shape.id,
            x: shape.x + (dx / dist) * 10 * tweakForce,
            y: shape.y + (dy / dist) * 10 * tweakForce,
          }));
        });
        break;
      case "shrinkInset":


        affectedShapes.forEach(shape => {
          if (Math.random() > fidelity / 100) return;
          dispatch(updateShapePosition({
            id: shape.id,
            scaleX: (shape.scaleX || 1) * 0.98,
            scaleY: (shape.scaleY || 1) * 0.98,
          }));
        });
        break;
      case "roughen":

        affectedShapes.forEach(shape => {
          if (Math.random() > fidelity / 100) return;
          if (shape.points) {
            const newPoints = shape.points.map(pt => ({
              x: pt.x + (Math.random() - 0.5) * 2 * tweakForce,
              y: pt.y + (Math.random() - 0.5) * 2 * tweakForce,
            }));
            dispatch(updateShapePosition({
              id: shape.id,
              points: newPoints,
            }));
          }
        });
        break;
      case "paint":

        affectedShapes.forEach(shape => {
          if (Math.random() > fidelity / 100) return;
          dispatch(updateShapePosition({
            id: shape.id,
            fill: fillColor || "#000",
            stroke: fillColor || "#000",
          }));
        });
        break;
      case "jitterColor":

        affectedShapes.forEach(shape => {
          if (Math.random() > fidelity / 100) return;
          if (shape.fill && typeof shape.fill === "string" && shape.fill.startsWith("#")) {
            let color = shape.fill.replace("#", "");
            let r = Math.max(0, Math.min(255, parseInt(color.substring(0, 2), 16) + Math.floor(Math.random() * 20 - 10)));
            let g = Math.max(0, Math.min(255, parseInt(color.substring(2, 4), 16) + Math.floor(Math.random() * 20 - 10)));
            let b = Math.max(0, Math.min(255, parseInt(color.substring(4, 6), 16) + Math.floor(Math.random() * 20 - 10)));
            let newColor = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
            dispatch(updateShapePosition({
              id: shape.id,
              fill: newColor,
            }));
          }
        });
        break;
      case "blur":
        affectedShapes.forEach(shape => {

          const newBlur = Math.min((shape.blur || 0) + tweakForce, 100);
          dispatch(updateShapePosition({ id: shape.id, blur: newBlur }));
        });
        break;
      case "attract": {
        const radius = tweakRadius || 100;
        const force = (tweakForce || 1) * (fidelity / 100);

        affectedShapes.forEach(shape => {
          if (Array.isArray(shape.points)) {

            const newPoints = shape.points.map(pt => {
              const px = pt.x !== undefined ? pt.x : pt[0];
              const py = pt.y !== undefined ? pt.y : pt[1];
              const dx = point.x - px;
              const dy = point.y - py;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < radius) {

                const falloff = Math.cos((dist / radius) * Math.PI) * 0.5 + 0.5;

                const moveFactor = force * falloff * 0.15;
                if (pt.x !== undefined) {
                  return { ...pt, x: px + dx * moveFactor, y: py + dy * moveFactor };
                } else {
                  return [px + dx * moveFactor, py + dy * moveFactor];
                }
              }
              return pt;
            });
            dispatch(updateShapePosition({ id: shape.id, points: newPoints }));
          }
        });
        break;
      }
      default:
        break;
    }
  }
  useEffect(() => {
    if (selectedTool !== "Tweak" && window._tweakRandomDirs) {
      window._tweakRandomDirs = {};
    }
  }, [selectedTool]);
  function getOffsetPoints(points, amount) {

    if (!Array.isArray(points) || points.length < 3) return points;


    const cleanPoints = points.filter(
      p => p && typeof p.x === "number" && typeof p.y === "number"
    );


    const first = cleanPoints[0];
    const last = cleanPoints[cleanPoints.length - 1];
    let closedPoints = cleanPoints;
    if (first.x !== last.x || first.y !== last.y) {
      closedPoints = [...cleanPoints, { x: first.x, y: first.y }];
    }


    const arr = closedPoints.map(pt => [pt.x, pt.y]);


    if (arr.length < 4) return points;


    try {
      const offset = new Offset();
      const result = offset.data([arr]).offset(amount);
      if (!result || !result.length) return points;

      const largest = result.reduce((a, b) => (a.length > b.length ? a : b));
      return largest.map(([x, y]) => ({ x, y }));
    } catch (e) {
      console.error("Offset error:", e);
      return points;
    }
  }

  function getShapeCenter(shape) {
    const pts = shape.points;
    const n = pts.length;
    const sum = pts.reduce((acc, p) => {
      const x = p.x ?? p[0];
      const y = p.y ?? p[1];
      return { x: acc.x + x, y: acc.y + y };
    }, { x: 0, y: 0 });
    return { x: sum.x / n, y: sum.y / n };
  }

  function getOriginalRadiusOrDistance(shape, handlePoint) {
    const center = getShapeCenter(shape);
    return Math.sqrt(
      Math.pow(handlePoint.x - center.x, 2) +
      Math.pow(handlePoint.y - center.y, 2)
    );
  }

  function svgToBitmap(svgString, width, height) {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas);
      };
      img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    });
  }
  const SvgImage = React.memo(function SvgImage({ svg, x, y, width, height, draggable, onClick, id }) {
    const processedSvg = React.useMemo(() => (
      svg
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<defs[\s\S]*?<\/defs>/gi, '')
        .replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
        .replace(/<title[\s\S]*?<\/title>/gi, '')
        .replace(/<desc[\s\S]*?<\/desc>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s+xmlns(:\w+)?="[^"]*"/g, '')
        .replace(/\s(width|height)="[^"]*"/g, '')
        .replace(
          /<svg([^>]*)>/,
          `<svg$1 width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">`
        )
        .replace(/[\n\r\t]+/g, ' ')
    ), [svg, width, height]);

    const [bitmap, setBitmap] = React.useState(null);

    React.useEffect(() => {
      let cancelled = false;
      svgToBitmap(processedSvg, width, height).then((canvas) => {
        if (!cancelled) setBitmap(canvas);
      });
      return () => { cancelled = true; };
    }, [processedSvg, width, height]);

    return (
      <Image
        id={id}
        image={bitmap}
        x={x}
        y={y}
        width={width}
        height={height}
        draggable={draggable}
        onClick={onClick}
      />
    );
  });
  React.useEffect(() => {
    shapes.forEach(shape => {
      if (shape.fill && shape.fill.type === "pattern") {
        console.log("Pattern fill detected for", shape.id, shape.fill);
      }
      if (
        shape.fill &&
        shape.fill.type === "pattern" &&
        shape.fill.svg &&
        !patternImages[shape.id + ":fill"]
      ) {
        console.log("Calling svgToBitmap for", shape.id, shape.fill.svg, shape.width, shape.height);
        svgToBitmap(shape.fill.svg, shape.width, shape.height).then(img => {
          console.log("Pattern bitmap generated for", shape.id, img);
          setPatternImages(prev => ({ ...prev, [shape.id + ":fill"]: img }));
        });
      }
    });
  }, [shapes]);
  function applyBendEffect(points, bendAmount = 40, frequency = 1) {
    if (!Array.isArray(points) || points.length < 2) return points;
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const width = maxX - minX || 1;
    return points.map(p => ({
      x: p.x,
      y: p.y + Math.sin(((p.x - minX) / width) * Math.PI * frequency) * bendAmount
    }));
  }
  function applyPathEffect(points, effectName) {
    if (!points || !effectName) return points;
    if (effectName === "Bend") {
      return applyBendEffect(points, 40, 1);
    }
    return points;
  }
  const splitMode = useSelector(state => state.tool.splitMode);
  const splitPosition = useSelector(state => state.tool.splitPosition);

  const [draggingSplit, setDraggingSplit] = useState(false);

  const handleSplitDrag = (e) => {
    if (!draggingSplit) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    let x = (e.clientX - rect.left) / rect.width;
    x = Math.max(0.05, Math.min(0.95, x));
    dispatch(setSplitPosition(x));
  };

  useEffect(() => {
    if (!draggingSplit) return;
    const onMove = (e) => handleSplitDrag(e);
    const onUp = () => setDraggingSplit(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [draggingSplit]);

  function renderShapeOutline(shape) {
    if (shape.type === "Rectangle") {
      return (
        <Rect
          key={shape.id}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          fill={null}
          stroke="black"
          strokeWidth={1}
          listening={false}
        />
      );
    }
    if (shape.type === "Circle") {
      return (
        <Circle
          key={shape.id}
          x={shape.x}
          y={shape.y}
          radius={shape.radius}
          fill={null}
          stroke="black"
          strokeWidth={1}
          listening={false}
        />
      );
    }
    if (shape.type === "Polygon") {
      return (
        <Path
          key={shape.id}
          x={shape.x}
          y={shape.y}
          data={generatePolygonPath(shape.points)}
          fill={null}
          stroke="black"
          strokeWidth={1}
          closed
          listening={false}
        />
      );
    }
    if (shape.type === "Star") {
      return (
        <Star
          key={shape.id}
          x={shape.x}
          y={shape.y}
          numPoints={shape.corners}
          innerRadius={shape.innerRadius}
          outerRadius={shape.outerRadius}
          fill={null}
          stroke="black"
          strokeWidth={1}
          listening={false}
        />
      );
    }
    if (shape.type === "Path") {
      return (
        <Path
          key={shape.id}
          data={shape.path}
          fill={null}
          stroke="black"
          strokeWidth={1}
          listening={false}
        />
      );
    }
    if (shape.type === "Line") {
      return (
        <Line
          key={shape.id}
          points={shape.points}
          stroke="black"
          strokeWidth={1}
          listening={false}
        />
      );
    }
    if (shape.type === "Pencil") {
      return (
        <Line
          key={shape.id}
          points={shape.points.flatMap((p) => [p.x, p.y])}
          stroke="black"
          fill={null}
          strokeWidth={1}
          lineJoin="round"
          lineCap="round"
          closed={shape.closed || false}
          listening={false}
        />
      );
    }
    if (shape.type === "Calligraphy") {
      return (
        <Line
          key={shape.id}
          points={shape.points.flatMap((p) => [p.x, p.y])}
          stroke="black"
          fill={null}
          strokeWidth={1}
          lineJoin="round"
          lineCap="round"
          closed={false}
          listening={false}
        />
      );
    }
    if (shape.type === "Bezier") {
      return (
        <Path
          key={shape.id}
          data={getBezierPathFromPoints(shape.points, shape.closed)}
          stroke="black"
          strokeWidth={1}
          fill={null}
          closed={shape.closed}
          listening={false}
        />
      );
    }
    return null;
  }
  const handleXRayMouseMove = (e) => {
    const rect = splitContainerRef.current.getBoundingClientRect();
    let x = (e.clientX - rect.left) / rect.width;
    x = Math.max(0, Math.min(1, x));
    setXraySplit(x);
  };
  function toGray(hex) {
    if (!hex || typeof hex !== "string") return "#888";
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
    if (hex.length !== 6) return "#888";
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    return `#${gray.toString(16).padStart(2, "0").repeat(3)}`;
  }
  const grayScale = useSelector(state => state.tool.grayScale);
  const shapeBuilderTemplates = {
    "Trellis": {
      type: "Polygon",
      x: 200,
      y: 200,
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 }
      ],
      fill: "#e0e0e0",
      stroke: "#222",
      strokeWidth: 2
    },
    "3D Box": {
      type: "Group",
      shapes: [
        {
          id: `box-front-${Date.now()}`,
          type: "Polygon",
          x: 300,
          y: 300,
          points: [
            { x: 0, y: 0 },
            { x: 80, y: 0 },
            { x: 80, y: 80 },
            { x: 0, y: 80 }
          ],
          fill: "#e0e0e0",
          stroke: "#222",
          strokeWidth: 2
        },
        {
          id: `box-top-${Date.now()}`,
          type: "Polygon",
          x: 300,
          y: 300,
          points: [
            { x: 0, y: 0 },
            { x: 40, y: -40 },
            { x: 120, y: -40 },
            { x: 80, y: 0 }
          ],
          fill: "#cccccc",
          stroke: "#222",
          strokeWidth: 2
        },
        {
          id: `box-side-${Date.now()}`,
          type: "Polygon",
          x: 300,
          y: 300,
          points: [
            { x: 80, y: 0 },
            { x: 120, y: -40 },
            { x: 120, y: 40 },
            { x: 80, y: 80 }
          ],
          fill: "#b0b0b0",
          stroke: "#222",
          strokeWidth: 2
        }
      ]
    },
    "Diamond": {
      type: "Polygon",
      x: 300,
      y: 200,
      points: [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 }
      ],
      fill: "#f0f0f0",
      stroke: "#222",
      strokeWidth: 2
    },
    "Cross": {
      type: "Polygon",
      x: 250,
      y: 250,
      points: [
        { x: 0, y: 40 }, { x: 40, y: 40 }, { x: 40, y: 0 },
        { x: 80, y: 0 }, { x: 80, y: 40 }, { x: 120, y: 40 },
        { x: 120, y: 80 }, { x: 80, y: 80 }, { x: 80, y: 120 },
        { x: 40, y: 120 }, { x: 40, y: 80 }, { x: 0, y: 80 }
      ],
      fill: "#e0e0e0",
      stroke: "#222",
      strokeWidth: 2
    },
    "Very Cross": {
      type: "Polygon",
      x: 250,
      y: 250,
      points: [
        { x: 0, y: 30 }, { x: 30, y: 30 }, { x: 30, y: 0 },
        { x: 60, y: 0 }, { x: 60, y: 30 }, { x: 90, y: 30 },
        { x: 90, y: 60 }, { x: 60, y: 60 }, { x: 60, y: 90 },
        { x: 30, y: 90 }, { x: 30, y: 60 }, { x: 0, y: 60 }
      ],
      fill: "#f0f0f0",
      stroke: "#222",
      strokeWidth: 2
    },
    "Target": {
      type: "Circle",
      x: 300,
      y: 300,
      radius: 60,
      fill: "#fff",
      stroke: "#222",
      strokeWidth: 6
    },
    "Hive": {
      type: "Polygon",
      x: 300,
      y: 300,
      points: Array.from({ length: 6 }).map((_, i) => {
        const angle = (Math.PI / 3) * i;
        return {
          x: 60 * Math.cos(angle),
          y: 60 * Math.sin(angle)
        };
      }),
      fill: "#ffe066",
      stroke: "#222",
      strokeWidth: 2
    },
    "Explosion": {
      type: "Star",
      x: 300,
      y: 300,
      corners: 12,
      innerRadius: 30,
      outerRadius: 80,
      fill: "#ff6666",
      stroke: "#222",
      strokeWidth: 2
    },
    "Droplet": {
      type: "Polygon",
      x: 300,
      y: 300,
      points: [
        { x: 0, y: -60 }, { x: 40, y: 0 }, { x: 0, y: 80 }, { x: -40, y: 0 }
      ],
      fill: "#66ccff",
      stroke: "#222",
      strokeWidth: 2
    },
    "Double Vision": {
      type: "Group",
      shapes: [
        {
          id: `double-vision-1-${Date.now()}`,
          type: "Circle",
          x: 300,
          y: 300,
          radius: 60,
          fill: "#66ccff",
          stroke: "#222",
          strokeWidth: 2
        },
        {
          id: `double-vision-2-${Date.now()}`,
          type: "Circle",
          x: 340,
          y: 300,
          radius: 60,
          fill: "#ffcc66",
          stroke: "#222",
          strokeWidth: 2
        }
      ]
    },
    "Celtic Flower": {
      type: "Group",
      shapes: Array.from({ length: 6 }).map((_, i) => ({
        id: `celtic-flower-${i}-${Date.now()}`,
        type: "Ellipse",
        x: 300 + 60 * Math.cos((Math.PI * 2 * i) / 6),
        y: 300 + 60 * Math.sin((Math.PI * 2 * i) / 6),
        radiusX: 40,
        radiusY: 80,
        rotation: (360 / 6) * i,
        fill: "#e0e0e0",
        stroke: "#222",
        strokeWidth: 2
      }))
    },
    "Celtic Knot": {
      type: "Path",
      x: 300,
      y: 300,
      path: generateKnotPath(220, 220, 160, 160, 20, 10),
      fill: "#fff",
      stroke: "#222",
      strokeWidth: 3
    },
    "Kitchen Tile": {
      type: "Group",
      shapes: [
        {
          id: `tile-rect-${Date.now()}`,
          type: "Rectangle",
          x: 250,
          y: 250,
          width: 100,
          height: 100,
          fill: "#f0f0f0",
          stroke: "#222",
          strokeWidth: 2
        },
        {
          id: `tile-diag1-${Date.now()}`,
          type: "Line",
          points: [250, 250, 350, 350],
          stroke: "#888",
          strokeWidth: 2
        },
        {
          id: `tile-diag2-${Date.now()}`,
          type: "Line",
          points: [350, 250, 250, 350],
          stroke: "#888",
          strokeWidth: 2
        }
      ]
    },
    "Rose": {
      type: "Path",
      x: 200,
      y: 200,
      path: generateSpiralPath(100, 100, 4, 2, 4),
      fill: "#ff6699",
      stroke: "#222",
      strokeWidth: 2
    },
    "Lily": {
      type: "Polygon",
      x: 300,
      y: 300,
      points: Array.from({ length: 6 }).map((_, i) => ({
        x: 80 * Math.cos((Math.PI * 2 * i) / 6),
        y: 120 * Math.sin((Math.PI * 2 * i) / 6)
      })),
      fill: "#fffbe6",
      stroke: "#222",
      strokeWidth: 2
    },
    "Crown": {
      type: "Polygon",
      x: 300,
      y: 300,
      points: [
        { x: -60, y: 40 }, { x: -40, y: -40 }, { x: -20, y: 40 },
        { x: 0, y: -40 }, { x: 20, y: 40 }, { x: 40, y: -40 }, { x: 60, y: 40 }
      ],
      fill: "#ffe066",
      stroke: "#222",
      strokeWidth: 2
    },
    "Diamond Target": {
      type: "Group",
      shapes: [
        {
          id: `diamond-outer-${Date.now()}`,
          type: "Polygon",
          x: 300,
          y: 300,
          points: [
            { x: 0, y: -80 }, { x: 80, y: 0 }, { x: 0, y: 80 }, { x: -80, y: 0 }
          ],
          fill: "#e0e0e0",
          stroke: "#222",
          strokeWidth: 2
        },
        {
          id: `diamond-inner-${Date.now()}`,
          type: "Polygon",
          x: 300,
          y: 300,
          points: [
            { x: 0, y: -40 }, { x: 40, y: 0 }, { x: 0, y: 40 }, { x: -40, y: 0 }
          ],
          fill: "#fff",
          stroke: "#222",
          strokeWidth: 2
        }
      ]
    }, "TV Test Pattern": {
      type: "Group",
      shapes: [
        {
          id: `tvtest-rect-${Date.now()}`,
          type: "Rectangle",
          x: 220,
          y: 220,
          width: 160,
          height: 120,
          fill: "#fff",
          stroke: "#222",
          strokeWidth: 2
        },
        ...["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"].map((color, i) => ({
          id: `tvtest-bar-${i}-${Date.now()}`,
          type: "Rectangle",
          x: 230 + i * 25,
          y: 230,
          width: 20,
          height: 80,
          fill: color,
          stroke: "#222",
          strokeWidth: 1
        })),
        {
          id: `tvtest-circle-${Date.now()}`,
          type: "Circle",
          x: 300,
          y: 280,
          radius: 30,
          fill: "#888",
          stroke: "#222",
          strokeWidth: 2
        },
        {
          id: `tvtest-hbar-${Date.now()}`,
          type: "Rectangle",
          x: 230,
          y: 320,
          width: 120,
          height: 10,
          fill: "#222",
          stroke: "#222",
          strokeWidth: 1
        }
      ]
    },
  };
  useEffect(() => {
    if (shapeBuilderTemplate && shapeBuilderTemplates[shapeBuilderTemplate]) {
      dispatch(addShape(shapeBuilderTemplates[shapeBuilderTemplate]));
      dispatch({ type: "tool/setShapeBuilderTemplate", payload: null });
    }
  }, [shapeBuilderTemplate, dispatch]);

  return (
    <>
      {/* {selectedTool === "Dropper" && (
        <DropperTopbar onAssignAverageChange={setAssignAverage} />
      )} */}
      <div className="my-0"
        style={{


          marginRight: isSidebarOpen ? "0" : "0",
          position: "relative",
        }}
      >
        <div>
          <div ref={printRef}>
            {splitMode === "Split" ? (
              <div
                ref={splitContainerRef}
                style={{ position: "relative", width, height, userSelect: draggingSplit ? "none" : "auto" }}
              >
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: `${splitPosition * 100}%`,
                  height: "100%",
                  overflow: "hidden",
                  pointerEvents: "none"
                }}>
                  <Stage width={width} height={height}>
                    <Layer>
                      {shapes.map(shape => renderShapeOutline(shape))}
                    </Layer>
                  </Stage>
                </div>
                <div style={{
                  position: "absolute",
                  left: `${splitPosition * 100}%`,
                  top: 0,
                  width: `${(1 - splitPosition) * 100}%`,
                  height: "100%",
                  overflow: "hidden",
                  pointerEvents: "none"
                }}>
                  <Stage width={width} height={height}>
                    <Layer>
                      {shapes.map(shape => renderShape(shape, { dispatch, selectedShapeId, selectedShapeIds, shapeRefs }))}
                    </Layer>
                  </Stage>
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: `${splitPosition * 100}%`,
                    top: 0,
                    width: 6,
                    height: "100%",
                    marginLeft: -3,
                    background: "rgba(0,0,0,0.15)",
                    borderLeft: "2px solid #007bff",
                    cursor: "ew-resize",
                    zIndex: 10,
                  }}
                  onMouseDown={() => setDraggingSplit(true)}
                />
              </div>
            ) : splitMode === "XRay" ? (
              <Stage
                width={width}
                height={height}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setXrayHoveredId(null)}
                style={{ cursor: toolCursors[selectedTool] ? "none" : "default" }}
                scaleX={scale}
                scaleY={scale}
                x={position.x}
                y={position.y}
                ref={stageRef}
                onWheel={handleWheel}
              >
                <Layer>
                  {shapes.map(shape =>
                    xrayHoveredId === shape.id
                      ? React.cloneElement(
                        renderShapeOutline(shape, {
                          onMouseEnter: () => setXrayHoveredId(shape.id),
                          onMouseLeave: () => setXrayHoveredId(null),
                          listening: true
                        }),
                        { key: shape.id }
                      )
                      : React.cloneElement(
                        renderShape(shape, {
                          onMouseEnter: () => setXrayHoveredId(shape.id),
                          onMouseLeave: () => setXrayHoveredId(null),
                          listening: true
                        }),
                        { key: shape.id }
                      )
                  )}
                </Layer>
              </Stage>
            ) : (
              <Stage
                width={width}
                height={height}
                onMouseDown={selectedTool === "Measurement" ? handleMeasurementMouseDown : handleMouseDown}
                onMouseMove={selectedTool === "Measurement" ? handleMeasurementMouseMove : handleMouseMove}
                onMouseUp={selectedTool === "Measurement" ? handleMeasurementMouseUp : handleMouseUp}
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
                    bezierOption === "Straight Segments" ? (
                      straightPoints.length > 1 && (
                        <Path
                          data={`M ${straightPoints.map((p) => `${p.x},${p.y}`).join(" L ")}${isShapeClosed ? " Z" : ""}`}
                          stroke="black"
                          strokeWidth={2}
                          fill={isShapeClosed ? fillColor : "transparent"}
                          closed={isShapeClosed}
                        />
                      )
                    ) : bezierOption === "Spiro Path" ? (
                      renderSpiroPath()
                    ) : bezierOption === "BSpline Path" ? (
                      renderBSplinePath()
                    ) : bezierOption === "Paraxial Line Segments" ? (
                      renderParaxialSegments()
                    ) : (
                      controlPoints.length > 1 && (
                        <Path
                          data={getBezierPath()}
                          stroke="black"
                          strokeWidth={2}
                          fill={isShapeClosed ? fillColor : "transparent"}
                          closed={isShapeClosed}
                        />
                      )
                    )
                  )}
                  {/* {snapText && (
                    <Text
                      x={snapText.x}
                      y={snapText.y}
                      text={snapText.text}
                      fontSize={16}
                      fill="#444"
                      fontStyle="bold"
                      stroke="white"
                      strokeWidth={2}
                      padding={4}
                      align="center"
                    />
                  )} */}
                  {/* {selectedTool === "Bezier" && bezierOption !== "Spiro Path" && (
                  <Path
                    data={getBezierPath()}
                    stroke="black"
                    strokeWidth={2}
                    fill={isShapeClosed ? fillColor : "black"}
                    closed={isShapeClosed}
                  />
                )} */}
                  {selectedTool === "Connector" && connectorDrag && (
                    <Line
                      points={[
                        connectorDrag.startPos.x, connectorDrag.startPos.y,
                        connectorDrag.currentPos.x, connectorDrag.currentPos.y
                      ]}
                      stroke="red"
                      strokeWidth={2}
                      dash={[6, 4]}
                      listening={false}
                    />
                  )}
                  {/* {selectedTool === "Bezier" && bezierOption == "Paraxial Line Segments" && (
                  <Path
                    data={getBezierPath()}
                    stroke="black"
                    strokeWidth={2}
                    fill={isShapeClosed ? fillColor : "black"}
                    closed={isShapeClosed}
                  />
                )} */}
                  {selectedTool === "Eraser" && eraserLines.map((line, i) => (
                    <Line
                      key={i}
                      points={applyTremorToPoints(line.points, eraserTremor)}
                      stroke={strokeColor}
                      strokeWidth={Math.max(1, eraserWidth * (1 - eraserThinning))}
                      tension={0.5}
                      lineCap={eraserCapString}
                      globalCompositeOperation="source-over"
                    />
                  ))}


                  {renderSpiroPath()}

                  {renderBSplinePath()}

                  {renderParaxialSegments()}

                  {dynamicOffsetMode && dynamicOffsetShapeId && (() => {
                    const shape = shapes.find(s => s.id === dynamicOffsetShapeId);
                    const basePoints = shapeToPoints(shape);
                    if (!basePoints || basePoints.length === 0) return null;
                    const offsetPoints = getOffsetPoints(basePoints, dynamicOffsetAmount);
                    if (!offsetPoints || offsetPoints.length === 0) return null;
                    const handlePoint = offsetPoints[0];
                    return (
                      <Circle
                        x={handlePoint.x}
                        y={handlePoint.y}
                        radius={10}
                        fill="orange"
                        draggable
                        onDragMove={e => {

                          const { x, y } = e.target.position();
                          const center = getShapeCenter(shape);
                          const dx = x - center.x;
                          const dy = y - center.y;
                          const newAmount = Math.sqrt(dx * dx + dy * dy) - getOriginalRadiusOrDistance(shape, handlePoint);
                          dispatch(setDynamicOffsetAmount(newAmount));
                        }}
                        onDragEnd={e => {
                          dispatch(updateShapePosition({
                            id: shape.id,
                            type: "Polygon",
                            points: downsamplePoints(offsetPoints, 200),
                            closed: true,
                          }));
                          dispatch(setDynamicOffsetMode(false));
                        }}
                      />
                    );
                  })()}
                  {shapes.map((shape) => renderShape(shape, { dispatch, selectedShapeId, selectedShapeIds, shapeRefs }))}
                  {shapes.map((shape) => {

                    if (shape.visible === false) return null;
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
                    if (shape.lpeEffect === "Offset" && shape.type === "Rectangle") {
                      const offset = shape.offsetAmount || 0;
                      return (
                        <Rect
                          key={shape.id}
                          id={shape.id}
                          x={shape.x - offset}
                          y={shape.y - offset}
                          width={shape.width + offset * 2}
                          height={shape.height + offset * 2}
                          fill={shape.fill}
                          stroke={shape.stroke}
                          strokeWidth={shape.strokeWidth}
                          draggable={!shape.locked}
                          onDragEnd={e => handleDragEnd(e, shape.id)}
                          onClick={e => {
                            e.cancelBubble = true;
                            if (!selectedShapeIds.includes(shape.id)) {
                              dispatch(selectShape(shape.id));
                            }
                          }}
                        />
                      );
                    }

                    if (shape.lpeEffect === "Offset" && shape.type === "Circle") {
                      const offset = shape.offsetAmount || 0;
                      return (
                        <Circle
                          key={shape.id}
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          radius={shape.radius + offset}
                          fill={shape.fill}
                          stroke={shape.stroke}
                          strokeWidth={shape.strokeWidth}
                          draggable={!shape.locked}
                          onDragEnd={e => handleDragEnd(e, shape.id)}
                          onClick={e => {
                            e.cancelBubble = true;
                            if (!selectedShapeIds.includes(shape.id)) {
                              dispatch(selectShape(shape.id));
                            }
                          }}
                        />
                      );
                    }
                    if (
                      shape.lpeEffect === "Offset" &&
                      (shape.type === "Polygon" || shape.type === "Star") &&
                      Array.isArray(shape.points)
                    ) {
                      const offset = shape.offsetAmount || 0;
                      const cx = shape.x || 0;
                      const cy = shape.y || 0;
                      const points = shape.points.map(pt => {
                        const dx = pt.x - cx;
                        const dy = pt.y - cy;
                        const len = Math.sqrt(dx * dx + dy * dy) || 1;
                        const scale = (len + offset) / len;
                        return {
                          x: cx + dx * scale,
                          y: cy + dy * scale
                        };
                      });
                      return (
                        <Path
                          key={shape.id}
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          data={generatePolygonPath(points)}
                          stroke={shape.stroke}
                          strokeWidth={shape.strokeWidth}
                          fill={shape.fill}
                          closed
                          draggable={!shape.locked}
                          onDragEnd={e => handleDragEnd(e, shape.id)}
                          onClick={e => {
                            e.cancelBubble = true;
                            if (!selectedShapeIds.includes(shape.id)) {
                              dispatch(selectShape(shape.id));
                            }
                          }}
                        />
                      );
                    }

                    if (
                      shape.lpeEffect === "Offset" &&
                      (shape.type === "Pencil" || shape.type === "Calligraphy") &&
                      Array.isArray(shape.points)
                    ) {
                      const offset = shape.offsetAmount || 0;
                      const offsetPts = getOffsetPoints(shape.points, offset);
                      return (
                        <Line
                          key={shape.id}
                          id={shape.id}
                          points={offsetPts.flatMap(p => [p.x, p.y])}
                          stroke={shape.stroke || shape.strokeColor || "black"}
                          strokeWidth={shape.strokeWidth || 2}
                          fill={shape.fill || "transparent"}
                          closed={shape.closed || false}
                          draggable={!shape.locked}
                          onDragEnd={e => handleDragEnd(e, shape.id)}
                          onClick={e => {
                            e.cancelBubble = true;
                            if (!selectedShapeIds.includes(shape.id)) {
                              dispatch(selectShape(shape.id));
                            }
                          }}
                        />
                      );
                    }
                    if (
                      shape.lpeEffect === "Power stroke" &&
                      shape.type === "Rectangle"
                    ) {
                      return (
                        <Rect
                          key={shape.id}
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          width={shape.width}
                          height={shape.height}
                          fill={shape.fill}
                          stroke={shape.stroke}
                          strokeWidth={shape.powerStrokeWidth || shape.strokeWidth || 10}
                          draggable={!shape.locked}
                          onDragEnd={e => handleDragEnd(e, shape.id)}
                          onClick={e => {
                            e.cancelBubble = true;
                            if (!selectedShapeIds.includes(shape.id)) {
                              dispatch(selectShape(shape.id));
                            }
                          }}
                        />
                      );
                    }
                    if (
                      shape.lpeEffect === "Power stroke" &&
                      shape.type === "Circle"
                    ) {
                      return (
                        <Circle
                          key={shape.id}
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          radius={shape.radius}
                          fill={shape.fill}
                          stroke={shape.stroke}
                          strokeWidth={shape.powerStrokeWidth || shape.strokeWidth || 10}
                          draggable={!shape.locked}
                          onDragEnd={e => handleDragEnd(e, shape.id)}
                          onClick={e => {
                            e.cancelBubble = true;
                            if (!selectedShapeIds.includes(shape.id)) {
                              dispatch(selectShape(shape.id));
                            }
                          }}
                        />
                      );
                    }

                    if (
                      shape.lpeEffect === "Power stroke" &&
                      shape.type === "Star"
                    ) {
                      return (
                        <Star
                          key={shape.id}
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          numPoints={shape.corners}
                          innerRadius={shape.innerRadius}
                          outerRadius={shape.outerRadius}
                          fill={shape.fill}
                          stroke={shape.stroke}
                          strokeWidth={shape.powerStrokeWidth || shape.strokeWidth || 10}
                          draggable={!shape.locked}
                          onDragEnd={e => handleDragEnd(e, shape.id)}
                          onClick={e => {
                            e.cancelBubble = true;
                            if (!selectedShapeIds.includes(shape.id)) {
                              dispatch(selectShape(shape.id));
                            }
                          }}
                        />
                      );
                    }

                    if (
                      shape.lpeEffect === "Power stroke" &&
                      shape.type === "Polygon" &&
                      Array.isArray(shape.points)
                    ) {
                      return (
                        <Path
                          key={shape.id}
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          data={generatePolygonPath(shape.points)}
                          fill={shape.fill}
                          stroke={shape.stroke}
                          strokeWidth={shape.powerStrokeWidth || shape.strokeWidth || 10}
                          closed
                          draggable={!shape.locked}
                          onDragEnd={e => handleDragEnd(e, shape.id)}
                          onClick={e => {
                            e.cancelBubble = true;
                            if (!selectedShapeIds.includes(shape.id)) {
                              dispatch(selectShape(shape.id));
                            }
                          }}
                        />
                      );
                    }
                    if (
                      shape.lpeEffect === "Power stroke" &&
                      (shape.type === "Pencil" || shape.type === "Calligraphy" || shape.type === "Polygon" || shape.type === "Path") &&
                      Array.isArray(shape.points)
                    ) {
                      return (
                        <Line
                          key={shape.id}
                          id={shape.id}
                          points={shape.points.flatMap(p => [p.x, p.y])}
                          stroke={shape.stroke || "black"}
                          strokeWidth={shape.powerStrokeWidth || 10}
                          fill={shape.fill}
                          closed={shape.closed || false}
                          lineCap="round"
                          lineJoin="round"
                          draggable={!shape.locked}
                          onDragEnd={e => handleDragEnd(e, shape.id)}
                          onClick={e => {
                            e.cancelBubble = true;
                            if (!selectedShapeIds.includes(shape.id)) {
                              dispatch(selectShape(shape.id));
                            }
                          }}
                        />
                      );
                    }
                    if (
                      shape.lpeEffect === "Taper stroke" &&
                      (shape.type === "Pencil" || shape.type === "Calligraphy" || shape.type === "Bezier") &&
                      Array.isArray(shape.points)
                    ) {
                      const points = shape.points;
                      const maxWidth = shape.taperStrokeWidth || 10;
                      const startTaper = shape.taperStart ?? 1;
                      const endTaper = shape.taperEnd ?? 1;
                      const isClosed = shape.closed || false;

                      if (isClosed) {
                        return (
                          <Line
                            key={shape.id}
                            id={shape.id}
                            points={points.flatMap(p => [p.x, p.y])}
                            stroke={shape.stroke || "black"}
                            strokeWidth={maxWidth}
                            fill={shape.fill || "black"}
                            closed={true}
                            lineCap="round"
                            lineJoin="round"
                            draggable={!shape.locked}
                            onDragEnd={e => handleDragEnd(e, shape.id)}
                            onClick={e => {
                              e.cancelBubble = true;
                              if (!selectedShapeIds.includes(shape.id)) {
                                dispatch(selectShape(shape.id));
                              }
                            }}
                          />
                        );
                      }

                      const lines = [];
                      for (let i = 1; i < points.length; i++) {
                        const t = i / (points.length - 1);
                        const width = maxWidth * ((1 - t) * startTaper + t * endTaper);
                        lines.push(
                          <Line
                            key={shape.id + "-taper-" + i}
                            points={[
                              points[i - 1].x, points[i - 1].y,
                              points[i].x, points[i].y
                            ]}
                            stroke={shape.stroke || "black"}
                            strokeWidth={Math.max(1, width)}
                            lineCap="round"
                            lineJoin="round"
                            draggable={!shape.locked}
                            onDragEnd={e => handleDragEnd(e, shape.id)}
                            onClick={e => {
                              e.cancelBubble = true;
                              if (!selectedShapeIds.includes(shape.id)) {
                                dispatch(selectShape(shape.id));
                              }
                            }}
                          />
                        );
                      }
                      return <>{lines}</>;
                    }
                    if (
                      shape.lpeEffect === "Envelope Deformation" &&
                      ["Pencil", "Calligraphy", "Bezier"].includes(shape.type) &&
                      shape.envelopeTop && shape.envelopeBottom && shape.envelopeLeft && shape.envelopeRight &&
                      Array.isArray(shape.points)
                    ) {
                      const [x1, y1, x2, y2] = shape.envelopeTop;
                      const [bx1, by1, bx2, by2] = shape.envelopeBottom;
                      const [lx1, ly1, lx2, ly2] = shape.envelopeLeft;
                      const [rx1, ry1, rx2, ry2] = shape.envelopeRight;

                      const normPoints = shape.points.map(p =>
                        Array.isArray(p) ? { x: p[0], y: p[1] } : { x: p.x, y: p.y }
                      );

                      const minX = Math.min(...normPoints.map(p => p.x));
                      const maxX = Math.max(...normPoints.map(p => p.x));
                      const minY = Math.min(...normPoints.map(p => p.y));
                      const maxY = Math.max(...normPoints.map(p => p.y));

                      const mappedPoints = normPoints.map((pt) => {
                        const u = (pt.x - minX) / (maxX - minX || 1);
                        const v = (pt.y - minY) / (maxY - minY || 1);

                        const topX = x1 + (x2 - x1) * u;
                        const topY = y1 + (y2 - y1) * u;
                        const botX = bx1 + (bx2 - bx1) * u;
                        const botY = by1 + (by2 - by1) * u;

                        const leftX = lx1 + (lx2 - lx1) * v;
                        const leftY = ly1 + (ly2 - ly1) * v;
                        const rightX = rx1 + (rx2 - rx1) * v;
                        const rightY = ry1 + (ry2 - ry1) * v;

                        const x = (1 - v) * topX + v * botX + (1 - u) * leftX + u * rightX - ((1 - u) * (1 - v) * x1 + u * (1 - v) * x2 + (1 - u) * v * bx1 + u * v * bx2);
                        const y = (1 - v) * topY + v * botY + (1 - u) * leftY + u * rightY - ((1 - u) * (1 - v) * y1 + u * (1 - v) * y2 + (1 - u) * v * by1 + u * v * by2);

                        return { x, y };
                      });
                      const isSelected = selectedShapeIds.includes(shape.id);
                      const renderEnvelopeHandle = (curve, idx, color, label) => (
                        <Circle
                          key={shape.id + "-env-handle-" + label + idx}
                          x={curve[idx * 2]}
                          y={curve[idx * 2 + 1]}
                          radius={8}
                          fill="#fff"
                          stroke={color}
                          strokeWidth={2}
                          draggable
                          onDragMove={e => {
                            const newCurve = [...curve];
                            newCurve[idx * 2] = e.target.x();
                            newCurve[idx * 2 + 1] = e.target.y();
                            let payload = { id: shape.id };
                            if (label === "top") payload.envelopeTop = newCurve;
                            if (label === "bottom") payload.envelopeBottom = newCurve;
                            if (label === "left") payload.envelopeLeft = newCurve;
                            if (label === "right") payload.envelopeRight = newCurve;
                            dispatch({
                              type: "tool/updateShapePosition",
                              payload
                            });
                          }}
                          onMouseEnter={e => {
                            e.target.getStage().container().style.cursor = "pointer";
                          }}
                          onMouseLeave={e => {
                            e.target.getStage().container().style.cursor = "default";
                          }}
                        />
                      );
                      return (
                        <>
                          <Line
                            key={shape.id + "-env-main"}
                            points={mappedPoints.flatMap(p => [p.x, p.y])}
                            stroke={shape.stroke || "black"}
                            strokeWidth={shape.strokeWidth || 2}
                            fill={shape.fill || "transparent"}
                            closed={shape.closed || false}
                          />
                          <Line key={shape.id + "-env-top"} points={[x1, y1, x2, y2]} stroke="red" strokeWidth={2} />
                          <Line key={shape.id + "-env-bottom"} points={[bx1, by1, bx2, by2]} stroke="blue" strokeWidth={2} />
                          <Line key={shape.id + "-env-left"} points={[lx1, ly1, lx2, ly2]} stroke="green" strokeWidth={2} />
                          <Line key={shape.id + "-env-right"} points={[rx1, ry1, rx2, ry2]} stroke="orange" strokeWidth={2} />
                          {isSelected && (
                            <>
                              {renderEnvelopeHandle(shape.envelopeTop, 0, "red", "top")}
                              {renderEnvelopeHandle(shape.envelopeTop, 1, "red", "top")}
                              {renderEnvelopeHandle(shape.envelopeBottom, 0, "blue", "bottom")}
                              {renderEnvelopeHandle(shape.envelopeBottom, 1, "blue", "bottom")}
                              {renderEnvelopeHandle(shape.envelopeLeft, 0, "green", "left")}
                              {renderEnvelopeHandle(shape.envelopeLeft, 1, "green", "left")}
                              {renderEnvelopeHandle(shape.envelopeRight, 0, "orange", "right")}
                              {renderEnvelopeHandle(shape.envelopeRight, 1, "orange", "right")}
                            </>
                          )}
                        </>
                      );
                    }
                    if (
                      shape.lpeEffect === "Lattice Deformation" &&
                      ["Pencil", "Calligraphy", "Bezier"].includes(shape.type) &&
                      Array.isArray(shape.points) &&
                      Array.isArray(shape.latticePoints) &&
                      shape.latticeRows && shape.latticeCols
                    ) {
                      const normPoints = shape.points.map(p =>
                        Array.isArray(p) ? { x: p[0], y: p[1] } : { x: p.x, y: p.y }
                      );
                      const minX = Math.min(...normPoints.map(p => p.x));
                      const maxX = Math.max(...normPoints.map(p => p.x));
                      const minY = Math.min(...normPoints.map(p => p.y));
                      const maxY = Math.max(...normPoints.map(p => p.y));

                      const getLatticePoint = (row, col) => {
                        const idx = row * shape.latticeCols + col;
                        return shape.latticePoints[idx] || [0, 0];
                      };

                      function latticeMap(x, y) {
                        const u = (x - minX) / (maxX - minX || 1);
                        const v = (y - minY) / (maxY - minY || 1);

                        const fx = u * (shape.latticeCols - 1);
                        const fy = v * (shape.latticeRows - 1);

                        const col = Math.floor(fx);
                        const row = Math.floor(fy);

                        const du = fx - col;
                        const dv = fy - row;

                        const col1 = Math.min(col, shape.latticeCols - 2);
                        const row1 = Math.min(row, shape.latticeRows - 2);

                        const p00 = getLatticePoint(row1, col1);
                        const p10 = getLatticePoint(row1, col1 + 1);
                        const p01 = getLatticePoint(row1 + 1, col1);
                        const p11 = getLatticePoint(row1 + 1, col1 + 1);

                        const xMapped =
                          (1 - du) * (1 - dv) * p00[0] +
                          du * (1 - dv) * p10[0] +
                          (1 - du) * dv * p01[0] +
                          du * dv * p11[0];
                        const yMapped =
                          (1 - du) * (1 - dv) * p00[1] +
                          du * (1 - dv) * p10[1] +
                          (1 - du) * dv * p01[1] +
                          du * dv * p11[1];

                        return { x: xMapped, y: yMapped };
                      }

                      const mappedPoints = normPoints.map(pt => latticeMap(pt.x, pt.y));
                      const isSelected = selectedShapeIds.includes(shape.id);
                      return (
                        <>
                          <Line
                            key={shape.id + "-lattice"}
                            points={mappedPoints.flatMap(p => [p.x, p.y])}
                            stroke={shape.stroke || "black"}
                            strokeWidth={shape.strokeWidth || 2}
                            fill={shape.fill || "transparent"}
                            closed={shape.closed || false}
                          />
                          {isSelected && shape.latticePoints.map(([x, y], idx) => (
                            <Circle
                              key={shape.id + "-lattice-handle-" + idx}
                              x={x}
                              y={y}
                              radius={7}
                              fill="#fff"
                              stroke="#007bff"
                              strokeWidth={2}
                              draggable
                              onDragMove={e => {
                                const newX = e.target.x();
                                const newY = e.target.y();
                                const newLatticePoints = [...shape.latticePoints];
                                newLatticePoints[idx] = [newX, newY];
                                dispatch({
                                  type: "tool/updateShapePosition",
                                  payload: {
                                    id: shape.id,
                                    latticePoints: newLatticePoints,
                                  }
                                });
                              }}
                              onMouseEnter={e => {
                                e.target.getStage().container().style.cursor = "pointer";
                              }}
                              onMouseLeave={e => {
                                e.target.getStage().container().style.cursor = "default";
                              }}
                            />
                          ))}
                        </>
                      );
                    }
                    if (
                      shape.lpeEffect === "Perspective/Envelope" &&
                      Array.isArray(shape.perspectiveCorners) &&
                      shape.perspectiveCorners.length === 4
                    ) {
                      const isSelected = selectedShapeIds.includes(shape.id);

                      const normPoints = shape.points.map(p =>
                        Array.isArray(p) ? { x: p[0], y: p[1] } : { x: p.x, y: p.y }
                      );
                      const minX = Math.min(...normPoints.map(p => p.x));
                      const maxX = Math.max(...normPoints.map(p => p.x));
                      const minY = Math.min(...normPoints.map(p => p.y));
                      const maxY = Math.max(...normPoints.map(p => p.y));

                      const [tl, tr, br, bl] = shape.perspectiveCorners;

                      function mapPoint(pt) {
                        const u = (pt.x - minX) / (maxX - minX || 1);
                        const v = (pt.y - minY) / (maxY - minY || 1);

                        const x =
                          (1 - u) * (1 - v) * tl[0] +
                          u * (1 - v) * tr[0] +
                          u * v * br[0] +
                          (1 - u) * v * bl[0];
                        const y =
                          (1 - u) * (1 - v) * tl[1] +
                          u * (1 - v) * tr[1] +
                          u * v * br[1] +
                          (1 - u) * v * bl[1];
                        return { x, y };
                      }

                      const mappedPoints = normPoints.map(mapPoint);

                      const isClosed = shape.closed !== undefined ? shape.closed : true;

                      return (
                        <>
                          <Line
                            points={mappedPoints.flatMap(p => [p.x, p.y])}
                            stroke={shape.stroke || "black"}
                            strokeWidth={shape.strokeWidth || 2}
                            fill={shape.fill || "transparent"}
                            closed={isClosed}
                          />
                          {isSelected && shape.perspectiveCorners.map(([x, y], idx) => (
                            <Circle
                              key={shape.id + "-persp-handle-" + idx}
                              x={x}
                              y={y}
                              radius={8}
                              fill="#fff"
                              stroke="#007bff"
                              strokeWidth={2}
                              draggable
                              onDragMove={e => {
                                const newCorners = [...shape.perspectiveCorners];
                                newCorners[idx] = [e.target.x(), e.target.y()];
                                dispatch({
                                  type: "tool/updateShapePosition",
                                  payload: {
                                    id: shape.id,
                                    perspectiveCorners: newCorners,
                                  }
                                });
                              }}
                              onMouseEnter={e => {
                                e.target.getStage().container().style.cursor = "pointer";
                              }}
                              onMouseLeave={e => {
                                e.target.getStage().container().style.cursor = "default";
                              }}
                            />
                          ))}
                        </>
                      );
                    }
                    if (
                      shape.lpeEffect === "Roughen"
                    ) {
                      let points = [];
                      if (shape.type === "Rectangle") {
                        points = [
                          { x: shape.x, y: shape.y },
                          { x: shape.x + shape.width, y: shape.y },
                          { x: shape.x + shape.width, y: shape.y + shape.height },
                          { x: shape.x, y: shape.y + shape.height }
                        ];
                      } else if (shape.type === "Circle") {
                        const num = 60;
                        for (let i = 0; i < num; i++) {
                          const angle = (i / num) * 2 * Math.PI;
                          points.push({
                            x: shape.x + shape.radius * Math.cos(angle),
                            y: shape.y + shape.radius * Math.sin(angle)
                          });
                        }
                      } else if (shape.type === "Star") {
                        const num = (shape.corners || 5) * 2;
                        for (let i = 0; i < num; i++) {
                          const angle = (i / num) * 2 * Math.PI - Math.PI / 2;
                          const r = i % 2 === 0 ? shape.outerRadius : shape.innerRadius;
                          points.push({
                            x: shape.x + r * Math.cos(angle),
                            y: shape.y + r * Math.sin(angle)
                          });
                        }
                      } else if (shape.type === "Polygon" && Array.isArray(shape.points)) {
                        points = shape.points.map(p => ({ x: p.x ?? p[0], y: p.y ?? p[1] }));
                        if (typeof shape.x === "number" && typeof shape.y === "number") {
                          points = points.map(p => ({ x: p.x + shape.x, y: p.y + shape.y }));
                        }
                      } else if (Array.isArray(shape.points)) {
                        points = shape.points.map(p => ({ x: p.x ?? p[0], y: p.y ?? p[1] }));
                      }

                      const amplitude = shape.roughenAmplitude || 10;
                      const frequency = shape.roughenFrequency || 3;
                      const roughPoints = shape.roughenPoints || applyRoughenEffect(points, amplitude, frequency);

                      if (
                        shape.type === "Rectangle" ||
                        shape.type === "Circle" ||
                        shape.type === "Star" ||
                        shape.type === "Polygon" ||
                        shape.closed
                      ) {
                        return (
                          <Path
                            key={shape.id}
                            data={
                              "M " +
                              roughPoints.map(p => `${p.x},${p.y}`).join(" L ") +
                              " Z"
                            }
                            stroke={shape.stroke || "black"}
                            strokeWidth={shape.strokeWidth || 2}
                            fill={shape.fill || "transparent"}
                            closed
                          />
                        );
                      } else {
                        return (
                          <Line
                            key={shape.id}
                            points={roughPoints.flatMap(p => [p.x, p.y])}
                            stroke={shape.stroke || "black"}
                            strokeWidth={shape.strokeWidth || 2}
                            fill={shape.fill || "transparent"}
                            closed={false}
                          />
                        );
                      }
                    }
                    if (
                      shape.lpeEffect === "Transform by 2 points" &&
                      shape.transform2Points &&
                      Array.isArray(shape.transform2Points.from) &&
                      Array.isArray(shape.transform2Points.to)
                    ) {
                      const { from, to } = shape.transform2Points;
                      if (from.length === 2 && to.length === 2) {
                        let points = shapeToPoints(shape);

                        function getTransformMatrix([A, B], [A2, B2]) {
                          const dx1 = B[0] - A[0], dy1 = B[1] - A[1];
                          const dx2 = B2[0] - A2[0], dy2 = B2[1] - A2[1];
                          const len1 = Math.hypot(dx1, dy1);
                          const len2 = Math.hypot(dx2, dy2);
                          const scale = len2 / (len1 || 1);
                          const angle1 = Math.atan2(dy1, dx1);
                          const angle2 = Math.atan2(dy2, dx2);
                          const theta = angle2 - angle1;
                          return { scale, theta, from: A, to: A2 };
                        }
                        const { scale, theta, from: [x0, y0], to: [x1, y1] } = getTransformMatrix(from, to);

                        const transformed = points.map(pt => {
                          let px = pt.x - x0;
                          let py = pt.y - y0;
                          px *= scale;
                          py *= scale;
                          const rx = px * Math.cos(theta) - py * Math.sin(theta);
                          const ry = px * Math.sin(theta) + py * Math.cos(theta);
                          return { x: rx + x1, y: ry + y1 };
                        });

                        const isClosed = shape.closed || shape.type === "Polygon" || shape.type === "Rectangle" || shape.type === "Circle" || shape.type === "Star";
                        const shapeElem = isClosed ? (
                          <Path
                            key={shape.id}
                            data={
                              "M " +
                              transformed.map(p => `${p.x},${p.y}`).join(" L ") +
                              " Z"
                            }
                            stroke={shape.stroke || "black"}
                            strokeWidth={shape.strokeWidth || 2}
                            fill={shape.fill || "transparent"}
                            closed
                          />
                        ) : (
                          <Line
                            key={shape.id}
                            points={transformed.flatMap(p => [p.x, p.y])}
                            stroke={shape.stroke || "black"}
                            strokeWidth={shape.strokeWidth || 2}
                            fill={shape.fill || "transparent"}
                            closed={false}
                          />
                        );

                        const isSelected = selectedShapeIds.includes(shape.id);
                        return (
                          <>
                            {shapeElem}
                            {isSelected && to.map(([hx, hy], idx) => (
                              <Circle
                                key={shape.id + "-transform2-handle-" + idx}
                                x={hx}
                                y={hy}
                                radius={8}
                                fill="#fff"
                                stroke={idx === 0 ? "#007bff" : "#ff007b"}
                                strokeWidth={2}
                                draggable
                                onDragMove={e => {
                                  const newTo = [...to];
                                  newTo[idx] = [e.target.x(), e.target.y()];
                                  dispatch({
                                    type: "tool/updateShapePosition",
                                    payload: {
                                      id: shape.id,
                                      transform2Points: {
                                        ...shape.transform2Points,
                                        to: newTo
                                      }
                                    }
                                  });
                                }}
                                onMouseEnter={e => {
                                  e.target.getStage().container().style.cursor = "pointer";
                                }}
                                onMouseLeave={e => {
                                  e.target.getStage().container().style.cursor = "default";
                                }}
                              />
                            ))}
                          </>
                        );
                      }
                    }
                    if (shape.powerClip && shape.powerClip.clipPathId) {
                      const clipShape = shapes.find(s => s.id === shape.powerClip.clipPathId);
                      if (!clipShape) return null;
                      return (
                        <Group key={shape.id} clipFunc={ctx => {
                          if (clipShape.type === "Polygon" && Array.isArray(clipShape.points)) {
                            ctx.beginPath();
                            clipShape.points.forEach((p, i) => {
                              if (i === 0) ctx.moveTo(p.x, p.y);
                              else ctx.lineTo(p.x, p.y);
                            });
                            ctx.closePath();
                          } else if (clipShape.type === "Rectangle") {
                            ctx.beginPath();
                            ctx.rect(clipShape.x, clipShape.y, clipShape.width, clipShape.height);
                            ctx.closePath();
                          } else if (clipShape.type === "Circle") {
                            ctx.beginPath();
                            ctx.arc(clipShape.x, clipShape.y, clipShape.radius, 0, Math.PI * 2);
                            ctx.closePath();
                          } else if (clipShape.type === "Star") {
                            ctx.beginPath();
                            const { x, y, innerRadius, outerRadius, corners } = clipShape;
                            for (let i = 0; i < corners * 2; i++) {
                              const angle = (Math.PI / corners) * i;
                              const r = i % 2 === 0 ? outerRadius : innerRadius;
                              const px = x + Math.cos(angle) * r;
                              const py = y + Math.sin(angle) * r;
                              if (i === 0) ctx.moveTo(px, py);
                              else ctx.lineTo(px, py);
                            }
                            ctx.closePath();
                          }
                        }}>
                          {renderShape(shape)}
                        </Group>
                      );
                    }
                    if (shape.powerMask && shape.powerMask.maskShapeId) {
                      const maskShape = shapes.find(s => s.id === shape.powerMask.maskShapeId);
                      if (!maskShape) return null;
                      return (
                        <Group key={shape.id} maskFunc={ctx => {
                          if (maskShape.type === "Polygon" && Array.isArray(maskShape.points)) {
                            ctx.beginPath();
                            maskShape.points.forEach((p, i) => {
                              if (i === 0) ctx.moveTo(p.x, p.y);
                              else ctx.lineTo(p.x, p.y);
                            });
                            ctx.closePath();
                          } else if (maskShape.type === "Rectangle") {
                            ctx.beginPath();
                            ctx.rect(maskShape.x, maskShape.y, maskShape.width, maskShape.height);
                            ctx.closePath();
                          } else if (maskShape.type === "Circle") {
                            ctx.beginPath();
                            ctx.arc(maskShape.x, maskShape.y, maskShape.radius, 0, Math.PI * 2);
                            ctx.closePath();
                          } else if (maskShape.type === "Star") {
                            ctx.beginPath();
                            const { x, y, innerRadius, outerRadius, corners } = maskShape;
                            for (let i = 0; i < corners * 2; i++) {
                              const angle = (Math.PI / corners) * i;
                              const r = i % 2 === 0 ? outerRadius : innerRadius;
                              const px = x + Math.cos(angle) * r;
                              const py = y + Math.sin(angle) * r;
                              if (i === 0) ctx.moveTo(px, py);
                              else ctx.lineTo(px, py);
                            }
                            ctx.closePath();
                          }
                        }}>
                          {renderShape(shape)}
                        </Group>
                      );
                    }
                    if (shape.rotateCopies && shape.lpeEffect === "Rotate copies") {
                      const { numCopies, angleStep } = shape.rotateCopies;
                      const center = getShapeCenter(shape);
                      return (
                        <Group key={shape.id + "-rotate-copies"}>
                          {Array.from({ length: numCopies }).map((_, i) => {
                            const angle = i * angleStep;
                            return (
                              <Group
                                key={shape.id + "-copy-" + i}
                                rotation={angle}
                                x={center.x}
                                y={center.y}
                              >
                                {renderShape({ ...shape, x: shape.x - center.x, y: shape.y - center.y, rotateCopies: undefined })}
                              </Group>
                            );
                          })}
                        </Group>
                      );
                    }
                    if (shape.sketchEffect && shape.lpeEffect === "Sketch") {
                      const { amplitude, frequency, passes } = shape.sketchEffect;
                      const basePoints = shapeToPoints(shape);

                      function getJitteredPoints(basePoints, amplitude, frequency, pass) {
                        return basePoints.map((p, i) => ({
                          x: p.x + Math.sin(i * frequency + pass) * amplitude,
                          y: p.y + Math.cos(i * frequency + pass) * amplitude
                        }));
                      }

                      const fillPoints = basePoints.flatMap(p => [p.x, p.y]);
                      return (
                        <Group key={shape.id + "-sketch"}>
                          <Line
                            points={fillPoints}
                            fill={shape.fill || "black"}
                            stroke="transparent"
                            closed={shape.closed || false}
                            opacity={0.3}
                          />
                          {Array.from({ length: passes }).map((_, pass) => (
                            <Line
                              key={shape.id + "-sketch-" + pass}
                              points={getJitteredPoints(basePoints, amplitude, frequency, pass).flatMap(p => [p.x, p.y])}
                              stroke={shape.stroke || "black"}
                              strokeWidth={shape.strokeWidth || 2}
                              fill="transparent"
                              opacity={0.7}
                              tension={0.8}
                              closed={shape.closed || false}
                            />
                          ))}
                        </Group>
                      );
                    }
                    if (shape.type === "polyline") {
                      return (
                        <Line
                          key={shape.id}
                          points={shape.points.flatMap((p) => [p.x, p.y])}
                          stroke={shape.stroke || "black"}
                          strokeWidth={shape.strokeWidth || 2}
                          fill={shape.fill || "transparent"}
                          closed={false}
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
                            if (shape.locked) return;
                            if (!selectedShapeIds.includes(shape.id)) {
                              dispatch(selectShape(shape.id));
                            }
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
                    {
                      shape.bloom && (
                        <Line
                          points={offsetPoints.map(p => [p.x - (shape.x || 0), p.y - (shape.y || 0)]).flat()}
                          closed
                          fill={shape.fill || "transparent"}
                          stroke={shape.stroke || "yellow"}
                          strokeWidth={(shape.strokeWidth || 2) + (shape.bloom.radius || 16)}
                          opacity={0.5 * (shape.bloom.brightness || 1.5)}
                          listening={false}
                          filters={[Konva.Filters.Blur]}
                          blurRadius={shape.bloom?.radius || 16}
                        />
                      )
                    }
                    if (shape.type === "LinkedOffset") {
                      const source = shapes.find(s => s.id === shape.linkedTo);
                      if (!source) return null;
                      const basePoints = shapeToPoints(source);
                      const offsetPoints = getOffsetPoints(basePoints, shape.offsetAmount);
                      const handlePoint = offsetPoints[0];
                      const center = getShapeCenter(source);
                      const isSelected = selectedShapeIds.includes(shape.id);

                      return (
                        <Group
                          key={shape.id}
                          id={shape.id}
                          x={shape.x || 0}
                          y={shape.y || 0}
                          draggable
                          ref={node => {
                            if (node) shapeRefs.current[shape.id] = node;
                            else delete shapeRefs.current[shape.id];
                          }}
                          onClick={e => {
                            e.cancelBubble = true;
                            if (!selectedShapeIds.includes(shape.id)) {
                              dispatch(selectShape(shape.id));
                            }
                          }}
                          onDragEnd={e => {
                            const { x, y } = e.target.position();
                            dispatch(updateShapePosition({ id: shape.id, x, y }));
                          }}
                        >
                          <Line
                            points={offsetPoints.map(p => [p.x - (shape.x || 0), p.y - (shape.y || 0)]).flat()}
                            closed
                            fill={shape.fill || "transparent"}
                            stroke={shape.stroke || "black"}
                            strokeWidth={shape.strokeWidth || 2}
                            opacity={0.5}
                          />
                          <Circle
                            x={handlePoint.x - (shape.x || 0)}
                            y={handlePoint.y - (shape.y || 0)}
                            radius={8}
                            fill="orange"
                            draggable
                            onDragMove={e => {
                              const { x, y } = e.target.position();
                              const dx = x + (shape.x || 0) - center.x;
                              const dy = y + (shape.y || 0) - center.y;
                              const newAmount = Math.sqrt(dx * dx + dy * dy) - getOriginalRadiusOrDistance(source, handlePoint);
                              dispatch(updateShapePosition({
                                id: shape.id,
                                offsetAmount: newAmount,
                              }));
                            }}
                          />
                          {isSelected && !shape.locked && shapeRefs.current[shape.id] && (selectedTool === "Select" || selectedTool === "Bezier") && (
                            <Transformer
                              ref={transformerRef}
                              nodes={selectedShapeIds.map(id => shapeRefs.current[id]).filter(Boolean)}
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
                        </Group>
                      );
                    }
                    if (shape.type === "Clone") {

                      const original = shapes.find(s => s.id === shape.cloneOf);
                      if (!original) return null;


                      const cloneShape = {
                        ...original,
                        id: shape.id,
                        x: shape.x ?? original.x,
                        y: shape.y ?? original.y,
                        name: shape.name,
                        isClone: true,
                      };


                      if (original.type === "Rectangle") {
                        return (
                          <Rect
                            key={cloneShape.id}
                            id={cloneShape.id}
                            x={cloneShape.x}
                            y={cloneShape.y}
                            width={original.width}
                            height={original.height}
                            fill={original.fill || "black"}
                            stroke={original.stroke || "black"}
                            strokeWidth={original.strokeWidth || 1}
                            draggable
                            onClick={e => {
                              e.cancelBubble = true;
                              if (!selectedShapeIds.includes(cloneShape.id)) {
                                dispatch(selectShape(cloneShape.id));
                              }
                            }}
                            onDragEnd={e => {
                              const { x, y } = e.target.position();
                              dispatch(updateShapePosition({ id: cloneShape.id, x, y }));
                            }}
                          />
                        );
                      }

                      if (original.type === "Circle") {
                        return (
                          <Circle
                            key={cloneShape.id}
                            id={cloneShape.id}
                            x={cloneShape.x}
                            y={cloneShape.y}
                            radius={original.radius}
                            innerRadius={original.innerRadius}
                            outerRadius={original.outerRadius}
                            fill={original.fill || "black"}
                            stroke={original.stroke || "black"}
                            strokeWidth={original.strokeWidth || 1}
                            draggable
                            onClick={e => {
                              e.cancelBubble = true;
                              if (!selectedShapeIds.includes(cloneShape.id)) {
                                dispatch(selectShape(cloneShape.id));
                              }
                            }}
                            onDragEnd={e => {
                              const { x, y } = e.target.position();
                              dispatch(updateShapePosition({ id: cloneShape.id, x, y }));
                            }}
                          />
                        );
                      }

                      if (original.type === "Star") {
                        return (
                          <Star
                            key={cloneShape.id}
                            id={cloneShape.id}
                            x={cloneShape.x}
                            y={cloneShape.y}
                            numPoints={original.corners}
                            innerRadius={original.innerRadius}
                            outerRadius={original.outerRadius}
                            fill={original.fill || "black"}
                            rotation={original.rotation}
                            scaleX={original.scaleX}
                            scaleY={original.scaleY}
                            stroke={original.stroke || "black"}
                            strokeWidth={original.strokeWidth || 1}
                            draggable
                            onClick={e => {
                              e.cancelBubble = true;
                              if (!selectedShapeIds.includes(cloneShape.id)) {
                                dispatch(selectShape(cloneShape.id));
                              }
                            }}
                            onDragEnd={e => {
                              const { x, y } = e.target.position();
                              dispatch(updateShapePosition({ id: cloneShape.id, x, y }));
                            }}
                          />
                        );
                      }

                      if (original.type === "Polygon") {
                        return (
                          <Line
                            key={cloneShape.id}
                            id={cloneShape.id}
                            x={cloneShape.x}
                            y={cloneShape.y}
                            points={original.points.flatMap(pt => [pt.x, pt.y])}
                            closed
                            fill={original.fill || "black"}
                            stroke={original.stroke || "black"}
                            strokeWidth={original.strokeWidth || 1}
                            draggable
                            onClick={e => {
                              e.cancelBubble = true;
                              if (!selectedShapeIds.includes(cloneShape.id)) {
                                dispatch(selectShape(cloneShape.id));
                              }
                            }}
                            onDragEnd={e => {
                              const { x, y } = e.target.position();
                              dispatch(updateShapePosition({ id: cloneShape.id, x, y }));
                            }}
                          />
                        );
                      }

                      return null;
                    }
                    if (shape.type === "Rectangle") {
                      return (
                        <React.Fragment key={shape.id}>
                          {shape.bloom && (
                            <Rect
                              x={shape.x}
                              y={shape.y}
                              width={shape.width}
                              height={shape.height}
                              fill={brightenColor(shape.fill || "#ffffff", shape.bloom.brightness)}
                              opacity={0.5}
                              blurRadius={shape.bloom.radius}
                              filters={[Konva.Filters.Blur]}
                              listening={false}
                              globalCompositeOperation="lighter"
                            />
                          )}
                          {shape.mesh && shape.mesh.nodes ? (
                            <Group
                              ref={node => {
                                if (node) shapeRefs.current[shape.id] = node;
                                else delete shapeRefs.current[shape.id];
                              }}
                              key={shape.id}
                              id={shape.id}
                            >
                              {shape.mesh.nodes.slice(0, -1).map((row, r) =>
                                row.slice(0, -1).map((node, c) => {
                                  const p1 = node;
                                  const p2 = shape.mesh.nodes[r][c + 1];
                                  const p3 = shape.mesh.nodes[r + 1][c + 1];
                                  const p4 = shape.mesh.nodes[r + 1][c];
                                  function hexToRgb(hex) {
                                    hex = hex.replace(/^#/, "");
                                    if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
                                    const num = parseInt(hex, 16);
                                    return {
                                      r: (num >> 16) & 255,
                                      g: (num >> 8) & 255,
                                      b: num & 255
                                    };
                                  }
                                  function rgbToHex({ r, g, b }) {
                                    return (
                                      "#" +
                                      [r, g, b]
                                        .map((x) => {
                                          const hex = x.toString(16);
                                          return hex.length === 1 ? "0" + hex : hex;
                                        })
                                        .join("")
                                    );
                                  }
                                  function avgColor(colors) {
                                    const rgbs = colors.map(hexToRgb);
                                    const r = Math.round(rgbs.reduce((sum, c) => sum + c.r, 0) / rgbs.length);
                                    const g = Math.round(rgbs.reduce((sum, c) => sum + c.g, 0) / rgbs.length);
                                    const b = Math.round(rgbs.reduce((sum, c) => sum + c.b, 0) / rgbs.length);
                                    return rgbToHex({ r, g, b });
                                  }
                                  const fillColor = avgColor([p1.color, p2.color, p3.color, p4.color]);
                                  return (
                                    <Line
                                      key={`${r}-${c}`}
                                      points={[p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y]}
                                      closed
                                      fill={fillColor}
                                      stroke={isSelected ? "#888" : undefined}
                                      strokeWidth={isSelected ? 1 : 0}
                                    />
                                  );
                                })
                              )}
                              {shape.mesh.nodes.flat().map((node, idx) => (
                                <Circle
                                  key={`white-${idx}`}
                                  x={node.x}
                                  y={node.y}
                                  radius={Math.min(
                                    shape.width / (shape.mesh.cols * 2),
                                    shape.height / (shape.mesh.rows * 2),
                                    32
                                  )}
                                  fill="rgba(255,255,255,0.35)"
                                  listening={false}
                                />
                              ))}
                              {selectedTool === "Mesh" && isSelected && shape.mesh.nodes.flat().map((node, idx) => (
                                <Circle
                                  key={idx}
                                  x={node.x}
                                  y={node.y}
                                  radius={6}
                                  fill={blendWithWhite(node.color, 0.7)}
                                  stroke="#000"
                                  strokeWidth={1}
                                  draggable
                                  onDragMove={e => {
                                    const { x, y } = e.target.position();

                                    dispatch({
                                      type: "tool/updateMeshNode",
                                      payload: { meshId: shape.id, nodeIdx: idx, x, y }
                                    });


                                    if (
                                      shape.fill &&
                                      (shape.fill.type === "linear-gradient" || shape.fill.type === "radial-gradient")
                                    ) {
                                      let newFill = { ...shape.fill };
                                      if (shape.fill.type === "linear-gradient") {
                                        if (idx === 0) {
                                          newFill.start = { x, y };
                                        } else if (idx === shape.mesh.nodes.flat().length - 1) {
                                          newFill.end = { x, y };
                                        }
                                      } else if (shape.fill.type === "radial-gradient") {
                                        if (idx === 0) {
                                          newFill.center = { x, y };
                                        } else if (idx === shape.mesh.nodes.flat().length - 1) {
                                          const dx = x - newFill.center.x;
                                          const dy = y - newFill.center.y;
                                          newFill.radius = Math.sqrt(dx * dx + dy * dy);
                                        }
                                      }
                                      dispatch(
                                        updateShapePosition({
                                          id: shape.id,
                                          fill: newFill
                                        })
                                      );
                                    }
                                  }}
                                />
                              ))}
                            </Group>
                          ) : (
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
                              fill={
                                grayScale
                                  ? (typeof shape.fill === "string" ? toGray(shape.fill) : "#888")
                                  : (
                                    typeof shape.fill === "string"
                                      ? shape.fill
                                      : (shape.fill && shape.fill.type === "pattern"
                                        ? (patternImages[shape.id + ":fill"] ? undefined : "#ccc")
                                        : "transparent")
                                  )
                              }
                              fillPatternImage={
                                shape.fill && shape.fill.type === "pattern"
                                  ? patternImages[shape.id + ":fill"]
                                  : undefined
                              }
                              fillPatternRepeat="repeat"
                              strokePatternImage={
                                shape.stroke && shape.stroke.type === "pattern"
                                  ? patternImages[shape.id + ":stroke"]
                                  : undefined
                              }
                              fillLinearGradientStartPoint={
                                shape.gradientTarget === "fill" && shape.fill?.type === "linear-gradient"
                                  ? shape.fill.start
                                  : undefined
                              }
                              fillLinearGradientEndPoint={
                                shape.gradientTarget === "fill" && shape.fill?.type === "linear-gradient"
                                  ? shape.fill.end
                                  : undefined
                              }
                              fillLinearGradientColorStops={
                                shape.gradientTarget === "fill" && shape.fill?.type === "linear-gradient"
                                  ? getLinearGradientColorStops(shape.fill)
                                  : undefined
                              }
                              fillRadialGradientStartPoint={shape.fill?.type === "radial-gradient" ? shape.fill.center : undefined}
                              fillRadialGradientEndPoint={shape.fill?.type === "radial-gradient" && shape.fill.radius !== undefined
                                ? { x: shape.fill.center.x + shape.fill.radius, y: shape.fill.center.y }
                                : undefined}
                              fillRadialGradientColorStops={shape.fill?.type === "radial-gradient"
                                ? shape.fill.colors.flatMap(stop => [stop.pos, stop.color])
                                : undefined}
                              stroke={
                                grayScale
                                  ? (typeof shape.stroke === "string" ? toGray(shape.stroke) : "#444")
                                  : (
                                    shape.stroke?.type === "linear-gradient"
                                      ? undefined
                                      : shape.fill?.type === "mesh-gradient"
                                        ? calculateMeshGradientStroke(shape.fill.nodes)
                                        : shape.stroke || "black"
                                  )
                              }
                              strokeLinearGradientStartPoint={
                                shape.gradientTarget === "stroke" && shape.stroke?.type === "linear-gradient"
                                  ? shape.stroke.start
                                  : undefined
                              }
                              strokeLinearGradientEndPoint={
                                shape.gradientTarget === "stroke" && shape.stroke?.type === "linear-gradient"
                                  ? shape.stroke.end
                                  : undefined
                              }
                              strokeLinearGradientColorStops={
                                shape.gradientTarget === "stroke" && shape.stroke?.type === "linear-gradient"
                                  ? shape.stroke.colors.flatMap(stop => [stop.pos, stop.color])
                                  : undefined
                              }
                              strokeRadialGradientStartPoint={shape.stroke?.type === "radial-gradient" ? shape.stroke.center : undefined}
                              strokeRadialGradientEndPoint={shape.stroke?.type === "radial-gradient" && shape.stroke.radius !== undefined
                                ? {
                                  x: shape.stroke.center.x + shape.stroke.radius,
                                  y: shape.stroke.center.y
                                }
                                : undefined}
                              strokeRadialGradientColorStops={shape.stroke?.type === "radial-gradient"
                                ? shape.stroke.colors.flatMap(stop => [stop.pos, stop.color])
                                : undefined}
                              strokeWidth={shape.strokeWidth || 1}
                              cornerRadius={tempCornerRadius !== null ? tempCornerRadius : shape.cornerRadius}
                              dash={getDashArray(shape.strokeStyle)}
                              rotation={shape.rotation || 0}
                              scaleX={shape.scaleX || 1}
                              scaleY={shape.scaleY || 1}
                              blur={shape.blur || 0}
                              shadowBlur={shape.blur || 0}
                              shadowColor={shape.fill || "#fff"}
                              draggable={!shape.locked && selectedTool !== "Node" && selectedTool !== "Mesh" && selectedTool !== "Connector"}
                              onDragMove={handleDragMove}
                              onDragEnd={(e) => handleDragEnd(e, shape.id)}
                              onTransformEnd={(e) => handleResizeEnd(e, shape.id)}
                              onMouseEnter={() => {
                                if (selectedTool === "Measurement") setHoveredShape(shape);
                              }}
                              onMouseLeave={() => {
                                if (selectedTool === "Measurement") setHoveredShape(null);
                              }}
                              skewX={shape.skewX || 0}
                              skewY={shape.skewY || 0}
                              onClick={(e) => {
                                e.cancelBubble = true;
                                if (shape.locked) return;
                                handleShapeClick(shape);
                                if (selectedTool !== "Dropper") {
                                  if (e.evt.ctrlKey && selectedShape) {

                                    dispatch(
                                      selectNodePoint({
                                        shapeId: selectedShape.id,
                                        index,
                                        x: point.x,
                                        y: point.y,
                                      })
                                    );
                                  } else if (sprayEraserMode) {
                                    dispatch(deleteShape(shape.id));
                                  } else if (selectedTool === "Eraser" && eraserMode === "delete") {
                                    dispatch(deleteShape(shape.id));
                                  } else {

                                    if (!selectedShapeIds.includes(shape.id)) {
                                      dispatch(selectShape(shape.id));
                                    }
                                  }
                                }
                              }}
                            />
                          )}
                          {isSelected && !shape.locked && shapeRefs.current[shape.id] && selectedTool !== "Node" && (
                            <Transformer
                              ref={transformerRef}
                              nodes={selectedShapeIds.map(id => shapeRefs.current[id]).filter(Boolean)}
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
                          {/* {isSelected && selectedTool === "Rectangle" && (
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
                        )} */}
                        </React.Fragment>
                      );
                    } else if (shape.type === "3DBox") {
                      return renderShape(shape, { dispatch, selectedShapeId, selectedShapeIds, shapeRefs });
                    } else if (shape.type === "Bezier") {
                      const isSelected = selectedShapeIds.includes(shape.id);
                      return (
                        <React.Fragment key={shape.id}>
                          <Path
                            ref={(node) => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                              console.log("Bezier ref for", shape.id, node);
                            }}
                            id={shape.id}
                            data={getBezierPathFromPoints(shape.points, shape.closed)}
                            stroke={isSelected ? "blue" : shape.stroke || shape.strokeColor || "black"}
                            strokeWidth={shape.strokeWidth || 2}
                            fill={shape.fill || (shape.closed ? shape.fillColor : "transparent")}
                            closed={shape.closed}
                            rotation={shape.rotation || 0}
                            draggable={!shape.locked && selectedTool !== "Node" && selectedTool !== "Mesh" && selectedTool !== "Connector"}
                            onDragMove={handleDragMove}
                            dash={getDashArray(shape.strokeStyle)}
                            onClick={(e) => {
                              e.cancelBubble = true;
                              if (shape.locked) return;
                              if (!selectedShapeIds.includes(shape.id)) {
                                dispatch(selectShape(shape.id));
                              }
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
                          {isSelected && !shape.locked && shapeRefs.current[shape.id] && selectedTool !== "Node" && (
                            <Transformer
                              ref={transformerRef}
                              nodes={selectedShapeIds.map(id => shapeRefs.current[id]).filter(Boolean)}
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
                        </React.Fragment>
                      );
                    } else if (shape.type === "Spiro Path") {
                      const isSelected = selectedShapeIds.includes(shape.id);
                      return (
                        <React.Fragment key={shape.id}>
                          <Path
                            ref={(node) => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                            }}
                            id={shape.id}
                            data={shape.path}
                            stroke={shape.stroke || "black"}
                            strokeWidth={shape.strokeWidth || 2}
                            fill={shape.fill || (shape.closed ? shape.fill : "black")}
                            closed={shape.closed || false}
                            rotation={shape.rotation || 0}
                            draggable={!shape.locked && selectedTool !== "Node"}
                            onDragMove={handleDragMove}
                            dash={getDashArray(shape.strokeStyle)}
                            onClick={(e) => {
                              e.cancelBubble = true;
                              if (shape.locked) return;
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

                                if (!selectedShapeIds.includes(shape.id)) {
                                  dispatch(selectShape(shape.id));
                                }
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
                          {isSelected && !shape.locked && shapeRefs.current[shape.id] && selectedTool !== "Node" && (
                            <Transformer
                              ref={transformerRef}
                              nodes={selectedShapeIds.map(id => shapeRefs.current[id]).filter(Boolean)}
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
                        </React.Fragment>
                      );
                    }
                    else if (shape.type === "Image") {
                      const isSelected = selectedShapeIds.includes(shape.id);
                      return (
                        <React.Fragment key={shape.id}>
                          <Group
                            x={shape.x}
                            y={shape.y}
                            clipFunc={
                              shape.inverseClipPath
                                ? ctx => {
                                  ctx.beginPath();
                                  shape.inverseClipPath[0].forEach((pt, i) => {
                                    if (i === 0) ctx.moveTo(pt.x, pt.y);
                                    else ctx.lineTo(pt.x, pt.y);
                                  });
                                  ctx.closePath();
                                  ctx.moveTo(shape.inverseClipPath[1][0].x, shape.inverseClipPath[1][0].y);
                                  for (let i = 1; i < shape.inverseClipPath[1].length; i++) {
                                    ctx.lineTo(shape.inverseClipPath[1][i].x, shape.inverseClipPath[1][i].y);
                                  }
                                  ctx.closePath();
                                  ctx.clip('evenodd');
                                }
                                : shape.clipPath
                                  ? ctx => {
                                    ctx.beginPath();
                                    shape.clipPath.forEach((pt, i) => {
                                      if (i === 0) ctx.moveTo(pt.x, pt.y);
                                      else ctx.lineTo(pt.x, pt.y);
                                    });
                                    ctx.closePath();
                                  }
                                  : shape.maskPath
                                    ? ctx => {
                                      ctx.beginPath();
                                      shape.maskPath.forEach((pt, i) => {
                                        if (i === 0) ctx.moveTo(pt.x, pt.y);
                                        else ctx.lineTo(pt.x, pt.y);
                                      });
                                      ctx.closePath();
                                    }
                                    : shape.inverseMaskPath
                                      ? ctx => {
                                        ctx.beginPath();
                                        shape.inverseMaskPath[0].forEach((pt, i) => {
                                          if (i === 0) ctx.moveTo(pt.x, pt.y);
                                          else ctx.lineTo(pt.x, pt.y);
                                        });
                                        ctx.closePath();
                                        ctx.moveTo(shape.inverseMaskPath[1][0].x, shape.inverseMaskPath[1][0].y);
                                        shape.inverseMaskPath[1].forEach((pt, i) => {
                                          if (i === 0) ctx.moveTo(pt.x, pt.y);
                                          else ctx.lineTo(pt.x, pt.y);
                                        });
                                        ctx.closePath();
                                        ctx.clip("evenodd");
                                      }
                                      : undefined
                            }
                          >
                            <CanvasImage
                              ref={node => {
                                if (node) shapeRefs.current[shape.id] = node;
                                else delete shapeRefs.current[shape.id];
                              }}
                              id={shape.id}
                              shape={{ ...shape, x: 0, y: 0 }}
                              x={0}
                              y={0}
                              draggable={!shape.locked && selectedTool === "Select"}
                              dash={getDashArray(shape.strokeStyle)}
                              onClick={e => {
                                e.cancelBubble = true;
                                if (!selectedShapeIds.includes(shape.id)) {
                                  dispatch(selectShape(shape.id));
                                }
                              }}
                              onDragEnd={e => {
                                const { x, y } = e.target.position();
                                dispatch(updateShapePosition({ id: shape.id, x, y }));
                              }}
                            />
                          </Group>
                          {isSelected && !shape.locked && shapeRefs.current[shape.id] && selectedTool !== "Node" && (
                            <Transformer
                              ref={transformerRef}
                              nodes={selectedShapeIds.map(id => shapeRefs.current[id]).filter(Boolean)}
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
                        </React.Fragment>
                      );
                    } else if (shape.type === "Circle") {
                      const isSelected = selectedShapeIds.includes(shape.id);
                      const arcType = shape.arcType || "slice";
                      if (arcType === "arc") {
                        return (
                          <Arc
                            ref={(node) => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                            }}
                            id={shape.id}
                            x={shape.x}
                            y={shape.y}
                            innerRadius={shape.radius * 0.7}
                            outerRadius={shape.radius}
                            angle={shape.arcAngle || 360}
                            fill={shape.fill || "transparent"}
                            stroke={shape.stroke || "black"}
                            strokeWidth={shape.strokeWidth || 1}
                            rotation={shape.rotation || 0}
                            closed={false}
                            dash={[10, 10]}
                            draggable={!shape.locked && selectedTool !== "Node" && selectedTool !== "Connector"}
                            onDragMove={handleDragMove}
                            onDragEnd={(e) => {
                              const { x, y } = e.target.position();
                              dispatch(updateShapePosition({ id: shape.id, x, y }));
                            }}
                          />
                        );
                      }

                      if (arcType === "chord") {
                        return (
                          <Arc
                            ref={(node) => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                            }}
                            id={shape.id}
                            x={shape.x}
                            y={shape.y}
                            innerRadius={0}
                            outerRadius={shape.radius}
                            angle={shape.arcAngle || 360}
                            fill="transparent"
                            stroke={shape.stroke || "black"}
                            strokeWidth={shape.strokeWidth || 1}
                            rotation={shape.rotation || 0}
                            closed={true}
                            draggable={!shape.locked && selectedTool !== "Node" && selectedTool !== "Connector"}
                            onDragMove={handleDragMove}
                            onDragEnd={(e) => {
                              const { x, y } = e.target.position();
                              dispatch(updateShapePosition({ id: shape.id, x, y }));
                            }}
                          />
                        );
                      }

                      if (arcType === "ellipse") {
                        return (
                          <Ellipse
                            ref={node => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                            }}
                            id={shape.id}
                            x={shape.x}
                            y={shape.y}
                            radiusX={shape.radiusX || shape.radius}
                            radiusY={shape.radiusY || shape.radius}
                            fill={shape.fill || "transparent"}
                            stroke={shape.stroke || "black"}
                            strokeWidth={shape.strokeWidth || 1}
                            rotation={shape.rotation || 0}
                            draggable={!shape.locked && selectedTool !== "Node" && selectedTool !== "Connector"}
                            onDragMove={handleDragMove}
                            onDragEnd={e => {
                              const { x, y } = e.target.position();
                              dispatch(updateShapePosition({ id: shape.id, x, y }));
                            }}
                          />
                        );
                      }
                      return (
                        <React.Fragment key={shape.id}>
                          <Circle
                            ref={(node) => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                            }}
                            id={shape.id}
                            x={shape.x}
                            y={shape.y}
                            radius={shape.radius}
                            innerRadius={0}
                            outerRadius={shape.radius || 0}
                            angle={shape.arcAngle || 360}
                            fill={
                              shape.fill?.type === "linear-gradient" || shape.fill?.type === "radial-gradient"
                                ? undefined
                                : shape.fill || "transparent"
                            }
                            fillLinearGradientStartPoint={shape.fill?.type === "linear-gradient" ? shape.fill.start : undefined}
                            fillLinearGradientEndPoint={shape.fill?.type === "linear-gradient" ? shape.fill.end : undefined}
                            fillLinearGradientColorStops={shape.fill?.type === "linear-gradient" ? shape.fill.colors.flatMap(stop => [stop.pos, stop.color]) : undefined}
                            fillRadialGradientStartPoint={shape.fill?.type === "radial-gradient" ? shape.fill.center : undefined}
                            fillRadialGradientEndPoint={shape.fill?.type === "radial-gradient" ? { x: shape.fill.center.x, y: shape.fill.center.y + shape.fill.radius } : undefined}
                            fillRadialGradientColorStops={shape.fill?.type === "radial-gradient" ? shape.fill.colors.flatMap(stop => [stop.pos, stop.color]) : undefined}
                            stroke={
                              shape.stroke?.type === "linear-gradient" || shape.stroke?.type === "radial-gradient"
                                ? undefined
                                : shape.stroke || "black"
                            }
                            strokeLinearGradientStartPoint={shape.stroke?.type === "linear-gradient" ? shape.stroke.start : undefined}
                            strokeLinearGradientEndPoint={shape.stroke?.type === "linear-gradient" ? shape.stroke.end : undefined}
                            strokeLinearGradientColorStops={shape.stroke?.type === "linear-gradient" ? shape.stroke.colors.flatMap(stop => [stop.pos, stop.color]) : undefined}
                            strokeRadialGradientStartPoint={shape.stroke?.type === "radial-gradient" ? shape.stroke.center : undefined}
                            strokeRadialGradientEndPoint={shape.stroke?.type === "radial-gradient" ? { x: shape.stroke.center.x, y: shape.stroke.center.y + shape.stroke.radius } : undefined}
                            strokeRadialGradientColorStops={shape.stroke?.type === "radial-gradient" ? shape.stroke.colors.flatMap(stop => [stop.pos, stop.color]) : undefined}
                            strokeWidth={shape.strokeWidth || 1}

                            rotation={shape.rotation || 0}
                            scaleX={shape.horizontalRadius / shape.radius || 1}
                            scaleY={shape.verticalRadius / shape.radius || 1}
                            draggable={!shape.locked && selectedTool !== "Node" && selectedTool !== "Connector" && selectedTool !== "Gradient"}
                            onDragMove={handleDragMove}
                            skewX={shape.skewX || 0}
                            blur={shape.blur || 0}
                            shadowBlur={shape.blur || 0}
                            shadowColor={shape.fill || "#fff"}
                            closed={false}
                            skewY={shape.skewY || 0}
                            onMouseEnter={() => {
                              if (selectedTool === "Measurement") setHoveredShape(shape);
                            }}
                            onMouseLeave={() => {
                              if (selectedTool === "Measurement") setHoveredShape(null);
                            }}
                            onClick={(e) => {
                              e.cancelBubble = true;
                              if (shape.locked) return;
                              handleShapeClick(shape);
                              if (selectedTool !== "Dropper") {
                                if (e.evt.ctrlKey && selectedShape) {

                                  dispatch(
                                    selectNodePoint({
                                      shapeId: selectedShape.id,
                                      index,
                                      x: point.x,
                                      y: point.y,
                                    })
                                  );
                                } else if (sprayEraserMode) {
                                  dispatch(deleteShape(shape.id));
                                } else if (selectedTool === "Eraser" && eraserMode === "delete") {
                                  dispatch(deleteShape(shape.id));
                                } else {

                                  if (!selectedShapeIds.includes(shape.id)) {
                                    dispatch(selectShape(shape.id));
                                  }
                                }
                              }
                            }}
                            onTransformEnd={(e) => handleResizeEnd(e, shape.id)}
                            onDragEnd={(e) => {
                              const { x, y } = e.target.position();
                              dispatch(updateShapePosition({ id: shape.id, x, y }));
                            }}
                          />
                          {isSelected && !shape.locked && shapeRefs.current[shape.id] && selectedTool !== "Node" && (
                            <Transformer
                              ref={transformerRef}
                              nodes={selectedShapeIds.map(id => shapeRefs.current[id]).filter(Boolean)}
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
                            ref={(node) => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                            }}
                            id={shape.id}
                            x={shape.x}
                            y={shape.y}
                            numPoints={shape.corners}
                            innerRadius={
                              shape.outerRadius *
                              (shape.spokeRatio || 0.5) *
                              (1 - (shape.rounded || 0) * 0.5) *
                              (shape.randomOffsets?.[1] || 1)
                            }
                            outerRadius={
                              shape.outerRadius *
                              (1 - (shape.rounded || 0) * 0.2) *
                              (shape.randomOffsets?.[0] || 1)
                            }
                            rotation={shape.rotation || 0}
                            scaleX={shape.scaleX || 1}
                            scaleY={shape.scaleY || 1}
                            fill={
                              shape.fill?.type === "linear-gradient" || shape.fill?.type === "radial-gradient"
                                ? undefined
                                : shape.fill || "transparent"
                            }
                            fillLinearGradientStartPoint={shape.fill?.type === "linear-gradient" ? shape.fill.start : undefined}
                            fillLinearGradientEndPoint={shape.fill?.type === "linear-gradient" ? shape.fill.end : undefined}
                            fillLinearGradientColorStops={shape.fill?.type === "linear-gradient" ? shape.fill.colors.flatMap(stop => [stop.pos, stop.color]) : undefined}
                            fillRadialGradientStartPoint={shape.fill?.type === "radial-gradient" ? shape.fill.center : undefined}
                            fillRadialGradientEndPoint={shape.fill?.type === "radial-gradient" ? { x: shape.fill.center.x, y: shape.fill.center.y + shape.fill.radius } : undefined}
                            fillRadialGradientColorStops={shape.fill?.type === "radial-gradient" ? shape.fill.colors.flatMap(stop => [stop.pos, stop.color]) : undefined}
                            stroke={
                              shape.stroke?.type === "linear-gradient" || shape.stroke?.type === "radial-gradient"
                                ? undefined
                                : shape.stroke || "black"
                            }
                            strokeLinearGradientStartPoint={shape.stroke?.type === "linear-gradient" ? shape.stroke.start : undefined}
                            strokeLinearGradientEndPoint={shape.stroke?.type === "linear-gradient" ? shape.stroke.end : undefined}
                            strokeLinearGradientColorStops={shape.stroke?.type === "linear-gradient" ? shape.stroke.colors.flatMap(stop => [stop.pos, stop.color]) : undefined}
                            strokeRadialGradientStartPoint={shape.stroke?.type === "radial-gradient" ? shape.stroke.center : undefined}
                            strokeRadialGradientEndPoint={shape.stroke?.type === "radial-gradient" ? { x: shape.stroke.center.x, y: shape.stroke.center.y + shape.stroke.radius } : undefined}
                            strokeRadialGradientColorStops={shape.stroke?.type === "radial-gradient" ? shape.stroke.colors.flatMap(stop => [stop.pos, stop.color]) : undefined}
                            strokeWidth={shape.strokeWidth || 1}
                            draggable={!shape.locked && selectedTool !== "Node" && selectedTool !== "Connector" && selectedTool !== "Gradient"}
                            onDragMove={handleDragMove}
                            skewX={shape.skewX || 0}
                            skewY={shape.skewY || 0}
                            blur={shape.blur || 0}
                            shadowBlur={shape.blur || 0}
                            shadowColor={shape.fill || "#fff"}
                            onTransformEnd={(e) => handleBezierTransformEnd(e, shape)}
                            onMouseEnter={() => {
                              if (selectedTool === "Measurement") setHoveredShape(shape);
                            }}
                            onMouseLeave={() => {
                              if (selectedTool === "Measurement") setHoveredShape(null);
                            }}
                            onClick={(e) => {
                              e.cancelBubble = true;
                              if (shape.locked) return;
                              handleShapeClick(shape);
                              if (selectedTool !== "Dropper") {
                                if (e.evt.ctrlKey && selectedShape) {

                                  dispatch(
                                    selectNodePoint({
                                      shapeId: selectedShape.id,
                                      index,
                                      x: point.x,
                                      y: point.y,
                                    })
                                  );
                                } else if (sprayEraserMode) {
                                  dispatch(deleteShape(shape.id));
                                } else if (selectedTool === "Eraser" && eraserMode === "delete") {
                                  dispatch(deleteShape(shape.id));
                                } else {

                                  if (!selectedShapeIds.includes(shape.id)) {
                                    dispatch(selectShape(shape.id));
                                  }
                                }
                              }
                            }}
                            onDragEnd={(e) => {
                              const { x, y } = e.target.position();
                              dispatch(updateShapePosition({ id: shape.id, x, y }));
                            }}
                          />
                          {isSelected && !shape.locked && shapeRefs.current[shape.id] && selectedTool !== "Node" && (
                            <Transformer
                              ref={transformerRef}
                              nodes={selectedShapeIds.map(id => shapeRefs.current[id]).filter(Boolean)}
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
                        </React.Fragment>
                      );
                    } else if (shape.type === "CompoundPath") {
                      return (
                        <Group
                          key={shape.id}
                          id={shape.id}
                          ref={node => {
                            if (node) shapeRefs.current[shape.id] = node;
                            else delete shapeRefs.current[shape.id];
                          }}
                          draggable
                          onClick={e => {
                            e.cancelBubble = true;
                            if (!selectedShapeIds.includes(shape.id)) {
                              dispatch(selectShape(shape.id));
                            }
                          }}
                          onDragEnd={e => {
                            const { x, y } = e.target.position();
                            dispatch(updateShapePosition({ id: shape.id, x, y }));
                          }}
                        >
                          {shape.rings.map((ring, i) => (
                            <Line
                              key={i}
                              points={ring.flatMap(pt => [pt.x, pt.y])}
                              closed
                              fill={shape.fill || "transparent"}
                              stroke={shape.stroke || "black"}
                              strokeWidth={shape.strokeWidth || 1}
                            />
                          ))}
                        </Group>
                      );
                    } else if (shape.type === "Polygon") {
                      let points = shape.points.map(p => ({ x: p.x, y: p.y }));
                      if (shape.lpeEffect === "Bend") {
                        points = applyBendEffect(points, 40, 1);
                      }
                      if (!shape.points || shape.points.length === 0) return null;
                      const isSelected = selectedShapeIds.includes(shape.id);
                      return (
                        <React.Fragment key={shape.id}>
                          {shape.bloom && (
                            <Path
                              x={shape.x}
                              y={shape.y}
                              data={generatePolygonPath(shape.points)}
                              fill={shape.fill || "transparent"}
                              stroke={shape.stroke || "#ffff99"}
                              strokeWidth={(shape.strokeWidth || 2) + (shape.bloom.radius || 16)}
                              opacity={0.5 * (shape.bloom.brightness || 1.5)}
                              listening={false}
                              filters={[window.Konva.Filters.Blur]}
                              blurRadius={shape.bloom.radius || 16}
                            />
                          )}
                          <Group
                            key={shape.id}
                            clipFunc={shape.clipPath ? ctx => {
                              ctx.beginPath();
                              shape.clipPath.forEach((pt, i) => {
                                if (i === 0) ctx.moveTo(pt.x, pt.y);
                                else ctx.lineTo(pt.x, pt.y);
                              });
                              ctx.closePath();
                            } : undefined}
                          ></Group>
                          <Path
                            ref={(node) => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                            }}
                            key={shape.id}
                            id={shape.id}
                            x={shape.x}
                            y={shape.y}
                            points={points.flatMap(p => [p.x, p.y])}
                            data={generatePolygonPath(shape.points)}
                            stroke={
                              shape.stroke?.type === "linear-gradient" || shape.stroke?.type === "radial-gradient"
                                ? undefined
                                : shape.stroke || "black"
                            }
                            strokeWidth={shape.strokeWidth || 1}
                            strokeLinearGradientStartPoint={shape.stroke?.type === "linear-gradient" ? shape.stroke.start : undefined}
                            strokeLinearGradientEndPoint={shape.stroke?.type === "linear-gradient" ? shape.stroke.end : undefined}
                            strokeLinearGradientColorStops={shape.stroke?.type === "linear-gradient" ? shape.stroke.colors.flatMap(stop => [stop.pos, stop.color]) : undefined}
                            strokeRadialGradientStartPoint={shape.stroke?.type === "radial-gradient" ? shape.stroke.center : undefined}
                            strokeRadialGradientEndPoint={shape.stroke?.type === "radial-gradient" ? { x: shape.stroke.center.x, y: shape.stroke.center.y + shape.stroke.radius } : undefined}
                            strokeRadialGradientColorStops={shape.stroke?.type === "radial-gradient" ? shape.stroke.colors.flatMap(stop => [stop.pos, stop.color]) : undefined}
                            fill={
                              shape.fill?.type === "linear-gradient" || shape.fill?.type === "radial-gradient"
                                ? undefined
                                : shape.fill || "transparent"
                            }
                            fillLinearGradientStartPoint={shape.fill?.type === "linear-gradient" ? shape.fill.start : undefined}
                            fillLinearGradientEndPoint={shape.fill?.type === "linear-gradient" ? shape.fill.end : undefined}
                            fillLinearGradientColorStops={shape.fill?.type === "linear-gradient" ? shape.fill.colors.flatMap(stop => [stop.pos, stop.color]) : undefined}
                            fillRadialGradientStartPoint={shape.fill?.type === "radial-gradient" ? shape.fill.center : undefined}
                            fillRadialGradientEndPoint={shape.fill?.type === "radial-gradient" ? { x: shape.fill.center.x, y: shape.fill.center.y + shape.fill.radius } : undefined}
                            fillRadialGradientColorStops={shape.fill?.type === "radial-gradient" ? shape.fill.colors.flatMap(stop => [stop.pos, stop.color]) : undefined}
                            rotation={shape.rotation || 0}
                            scaleX={shape.scaleX || 1}
                            scaleY={shape.scaleY || 1}
                            blur={shape.blur || 0}
                            shadowBlur={shape.blur || 0}
                            shadowColor={shape.fill || "#fff"}
                            closed
                            draggable={!shape.locked && selectedTool !== "Node" && selectedTool !== "Connector" && selectedTool !== "Gradient"}
                            onDragMove={handleDragMove}
                            skewX={shape.skewX || 0}
                            skewY={shape.skewY || 0}
                            onMouseEnter={() => {
                              if (selectedTool === "Measurement") setHoveredShape(shape);
                            }}
                            onMouseLeave={() => {
                              if (selectedTool === "Measurement") setHoveredShape(null);
                            }}
                            onClick={(e) => {
                              e.cancelBubble = true;
                              if (shape.locked) return;
                              handleShapeClick(shape);
                              if (selectedTool !== "Dropper") {
                                if (e.evt.ctrlKey && selectedShape) {

                                  dispatch(
                                    selectNodePoint({
                                      shapeId: selectedShape.id,
                                      index,
                                      x: point.x,
                                      y: point.y,
                                    })
                                  );
                                } else if (sprayEraserMode) {
                                  dispatch(deleteShape(shape.id));
                                } else if (selectedTool === "Eraser" && eraserMode === "delete") {
                                  dispatch(deleteShape(shape.id));
                                } else {

                                  if (!selectedShapeIds.includes(shape.id)) {
                                    dispatch(selectShape(shape.id));
                                  }
                                }
                              }
                            }}
                            onDragEnd={(e) => {
                              const { x, y } = e.target.position();
                              dispatch(updateShapePosition({ id: shape.id, x, y }));
                            }}
                          />
                          {isSelected && !shape.locked && shapeRefs.current[shape.id] && selectedTool !== "Node" && (
                            <Transformer
                              ref={transformerRef}
                              nodes={selectedShapeIds.map(id => shapeRefs.current[id]).filter(Boolean)}
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
                          ref={(node) => {
                            if (node) shapeRefs.current[shape.id] = node;
                            else delete shapeRefs.current[shape.id];
                          }}
                          key={shape.id}
                          id={shape.id}
                          points={rotatedPoints.flat()}
                          stroke={shape.strokeColor}
                          strokeWidth={shape.strokeWidth || 2}
                          lineJoin="round"
                          lineCap="round"
                          blur={shape.blur || 0}
                          shadowBlur={shape.blur || 0}
                          shadowColor={shape.fill || "#fff"}
                          rotation={shape.rotation || 0}
                          dash={getDashArray(shape.strokeStyle)}
                          scaleX={shape.scaleX || 1}
                          scaleY={shape.scaleY || 1}
                          draggable={!shape.locked && selectedTool !== "Node" && selectedTool !== "Connector"}
                          onClick={(e) => {
                            e.cancelBubble = true;
                            if (shape.locked) return;
                            handleShapeClick(shape);
                            if (selectedTool !== "Dropper") {
                              if (e.evt.ctrlKey && selectedShape) {

                                dispatch(
                                  selectNodePoint({
                                    shapeId: selectedShape.id,
                                    index,
                                    x: point.x,
                                    y: point.y,
                                  })
                                );
                              } else if (sprayEraserMode) {
                                dispatch(deleteShape(shape.id));
                              } else if (selectedTool === "Eraser" && eraserMode === "delete") {
                                dispatch(deleteShape(shape.id));
                              } else {

                                if (!selectedShapeIds.includes(shape.id)) {
                                  dispatch(selectShape(shape.id));
                                }
                              }
                            }
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
                      if (shape.lpeEffect === "Knot") {
                        const points = shape.points.map(p => ({ x: p.x, y: p.y }));
                        return (
                          <Path
                            key={shape.id}
                            id={shape.id}
                            data={generateKnotEffectPath(points, shape.knotGapLength || 10)}
                            stroke={shape.stroke || shape.strokeColor || "black"}
                            strokeWidth={shape.strokeWidth || 2}
                            fill="none"
                            draggable={!shape.locked}
                            onDragMove={handleDragMove}
                            onDragEnd={e => handleDragEnd(e, shape.id)}
                            onClick={e => {
                              e.cancelBubble = true;
                              if (!selectedShapeIds.includes(shape.id)) {
                                dispatch(selectShape(shape.id));
                              }
                            }}
                          />
                        );
                      }
                      if (!Array.isArray(shape.points) || !shape.points.every((p) => typeof p.x === "number" && typeof p.y === "number")) {
                        console.error("Invalid points structure for Pencil shape:", shape);
                        return null;
                      }
                      const centerX = shape.points.reduce((sum, p) => sum + p.x, 0) / shape.points.length;
                      const centerY = shape.points.reduce((sum, p) => sum + p.y, 0) / shape.points.length;

                      const rotatedPoints = shape.points.map((p) => {
                        const { x: nx, y: ny } = rotatePoint(p.x, p.y, centerX, centerY, shape.rotation || 0);
                        return [nx, ny];
                      });
                      const scaledPoints = scaleShapePoints(shape.points.map(p => [p.x, p.y]), 1 + pencilScale, centerX, centerY);
                      const isSelected = selectedShapeIds.includes(shape.id);
                      const pencilOption = shape.pencilOption || "None";
                      let points = shape.points.map(p => [p.x, p.y]);
                      const width = (shape.strokeWidth || 10) * (1 + (shape.pencilScale ?? pencilScale ?? 0));
                      if (shape.lpeEffect === "Bend") {
                        points = applyBendEffect(points.map(([x, y]) => ({ x, y })), 40, 1);
                        points = points.flatMap(p => [p.x, p.y]);
                      } else {
                        points = points.flat();
                      }
                      function getPerp([x1, y1], [x2, y2], w) {
                        const dx = x2 - x1, dy = y2 - y1;
                        const len = Math.hypot(dx, dy) || 1;
                        return [-(dy / len) * w, (dx / len) * w];
                      }
                      if (pencilOption === "Ellipse" && points.length > 2) {
                        const smoothing = 90;
                        const smoothPoints = smoothShape(points, smoothing);
                        const left = [];
                        const right = [];
                        for (let i = 1; i < smoothPoints.length - 1; i++) {
                          const [x0, y0] = smoothPoints[i - 1];
                          const [x1, y1] = smoothPoints[i];
                          const [x2, y2] = smoothPoints[i + 1];
                          const perp1 = getPerp([x0, y0], [x1, y1], width);
                          const perp2 = getPerp([x1, y1], [x2, y2], width);
                          const perp = [(perp1[0] + perp2[0]) / 2, (perp1[1] + perp2[1]) / 2];
                          left.push([x1 + perp[0] / 2, y1 + perp[1] / 2]);
                          right.push([x1 - perp[0] / 2, y1 - perp[1] / 2]);
                        }
                        const [xStart, yStart] = smoothPoints[0];
                        const [xEnd, yEnd] = smoothPoints[smoothPoints.length - 1];
                        const polygon = [
                          [xStart, yStart],
                          ...left,
                          [xEnd, yEnd],
                          ...right.reverse()
                        ];
                        const pathData = polygon.map(
                          ([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)
                        ).join(" ") + " Z";
                        return (
                          <Path
                            ref={(node) => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                            }}
                            key={shape.id}
                            data={pathData}
                            fill={shape.fill || shape.strokeColor || "black"}
                            stroke={shape.strokeColor || "black"}
                            strokeWidth={1}
                            closed
                            draggable={!shape.locked && selectedTool !== "Node"}
                            onDragMove={handleDragMove}
                            onDragEnd={(e) => {
                              const { x, y } = e.target.position();
                              dispatch(updateShapePosition({ id: shape.id, x, y }));
                            }}
                          />
                        );
                      }
                      return (
                        <React.Fragment key={shape.id}>
                          <Line
                            ref={(node) => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                            }}
                            key={shape.id}
                            id={shape.id}
                            points={points}
                            stroke={shape.strokeColor}
                            fill={shape.fill || "transparent"}
                            strokeWidth={(shape.strokeWidth || 1) * (shape.pencilScale ?? pencilScale ?? 1)}
                            lineJoin="round"
                            lineCap="round"
                            closed={shape.closed || false}
                            draggable={!shape.locked && selectedTool !== "Node" && selectedTool !== "Connector" && selectedTool === "Select"}
                            dash={getDashArray(shape.strokeStyle)}
                            rotation={shape.rotation || 0}
                            onDragMove={handleDragMove}
                            scaleX={shape.scaleX || 1}
                            listening={true}
                            scaleY={shape.scaleY || 1}
                            skewX={shape.skewX || 0}
                            skewY={shape.skewY || 0}
                            blur={shape.blur || 0}
                            shadowBlur={shape.blur || 0}
                            shadowColor={shape.fill || "#fff"}
                            onMouseEnter={() => {
                              if (selectedTool === "Measurement") setHoveredShape(shape);
                            }}
                            onMouseLeave={() => {
                              if (selectedTool === "Measurement") setHoveredShape(null);
                            }}
                            onClick={(e) => {
                              e.cancelBubble = true;
                              if (shape.locked) return;
                              handleShapeClick(shape);
                              if (selectedTool !== "Dropper") {
                                if (e.evt.ctrlKey && selectedShape) {

                                  dispatch(
                                    selectNodePoint({
                                      shapeId: selectedShape.id,
                                      index,
                                      x: point.x,
                                      y: point.y,
                                    })
                                  );
                                } else if (sprayEraserMode) {
                                  dispatch(deleteShape(shape.id));
                                } else if (selectedTool === "Eraser" && eraserMode === "delete") {
                                  dispatch(deleteShape(shape.id));
                                } else {

                                  if (!selectedShapeIds.includes(shape.id)) {
                                    dispatch(selectShape(shape.id));
                                  }
                                }
                              }
                            }}
                            onDragEnd={(e) => {
                              const { x, y } = e.target.position();
                              dispatch(updateShapePosition({ id: shape.id, x, y }));
                            }}
                          />
                          {isSelected && !shape.locked && shapeRefs.current[shape.id] && selectedTool !== "Node" && (
                            <Transformer
                              ref={transformerRef}
                              nodes={selectedShapeIds.map(id => shapeRefs.current[id]).filter(Boolean)}
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
                        </React.Fragment>
                      );
                    } else if (shape.type === "BrushStroke") {
                      const segments = [];
                      const points = shape.points;

                      const maxBrushWidth = 40;
                      const minBrushWidth = pressureMin * maxBrushWidth;

                      for (let i = 1; i < points.length; i++) {
                        const [x0, y0, w0 = 1] = points[i - 1];
                        const [x, y, w = 1] = points[i];


                        const p0 = Math.max(pressureMin, Math.min(1, w0));
                        const p1 = Math.max(pressureMin, Math.min(1, w));


                        const width0 = minBrushWidth + ((p0 - pressureMin) / (1 - pressureMin)) * (maxBrushWidth - minBrushWidth);
                        const width1 = minBrushWidth + ((p1 - pressureMin) / (1 - pressureMin)) * (maxBrushWidth - minBrushWidth);

                        const width = Math.max(minBrushWidth, (width0 + width1) / 2);

                        segments.push(
                          <Line
                            ref={(node) => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                            }}
                            key={i}
                            points={[x0, y0, x, y]}
                            stroke={shape.strokeColor}
                            strokeWidth={width}
                            lineCap={brushCaps}
                            lineJoin="round"
                          />
                        );
                      }

                      if (brushCaps === "round" && points.length > 1) {
                        const [xStart, yStart, wStart = 1] = points[0];
                        const [xEnd, yEnd, wEnd = 1] = points[points.length - 1];
                        const pStart = Math.max(0, Math.min(1, (wStart - pressureMin) / (pressureMax - pressureMin)));
                        const pEnd = Math.max(0, Math.min(1, (wEnd - pressureMin) / (pressureMax - pressureMin)));
                        segments.push(
                          <Circle
                            ref={(node) => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                            }}
                            key="start-cap"
                            x={xStart}
                            y={yStart}
                            radius={pStart * maxBrushWidth / 2}
                            fill={shape.strokeColor}
                          />,
                          <Circle
                            ref={(node) => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                            }}
                            key="end-cap"
                            x={xEnd}
                            y={yEnd}
                            radius={pEnd * maxBrushWidth / 2}
                            fill={shape.strokeColor}
                          />
                        );
                      }

                      return <React.Fragment key={shape.id}>{segments}</React.Fragment>;
                    } else if (shape.type === "Calligraphy") {
                      const isSelected = selectedShapeIds.includes(shape.id);
                      return (
                        <React.Fragment key={shape.id}>
                          <Line
                            ref={(node) => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                            }}
                            key={shape.id}
                            id={shape.id}
                            points={shape.points.flatMap((p) => [p.x, p.y])}
                            stroke={shape.stroke}
                            fill={shape.fill || "transparent"}
                            strokeWidth={shape.strokeWidth}
                            lineJoin="round"
                            lineCap="round"
                            closed={false}
                            draggable={!shape.locked && selectedTool === "Select"}
                            dash={getDashArray(shape.strokeStyle)}
                            listening={true}
                            onDragMove={handleDragMove}
                            rotation={shape.rotation || 0}
                            scaleX={shape.scaleX || 1}
                            scaleY={shape.scaleY || 1}
                            blur={shape.blur || 0}
                            shadowBlur={shape.blur || 0}
                            shadowColor={shape.fill || "#fff"}
                            offsetX={shape.width ? shape.width / 2 : 0}
                            offsetY={shape.height ? shape.height / 2 : 0}
                            skewX={shape.skewX || 0}
                            skewY={shape.skewY || 0}
                            onMouseEnter={() => {
                              if (selectedTool === "Measurement") setHoveredShape(shape);
                            }}
                            onMouseLeave={() => {
                              if (selectedTool === "Measurement") setHoveredShape(null);
                            }}
                            onClick={(e) => {
                              e.cancelBubble = true;
                              if (shape.locked) return;
                              handleShapeClick(shape);
                              if (selectedTool !== "Dropper") {
                                if (e.evt.ctrlKey && selectedShape) {

                                  dispatch(
                                    selectNodePoint({
                                      shapeId: selectedShape.id,
                                      index,
                                      x: point.x,
                                      y: point.y,
                                    })
                                  );
                                } else if (sprayEraserMode) {
                                  dispatch(deleteShape(shape.id));
                                } else if (selectedTool === "Eraser" && eraserMode === "delete") {
                                  dispatch(deleteShape(shape.id));
                                } else {

                                  if (!selectedShapeIds.includes(shape.id)) {
                                    dispatch(selectShape(shape.id));
                                  }
                                }
                              }
                            }}
                            onDragEnd={(e) => {
                              const { x, y } = e.target.position();
                              dispatch(updateShapePosition({ id: shape.id, x, y }));
                            }}
                          />
                          {isSelected && !shape.locked && shapeRefs.current[shape.id] && selectedTool !== "Node" && (
                            <Transformer
                              ref={transformerRef}
                              nodes={selectedShapeIds.map(id => shapeRefs.current[id]).filter(Boolean)}
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
                                ref={(node) => {
                                  if (node) shapeRefs.current[shape.id] = node;
                                  else delete shapeRefs.current[shape.id];
                                }}
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
                      const isSelected = selectedShapeIds.includes(shape.id);
                      if (shape.pathData) {
                        return (
                          <React.Fragment key={shape.id}>
                            <Path
                              ref={node => {
                                if (node) shapeRefs.current[shape.id] = node;
                                else delete shapeRefs.current[shape.id];
                              }}
                              id={shape.id}
                              data={shape.pathData}
                              x={shape.x}
                              y={shape.y}
                              stroke={shape.stroke || "black"}
                              strokeWidth={shape.strokeWidth || 1}
                              fill={shape.fill || "none"}
                              draggable={!shape.locked && selectedTool === "Select"}
                              onDragMove={handleDragMove}
                              onDragEnd={e => {
                                const { x, y } = e.target.position();
                                dispatch(updateShapePosition({ id: shape.id, x, y }));
                              }}
                              onClick={e => {
                                e.cancelBubble = true;
                                if (!selectedShapeIds.includes(shape.id)) {
                                  dispatch(selectShape(shape.id));
                                }
                              }}
                            />
                            {isSelected && !shape.locked && shapeRefs.current[shape.id] && selectedTool !== "Node" && (
                              <Transformer
                                ref={transformerRef}
                                nodes={selectedShapeIds.map(id => shapeRefs.current[id]).filter(Boolean)}
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
                          </React.Fragment>
                        );
                      }

                      if (!shape.points) return null;
                      const allPoints = [];
                      shape.points.forEach((point) => {
                        if (Array.isArray(point.shapes)) {
                          point.shapes.forEach((subShape) => {
                            allPoints.push({ x: subShape.x, y: subShape.y, r: subShape.radius });
                          });
                        }
                      });


                      if (allPoints.length < 3) {
                        return (
                          <Group key={shape.id} id={shape.id}>
                            {allPoints.map((pt, i) => (
                              <Circle
                                key={i}
                                x={pt.x}
                                y={pt.y}
                                radius={pt.r}
                                fill={shape.stroke || "black"}
                                opacity={0.7}
                              />
                            ))}
                          </Group>
                        );
                      }


                      const outer = [];
                      const inner = [];
                      for (let i = 0; i < allPoints.length; i++) {
                        const p = allPoints[i];
                        const prev = allPoints[i - 1] || allPoints[0];
                        const dx = p.x - prev.x;
                        const dy = p.y - prev.y;
                        const len = Math.hypot(dx, dy) || 1;

                        const nx = -dy / len;
                        const ny = dx / len;
                        const r = p.r || 5;
                        outer.push({ x: p.x + nx * r, y: p.y + ny * r });
                        inner.push({ x: p.x - nx * r, y: p.y - ny * r });
                      }

                      const polygon = [...outer, ...inner.reverse()];
                      const pathData = polygon.map((pt, i) =>
                        (i === 0 ? `M ${pt.x} ${pt.y}` : `L ${pt.x} ${pt.y}`)
                      ).join(" ") + " Z";

                      return (
                        <Path
                          ref={node => {
                            if (node) shapeRefs.current[shape.id] = node;
                            else delete shapeRefs.current[shape.id];
                          }}
                          key={shape.id}
                          id={shape.id}
                          data={pathData}
                          fill={shape.stroke || "black"}
                          opacity={0.7}
                          stroke={shape.stroke || "black"}
                          strokeWidth={1}
                          closed
                          draggable={!shape.locked && selectedTool === "Select"}
                          onDragMove={handleDragMove}
                        />
                      );
                    } else if (shape.type === "Splotchy") {
                      const points = shape.points;
                      if (!points || points.length < 3) return null;

                      const outer = [];
                      const inner = [];
                      for (let i = 0; i < points.length; i++) {
                        const p = points[i];
                        const prev = points[i - 1] || points[0];
                        const dx = p.x - prev.x;
                        const dy = p.y - prev.y;
                        const len = Math.hypot(dx, dy) || 1;
                        const nx = -dy / len;
                        const ny = dx / len;
                        const r = (p.strokeWidth || 10) / 2;
                        outer.push({ x: p.x + nx * r, y: p.y + ny * r });
                        inner.push({ x: p.x - nx * r, y: p.y - ny * r });
                      }
                      const polygon = [...outer, ...inner.reverse()];
                      const pathData = polygon.map((pt, i) =>
                        (i === 0 ? `M ${pt.x} ${pt.y}` : `L ${pt.x} ${pt.y}`)
                      ).join(" ") + " Z";

                      return (
                        <Path
                          ref={node => {
                            if (node) shapeRefs.current[shape.id] = node;
                            else delete shapeRefs.current[shape.id];
                          }}
                          key={shape.id}
                          id={shape.id}
                          data={pathData}
                          fill={shape.stroke || "black"}
                          opacity={0.7}
                          stroke={shape.stroke || "black"}
                          strokeWidth={1}
                          closed
                          draggable={!shape.locked && selectedTool === "Select"}
                          onDragMove={handleDragMove}
                        />
                      );
                    } else if (shape.type === "Spiral") {
                      const isSelected = selectedShapeIds.includes(shape.id);
                      return (
                        <React.Fragment key={shape.id}>
                          <Path
                            ref={(node) => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                            }}
                            id={shape.id}
                            x={0}
                            y={0}
                            data={shape.path}
                            stroke={shape.stroke || "black"}
                            strokeWidth={shape.strokeWidth || 2}
                            fill="transparent"
                            skewX={shape.skewX || 0}
                            skewY={shape.skewY || 0}
                            draggable={!shape.locked && selectedShapeId === shape.id}
                            dash={getDashArray(shape.strokeStyle)}
                            rotation={shape.rotation || 0}
                            scaleX={shape.scaleX || 1}
                            onDragMove={handleDragMove}
                            scaleY={shape.scaleY || 1}
                            onClick={(e) => {
                              e.cancelBubble = true;
                              if (shape.locked) return;
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

                                if (!selectedShapeIds.includes(shape.id)) {
                                  dispatch(selectShape(shape.id));
                                }
                              }
                            }}
                            onDragEnd={(e) => {
                              const { x, y } = e.target.position();
                              dispatch(updateShapePosition({ id: shape.id, x, y }));
                            }}

                          />
                          {isSelected && !shape.locked && shapeRefs.current[shape.id] && selectedTool !== "Node" && (
                            <Transformer
                              ref={transformerRef}
                              nodes={selectedShapeIds.map(id => shapeRefs.current[id]).filter(Boolean)}
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
                        </React.Fragment>
                      );
                    } else if (shape.type === "Connector") {

                      const startShape = shapes.find(s => s.id === shape.startId);
                      const endShape = shapes.find(s => s.id === shape.endId);
                      if (!startShape || !endShape) return null;
                      const rawStartX = startShape.x + (shape.startOffset?.x ?? 0);
                      const rawStartY = startShape.y + (shape.startOffset?.y ?? 0);
                      const rawEndX = endShape.x + (shape.endOffset?.x ?? 0);
                      const rawEndY = endShape.y + (shape.endOffset?.y ?? 0);
                      let dash = [];
                      let lineCap = "round";
                      if (connectorLineStyle === "dashed") {
                        dash = [12, 8];
                        lineCap = "butt";
                      }
                      if (connectorLineStyle === "dotted") {
                        dash = [0.1, 8];
                        lineCap = "round";
                      }

                      const dx = rawEndX - rawStartX;
                      const dy = rawEndY - rawStartY;
                      const totalLen = Math.sqrt(dx * dx + dy * dy) || 1;


                      let startX = rawStartX + (dx / totalLen) * spacing;
                      let startY = rawStartY + (dy / totalLen) * spacing;
                      let endX = rawEndX - (dx / totalLen) * spacing;
                      let endY = rawEndY - (dy / totalLen) * spacing;

                      const availableLen = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);


                      const minLen = 2;

                      if (connectorLength !== 0) {
                        let desiredLen = connectorLength;
                        if (connectorLength < 0) {

                          desiredLen = Math.max(minLen, availableLen + connectorLength);
                        }
                        if (desiredLen < availableLen) {

                          const midX = (startX + endX) / 2;
                          const midY = (startY + endY) / 2;
                          const half = desiredLen / 2;
                          const dirX = (endX - startX) / availableLen;
                          const dirY = (endY - startY) / availableLen;
                          startX = midX - dirX * half;
                          startY = midY - dirY * half;
                          endX = midX + dirX * half;
                          endY = midY + dirY * half;
                        } else if (desiredLen > availableLen) {

                          const extra = (desiredLen - availableLen) / 2;
                          const dirX = (endX - startX) / availableLen;
                          const dirY = (endY - startY) / availableLen;
                          startX = startX - dirX * extra;
                          startY = startY - dirY * extra;
                          endX = endX + dirX * extra;
                          endY = endY + dirY * extra;
                        }
                      }

                      let points = [startX, startY, endX, endY];

                      if (connectorNoOverlap) {
                        const obstacles = shapes.filter(s =>
                          ["Rectangle", "Circle", "Star", "Polygon"].includes(s.type) &&
                          s.id !== shape.startId &&
                          s.id !== shape.endId
                        );
                        points = findGridPath(
                          { x: startX, y: startY },
                          { x: endX, y: endY },
                          obstacles
                        );
                      }

                      if (connectorMode === "avoid") {
                        const offset = 20;
                        points = [
                          startX, startY,
                          startX, startY - offset,
                          endX, endY - offset,
                          endX, endY
                        ];
                      }

                      if (connectorOrthogonal && points.length === 4) {
                        points = [
                          startX, startY,
                          endX, startY,
                          endX, endY
                        ];
                      }

                      return (
                        <Line
                          ref={node => {
                            if (node) shapeRefs.current[shape.id] = node;
                            else delete shapeRefs.current[shape.id];
                          }}
                          key={shape.id}
                          id={shape.id}
                          points={points}
                          stroke="black"
                          strokeWidth={2}
                          lineCap={lineCap}
                          dash={dash}
                          lineJoin="round"
                          onClick={e => {
                            e.cancelBubble = true;
                            if (!selectedShapeIds.includes(shape.id)) {
                              dispatch(selectShape(shape.id));
                            }
                          }}
                        />
                      );
                    } else if (shape.type === "Text") {
                      const isSelected = selectedShapeIds.includes(shape.id);
                      const textDirection = shape.textDirection || "ltr";
                      const blockProgression = shape.blockProgression || "normal";

                      if (shape.type === "Text" && shape.putOnPathId) {
                        const pathShape = shapes.find(s => s.id === shape.putOnPathId);

                        let x1, y1, x2, y2;

                        if (pathShape && Array.isArray(pathShape.points) && pathShape.points.length >= 2) {
                          const p0 = pathShape.points[0];
                          const p1 = pathShape.points[1];
                          x1 = (pathShape.x || 0) + (p0.x ?? (Array.isArray(p0) ? p0[0] : 0));
                          y1 = (pathShape.y || 0) + (p0.y ?? (Array.isArray(p0) ? p0[1] : 0));
                          x2 = (pathShape.x || 0) + (p1.x ?? (Array.isArray(p1) ? p1[0] : 0));
                          y2 = (pathShape.y || 0) + (p1.y ?? (Array.isArray(p1) ? p1[1] : 0));
                        } else if (pathShape && typeof pathShape.path === "string") {

                          const coordMatches = [...pathShape.path.matchAll(/([MLCQAZHVST])([^MLCQAZHVST]*)/gi)];
                          let points = [];
                          for (const match of coordMatches) {
                            const coords = match[2]
                              .trim()
                              .split(/[ ,]+/)
                              .map(Number)
                              .filter(n => !isNaN(n));
                            for (let i = 0; i < coords.length - 1; i += 2) {
                              points.push({ x: coords[i], y: coords[i + 1] });
                              if (points.length >= 2) break;
                            }
                            if (points.length >= 2) break;
                          }
                          if (points.length >= 2) {
                            x1 = points[0].x;
                            y1 = points[0].y;
                            x2 = points[1].x;
                            y2 = points[1].y;
                          }
                          return (
                            <TextPath
                              key={shape.id}
                              data={pathShape.path}
                              text={shape.text}
                              fontSize={shape.fontSize || 16}
                              fontFamily={shape.fontFamily || "Arial"}
                              fill={shape.fill || "#000"}

                            />
                          );
                        }

                        if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
                          const dx = x2 - x1;
                          const dy = y2 - y1;
                          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                          const chars = (shape.text || "").split("");
                          const fontSize = shape.fontSize || 16;
                          return (
                            <Group
                              key={shape.id}
                              x={x1}
                              y={y1 - fontSize * 0.8}
                            >
                              {chars.map((char, i) => {
                                const t = chars.length > 1 ? i / (chars.length - 1) : 0;
                                const cx = t * dx;
                                const cy = t * dy;
                                return (
                                  <KonvaText
                                    key={i}
                                    text={char}
                                    x={cx}
                                    y={cy}
                                    fontSize={fontSize}
                                    fontFamily={shape.fontFamily || "Arial"}
                                    fontStyle={shape.fontStyle || "normal"}
                                    fill={shape.fill || "black"}
                                    rotation={angle}
                                    align="center"
                                  />
                                );
                              })}
                            </Group>
                          );
                        } else {

                          return (
                            <KonvaText
                              key={shape.id}
                              x={shape.x}
                              y={shape.y}
                              text="Select both a text object and a path object."
                              fontSize={16}
                              fill="red"
                            />
                          );
                        }
                      } else if (shape.type === "Text" && shape.flowIntoFrameId) {
                        const frameShape = shapes.find(s => s.id === shape.flowIntoFrameId);
                        if (frameShape) {

                          if (frameShape.type === "Rectangle") {
                            const padding = 16;
                            return (
                              <Group key={shape.id} clipFunc={ctx => {
                                ctx.rect(frameShape.x, frameShape.y, frameShape.width, frameShape.height);
                              }}>
                                <KonvaText
                                  x={frameShape.x + padding}
                                  y={frameShape.y + padding}
                                  width={frameShape.width - 2 * padding}
                                  height={frameShape.height - 2 * padding}
                                  text={shape.text}
                                  fontSize={shape.fontSize || 16}
                                  fontFamily={shape.fontFamily || "Arial"}
                                  fill={shape.fill || "#000"}
                                  align={shape.alignment || "left"}
                                  verticalAlign="top"
                                  draggable={false}
                                  ellipsis={true}
                                />
                              </Group>
                            );
                          }
                          if (frameShape.type === "Circle") {
                            const boxSize = frameShape.radius * Math.sqrt(2);
                            return (
                              <Group key={shape.id} clipFunc={ctx => {
                                ctx.beginPath();
                                ctx.arc(frameShape.x, frameShape.y, frameShape.radius, 0, Math.PI * 2);
                                ctx.closePath();
                              }}>
                                <KonvaText
                                  x={frameShape.x - boxSize / 2}
                                  y={frameShape.y - boxSize / 2}
                                  width={boxSize}
                                  height={boxSize}
                                  text={shape.text}
                                  fontSize={shape.fontSize || 16}
                                  fontFamily={shape.fontFamily || "Arial"}
                                  fill={shape.fill || "#000"}
                                  align="center"
                                  verticalAlign="middle"
                                  draggable={!shape.locked && selectedTool !== "Node" && selectedTool !== "Mesh" && selectedTool !== "Connector"}
                                />
                              </Group>
                            );
                          }
                          if ((frameShape.type === "Polygon" || frameShape.type === "Path") && frameShape.points?.length > 2) {
                            const minX = Math.min(...frameShape.points.map(p => p.x));
                            const minY = Math.min(...frameShape.points.map(p => p.y));
                            const maxX = Math.max(...frameShape.points.map(p => p.x));
                            const maxY = Math.max(...frameShape.points.map(p => p.y));
                            return (
                              <Group key={shape.id} clipFunc={ctx => {
                                ctx.beginPath();
                                ctx.moveTo(frameShape.points[0].x, frameShape.points[0].y);
                                frameShape.points.forEach(pt => ctx.lineTo(pt.x, pt.y));
                                ctx.closePath();
                              }}>
                                <KonvaText
                                  x={minX}
                                  y={minY}
                                  width={maxX - minX}
                                  height={maxY - minY}
                                  text={shape.text}
                                  fontSize={shape.fontSize || 16}
                                  fontFamily={shape.fontFamily || "Arial"}
                                  fill={shape.fill || "#000"}
                                  align={shape.alignment || "left"}
                                  verticalAlign="top"
                                  draggable={!shape.locked && selectedTool !== "Node" && selectedTool !== "Mesh" && selectedTool !== "Connector"}
                                />
                              </Group>
                            );
                          }
                        }
                        return null;
                      }
                      if (blockProgression === "vertical") {

                        const chars = (shape.text || "").split("");
                        const fontSize = shape.fontSize || 16;
                        return (
                          <Group
                            ref={(node) => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                            }}
                            key={shape.id}
                            id={shape.id}
                            x={textDirection === "rtl" ? shape.x + shape.width : shape.x}
                            y={shape.y}
                            draggable={!shape.locked && selectedTool !== "Node" && selectedTool !== "Mesh" && selectedTool !== "Connector"}
                            onDragMove={handleDragMove}
                            onClick={(e) => {
                              e.cancelBubble = true;
                              if (shape.locked) return;
                              setTextAreaPosition({
                                x: shape.x * scale + position.x,
                                y: shape.y * scale + position.y,
                              });
                              setTextContent(shape.text);
                              setEditingTextId(shape.id);
                              setTextAreaVisible(true);
                            }}
                          >
                            {chars.map((char, i) => (
                              <KonvaText
                                key={i}
                                text={char}
                                x={0}
                                y={i * fontSize}
                                fontSize={fontSize}
                                fontFamily={shape.fontFamily || "Arial"}
                                fontStyle={shape.fontStyle || "normal"}
                                fill={shape.fill || "black"}
                                rotation={90}
                                align="center"
                                width={fontSize}
                              />
                            ))}
                            {isSelected && !shape.locked && shapeRefs.current[shape.id] && selectedTool !== "Node" && (
                              <Transformer
                                ref={transformerRef}
                                nodes={selectedShapeIds.map(id => shapeRefs.current[id]).filter(Boolean)}
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
                          </Group>
                        );
                      }
                      const renderedText =
                        blockProgression === "topToBottom"
                          ? (shape.text || "").split("").join("\n")
                          : shape.text;
                      return (
                        <React.Fragment key={shape.id}>
                          <KonvaText
                            ref={(node) => {
                              if (node) shapeRefs.current[shape.id] = node;
                              else delete shapeRefs.current[shape.id];
                            }}
                            key={shape.id}
                            id={shape.id}
                            x={textDirection === "rtl" ? shape.x + shape.width : shape.x}
                            y={shape.y}
                            text={renderedText}
                            fontSize={shape.fontSize || 16}
                            fontFamily={shape.fontFamily || "Arial"}
                            fontStyle={shape.fontStyle || "normal"}
                            align={textDirection === "rtl" ? "right" : shape.alignment || "left"}
                            width={shape.width || 200}
                            fill={shape.fill || "black"}
                            rotation={shape.rotation || 0}
                            letterSpacing={shape.letterSpacing || 0}
                            draggable={!shape.locked && selectedTool !== "Node" && selectedTool !== "Mesh" && selectedTool !== "Connector"}
                            onDragMove={handleDragMove}
                            onClick={(e) => {
                              e.cancelBubble = true;
                              if (shape.locked) return;
                              setTextAreaPosition({
                                x: shape.x * scale + position.x,
                                y: shape.y * scale + position.y,
                              });
                              setTextContent(shape.text);
                              setEditingTextId(shape.id);
                              setTextAreaVisible(true);
                            }}
                          />
                          {isSelected && !shape.locked && shapeRefs.current[shape.id] && selectedTool !== "Node" && (
                            <Transformer
                              ref={transformerRef}
                              nodes={selectedShapeIds.map(id => shapeRefs.current[id]).filter(Boolean)}
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
                        </React.Fragment>
                      );
                    } if (shape.type === "Mesh") {
                      return (
                        <Group key={shape.id}>
                          {/* Draw mesh polygons (approximate) */}
                          {shape.nodes.slice(0, -1).map((row, r) =>
                            row.slice(0, -1).map((node, c) => {
                              const p1 = node;
                              const p2 = shape.nodes[r][c + 1];
                              const p3 = shape.nodes[r + 1][c + 1];
                              const p4 = shape.nodes[r + 1][c];


                              function hexToRgb(hex) {
                                hex = hex.replace(/^#/, "");
                                if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
                                const num = parseInt(hex, 16);
                                return {
                                  r: (num >> 16) & 255,
                                  g: (num >> 8) & 255,
                                  b: num & 255
                                };
                              }
                              function rgbToHex({ r, g, b }) {
                                return (
                                  "#" +
                                  [r, g, b]
                                    .map((x) => {
                                      const hex = x.toString(16);
                                      return hex.length === 1 ? "0" + hex : hex;
                                    })
                                    .join("")
                                );
                              }
                              function avgColor(colors) {
                                const rgbs = colors.map(hexToRgb);
                                const r = Math.round(rgbs.reduce((sum, c) => sum + c.r, 0) / rgbs.length);
                                const g = Math.round(rgbs.reduce((sum, c) => sum + c.g, 0) / rgbs.length);
                                const b = Math.round(rgbs.reduce((sum, c) => sum + c.b, 0) / rgbs.length);
                                return rgbToHex({ r, g, b });
                              }

                              const fillColor = avgColor([p1.color, p2.color, p3.color, p4.color]);

                              return (
                                <Line
                                  key={`${r}-${c}`}
                                  points={[p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y]}
                                  closed
                                  fill={fillColor}
                                  stroke="#888"
                                  strokeWidth={1}
                                />
                              );
                            })
                          )}
                          {shape.nodes.flat().map((node, idx) => (
                            <Circle
                              key={idx}
                              x={node.x}
                              y={node.y}
                              radius={6}
                              fill={blendWithWhite(node.color, 0.7)}
                              stroke="#000"
                              strokeWidth={1}
                              draggable
                              onDragMove={e => {
                                const { x, y } = e.target.position();
                                dispatch({
                                  type: "tool/updateMeshNode",
                                  payload: { meshId: shape.id, nodeIdx: idx, x, y }
                                });
                              }}
                              onClick={e => { }}
                            />
                          ))}
                        </Group>
                      );
                    } else if (shape.type === "Path") {
                      return (
                        <Path
                          ref={(node) => {
                            if (node) shapeRefs.current[shape.id] = node;
                            else delete shapeRefs.current[shape.id];
                          }}
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
                            if (shape.locked) return;
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

                              if (!selectedShapeIds.includes(shape.id)) {
                                dispatch(selectShape(shape.id));
                              }
                            }
                          }}
                          onDragEnd={(e) => {
                            const { x, y } = e.target.position();
                            dispatch(updateShapePosition({ id: shape.id, x, y }));
                          }}
                        />
                      );
                    }
                    else if (
                      shape.type === "Pencil" ||
                      shape.type === "Calligraphy" ||
                      shape.type === "Path" ||
                      shape.type === "Bezier" ||
                      shape.type === "Spiral"
                    ) {
                      const pts = shape.points
                        ? shape.points.map(p => [p.x, p.y])
                        : [];
                      if (shape.lpeEffect === "Bend") {
                        pts = applyBendEffect(pts, 40, 1);
                      }
                      if (pts.length >= 2) {
                        const [x1, y1] = pts[0];
                        const [x2, y2] = pts[pts.length - 1];
                        const angleEnd = Math.atan2(y2 - pts[pts.length - 2][1], x2 - pts[pts.length - 2][0]);
                        const angleStart = Math.atan2(pts[1][1] - y1, pts[1][0] - x1);

                        return (
                          <Group key={shape.id}>
                            <Line
                              points={pts.flat()}
                              stroke={shape.stroke || shape.strokeColor || "#222"}
                              strokeWidth={shape.strokeWidth || 2}
                              lineJoin="round"
                              lineCap="round"
                              closed={shape.closed || false}
                            />
                            {shape.markerEnd && shape.markerEnd !== "none" &&
                              renderMarker(shape.markerEnd, x2, y2, angleEnd, shape.stroke || shape.strokeColor || "#222")}
                            {shape.markerStart && shape.markerStart !== "none" &&
                              renderMarker(shape.markerStart, x1, y1, angleStart + Math.PI, shape.stroke || shape.strokeColor || "#222")}
                          </Group>
                        );
                      }
                    }
                    return null;
                  })}

                  {selectedTool === "Node" &&
                    controlPoints.length > 0 &&
                    controlPoints.map((point, index) => (
                      <React.Fragment key={index}>
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
                        {point.cornerLPE && (
                          <Circle
                            x={point.x + (point.cornerLPE.radius || 10)}
                            y={point.y}
                            radius={4}
                            fill="orange"
                            draggable
                            onDragMove={e => {
                              const dx = e.target.x() - point.x;
                              const dy = e.target.y() - point.y;
                              const radius = Math.sqrt(dx * dx + dy * dy);
                              dispatch({
                                type: "tool/updateCornerLPE",
                                payload: {
                                  shapeId: selectedShape.id,
                                  pointIdx: index,
                                  radius
                                }
                              });
                            }}
                          />
                        )}
                        {point.controlPoint1 && (
                          <>
                            <Line
                              points={[point.x, point.y, point.controlPoint1.x, point.controlPoint1.y]}
                              stroke="blue"
                              dash={[4, 4]}
                            />
                            <Circle
                              x={point.controlPoint1.x}
                              y={point.controlPoint1.y}
                              radius={4}
                              fill="blue"
                              draggable
                              onDragMove={e => {
                                const pos = { x: e.target.x(), y: e.target.y() };
                                dispatch({
                                  type: "tool/updateControlPoint",
                                  payload: { shapeId: selectedShape.id, index, handle: "controlPoint1", point: pos }
                                });

                                if (point.symmetric) {
                                  const mirrored = {
                                    x: point.x - (pos.x - point.x),
                                    y: point.y - (pos.y - point.y)
                                  };
                                  dispatch({
                                    type: "tool/updateControlPoint",
                                    payload: { shapeId: selectedShape.id, index, handle: "controlPoint2", point: mirrored }
                                  });
                                }
                              }}
                            />
                          </>
                        )}
                        {point.controlPoint2 && (
                          <>
                            <Line
                              points={[point.x, point.y, point.controlPoint2.x, point.controlPoint2.y]}
                              stroke="blue"
                              dash={[4, 4]}
                            />
                            <Circle
                              x={point.controlPoint2.x}
                              y={point.controlPoint2.y}
                              radius={4}
                              fill="blue"
                              draggable
                              onDragMove={e => {
                                const pos = { x: e.target.x(), y: e.target.y() };
                                dispatch({
                                  type: "tool/updateControlPoint",
                                  payload: { shapeId: selectedShape.id, index, handle: "controlPoint2", point: pos }
                                });

                                if (point.symmetric) {
                                  const mirrored = {
                                    x: point.x - (pos.x - point.x),
                                    y: point.y - (pos.y - point.y)
                                  };
                                  dispatch({
                                    type: "tool/updateControlPoint",
                                    payload: { shapeId: selectedShape.id, index, handle: "controlPoint1", point: mirrored }
                                  });
                                }
                              }}
                            />
                          </>
                        )}
                      </React.Fragment>
                    ))}

                  {eraserLines.map((line, i) => (
                    <Line
                      key={i}
                      points={line.points}
                      stroke={strokeColor}
                      strokeWidth={Math.max(1, eraserWidth * (1 - eraserThinning))}
                      tension={0.5}
                      lineCap={eraserCapString}
                      globalCompositeOperation="source-over"
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

                  {/* {selectedShape && selectedTool !== "Node" && (
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
                )} */}
                  {newShape && selectedTool === "3DBox" && renderShape(newShape, { dispatch, selectedShapeId, selectedShapeIds, shapeRefs })}
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


                  {meshPreview && selectedTool === "Mesh" && (
                    <Rect
                      x={meshPreview.x}
                      y={meshPreview.y}
                      width={meshPreview.width}
                      height={meshPreview.height}
                      stroke="#00f"
                      strokeWidth={2}
                      dash={[6, 4]}
                      fill="rgba(0,0,255,0.1)"
                      listening={false}
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
                      x={0}
                      y={0}
                      data={newShape.path}
                      stroke={newShape.stroke}
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
                      points={newShape.points.flatMap((p) => [p.x, p.y])}
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
                    <Group>
                      {newShape.points.map((point, index) => {
                        if (index === 0) return null;
                        const prev = newShape.points[index - 1];
                        return (
                          <Line
                            key={index}
                            points={[prev.x, prev.y, point.x, point.y]}
                            stroke={newShape.stroke}
                            strokeWidth={point.strokeWidth}
                            lineJoin="round"
                            lineCap="round"
                          />
                        );
                      })}
                    </Group>
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
                      rotation={newShape.rotation || 0}
                      scaleX={newShape.scaleX || 1}
                      scaleY={newShape.scaleY || 1}
                    />
                  )}

                  {selectedTool === "Gradient" &&
                    selectedShape &&
                    gradientObj?.type === "linear-gradient" &&
                    gradientObj.start &&
                    gradientObj.end &&
                    gradientObj.colors && (
                      <>
                        <Line
                          points={[
                            shapeX + gradientObj.start.x, shapeY + gradientObj.start.y,
                            shapeX + gradientObj.end.x, shapeY + gradientObj.end.y
                          ]}
                          stroke="gray"
                          strokeWidth={2}
                          dash={[4, 4]}
                          listening={false}
                        />
                        {gradientObj.colors.map((stop, idx) => {
                          const x = shapeX + gradientObj.start.x + (gradientObj.end.x - gradientObj.start.x) * stop.pos;
                          const y = shapeY + gradientObj.start.y + (gradientObj.end.y - gradientObj.start.y) * stop.pos;
                          return (
                            <Circle
                              key={idx}
                              x={x}
                              y={y}
                              radius={8}
                              fill={stop.color}
                              stroke="#333"
                              strokeWidth={2}
                              draggable
                              onDragMove={e => {
                                const { x: absX, y: absY } = e.target.getStage().getPointerPosition();
                                const gradStartAbs = {
                                  x: shapeX + gradientObj.start.x,
                                  y: shapeY + gradientObj.start.y,
                                };
                                const gradEndAbs = {
                                  x: shapeX + gradientObj.end.x,
                                  y: shapeY + gradientObj.end.y,
                                };
                                const dx = gradEndAbs.x - gradStartAbs.x;
                                const dy = gradEndAbs.y - gradStartAbs.y;
                                const lengthSq = dx * dx + dy * dy;
                                let t = ((absX - gradStartAbs.x) * dx + (absY - gradStartAbs.y) * dy) / lengthSq;
                                t = Number.isFinite(t) ? Math.max(0, Math.min(1, t)) : 0;
                                const newColors = [
                                  ...gradientObj.colors,
                                  { color: "#ffffff", pos: t }
                                ].sort((a, b) => a.pos - b.pos);
                                newColors[idx] = { ...newColors[idx], pos: t };
                                dispatch(updateShapePosition({
                                  id: selectedShape.id,
                                  [applyTo]: {
                                    ...gradientObj,
                                    colors: newColors,
                                  },
                                  gradientTarget: applyTo,
                                }));
                              }}
                            />
                          );
                        })}
                        <Line
                          points={[
                            shapeX + gradientObj.start.x, shapeY + gradientObj.start.y,
                            shapeX + gradientObj.end.x, shapeY + gradientObj.end.y
                          ]}
                          stroke="transparent"
                          strokeWidth={16}
                          onClick={e => {
                            const { x: clickX, y: clickY } = e.target.getStage().getPointerPosition();
                            const dx = gradientObj.end.x - gradientObj.start.x;
                            const dy = gradientObj.end.y - gradientObj.start.y;
                            const length = Math.sqrt(dx * dx + dy * dy);
                            let t = ((clickX - (shapeX + gradientObj.start.x)) * dx + (clickY - (shapeY + gradientObj.start.y)) * dy) / (length * length);
                            t = Number.isFinite(t) ? Math.max(0, Math.min(1, t)) : 0;

                            const newColors = [
                              ...gradientObj.colors,
                              { color: "#ffffff", pos: t }
                            ].sort((a, b) => a.pos - b.pos);
                            dispatch(updateShapePosition({
                              id: gradientObj.id,
                              fill: { ...gradientObj, colors: newColors },
                              gradientTarget: applyTo,
                            }));
                          }}
                          listening={true}
                        />
                        <Circle
                          x={shapeX + gradientObj.start.x}
                          y={shapeY + gradientObj.start.y}
                          radius={10}
                          fill="#fff"
                          stroke="#333"
                          strokeWidth={2}
                          draggable
                          onDragMove={e => {
                            const { x, y } = e.target.position();

                            const localX = x - shapeX;
                            const localY = y - shapeY;
                            dispatch(updateShapePosition({
                              id: selectedShape.id,
                              [applyTo]: {
                                ...gradientObj,
                                colors: newColors,
                              },
                              gradientTarget: applyTo,
                            }));
                          }}
                        />
                        <Circle
                          x={shapeX + gradientObj.end.x}
                          y={shapeY + gradientObj.end.y}
                          radius={10}
                          fill="#000"
                          stroke="#333"
                          strokeWidth={2}
                          draggable
                          onDragMove={e => {
                            const { x, y } = e.target.position();
                            const localX = x - shapeX;
                            const localY = y - shapeY;
                            dispatch(updateShapePosition({
                              id: selectedShape.id,
                              [applyTo]: {
                                ...gradientObj,
                                colors: newColors,
                              },
                              gradientTarget: applyTo,
                            }));
                          }}
                        />
                      </>
                    )}
                  {selectedTool === "Gradient" &&
                    selectedShape &&
                    gradientObj?.type === "radial-gradient" &&
                    gradientObj.center &&
                    typeof gradientObj.radius === "number" &&
                    gradientObj.colors && (
                      <>
                        <Circle
                          x={shapeX + gradientObj.center.x}
                          y={shapeY + gradientObj.center.y}
                          radius={gradientObj.radius}
                          fillRadialGradientStartPoint={gradientObj.center}
                          fillRadialGradientEndPoint={{
                            x: gradientObj.center.x,
                            y: gradientObj.center.y + gradientObj.radius
                          }}

                          opacity={0.5}
                          stroke="gray"
                          strokeWidth={2}
                          dash={[4, 4]}
                          listening={false}
                        />
                        <Circle
                          x={shapeX + gradientObj.center.x}
                          y={shapeY + gradientObj.center.y}
                          radius={10}
                          fill="#fff"
                          stroke="#333"
                          strokeWidth={2}
                          draggable
                          onDragMove={e => {
                            const { x, y } = e.target.position();
                            const localX = x - shapeX;
                            const localY = y - shapeY;
                            dispatch(updateShapePosition({
                              id: selectedShape.id,
                              [applyTo]: {
                                ...gradientObj,
                                center: { x: localX, y: localY }
                              },
                              gradientTarget: applyTo,
                            }));
                          }}
                        />
                        <Circle
                          x={shapeX + gradientObj.center.x}
                          y={shapeY + gradientObj.center.y + gradientObj.radius}
                          radius={10}
                          fill="#000"
                          stroke="#333"
                          strokeWidth={2}
                          draggable
                          onDragMove={e => {
                            const { x, y } = e.target.position();
                            const dx = x - (shapeX + gradientObj.center.x);
                            const dy = y - (shapeY + gradientObj.center.y);
                            const newRadius = Math.max(5, Math.sqrt(dx * dx + dy * dy));
                            dispatch(updateShapePosition({
                              id: selectedShape.id,
                              [applyTo]: {
                                ...gradientObj,
                                radius: newRadius
                              },
                              gradientTarget: applyTo,
                            }));
                          }}
                        />
                        {gradientObj.colors.map((stop, idx) => {
                          const angle = 0;
                          const r = gradientObj.radius * stop.pos;
                          const x = shapeX + gradientObj.center.x + r * Math.cos(angle);
                          const y = shapeY + gradientObj.center.y + r * Math.sin(angle);
                          return (
                            <Circle
                              key={idx}
                              x={x}
                              y={y}
                              radius={8}
                              fill={stop.color}
                              stroke="#333"
                              strokeWidth={2}
                              draggable
                              onDragMove={e => {
                                const dx = e.target.x() - (shapeX + gradientObj.center.x);
                                const dy = e.target.y() - (shapeY + gradientObj.center.y);
                                let t = Math.sqrt(dx * dx + dy * dy) / gradientObj.radius;
                                t = Math.max(0, Math.min(1, t));
                                const newColors = gradientObj.colors.map((s, i) =>
                                  i === idx ? { ...s, pos: t } : s
                                );
                                dispatch(updateShapePosition({
                                  id: selectedShape.id,
                                  [applyTo]: {
                                    ...gradientObj,
                                    colors: newColors
                                  },
                                  gradientTarget: applyTo,
                                }));
                              }}
                            />
                          );
                        })}
                      </>
                    )}

                  {allMeasurementLines.map((line, idx) => (
                    <React.Fragment key={idx}>
                      {renderAngleArc(line.x1, line.y1, line.x2, line.y2)}
                      <Line
                        points={[line.x1, line.y1, line.x2, line.y2]}
                        stroke="orange"
                        strokeWidth={2}
                        dash={[4, 4]}
                      />
                      <KonvaText
                        x={(line.x1 + line.x2) / 2}
                        y={(line.y1 + line.y2) / 2 - measurementFontSize}
                        text={formatMeasurement(line, measurementScale, measurementPrecision, measurementUnit, true)}
                        fontSize={measurementFontSize}
                        fill="orange"
                        align="center"
                      />
                      {markDimension && renderDimensionMarkers(line, 16, measurementOffset)}
                    </React.Fragment>
                  ))}
                  {measurementDraft && measurementDraft.segments && measurementDraft.segments.map((seg, idx) => (
                    <React.Fragment key={`measure-seg-${idx}`}>
                      <Line
                        points={[seg.from.x, seg.from.y, seg.to.x, seg.to.y]}
                        stroke="orange"
                        strokeWidth={2}
                        dash={[4, 4]}
                        listening={false}
                      />
                      <KonvaText
                        x={seg.mid.x}
                        y={seg.mid.y - measurementFontSize}
                        text={seg.length.toFixed(2)}
                        fontSize={measurementFontSize}
                        fill="orange"
                        align="center"
                      />
                    </React.Fragment>
                  ))}
                  {showHandlesShapeId && (() => {
                    const shape = shapes.find(s => s.id === showHandlesShapeId);
                    if (!shape || !shape.points) return null;
                    return (
                      <Group>
                        {shape.points.map((pt, idx) => (
                          <Circle
                            key={`handle-${idx}`}
                            x={pt.x}
                            y={pt.y}
                            radius={7}
                            fill="#fff"
                            stroke="#007bff"
                            strokeWidth={2}
                            opacity={0.9}
                          />
                        ))}
                        {shape.type === "Bezier" && shape.points.map((pt, idx) => (
                          <>
                            {pt.controlPoint1 && (
                              <Line
                                points={[pt.x, pt.y, pt.controlPoint1.x, pt.controlPoint1.y]}
                                stroke="#007bff"
                                dash={[4, 4]}
                              />
                            )}
                            {pt.controlPoint1 && (
                              <Circle
                                x={pt.controlPoint1.x}
                                y={pt.controlPoint1.y}
                                radius={5}
                                fill="#007bff"
                                opacity={0.7}
                              />
                            )}
                            {pt.controlPoint2 && (
                              <Line
                                points={[pt.x, pt.y, pt.controlPoint2.x, pt.controlPoint2.y]}
                                stroke="#007bff"
                                dash={[4, 4]}
                              />
                            )}
                            {pt.controlPoint2 && (
                              <Circle
                                x={pt.controlPoint2.x}
                                y={pt.controlPoint2.y}
                                radius={5}
                                fill="#007bff"
                                opacity={0.7}
                              />
                            )}
                          </>
                        ))}
                      </Group>
                    );
                  })()}
                  {showPageGrid && (
                    <Layer listening={false}>
                      {Array.from({ length: Math.floor(width / 20) + 1 }).map((_, i) => (
                        <Line
                          key={`vgrid-${i}`}
                          points={[i * 20, 0, i * 20, height]}
                          stroke="#e0e0e0"
                          strokeWidth={1}
                          listening={false}
                        />
                      ))}
                      {Array.from({ length: Math.floor(height / 20) + 1 }).map((_, i) => (
                        <Line
                          key={`hgrid-${i}`}
                          points={[0, i * 20, width, i * 20]}
                          stroke="#e0e0e0"
                          strokeWidth={1}
                          listening={false}
                        />
                      ))}
                    </Layer>
                  )}
                  {hoveredShape && selectedTool === "Measurement" && (
                    <Group>
                      <Rect
                        x={(hoveredShape.x ?? 0) * scale + position.x + 12}
                        y={(hoveredShape.y ?? 0) * scale + position.y + 12}
                        width={200}
                        height={120}
                        fill="rgba(255,255,255,0.9)"
                        stroke="orange"
                        strokeWidth={1}
                        cornerRadius={8}
                        shadowBlur={4}
                      />
                      <KonvaText
                        x={(hoveredShape.x ?? 0) * scale + position.x + 20}
                        y={(hoveredShape.y ?? 0) * scale + position.y + 20}
                        text={
                          hoveredShape.type === "Pencil" || hoveredShape.type === "Calligraphy"
                            ? (() => {
                              const points = hoveredShape.points || [];
                              const length = points.length > 1
                                ? points.reduce((sum, p, i, arr) => {
                                  if (i === 0) return 0;
                                  const prev = arr[i - 1];

                                  const x1 = Array.isArray(p) ? p[0] : p.x;
                                  const y1 = Array.isArray(p) ? p[1] : p.y;
                                  const x0 = Array.isArray(prev) ? prev[0] : prev.x;
                                  const y0 = Array.isArray(prev) ? prev[1] : prev.y;
                                  return sum + Math.hypot(x1 - x0, y1 - y0);
                                }, 0)
                                : 0;
                              return (
                                `points: ${points.length}\n` +
                                `length: ${Math.round(length)}`
                              );
                            })()
                            : hoveredShape.type === "Circle"
                              ? (
                                `x: ${Math.round(hoveredShape.x)}\n` +
                                `y: ${Math.round(hoveredShape.y)}\n` +
                                `radius: ${Math.round(hoveredShape.radius)}\n` +
                                `diameter: ${Math.round(hoveredShape.radius * 2)}\n` +
                                `circumf.: ${Math.round(2 * Math.PI * hoveredShape.radius)}\n` +
                                `area: ${Math.round(Math.PI * hoveredShape.radius * hoveredShape.radius)}`
                              )
                              : hoveredShape.type === "Polygon"
                                ? (
                                  `x: ${Math.round(hoveredShape.x)}\n` +
                                  `y: ${Math.round(hoveredShape.y)}\n` +
                                  `sides: ${hoveredShape.corners || (hoveredShape.points ? hoveredShape.points.length : "")}\n` +
                                  (hoveredShape.radius ? `radius: ${Math.round(hoveredShape.radius)}\n` : "") +
                                  (hoveredShape.points && hoveredShape.points.length > 1
                                    ? `perimeter: ${Math.round(
                                      hoveredShape.points.reduce((sum, p, i, arr) => {
                                        const next = arr[(i + 1) % arr.length];
                                        return sum + Math.hypot((next.x || 0) - (p.x || 0), (next.y || 0) - (p.y || 0));
                                      }, 0)
                                    )}\n`
                                    : "")
                                )
                                : hoveredShape.type === "Star"
                                  ? (
                                    `x: ${Math.round(hoveredShape.x)}\n` +
                                    `y: ${Math.round(hoveredShape.y)}\n` +
                                    `points: ${hoveredShape.corners}\n` +
                                    `innerR: ${Math.round(hoveredShape.innerRadius)}\n` +
                                    `outerR: ${Math.round(hoveredShape.outerRadius)}`
                                  )
                                  : (
                                    `x: ${Math.round(hoveredShape.x)}\n` +
                                    `y: ${Math.round(hoveredShape.y)}\n` +
                                    (hoveredShape.width !== undefined
                                      ? `width: ${Math.round(hoveredShape.width)}\n`
                                      : hoveredShape.radius !== undefined
                                        ? `radius: ${Math.round(hoveredShape.radius)}\n`
                                        : "") +
                                    (hoveredShape.height !== undefined
                                      ? `height: ${Math.round(hoveredShape.height)}\n`
                                      : "") +
                                    (hoveredShape.type === "Line" && hoveredShape.points
                                      ? `length: ${Math.round(
                                        Math.sqrt(
                                          Math.pow(hoveredShape.points[2] - hoveredShape.points[0], 2) +
                                          Math.pow(hoveredShape.points[3] - hoveredShape.points[1], 2)
                                        )
                                      )}`
                                      : "")
                                  )
                        }
                        fontSize={16}
                        fill="black"
                      />
                    </Group>
                  )}
                  {guides.map((guide, idx) =>
                    guide.orientation === "vertical" ? (
                      <Line
                        key={`guide-v-${idx}`}
                        points={[guide.position, 0, guide.position, height]}
                        stroke="blue"
                        strokeWidth={1}
                        dash={[4, 4]}
                        listening={false}
                      />
                    ) : (
                      <Line
                        key={`guide-h-${idx}`}
                        points={[0, guide.position, width, guide.position]}
                        stroke="blue"
                        strokeWidth={1}
                        dash={[4, 4]}
                        listening={false}
                      />
                    )
                  )}
                  {phantomMeasure && measurementDraft && (
                    <>
                      <Line
                        points={[
                          measurementDraft.x1, measurementDraft.y1,
                          measurementDraft.x2, measurementDraft.y2
                        ]}
                        stroke="purple"
                        strokeWidth={2}
                        dash={[8, 8]}
                        opacity={0.7}
                      />
                      <KonvaText
                        x={(measurementDraft.x1 + measurementDraft.x2) / 2}
                        y={(measurementDraft.y1 + measurementDraft.y2) / 2 - measurementFontSize}
                        text={formatMeasurement(measurementDraft, measurementScale, measurementPrecision, measurementUnit, true)}
                        fontSize={measurementFontSize}
                        fill="purple"
                        align="center"
                        opacity={0.7}
                      />
                    </>
                  )}


                  {selectedTool === "ShapeBuilder" && shapeBuilderRegions.length > 0 &&
                    shapeBuilderRegions.map((region, idx) => (
                      <Path
                        key={idx}
                        data={generatePolygonPath(region[0].map(([x, y]) => ({ x, y })))}
                        fill={selectedRegionIndices.includes(idx) ? "rgba(0,128,255,0.4)" : "rgba(128,128,128,0.2)"}
                        stroke="#007bff"
                        strokeWidth={selectedRegionIndices.includes(idx) ? 3 : 1}
                        onClick={() => {
                          setSelectedRegionIndices(indices =>
                            indices.includes(idx)
                              ? indices.filter(i => i !== idx)
                              : [...indices, idx]
                          );
                        }}
                        listening={true}
                        closed
                      />
                    ))
                  }
                </Layer>
                <Layer>
                  {shapes.filter(s => s.type === "SVG").map(shape => (
                    <SvgImage
                      key={shape.id}
                      id={shape.id}
                      svg={shape.svg}
                      x={shape.x}
                      y={shape.y}
                      width={shape.width}
                      height={shape.height}
                      draggable={shape.draggable}
                      onClick={() => dispatch(selectShape(shape.id))}
                    />
                  ))}
                </Layer>
              </Stage>
            )}
          </div>
        </div>
      </div>
      {snapText && (
        <div
          style={{
            position: "absolute",
            left: snapText.x,
            top: snapText.y,
            background: "rgba(255,255,255,0.95)",
            color: "#222",
            fontWeight: "bold",
            padding: "4px 10px",
            borderRadius: 6,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            pointerEvents: "none",
            zIndex: 9999,
            fontSize: 15,
            border: "1px solid #ccc"
          }}
        >
          {snapText.text}
        </div>
      )}
      {dragSelectRect && (
        <Rect
          x={dragSelectRect.x}
          y={dragSelectRect.y}
          width={dragSelectRect.width}
          height={dragSelectRect.height}
          stroke="#007bff"
          strokeWidth={2}
          dash={[6, 4]}
          fill="rgba(0,123,255,0.1)"
          listening={false}
        />
      )}
      {
        colorPicker.visible && (
          <input
            type="color"
            style={{
              position: "absolute",
              left: colorPicker.x,
              top: colorPicker.y,
              zIndex: 2000,
              width: 32,
              height: 32,
              border: "2px solid #333",
              borderRadius: "50%",
              padding: 0,
              cursor: "pointer"
            }}
            value={gradientObj.colors[colorPicker.idx]?.color || "#ffffff"}
            onChange={e => {
              const newColors = gradientObj.colors.map((s, i) =>
                i === colorPicker.idx ? { ...s, color: e.target.value } : s
              );
              dispatch(updateShapePosition({
                id: selectedShape.id,
                [applyTo]: {
                  ...gradientObj,
                  colors: newColors
                },
                gradientTarget: applyTo,
              }));
              setColorPicker({ ...colorPicker, visible: false });
            }}
            onBlur={() => setColorPicker({ ...colorPicker, visible: false })}
            autoFocus
          />
        )
      }
      {
        isCustomCursorVisible && toolCursors[selectedTool] && (
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
        )
      }
      {console.log("Rendering TextArea:", textAreaVisible, "Position:", textAreaPosition)}
      {
        textAreaVisible && (
          <textarea
            style={{
              position: "absolute",
              top: `${textAreaPosition.y}px`,
              left: `${textAreaPosition.x}px`,
              fontSize: "16px",
              border: "1px solid black",
              resize: "none",
              zIndex: 1000,
              direction: selectedShape?.textDirection || "ltr",
              textAlign: selectedShape?.textDirection === "rtl" ? "right" : "left",
            }}
            dir={selectedShape?.textDirection || "ltr"}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            onBlur={handleTextAreaBlur}
            onKeyDown={handleTextAreaKeyDown}
            autoFocus
          />
        )
      }
      {showMessagesModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            // background: "rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowMessagesModal(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 320,
              maxWidth: 480,
              maxHeight: "60vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ marginBottom: 16 }}>Messages</h4>
            <ul style={{ padding: 0, listStyle: "none" }}>
              {messages.map((msg, idx) => (
                <li key={idx} style={{
                  marginBottom: 12,
                  color: msg.type === "warning" ? "#b85c00" : "#222",
                  background: msg.type === "warning" ? "#fffbe6" : "#f4f4f4",
                  borderLeft: msg.type === "warning" ? "4px solid #ff9800" : "4px solid #2196f3",
                  padding: "8px 12px",
                  borderRadius: 4
                }}>
                  {msg.text}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button onClick={() => setShowMessagesModal(false)} style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default Panel;