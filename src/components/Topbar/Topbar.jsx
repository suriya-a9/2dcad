import "./Topbar.css";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import INKSCAPE_SYMBOL_SETS from './inkscape-symbol-sets.json';
import { setFontSize, setFontFamily, setAlignment, setFontStyle, clearPoints, handleUnion, difference, intersection, exclusion, division, cutPath, combine, breakApart, splitPath, relinkClone, selectOriginal, fracture, flatten, inset, outset, fillBetweenPaths, simplify, reverse, setDynamicOffsetMode, setDynamicOffsetShapeId, setDynamicOffsetAmount, createLinkedOffset, applyBloomFilter, convertToText, removeManualKerns, textToGlyphs, unlinkclonerecursively, lockRotation, OutlineOverlay, Normal, Outline, toggleGrayScale, setIconVisibility, togglePageGrid } from "../../Redux/Slice/toolSlice";
import { setBezierOption } from "../../Redux/Slice/toolSlice";
import { BsVectorPen } from "react-icons/bs";
import { TbBrandSnapseed } from "react-icons/tb";
import { FaBezierCurve, FaProjectDiagram, FaDrawPolygon, FaPlus, FaLink, FaUnlink, FaCut, FaMagnet, FaDotCircle } from "react-icons/fa";
import { RxCheckCircled } from "react-icons/rx";
import { RxCrossCircled } from "react-icons/rx";
import { MdRoundedCorner, MdOutlineVerticalAlignTop, MdOutlineAltRoute } from "react-icons/md";
import { FaMousePointer, FaStepForward, FaArrowsAltH, FaEyeSlash, FaLayerGroup, FaEye, FaBullseye, FaLock, FaCompressAlt, FaRandom, FaSyncAlt, FaArrowCircleUp, FaCompress, FaPaintBrush, FaPalette, FaLockOpen } from "react-icons/fa";
import { AiOutlineVerticalAlignBottom } from "react-icons/ai";
import { VscDebugReverseContinue } from "react-icons/vsc";
import { FaSearchPlus, FaUndo, FaRedo, FaEdit, FaCheck, FaTimes, FaArrowLeft, FaArrowRight, FaArrowsAlt, FaRegObjectGroup } from "react-icons/fa";
import { GiStraightPipe } from "react-icons/gi";
import { PiPath } from "react-icons/pi";
import { FaObjectGroup, FaObjectUngroup, FaExpand, FaRegFile, FaRegDotCircle, FaBan, FaVectorSquare } from "react-icons/fa";
import { MdGridOn, MdOutlineGradient, MdOutlineFormatColorFill, MdOutlineBorderColor } from "react-icons/md";
import { textToGlyphsHandler, renderShape } from "../Panel/Panel";
import { setSelectedTool } from "../../Redux/Slice/toolSlice";
import { GiPerspectiveDiceSixFacesRandom, GiPaintBrush, GiJigsawBox } from "react-icons/gi";
import PathEffectsDialog from "../Dialogs/PathEffectsDialog";
import { EditorState, ContentState } from "draft-js";
import { MdCenterFocusStrong } from "react-icons/md";
import {
  Stage,
  Layer,
} from "react-konva";
import {
  updateShapePosition,
  selecteAllShapes,
  deselectAllShapes,
  undo,
  redo,
  cut,
  copy,
  paste,
  zoomIn,
  zoomOut,
  setZoomLevel,
  moveLayerUp,
  moveLayerDown,
  addLayer,
  deleteShape,
  deleteLayer,
  renameLayer,
  duplicateLayer,
  duplicateShape,
  toggleLayerVisibility,
  groupShapes,
  ungroupShapes,
  createNewPage,
  uploadImage,
  addImage,
  clearLayerShapes,
  saveState,
  saveAsState,
  strokeColor,
  fillColor,
  setSprayProperties,
  updateSpiralProperties,
  setCalligraphyOption,
  setCalligraphyWidth,
  setScale,
  setPencilOption,
  setPencilSmoothing,
  setPencilMode,
  setPencilScale,
  joinSelectedNodePoints,
  joinSelectedEndNodesWithSegment,
  makeSelectedNodesCorner,
  insertNode,
  makeSelectedNodesCurve,
  makeShapeCorner,
  makeSelectedNodesStraight,
  strokePath,
  setStrokeToPathMode,
  setSnapping,
  raiseShapeToTop,
  lowerShape,
  setShapeBuilderMode,
  setSprayMode,
  setSprayEraserMode,
  setCalligraphyThinning,
  setCalligraphyMass,
  setCalligraphyAngle,
  setCalligraphyFixation,
  setCalligraphyCaps,
  setEraserMode,
  setEraserWidth,
  setEraserThinning,
  setEraserCaps,
  setEraserTremor,
  setEraserMass,
  setDropperMode,
  setPickedColor,
  setStrokeColor,
  setFillColor,
  setDropperTarget,
  setAssignAverage,
  setAltInverse,
  setGradientType,
  setPressureEnabled,
  setPressureMin,
  setPressureMax,
  setBrushCaps,
  setShowMeasureBetween,
  setIgnoreFirstLast,
  setReverseMeasure,
  setToGuides,
  setPhantomMeasure,
  setMarkDimension,
  setMeasurementOffset,
  setConvertToItem,
  setReplaceShapes,
  setPaintBucketFillBy,
  setPaintBucketThreshold,
  setPaintBucketGrowSink,
  setPaintBucketCloseGaps,
  setMeshMode,
  setGradientTarget,
  selectPage,
  renamePage,
  setPageMargin,
  setConnectorSpacing,
  setConnectorLength,
  setTweakRadius,
  setTweakForce,
  setTweakFidelity,
  clearSelectedNodePoints,
  breakPathAtSelectedNode,
  makeSelectedNodesSmooth,
  makeSelectedNodesSymmetric,
  autoSmoothSelectedNodes,
  objectToPath,
  setBlockProgression,
  selectAllShapesInAllLayers,
  updateNodePosition,
  setSubtractionsFrame,
  popShapesOutOfGroups,
  addMarker,
  applyPathEffectToSelectedShape,
  setSplitMode,
  setWideScreen,
  setCurrentDocumentIndex,
  updateSelection,
  loadDocument,
  availableColorProfiles,
} from "../../Redux/Slice/toolSlice";
import {
  TbDeselect,
  TbFlipHorizontal,
  TbFlipVertical,
  TbSelectAll,
} from "react-icons/tb";
import { RiAnticlockwise2Line, RiClockwise2Line } from "react-icons/ri";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

import { Editor } from "react-draft-wysiwyg";
import { BiEraser } from "react-icons/bi";
import { LuCopy } from "react-icons/lu";
import { useCallback, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GrClone } from "react-icons/gr";
import { FaClone } from "react-icons/fa";
import { MdOutlineArrowRight } from "react-icons/md";
const PAINT_SERVERS = [
  {
    name: "Diagonal Hatch",
    svg: `<svg width="32" height="32"><defs><pattern id="diagonalHatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="8" stroke="#000" stroke-width="2"/></pattern></defs><rect width="32" height="32" fill="url(#diagonalHatch)" /></svg>`
  },
  {
    name: "Checkerboard",
    svg: `<svg width="32" height="32"><defs><pattern id="checkerboard" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/><rect width="4" height="4" fill="#000"/><rect x="4" y="4" width="4" height="4" fill="#000"/></pattern></defs><rect width="32" height="32" fill="url(#checkerboard)" /></svg>`
  },
];
const SWATCHES = [
  "Document swatches", "Android icon palette", "Blues", "Bootstrap 5", "Echo Icon Theme Palette",
  "GNOME HIG Colors", "Gold", "Gray", "Greens", "Hilite", "Inkscape default", "Khaki",
  "LaTeX Beamer", "MATLAB Jet (72)", "MunsellChart", "Reds", "Royal", "Solarized colors",
  "SVG", "Tango icons", "Topographic", "Ubuntu", "WebHex"
];
const SWATCH_PALETTES = {
  "Android icon palette": [
    { name: "None", color: null },
    { color: "#FFFFFF" }, { color: "#BFBFBF" }, { color: "#808080" }, { color: "#404040" }, { color: "#000000" },
    { color: "#6699FF" }, { color: "#3366CC" }, { color: "#003399" },
    { color: "#99CC33" }, { color: "#00CC00" }, { color: "#669900" },
    { color: "#FFCC00" }, { color: "#FF9900" }, { color: "#FF6600" },
    { color: "#CC0000" }
  ],
  "Blues": [
    { name: "None", color: null },
    { color: "#808080" },
    { color: "#FFFFFF" },
    { color: "#000010" },
    { color: "#000018" },
    { color: "#000020" },
    { color: "#000028" },
    { color: "#000030" },
    { color: "#000038" },
    { color: "#000040" },
    { color: "#000044" },
    { color: "#00004C" },
    { color: "#000050" },
    { color: "#000058" },
    { color: "#00005C" },
    { color: "#000060" },
    { color: "#000068" },
    { color: "#000070" },
    { color: "#000074" },
    { color: "#00007C" },
    { color: "#000080" },
    { color: "#000088" },
    { color: "#00008C" },
    { color: "#000094" },
    { color: "#000098" },
    { color: "#0000A0" },
    { color: "#0000A4" },
    { color: "#0000AC" },
    { color: "#0000B4" },
    { color: "#0000B8" },
    { color: "#0000C0" },
    { color: "#0000C4" },
    { color: "#0000CC" },
    { color: "#0000D4" },
    { color: "#0000D8" },
    { color: "#0000E0" },
    { color: "#0000E4" },
    { color: "#0000EC" },
    { color: "#0000F4" },
    { color: "#0000F8" },
    { color: "#0000FF" },
    { color: "#0038FC" },
    { color: "#0044FC" },
    { color: "#005CFC" },
    { color: "#0068FC" },
    { color: "#0074FC" },
    { color: "#0084FC" },
    { color: "#0094FC" },
    { color: "#00A4FC" },
    { color: "#00B4FC" },
    { color: "#00C4FC" },
    { color: "#00D4FC" },
    { color: "#00E4FC" },
    { color: "#00F4FC" },
    { color: "#00FCFC" },
  ],
  "Bootstrap 5": [
    { name: "None", color: null },
    { color: "#0d6efd" }, { color: "#6c757d" }, { color: "#198754" }, { color: "#dc3545" }, { color: "#ffc107" }, { color: "#0dcaf0" }
  ],
  "Gold": [
    { name: "None", color: null },
    { color: "#FFD700" }, { color: "#FFC300" }, { color: "#FFB300" }, { color: "#FFA000" }
  ],
  "Gray": [
    { name: "None", color: null },
    { color: "#F5F5F5" }, { color: "#BDBDBD" }, { color: "#757575" }, { color: "#212121" }
  ],
  "Greens": [
    { name: "None", color: null },
    { color: "#E8F5E9" }, { color: "#A5D6A7" }, { color: "#66BB6A" }, { color: "#388E3C" }, { color: "#1B5E20" }
  ],
  "Reds": [
    { name: "None", color: null },
    { color: "#FFEBEE" }, { color: "#EF9A9A" }, { color: "#E57373" }, { color: "#C62828" }, { color: "#B71C1C" }
  ],
};
const Topbar = ({
  editorState,
  onEditorStateChange,
  handleSave,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  handleDownloadPdf,
  selectedGroupId,
  setSelectedGroupId,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onSetZoom,
  onZoomSelected,
  onZoomDrawing,
  onZoomPage,
  onZoomPageWidth,
  onZoomCenterPage,
  onZoomPrevious,
  onZoomNext,
  handleOpenFillStrokeDialog,
  setIsAlignPanelOpen,
  setIsDocPropsOpen,
}) => {
  const selectedTool = useSelector((state) => state.tool.selectedTool);
  const dispatch = useDispatch();
  const layers = useSelector((state) => state.tool.layers);
  const fillColor = useSelector((state) => state.tool.fillColor);
  const strokeColor = useSelector((state) => state.tool.strokeColor);
  const dynamicOffsetMode = useSelector(state => state.tool.dynamicOffsetMode);
  const [showFontPanel, setShowFontPanel] = useState(false);
  const [showSvgFontEditor, setShowSvgFontEditor] = useState(false);
  const [showUnicodePanel, setShowUnicodePanel] = useState(false);
  const selectedShapeIds = useSelector((state) => state.tool.selectedShapeIds);
  const [showMoveLayerModal, setShowMoveLayerModal] = useState(false);
  const [targetLayerIndex, setTargetLayerIndex] = useState(null);
  const [showPaintServersModal, setShowPaintServersModal] = useState(false);
  const [paintServerTarget, setPaintServerTarget] = useState("fill");
  const [customPaintServers, setCustomPaintServers] = useState([]);
  const handleOpenPaintServers = () => setShowPaintServersModal(true);
  const handleClosePaintServers = () => setShowPaintServersModal(false);
  const [showTransformModal, setShowTransformModal] = useState(false);
  const [moveX, setMoveX] = useState(0);
  const [moveY, setMoveY] = useState(0);
  const openDocuments = useSelector(state => state.tool.openDocuments);
  const currentDocumentIndex = useSelector(state => state.tool.currentDocumentIndex);
  const [showPathEffectsDialog, setShowPathEffectsDialog] = useState(false);
  const wideScreen = useSelector(state => state.tool.wideScreen);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showSwatchesModal, setShowSwatchesModal] = useState(false);
  const [selectedSwatch, setSelectedSwatch] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerValue, setColorPickerValue] = useState("#000000");
  // const showToolbox = useSelector((state) => state.tool.visibleIcons.CommandsBar);
  const [showPaletteGrid, setShowPaletteGrid] = useState(false);
  const [paletteColors, setPaletteColors] = useState([]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");
  const [showFindReplaceModal, setShowFindReplaceModal] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [findResults, setFindResults] = useState([]);
  const copiedStyleRef = useRef(null);
  const colorManagementEnabled = useSelector(state => state.tool.colorManagementEnabled);
  const navigate = useNavigate();
  let selectedShapeId = useSelector((state) => state.tool.selectedShapeId);
  const shapes = useSelector(
    (state) => state.tool.layers[state.tool.selectedLayerIndex].shapes || []
  );
  const selectedLayerIndex = useSelector(
    (state) => state.tool.selectedLayerIndex
  );
  const handleColorManagementToggle = () => {
    dispatch(toggleColorManagement());
  };
  const handleToolControlsBarChange = (e) => {
    console.log("handleToolControlsBarChange");

    const { name, checked } = e.target;
    dispatch(setIconVisibility({ key: name, value: checked }));
  };
  const [messages, setMessages] = useState([
    { type: "info", text: "Welcome to 2DCAD!" },
    { type: "warning", text: "Remember to save your work frequently." },
  ]);
  const selectedShape =
    shapes.find((shape) => shape.id === selectedShapeId) || {};
  console.log("topbar-id", selectedShape);

  const [isRenaming, setIsRenaming] = useState(false);
  const [newLayerName, setNewLayerName] = useState("");
  const fileInputRef = useRef(null);

  const handleRenameLayer = () => {
    if (selectedLayerIndex !== null) {
      setIsRenaming(true);
      setNewLayerName(layers[selectedLayerIndex].name);
    }
  };
  function addRecentFile(fileName, fileContent) {
    let recent = JSON.parse(localStorage.getItem("recentFiles") || "[]");
    recent = recent.filter(f => f.name !== fileName);
    recent.unshift({ name: fileName, content: fileContent });
    if (recent.length > 10) recent = recent.slice(0, 10);
    localStorage.setItem("recentFiles", JSON.stringify(recent));
  }
  const handleSaveClick = () => {
    dispatch(saveState());
    dispatch(markSaved());
    if (handleSave) handleSave();
    const savedData = JSON.stringify({ layers, selectedTool, strokeColor, fillColor });
    addRecentFile("design.json", savedData);
    alert("Design saved successfully!");
  };
  const handlePathEffects = () => {
    if (!selectedShapeId) {
      alert("Select a shape first.");
      return;
    }
    setShowPathEffectsDialog(true);
  };
  const handleApplyPathEffect = (effect, params) => {
    if (!selectedShapeId) {
      alert("Select a shape first.");
      return;
    }
    switch (effect) {
      case "Union":
        dispatch(handleUnion());
        break;
      case "Intersection":
        dispatch(intersection());
        break;
      case "Difference":
        dispatch(difference());
        break;
      case "Division":
        dispatch(division());
        break;
      default:
        break;
    }
    if (effect === "Taper stroke" && params) {
      dispatch(updateShapePosition({
        id: params.id,
        lpeEffect: "Taper stroke",
        taperStrokeWidth: params.taperStrokeWidth,
        taperStart: params.taperStart,
        taperEnd: params.taperEnd,
      }));
    } else if (effect === "Envelope Deformation" && params) {
      dispatch({
        type: "tool/updateShapePosition",
        payload: {
          id: selectedShapeId,
          lpeEffect: "Envelope Deformation",
          envelopeTop: params.envelopeTop,
          envelopeBottom: params.envelopeBottom,
          envelopeLeft: params.envelopeLeft,
          envelopeRight: params.envelopeRight,
        }
      });
    } else if (effect === "Lattice Deformation" && params) {
      dispatch(updateShapePosition({
        id: params.id,
        lpeEffect: "Lattice Deformation",
        latticeRows: params.latticeRows,
        latticeCols: params.latticeCols,
        latticePoints: params.latticePoints,
      }));
    } else if (effect === "Perspective/Envelope" && params) {
      dispatch(updateShapePosition({
        id: params.id,
        lpeEffect: "Perspective/Envelope",
        perspectiveCorners: params.perspectiveCorners,
      }));
    } else {
      dispatch(applyPathEffectToSelectedShape(effect));
    }
    setShowPathEffectsDialog(false);
  };
  const handleSaveAsClick = () => {
    const name = prompt("Enter a name for the file:") || "design";
    const savedData = JSON.stringify({ layers, selectedTool, strokeColor, fillColor });

    const blob = new Blob([JSON.stringify(savedData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addRecentFile(`${name}.json`, savedData);
    alert("Design saved successfully as " + name + ".json!");
  };

  const handleLayerNameChange = (e) => {
    setNewLayerName(e.target.value);
  };

  const handleLayerNameSubmit = (e) => {
    if (e.key === "Enter" && newLayerName.trim() !== "") {
      dispatch(
        renameLayer({ index: selectedLayerIndex, newName: newLayerName })
      );
      setIsRenaming(false);
      setNewLayerName("");
    }
  };
  const handleCut = useCallback(() => {
    dispatch(cut());
  }, [dispatch]);

  const handleCopy = useCallback(() => {
    dispatch(copy());
    const shape = shapes.find(s => s.id === selectedShapeId);
    if (shape) {
      let width = shape.width;
      let height = shape.height;
      if (shape.type === "Circle" && shape.radius !== undefined) {
        width = height = shape.radius * 2;
      } else if (shape.type === "Star" || shape.type === "Polygon") {
        const bbox = getShapeBoundingBox(shape);
        if (bbox) {
          width = bbox.maxX - bbox.minX;
          height = bbox.maxY - bbox.minY;
        }
      } else if (shape.type === "Bezier" && Array.isArray(shape.points)) {
        const bbox = getShapeBoundingBox(shape);
        if (bbox) {
          width = bbox.maxX - bbox.minX;
          height = bbox.maxY - bbox.minY;
        }
      } else if ((shape.type === "Pencil" || shape.type === "Calligraphy") && Array.isArray(shape.points)) {
        const bbox = getShapeBoundingBox(shape);
        if (bbox) {
          width = bbox.maxX - bbox.minX;
          height = bbox.maxY - bbox.minY;
        }
      }
      copiedStyleRef.current = {
        fill: shape.fill,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
      };
      copiedSizeRef.current = {
        type: shape.type,
        width,
        height,
        radius: shape.radius,
        outerRadius: shape.outerRadius,
        innerRadius: shape.innerRadius,
        points: shape.points ? JSON.parse(JSON.stringify(shape.points)) : undefined,
        corners: shape.corners,
        spokeRatio: shape.spokeRatio,
        rounded: shape.rounded,
        randomized: shape.randomized,
        fill: shape.fill,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
      };
    }
  }, [dispatch, shapes, selectedShapeId]);

  const copiedSizeRef = useRef(null);

  const handlePasteSize = () => {
    if (!copiedSizeRef.current) {
      alert("No size copied yet.");
      return;
    }
    if (!selectedShapeIds || selectedShapeIds.length === 0) {
      alert("Select a shape to paste size.");
      return;
    }
    selectedShapeIds.forEach(id => {
      const shape = shapes.find(s => s.id === id);
      if (!shape) return;

      let payload = { id };

      if (shape.type === "Rectangle") {
        payload.width = copiedSizeRef.current.width;
        payload.height = copiedSizeRef.current.height;
      }
      else if (shape.type === "Circle") {
        if (copiedSizeRef.current.radius !== undefined) {
          payload.radius = copiedSizeRef.current.radius;
        } else if (copiedSizeRef.current.width !== undefined) {
          payload.radius = copiedSizeRef.current.width / 2;
        }
      }
      else if (shape.type === "Polygon") {
        if (copiedSizeRef.current.points) {
          payload.points = JSON.parse(JSON.stringify(copiedSizeRef.current.points));
        }
      }
      else if (shape.type === "Star") {
        if (copiedSizeRef.current.outerRadius !== undefined) {
          payload.outerRadius = copiedSizeRef.current.outerRadius;
        }
        if (copiedSizeRef.current.innerRadius !== undefined) {
          payload.innerRadius = copiedSizeRef.current.innerRadius;
        }
        if (copiedSizeRef.current.corners !== undefined) {
          payload.corners = copiedSizeRef.current.corners;
        }
        if (copiedSizeRef.current.spokeRatio !== undefined) {
          payload.spokeRatio = copiedSizeRef.current.spokeRatio;
        }
        if (copiedSizeRef.current.rounded !== undefined) {
          payload.rounded = copiedSizeRef.current.rounded;
        }
        if (copiedSizeRef.current.randomized !== undefined) {
          payload.randomized = copiedSizeRef.current.randomized;
        }
      }
      payload.fill = copiedSizeRef.current.fill;
      payload.stroke = copiedSizeRef.current.stroke;
      payload.strokeWidth = copiedSizeRef.current.strokeWidth;

      dispatch(updateShapePosition(payload));
    });
  };

  const handlePasteWidth = () => {
    if (!copiedSizeRef.current || copiedSizeRef.current.width === undefined) {
      alert("No width copied yet.");
      return;
    }
    if (!selectedShapeIds || selectedShapeIds.length === 0) {
      alert("Select a shape to paste width.");
      return;
    }
    selectedShapeIds.forEach(id => {
      const shape = shapes.find(s => s.id === id);
      if (!shape) return;

      let payload = { id };

      if (shape.type === "Rectangle") {
        payload.width = copiedSizeRef.current.width;
      } else if (shape.type === "Circle") {
        payload.radius = copiedSizeRef.current.width / 2;
      } else if (shape.type === "Star") {
        payload.outerRadius = copiedSizeRef.current.width / 2;
      } else if (shape.type === "Polygon" && copiedSizeRef.current.points) {
        const origBBox = getShapeBoundingBox(shape);
        const copyBBox = getShapeBoundingBox({ ...shape, points: copiedSizeRef.current.points });
        if (origBBox && copyBBox) {
          const scale = copiedSizeRef.current.width / (copyBBox.maxX - copyBBox.minX || 1);
          payload.points = shape.points.map(pt => ({
            x: (pt.x ?? pt[0]) * scale,
            y: pt.y ?? pt[1]
          }));
        }
      }

      dispatch(updateShapePosition(payload));
    });
  };

  const handlePasteHeight = () => {
    if (!copiedSizeRef.current || copiedSizeRef.current.height === undefined) {
      alert("No height copied yet.");
      return;
    }
    if (!selectedShapeIds || selectedShapeIds.length === 0) {
      alert("Select a shape to paste height.");
      return;
    }
    selectedShapeIds.forEach(id => {
      const shape = shapes.find(s => s.id === id);
      if (!shape) return;

      let payload = { id };

      if (shape.type === "Rectangle") {
        payload.height = copiedSizeRef.current.height;
      } else if (shape.type === "Circle") {
        payload.radius = copiedSizeRef.current.height / 2;
      } else if (shape.type === "Star") {
        payload.outerRadius = copiedSizeRef.current.height / 2;
      } else if (shape.type === "Polygon" && copiedSizeRef.current.points) {
        const origBBox = getShapeBoundingBox(shape);
        const copyBBox = getShapeBoundingBox({ ...shape, points: copiedSizeRef.current.points });
        if (origBBox && copyBBox) {
          const scale = copiedSizeRef.current.height / (copyBBox.maxY - copyBBox.minY || 1);
          payload.points = shape.points.map(pt => ({
            x: pt.x ?? pt[0],
            y: (pt.y ?? pt[1]) * scale
          }));
        }
      }

      dispatch(updateShapePosition(payload));
    });
  };

  const handlePasteSizeSeparately = () => {
    if (!copiedSizeRef.current) {
      alert("No size copied yet.");
      return;
    }
    if (!selectedShapeIds || selectedShapeIds.length === 0) {
      alert("Select shapes to paste size.");
      return;
    }
    selectedShapeIds.forEach(id => {
      const shape = shapes.find(s => s.id === id);
      if (!shape) return;

      let payload = { id };

      if (shape.type === "Rectangle") {
        payload.width = copiedSizeRef.current.width;
        payload.height = copiedSizeRef.current.height;
      }
      else if (shape.type === "Circle") {
        if (copiedSizeRef.current.radius !== undefined) {
          payload.radius = copiedSizeRef.current.radius;
        } else if (copiedSizeRef.current.width !== undefined) {
          payload.radius = copiedSizeRef.current.width / 2;
        }
      }
      else if (shape.type === "Polygon") {
        if (copiedSizeRef.current.points) {
          payload.points = JSON.parse(JSON.stringify(copiedSizeRef.current.points));
        }
      }
      else if (shape.type === "Star") {
        if (copiedSizeRef.current.outerRadius !== undefined) {
          payload.outerRadius = copiedSizeRef.current.outerRadius;
        }
        if (copiedSizeRef.current.innerRadius !== undefined) {
          payload.innerRadius = copiedSizeRef.current.innerRadius;
        }
        if (copiedSizeRef.current.corners !== undefined) {
          payload.corners = copiedSizeRef.current.corners;
        }
        if (copiedSizeRef.current.spokeRatio !== undefined) {
          payload.spokeRatio = copiedSizeRef.current.spokeRatio;
        }
        if (copiedSizeRef.current.rounded !== undefined) {
          payload.rounded = copiedSizeRef.current.rounded;
        }
        if (copiedSizeRef.current.randomized !== undefined) {
          payload.randomized = copiedSizeRef.current.randomized;
        }
      }
      payload.fill = copiedSizeRef.current.fill;
      payload.stroke = copiedSizeRef.current.stroke;
      payload.strokeWidth = copiedSizeRef.current.strokeWidth;

      dispatch(updateShapePosition(payload));
    });
  };

  const handlePasteWidthSeparately = () => {
    if (!copiedSizeRef.current || copiedSizeRef.current.width === undefined) {
      alert("No width copied yet.");
      return;
    }
    if (!selectedShapeIds || selectedShapeIds.length === 0) {
      alert("Select shapes to paste width.");
      return;
    }
    selectedShapeIds.forEach(id => {
      const shape = shapes.find(s => s.id === id);
      if (!shape) return;

      let payload = { id };

      if (shape.type === "Rectangle") {
        payload.width = copiedSizeRef.current.width;
      } else if (shape.type === "Circle") {
        payload.radius = copiedSizeRef.current.width / 2;
      } else if (shape.type === "Star") {
        payload.outerRadius = copiedSizeRef.current.width / 2;
      } else if (shape.type === "Polygon" && shape.points) {
        const origBBox = getShapeBoundingBox(shape);
        const copyBBox = getShapeBoundingBox({ ...shape, points: copiedSizeRef.current.points });
        if (origBBox && copyBBox) {
          const scale = copiedSizeRef.current.width / (copyBBox.maxX - copyBBox.minX || 1);
          payload.points = shape.points.map(pt => ({
            x: (pt.x ?? pt[0]) * scale,
            y: pt.y ?? pt[1]
          }));
        }
      }
      dispatch(updateShapePosition(payload));
    });
  };

  const handlePasteHeightSeparately = () => {
    if (!copiedSizeRef.current || copiedSizeRef.current.height === undefined) {
      alert("No height copied yet.");
      return;
    }
    if (!selectedShapeIds || selectedShapeIds.length === 0) {
      alert("Select shapes to paste height.");
      return;
    }
    selectedShapeIds.forEach(id => {
      const shape = shapes.find(s => s.id === id);
      if (!shape) return;

      let payload = { id };

      if (shape.type === "Rectangle") {
        payload.height = copiedSizeRef.current.height;
      } else if (shape.type === "Circle") {
        payload.radius = copiedSizeRef.current.height / 2;
      } else if (shape.type === "Star") {
        payload.outerRadius = copiedSizeRef.current.height / 2;
      } else if (shape.type === "Polygon" && shape.points) {
        const origBBox = getShapeBoundingBox(shape);
        const copyBBox = getShapeBoundingBox({ ...shape, points: copiedSizeRef.current.points });
        if (origBBox && copyBBox) {
          const scale = copiedSizeRef.current.height / (copyBBox.maxY - copyBBox.minY || 1);
          payload.points = shape.points.map(pt => ({
            x: pt.x ?? pt[0],
            y: (pt.y ?? pt[1]) * scale
          }));
        }
      }
      dispatch(updateShapePosition(payload));
    });
  };

  const handlePasteStyle = () => {
    if (!copiedStyleRef.current) {
      alert("No style copied yet.");
      return;
    }
    if (!selectedShapeIds || selectedShapeIds.length === 0) {
      alert("Select a shape to paste style.");
      return;
    }
    selectedShapeIds.forEach(id => {
      dispatch(updateShapePosition({
        id,
        ...copiedStyleRef.current
      }));
    });
  };

  const handlePaste = useCallback(() => {
    dispatch(paste());
  }, [dispatch]);

  const handleZoomIn = useCallback(() => {
    dispatch(zoomIn());
  }, [dispatch]);

  const handleZoomOut = useCallback(() => {
    dispatch(zoomOut());
  }, [dispatch]);

  const handleRotateClockwise = () => {
    if (selectedShapeId) {
      const newRotation = (selectedShape.rotation || 0) + 90;
      dispatch(
        updateShapePosition({ id: selectedShapeId, rotation: newRotation })
      );
    }
  };
  const handleRotateCounterClockwise = () => {
    if (selectedShapeId) {
      const newRotation = (selectedShape.rotation || 0) - 90;
      dispatch(
        updateShapePosition({ id: selectedShapeId, rotation: newRotation })
      );
    }
  };
  const handleFlipHorizontal = () => {
    if (selectedShapeId) {
      const newScaleX = selectedShape.scaleX === -1 ? 1 : -1;
      dispatch(updateShapePosition({ id: selectedShapeId, scaleX: newScaleX }));
    } else {
      console.error("No shape selected for horizontal flipping.");
    }
  };

  const handleFlipVertical = () => {
    if (selectedShapeId) {
      const newScaleY = selectedShape.scaleY === -1 ? 1 : -1;
      dispatch(updateShapePosition({ id: selectedShapeId, scaleY: newScaleY }));
    } else {
      console.error("No shape selected for vertical flipping.");
    }
  };
  const handleUnhideAll = () => {
    const newLayers = layers.map((layer, idx) => {
      if (idx !== selectedLayerIndex) return layer;
      return {
        ...layer,
        shapes: layer.shapes.map(shape => ({
          ...shape,
          visible: true
        }))
      };
    });
    dispatch({
      type: "tool/setLayersAndSelection",
      payload: { layers: newLayers, selectedLayerIndex }
    });
  };

  const handleUnlockAll = () => {
    const newLayers = layers.map((layer, idx) => {
      if (idx !== selectedLayerIndex) return layer;
      return {
        ...layer,
        shapes: layer.shapes.map(shape => ({
          ...shape,
          locked: false
        }))
      };
    });
    dispatch({
      type: "tool/setLayersAndSelection",
      payload: { layers: newLayers, selectedLayerIndex }
    });
  };
  const handleAddLayer = () => {
    dispatch(addLayer());
  };

  const moveLayerUpHandler = () => {
    if (selectedLayerIndex > 0) {
      dispatch({
        type: "tool/setSelectedLayerIndex",
        payload: selectedLayerIndex - 1,
      });
    }
  };

  const moveLayerDownHandler = () => {
    if (selectedLayerIndex < layers.length - 1) {
      dispatch({
        type: "tool/setSelectedLayerIndex",
        payload: selectedLayerIndex + 1,
      });
    }
  };
  const handleMoveSelectionToLayerAbove = () => {
    if (
      selectedShapeId != null &&
      selectedLayerIndex != null &&
      selectedLayerIndex < layers.length - 1
    ) {
      const shapeToMove = layers[selectedLayerIndex].shapes.find(s => s.id === selectedShapeId);
      if (!shapeToMove) return;

      const newLayers = layers.map((layer, idx) => {
        if (idx === selectedLayerIndex) {
          return {
            ...layer,
            shapes: layer.shapes.filter(s => s.id !== selectedShapeId)
          };
        }
        if (idx === selectedLayerIndex + 1) {
          return {
            ...layer,
            shapes: [shapeToMove, ...layer.shapes]
          };
        }
        return layer;
      });

      dispatch({
        type: "tool/setLayersAndSelection",
        payload: {
          layers: newLayers,
          selectedLayerIndex: selectedLayerIndex + 1,
          selectedShapeId
        }
      });
    }
  };
  const handleMoveSelectionToLayerBelow = () => {
    if (
      selectedShapeId != null &&
      selectedLayerIndex != null &&
      selectedLayerIndex > 0
    ) {
      const shapeToMove = layers[selectedLayerIndex].shapes.find(s => s.id === selectedShapeId);
      if (!shapeToMove) return;

      const newLayers = layers.map((layer, idx) => {
        if (idx === selectedLayerIndex) {
          return {
            ...layer,
            shapes: layer.shapes.filter(s => s.id !== selectedShapeId)
          };
        }
        if (idx === selectedLayerIndex - 1) {
          return {
            ...layer,
            shapes: [shapeToMove, ...layer.shapes]
          };
        }
        return layer;
      });

      dispatch({
        type: "tool/setLayersAndSelection",
        payload: {
          layers: newLayers,
          selectedLayerIndex: selectedLayerIndex - 1,
          selectedShapeId
        }
      });
    }
  };
  const handleMoveSelectionToLayer = () => {
    if (
      selectedShapeId == null ||
      selectedLayerIndex == null ||
      layers.length < 2
    ) {
      alert("Select a shape and make sure there are at least two layers.");
      return;
    }
    setTargetLayerIndex(null);
    setShowMoveLayerModal(true);
  };
  const handleLayerToTop = () => {
    if (selectedLayerIndex != null && selectedLayerIndex < layers.length - 1) {
      const layerToMove = layers[selectedLayerIndex];
      const newLayers = [
        ...layers.slice(0, selectedLayerIndex),
        ...layers.slice(selectedLayerIndex + 1),
        layerToMove
      ];
      dispatch({
        type: "tool/setLayersAndSelection",
        payload: {
          layers: newLayers,
          selectedLayerIndex: newLayers.length - 1
        }
      });
    }
  };

  const handleLayerToBottom = () => {
    if (selectedLayerIndex != null && selectedLayerIndex > 0) {
      const layerToMove = layers[selectedLayerIndex];
      const newLayers = [
        layerToMove,
        ...layers.slice(0, selectedLayerIndex),
        ...layers.slice(selectedLayerIndex + 1)
      ];
      dispatch({
        type: "tool/setLayersAndSelection",
        payload: {
          layers: newLayers,
          selectedLayerIndex: 0
        }
      });
    }
  };

  const handleRaiseLayer = () => {
    if (selectedLayerIndex != null && selectedLayerIndex < layers.length - 1) {
      const newLayers = [...layers];

      [newLayers[selectedLayerIndex], newLayers[selectedLayerIndex + 1]] =
        [newLayers[selectedLayerIndex + 1], newLayers[selectedLayerIndex]];
      dispatch({
        type: "tool/setLayersAndSelection",
        payload: {
          layers: newLayers,
          selectedLayerIndex: selectedLayerIndex + 1
        }
      });
    }
  };

  const handleLowerLayer = () => {
    if (selectedLayerIndex != null && selectedLayerIndex > 0) {
      const newLayers = [...layers];

      [newLayers[selectedLayerIndex], newLayers[selectedLayerIndex - 1]] =
        [newLayers[selectedLayerIndex - 1], newLayers[selectedLayerIndex]];
      dispatch({
        type: "tool/setLayersAndSelection",
        payload: {
          layers: newLayers,
          selectedLayerIndex: selectedLayerIndex - 1
        }
      });
    }
  };
  const handleToggleLayerLock = () => {
    if (selectedLayerIndex != null) {
      const newLayers = layers.map((layer, idx) =>
        idx === selectedLayerIndex
          ? { ...layer, locked: !layer.locked }
          : layer
      );
      dispatch({
        type: "tool/setLayersAndSelection",
        payload: {
          layers: newLayers,
          selectedLayerIndex
        }
      });
    }
  };
  const handleDelete = () => {
    if (selectedShapeId) {
      dispatch(deleteShape());
    } else if (selectedLayerIndex !== null) {
      dispatch(deleteLayer());
    }
  };
  const handleResetRotation = () => {
    if (selectedShapeId) {
      dispatch(updateShapePosition({ id: selectedShapeId, rotation: 0 }));
    }
  };
  const handleLockRotation = () => {
    if (selectedShapeId) {
      dispatch(lockRotation({ id: selectedShapeId, rotation: 0 }));
    } else {
      console.error("No shape selected for locking rotation.");
    }
  };
  const handleResetFlip = () => {
    if (selectedShapeId) {
      dispatch(
        updateShapePosition({ id: selectedShapeId, scaleX: 1, scaleY: 1 })
      );
    }
  };

  const handleGrayscaleToggle = (e) => {
    dispatch(toggleGrayScale());
  };
  const handleDuplicateLayer = () => {
    dispatch(duplicateLayer());
  };

  const handleDuplicateShape = () => {
    if (selectedShapeId) {
      dispatch(duplicateShape());
    }
  };

  const handleClone = () => {
    if (selectedShapeIds && selectedShapeIds.length > 0) {
      selectedShapeIds.forEach(id => {
        dispatch({ type: "tool/cloneShape", payload: { id } });
      });
    }
  };


  const handleUnlinkClone = () => {
    if (selectedShapeIds && selectedShapeIds.length > 0) {
      selectedShapeIds.forEach(id => {
        dispatch({ type: "tool/unlinkClone", payload: { id } });
      });
    }
  };

  const handleRelinkCopy = () => {
    if (selectedShapeId) {
      dispatch(relinkClone());
    }
  }

  const handleUnlinkcloneRecursively = () => {
    if (selectedShapeId) {
      console.log("handleUnlinkcloneRecursively")
      dispatch(unlinkclonerecursively());
    }
  }

  const handleselectorginal = () => {
    console.log("enter handleselectorginal ")
    if (selectedShapeId) {
      console.log("handleselectorginal")
      dispatch(selectOriginal());
    }

  }

  const handleToggleLayerVisibility = () => {
    dispatch(toggleLayerVisibility());
  };

  const handleGroupShapes = () => {
    dispatch(groupShapes());
  };

  const handleUngroupShapes = () => {
    if (selectedShapeIds && selectedShapeIds.length > 0) {
      dispatch(ungroupShapes({ ids: selectedShapeIds }));
    } else if (selectedGroupId) {
      dispatch(ungroupShapes({ ids: [selectedGroupId] }));
      setSelectedGroupId(null);
    }
  };
  const handlePopShapesOutOfGroups = () => {
    if (selectedShapeIds && selectedShapeIds.length > 0) {
      dispatch(popShapesOutOfGroups());
    }
  };
  const handleCreateNewPage = useCallback(() => {
    dispatch(createNewPage());
  }, [dispatch]);

  const haleUploadFile = (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        dispatch(uploadImage({ url: imageUrl, name: file.name }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        dispatch(addImage({ url: imageUrl, name: file.name }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };
  const handleCleanUp = () => {
    dispatch(clearLayerShapes());
  };

  const handleSelectAll = () => {
    dispatch(selecteAllShapes());
  };

  const handleDeselectAll = () => {
    dispatch(deselectAllShapes());
  };
  const [showCloseTabModal, setShowCloseTabModal] = useState(false);
  const handleQuit = () => {
    localStorage.setItem("2dcad_quit", Date.now());
    window.close();
    setTimeout(() => {
      if (!window.closed) {
        setShowCloseTabModal(true);
      }
    }, 300);
  };
  const handleCloseWindow = () => {
    window.close();
    setTimeout(() => {
      if (!window.closed) {
        alert("Please close this tab manually.");
      }
    }, 300);
  };
  const handleFillAndStroke = () => {
    if (selectedShapeId) {
      const newFillColor = fillColor;
      const newStrokeColor = strokeColor;

      dispatch(
        updateShapePosition({
          id: selectedShapeId,
          fill: newFillColor,
          stroke: newStrokeColor,
        })
      );
    }
  };
  const handleTraceBitmap = async () => {
    const selectedShape = shapes.find(s => s.id === selectedShapeId && s.type === "Image");
    if (!selectedShape) {
      alert("Please select an image to trace.");
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = selectedShape.url || selectedShape.src;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const { data, width, height } = imageData;
      let pathData = "";

      for (let y = 0; y < height; y++) {
        let inShape = false;
        let startX = 0;
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          const brightness = (r + g + b) / 3;
          if (brightness < 128 && !inShape) {
            inShape = true;
            startX = x;
          } else if (brightness >= 128 && inShape) {
            inShape = false;
            pathData += `M${startX},${y}H${x} `;
          }
        }
        if (inShape) {
          pathData += `M${startX},${y}H${width} `;
        }
      }

      dispatch({
        type: "tool/addShape",
        payload: {
          type: "Tracing",
          pathData,
          x: selectedShape.x || 0,
          y: selectedShape.y || 0,
          width: selectedShape.width || img.width,
          height: selectedShape.height || img.height,
          stroke: "#000",
          fill: "none",
          strokeWidth: 1,
        }
      });
      alert("Tracing complete! Path added.");
    };
    img.onerror = () => {
      alert("Failed to load image for tracing.");
    };
  };
  const [showSymbolsModal, setShowSymbolsModal] = useState(false);
  const [selectedSymbolSet, setSelectedSymbolSet] = useState(null);


  const handleOpenSymbolsDialog = () => {
    setShowSymbolsModal(true);
    setSelectedSymbolSet(null);
  };
  const handleCloseSymbolsDialog = () => setShowSymbolsModal(false);
  const pageMargin = useSelector(state => state.tool.pageMargin || { left: 0, top: 0 });
  const handleObjectsToGuide = () => {
    const selectedShapes = shapes.filter(s => selectedShapeIds.includes(s.id));
    if (!selectedShapes.length) {
      alert("Select one or more shapes to convert to guides.");
      return;
    }
    const guidesToAdd = [];
    selectedShapes.forEach(shape => {
      if (shape.type === "Rectangle") {
        guidesToAdd.push({ orientation: "vertical", position: shape.x - pageMargin.left });
        guidesToAdd.push({ orientation: "vertical", position: shape.x + shape.width - pageMargin.left });
        guidesToAdd.push({ orientation: "horizontal", position: shape.y - pageMargin.top });
        guidesToAdd.push({ orientation: "horizontal", position: shape.y + shape.height - pageMargin.top });
      } else if (shape.type === "Line" && Array.isArray(shape.points) && shape.points.length >= 4) {
        guidesToAdd.push({ orientation: "vertical", position: shape.points[0] - pageMargin.left });
        guidesToAdd.push({ orientation: "vertical", position: shape.points[2] - pageMargin.left });
        guidesToAdd.push({ orientation: "horizontal", position: shape.points[1] - pageMargin.top });
        guidesToAdd.push({ orientation: "horizontal", position: shape.points[3] - pageMargin.top });
      } else if (shape.type === "Circle") {
        guidesToAdd.push({ orientation: "vertical", position: shape.x - pageMargin.left });
        guidesToAdd.push({ orientation: "horizontal", position: shape.y - pageMargin.top });
        guidesToAdd.push({ orientation: "vertical", position: shape.x + shape.radius - pageMargin.left });
        guidesToAdd.push({ orientation: "vertical", position: shape.x - shape.radius - pageMargin.left });
        guidesToAdd.push({ orientation: "horizontal", position: shape.y + shape.radius - pageMargin.top });
        guidesToAdd.push({ orientation: "horizontal", position: shape.y - shape.radius - pageMargin.top });
      } else if (shape.type === "Polygon" && Array.isArray(shape.points)) {
        shape.points.forEach(pt => {
          guidesToAdd.push({ orientation: "vertical", position: pt.x - pageMargin.left });
          guidesToAdd.push({ orientation: "horizontal", position: pt.y - pageMargin.top });
        });
      }
    });

    window.dispatchEvent(new CustomEvent("addGuides", { detail: guidesToAdd }));
    selectedShapeIds.forEach(id => dispatch(deleteShape(id)));
  };
  const handleSetClip = () => {
    if (selectedShapeIds.length !== 2) {
      alert("Select exactly two shapes: first the target (e.g. image), then the clip path (on top).");
      return;
    }
    const [targetId, clipId] = selectedShapeIds;
    const targetShape = shapes.find(s => s.id === targetId);
    const clipShape = shapes.find(s => s.id === clipId);
    if (!targetShape || !clipShape) return;

    let clipPath = null;
    if (clipShape.type === "Polygon" && Array.isArray(clipShape.points)) {
      clipPath = clipShape.points.map(pt => ({
        x: (clipShape.x ?? 0) + pt.x - targetShape.x,
        y: (clipShape.y ?? 0) + pt.y - targetShape.y
      }));
    } else if (clipShape.type === "Rectangle") {
      clipPath = [
        { x: clipShape.x - targetShape.x, y: clipShape.y - targetShape.y },
        { x: clipShape.x + clipShape.width - targetShape.x, y: clipShape.y - targetShape.y },
        { x: clipShape.x + clipShape.width - targetShape.x, y: clipShape.y + clipShape.height - targetShape.y },
        { x: clipShape.x - targetShape.x, y: clipShape.y + clipShape.height - targetShape.y }
      ];
    } else if (clipShape.type === "Circle") {
      const num = 32;
      clipPath = Array.from({ length: num }).map((_, i) => {
        const angle = (2 * Math.PI * i) / num;
        return {
          x: clipShape.x + Math.cos(angle) * clipShape.radius - targetShape.x,
          y: clipShape.y + Math.sin(angle) * clipShape.radius - targetShape.y
        };
      });
    } else {
      alert("Clip path must be a polygon, rectangle, or circle.");
      return;
    }

    dispatch(updateShapePosition({
      id: targetId,
      clipPath
    }));


    dispatch(deleteShape(clipId));
  };
  const handleSetInverseClip = () => {
    if (selectedShapeIds.length !== 2) {
      alert("Select exactly two shapes: first the target (e.g. image), then the clip path (on top).");
      return;
    }
    const [targetId, clipId] = selectedShapeIds;
    const targetShape = shapes.find(s => s.id === targetId);
    const clipShape = shapes.find(s => s.id === clipId);
    if (!targetShape || !clipShape) return;


    const rectPath = [
      { x: 0, y: 0 },
      { x: targetShape.width, y: 0 },
      { x: targetShape.width, y: targetShape.height },
      { x: 0, y: targetShape.height }
    ];


    let clipPath = [];
    if (clipShape.type === "Polygon" && Array.isArray(clipShape.points)) {
      clipPath = clipShape.points.map(pt => ({
        x: (clipShape.x ?? 0) + pt.x - targetShape.x,
        y: (clipShape.y ?? 0) + pt.y - targetShape.y
      }));
    } else if (clipShape.type === "Rectangle") {
      clipPath = [
        { x: clipShape.x - targetShape.x, y: clipShape.y - targetShape.y },
        { x: clipShape.x + clipShape.width - targetShape.x, y: clipShape.y - targetShape.y },
        { x: clipShape.x + clipShape.width - targetShape.x, y: clipShape.y + clipShape.height - targetShape.y },
        { x: clipShape.x - targetShape.x, y: clipShape.y + clipShape.height - targetShape.y }
      ];
    } else if (clipShape.type === "Circle") {
      const num = 32;
      clipPath = Array.from({ length: num }).map((_, i) => {
        const angle = (2 * Math.PI * i) / num;
        return {
          x: clipShape.x + Math.cos(angle) * clipShape.radius - targetShape.x,
          y: clipShape.y + Math.sin(angle) * clipShape.radius - targetShape.y
        };
      });
    } else {
      alert("Clip path must be a polygon, rectangle, or circle.");
      return;
    }


    dispatch(updateShapePosition({
      id: targetId,
      inverseClipPath: [rectPath, clipPath]
    }));


    dispatch(deleteShape(clipId));
  };
  const handleReleaseClip = () => {

    const targetShape = shapes.find(
      s =>
        selectedShapeIds.includes(s.id) &&
        (s.clipPath || s.inverseClipPath)
    );
    if (!targetShape) {
      alert("Select a clipped object to release its clip.");
      return;
    }


    let restoredShape = null;
    if (targetShape.clipPath) {

      restoredShape = {
        id: `clip-restored-${Date.now()}`,
        type: "Polygon",
        x: targetShape.x,
        y: targetShape.y,
        points: targetShape.clipPath.map(pt => ({ x: pt.x, y: pt.y })),
        fill: "#00bfff44",
        stroke: "#00bfff",
        strokeWidth: 1,
        draggable: true,
        selected: false,
      };
    } else if (targetShape.inverseClipPath) {

      const inner = targetShape.inverseClipPath[1];
      restoredShape = {
        id: `clip-restored-${Date.now()}`,
        type: "Polygon",
        x: targetShape.x,
        y: targetShape.y,
        points: inner.map(pt => ({ x: pt.x, y: pt.y })),
        fill: "#00bfff44",
        stroke: "#00bfff",
        strokeWidth: 1,
        draggable: true,
        selected: false,
      };
    }


    dispatch(updateShapePosition({
      id: targetShape.id,
      clipPath: undefined,
      inverseClipPath: undefined,
    }));


    if (restoredShape) {
      dispatch({ type: "tool/addShape", payload: restoredShape });
    }
  };
  const handleSetMask = () => {
    if (selectedShapeIds.length !== 2) {
      alert("Select exactly two shapes: first the target (e.g. image), then the mask shape (on top).");
      return;
    }
    const [targetId, maskId] = selectedShapeIds;
    const targetShape = shapes.find(s => s.id === targetId);
    const maskShape = shapes.find(s => s.id === maskId);
    if (!targetShape || !maskShape) return;

    let maskPath = null;
    if (maskShape.type === "Polygon" && Array.isArray(maskShape.points)) {
      maskPath = maskShape.points.map(pt => ({
        x: (maskShape.x ?? 0) + pt.x - targetShape.x,
        y: (maskShape.y ?? 0) + pt.y - targetShape.y
      }));
    } else if (maskShape.type === "Rectangle") {
      maskPath = [
        { x: maskShape.x - targetShape.x, y: maskShape.y - targetShape.y },
        { x: maskShape.x + maskShape.width - targetShape.x, y: maskShape.y - targetShape.y },
        { x: maskShape.x + maskShape.width - targetShape.x, y: maskShape.y + maskShape.height - targetShape.y },
        { x: maskShape.x - targetShape.x, y: maskShape.y + maskShape.height - targetShape.y }
      ];
    } else if (maskShape.type === "Circle") {
      const num = 32;
      maskPath = Array.from({ length: num }).map((_, i) => {
        const angle = (2 * Math.PI * i) / num;
        return {
          x: maskShape.x + Math.cos(angle) * maskShape.radius - targetShape.x,
          y: maskShape.y + Math.sin(angle) * maskShape.radius - targetShape.y
        };
      });
    } else {
      alert("Mask must be a polygon, rectangle, or circle.");
      return;
    }

    dispatch(updateShapePosition({
      id: targetId,
      maskPath
    }));


    dispatch(deleteShape(maskId));
  };
  const handleSetInverseMask = () => {
    if (selectedShapeIds.length !== 2) {
      alert("Select exactly two shapes: first the target (e.g. image), then the mask shape (on top).");
      return;
    }
    const [targetId, maskId] = selectedShapeIds;
    const targetShape = shapes.find(s => s.id === targetId);
    const maskShape = shapes.find(s => s.id === maskId);
    if (!targetShape || !maskShape) return;


    const rectPath = [
      { x: 0, y: 0 },
      { x: targetShape.width, y: 0 },
      { x: targetShape.width, y: targetShape.height },
      { x: 0, y: targetShape.height }
    ];


    let maskPath = [];
    if (maskShape.type === "Polygon" && Array.isArray(maskShape.points)) {
      maskPath = maskShape.points.map(pt => ({
        x: (maskShape.x ?? 0) + pt.x - targetShape.x,
        y: (maskShape.y ?? 0) + pt.y - targetShape.y
      }));
    } else if (maskShape.type === "Rectangle") {
      maskPath = [
        { x: maskShape.x - targetShape.x, y: maskShape.y - targetShape.y },
        { x: maskShape.x + maskShape.width - targetShape.x, y: maskShape.y - targetShape.y },
        { x: maskShape.x + maskShape.width - targetShape.x, y: maskShape.y + maskShape.height - targetShape.y },
        { x: maskShape.x - targetShape.x, y: maskShape.y + maskShape.height - targetShape.y }
      ];
    } else if (maskShape.type === "Circle") {
      const num = 32;
      maskPath = Array.from({ length: num }).map((_, i) => {
        const angle = (2 * Math.PI * i) / num;
        return {
          x: maskShape.x + Math.cos(angle) * maskShape.radius - targetShape.x,
          y: maskShape.y + Math.sin(angle) * maskShape.radius - targetShape.y
        };
      });
    } else {
      alert("Mask must be a polygon, rectangle, or circle.");
      return;
    }


    dispatch(updateShapePosition({
      id: targetId,
      inverseMaskPath: [rectPath, maskPath]
    }));


    dispatch(deleteShape(maskId));
  };
  const handleReleaseMask = () => {

    const targetShape = shapes.find(
      s =>
        selectedShapeIds.includes(s.id) &&
        (s.maskPath || s.inverseMaskPath)
    );
    if (!targetShape) {
      alert("Select a masked object to release its mask.");
      return;
    }


    let restoredShape = null;
    if (targetShape.maskPath) {
      restoredShape = {
        id: `mask-restored-${Date.now()}`,
        type: "Polygon",
        x: targetShape.x,
        y: targetShape.y,
        points: targetShape.maskPath.map(pt => ({ x: pt.x, y: pt.y })),
        fill: "#00bfff44",
        stroke: "#00bfff",
        strokeWidth: 1,
        draggable: true,
        selected: false,
      };
    } else if (targetShape.inverseMaskPath) {

      const inner = targetShape.inverseMaskPath[1];
      restoredShape = {
        id: `mask-restored-${Date.now()}`,
        type: "Polygon",
        x: targetShape.x,
        y: targetShape.y,
        points: inner.map(pt => ({ x: pt.x, y: pt.y })),
        fill: "#00bfff44",
        stroke: "#00bfff",
        strokeWidth: 1,
        draggable: true,
        selected: false,
      };
    }


    dispatch(updateShapePosition({
      id: targetShape.id,
      maskPath: undefined,
      inverseMaskPath: undefined,
    }));


    if (restoredShape) {
      dispatch({ type: "tool/addShape", payload: restoredShape });
    }
  };
  function moveShapeInLayer(shapes, shapeId, toIndex) {
    const idx = shapes.findIndex(s => s.id === shapeId);
    if (idx === -1 || toIndex < 0 || toIndex >= shapes.length) return shapes;
    const arr = shapes.slice();
    const [item] = arr.splice(idx, 1);
    arr.splice(toIndex, 0, item);
    return arr;
  }
  const handleRaiseToTop = () => {
    if (!selectedShapeId) return;
    const layer = layers[selectedLayerIndex];
    const idx = layer.shapes.findIndex(s => s.id === selectedShapeId);
    if (idx === -1 || idx === layer.shapes.length - 1) return;
    const newShapes = moveShapeInLayer(layer.shapes, selectedShapeId, layer.shapes.length - 1);
    const newLayers = layers.map((l, i) =>
      i === selectedLayerIndex ? { ...l, shapes: newShapes } : l
    );
    dispatch({
      type: "tool/setLayersAndSelection",
      payload: { layers: newLayers, selectedLayerIndex, selectedShapeId }
    });
  };
  const handleLowerToBottom = () => {
    if (!selectedShapeId) return;
    const layer = layers[selectedLayerIndex];
    const idx = layer.shapes.findIndex(s => s.id === selectedShapeId);
    if (idx <= 0) return;
    const newShapes = moveShapeInLayer(layer.shapes, selectedShapeId, 0);
    const newLayers = layers.map((l, i) =>
      i === selectedLayerIndex ? { ...l, shapes: newShapes } : l
    );
    dispatch({
      type: "tool/setLayersAndSelection",
      payload: { layers: newLayers, selectedLayerIndex, selectedShapeId }
    });
  };
  const handleRaise = () => {
    if (!selectedShapeId) return;
    const layer = layers[selectedLayerIndex];
    const idx = layer.shapes.findIndex(s => s.id === selectedShapeId);
    if (idx === -1 || idx === layer.shapes.length - 1) return;
    const newShapes = moveShapeInLayer(layer.shapes, selectedShapeId, idx + 1);
    const newLayers = layers.map((l, i) =>
      i === selectedLayerIndex ? { ...l, shapes: newShapes } : l
    );
    dispatch({
      type: "tool/setLayersAndSelection",
      payload: { layers: newLayers, selectedLayerIndex, selectedShapeId }
    });
  };
  const handleLower = () => {
    if (!selectedShapeId) return;
    const layer = layers[selectedLayerIndex];
    const idx = layer.shapes.findIndex(s => s.id === selectedShapeId);
    if (idx <= 0) return;
    const newShapes = moveShapeInLayer(layer.shapes, selectedShapeId, idx - 1);
    const newLayers = layers.map((l, i) =>
      i === selectedLayerIndex ? { ...l, shapes: newShapes } : l
    );
    dispatch({
      type: "tool/setLayersAndSelection",
      payload: { layers: newLayers, selectedLayerIndex, selectedShapeId }
    });
  };
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const handleApplyTransform = () => {
    if (selectedShapeId) {
      dispatch({
        type: "tool/updateShapePosition",
        payload: {
          id: selectedShapeId,
          scaleX: scaleX,
          scaleY: scaleY,
        },
      });
    }
    setShowTransformModal(false);
  };

  useEffect(() => {
    if (showTransformModal && selectedShape) {
      setMoveX(0);
      setMoveY(0);
    }
  }, [showTransformModal, selectedShape]);
  const [showSelectorsModal, setShowSelectorsModal] = useState(false);
  const handleOpenSelectors = () => setShowSelectorsModal(true);
  const handleCloseSelectors = () => setShowSelectorsModal(false);
  function shapeToSVGElement(shape) {
    if (!shape) return "";
    if (shape.type === "Rectangle") {
      return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="${typeof shape.fill === "string" ? shape.fill : "none"}" stroke="${typeof shape.stroke === "string" ? shape.stroke : "none"}" stroke-width="${shape.strokeWidth || 1}" />`;
    }
    if (shape.type === "Circle") {
      return `<circle cx="${shape.x}" cy="${shape.y}" r="${shape.radius}" fill="${typeof shape.fill === "string" ? shape.fill : "none"}" stroke="${typeof shape.stroke === "string" ? shape.stroke : "none"}" stroke-width="${shape.strokeWidth || 1}" />`;
    }
    if (shape.type === "Polygon" && Array.isArray(shape.points)) {
      const pts = shape.points.map(pt => `${(pt.x ?? pt[0]) + (shape.x || 0)},${(pt.y ?? pt[1]) + (shape.y || 0)}`).join(" ");
      return `<polygon points="${pts}" fill="${typeof shape.fill === "string" ? shape.fill : "none"}" stroke="${typeof shape.stroke === "string" ? shape.stroke : "none"}" stroke-width="${shape.strokeWidth || 1}" />`;
    }
    if (shape.type === "Star") {
      const num = (shape.corners || 5) * 2;
      const pts = Array.from({ length: num }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / num - Math.PI / 2;
        const r = i % 2 === 0 ? shape.outerRadius : shape.innerRadius;
        return [
          (shape.x + r * Math.cos(angle)),
          (shape.y + r * Math.sin(angle))
        ].join(",");
      }).join(" ");
      return `<polygon points="${pts}" fill="${typeof shape.fill === "string" ? shape.fill : "none"}" stroke="${typeof shape.stroke === "string" ? shape.stroke : "none"}" stroke-width="${shape.strokeWidth || 1}" />`;
    }
    if (shape.type === "Path" && shape.path) {
      return `<path d="${shape.path}" fill="${typeof shape.fill === "string" ? shape.fill : "none"}" stroke="${typeof shape.stroke === "string" ? shape.stroke : "none"}" stroke-width="${shape.strokeWidth || 1}" />`;
    }
    if ((shape.type === "Pencil" || shape.type === "Calligraphy") && Array.isArray(shape.points)) {
      const pts = shape.points.map(pt => `${pt.x},${pt.y}`).join(" ");
      return `<polyline points="${pts}" fill="none" stroke="${typeof shape.stroke === "string" ? shape.stroke : "#000"}" stroke-width="${shape.strokeWidth || 2}" />`;
    }
    if (shape.type === "Bezier" && Array.isArray(shape.points) && shape.points.length >= 4) {
      let d = `M ${shape.points[0].x},${shape.points[0].y}`;
      for (let i = 1; i + 2 < shape.points.length; i += 3) {
        d += ` C ${shape.points[i].x},${shape.points[i].y} ${shape.points[i + 1].x},${shape.points[i + 1].y} ${shape.points[i + 2].x},${shape.points[i + 2].y}`;
      }
      return `<path d="${d}" fill="none" stroke="${typeof shape.stroke === "string" ? shape.stroke : "#000"}" stroke-width="${shape.strokeWidth || 2}" />`;
    }
    if (shape.type === "Image" && (shape.url || shape.src)) {
      return `<image x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" href="${shape.url || shape.src}" />`;
    }
    if (shape.type === "Text") {
      return `<text x="${shape.x}" y="${shape.y}" font-size="${shape.fontSize || 16}" fill="${typeof shape.fill === "string" ? shape.fill : "black"}">${shape.text || ""}</text>`;
    }
    if (shape.type === "Spiral" && shape.path) {
      return `<path d="${shape.path}" fill="none" stroke="${typeof shape.stroke === "string" ? shape.stroke : "#000"}" stroke-width="${shape.strokeWidth || 2}" />`;
    }
    let markerAttrs = "";
    if (shape.markerStart && shape.markerStart !== "none")
      markerAttrs += ` marker-start="url(#${shape.markerStart})"`;
    if (shape.markerMid && shape.markerMid !== "none")
      markerAttrs += ` marker-mid="url(#${shape.markerMid})"`;
    if (shape.markerEnd && shape.markerEnd !== "none")
      markerAttrs += ` marker-end="url(#${shape.markerEnd})"`;
    return "";
  }
  const [showObjectPropertiesModal, setShowObjectPropertiesModal] = useState(false);
  const handleOpenObjectProperties = () => setShowObjectPropertiesModal(true);
  const handleCloseObjectProperties = () => setShowObjectPropertiesModal(false);
  function renderShapeProperties(shape) {
    if (!shape) return null;
    const entries = Object.entries(shape)
      .filter(([key]) => key !== "id" && key !== "selected" && key !== "draggable");
    return (
      <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key}>
              <td style={{ fontWeight: 500, padding: "4px 8px", borderBottom: "1px solid #eee" }}>{key}</td>
              <td style={{ padding: "4px 8px", borderBottom: "1px solid #eee" }}>
                {typeof value === "object"
                  ? <pre style={{ margin: 0, fontSize: 13, background: "#f8f8f8", borderRadius: 3, padding: 4 }}>{JSON.stringify(value, null, 2)}</pre>
                  : String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  const handleObjectsToMarker = () => {
    const selectedShapes = shapes.filter(s => selectedShapeIds.includes(s.id));
    if (!selectedShapes.length) {
      alert("Select one or more shapes to convert to marker.");
      return;
    }

    const markerId = `custom-marker-${Date.now()}`;
    const bbox = selectedShapes[0];
    const minX = bbox.x || 0;
    const minY = bbox.y || 0;
    const width = bbox.width || 32;
    const height = bbox.height || 32;

    function shapeToSvg(s) {
      if (s.type === "Rectangle") {
        return `<rect x="${(s.x || 0) - minX}" y="${(s.y || 0) - minY}" width="${s.width}" height="${s.height}" fill="${s.fill || "black"}" stroke="${s.stroke || "none"}" stroke-width="${s.strokeWidth || 0}" />`;
      }
      if (s.type === "Circle") {
        return `<circle cx="${(s.x || 0) - minX}" cy="${(s.y || 0) - minY}" r="${s.radius}" fill="${s.fill || "black"}" stroke="${s.stroke || "none"}" stroke-width="${s.strokeWidth || 0}" />`;
      }
      if (s.type === "Polygon" && Array.isArray(s.points)) {
        const pts = s.points.map(pt => `${(pt.x ?? pt[0]) + (s.x || 0) - minX},${(pt.y ?? pt[1]) + (s.y || 0) - minY}`).join(" ");
        return `<polygon points="${pts}" fill="${s.fill || "black"}" stroke="${s.stroke || "none"}" stroke-width="${s.strokeWidth || 0}" />`;
      }
      if (s.type === "Path" && s.path) {
        return `<path d="${s.path}" fill="${s.fill || "none"}" stroke="${s.stroke || "black"}" stroke-width="${s.strokeWidth || 1}" />`;
      }
      return "";
    }

    const svgContent = selectedShapes.map(shapeToSvg).join("\n");

    const markerSvg = `
    <marker id="${markerId}" markerWidth="${width}" markerHeight="${height}" refX="${width / 2}" refY="${height / 2}" orient="auto" markerUnits="strokeWidth">
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        ${svgContent}
      </svg>
    </marker>
  `;

    dispatch(addMarker({ id: markerId, svg: markerSvg }));

    alert("Marker created! You can now use it in Fill & Stroke dialog.");
  };
  const handleSplitModeChange = (value) => {
    dispatch(setSplitMode(value));
    if (value === "Split") {
      dispatch(setSplitPosition(0.5));
    }
  };
  const handlePreviousWindow = () => {
    if (currentDocumentIndex > 0) {
      dispatch(setCurrentDocumentIndex(currentDocumentIndex - 1));
    }
  };

  const handleNextWindow = () => {
    if (currentDocumentIndex < openDocuments.length - 1) {
      dispatch(setCurrentDocumentIndex(currentDocumentIndex + 1));
    }
  };
  const [showIconPreview, setShowIconPreview] = useState(false);
  const handleFindText = () => {
    const results = [];
    layers.forEach((layer, layerIdx) => {
      layer.shapes.forEach((shape) => {
        if (shape.type === "Text" && shape.text && shape.text.includes(findText)) {
          results.push({ layerIdx, shapeId: shape.id, text: shape.text });
        }
      });
    });
    setFindResults(results);
  };

  const handleReplaceText = () => {
    layers.forEach((layer, layerIdx) => {
      layer.shapes.forEach((shape) => {
        if (shape.type === "Text" && shape.text && shape.text.includes(findText)) {
          dispatch({
            type: "tool/updateShapePosition",
            payload: { id: shape.id, text: shape.text.replaceAll(findText, replaceText) }
          });
        }
      });
    });
    setShowFindReplaceModal(false);
    setFindText("");
    setReplaceText("");
    setFindResults([]);
  };
  function getShapeBoundingBox(shape) {
    if (shape.type === "Polygon" && Array.isArray(shape.points)) {
      const xs = shape.points.map(pt => (pt.x ?? pt[0]) + (shape.x || 0));
      const ys = shape.points.map(pt => (pt.y ?? pt[1]) + (shape.y || 0));
      return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };
    }
    if (shape.type === "Star") {
      const num = (shape.corners || 5) * 2;
      const pts = Array.from({ length: num }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / num - Math.PI / 2;
        const r = i % 2 === 0 ? shape.outerRadius : shape.innerRadius;
        return {
          x: shape.x + r * Math.cos(angle),
          y: shape.y + r * Math.sin(angle),
        };
      });
      const xs = pts.map(pt => pt.x);
      const ys = pts.map(pt => pt.y);
      return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };
    }
    if ((shape.type === "Pencil" || shape.type === "Calligraphy") && Array.isArray(shape.points)) {
      const xs = shape.points.map(pt => pt.x);
      const ys = shape.points.map(pt => pt.y);
      return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };
    }
    if (shape.type === "Bezier" && Array.isArray(shape.points)) {
      const xs = shape.points.map(pt => pt.x);
      const ys = shape.points.map(pt => pt.y);
      return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };
    }
    return null;
  }
  const handleMakeBitmapCopy = async () => {
    if (!selectedShapeId) {
      alert("Select a shape first.");
      return;
    }
    const shape = shapes.find(s => s.id === selectedShapeId);
    if (!shape) {
      alert("Shape not found.");
      return;
    }

    let width = shape.width || (shape.radius ? shape.radius * 2 : 64);
    let height = shape.height || (shape.radius ? shape.radius * 2 : 64);
    let shapeForSvg = { ...shape, x: 0, y: 0 };

    if (
      shape.type === "Polygon" ||
      shape.type === "Star" ||
      shape.type === "Pencil" ||
      shape.type === "Calligraphy" ||
      shape.type === "Bezier"
    ) {
      const bbox = getShapeBoundingBox(shape);
      if (bbox) {
        width = bbox.maxX - bbox.minX || 64;
        height = bbox.maxY - bbox.minY || 64;
        if (shape.type === "Polygon" && Array.isArray(shape.points)) {
          shapeForSvg = {
            ...shape,
            x: 0,
            y: 0,
            points: shape.points.map(pt => ({
              x: (pt.x ?? pt[0]) + (shape.x || 0) - bbox.minX,
              y: (pt.y ?? pt[1]) + (shape.y || 0) - bbox.minY,
            })),
          };
        } else if (shape.type === "Star") {
          shapeForSvg = {
            ...shape,
            x: shape.x - bbox.minX,
            y: shape.y - bbox.minY,
          };
        } else if ((shape.type === "Pencil" || shape.type === "Calligraphy") && Array.isArray(shape.points)) {
          shapeForSvg = {
            ...shape,
            x: 0,
            y: 0,
            points: shape.points.map(pt => ({
              x: pt.x - bbox.minX,
              y: pt.y - bbox.minY,
            })),
          };
        } else if (shape.type === "Bezier" && Array.isArray(shape.points)) {
          shapeForSvg = {
            ...shape,
            x: 0,
            y: 0,
            points: shape.points.map(pt => ({
              x: pt.x - bbox.minX,
              y: pt.y - bbox.minY,
            })),
          };
        }
      }
    } else if (shape.type === "Circle") {
      shapeForSvg = {
        ...shape,
        x: width / 2,
        y: height / 2,
      };
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    ${shapeToSVGElement(shapeForSvg)}
  </svg>`;

    const img = new window.Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const pngDataUrl = canvas.toDataURL("image/png");

      dispatch({
        type: "tool/addShape",
        payload: {
          id: `bitmap-copy-${Date.now()}`,
          type: "Image",
          url: pngDataUrl,
          x: (shape.x || 0) + 20,
          y: (shape.y || 0) + 20,
          width,
          height,
          name: "Bitmap Copy",
          draggable: true,
          selected: false,
        }
      });

      URL.revokeObjectURL(url);
      alert("Bitmap copy created!");
    };
    img.onerror = () => {
      alert("Failed to create bitmap copy.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };
  function isSamePaint(a, b) {
    function normalizeColor(c) {
      if (typeof c === "string") {
        const color = c.trim().toLowerCase();
        if (color === "black" || color === "#000" || color === "#000000") return "#000000";
        if (color === "white" || color === "#fff" || color === "#ffffff") return "#ffffff";
        if (color === "none" || color === "" || color === "transparent") return "none";
        return color;
      }
      if (c === null || c === undefined) return "none";
      return c;
    }
    if (typeof a === "object" && typeof b === "object") {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    return normalizeColor(a) === normalizeColor(b);
  }

  const handleSelectSameFillAndStroke = () => {
    if (!selectedShapeId) {
      alert("Select a shape first.");
      return;
    }
    const allShapes = layers.flatMap(layer => layer.shapes);
    const referenceShape = allShapes.find(s => s.id === selectedShapeId);
    if (!referenceShape) return;

    const matchedIds = allShapes
      .filter(s => {
        const sameFill = isSamePaint(s.fill, referenceShape.fill);
        const sameStroke = isSamePaint(s.stroke, referenceShape.stroke);
        return sameFill && sameStroke;
      })
      .map(s => s.id);

    if (matchedIds.length === 0) {
      alert("No shapes found with the same fill and stroke.");
      return;
    }

    dispatch({
      type: "tool/updateSelection",
      payload: matchedIds
    });
  };
  const handleSelectSameFillColor = () => {
    if (!selectedShapeId) {
      alert("Select a shape first.");
      return;
    }
    const allShapes = layers.flatMap(layer => layer.shapes);
    const referenceShape = allShapes.find(s => s.id === selectedShapeId);
    if (!referenceShape) return;
    const matchedIds = allShapes
      .filter(s =>
        typeof s.fill === "string" &&
        typeof referenceShape.fill === "string" &&
        isSamePaint(s.fill, referenceShape.fill)
      )
      .map(s => s.id);

    if (matchedIds.length === 0) {
      alert("No shapes found with the same fill color.");
      return;
    }

    dispatch({
      type: "tool/updateSelection",
      payload: matchedIds
    });
  };
  const handleSelectSameStrokeColor = () => {
    if (!selectedShapeId) {
      alert("Select a shape first.");
      return;
    }
    const allShapes = layers.flatMap(layer => layer.shapes);
    const referenceShape = allShapes.find(s => s.id === selectedShapeId);
    if (!referenceShape) return;

    const matchedIds = allShapes
      .filter(s =>
        typeof s.stroke === "string" &&
        typeof referenceShape.stroke === "string" &&
        isSamePaint(s.stroke, referenceShape.stroke)
      )
      .map(s => s.id);

    if (matchedIds.length === 0) {
      alert("No shapes found with the same stroke color.");
      return;
    }

    dispatch({
      type: "tool/updateSelection",
      payload: matchedIds
    });
  };
  const handleSelectSameStrokeStyle = () => {
    if (!selectedShapeId) {
      alert("Select a shape first.");
      return;
    }
    const allShapes = layers.flatMap(layer => layer.shapes);
    const referenceShape = allShapes.find(s => s.id === selectedShapeId);
    if (!referenceShape) return;

    const matchedIds = allShapes
      .filter(s =>
        s.strokeStyle === referenceShape.strokeStyle
      )
      .map(s => s.id);

    if (matchedIds.length === 0) {
      alert("No shapes found with the same stroke style.");
      return;
    }

    dispatch({
      type: "tool/updateSelection",
      payload: matchedIds
    });
  };
  const handleSelectSameObjectType = () => {
    if (!selectedShapeId) {
      alert("Select a shape first.");
      return;
    }
    const allShapes = layers.flatMap(layer => layer.shapes);
    const referenceShape = allShapes.find(s => s.id === selectedShapeId);
    if (!referenceShape) return;

    const matchedIds = allShapes
      .filter(s => s.type === referenceShape.type)
      .map(s => s.id);

    if (matchedIds.length === 0) {
      alert("No shapes found with the same object type.");
      return;
    }

    dispatch({
      type: "tool/updateSelection",
      payload: matchedIds
    });
  };
  const handleInvertSelection = () => {
    const allShapes = layers.flatMap(layer => layer.shapes);
    const selectedIds = selectedShapeIds || [];
    const unselectedIds = allShapes
      .filter(s => !selectedIds.includes(s.id))
      .map(s => s.id);
    console.log("Invert selection, new selected IDs:", unselectedIds);
    dispatch(updateSelection(unselectedIds));
  };
  const handleResizePageToSelection = () => {
    if (!selectedShapeIds || selectedShapeIds.length === 0) {
      alert("Select one or more shapes first.");
      return;
    }

    const allShapes = layers.flatMap(layer => layer.shapes);
    const selectedShapes = allShapes.filter(s => selectedShapeIds.includes(s.id));

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedShapes.forEach(shape => {
      let x = shape.x || 0, y = shape.y || 0, w = shape.width || 0, h = shape.height || 0;
      if (shape.type === "Circle") {
        x -= shape.radius;
        y -= shape.radius;
        w = h = shape.radius * 2;
      }
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });

    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
      alert("Could not calculate bounding box.");
      return;
    }

    const bboxCenterX = minX + (maxX - minX) / 2;
    const bboxCenterY = minY + (maxY - minY) / 2;

    const newWidth = maxX - minX;
    const newHeight = maxY - minY;

    const offsetX = (minX + newWidth / 2) - bboxCenterX;
    const offsetY = (minY + newHeight / 2) - bboxCenterY;

    dispatch({
      type: "tool/setPageSizeAndPosition",
      payload: {
        x: minX,
        y: minY,
        width: newWidth,
        height: newHeight
      }
    });

    selectedShapes.forEach(shape => {
      dispatch({
        type: "tool/updateShapePosition",
        payload: {
          id: shape.id,
          x: (shape.x || 0) + offsetX,
          y: (shape.y || 0) + offsetY
        }
      });
    });
  };
  const page = useSelector(state => state.tool.page);
  // const pageMargin = useSelector(state => state.tool.pageMargin || { left: 0, top: 0, right: 0, bottom: 0 });
  const handleCreateGuidesAroundPage = () => {
    const width = page?.width || 800;
    const height = page?.height || 600;
    const x = page?.x || 0;
    const y = page?.y || 0;

    const guides = [
      { orientation: "vertical", position: x + pageMargin.left },
      { orientation: "vertical", position: x + width - pageMargin.right },
      { orientation: "horizontal", position: y + pageMargin.top },
      { orientation: "horizontal", position: y + height - pageMargin.bottom }
    ];

    window.dispatchEvent(new CustomEvent("addGuides", { detail: guides }));

    alert("Guides created around the page!");
  };
  const [showXmlEditor, setShowXmlEditor] = useState(false);
  const [xmlContent, setXmlContent] = useState("");

  function generateSVGXML(layers, width, height) {
    const shapesXml = layers.flatMap(layer =>
      layer.shapes.map(shape => shapeToSVGElement(shape))
    ).join("\n");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
${shapesXml}
</svg>`;
  }

  const handleOpenXmlEditor = () => {
    const width = page?.width || 800;
    const height = page?.height || 600;
    setXmlContent(generateSVGXML(layers, width, height));
    setShowXmlEditor(true);
  };

  const handleCloneOriginalPathLPE = () => {
    if (!selectedShapeId) {
      alert("Select a shape to clone.");
      return;
    }
    const allShapes = layers.flatMap(layer => layer.shapes);
    const original = allShapes.find(s => s.id === selectedShapeId);
    if (!original) {
      alert("Original shape not found.");
      return;
    }

    const clone = {
      id: `clone-lpe-${Date.now()}`,
      type: "Clone",
      cloneOf: original.id,
      x: (original.x || 0) + 40,
      y: (original.y || 0) + 40,
      width: original.width,
      height: original.height,
      radius: original.radius,
      lpeEffect: "CloneOriginalPath",
      name: (original.name || original.type || "Shape") + " (clone LPE)",
      isClone: true,
    };

    dispatch({
      type: "tool/addShape",
      payload: clone,
    });

    dispatch({
      type: "tool/updateSelection",
      payload: [clone.id],
    });
  };
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);

  const handleOpenRecent = () => {
    const recent = JSON.parse(localStorage.getItem("recentFiles") || "[]");
    setRecentFiles(recent);
    setShowRecentModal(true);
  };

  const handleOpenRecentFile = (file) => {
    try {
      const data = JSON.parse(file.content);
      dispatch(loadDocument(data));
      setShowRecentModal(false);
      alert(`Loaded file: ${file.name}`);
    } catch (err) {
      alert("Failed to load file: " + file.name);
      setShowRecentModal(false);
    }
  };
  const [showImportWebImageModal, setShowImportWebImageModal] = useState(false);
  const [webImageUrl, setWebImageUrl] = useState("");
  const [showDocumentResourcesModal, setShowDocumentResourcesModal] = useState(false);
  const availableColorProfiles = useSelector(state => state.tool.availableColorProfiles);
  const externalScripts = useSelector(state => state.tool.externalScripts);
  const embeddedScripts = useSelector(state => state.tool.embeddedScripts);
  const showPageGrid = useSelector(state => state.tool.showPageGrid);
  const handlePageGridToggle = () => {
    console.log("Page Grid toggled");
    dispatch(togglePageGrid());
  };
  const EditOptions = [
    { id: 1, label: "Undo...", onClick: () => dispatch(undo()) },
    { id: 2, label: "Redo...", onClick: () => dispatch(redo()) },
    {
      id: 3,
      label: "Undo History...",
      onClick: () => {
        setIsSidebarOpen(true);
        setActiveTab("undo-history");
      },
    },
    { id: 4, label: "Cut...", onClick: handleCut },
    { id: 5, label: "Copy...", onClick: handleCopy },
    { id: 6, label: "Paste", onClick: handlePaste },
    {
      id: 7,
      label: "Paste...",
      subMenu: [
        { id: 71, label: "In Place", onClick: handlePaste },
        { id: 72, label: "On Page", onClick: handlePaste },
        { id: 73, label: "Style", onClick: handlePasteStyle },
        { id: 74, label: "Size", onClick: handlePasteSize },
        { id: 75, label: "Width", onClick: handlePasteWidth },
        { id: 76, label: "Height", onClick: handlePasteHeight },
        { id: 77, label: "Size Separately", onClick: handlePasteSizeSeparately },
        { id: 78, label: "Width Separately", onClick: handlePasteWidthSeparately },
        { id: 79, label: "Height Separately", onClick: handlePasteHeightSeparately },
      ],
    },
    { id: 8, label: "Find/Replace ....", onClick: () => setShowFindReplaceModal(true) },
    { id: 9, label: "Duplicate...", onClick: handleDuplicateShape },
    {
      id: 10,
      label: "Clone",
      subMenu: [
        { id: 101, label: "Create Clone", onClick: handleClone },
        { id: 102, label: "Create Tiled Clones" },
        { id: 103, label: "Unlink Clone", onClick: handleUnlinkClone },
        { id: 104, label: "Unlink Clones Recursively", onClick: handleUnlinkcloneRecursively },
        { id: 105, label: "Relink to Copied", onClick: handleRelinkCopy },
        { id: 106, label: "Select Original", onClick: handleselectorginal },
        { id: 107, label: "Clone Original" },
        { id: 108, label: "Clone original path LPE", onClick: handleCloneOriginalPathLPE },
      ],
    },
    { id: 11, label: "Make a Bitmap Copy", onClick: handleMakeBitmapCopy },
    { id: 12, label: " Select All...", onClick: handleSelectAll },
    { id: 13, label: "Select All in All Layers", onClick: () => dispatch(selectAllShapesInAllLayers()) },
    {
      id: 14,
      label: "Select Same",
      subMenu: [
        { id: 141, label: "Fill and Stroke", onClick: handleSelectSameFillAndStroke },
        { id: 142, label: "Fill Color", onClick: handleSelectSameFillColor },
        { id: 143, label: "Stroke Color", onClick: handleSelectSameStrokeColor },
        { id: 144, label: "Stroke Style", onClick: handleSelectSameStrokeStyle },
        { id: 145, label: "Object Type", onClick: handleSelectSameObjectType },
      ],
    },
    { id: 15, label: "Invert Selection", onClick: handleInvertSelection },
    { id: 16, label: "Deselect... ", onClick: handleDeselectAll },
    { id: 17, label: "Resize Page to selection", onClick: handleResizePageToSelection },
    { id: 18, label: "Create guide around the current page", onClick: handleCreateGuidesAroundPage },
    { id: 19, label: "Lock all guides" },
    { id: 20, label: "Delete all guides" },
    { id: 21, label: "XML Editor", onClick: handleOpenXmlEditor },
  ];

  const ViewOptions = [
    {
      id: 1,
      label: "Zoom",
      icon: <MdOutlineArrowRight style={{ fontSize: "25px" }} />,
      subItems: [
        { label: "Zoom In", onClick: onZoomIn },
        { label: "Zoom Out", onClick: onZoomOut },
        { label: "Zoom to 1:1", onClick: () => onSetZoom(1.1) },
        { label: "Zoom to 1:2", onClick: () => onSetZoom(1.2) },
        { label: "Zoom to 2:1", onClick: () => onSetZoom(2.1) },
        { label: "Zoom Selection", onClick: onZoomSelected },
        { label: "Zoom Drawing", onClick: onZoomDrawing },
        { label: "Zoom Page", onclick: onZoomPage },
        { label: "Zoom Page Width", onclick: onZoomPageWidth },
        { label: "Center Page", onclick: onZoomCenterPage },
        { label: "Zoom Previous", onClick: onZoomPrevious },
        { label: "Zoom Next", onclick: onZoomNext },
      ],
    },
    {
      id: 2,
      label: "Orientation",
      icon: <MdOutlineArrowRight style={{ fontSize: "25px" }} />,
      subItems: [
        { label: "Rotate Clockwise", onClick: handleRotateClockwise },
        {
          label: "Rotate Anti-Clockwise",
          onClick: handleRotateCounterClockwise,
        },
        { label: "Reset Rotation", onClick: handleResetRotation },
        { label: "Lock Rotation", onClick: handleLockRotation },
        { label: "Flip Vertically", onClick: handleFlipVertical },
        { label: "Flip Horizontally", onClick: handleFlipHorizontal },
        { label: "Reset Flipping", onClick: handleResetFlip },
      ],
    },
    {
      id: 3,
      label: "Display Mode",
      icon: <MdOutlineArrowRight style={{ fontSize: "25px" }} />,
      subItems: [
        {
          type: "radio",
          id: "Normal",
          name: "DisplayMode",
          value: "Normal",
          label: "Normal",
          onClick: () => dispatch(Normal())
        },
        {
          type: "radio",
          id: "Outline",
          name: "DisplayMode",
          value: "Outline",
          label: "Outline",
          onClick: () => dispatch(Outline())


        },
        {
          type: "radio",
          id: "OutlineOverlay",
          name: "DisplayMode",
          value: "OutlineOverlay",
          label: "Outline Overlay",
          onClick: () => dispatch(OutlineOverlay())
        },
        {
          type: "radio",
          id: "EnhanceThinLines",
          name: "DisplayMode",
          value: "EnhanceThinLines",
          label: "Enhance Thin Lines",
          onClick: () => dispatch(Normal())
        },
        {
          type: "radio",
          id: "NoFilters",
          name: "DisplayMode",
          value: "NoFilters",
          label: "No Filters",
          onClick: () => dispatch(Normal())
        },
        { type: "separator" },
        { label: "Cycle" },
        { label: "Toggle" },
      ],
    },
    {
      id: 4,
      label: "Split Mode",
      icon: <MdOutlineArrowRight style={{ fontSize: "25px" }} />,
      subItems: [
        {
          type: "radio",
          id: "None",
          name: "SplitMode",
          value: "None",
          label: "None",
        },
        {
          type: "radio",
          id: "Split",
          name: "SplitMode",
          value: "Split",
          label: "Split",
        },
        {
          type: "radio",
          id: "XRay",
          name: "SplitMode",
          value: "XRay",
          label: "X-Ray",
        },
      ],
    },
    {
      id: 5,
      type: "separator",
    },
    {
      id: 6,
      type: "checkbox",
      inputId: "GrayScale",
      name: "GrayScale",
      value: "GrayScale",
      label: "Gray Scale",
      onChange: handleGrayscaleToggle

    },
    {
      id: 7,
      type: "checkbox",
      id: "ColorManagement",
      name: "ColorManagement",
      value: "ColorManagement",
      label: "Color Management",
      checked: colorManagementEnabled,
      onChange: handleColorManagementToggle,
    },
    {
      id: 8,
      type: "checkbox",
      id: "PageGrid",
      name: "PageGrid",
      value: "PageGrid",
      label: "Page Grid",
      checked: showPageGrid,
      onChange: handlePageGridToggle,
    },
    {
      id: 9,
      type: "checkbox",
      id: "Guides",
      name: "Guides",
      value: "Guides",
      label: "Guides",
    },
    {
      id: 10,
      type: "separator",
    },
    {
      id: 11,
      label: "Show/ Hide",
      icon: <MdOutlineArrowRight style={{ fontSize: "25px" }} />,
      subItems: [
        {
          type: "checkbox",
          id: "CommandsBar",
          name: "CommandsBar",
          value: "CommandsBar",
          label: "Commands Bar",
        },
        {
          type: "checkbox",
          id: "Toolbox",
          name: "Toolbox",
          value: "Toolbox",
          label: "Toolbox",
        },
        {
          type: "checkbox",
          id: "Rulers",
          name: "Rulers",
          value: "Rulers",
          label: "Rulers",
        },
        {
          type: "checkbox",
          id: "Scrollbars",
          name: "Scrollbars",
          value: "Scrollbars",
          label: "Scrollbars",
        },
        {
          type: "checkbox",
          id: "Palette",
          name: "Palette",
          value: "Palette",
          label: "Palette",
        },
        {
          type: "checkbox",
          id: "Statusbar",
          name: "Statusbar",
          value: "Statusbar",
          label: "Statusbar",
        },
      ],
    },
    {
      id: 12,
      label: "Show/Hide Dialogs",
    },
    {
      id: 13,
      label: "Command Palette",
      onClick: () => setShowCommandPalette(true),
    },
    {
      id: 14,
      type: "separator",
    },
    {
      id: 15,
      label: "Swatches",
      onClick: () => setShowSwatchesModal(true),
    },
    {
      id: 16,
      label: "Messages",
      onClick: () => setShowMessagesModal(true),
    },
    {
      id: 17,
      label: "Previous Window",
      onClick: handlePreviousWindow,
    },
    {
      id: 18,
      label: "Next Window",
      onClick: handleNextWindow,
    },
    {
      id: 19,
      type: "separator",
    },
    {
      id: 20,
      label: "Icon Preview",
      onClick: () => {
        console.log("Icon Preview clicked");
        setShowIconPreview(true);
      },
    },
    {
      id: 21,
      label: "Duplicate Window",
      onClick: () => {
        const state = {
          layers,
          selectedLayerIndex,
          selectedTool,
          strokeColor,
          fillColor,
        };
        const stateString = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
        window.open(`${window.location.pathname}?duplicate=${stateString}`, "_blank");
      },
    },
    {
      id: 22,
      type: "separator",
    },
    {
      id: 23,
      type: "checkbox",
      id: "WideScreen",
      name: "WideScreen",
      value: "WideScreen",
      label: "Wide Screen",
    },
  ];

  const LayerOptions = [
    {
      id: 1,
      label: "Layers and Objects",
      onClick: () => {
        setIsSidebarOpen(true);
        setActiveTab("layers");
      },
    },
    { id: 2, type: "divider" },
    { id: 3, label: "Add Layer", onClick: handleAddLayer },
    { id: 4, label: "Rename Layer", onClick: handleRenameLayer },
    { id: 5, type: "divider" },
    {
      id: 6,
      label: "Show/Hide Current Layer",
      onClick: handleToggleLayerVisibility,
    },
    { id: 7, label: "Lock/Unlock Current Layer", onClick: handleToggleLayerLock },
    { id: 8, type: "divider" },
    { id: 9, label: "Switch to Layer Above", onClick: moveLayerUpHandler },
    { id: 10, label: "Switch to Layer Below", onClick: moveLayerDownHandler },
    { id: 11, type: "divider" },
    { id: 12, label: "Move Selection to Layer Above", onClick: handleMoveSelectionToLayerAbove },
    { id: 13, label: "Move Selection to Layer Below", onClick: handleMoveSelectionToLayerBelow },
    { id: 14, label: "Move Selection to Layer", onClick: handleMoveSelectionToLayer },
    { id: 15, type: "divider" },
    { id: 16, label: "Layer to Top", onClick: handleLayerToTop },
    { id: 17, label: "Raise Layer", onClick: handleRaiseLayer },
    { id: 18, label: "Lower Layer", onClick: handleLowerLayer },
    { id: 19, label: "Layer to Bottom", onClick: handleLayerToBottom },
    { id: 20, type: "divider" },
    { id: 21, label: "Duplicate Current Layer", onClick: handleDuplicateLayer },
    { id: 22, label: "Delete Current Layer", onClick: handleDelete },
  ];

  const ObjectOptions = [
    {
      label: "Layers and Objects",
      onClick: () => {
        setIsSidebarOpen(true);
        setActiveTab("layers");
      },
    },
    { label: "Fill and Stroke", onClick: handleOpenFillStrokeDialog },
    { label: "Object Properties", onClick: handleOpenObjectProperties },
    { label: "Symbols", onClick: handleOpenSymbolsDialog, },
    { label: "Paint Servers", onClick: handleOpenPaintServers },
    { label: "Selectors and CSS", onClick: handleOpenSelectors },
    "divider",
    { label: "Group", onClick: handleGroupShapes },
    { label: "UnGroup", onClick: handleUngroupShapes },
    { label: "Pop Selected objects out of groups", onClick: handlePopShapesOutOfGroups },
    {
      label: "Clip",
      subMenu: [
        { label: "Set Clip", onClick: handleSetClip },
        { label: "Set Inverse Clip (LPE)", onClick: handleSetInverseClip },
        { label: "Release Clip", onClick: handleReleaseClip },
      ],
    },
    {
      label: "Mask",
      subMenu: [
        { label: "Set Mask", onClick: handleSetMask },
        { label: "Set Inverse Mask (LPE)", onClick: handleSetInverseMask },
        { label: "Release Mask", onClick: handleReleaseMask },
      ],
    },
    {
      label: "Pattern",
      subMenu: [
        {
          label: "Objects to Pattern",
          onClick: () => {
            const selectedShapes = shapes.filter(s => selectedShapeIds.includes(s.id));
            if (!selectedShapes.length) {
              alert("Select one or more shapes to convert to a pattern.");
              return;
            }

            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            selectedShapes.forEach(s => {
              const x = s.x || 0, y = s.y || 0;
              let w = s.width || (s.radius ? s.radius * 2 : 0);
              let h = s.height || (s.radius ? s.radius * 2 : 0);
              if (s.radius !== undefined) {
                minX = Math.min(minX, x - s.radius);
                minY = Math.min(minY, y - s.radius);
                maxX = Math.max(maxX, x + s.radius);
                maxY = Math.max(maxY, y + s.radius);
              } else {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x + w);
                maxY = Math.max(maxY, y + h);
              }
            });
            const tileWidth = maxX - minX;
            const tileHeight = maxY - minY;

            function shapeToSvg(s) {
              if (s.type === "Rectangle") {
                return `<rect x="${s.x - minX}" y="${s.y - minY}" width="${s.width}" height="${s.height}" fill="${s.fill || "black"}" stroke="${s.stroke || "none"}" stroke-width="${s.strokeWidth || 0}" />`;
              }
              if (s.type === "Circle") {
                return `<circle cx="${s.x - minX}" cy="${s.y - minY}" r="${s.radius}" fill="${s.fill || "black"}" stroke="${s.stroke || "none"}" stroke-width="${s.strokeWidth || 0}" />`;
              }
              if (s.type === "Polygon" && Array.isArray(s.points)) {
                const pts = s.points.map(pt => `${(pt.x ?? pt[0]) + (s.x || 0) - minX},${(pt.y ?? pt[1]) + (s.y || 0) - minY}`).join(" ");
                return `<polygon points="${pts}" fill="${s.fill || "black"}" stroke="${s.stroke || "none"}" stroke-width="${s.strokeWidth || 0}" />`;
              }
              if (s.type === "Star") {
                const num = (s.corners || 5) * 2;
                const pts = Array.from({ length: num }).map((_, i) => {
                  const angle = (Math.PI * 2 * i) / num - Math.PI / 2;
                  const r = i % 2 === 0 ? s.outerRadius : s.innerRadius;
                  return [
                    (s.x + r * Math.cos(angle)) - minX,
                    (s.y + r * Math.sin(angle)) - minY
                  ].join(",");
                }).join(" ");
                return `<polygon points="${pts}" fill="${s.fill || "black"}" stroke="${s.stroke || "none"}" stroke-width="${s.strokeWidth || 0}" />`;
              }
              return "";
            }
            const svgContent = selectedShapes.map(shapeToSvg).join("\n");
            const patternSvg = `<svg width="${tileWidth}" height="${tileHeight}" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
            setCustomPaintServers(prev => [
              ...prev,
              {
                name: `Pattern ${prev.length + 1}`,
                svg: patternSvg
              }
            ]);
            alert("Pattern created! Now available in Paint Servers.");
          }
        },
        {
          label: "Pattern to Objects",
          onClick: () => {
            const shape = shapes.find(
              s => selectedShapeIds.includes(s.id) &&
                s.fill && s.fill.type === "pattern" && s.fill.svg
            );
            if (!shape) {
              alert("Select a shape with a pattern fill.");
              return;
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(shape.fill.svg, "image/svg+xml");
            const svgElem = doc.querySelector("svg");
            let w = 32, h = 32;
            if (svgElem) {
              w = parseFloat(svgElem.getAttribute("width")) || w;
              h = parseFloat(svgElem.getAttribute("height")) || h;
            }

            dispatch({
              type: "tool/addShape",
              payload: {
                id: `pattern-object-${Date.now()}`,
                type: "SVG",
                svg: shape.fill.svg,
                x: shape.x || 0,
                y: shape.y || 0,
                width: w,
                height: h,
                name: "Pattern Object",
                draggable: true,
                selected: false,
              }
            });
            alert("Pattern tile placed as object.");
          }
        }
      ],
    },
    "divider",
    { label: "Objects to Marker", onClick: handleObjectsToMarker },
    { label: "Objects to Guide", onClick: handleObjectsToGuide },
    "divider",
    { label: "Raise to top", onClick: handleRaiseToTop },
    { label: "Raise", onClick: handleRaise },
    { label: "Lower", onClick: handleLower },
    { label: "Lower to bottom", onClick: handleLowerToBottom },
    "divider",
    { label: "Rotate 90 CW", onClick: handleRotateClockwise },
    { label: "Rotate 90 ACW", onClick: handleRotateCounterClockwise },
    { label: "Flip Horizontal", onClick: handleFlipHorizontal },
    { label: "Flip Vertical", onClick: handleFlipVertical },
    "divider",
    { label: "Unhide All", onClick: handleUnhideAll },
    { label: "Unlock All", onClick: handleUnlockAll },
    "divider",
    { label: "Transform", onClick: () => setShowTransformModal(true) },
    { label: "Align & Distribute", onClick: () => setIsAlignPanelOpen(true) },
  ];

  const PathOptions = [
    { label: "Object to Path", onClick: () => dispatch(objectToPath()) },
    { label: "Stroke to Path", onClick: () => dispatch(strokePath()) },
    { label: "Trace Bitemap...", onClick: handleTraceBitmap },
    "divider",
    { label: "Union", onClick: () => dispatch(handleUnion()) },
    { label: "Difference", onClick: () => dispatch(difference()) },
    { label: "intersection", onClick: () => dispatch(intersection()) },
    { label: "Exclusion", onClick: () => dispatch(exclusion()) },
    { label: "Division", onClick: () => dispatch(division()) },
    { label: "Cut Path", onClick: () => dispatch(cutPath()) },
    "divider",
    { label: "Combine", onClick: () => dispatch(combine()) },
    { label: "Break Apart", onClick: () => dispatch(breakApart()) },
    { label: "Split Path", onClick: () => dispatch(splitPath()) },
    { label: "Fracture", onClick: () => dispatch(fracture()) },
    { label: "Flatten", onClick: () => dispatch(flatten()) },
    "divider",
    { label: "inset", onClick: () => dispatch(inset()) },
    { label: "Outset", onClick: () => dispatch(outset()) },
    {
      label: "Dynamic Offset",
      onClick: () => {
        dispatch(setDynamicOffsetMode(!dynamicOffsetMode));
        if (!dynamicOffsetMode && selectedShapeId) {
          dispatch(setDynamicOffsetShapeId(selectedShapeId));
        }
      }
    },
    {
      label: "Linked Offset", onClick: () => {
        if (selectedShapeId) {
          dispatch(createLinkedOffset({ sourceId: selectedShapeId, offsetAmount: 20 }));
        } else {
          alert("Select a shape first.");
        }
      }
    },
    "divider",
    { label: "Fill Between Paths", onClick: () => dispatch(fillBetweenPaths()) },
    "divider",
    { label: "Simplify", onClick: () => dispatch(simplify()) },
    { label: "Reverse", onClick: () => dispatch(reverse()) },
    { label: "Path Effects...", onClick: handlePathEffects },
    { label: "Paste Path Effect" },
    {
      label: "Remove Path Effect", onClick: () => {
        if (!selectedShapeId) {
          alert("Select a shape first.");
          return;
        }
        dispatch(updateShapePosition({
          id: selectedShapeId,
          lpeEffect: null,
          envelopeTop: undefined,
          envelopeBottom: undefined,
          envelopeLeft: undefined,
          envelopeRight: undefined,
          latticePoints: undefined,
          latticeRows: undefined,
          latticeCols: undefined,
        }));
      }
    },
  ];
  const handlePutOnPath = () => {
    const selectedShapes = shapes.filter(s => s.selected || selectedShapeIds?.includes(s.id));
    const textShape = selectedShapes.find(s => s.type === "Text");
    let pathShape = selectedShapes.find(s => s.type === "Path" || s.path);


    if (!pathShape) {
      const rect = selectedShapes.find(s => s.type === "Rectangle");
      if (rect) {
        dispatch(objectToPath({ id: rect.id }));
        alert("Converted rectangle to path. Please try 'Put on path' again.");
        return;
      }
    }

    if (!textShape || !pathShape) {
      alert("Select both a text object and a path object.");
      return;
    }

    dispatch(updateShapePosition({
      id: textShape.id,
      putOnPathId: pathShape.id,
      baselineOffset: 0,
    }));

    alert("Text is now put on path. (Rendering must support text-on-path)");
  };
  const handleRemoveFromPath = () => {
    const selectedShapes = shapes.filter(s => s.selected || selectedShapeIds?.includes(s.id));
    const textShape = selectedShapes.find(s => s.type === "Text" && s.putOnPathId);

    if (!textShape) {
      alert("Select a text object that is on a path.");
      return;
    }

    dispatch(updateShapePosition({
      id: textShape.id,
      putOnPathId: null,
      baselineOffset: 0,
    }));

    alert("Text is now removed from path.");
  };
  const handleFlowIntoFrame = () => {
    const selectedShapes = shapes.filter(s => s.selected || selectedShapeIds?.includes(s.id));
    const textShape = selectedShapes.find(s => s.type === "Text");
    const frameShape = selectedShapes.find(s =>
      (s.type === "Rectangle" || s.type === "Polygon" || s.type === "Path")
    );
    if (!textShape || !frameShape) {
      alert("Select both a text object and a frame shape (rectangle, polygon, or closed path).");
      return;
    }
    dispatch({ type: "tool/setTextFlowFrame", payload: { textId: textShape.id, frameId: frameShape.id } });
    alert("Text is now flowed into frame. (Rendering must support text-in-frame)");
  };

  const handleUnflowFromFrame = () => {
    const selectedShapes = shapes.filter(s => s.selected || selectedShapeIds?.includes(s.id));
    const textShape = selectedShapes.find(s => s.type === "Text" && s.flowIntoFrameId);
    if (!textShape) {
      alert("Select a text object that is flowed into a frame.");
      return;
    }
    dispatch({ type: "tool/removeTextFlowFrame", payload: { textId: textShape.id } });
    alert("Text is now removed from frame.");
  };
  const handleTextToGlyphs = async () => {
    for (const id of selectedShapeIds) {
      const shape = shapes.find(s => s.id === id);
      if (shape && shape.type === "Text") {
        await textToGlyphsHandler(dispatch, shape, selectedLayerIndex);
      }
    }
  };
  const TextOptions = [
    { label: "Text and font", onClick: () => setShowFontPanel(true) },
    { label: "SVG Font Editor", onClick: () => setShowSvgFontEditor(true) },
    { label: "Unicode characters", onClick: () => setShowUnicodePanel(true) },
    "divider",
    { label: "Put on path", onClick: handlePutOnPath },
    { label: "Remove from path", onClick: handleRemoveFromPath },
    "divider",
    { label: "Flow into frame", onClick: handleFlowIntoFrame },
    { label: "Set subractions frame", onClick: () => dispatch(setSubtractionsFrame()) },
    { label: "Unflow", onClick: handleUnflowFromFrame },
    { label: "Convert to Text", onClick: () => dispatch(convertToText()) },
    "divider",
    { label: "Remove manual kerns", onClick: () => dispatch(removeManualKerns()) },
    { label: "Text to glyphs", onClick: handleTextToGlyphs },
    "divider",
    { label: "Check Spelling", link: "#" },
  ];

  const FilterOptions = [
    {
      label: "Bevel",
      subMenu: [
        {
          label: "Bloom",
          onClick: () => {
            if (selectedShapeId) {
              dispatch({
                type: "tool/applyBloomFilter",
                payload: {
                  shapeId: selectedShapeId,
                  radius: 16,
                  brightness: 1.5,
                }
              });
            } else {
              alert("Select a shape first.");
            }
          }
        },
        { label: "Bright Metal" },
        { label: "Button" },
      ],
    },
  ];

  const HelpOptions = [
    { label: "Cad Manual", link: "#" },
    { label: "Tutorial", link: "#" },
    { label: "Learn More", link: "#" },
    { label: "New in this Version", link: "#" },
    { label: "About Cad", link: "#" },
  ];

  let fontPanelModal = null;
  if (showFontPanel) {
    fontPanelModal = (
      <div
        style={{
          position: "fixed",
          top: 100,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: 8,
          zIndex: 9999,
          padding: 24,
          minWidth: 340,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
        }}
      >
        <h4 style={{ marginBottom: 16 }}>Text and Font</h4>
        <FontPanel
          selectedShape={selectedShape}
          selectedShapeId={selectedShapeId}
          onClose={() => setShowFontPanel(false)}
        />
      </div>
    );
  }

  let svgFontEditorModal = null;
  if (showSvgFontEditor) {
    svgFontEditorModal = (
      <div
        style={{
          position: "fixed",
          top: 120,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: 8,
          zIndex: 10000,
          padding: 24,
          minWidth: 480,
          minHeight: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
        }}
      >
        <h4 style={{ marginBottom: 16 }}>SVG Font Editor</h4>
        <SvgFontEditor onClose={() => setShowSvgFontEditor(false)} />
      </div>
    );
  }

  let unicodePanelModal = null;
  if (showUnicodePanel) {
    unicodePanelModal = (
      <div
        style={{
          position: "fixed",
          top: 140,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: 8,
          zIndex: 10000,
          padding: 24,
          minWidth: 540,
          minHeight: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
        }}
      >
        <h4 style={{ marginBottom: 16 }}>Unicode Characters</h4>
        <UnicodePanel onClose={() => setShowUnicodePanel(false)} />
      </div>
    );
  }

  const insertSymbolToCanvas = (svgString) => {
    dispatch({
      type: "tool/addShape",
      payload: {
        id: `svg-symbol-${Date.now()}`,
        type: "SVG",
        svg: svgString,
        x: 100,
        y: 100,
        width: 64,
        height: 64,
        name: "Symbol",
        draggable: true,
        selected: false,
      }
    });
    setShowSymbolsModal(false);
  };


  const COMMANDS = [
    { label: "Undo", action: () => dispatch(undo()) },
    { label: "Redo", action: () => dispatch(redo()) },
    { label: "Cut", action: () => dispatch(cut()) },
    { label: "Copy", action: () => dispatch(copy()) },
    { label: "Paste", action: () => dispatch(paste()) },
    { label: "Select All", action: () => dispatch(selecteAllShapes()) },
    { label: "Deselect All", action: () => dispatch(deselectAllShapes()) },
    { label: "Zoom In", action: handleZoomIn },
    { label: "Zoom Out", action: handleZoomOut },
    { label: "Duplicate Shape", action: handleDuplicateShape },
    { label: "Delete Shape", action: handleDelete },
    { label: "Raise to Top", action: handleRaiseToTop },
    { label: "Lower to Bottom", action: handleLowerToBottom },
  ];
  return (
    <>
      {fontPanelModal}
      {svgFontEditorModal}
      {unicodePanelModal}
      <div>
        <nav className="navbar navbar-expand-lg" style={{ padding: '0', fontSize: '15px' }}>
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="collapse navbar-collapse">
                  <ul className="navbar-nav" style={{ cursor: "pointer" }}>

                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        File
                      </a>
                      <ul className="dropdown-menu">
                        <li>
                          <a
                            className="dropdown-item"
                            onClick={() => window.open(window.location.pathname, "_blank")}
                          >
                            New...
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item">New From Template</a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item"
                            onClick={handleUploadClick}
                          >
                            Open...
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" onClick={handleOpenRecent}>
                            Open Recent
                          </a>
                        </li>
                        <hr style={{ margin: "0px" }} />
                        <li>
                          <a className="dropdown-item">Revert</a>
                        </li>

                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          onChange={haleUploadFile}
                          multiple
                        />
                        <li>
                          <a className="dropdown-item" onClick={handleSaveClick}>
                            Save...
                          </a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item"
                            onClick={handleSaveAsClick}
                          >
                            Save As...
                          </a>
                        </li>
                        <hr style={{ margin: "0px" }} />
                        <li>
                          <a
                            className="dropdown-item"
                            onClick={handleImportClick}
                          >
                            Import...
                          </a>
                        </li>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                          multiple
                        />
                        <li>
                          <a className="dropdown-item" onClick={() => setShowImportWebImageModal(true)}>
                            Import Web Image...
                          </a>
                        </li>
                        <li className="paste-dropdown">
                          <div className="icon-div">
                            <a className="dropdown-item">Export</a>
                            <MdOutlineArrowRight style={{ fontSize: "25px" }} />
                          </div>
                          <ul className="paste-dropdown-item">
                            <li>
                              <a
                                className="dropdown-item"
                                onClick={() => handleSave("png")}
                              >
                                Export as PNG
                              </a>
                            </li>
                            <li>
                              <a
                                className="dropdown-item"
                                onClick={() => handleSave("jpg")}
                              >
                                Export as JPG
                              </a>
                            </li>
                            <li>
                              <a
                                className="dropdown-item"
                                onClick={() => handleSave("svg")}
                              >
                                Export as SVG
                              </a>
                            </li>
                            <li>
                              <a
                                className="dropdown-item"
                                onClick={() => handleSave("pdf")}
                              >
                                Export as PDF
                              </a>
                            </li>
                            <li>
                              <a
                                className="dropdown-item"
                                onClick={() => handleSave("webp")}
                              >
                                Export as WEBP
                              </a>
                            </li>
                            <li>
                              <a
                                className="dropdown-item"
                                onClick={() => handleSave("eps")}
                              >
                                Export as EPS
                              </a>
                            </li>
                            <li>
                              <a
                                className="dropdown-item"
                                onClick={() => handleSave("avif")}
                              >
                                Export as AVIF
                              </a>
                            </li>
                          </ul>
                        </li>
                        <hr style={{ margin: "0px" }} />
                        <li>
                          <a
                            className="dropdown-item"
                            onClick={handleDownloadPdf}
                          >
                            Print...
                          </a>
                        </li>
                        <hr style={{ margin: "0px" }} />
                        <li>
                          <a className="dropdown-item" onClick={handleCleanUp}>
                            Clean Up Document
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" onClick={() => setShowDocumentResourcesModal(true)}>
                            Document Resources
                          </a>
                        </li>
                        <hr style={{ margin: "0px" }} />
                        <li>
                          <a className="dropdown-item" onClick={() => setIsDocPropsOpen(true)}>
                            Document Properties
                          </a>
                        </li>
                        <hr style={{ margin: "0px" }} />
                        <li>
                          <a className="dropdown-item" onClick={handleCloseWindow}>
                            Close...
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" onClick={handleQuit}>
                            Quit...
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Edit
                      </a>
                      <ul className="dropdown-menu" style={{ cursor: "pointer" }}>
                        {EditOptions.map((item) => (
                          <li
                            key={item.id}
                            className={item.subMenu ? "paste-dropdown" : ""}
                          >
                            <div className="icon-div">
                              <a className="dropdown-item" onClick={item.onClick}>
                                {item.label}
                              </a>
                              {item.subMenu && (
                                <MdOutlineArrowRight
                                  style={{ fontSize: "25px" }}
                                />
                              )}
                            </div>

                            {item.subMenu && (
                              <ul className="paste-dropdown-item">
                                {item.subMenu.map((sub) => (
                                  <li key={sub.id}>
                                    <a
                                      href="#"
                                      onClick={e => {
                                        e.preventDefault();
                                        if (sub.onClick) sub.onClick();
                                      }}
                                    >
                                      {sub.label}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </li>


                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        View
                      </a>
                      <ul className="dropdown-menu" style={{ cursor: "pointer" }}>
                        {ViewOptions.map((item) => {
                          if (item.type === "separator") {
                            return <hr key={item.id} style={{ margin: "0px" }} />;
                          }

                          if (item.type === "checkbox") {
                            return (
                              <li key={item.id} className="paste-dropdown">
                                <div className="d-flex">
                                  <input
                                    type="checkbox"
                                    id={item.id}
                                    name={item.name}
                                    value={item.value}
                                    checked={item.id === "WideScreen" ? wideScreen : undefined}
                                    onChange={e => {
                                      if (item.id === "WideScreen") {
                                        dispatch(setWideScreen(e.target.checked));
                                      }
                                    }}
                                    style={{ marginLeft: "5px" }}
                                  />
                                  <a
                                    className="dropdown-item"
                                    style={{ paddingLeft: "12px" }}
                                  >
                                    <label
                                      htmlFor={item.id}
                                      style={{ fontSize: "13px" }}
                                    >
                                      {item.label}
                                    </label>
                                  </a>
                                </div>
                              </li>
                            );
                          }

                          return (
                            <li key={item.id} className="paste-dropdown">
                              <div className="icon-div">
                                <a
                                  className="dropdown-item"
                                  onClick={item.onClick}
                                >
                                  {item.label}
                                </a>
                                {item.icon}
                              </div>
                              {item.subItems && (
                                <ul className="paste-dropdown-item">
                                  {item.subItems.map((subItem) => {
                                    if (subItem.type === "separator") {
                                      return (
                                        <hr
                                          key={subItem.id}
                                          style={{ margin: "0px" }}
                                        />
                                      );
                                    }

                                    if (subItem.type === "radio") {
                                      return (
                                        <li
                                          key={subItem.id}
                                          style={{ paddingLeft: "20px" }}
                                        >
                                          <input
                                            type="radio"
                                            id={subItem.id}
                                            name={subItem.name}
                                            value={subItem.value}
                                            checked={useSelector(state => state.tool.splitMode) === subItem.value}
                                            onChange={() => {
                                              if (item.label === "Split Mode") {
                                                handleSplitModeChange(subItem.value);
                                              }
                                            }}
                                          />
                                          <label htmlFor={subItem.id}>
                                            {subItem.label}
                                          </label>
                                        </li>
                                      );
                                    }

                                    if (subItem.type === "checkbox") {
                                      return (
                                        <li
                                          key={subItem.id}
                                          style={{ paddingLeft: "20px" }}
                                        >
                                          <input
                                            type="checkbox"
                                            id={subItem.id}
                                            name={subItem.name}
                                            value={subItem.value}
                                            onChange={handleToolControlsBarChange}
                                          />
                                          <label htmlFor={subItem.id}>
                                            {subItem.label}
                                          </label>
                                        </li>
                                      );
                                    }

                                    return (
                                      <li key={subItem.id}>
                                        <a onClick={subItem.onClick}>
                                          {subItem.label}
                                        </a>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </li>

                    <li
                      className="nav-item dropdown"
                      style={{ display: "block" }}
                    >
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Layer
                      </a>
                      <ul className="dropdown-menu" style={{ cursor: "pointer" }}>
                        {LayerOptions.map((item) =>
                          item.type === "divider" ? (
                            <hr key={item.id} style={{ margin: "0px" }} />
                          ) : (
                            <li key={item.id}>
                              {item.href ? (
                                <a href={item.href} className="dropdown-item">
                                  {item.label}
                                </a>
                              ) : (
                                <a
                                  className="dropdown-item"
                                  onClick={item.onClick}
                                >
                                  {item.label}
                                </a>
                              )}
                            </li>
                          )
                        )}
                      </ul>
                      {showMoveLayerModal && (
                        <div
                          style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            background: "rgba(0,0,0,0.3)",
                            zIndex: 9999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                          onClick={() => setShowMoveLayerModal(false)}
                        >
                          <div
                            style={{
                              background: "#fff",
                              padding: 24,
                              borderRadius: 8,
                              minWidth: 320,
                              boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
                            }}
                            onClick={e => e.stopPropagation()}
                          >
                            <h4>Move selection to which layer?</h4>
                            <form
                              onSubmit={e => {
                                e.preventDefault();
                                if (
                                  targetLayerIndex === null ||
                                  targetLayerIndex === selectedLayerIndex
                                ) {
                                  alert("Please select a different layer.");
                                  return;
                                }
                                const shapeToMove = layers[selectedLayerIndex].shapes.find(
                                  s => s.id === selectedShapeId
                                );
                                if (!shapeToMove) return;

                                const newLayers = layers.map((layer, idx) => {
                                  if (idx === selectedLayerIndex) {
                                    return {
                                      ...layer,
                                      shapes: layer.shapes.filter(s => s.id !== selectedShapeId)
                                    };
                                  }
                                  if (idx === targetLayerIndex) {
                                    return {
                                      ...layer,
                                      shapes: [shapeToMove, ...layer.shapes]
                                    };
                                  }
                                  return layer;
                                });

                                dispatch({
                                  type: "tool/setLayersAndSelection",
                                  payload: {
                                    layers: newLayers,
                                    selectedLayerIndex: targetLayerIndex,
                                    selectedShapeId
                                  }
                                });
                                setShowMoveLayerModal(false);
                              }}
                            >
                              <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 16 }}>
                                {layers.map((layer, idx) => (
                                  <div key={idx} style={{ marginBottom: 6 }}>
                                    <label>
                                      <input
                                        type="radio"
                                        name="targetLayer"
                                        value={idx}
                                        checked={targetLayerIndex === idx}
                                        disabled={idx === selectedLayerIndex}
                                        onChange={() => setTargetLayerIndex(idx)}
                                        style={{ marginRight: 8 }}
                                      />
                                      {layer.name || `Layer ${idx + 1}`}
                                      {idx === selectedLayerIndex && (
                                        <span style={{ color: "#888", marginLeft: 8 }}>(current)</span>
                                      )}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                <button
                                  type="button"
                                  onClick={() => setShowMoveLayerModal(false)}
                                  style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  style={{
                                    background: "#007bff",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 4,
                                    padding: "6px 16px"
                                  }}
                                  disabled={
                                    targetLayerIndex === null ||
                                    targetLayerIndex === selectedLayerIndex
                                  }
                                >
                                  Move
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </li>


                    <li
                      className="nav-item dropdown"
                      style={{ display: "block" }}
                    >
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Object
                      </a>
                      <ul className="dropdown-menu" style={{ cursor: "pointer" }}>
                        {ObjectOptions.map((item, index) =>
                          item === "divider" ? (
                            <hr key={index} style={{ margin: "0px" }} />
                          ) : item.subMenu ? (
                            <li key={index} className="paste-dropdown">
                              <div className="icon-div">
                                <a href="#" className="dropdown-item">
                                  {item.label}
                                </a>
                                <MdOutlineArrowRight
                                  style={{ fontSize: "25px" }}
                                />
                              </div>
                              <ul className="paste-dropdown-item">
                                {item.subMenu.map((subItem, subIndex) => (
                                  <li key={subIndex}>
                                    <a
                                      href="#"
                                      onClick={e => {
                                        e.preventDefault();
                                        if (subItem.onClick) subItem.onClick();
                                      }}
                                    >
                                      {subItem.label}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ) : (
                            <li key={index}>
                              <a className="dropdown-item" onClick={item.onClick}>
                                {item.label}
                              </a>
                            </li>
                          )
                        )}
                      </ul>
                    </li>
                    <li
                      className="nav-item dropdown"
                      style={{ display: "block" }}
                    >
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Path
                      </a>
                      <ul className="dropdown-menu" style={{ cursor: "pointer", height: '500px', overflow: 'scroll' }}>
                        {PathOptions.map((item) =>
                          item.type === "divider" ? (
                            <hr key={item.id} style={{ margin: "0px" }} />
                          ) : (
                            <li key={item.id}>
                              {item.href ? (
                                <a href={item.href} className="dropdown-item">
                                  {item.label}
                                </a>
                              ) : (
                                <a
                                  className="dropdown-item"
                                  onClick={item.onClick}
                                >
                                  {item.label}
                                </a>
                              )}
                            </li>
                          )
                        )}
                      </ul>
                    </li>
                    <li
                      className="nav-item dropdown"
                      style={{ display: "block" }}
                    >
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Text
                      </a>
                      <ul className="dropdown-menu" style={{ cursor: "pointer" }}>
                        {TextOptions.map((item) =>
                          item.type === "divider" ? (
                            <hr key={item.id} style={{ margin: "0px" }} />
                          ) : (
                            <li key={item.id}>
                              {item.href ? (
                                <a href={item.href} className="dropdown-item">
                                  {item.label}
                                </a>
                              ) : (
                                <a
                                  className="dropdown-item"
                                  onClick={item.onClick}
                                >
                                  {item.label}
                                </a>
                              )}
                            </li>
                          )
                        )}
                      </ul>
                    </li>
                    <li
                      className="nav-item dropdown"
                      style={{ display: "block" }}
                    >
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Filter
                      </a>
                      <ul className="dropdown-menu" style={{ cursor: "pointer" }}>
                        {FilterOptions.map((item, index) =>
                          item === "divider" ? (
                            <hr key={index} style={{ margin: "0px" }} />
                          ) : item.subMenu ? (
                            <li key={index} className="paste-dropdown">
                              <div className="icon-div">
                                <a href="#" className="dropdown-item">
                                  {item.label}
                                </a>
                                <MdOutlineArrowRight
                                  style={{ fontSize: "25px" }}
                                />
                              </div>
                              <ul className="paste-dropdown-item">
                                {item.subMenu.map((subItem, subIndex) => (
                                  <li key={subIndex}>
                                    <a href="#">{subItem.label}</a>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ) : (
                            <li key={index}>
                              <a className="dropdown-item" onClick={item.onClick}>
                                {item.label}
                              </a>
                            </li>
                          )
                        )}
                      </ul>
                    </li>
                    <li
                      className="nav-item dropdown"
                      style={{ display: "block" }}
                    >
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Help
                      </a>
                      <ul className="dropdown-menu">
                        {HelpOptions.map((item, index) => (
                          <li key={index}>
                            <a className="dropdown-item" href={item.link}>
                              {item.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>

                  </ul>
                </div>
              </div>
            </div>
          </div>
        </nav >
        <div className="container-fluid top-bar">
          <div className="row">
            {isRenaming ? (
              <input
                type="text"
                value={newLayerName}
                onChange={handleLayerNameChange}
                onKeyDown={handleLayerNameSubmit}
                onBlur={() => setIsRenaming(false)}
                placeholder="Enter new layer name"
              />
            ) : selectedTool === "Text" ? (
              <TextEditorTopbar
                textContent={selectedShape.text || ""}
                selectedShapeId={selectedShapeId}
                onTextChange={(newText, id, styles) =>
                  dispatch(updateShapePosition({ id, text: newText, ...styles }))
                }
                onStyleChange={(style) =>
                  dispatch(updateShapePosition({ id: selectedShapeId, ...style }))
                }
                shapes={shapes}
              />
            ) : selectedTool === "Spray" ? (
              <SprayTopbar />
            ) : selectedTool === "Spiral" ? (
              <SpiralTopbar />
            ) : selectedTool === "Bezier" ? (
              <BezierTopbar />
            ) : selectedTool === "Calligraphy" ? (
              <CalligraphyTopbar />
            ) : selectedTool === "Pencil" ? (
              <PencilTopbar />
            ) : selectedTool === "Node" ? (
              <NodeTopbar />
            ) : selectedTool === "Eraser" ? (
              <EraserTopbar />
            ) : selectedTool === "Gradient" ? (
              <GradientTopbar />
            ) : selectedTool === "Dropper" ? (
              <DropperTopbar />
            ) : selectedTool === "Measurement" ? (
              <MeasurementTopbar />
            ) : selectedTool === "Connector" ? (
              <ConnectorTopbar />
            ) : selectedTool === "Mesh" ? (
              <MeshTopbar />
            ) : selectedTool === "PaintBucket" ? (
              <PaintBucketTopbar />
            ) : selectedTool === "Pages" ? (
              <PagesTopbar />
            ) : selectedTool === "Tweak" ? (
              <TweakTopbar />
            ) : selectedTool === "Zoom" ? (
              <ZoomTopbar
                zoomLevel={zoomLevel}
                onZoomIn={onZoomIn}
                onZoomOut={onZoomOut}
                onSetZoom={onSetZoom}
                onZoomSelected={onZoomSelected}
                onZoomDrawing={onZoomDrawing}
                onZoomPage={onZoomPage}
                onZoomPageWidth={onZoomPageWidth}
                onZoomCenterPage={onZoomCenterPage}
                onZoomPrevious={onZoomPrevious}
                onZoomNext={onZoomNext}
              />
            ) : (
              <DefaultTopbar />
            )}
          </div>
        </div>
      </div >
      {showSymbolsModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={handleCloseSymbolsDialog}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 400,
              minHeight: 300,
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4>Symbols</h4>
            {!selectedSymbolSet ? (
              <div>
                <div style={{ marginBottom: 16 }}>Select a symbol set:</div>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {Object.keys(INKSCAPE_SYMBOL_SETS).map(setName => (
                    <li key={setName}>
                      <button
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 12px",
                          marginBottom: 6,
                          border: "1px solid #ccc",
                          borderRadius: 4,
                          background: "#f8f8f8",
                          cursor: "pointer"
                        }}
                        onClick={() => setSelectedSymbolSet(setName)}
                      >
                        {setName}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <button
                  style={{
                    marginBottom: 12,
                    background: "none",
                    border: "none",
                    color: "#007bff",
                    cursor: "pointer"
                  }}
                  onClick={() => setSelectedSymbolSet(null)}
                >
                  ← Back to sets
                </button>
                <h5>{selectedSymbolSet}</h5>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                  {INKSCAPE_SYMBOL_SETS[selectedSymbolSet].map((symbol, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: 60,
                        height: 60,
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#fafafa",
                        cursor: "pointer",
                        overflow: "hidden",
                        padding: 0,
                      }}
                      title={symbol.name}
                      onClick={() => insertSymbolToCanvas(symbol.svg)}
                    >
                      <span
                        style={{
                          width: 48,
                          height: 48,
                          display: "inline-block",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: symbol.svg.replace(
                            /<svg([^>]*)>/,
                            '<svg$1 width="48" height="48" style="display:block;" preserveAspectRatio="xMidYMid meet">'
                          ),
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button onClick={handleCloseSymbolsDialog} style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showPaintServersModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={handleClosePaintServers}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 400,
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4>Paint Servers (Patterns & Hatches)</h4>
            <div style={{ marginBottom: 12 }}>
              <label>
                <input
                  type="radio"
                  name="paintServerTarget"
                  value="fill"
                  checked={paintServerTarget === "fill"}
                  onChange={() => setPaintServerTarget("fill")}
                /> Fill
              </label>
              <label style={{ marginLeft: 16 }}>
                <input
                  type="radio"
                  name="paintServerTarget"
                  value="stroke"
                  checked={paintServerTarget === "stroke"}
                  onChange={() => setPaintServerTarget("stroke")}
                /> Stroke
              </label>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {[...PAINT_SERVERS, ...customPaintServers].map((srv, idx) => (
                <div
                  key={idx}
                  style={{
                    width: 48,
                    height: 48,
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    background: "#fafafa",
                    cursor: "pointer",
                    overflow: "hidden"
                  }}
                  title={srv.name}
                  onClick={() => {
                    if (!selectedShapeId) {
                      alert("Select a shape first.");
                      return;
                    }
                    dispatch(updateShapePosition({
                      id: selectedShapeId,
                      [paintServerTarget]: { type: "pattern", svg: srv.svg }
                    }));
                    setShowPaintServersModal(false);
                  }}
                  dangerouslySetInnerHTML={{ __html: srv.svg }}
                />
              ))}
            </div>
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button onClick={handleClosePaintServers} style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showTransformModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowTransformModal(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 320,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4>Transform (Move)</h4>
            <div style={{ marginBottom: 16 }}>
              <label>
                Horizontal (X):&nbsp;
                <button onClick={() => setMoveX(x => x - 1)}>-</button>
                <input
                  type="number"
                  value={moveX}
                  step={1}
                  onChange={e => setMoveX(Number(e.target.value))}
                  style={{ width: 60, margin: "0 8px" }}
                />
                <button onClick={() => setMoveX(x => x + 1)}>+</button>
              </label>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>
                Vertical (Y):&nbsp;
                <button onClick={() => setMoveY(y => y - 1)}>-</button>
                <input
                  type="number"
                  value={moveY}
                  step={1}
                  onChange={e => setMoveY(Number(e.target.value))}
                  style={{ width: 60, margin: "0 8px" }}
                />
                <button onClick={() => setMoveY(y => y + 1)}>+</button>
              </label>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowTransformModal(false)}
                style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedShapeId) {
                    dispatch({
                      type: "tool/updateShapePosition",
                      payload: {
                        id: selectedShapeId,
                        x: (selectedShape.x || 0) + moveX,
                        y: (selectedShape.y || 0) + moveY,
                      },
                    });
                  }
                  setShowTransformModal(false);
                }}
                style={{
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "6px 16px"
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      {showSelectorsModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={handleCloseSelectors}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 400,
              maxWidth: 700,
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4>Selectors and CSS (SVG Element)</h4>
            <pre
              style={{
                background: "#f4f4f4",
                padding: 12,
                borderRadius: 4,
                fontSize: 14,
                overflowX: "auto"
              }}
            >{shapeToSVGElement(selectedShape)}</pre>
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button onClick={handleCloseSelectors} style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showObjectPropertiesModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={handleCloseObjectProperties}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 400,
              maxWidth: 700,
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4>Object Properties</h4>
            <div style={{ marginBottom: 16 }}>
              <b>Type:</b> {selectedShape.type || "Unknown"}
            </div>
            {renderShapeProperties(selectedShape)}
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button onClick={handleCloseObjectProperties} style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <PathEffectsDialog
        isOpen={showPathEffectsDialog}
        onClose={() => setShowPathEffectsDialog(false)}
        onApply={handleApplyPathEffect}
        selectedShape={selectedShape}
        onSetCornerRadius={(id, radius) => {
          dispatch(updateShapePosition({ id, cornerRadius: radius }));
        }}
        onSetKnotOptions={(id, opts) => {
          dispatch(updateShapePosition({ id, knotSize: opts.knotSize, knotGapLength: opts.gapLength }));
        }}
        onSetOffset={(id, offsetAmount) => {
          dispatch(updateShapePosition({ id, offsetAmount, lpeEffect: "Offset" }));
        }}
        onSetPowerStroke={(id, width) => {
          dispatch(updateShapePosition({ id, powerStrokeWidth: width, lpeEffect: "Power stroke" }));
        }}
      />
      {showIconPreview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowIconPreview(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 220,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ marginBottom: 16 }}>Icon Preview</h4>
            <div style={{ display: "flex", gap: 16 }}>
              {[16, 24, 32].map(size => (
                <IconPreviewCanvas key={size} size={size} />
              ))}
            </div>
            <button
              style={{
                marginTop: 24,
                border: "none",
                borderRadius: 4,
                padding: "6px 16px"
              }}
              onClick={() => setShowIconPreview(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showMessagesModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
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
      {showSwatchesModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowSwatchesModal(false)}
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
            <h4 style={{ marginBottom: 16 }}>Swatches</h4>
            <ul style={{ padding: 0, listStyle: "none" }}>
              {SWATCHES.map((swatch, idx) => (
                <li key={idx} style={{ marginBottom: 8 }}>
                  <button
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      background: "#f8f8f8",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      setSelectedSwatch(swatch);
                      if (SWATCH_PALETTES[swatch]) {
                        setPaletteColors(SWATCH_PALETTES[swatch]);
                        setShowPaletteGrid(true);
                        setShowSwatchesModal(false);
                      } else {
                        setShowColorPicker(true);
                        setShowSwatchesModal(false);
                      }
                    }}
                  >
                    {swatch}
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button onClick={() => setShowSwatchesModal(false)} style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showColorPicker && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowColorPicker(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 220,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ marginBottom: 16 }}>{selectedSwatch} - Pick Fill Color</h4>
            <input
              type="color"
              value={colorPickerValue}
              onChange={e => setColorPickerValue(e.target.value)}
              style={{ width: 80, height: 80, border: "none", marginBottom: 16 }}
            />
            <button
              style={{ border: "none", borderRadius: 4, padding: "6px 16px", marginTop: 8 }}
              onClick={() => {
                if (selectedShapeId) {
                  dispatch(updateShapePosition({ id: selectedShapeId, fill: colorPickerValue }));
                }
                setShowColorPicker(false);
                setShowSwatchesModal(false);
              }}
            >
              Apply Fill
            </button>
            <button
              style={{ border: "none", borderRadius: 4, padding: "6px 16px", marginTop: 8 }}
              onClick={() => setShowColorPicker(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showPaletteGrid && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowPaletteGrid(false)}
        >
          <div
            style={{
              background: "#222",
              padding: 24,
              borderRadius: 8,
              minWidth: 320,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ marginBottom: 16, color: "#fff" }}>{selectedSwatch} Palette</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {paletteColors.map((swatch, idx) => (
                <button
                  key={idx}
                  style={{
                    width: 40,
                    height: 40,
                    background: swatch.color || "none",
                    border: swatch.color ? "1px solid #888" : "none",
                    borderRadius: swatch.color ? 4 : 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 500,
                    cursor: "pointer",
                    position: "relative"
                  }}
                  onClick={() => {
                    if (selectedShapeId && swatch.color) {
                      dispatch(updateShapePosition({ id: selectedShapeId, fill: swatch.color }));
                      setShowPaletteGrid(false);
                      setShowSwatchesModal(false);
                    } else if (swatch.name === "None") {
                      dispatch(updateShapePosition({ id: selectedShapeId, fill: "none" }));
                      setShowPaletteGrid(false);
                      setShowSwatchesModal(false);
                    }
                  }}
                  title={swatch.color || swatch.name}
                >
                  {swatch.name === "None" ? (
                    <span style={{
                      color: "#fff",
                      fontSize: 18,
                      fontWeight: "bold",
                      textDecoration: "line-through"
                    }}>X</span>
                  ) : (
                    <span style={{
                      position: "absolute",
                      bottom: 2,
                      left: 2,
                      fontSize: 10,
                      color: "#fff",
                      textShadow: "0 0 2px #000"
                    }}></span>
                  )}
                </button>
              ))}
            </div>
            <button
              style={{ border: "none", borderRadius: 4, padding: "6px 16px", marginTop: 8 }}
              onClick={() => setShowPaletteGrid(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showCommandPalette && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowCommandPalette(false)}
        >
          <div
            style={{
              background: "#222",
              padding: 24,
              borderRadius: 8,
              minWidth: 400,
              maxWidth: 600,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              color: "#fff"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ marginBottom: 16 }}>Command Palette</h4>
            <input
              type="text"
              autoFocus
              placeholder="Type to search commands..."
              value={commandSearch}
              onChange={e => setCommandSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 4,
                border: "1px solid #888",
                marginBottom: 16,
                fontSize: 16,
                background: "#333",
                color: "#fff"
              }}
              onKeyDown={e => {
                if (e.key === "Escape") setShowCommandPalette(false);
              }}
            />
            <ul style={{ listStyle: "none", padding: 0, maxHeight: 300, overflowY: "auto" }}>
              {COMMANDS.filter(cmd =>
                cmd.label.toLowerCase().includes(commandSearch.toLowerCase())
              ).map((cmd, idx) => (
                <li key={idx} style={{ marginBottom: 8 }}>
                  <button
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      border: "none",
                      borderRadius: 4,
                      background: "#444",
                      color: "#fff",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      cmd.action();
                      setShowCommandPalette(false);
                    }}
                  >
                    {cmd.label}
                  </button>
                </li>
              ))}
              {COMMANDS.filter(cmd =>
                cmd.label.toLowerCase().includes(commandSearch.toLowerCase())
              ).length === 0 && (
                  <li style={{ color: "#aaa", padding: "8px 12px" }}>No commands found.</li>
                )}
            </ul>
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button onClick={() => setShowCommandPalette(false)} style={{ border: "none", borderRadius: 4, padding: "6px 16px", background: "#555", color: "#fff" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showFindReplaceModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowFindReplaceModal(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 400,
              maxWidth: 600,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              color: "#222"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ marginBottom: 16 }}>Find/Replace Text</h4>
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Find text..."
                value={findText}
                onChange={e => setFindText(e.target.value)}
                style={{ width: "100%", padding: "8px", marginBottom: 8 }}
              />
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceText}
                onChange={e => setReplaceText(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <button
                style={{ marginRight: 8, padding: "6px 16px" }}
                onClick={handleFindText}
              >
                Find
              </button>
              <button
                style={{ padding: "6px 16px" }}
                onClick={handleReplaceText}
                disabled={!findResults.length}
              >
                Replace
              </button>
              <button
                style={{ marginLeft: 8, padding: "6px 16px" }}
                onClick={() => setShowFindReplaceModal(false)}
              >
                Close
              </button>
            </div>
            {findResults.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <b>Found:</b>
                <ul style={{ paddingLeft: 20 }}>
                  {findResults.map((res, idx) => (
                    <li key={idx}>
                      Layer {res.layerIdx + 1}, Shape ID: {res.shapeId}, Text: <span style={{ color: "#007bff" }}>{res.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      {showXmlEditor && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.3)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
        }}
          onClick={() => setShowXmlEditor(false)}
        >
          <div style={{
            background: "#fff", padding: 24, borderRadius: 8, minWidth: 600, minHeight: 400,
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)", position: "relative"
          }}
            onClick={e => e.stopPropagation()}
          >
            <h4>XML Editor</h4>
            <textarea
              value={xmlContent}
              onChange={e => setXmlContent(e.target.value)}
              style={{ width: "100%", height: "320px", fontFamily: "monospace", fontSize: 14, marginBottom: 16 }}
            />
            <div style={{ textAlign: "right" }}>
              <button onClick={() => setShowXmlEditor(false)} style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showRecentModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowRecentModal(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 320,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4>Open Recent Files</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {recentFiles.length === 0 && <li>No recent files.</li>}
              {recentFiles.map((file, idx) => (
                <li key={idx} style={{ marginBottom: 8 }}>
                  <button
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      background: "#f8f8f8",
                      cursor: "pointer"
                    }}
                    onClick={() => handleOpenRecentFile(file)}
                  >
                    {file.name}
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button onClick={() => setShowRecentModal(false)} style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showImportWebImageModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowImportWebImageModal(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 320,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4>Import Web Image</h4>
            <input
              type="text"
              placeholder="Enter image URL"
              value={webImageUrl}
              onChange={e => setWebImageUrl(e.target.value)}
              style={{ width: "100%", marginBottom: 16 }}
            />
            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => {
                  if (webImageUrl.trim()) {
                    dispatch(addImage({ url: webImageUrl.trim(), name: "Web Image" }));
                    setShowImportWebImageModal(false);
                    setWebImageUrl("");
                  }
                }}
                style={{ border: "none", borderRadius: 4, padding: "6px 16px", marginRight: 8 }}
              >
                Import
              </button>
              <button
                onClick={() => setShowImportWebImageModal(false)}
                style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showCloseTabModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowCloseTabModal(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 320,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4>Close Tab</h4>
            <p>
              This tab cannot be closed automatically.<br />
              Please close it manually.
            </p>
            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setShowCloseTabModal(false)}
                style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {showDocumentResourcesModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowDocumentResourcesModal(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 400,
              maxWidth: 700,
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4>Document Resources</h4>
            <div>
              <b>Images:</b>
              <ul>
                {layers.flatMap(layer =>
                  layer.shapes.filter(s => s.type === "Image")
                ).map(img => (
                  <li key={img.id}>
                    <span>{img.name || img.id}</span>
                    <br />
                    <img src={img.url} alt={img.name} style={{ maxWidth: 120, maxHeight: 80, margin: "4px 0" }} />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <b>Fonts:</b>
              <ul>
                {[...new Set(layers.flatMap(layer =>
                  layer.shapes.filter(s => s.type === "Text").map(s => s.fontFamily || "Arial")
                ))].map(font => (
                  <li key={font}>{font}</li>
                ))}
              </ul>
            </div>
            <div>
              <b>Color Profiles:</b>
              <ul>
                {availableColorProfiles?.map(profile => (
                  <li key={profile.id}>{profile.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <b>Scripts:</b>
              <ul>
                {externalScripts?.map((script, idx) => (
                  <li key={idx}>{script}</li>
                ))}
                {embeddedScripts?.map((script, idx) => (
                  <li key={idx}>{script}</li>
                ))}
              </ul>
            </div>
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button
                onClick={() => setShowDocumentResourcesModal(false)}
                style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;
const unitConversionFactors = {
  px: 1,
  mm: 3.779528,
  cm: 37.79528,
  in: 96,
  pt: 1.333333,
};

function convertFromPx(value, unit) {
  return value / unitConversionFactors[unit];
}
function convertToPx(value, unit) {
  -+62
  return value * unitConversionFactors[unit];
}
function DefaultTopbar() {
  const selectedTool = useSelector((state) => state.tool.selectedTool);
  const replaceShapes = useSelector((state) => state.tool.replaceShapes)
  const dispatch = useDispatch();
  const [circleArcMode, setCircleArcMode] = useState(null);
  const [unit, setUnit] = useState("px");
  const shapeBuilderMode = useSelector((state) => state.tool.shapeBuilderMode);

  const [isSnappingEnabled, setIsSnappingEnabled] = useState(false);
  const handleSelectAll = () => {
    dispatch(selecteAllShapes());
  };

  const handleDeselectAll = () => {
    dispatch(deselectAllShapes());
  };
  let selectedShapeId = useSelector((state) => state.tool.selectedShapeId);
  const shapes = useSelector(
    (state) => state.tool.layers[state.tool.selectedLayerIndex].shapes || []
  );

  const selectedShape =
    shapes.find((shape) => shape.id === selectedShapeId) || {};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseFloat(value);

    if (!isNaN(newValue)) {
      dispatch(updateShapePosition({ id: selectedShapeId, [name]: newValue }));
    }
  };

  const handleSkewChange = (axis, value) => {
    const newValue = parseFloat(value);
    if (!isNaN(newValue) && selectedShapeId) {
      dispatch(
        updateShapePosition({
          id: selectedShapeId,
          [axis]: newValue,
        })
      );
    }
  };

  const handleRaiseToTop = () => {
    if (selectedShapeId) {
      console.log("Raise to Top clicked for shape ID:", selectedShapeId);
      dispatch(raiseShapeToTop(selectedShapeId));
    }
  };

  const handleLower = () => {
    if (selectedShapeId) {
      console.log("Lower clicked for shape ID:", selectedShapeId);
      dispatch(lowerShape(selectedShapeId));
    }
  };

  const handleStrokeChange = (e) => {
    const newStrokeWidth = parseFloat(e.target.value);
    if (!isNaN(newStrokeWidth) && selectedShapeId) {
      dispatch(
        updateShapePosition({
          id: selectedShapeId,
          strokeWidth: newStrokeWidth,
        })
      );

    }
  };

  const handleRadiusChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseFloat(value);

    if (!isNaN(newValue) && selectedShapeId) {
      const updatedShape = { id: selectedShapeId, [name]: newValue };


      if (!isNaN(newValue) && selectedShapeId) {
        dispatch(
          updateShapePosition({
            id: selectedShapeId,
            [name]: newValue,
          })
        );
      }
    }
  };

  const handleCorners = (e) => {
    const { name, value } = e.target;
    const newValue = parseFloat(value);

    if (!isNaN(newValue)) {
      dispatch(updateShapePosition({ id: selectedShapeId, [name]: newValue }));
    }
  };

  const handleFlipHorizontal = () => {
    if (selectedShapeId) {
      const newScaleX = selectedShape.scaleX !== -1 ? -1 : 1;
      dispatch(updateShapePosition({ id: selectedShapeId, scaleX: newScaleX }));
    }
  };

  const handleFlipVertical = () => {
    if (selectedShapeId) {
      const newScaleY = selectedShape.scaleY !== -1 ? -1 : 1;
      dispatch(updateShapePosition({ id: selectedShapeId, scaleY: newScaleY }));
    }
  };

  const handleRotateClockwise = () => {
    console.log("Selected Shape ID:", selectedShapeId);
    if (selectedShapeId) {
      const newRotation = (selectedShape.rotation || 0) + 90;
      console.log("New Rotation (Clockwise):", newRotation);
      dispatch(
        updateShapePosition({ id: selectedShapeId, rotation: newRotation })
      );
    } else {
      console.error("No shape selected for rotation.");
    }
  };

  const handleRotateCounterClockwise = () => {
    console.log("Selected Shape ID:", selectedShapeId);
    if (selectedShapeId) {
      const newRotation = (selectedShape.rotation || 0) - 90;
      console.log("New Rotation (Counter-Clockwise):", newRotation);
      dispatch(
        updateShapePosition({ id: selectedShapeId, rotation: newRotation })
      );
    } else {
      console.error("No shape selected for rotation.");
    }
  };
  const toggleSnapping = () => {
    const newState = !isSnappingEnabled;
    setIsSnappingEnabled(newState);
    dispatch(setSnapping(newState));
    console.log("Snapping is now:", newState ? "Enabled" : "Disabled");
  };
  const handleStarPropertyChange = (property, value) => {
    const newValue = parseFloat(value);
    console.log("Star Property Change:", property, newValue);
    if (!isNaN(newValue) && selectedShapeId) {
      dispatch(updateShapePosition({ id: selectedShapeId, [property]: newValue }));
    }
  };

  const generateRandomOffsets = (numPoints, randomized) => {
    return Array.from({ length: numPoints }, () => {
      const offset = Math.random() * randomized;
      return 1 + offset;
    });
  };
  const handleRandomizedChange = (shapeId, randomized) => {
    console.log(`handleRandomizedChange called for shapeId: ${shapeId}, randomized: ${randomized}`);
    const shape = shapes.find((s) => s.id === shapeId);
    if (shape) {
      const numPoints = shape.corners * 2;
      const randomOffsets = generateRandomOffsets(numPoints, randomized);

      dispatch(
        updateShapePosition({
          id: shapeId,
          randomized,
          randomOffsets,
        })
      );
    }
  };
  const handleArcAngleChange = (value) => {
    const newAngle = parseFloat(value);

    if (!isNaN(newAngle) && selectedShapeId) {
      dispatch(
        updateShapePosition({
          id: selectedShapeId,
          arcAngle: Math.max(0, Math.min(newAngle, 360)),
        })
      );
    }
  };

  const handleShapeBuilderModeChange = (e) => {
    dispatch(setShapeBuilderMode(e.target.value));
  };
  return (
    <>
      <div className="d-flex flex-row mb-3" style={{ alignItems: "center", overflow: 'scroll' }}>
        <div
          className={`p-2 top-icon ${isSnappingEnabled ? "active" : ""}`}
          onClick={toggleSnapping}
        >
          <TbBrandSnapseed
            data-tooltip-content="Snapping"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 top-icon" onClick={handleSelectAll}>
          <TbSelectAll
            data-tooltip-content="Select All"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 top-icon" onClick={() => dispatch(selectAllShapesInAllLayers())}>
          <FaLayerGroup
            data-tooltip-content="Select All in All Layers"
            data-tooltip-id="tool-top"
            style={{ fontSize: 22 }}
          />
        </div>
        {/* <div className="p-2 top-icon">
          <VscLayersActive
            data-tooltip-content="Select All Layer"
            data-tooltip-id="tool-top"
          />
        </div> */}
        <div className="p-2 top-icon" onClick={handleDeselectAll}>
          <TbDeselect
            data-tooltip-content="Deselect"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 top-icon" onClick={handleRotateCounterClockwise}>
          <RiAnticlockwise2Line
            data-tooltip-content="Rotate Anti-CW"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 top-icon" onClick={handleRotateClockwise}>
          <RiClockwise2Line
            data-tooltip-content="Rotate CW"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 top-icon" onClick={handleFlipHorizontal}>
          <TbFlipHorizontal
            data-tooltip-content="Flip Horizontal"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 top-icon" onClick={handleFlipVertical}>
          <TbFlipVertical
            data-tooltip-content="Flip Vertical"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="X">X:&nbsp;</label>
          <input
            type="number"
            name="x"
            id="X"
            step={1}
            placeholder="0.00"
            value={selectedShape.x ?? shapes?.[shapes?.length - 1]?.x ?? 0}
            onChange={handleInputChange}
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="Y">Y:&nbsp;</label>
          <input
            type="number"
            name="y"
            id="Y"
            step={1}
            placeholder="0.00"
            value={selectedShape.y ?? shapes?.[shapes?.length - 1]?.y ?? 0}
            onChange={handleInputChange}
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="skewX">Sx:&nbsp;</label>
          <input
            type="number"
            name="skewX"
            id="skewX"
            step={0.1}
            placeholder="0"
            value={selectedShape.skewX || 0}
            onChange={(e) => handleSkewChange("skewX", e.target.value)}
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="skewY">Sy:&nbsp;</label>
          <input
            type="number"
            name="skewY"
            id="skewY"
            step={0.1}
            placeholder="0"
            value={selectedShape.skewY || 0}
            onChange={(e) => handleSkewChange("skewY", e.target.value)}
          />
        </div>
        { }
        <div
          className="p-2 value"
          style={
            selectedTool === "Select"
              ? { display: "block" }
              : { display: "none" }
          }
        >
          <AiOutlineVerticalAlignBottom onClick={handleRaiseToTop} disabled={!selectedShapeId} style={{ fontSize: '25px', color: 'white' }} />
        </div>
        <div
          className="p-2 value"
          style={
            selectedTool === "Select"
              ? { display: "block" }
              : { display: "none" }
          }
        >
          <MdOutlineVerticalAlignTop onClick={handleLower} disabled={!selectedShapeId} style={{ fontSize: '25px', color: 'white' }} />
        </div>
        <div
          className="p-2 value"
          style={
            selectedTool === "Rectangle"
              ? { display: "flex", alignItems: "center", gap: "0.5rem" }
              : { display: "none" }
          }
        >
          <label htmlFor="unit">Unit:&nbsp;</label>
          <select
            id="unit"
            value={unit}
            onChange={e => setUnit(e.target.value)}
            style={{ marginRight: 8 }}
          >
            <option value="mm">mm</option>
            <option value="cm">cm</option>
            <option value="in">in</option>
            <option value="pt">pt</option>
            <option value="px">px</option>
          </select>
          <label htmlFor="W">W:&nbsp;</label>
          <input
            type="number"
            name="width"
            id="W"
            step={1}
            placeholder="0"
            value={
              selectedShape.width
                ? convertFromPx(selectedShape.width, unit).toFixed(2)
                : shapes?.[shapes?.length - 1]?.width
                  ? convertFromPx(shapes[shapes.length - 1].width, unit).toFixed(2)
                  : 0
            }
            onChange={e => {
              const pxValue = convertToPx(parseFloat(e.target.value), unit);
              if (!isNaN(pxValue)) {
                dispatch(updateShapePosition({ id: selectedShapeId, width: pxValue }));
              }
            }}
          />
        </div>
        <div
          className="p-2 value"
          style={
            selectedTool === "Rectangle"
              ? { display: "flex", alignItems: "center", gap: "0.5rem" }
              : { display: "none" }
          }
        >
          <label htmlFor="H">H:&nbsp;</label>
          <input
            type="number"
            name="height"
            id="H"
            step={1}
            placeholder="0"
            value={
              selectedShape.height
                ? convertFromPx(selectedShape.height, unit).toFixed(2)
                : shapes?.[shapes?.length - 1]?.height
                  ? convertFromPx(shapes[shapes.length - 1].height, unit).toFixed(2)
                  : 0
            }
            onChange={e => {
              const pxValue = convertToPx(parseFloat(e.target.value), unit);
              if (!isNaN(pxValue)) {
                dispatch(updateShapePosition({ id: selectedShapeId, height: pxValue }));
              }
            }}
          />
        </div>
        <div
          className="p-2 value"
          style={
            selectedTool === "Rectangle"
              ? { display: "flex", alignItems: "center", gap: "0.5rem" }
              : { display: "none" }
          }
        >
          <label htmlFor="cornerRadius">Border:&nbsp;</label>
          <input
            type="number"
            name="cornerRadius"
            id="cornerRadius"
            min={0}
            max={Math.min(selectedShape.width, selectedShape.height) / 2 || 100}
            value={selectedShape.cornerRadius || 0}
            onChange={e => {
              const value = parseFloat(e.target.value);
              if (!isNaN(value) && selectedShapeId) {
                dispatch(updateShapePosition({ id: selectedShapeId, cornerRadius: value }));
              }
            }}
            style={{ width: 60 }}
          />
        </div>
        <div
          className="p-2 value"
          style={
            selectedTool === "Select" ||
              selectedTool === "Node" ||
              selectedTool === "Eraser" ||
              selectedTool === "Dropper" ||
              selectedTool === "PaintBucket"
              ? { display: "none" }
              : { display: "flex", alignItems: "center", gap: "0.5rem" }
          }
        >
          <label htmlFor="Stroke">Stroke:&nbsp;</label>
          <input
            type="number"
            name="stroke"
            id="stroke"
            step={1}
            placeholder="0"
            value={selectedShape.strokeWidth || 1}
            onChange={handleStrokeChange}
          />
        </div>
        <div
          className="p-2 value"
          style={
            selectedTool === "Circle"
              ? { display: "flex", alignItems: "center", gap: "0.5rem" }
              : { display: "none" }
          }
        >
          <label htmlFor="Radius">R:&nbsp;</label>
          <input
            type="number"
            name="radius"
            id="radius"
            step={1}
            placeholder="0.00"
            value={
              (selectedShape.radius || shapes?.[shapes?.length - 1]?.radius || 0).toFixed(2)
            }
            onChange={handleRadiusChange}
          />
        </div>

        <div className="p-2 value"
          style={
            selectedTool === "Circle"
              ? { display: "flex", alignItems: "center", gap: "0.5rem" }
              : { display: "none" }
          }
        >
          <label htmlFor="horizontalRadius">Rx:&nbsp;</label>
          <input
            type="number"
            name="horizontalRadius"
            id="horizontalRadius"
            step={1}
            placeholder="0"
            value={(selectedShape.horizontalRadius || selectedShape.radius || 0).toFixed(2)}
            onChange={handleRadiusChange}
          />
        </div>
        <div className="p-2 value"
          style={
            selectedTool === "Circle"
              ? { display: "flex", alignItems: "center", gap: "0.5rem" }
              : { display: "none" }
          }
        >
          <label htmlFor="verticalRadius">Ry:&nbsp;</label>
          <input
            type="number"
            name="verticalRadius"
            id="verticalRadius"
            step={1}
            placeholder="0"
            value={(selectedShape.verticalRadius || selectedShape.radius || 0).toFixed(2)}
            onChange={handleRadiusChange}
          />
        </div>
        <div
          className="p-2 value"
          style={
            selectedTool === "ShapeBuilder"
              ? { display: "flex", alignItems: "center", gap: 8 }
              : { display: "none" }
          }
        >
          <label>Mode:&nbsp;</label>
          <button
            style={{
              background: shapeBuilderMode === "combine" ? "#007bff" : "#222",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
            onClick={() => dispatch(setShapeBuilderMode("combine"))}
            title="Combine"
          >
            <FaObjectGroup size={20} />
          </button>
          <button
            style={{
              background: shapeBuilderMode === "subtract" ? "#007bff" : "#222",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
            onClick={() => dispatch(setShapeBuilderMode("subtract"))}
            title="Subtract"
          >
            <FaObjectUngroup size={20} />
          </button>
          {selectedTool === "ShapeBuilder" && window.shapeBuilderRegions?.length > 0 && window.selectedRegionIndices?.length > 0 && (
            <>
              <button
                style={{
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: 4,

                  marginLeft: 8,
                  cursor: "pointer"
                }}
                onClick={() => {

                  window.dispatchEvent(new CustomEvent("shapeBuilderCombine"));
                }}
              >
                <RxCheckCircled />
              </button>
              <button
                style={{
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: 4,

                  marginLeft: 8,
                  cursor: "pointer"
                }}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("shapeBuilderSubtract"));
                }}
              >
                <RxCrossCircled />
              </button>
            </>
          )}
          <label style={{ marginLeft: 12, display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="checkbox"
              checked={replaceShapes}
              onChange={e => dispatch(setReplaceShapes(e.target.checked))}
              style={{ marginRight: 4 }}
            />
            Replace
          </label>
        </div>
        <div className="p-2 value" style={selectedTool === "Circle" ? { display: "flex", flexDirection: 'row', alignItems: 'center' } : { display: "none" }}>
          <label>Arc:&nbsp;</label>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="radio"
              name="arcMode"
              value="ellipse"
              checked={circleArcMode === "ellipse"}
              onChange={() => {
                setCircleArcMode("ellipse");

                if (selectedShapeId) {
                  dispatch(updateShapePosition({
                    id: selectedShapeId,
                    arcType: "ellipse",
                    arcAngle: 360
                  }));
                }
              }}
              style={{ marginRight: 4 }}
            />
            Ellipse
          </label>
          <label style={{ display: 'flex', alignItems: 'center', marginLeft: 8 }}>
            <input
              type="radio"
              name="arcMode"
              value="arc"
              checked={circleArcMode === "arc"}
              onChange={() => setCircleArcMode("arc")}
              style={{ marginRight: 4 }}
            />
            Arc
          </label>
          <label style={{ display: 'flex', alignItems: 'center', marginLeft: 8 }}>
            <input
              type="radio"
              name="arcMode"
              value="chord"
              checked={circleArcMode === "chord"}
              onChange={() => setCircleArcMode("chord")}
              style={{ marginRight: 4 }}
            />
            Chord
          </label>
          <label style={{ display: 'flex', alignItems: 'center', marginLeft: 8 }}>
            <input
              type="radio"
              name="arcMode"
              value="slice"
              checked={circleArcMode === "slice"}
              onChange={() => setCircleArcMode("slice")}
              style={{ marginRight: 4 }}
            />
            Slice
          </label>
        </div>
        <div
          className="p-2 value"
          style={selectedTool === "Circle" ? { display: "flex", alignItems: "center", gap: "0.5rem" } : { display: "none" }}
        >
          <label htmlFor="arcAngle">Angle:&nbsp;</label>
          <input
            type="number"
            name="arcAngle"
            id="arcAngle"
            step={1}
            min={0}
            max={360}
            placeholder="360"
            value={(selectedShape.arcAngle || 360).toFixed(0)}
            disabled={!circleArcMode}
            onChange={e => {
              if (!circleArcMode) return;
              dispatch(updateShapePosition({
                id: selectedShapeId,
                arcAngle: Math.max(0, Math.min(parseFloat(e.target.value), 360)),
                arcType: circleArcMode,
              }));
            }}
          />
        </div>
        <div
          className="p-2 value"
          style={
            selectedTool === "Star"
              ? { display: "flex", alignItems: "center", gap: "0.5rem" }
              : { display: "none" }
          }
        >
          <label htmlFor="Corners">Corners:&nbsp;</label>
          <input
            type="number"
            name="corners"
            id="corners"
            step={1}
            placeholder="0"
            value={
              selectedShape.corners ||
              shapes?.[shapes?.length - 1]?.corners ||
              0
            }
            onChange={handleCorners}
          />
        </div>
        <div
          className="p-2 value"
          style={selectedTool === "Star" ? { display: "flex", alignItems: "center", gap: "0.5rem" } : { display: "none" }}
        >
          <label htmlFor="spokeRatio">Ratio:&nbsp;</label>
          <input
            type="number"
            name="spokeRatio"
            id="spokeRatio"
            step={0.1}
            min={0}
            max={1}
            placeholder="0.5"
            value={selectedShape.spokeRatio || 0.5}
            onChange={(e) => handleStarPropertyChange("spokeRatio", e.target.value)}
          />
        </div>
        <div
          className="p-2 value"
          style={selectedTool === "Star" ? { display: "flex", alignItems: "center", gap: "0.5rem" } : { display: "none" }}
        >
          <label htmlFor="rounded">Rounded:&nbsp;</label>
          <input
            type="number"
            name="rounded"
            id="rounded"
            step={0.1}
            min={0}
            max={1}
            placeholder="0"
            value={selectedShape.rounded || 0}
            onChange={(e) => handleStarPropertyChange("rounded", e.target.value)}
          />
        </div>
        <div
          className="p-2 value"
          style={selectedTool === "Star" ? { display: "flex", alignItems: "center", gap: "0.5rem" } : { display: "none" }}
        >
          <label htmlFor="randomized">Randomized:&nbsp;</label>
          <input
            type="number"
            name="randomized"
            id="randomized"
            step={0.1}
            min={0}
            max={1}
            placeholder="0"
            value={selectedShape.randomized || 0}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value);
              if (!isNaN(newValue) && selectedShapeId) {
                dispatch(updateShapePosition({ id: selectedShapeId, randomized: newValue }));
                handleRandomizedChange(selectedShapeId, newValue);
              }
            }}
          />
        </div>
        {/* <div className="p-2 value">
          <select>
            <option value="cm">cm</option>
            <option value="in">in</option>
            <option value="pc">pc</option>
            <option value="mm">mm</option>
            <option value="px">px</option>
            <option value="%">%</option>
          </select>
        </div> */}
        <Tooltip id="tool-top" place="bottom-start" />
      </div>
    </>
  );
}

function BezierTopbar() {
  const dispatch = useDispatch();
  const bezierOption = useSelector((state) => state.tool.bezierOption);
  const scale = useSelector((state) => state.tool.scale);

  const handleOptionSelect = (option) => {
    dispatch(setBezierOption(option));
    dispatch(clearPoints());
  };

  const handleScaleChange = (e) => {
    const newScale = parseFloat(e.target.value);
    if (!isNaN(newScale)) {
      dispatch(setScale(newScale));
    }
  };

  return (
    <div className="d-flex flex-row mb-3 top-icons">
      <div className="p-2 value">
        <label>Bezier Options: &nbsp;</label>
      </div>
      <div className="d-flex flex-row">
        <div
          className={`p-2 top-icon ${bezierOption === "Spiro Path" ? "active" : ""}`}
          onClick={() => handleOptionSelect("Spiro Path")}
        >
          <FaBezierCurve
            size={24}
            title="Spiro Path"
            style={{ color: bezierOption === "Spiro Path" ? "#007bff" : "#6c757d" }}
          />
        </div>

        <div
          className={`p-2 top-icon ${bezierOption === "BSpline Path" ? "active" : ""}`}
          onClick={() => handleOptionSelect("BSpline Path")}
        >
          <FaProjectDiagram
            size={24}
            title="BSpline Path"
            style={{ color: bezierOption === "BSpline Path" ? "#007bff" : "#6c757d" }}
          />
        </div>

        <div
          className={`p-2 top-icon ${bezierOption === "Paraxial Line Segments" ? "active" : ""}`}
          onClick={() => handleOptionSelect("Paraxial Line Segments")}
        >
          <FaDrawPolygon
            size={24}
            title="Paraxial Line Segments"
            style={{ color: bezierOption === "Paraxial Line Segments" ? "#007bff" : "#6c757d" }}
          />
        </div>
        <div
          className={`p-2 top-icon ${bezierOption === "Straight Segments" ? "active" : ""}`}
          onClick={() => handleOptionSelect("Straight Segments")}
        >
          <GiStraightPipe
            size={24}
            title="Straight Line Segments"
            style={{ color: bezierOption === "Straight Segments" ? "#007bff" : "#6c757d" }}
          />
        </div>
      </div>

      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label htmlFor="scale">Scale: &nbsp;</label>
        <input
          type="range"
          id="scale"
          min="0.1"
          max="5"
          step="0.1"
          value={scale}
          onChange={handleScaleChange}
        />
        <span>{scale.toFixed(1)}</span>
      </div>
    </div>
  );
}

function CalligraphyTopbar() {
  const dispatch = useDispatch();
  const calligraphyOption = useSelector((state) => state.tool.calligraphyOption);
  const calligraphyWidth = useSelector((state) => state.tool.calligraphyWidth);
  const calligraphyThinning = useSelector((state) => state.tool.calligraphyThinning);
  const calligraphyMass = useSelector((state) => state.tool.calligraphyMass);
  const calligraphyAngle = useSelector((state) => state.tool.calligraphyAngle);
  const calligraphyFixation = useSelector((state) => state.tool.calligraphyFixation);
  const calligraphyCaps = useSelector((state) => state.tool.calligraphyCaps);

  const handleOptionSelect = (option) => {
    dispatch(setCalligraphyOption(option));
  };

  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value, 10);
    dispatch(setCalligraphyWidth(newWidth));
  };

  const handleThinningChange = (e) => {
    const newThinning = parseFloat(e.target.value);
    console.log("Thinning Changed:", newThinning);
    dispatch(setCalligraphyThinning(newThinning));
  };

  const handleMassChange = (e) => {
    const newMass = parseFloat(e.target.value);
    console.log("Mass Changed:", newMass);
    dispatch(setCalligraphyMass(newMass));
  };

  const handleAngleChange = (e) => {
    const newAngle = parseFloat(e.target.value);
    dispatch(setCalligraphyAngle(newAngle));
  };

  const handleFixationChange = (e) => {
    const newFixation = parseFloat(e.target.value);
    dispatch(setCalligraphyFixation(newFixation));
  };

  const handleCapsChange = (e) => {
    const newCaps = parseFloat(e.target.value);
    dispatch(setCalligraphyCaps(newCaps));
  };

  const scrollContainerRef = useRef(null);
  const [showRightArrow, setShowRightArrow] = useState(false);


  useEffect(() => {
    const checkOverflow = () => {
      const el = scrollContainerRef.current;
      if (el) {
        setShowRightArrow(el.scrollWidth > el.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  const scrollRight = () => {
    scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={scrollContainerRef}
        className="d-flex flex-row mb-3 top-icons"
        style={{
          alignItems: "center",
          color: "white",
          overflowX: "auto",
          whiteSpace: "nowrap",
          scrollbarWidth: "none",
        }}
      >
        {/* Dropdown for Calligraphy Options */}
        <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
          <label>Options:&nbsp;</label>
          <select
            value={calligraphyOption}
            onChange={(e) => handleOptionSelect(e.target.value)}
            style={{ padding: "0px", borderRadius: "4px", height: '30px' }}
          >
            <option value="Marker">Marker</option>
            <option value="DipPen">Dip Pen</option>
            <option value="Brush">Brush</option>
            <option value="Wiggly">Wiggly</option>
            <option value="Tracing">Tracing</option>
            <option value="Splotchy">Splotchy</option>
          </select>
        </div>

        <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
          <label>Width: </label>
          <input
            type="range"
            min="1"
            max="50"
            value={calligraphyWidth}
            onChange={handleWidthChange}
            style={{ width: "150px", margin: "0 10px" }}
          />
          <span>{calligraphyWidth}px</span>
        </div>
        <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
          <label>Thinning: </label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={calligraphyThinning}
            onChange={handleThinningChange}
            style={{ width: "150px", margin: "0 10px" }}
          />
          <span>{calligraphyThinning.toFixed(1)}</span>
        </div>

        <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
          <label>Mass: </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={calligraphyMass}
            onChange={handleMassChange}
            style={{ width: "150px", margin: "0 10px" }}
          />
          <span>{calligraphyMass.toFixed(1)}</span>
        </div>

        <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
          <label>Angle: </label>
          <input
            type="number"
            min="0"
            max="360"
            step="1"
            value={calligraphyAngle}
            onChange={handleAngleChange}
            style={{ width: "80px", margin: "0 10px" }}
          />
          <span>°</span>
        </div>
        <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
          <label>Fixation: </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={calligraphyFixation}
            onChange={handleFixationChange}
            style={{ width: "150px", margin: "0 10px" }}
          />
          <span>{calligraphyFixation.toFixed(2)}</span>
        </div>
        <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
          <label>Caps: </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={calligraphyCaps}
            onChange={handleCapsChange}
            style={{ width: "150px", margin: "0 10px" }}
          />
          <span>{calligraphyCaps.toFixed(2)}</span>
        </div>
      </div>
      {
        showRightArrow && (
          <div
            onClick={scrollRight}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.4)",
              color: 'white',
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            ▶
          </div>
        )
      }
    </div>
  );
}
function TweakTopbar() {
  const dispatch = useDispatch();
  const tweakMode = useSelector(state => state.tool.tweakMode || "move");
  const tweakRadius = useSelector(state => state.tool.tweakRadius || 40);
  const setTweakMode = (mode) => dispatch({ type: "tool/setTweakMode", payload: mode });
  const tweakForce = useSelector(state => state.tool.tweakForce || 1);
  const tweakFidelity = useSelector(state => state.tool.tweakFidelity || 50);
  const tweakModes = [
    { key: "move", label: "Move objects", icon: <FaArrowsAlt /> },
    { key: "moveToCursor", label: "Move to center of cursor", icon: <FaBullseye /> },
    { key: "shrink", label: "Shrink objects", icon: <FaCompressAlt /> },
    { key: "randomMove", label: "Move in random directions", icon: <FaRandom /> },
    { key: "rotate", label: "Rotate objects", icon: <FaSyncAlt /> },
    { key: "duplicate", label: "Duplicate objects", icon: <FaClone /> },
    { key: "push", label: "Push", icon: <FaArrowCircleUp /> },
    { key: "shrinkInset", label: "Shrink inset", icon: <FaCompress /> },
    { key: "roughen", label: "Roughen parts", icon: <GiJigsawBox /> },
    { key: "paint", label: "Paint the tool", icon: <GiPaintBrush /> },
    { key: "jitterColor", label: "Jitter the colors", icon: <FaPalette /> },
    { key: "blur", label: "Blur objects", icon: <FaRegDotCircle /> },
    { key: "attract", label: "Attract parts of objects", icon: <FaMagnet /> }
  ];

  return (
    <div className="d-flex flex-row mb-3 top-icons" style={{ alignItems: "center", color: "white" }}>
      {tweakModes.map(mode => (
        <div
          key={mode.key}
          className={`p-2 top-icon${tweakMode === mode.key ? " active" : ""}`}
          title={mode.label}
          style={{
            background: tweakMode === mode.key ? "white" : "none",
            borderRadius: 4,
            cursor: "pointer"
          }}
          onClick={() => setTweakMode(mode.key)}
        >
          {mode.icon}
        </div>
      ))}
      <div className="p-2 value" style={{ display: "flex", alignItems: "center", marginLeft: 12 }}>
        <label htmlFor="tweak-radius">Width:&nbsp;</label>
        <input
          id="tweak-radius"
          type="number"
          min={10}
          max={500}
          value={tweakRadius}
          onChange={e => dispatch(setTweakRadius(Number(e.target.value)))}
          style={{ width: 60 }}
        />
        <span style={{ marginLeft: 4 }}>px</span>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center", marginLeft: 12 }}>
        <label htmlFor="tweak-force">Force:&nbsp;</label>
        <input
          id="tweak-force"
          type="number"
          min={1}
          max={100}
          step={1}
          value={tweakForce}
          onChange={e => dispatch(setTweakForce(Number(e.target.value)))}
          style={{ width: 60 }}
        />
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center", marginLeft: 12 }}>
        <label htmlFor="tweak-Fidelity">Fidelity:&nbsp;</label>
        <input
          id="tweak-Fidelity"
          type="number"
          min={0}
          max={100}
          step={1}
          value={tweakFidelity}
          onChange={e => dispatch(setTweakFidelity(Number(e.target.value)))}
          style={{ width: 60 }}
        />
      </div>
    </div>
  );
}
function PagesTopbar() {
  const dispatch = useDispatch();
  const pages = useSelector(state => state.tool.pages || []);
  const currentPageIndex = useSelector(state => state.tool.currentPageIndex || 0);
  const pageMargin = useSelector(state => state.tool.pageMargin || { top: 0, right: 40, bottom: 40, left: 40 });


  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleAddPage = () => {
    dispatch(createNewPage());
  };

  const handleEditClick = (idx, currentName) => {
    setEditingIndex(idx);
    setEditValue(currentName);
  };

  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleEditSave = (idx) => {
    if (editValue.trim()) {
      dispatch(renamePage({ pageIndex: idx, newName: editValue }));
    }
    setEditingIndex(null);
    setEditValue("");
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleMarginChange = (side, value) => {
    dispatch(setPageMargin({ [side]: Number(value) }));
  };

  const handleMovePage = (direction) => {

    const newIndex = currentPageIndex + direction;
    if (newIndex < 0 || newIndex >= pages.length) return;
    dispatch({ type: "tool/movePage", payload: { from: currentPageIndex, to: newIndex } });
  };
  return (
    <div className="d-flex flex-row mb-3 top-icons" style={{ alignItems: "center", color: "white" }}>
      <span style={{ marginRight: 12, fontWeight: 500 }}>
        Pages: {pages.length > 0 ? pages.length : 1}
      </span>
      <button
        onClick={handleAddPage}
        style={{
          padding: "7px",
          margin: "5px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center"
        }}
        title="Add Page"
      >
        <FaPlus style={{ marginRight: 4 }} />
        Add Page
      </button>
      <span style={{ marginLeft: 16 }}>
        {pages.length > 0 && `Current: Page ${currentPageIndex + 1}`}
      </span>
      {pages.map((page, idx) => (
        <span key={page.id} style={{ display: "flex", alignItems: "center", margin: "0 4px" }}>
          <button
            style={{
              padding: "4px 8px",
              background: idx === currentPageIndex ? "white" : "#222",
              color: "black",
              border: "1px solid #444",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: 4
            }}
            onClick={() => dispatch(selectPage(idx))}
          >
            {editingIndex === idx ? (
              <input
                type="text"
                value={editValue}
                onChange={handleEditChange}
                onBlur={() => handleEditSave(idx)}
                onKeyDown={e => {
                  if (e.key === "Enter") handleEditSave(idx);
                  if (e.key === "Escape") handleEditCancel();
                }}
                autoFocus
                style={{ width: 70 }}
              />
            ) : (
              page.name
            )}
          </button>
          {editingIndex === idx ? (
            <>
              <FaCheck
                style={{ color: "#0f0", cursor: "pointer", marginRight: 2 }}
                onClick={() => handleEditSave(idx)}
                title="Save"
              />
              <FaTimes
                style={{ color: "#f00", cursor: "pointer" }}
                onClick={handleEditCancel}
                title="Cancel"
              />
            </>
          ) : (
            <FaEdit
              style={{ color: "#fff", cursor: "pointer" }}
              onClick={() => handleEditClick(idx, page.name)}
              title="Edit Page Label"
            />
          )}
        </span>
      ))}
      <div style={{ display: "flex", alignItems: "center", marginLeft: 16 }}>
        <label style={{ marginRight: 8 }}>Margin:</label>
        <label style={{ marginRight: 4 }}>T</label>
        <input
          type="number"
          value={pageMargin.top}
          min={0}
          style={{ width: 50, marginRight: 4 }}
          onChange={e => handleMarginChange("top", e.target.value)}
        />
        <label style={{ marginRight: 4 }}>R</label>
        <input
          type="number"
          value={pageMargin.right}
          min={0}
          style={{ width: 50, marginRight: 4 }}
          onChange={e => handleMarginChange("right", e.target.value)}
        />
        <label style={{ marginRight: 4 }}>B</label>
        <input
          type="number"
          value={pageMargin.bottom}
          min={0}
          style={{ width: 50, marginRight: 4 }}
          onChange={e => handleMarginChange("bottom", e.target.value)}
        />
        <label style={{ marginRight: 4 }}>L</label>
        <input
          type="number"
          value={pageMargin.left}
          min={0}
          style={{ width: 50 }}
          onChange={e => handleMarginChange("left", e.target.value)}
        />
      </div>
      <button
        onClick={() => handleMovePage(-1)}
        disabled={currentPageIndex === 0}
        style={{
          marginLeft: 8,
          background: "none",
          border: "none",
          color: currentPageIndex === 0 ? "#888" : "#fff",
          cursor: currentPageIndex === 0 ? "not-allowed" : "pointer"
        }}
        title="Move Page Backward"
      >
        <FaArrowLeft />
      </button>
      <button
        onClick={() => handleMovePage(1)}
        disabled={currentPageIndex === pages.length - 1}
        style={{
          marginLeft: 4,
          background: "none",
          border: "none",
          color: currentPageIndex === pages.length - 1 ? "#888" : "#fff",
          cursor: currentPageIndex === pages.length - 1 ? "not-allowed" : "pointer"
        }}
        title="Move Page Forward"
      >
        <FaArrowRight />
      </button>
    </div>
  );
}
function EraserTopbar() {
  const dispatch = useDispatch();
  const eraserMode = useSelector((state) => state.tool.eraserMode || "delete");
  const eraserWidth = useSelector((state) => state.tool.eraserWidth || 10);
  const eraserThinning = useSelector((state) => state.tool.eraserThinning || 0);
  const eraserCaps = useSelector((state) => state.tool.eraserCaps || 0);
  const eraserTremor = useSelector((state) => state.tool.eraserTremor || 0);
  const eraserMass = useSelector((state) => state.tool.eraserMass || 0);

  const handleModeChange = (e) => {
    dispatch(setEraserMode(e.target.value));
  };

  const handleWidthChange = (e) => {
    dispatch(setEraserWidth(Number(e.target.value)));
  };

  const handleThinningChange = (e) => {
    dispatch(setEraserThinning(Number(e.target.value)));
  };

  const handleEraserCaps = (e) => {
    dispatch(setEraserCaps(Number(e.target.value)));
  }

  const handleEraserTremor = (e) => {
    dispatch(setEraserTremor(Number(e.target.value)));
  }

  const handleEraserMass = (e) => {
    dispatch(setEraserMass(Number(e.target.value)));
  }

  return (
    <div className="d-flex flex-row mb-3 top-icons" style={{ alignItems: "center", color: "white" }}>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Mode:&nbsp;</label>
        <select
          value={eraserMode}
          onChange={handleModeChange}
          style={{ padding: "0px", borderRadius: "4px", height: "30px" }}
        >
          <option value="delete">Delete Objects</option>
          <option value="cut">Cut Out from Paths/Objects</option>
          <option value="clip">Clip from Objects</option>
        </select>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Width:&nbsp;</label>
        <input
          type="range"
          min={1}
          max={100}
          value={eraserWidth}
          onChange={handleWidthChange}
          style={{ width: "120px" }}
        />
        <span style={{ marginLeft: 8 }}>{eraserWidth}px</span>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Thinning:&nbsp;</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={eraserThinning}
          onChange={handleThinningChange}
          style={{ width: "120px" }}
        />
        <span style={{ marginLeft: 8 }}>{eraserThinning}</span>
      </div>
      <div className="p-2 value" style={{ display: 'flex', alignItems: 'center' }}>
        <label>Caps:&nbsp;</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={eraserCaps}
          onChange={handleEraserCaps}
          style={{ width: "120px" }}
        />
        <span style={{ marginLeft: 8 }}>{eraserCaps}</span>
      </div>
      <div className="p-2 value" style={{ display: 'flex', alignItems: 'center' }}>
        <label>Tremor:&nbsp;</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={eraserTremor}
          onChange={handleEraserTremor}
          style={{ width: "120px" }}
        />
        <span style={{ marginLeft: 8 }}>{eraserTremor}</span>
      </div>
      <div className="p-2 value" style={{ display: 'flex', alignItems: 'center' }}>
        <label>Mass:&nbsp;</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={eraserMass}
          onChange={handleEraserMass}
          style={{ width: "120px" }}
        />
        <span style={{ marginLeft: 8 }}>{eraserMass}</span>
      </div>
      {/* <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <span>
          {eraserMode === "delete" && "Click shapes to delete them."}
          {eraserMode === "cut" && "Draw over shapes to erase them completely."}
          {eraserMode === "clip" && "Draw to clip from objects (default eraser behavior)."}
        </span>
      </div> */}
    </div>
  );
}
export function DropperTopbar() {
  const dispatch = useDispatch();
  const dropperMode = useSelector((state) => state.tool.dropperMode || "pick");
  const pickedColor = useSelector((state) => state.tool.pickedColor);
  const dropperTarget = useSelector(state => state.tool.dropperTarget || "stroke");

  const assignAverage = useSelector(state => state.tool.assignAverage);
  const altInverse = useSelector(state => state.tool.altInverse);
  const handleModeChange = (e) => {
    dispatch(setDropperMode(e.target.value));
  };
  const handleAssignAverageChange = (e) => {
    dispatch(setAssignAverage(e.target.checked));
  };
  const handleAltInverse = (e) => {
    dispatch(setAltInverse(e.target.value));
  }
  return (
    <div className="d-flex flex-row mb-3 top-icons" style={{ alignItems: "center", color: "white" }}>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Dropper Mode:&nbsp;</label>
        <select value={dropperMode} onChange={handleModeChange} style={{ padding: "0px", borderRadius: "4px", height: "30px" }}>
          <option value="pick">Pick Color</option>
          <option value="assign">Assign Color</option>
        </select>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Picked Color:&nbsp;</label>
        <span style={{
          display: "inline-block",
          width: 24,
          height: 24,
          background: pickedColor || "#fff",
          border: "1px solid #ccc",
          verticalAlign: "middle"
        }} />
        <span style={{ marginLeft: 8 }}>{pickedColor || "None"}</span>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Assign to:&nbsp;</label>
        <select value={dropperTarget} onChange={e => dispatch(setDropperTarget(e.target.value))}>
          <option value="fill">Fill</option>
          <option value="stroke">Stroke</option>
        </select>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>
          Assign Average Color (tint)
        </label>
        <input
          type="checkbox"
          checked={assignAverage}
          onChange={handleAssignAverageChange}
        />
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>
          Alt Inverse
        </label>
        <input
          type="checkbox"
          checked={altInverse}
          onChange={handleAltInverse}
        />
      </div>
    </div>
  );
}
function ZoomTopbar({ zoomLevel, onZoomIn, onZoomOut, onSetZoom, onZoomSelected, onZoomDrawing, onZoomPage, onZoomPageWidth, onZoomCenterPage, onZoomPrevious, onZoomNext }) {
  return (
    <div className="d-flex flex-row mb-3 top-icons" style={{ alignItems: "center", color: "white" }}>
      <button
        onClick={onZoomIn}
        style={{
          padding: "7px",
          margin: "5px",
          background: "none",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        title="Zoom In"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        style={{
          padding: "7px",
          margin: "5px",
          background: "none",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        title="Zoom Out"
      >
        -
      </button>
      {/* Ratio Buttons */}
      <button
        onClick={() => onSetZoom(1)}
        style={{
          padding: "7px",
          margin: "5px",
          background: zoomLevel === 1 ? "#0056b3" : "none",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        title="Zoom 1:1"
      >
        1:1
      </button>
      <button
        onClick={() => onSetZoom(0.5)}
        style={{
          padding: "7px",
          margin: "5px",
          background: zoomLevel === 0.5 ? "#0056b3" : "none",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        title="Zoom 1:2"
      >
        1:2
      </button>
      <button
        onClick={() => onSetZoom(2)}
        style={{
          padding: "7px",
          margin: "5px",
          background: zoomLevel === 2 ? "#0056b3" : "none",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        title="Zoom 2:1"
      >
        2:1
      </button>
      <button
        onClick={onZoomDrawing}
        style={{
          padding: "7px",
          margin: "5px",
          background: "none",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        title="Zoom Drawing"
      >
        <FaExpand />
      </button>
      <button
        onClick={onZoomSelected}
        style={{
          padding: "7px",
          margin: "5px",
          background: "none",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        title="Zoom to Selected"
      >
        <FaSearchPlus />
      </button>
      <button
        onClick={onZoomPage}
        style={{
          padding: "7px",
          margin: "5px",
          background: "none",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        title="Zoom Page"
      >
        <FaRegFile />
      </button>
      <button
        onClick={onZoomPageWidth}
        style={{
          padding: "7px",
          margin: "5px",
          background: "none",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        title="Zoom Page Width"
      >
        <FaArrowsAltH />
      </button>
      <button
        onClick={onZoomCenterPage}
        style={{
          padding: "7px",
          margin: "5px",
          background: "none",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        title="Zoom Center Page"
      >
        <FaRegDotCircle />
      </button>
      <button
        onClick={onZoomPrevious}
        style={{
          padding: "7px",
          margin: "5px",
          background: "none",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        title="Zoom Previous"
      >
        <FaUndo />
      </button>
      <button
        onClick={onZoomNext}
        style={{
          padding: "7px",
          margin: "5px",
          background: "none",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        title="Zoom Next"
      >
        <FaRedo />
      </button>
      <span style={{ marginLeft: "10px", color: "white" }}>
        Zoom: {zoomLevel.toFixed(2)}x
      </span>
    </div>
  );
}
function GradientTopbar() {
  const dispatch = useDispatch();
  const gradientType = useSelector(state => state.tool.gradientType || "linear");
  const selectedShapeId = useSelector(state => state.tool.selectedShapeId);
  const [repeat, setRepeat] = useState("none");
  const [applyTo, setApplyTo] = useState("fill");
  console.log("apply to", applyTo);
  gradientTarget: applyTo
  const shapes = useSelector(
    state => state.tool.layers[state.tool.selectedLayerIndex].shapes || []
  );
  const selectedShape = shapes.find(s => s.id === selectedShapeId);

  const handleGradientTypeChange = (e) => {
    dispatch(setGradientType(e.target.value));
  };

  const handleStartChange = (axis, value) => {
    if (!selectedShape) return;
    dispatch(updateShapePosition({
      id: selectedShapeId,
      [applyTo]: {
        ...selectedShape[applyTo],
        start: {
          ...selectedShape[applyTo]?.start,
          [axis]: parseFloat(value)
        }
      },
      gradientTarget: applyTo,
    }));
  };

  const handleEndChange = (axis, value) => {
    if (!selectedShape) return;
    dispatch(updateShapePosition({
      id: selectedShapeId,
      [applyTo]: {
        ...selectedShape[applyTo],
        end: {
          ...selectedShape[applyTo].end,
          [axis]: parseFloat(value)
        }
      },
      gradientTarget: applyTo,
    }));
  };

  const handleColorChange = (idx, color) => {
    if (!selectedShape) return;
    const newColors = selectedShape[applyTo].colors.map((stop, i) =>
      i === idx ? { ...stop, color } : stop
    );
    dispatch(updateShapePosition({
      id: selectedShapeId,
      [applyTo]: {
        ...selectedShape[applyTo],
        colors: newColors
      },
      gradientTarget: applyTo,
    }));
  };

  const handlePosChange = (idx, pos) => {
    if (!selectedShape) return;
    const newColors = selectedShape[applyTo].colors.map((stop, i) =>
      i === idx ? { ...stop, pos: parseFloat(pos) } : stop
    );
    dispatch(updateShapePosition({
      id: selectedShapeId,
      [applyTo]: {
        ...selectedShape[applyTo],
        colors: newColors
      },
      gradientTarget: applyTo,
    }));
  };

  const handleAddStop = () => {
    if (!selectedShape) return;
    const newColors = [
      ...selectedShape[applyTo].colors,
      { color: "#000000", pos: 0.5 }
    ];
    dispatch(updateShapePosition({
      id: selectedShapeId,
      [applyTo]: {
        ...selectedShape[applyTo],
        colors: newColors
      },
      gradientTarget: applyTo,
    }));
  };

  const handleRemoveStop = (idx) => {
    if (!selectedShape) return;
    if (selectedShape[applyTo].colors.length <= 2) return;
    const newColors = selectedShape[applyTo].colors.filter((_, i) => i !== idx);
    dispatch(updateShapePosition({
      id: selectedShapeId,
      [applyTo]: {
        ...selectedShape[applyTo],
        colors: newColors
      },
      gradientTarget: applyTo,
    }));
  };

  const handleRadialCenterXChange = (value) => {
    if (!selectedShape) return;
    dispatch(updateShapePosition({
      id: selectedShapeId,
      [applyTo]: {
        ...selectedShape[applyTo],
        center: {
          ...selectedShape[applyTo].center,
          x: parseFloat(value)
        }
      },
      gradientTarget: applyTo,
    }));
  };

  const handleRadialCenterYChange = (value) => {
    if (!selectedShape) return;
    dispatch(updateShapePosition({
      id: selectedShapeId,
      [applyTo]: {
        ...selectedShape[applyTo],
        center: {
          ...selectedShape[applyTo].center,
          y: parseFloat(value)
        }
      },
      gradientTarget: applyTo,
    }));
  };

  const handleRadialRadiusChange = (value) => {
    if (!selectedShape) return;
    dispatch(updateShapePosition({
      id: selectedShapeId,
      [applyTo]: {
        ...selectedShape[applyTo],
        radius: parseFloat(value)
      },
      gradientTarget: applyTo,
    }));
  };

  const handleRadialColorStopChange = (idx, color) => {
    if (!selectedShape) return;
    const newColors = selectedShape[applyTo].colors.map((stop, i) =>
      i === idx ? { ...stop, color } : stop
    );
    dispatch(updateShapePosition({
      id: selectedShapeId,
      [applyTo]: {
        ...selectedShape[applyTo],
        colors: newColors
      },
      gradientTarget: applyTo,
    }));
  };

  const handleRadialColorStopPosChange = (idx, pos) => {
    if (!selectedShape) return;
    const newColors = selectedShape[applyTo].colors.map((stop, i) =>
      i === idx ? { ...stop, pos: parseFloat(pos) } : stop
    );
    dispatch(updateShapePosition({
      id: selectedShapeId,
      [applyTo]: {
        ...selectedShape[applyTo],
        colors: newColors
      },
      gradientTarget: applyTo,
    }));
  };
  return (
    <div className="d-flex flex-row mb-3 top-icons" style={{ alignItems: "center", color: "white", overflow: 'scroll' }}>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Type:&nbsp;</label>
        <select value={gradientType} onChange={handleGradientTypeChange} style={{ height: "30px" }}>
          <option value="linear">Linear Gradient</option>
          <option value="radial">Radial Gradient</option>
        </select>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Apply:&nbsp;</label>
        <select
          value={applyTo}
          onChange={e => {
            const value = e.target.value;
            setApplyTo(value);


            if (
              value === "stroke" &&
              selectedShape &&
              (!selectedShape.stroke || !selectedShape.stroke.type)
            ) {
              dispatch(updateShapePosition({
                id: selectedShapeId,
                stroke: {
                  type: "linear-gradient",
                  start: { x: 0, y: 0 },
                  end: { x: 100, y: 0 },
                  colors: [
                    { color: "#000000", pos: 0 },
                    { color: "#ffffff", pos: 1 }
                  ]
                },
                gradientTarget: "stroke"
              }));
            }

            if (
              value === "fill" &&
              selectedShape &&
              (!selectedShape.fill || !selectedShape.fill.type)
            ) {
              dispatch(updateShapePosition({
                id: selectedShapeId,
                fill: {
                  type: "linear-gradient",
                  start: { x: 0, y: 0 },
                  end: { x: 100, y: 0 },
                  colors: [
                    { color: "#000000", pos: 0 },
                    { color: "#ffffff", pos: 1 }
                  ]
                },
                gradientTarget: "fill"
              }));
            }
          }}
          style={{ height: "30px" }}
        >
          <option value="fill">Fill</option>
          <option value="stroke">Stroke</option>
        </select>
      </div>
      {selectedShape && selectedShape[applyTo]?.type === "linear-gradient" && selectedShape[applyTo].start && selectedShape[applyTo].end && (
        <>
          <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
            <label>StartX:</label>
            <input
              type="number"
              step={10}
              value={selectedShape[applyTo].start.x}
              onChange={e => handleStartChange("x", e.target.value)}
              style={{ width: 60, marginLeft: 4, marginRight: 8 }}
            />
            <label>Y:</label>
            <input
              type="number"
              step={10}
              value={selectedShape[applyTo].start.y}
              onChange={e => handleStartChange("y", e.target.value)}
              style={{ width: 60, marginLeft: 4 }}
            />
          </div>
          <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
            <label>EndX:</label>
            <input
              type="number"
              step={10}
              value={selectedShape[applyTo].end.x}
              onChange={e => handleEndChange("x", e.target.value)}
              style={{ width: 60, marginLeft: 4, marginRight: 8 }}
            />
            <label>Y:</label>
            <input
              type="number"
              step={10}
              value={selectedShape[applyTo].end.y}
              onChange={e => handleEndChange("y", e.target.value)}
              style={{ width: 60, marginLeft: 4 }}
            />
          </div>
          <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
            <label>Color:</label>
            {selectedShape[applyTo].colors.map((stop, idx) => (
              <span key={idx} style={{ marginLeft: 8, display: "flex", alignItems: "center" }}>
                <input
                  type="color"
                  value={stop.color}
                  onChange={e => handleColorChange(idx, e.target.value)}
                  style={{ marginRight: 4 }}
                />
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={stop.pos}
                  onChange={e => handlePosChange(idx, e.target.value)}
                  style={{ width: 50, marginRight: 4 }}
                />
                {selectedShape[applyTo].colors.length > 2 && (
                  <button onClick={() => handleRemoveStop(idx)} style={{ marginRight: 4 }}>✕</button>
                )}
              </span>
            ))}
            <button onClick={handleAddStop} style={{ marginLeft: 8, width: '150px' }}>+ Add Stop</button>
          </div>
          <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
            <label>Repeat:&nbsp;</label>
            <select value={repeat} onChange={e => {
              setRepeat(e.target.value);
              if (selectedShape) {
                dispatch(updateShapePosition({
                  id: selectedShapeId,
                  [applyTo]: {
                    ...selectedShape[applyTo],
                    repeat: e.target.value,
                  },
                  gradientTarget: applyTo,
                }));
              }
            }} style={{ height: "30px" }}>
              <option value="none">None</option>
              <option value="reflected">Reflected</option>
              <option value="direct">Direct</option>
            </select>
          </div>
        </>
      )}
      {selectedShape && selectedShape[applyTo]?.type === "radial-gradient" && selectedShape[applyTo].center && typeof selectedShape[applyTo].radius === "number" && (
        <>
          <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
            <label>CenterX:</label>
            <input
              type="number"
              step={10}
              value={selectedShape[applyTo].center.x}
              onChange={e => handleRadialCenterXChange(e.target.value)}
            />
            <label>Y:</label>
            <input
              type="number"
              step={10}
              value={selectedShape[applyTo].center.y}
              onChange={e => handleRadialCenterYChange(e.target.value)}
            />
          </div>
          <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
            <label>Radius:</label>
            <input
              type="number"
              step={5}
              value={selectedShape[applyTo].radius}
              onChange={e => handleRadialRadiusChange(e.target.value)}
            />
          </div>
          <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
            <label>Color:</label>
            {selectedShape[applyTo].colors.map((stop, idx) => (
              <span key={idx} style={{ marginLeft: 8, display: "flex", alignItems: "center" }}>
                <input
                  type="color"
                  value={stop.color}
                  onChange={e => handleRadialColorStopChange(idx, e.target.value)}
                />
                <input
                  type="number"
                  value={stop.pos}
                  onChange={e => handleRadialColorStopPosChange(idx, e.target.value)}
                />
                {selectedShape[applyTo].colors.length > 2 && (
                  <button onClick={() => handleRemoveStop(idx)} style={{ marginRight: 4 }}>✕</button>
                )}
              </span>
            ))}
            <button onClick={handleAddStop} style={{ marginLeft: 8, width: '150px' }}>+ Add Stop</button>
          </div>
        </>
      )}
    </div>
  );
}
function PaintBucketTopbar() {
  const fillBy = useSelector(state => state.tool.paintBucketFillBy);
  const threshold = useSelector(state => state.tool.paintBucketThreshold);
  const growSink = useSelector(state => state.tool.paintBucketGrowSink);
  const closeGaps = useSelector(state => state.tool.paintBucketCloseGaps || "none");
  const dispatch = useDispatch();
  return (
    <div className="d-flex flex-row mb-3 top-icons" style={{ alignItems: "center", color: "white" }}>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label htmlFor="fillBy">Fill By:&nbsp;</label>
        <select
          id="fillBy"
          value={fillBy}
          onChange={e => dispatch(setPaintBucketFillBy(e.target.value))}
          style={{ height: "30px" }}
        >
          <option value="visible colors">Visible Colors</option>
          <option value="red">Red</option>
          <option value="green">Green</option>
          <option value="blue">Blue</option>
          <option value="hue">Hue</option>
          <option value="saturation">Saturation</option>
          <option value="lightness">Lightness</option>
          <option value="alpha">Alpha</option>
        </select>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label htmlFor="threshold">Threshold:&nbsp;</label>
        <input
          id="threshold"
          type="number"
          min={0}
          max={255}
          value={threshold}
          onChange={e => dispatch(setPaintBucketThreshold(Number(e.target.value)))}
          style={{ width: 60, marginLeft: 4 }}
        />
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label htmlFor="growSink">Grow/Sink:&nbsp;</label>
        <input
          id="growSink"
          type="number"
          min={-100}
          max={100}
          value={growSink}
          onChange={e => dispatch(setPaintBucketGrowSink(Number(e.target.value)))}
          style={{ width: 60, marginLeft: 4 }}
        />
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label htmlFor="closeGaps">Close gaps:&nbsp;</label>
        <select
          id="closeGaps"
          value={closeGaps}
          onChange={e => dispatch(setPaintBucketCloseGaps(e.target.value))}
          style={{ height: "30px" }}
        >
          <option value="none">None</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
    </div>
  );
}
function MeasurementTopbar() {
  const dispatch = useDispatch();
  const fontSize = useSelector(state => state.tool.measurementFontSize || 16);
  const precision = useSelector(state => state.tool.measurementPrecision || 2);
  const scale = useSelector(state => state.tool.measurementScale || 100);
  const unit = useSelector(state => state.tool.measurementUnit || "px");
  const measureOnlySelected = useSelector(state => state.tool.measureOnlySelected);
  const ignoreFirstLast = useSelector(state => state.tool.ignoreFirstLast);
  const showMeasureBetween = useSelector(state => state.tool.showMeasureBetween);
  const showHiddenIntersections = useSelector(state => state.tool.showHiddenIntersections);
  const measureAllLayers = useSelector(state => state.tool.measureAllLayers);
  const reverseMeasure = useSelector(state => state.tool.reverseMeasure);
  const toGuides = useSelector(state => state.tool.toGuides);
  const phantomMeasure = useSelector(state => state.tool.phantomMeasure);
  const markDimension = useSelector(state => state.tool.markDimension);
  const measurementOffset = useSelector(state => state.tool.measurementOffset || 16);
  const convertToItem = useSelector(state => state.tool.convertToItem);

  const handleFontSizeChange = (e) => {
    dispatch({ type: "tool/setMeasurementFontSize", payload: Number(e.target.value) });
  };
  const handlePrecisionChange = (e) => {
    dispatch({ type: "tool/setMeasurementPrecision", payload: Number(e.target.value) });
  };
  const handleScaleChange = (e) => {
    dispatch({ type: "tool/setMeasurementScale", payload: Number(e.target.value) });
  };
  const handleUnitChange = (e) => {
    dispatch({ type: "tool/setMeasurementUnit", payload: e.target.value });
  };

  const handleOptionChange = (type, value) => {
    dispatch({ type, payload: value });
  };
  const handleOffsetChange = (e) => {
    dispatch({ type: "tool/setMeasurementOffset", payload: Number(e.target.value) });
  };

  return (
    <div className="d-flex flex-row top-icons" style={{ alignItems: "center", color: "white", overflow: 'scroll' }}>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Font:&nbsp;</label>
        <input
          type="number"
          min={1}
          max={200}
          value={fontSize}
          onChange={handleFontSizeChange}
          style={{ width: 60 }}
        />
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Precision:&nbsp;</label>
        <input
          type="number"
          min={0}
          max={10}
          value={precision}
          onChange={handlePrecisionChange}
          style={{ width: 60 }}
        />
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Scale:&nbsp;</label>
        <input
          type="number"
          min={1}
          max={1000}
          value={scale}
          onChange={handleScaleChange}
          style={{ width: 60 }}
        />
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Units:&nbsp;</label>
        <select value={unit} onChange={handleUnitChange} style={{ height: "30px" }}>
          <option value="px">px</option>
          <option value="pc">pc</option>
          <option value="mm">mm</option>
          <option value="pt">pt</option>
          <option value="in">in</option>
          <option value="cm">cm</option>
        </select>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={measureOnlySelected}
          onChange={e => handleOptionChange("tool/setMeasureOnlySelected", e.target.checked)}
          id="measureOnlySelected"
        />
        <label htmlFor="measureOnlySelected" style={{ marginLeft: 4 }}>
          <FaMousePointer title="Measure only selected" />
        </label>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={showMeasureBetween}
          onChange={e => dispatch({ type: "tool/setShowMeasureBetween", payload: e.target.checked })}
          id="showMeasureBetween"
        />
        <label htmlFor="showMeasureBetween" style={{ marginLeft: 4 }}>
          <FaArrowsAltH title="Show measure between items" />
        </label>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={ignoreFirstLast}
          onChange={e => dispatch(setIgnoreFirstLast(e.target.checked))}
          id="ignoreFirstLast"
        />
        <label htmlFor="ignoreFirstLast" style={{ marginLeft: 4 }}>
          <FaStepForward title="Ignore first and last" />
        </label>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={showHiddenIntersections}
          onChange={e => handleOptionChange("tool/setShowHiddenIntersections", e.target.checked)}
          id="showHiddenIntersections"
        />
        <label htmlFor="showHiddenIntersections" style={{ marginLeft: 4 }}>
          <FaEyeSlash title="Show hidden intersections" />
        </label>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={measureAllLayers}
          onChange={e => handleOptionChange("tool/setMeasureAllLayers", e.target.checked)}
          id="measureAllLayers"
        />
        <label htmlFor="measureAllLayers" style={{ marginLeft: 4 }}>
          <FaLayerGroup title="Measure all layers" />
        </label>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={reverseMeasure}
          onChange={e => dispatch(setReverseMeasure(e.target.checked))}
          id="reverseMeasure"
        />
        <label htmlFor="reverseMeasure" style={{ marginLeft: 4 }}>
          <VscDebugReverseContinue title="Reverse measure" />
        </label>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={toGuides}
          onChange={e => dispatch(setToGuides(e.target.checked))}
          id="toGuides"
        />
        <label htmlFor="toGuides" style={{ marginLeft: 4 }}>
          Guides
        </label>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={phantomMeasure}
          onChange={e => dispatch(setPhantomMeasure(e.target.checked))}
          id="phantomMeasure"
        />
        <label htmlFor="phantomMeasure" style={{ marginLeft: 4 }}>
          Phantom
        </label>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={markDimension}
          onChange={e => dispatch(setMarkDimension(e.target.checked))}
          id="markDimension"
        />
        <label htmlFor="markDimension" style={{ marginLeft: 4 }}>
          Mark
        </label>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Offset:&nbsp;</label>
        <input
          type="number"
          min={0}
          max={100}
          value={measurementOffset}
          onChange={handleOffsetChange}
          style={{ width: 60 }}
        />
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={convertToItem}
          onChange={e => dispatch(setConvertToItem(e.target.checked))}
          id="convertToItem"
        />
        <label htmlFor="convertToItem" style={{ marginLeft: 4 }}>
          Convert to item
        </label>
      </div>
    </div>
  );
}
function ConnectorTopbar() {
  const dispatch = useDispatch();
  const connectorMode = useSelector(state => state.tool.connectorMode || "avoid");
  const orthogonal = useSelector(state => state.tool.connectorOrthogonal || false);
  const curvature = useSelector(state => state.tool.connectorCurvature ?? 0);
  const spacing = useSelector(state => state.tool.connectorSpacing ?? 0);
  const length = useSelector(state => state.tool.connectorLength ?? 0);
  const lineStyle = useSelector(state => state.tool.connectorLineStyle || "solid");
  const noOverlap = useSelector(state => state.tool.connectorNoOverlap);
  const setMode = (mode) => {
    dispatch({ type: "tool/setConnectorMode", payload: mode });
  };
  const setOrthogonal = (value) => {
    dispatch({ type: "tool/setConnectorOrthogonal", payload: value });
  };
  const setCurvature = (value) => {
    dispatch({ type: "tool/setConnectorCurvature", payload: Number(value) });
  };
  const setSpacing = (value) => {
    dispatch(setConnectorSpacing(Number(value)));
  };
  const setLength = (value) => {
    dispatch(setConnectorLength(Number(value)));
  };
  const setLineStyle = (value) => {
    dispatch({ type: "tool/setConnectorLineStyle", payload: value });
  };
  const setNoOverlap = (value) => {
    dispatch({ type: "tool/setConnectorNoOverlap", payload: value });
  };
  return (
    <div className="d-flex flex-row mb-3 top-icons" style={{ alignItems: "center", color: "white" }}>
      <div className="p-2 top-icon"
        style={{ background: connectorMode === "avoid" ? "#007bff" : "none", borderRadius: 4 }}
        onClick={() => setMode("avoid")}
        title="Make connectors avoid selected objects"
      >
        <FaVectorSquare size={22} />
      </div>
      <div className="p-2 top-icon"
        style={{ background: connectorMode === "ignore" ? "#007bff" : "none", borderRadius: 4 }}
        onClick={() => setMode("ignore")}
        title="Make connectors ignore selected objects"
      >
        <FaBan size={22} />
      </div>
      <div className="p-2 top-icon"
        style={{ background: orthogonal ? "#007bff" : "none", borderRadius: 4 }}
        onClick={() => setOrthogonal(!orthogonal)}
        title="Make connectors orthogonal"
      >
        <MdOutlineAltRoute size={22} />
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center", marginLeft: 12 }}>
        <label htmlFor="connector-curvature" style={{ marginRight: 6 }}>Curvature:</label>
        <input
          id="connector-curvature"
          type="number"
          min={0}
          max={200}
          step={1}
          value={curvature}
          onChange={e => setCurvature(e.target.value)}
          style={{ width: 60 }}
          title="The amount of connector's curvature"
        />
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center", marginLeft: 12 }}>
        <label htmlFor="connector-spacing" style={{ marginRight: 6 }}>Spacing:</label>
        <input
          id="connector-spacing"
          type="number"
          min={0}
          max={200}
          step={1}
          value={spacing}
          onChange={e => setSpacing(e.target.value)}
          style={{ width: 60 }}
          title="The amount of connector's spacing"
        />
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center", marginLeft: 12 }}>
        <label htmlFor="connector-length" style={{ marginRight: 6 }}>Length:</label>
        <input
          id="connector-length"
          type="number"
          min={-200}
          max={200}
          step={1}
          value={length}
          onChange={e => setLength(e.target.value)}
          style={{ width: 60 }}
          title="The length of the connector (0 = auto)"
        />
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center", marginLeft: 12 }}>
        <label htmlFor="connector-line-style" style={{ marginRight: 6 }}>Line Style:</label>
        <select
          id="connector-line-style"
          value={lineStyle}
          onChange={e => setLineStyle(e.target.value)}
          style={{ width: 80 }}
          title="Connector line style"
        >
          <option value="solid">Line</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>
      <div
        className="p-2 top-icon"
        style={{
          background: noOverlap ? "#007bff" : "none",
          borderRadius: 4,
          border: noOverlap ? "2px solid #007bff" : "1px solid #888",
          cursor: "pointer"
        }}
        onClick={() => setNoOverlap(!noOverlap)}
        title="Do not allow overlapping connectors"
      >
        <FaObjectUngroup size={22} />
      </div>
    </div>
  );
}
function MeshTopbar() {
  const dispatch = useDispatch();
  const meshMode = useSelector((state) => state.tool.meshMode || null);
  const gradientTarget = useSelector((state) => state.tool.gradientTarget || null);
  const meshRows = useSelector((state) => state.tool.meshRows || 2);
  const meshCols = useSelector((state) => state.tool.meshCols || 2);

  const handleMeshModeChange = (mode) => {
    console.log("Dispatching setMeshMode with mode:", mode);
    dispatch({ type: "tool/setMeshMode", payload: mode });
    dispatch({ type: "tool/setGradientTarget", payload: null });
  };

  const handleGradientTargetChange = (target) => {
    if (meshMode === "mesh-gradient" || meshMode === "conical-gradient") {
      console.log("Dispatching setGradientTarget with target:", target);
      dispatch({ type: "tool/setGradientTarget", payload: target });
    } else {
      alert("Please select 'Create Mesh Gradient' or 'Create Conical Gradient' first.");
    }
  };

  return (
    <div className="d-flex flex-row mb-3 top-icons" style={{ alignItems: "center", color: "white" }}>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{ cursor: "pointer", color: meshMode === "mesh-gradient" ? "#00f" : "#fff" }}
          title="Create Mesh Gradient"
          onClick={() => handleMeshModeChange("mesh-gradient")}
        >
          <MdGridOn size={28} />
        </span>
        <span
          style={{ cursor: "pointer", color: meshMode === "conical-gradient" ? "#00f" : "#fff" }}
          title="Create Conical Gradient"
          onClick={() => handleMeshModeChange("conical-gradient")}
        >
          <MdOutlineGradient size={28} />
        </span>
        <span
          style={{ cursor: "pointer", color: gradientTarget === "fill" ? "#00f" : "#fff" }}
          title="Create Gradient in Fill"
          onClick={() => handleGradientTargetChange("fill")}
        >
          <MdOutlineFormatColorFill size={28} />
        </span>
        <span
          style={{ cursor: "pointer", color: gradientTarget === "stroke" ? "#00f" : "#fff" }}
          title="Create Gradient in Stroke"
          onClick={() => handleGradientTargetChange("stroke")}
        >
          <MdOutlineBorderColor size={28} />
        </span>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <label>Rows:&nbsp;</label>
        <input
          type="number"
          min={2}
          max={20}
          value={meshRows}
          onChange={(e) => dispatch({ type: "tool/setMeshRows", payload: Number(e.target.value) })}
          style={{ width: 60 }}
        />
        <label>Columns:&nbsp;</label>
        <input
          type="number"
          min={2}
          max={20}
          value={meshCols}
          onChange={(e) => dispatch({ type: "tool/setMeshCols", payload: Number(e.target.value) })}
          style={{ width: 60 }}
        />
      </div>
    </div>
  );
}
function NodeTopbar() {
  const dispatch = useDispatch();
  const selectedTool = useSelector((state) => state.tool.selectedTool);
  const selectedNodePoints = useSelector(state => state.tool.selectedNodePoints);
  const layers = useSelector(state => state.tool.layers);
  const selectedLayerIndex = useSelector(state => state.tool.selectedLayerIndex);
  const handleInsertNode = () => {
    console.log("Insert Node clicked");
    dispatch(insertNode());
    console.log("Insert Node action dispatched");
  };

  const handleJoinSelectedNodes = () => {
    console.log("Join Selected Nodes clicked");
    dispatch(joinSelectedNodePoints());
  };

  const handleJoinEndNodesWithSegment = () => {
    console.log("Join Selected Endnodes with a New Segment clicked");
    dispatch(joinSelectedEndNodesWithSegment());
  };

  const handleDeleteNode = () => {
    dispatch(clearSelectedNodePoints());
  };
  const handleBreakPathAtNode = () => {
    dispatch({ type: "tool/breakPathAtSelectedNode" });
  }
  const handleSeparatePaths = () => {
    console.log("Separate Selected Paths clicked");
    dispatch({ type: "SEPARATE_SELECTED_PATHS" });
  };

  const handleMakeNodesCorner = () => {
    console.log("Make Selected Nodes Corner clicked");
    dispatch(makeSelectedNodesCorner());
  };

  const handleMakeNodesSmooth = () => {
    console.log("Make Selected Nodes Smooth clicked");
    dispatch(makeSelectedNodesSmooth());
  };

  const handleCurveLine = () => {
    console.log("Curve Line clicked");
    dispatch(makeSelectedNodesCurve());
  }

  const handleStraightLine = () => {
    console.log("Straight Line clicked");
    dispatch(makeSelectedNodesStraight());
  }

  const handleShapeCorner = () => {
    console.log("Make Shape Corner clicked");
    dispatch(makeShapeCorner());
  }


  const handleStrokePath = () => {
    dispatch(setStrokeToPathMode(true));
    dispatch(strokePath());
  };

  const handleMakeNodesSymmetric = () => {
    console.log("Make Selected Nodes Symmetric clicked");
    dispatch(makeSelectedNodesSymmetric());
  };
  let node = null;
  if (selectedNodePoints.length === 1) {
    const { shapeId, index } = selectedNodePoints[0];
    const shape = layers[selectedLayerIndex].shapes.find(s => s.id === shapeId);
    if (shape && Array.isArray(shape.points) && shape.points[index]) {
      node = { ...shape.points[index], shapeId, index };
    }
  }

  const handleNodeCoordChange = (axis, value) => {
    if (!node) return;
    const newPos = { ...node, [axis]: Number(value) };
    dispatch(updateNodePosition({
      shapeId: node.shapeId,
      nodeIndex: node.index,
      newPosition: { x: newPos.x, y: newPos.y }
    }));
  };
  useEffect(() => {
    console.log("Updated selectedTool:", selectedTool);
  }, [selectedTool]);

  return (
    <div className="d-flex flex-row top-icons" style={{ alignItems: "center", color: "white", marginBottom: '20px' }}>
      <div className="p-2 top-icon" onClick={handleInsertNode}>
        <FaPlus size={20} title="Insert Node" />
      </div>

      <div className="p-2 top-icon" onClick={handleJoinSelectedNodes}>
        <FaLink size={20} title="Join Selected Nodes" />
      </div>

      <div className="p-2 top-icon" onClick={handleJoinEndNodesWithSegment}>
        <FaBezierCurve size={20} title="Join Selected Endnodes with a New Segment" />
      </div>

      <div className="p-2 top-icon" onClick={handleSeparatePaths}>
        <FaUnlink size={20} title="Separate Selected Paths" />
      </div>

      <div className="p-2 top-icon" onClick={handleMakeNodesCorner}>
        <FaDrawPolygon size={20} title="Make Selected Nodes Corner" />
      </div>

      <div className="p-2 top-icon" onClick={handleMakeNodesSmooth}>
        <FaBezierCurve size={20} title="Make Selected Nodes Smooth" />
      </div>

      <div className="p-2 top-icon" onClick={handleCurveLine}>
        <FaBezierCurve size={20} title="Make Selected Nodes Curve line" />
      </div>

      <div className="p-2 top-icon" onClick={handleStraightLine}>
        <GiStraightPipe size={20} title="Make Selected Nodes Straight line" />
      </div>

      <div className="p-2 top-icon" onClick={handleShapeCorner}>
        <MdRoundedCorner size={20} title="Make Selected Shapes Rounded Corner" />
      </div>
      <div className="p-2 top-icon" onClick={handleStrokePath}>
        <PiPath size={20} title="Make Strokr to Path" />
      </div>
      <div className="p-2 top-icon" onClick={handleDeleteNode}>
        <FaTimes size={20} title="Delete Node" />
      </div>
      <div className="p-2 top-icon" onClick={handleBreakPathAtNode}>
        <FaCut size={20} title="Break paths at selected node" />
      </div>
      <div className="p-2 top-icon" onClick={handleMakeNodesSymmetric}>
        <MdOutlineVerticalAlignTop size={20} title="Mark Selected Nodes Symmetric" />
      </div>
      <div
        className="p-2 top-icon"
        onClick={() => dispatch(autoSmoothSelectedNodes())}
        title="Mark Selected Nodes Auto-smooth"
      >
        <svg width="20" height="20" viewBox="0 0 20 20">
          <circle cx="5" cy="15" r="2" fill="#333" />
          <circle cx="15" cy="15" r="2" fill="#333" />
          <path d="M5 15 Q10 5 15 15" stroke="#333" strokeWidth="2" fill="none" />
        </svg>
      </div>
      <div
        className="p-2 top-icon"
        onClick={() => dispatch({ type: "tool/addCornerLPE" })}
        title="Add corner LPE"
      >
        <svg width="20" height="20" viewBox="0 0 20 20">
          <circle cx="5" cy="15" r="2" fill="#333" />
          <circle cx="15" cy="15" r="2" fill="#333" />
          <path d="M5 15 Q10 10 15 15" stroke="#333" strokeWidth="2" fill="none" />
          <circle cx="10" cy="10" r="3" fill="#007bff" />
        </svg>
      </div>
      <div
        className="p-2 top-icon"
        onClick={() => dispatch({ type: "tool/objectToPath" })}
        title="Object to Path"
      >
        <FaRegObjectGroup size={20} />
      </div>
      {node && (
        <>
          <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
            <label>X:&nbsp;</label>
            <input
              type="number"
              value={node.x}
              onChange={e => handleNodeCoordChange("x", e.target.value)}
              style={{ width: 70 }}
            />
          </div>
          <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
            <label>Y:&nbsp;</label>
            <input
              type="number"
              value={node.y}
              onChange={e => handleNodeCoordChange("y", e.target.value)}
              style={{ width: 70 }}
            />
          </div>
        </>
      )}
    </div>
  );
}
function PencilTopbar() {
  const dispatch = useDispatch();
  const pencilOption = useSelector((state) => state.tool.pencilOption);
  const pencilSmoothing = useSelector((state) => state.tool.pencilSmoothing);
  const pencilMode = useSelector((state) => state.tool.pencilMode);
  const pencilScale = useSelector((state) => state.tool.pencilScale);
  const brushCaps = useSelector((state) => state.tool.brushCaps);

  const pressureEnabled = useSelector((state) => state.tool.pressureEnabled);
  const pressureMin = useSelector((state) => state.tool.pressureMin);
  const pressureMax = useSelector((state) => state.tool.pressureMax);
  const [caps, setCaps] = useState("round");
  useEffect(() => {
    if (pencilMode === "Spiro Path") {
      dispatch(setPencilSmoothing(50));
    } else if (pencilMode === "Bezier Path" || pencilMode === "BSpline Path") {
      dispatch(setPencilSmoothing(0));
    }
  }, [pencilMode, dispatch]);
  const handleOptionSelect = (option) => {
    dispatch(setPencilOption(option));
  };

  const handleSmoothingChange = (e) => {
    const newSmoothing = parseInt(e.target.value, 10);
    dispatch(setPencilSmoothing(newSmoothing));
  };

  const handleModeSelect = (mode) => {
    dispatch(setPencilMode(mode));
  };

  const handleScaleChange = (newScale) => {
    dispatch(setPencilScale(parseFloat(newScale)));
  };

  const handlePressureChange = (checked) => {
    dispatch(setPressureEnabled(checked));
  };
  const handlePressureMinChange = (e) => {
    dispatch(setPressureMin(parseFloat(e.target.value)));
  };
  const handlePressureMaxChange = (e) => {
    dispatch(setPressureMax(parseFloat(e.target.value)));
  };

  const handleCapsChange = (e) => {
    setCaps(e.target.value);

  };

  return (
    <div className="d-flex flex-row mb-3" style={{ alignItems: "center", color: "white" }}>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center", padding: "0.3rem" }}>
        <label>Shape:&nbsp;</label>
        <select
          value={pencilOption}
          onChange={(e) => handleOptionSelect(e.target.value)}
          style={{ padding: "0px", borderRadius: "4px", height: '30px' }}
          disabled={pressureEnabled}
        >
          <option value="None">None</option>
          <option value="TriangleIn">Triangle In</option>
          <option value="TriangleOut">Triangle Out</option>
          <option value="Ellipse">Ellipse</option>
        </select>
      </div>
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>
          Pinput
        </label>
        <input
          type="checkbox"
          checked={pressureEnabled}
          onChange={e => handlePressureChange(e.target.checked)}
        />
      </div>
      {pressureEnabled && (
        <>
          <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
            <label>Min:</label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={pressureMin}
              onChange={handlePressureMinChange}
              style={{ width: 60, marginLeft: 4, marginRight: 8 }}
            />
            <label>Max:</label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={pressureMax}
              onChange={handlePressureMaxChange}
              style={{ width: 60, marginLeft: 4 }}
            />
          </div>
          <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
            <label>Caps:</label>
            <select
              value={brushCaps}
              onChange={e => dispatch(setBrushCaps(e.target.value))}
            >
              <option value="butt">Butt</option>
              <option value="round">Round</option>
              <option value="square">Square</option>
            </select>
          </div>
        </>
      )}
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Smoothing: </label>
        <input
          type="range"
          min="0"
          max="100"
          value={pencilSmoothing}
          onChange={handleSmoothingChange}
          style={{ width: "150px", margin: "0 10px" }}
        />
        <span>{pencilSmoothing}%</span>
      </div>

      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Mode: &nbsp;</label>
        <select
          value={pencilMode}
          onChange={(e) => handleModeSelect(e.target.value)}
          style={{ padding: "0px", borderRadius: "4px", height: '30px' }}
        >
          <option value="Bezier Path">Bezier Path</option>
          <option value="Spiro Path">Spiro Path</option>
          <option value="BSpline Path">BSpline Path</option>
        </select>
      </div>

      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Scale: </label>
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={pencilScale}
          onChange={(e) => dispatch(setPencilScale(parseFloat(e.target.value)))}
          style={{ width: "150px", margin: "0 10px" }}
        />
        <span>{pencilScale}</span>
      </div>
    </div>
  );
}

function SpiralTopbar() {
  const dispatch = useDispatch();
  const turns = useSelector((state) => state.tool.turns);
  const divergence = useSelector((state) => state.tool.divergence);
  const innerRadius = useSelector((state) => state.tool.innerRadius);
  let selectedShapeId = useSelector((state) => state.tool.selectedShapeId);
  const shapes = useSelector(
    (state) => state.tool.layers[state.tool.selectedLayerIndex].shapes || []
  );
  const selectedShape =
    shapes.find((shape) => shape.id === selectedShapeId) || {};

  const handleFlipHorizontal = () => {
    if (selectedShapeId) {
      const newScaleX = selectedShape.scaleX !== -1 ? -1 : 1;
      dispatch(updateShapePosition({ id: selectedShapeId, scaleX: newScaleX }));
    }
  };

  const handleFlipVertical = () => {
    if (selectedShapeId) {
      const newScaleY = selectedShape.scaleY !== -1 ? -1 : 1;
      dispatch(updateShapePosition({ id: selectedShapeId, scaleY: newScaleY }));
    }
  };

  const handleRotateClockwise = () => {
    if (selectedShapeId) {
      const newRotation = (selectedShape.rotation || 0) + 90;
      dispatch(
        updateShapePosition({ id: selectedShapeId, rotation: newRotation })
      );
    }
  };

  const handleRotateCounterClockwise = () => {
    if (selectedShapeId) {
      const newRotation = (selectedShape.rotation || 0) - 90;
      dispatch(
        updateShapePosition({ id: selectedShapeId, rotation: newRotation })
      );
    }
  };
  const handleSelectAll = () => {
    dispatch(selecteAllShapes());
  };

  const handleDeselectAll = () => {
    dispatch(deselectAllShapes());
  };

  const handleStrokeChange = (e) => {
    const newStrokeWidth = parseFloat(e.target.value);
    if (!isNaN(newStrokeWidth) && selectedShapeId) {
      dispatch(
        updateShapePosition({
          id: selectedShapeId,
          strokeWidth: newStrokeWidth,
        })
      );
    }
  };

  const handleChange = (key, value) => {
    if (selectedShapeId) {

      dispatch(updateSpiralProperties({ key, value: parseFloat(value) || 0 }));
    }
  };
  return (
    <>
      <div className="d-flex flex-row mb-3 top-icons" style={{ alignItems: "center" }}>
        <div className="p-2 top-icon" onClick={handleSelectAll}>
          <TbSelectAll
            data-tooltip-content="Select All"
            data-tooltip-id="tool-top"
          />
        </div>
        {/* <div className="p-2 top-icon">
          <VscLayersActive
            data-tooltip-content="Select All Layer"
            data-tooltip-id="tool-top"
          />
        </div> */}
        <div className="p-2 top-icon" onClick={handleDeselectAll}>
          <TbDeselect
            data-tooltip-content="Deselect"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 top-icon" onClick={handleRotateCounterClockwise}>
          <RiAnticlockwise2Line
            data-tooltip-content="Rotate Anti-CW"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 top-icon" onClick={handleRotateClockwise}>
          <RiClockwise2Line
            data-tooltip-content="Rotate CW"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 top-icon" onClick={handleFlipHorizontal}>
          <TbFlipHorizontal
            data-tooltip-content="Flip Horizontal"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 top-icon" onClick={handleFlipVertical}>
          <TbFlipVertical
            data-tooltip-content="Flip Vertical"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="Turns">Turns: &nbsp;</label>
          <input
            type="number"
            name="turns"
            id="turns"
            step={1}
            value={selectedShape.turns || turns}
            onChange={(e) => handleChange("turns", e.target.value)}
            placeholder="1"
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="Divergence">Divergence: &nbsp;</label>
          <input
            type="number"
            name="divergence"
            id="divergence"
            step={1}
            value={selectedShape.divergence || divergence}
            onChange={(e) => handleChange("divergence", e.target.value)}
            placeholder="1"
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="Inner Radius">Inner Radius: &nbsp;</label>
          <input
            type="number"
            name="innerRadius"
            id="innerRadius"
            step={1}
            value={selectedShape.innerRadius || innerRadius}
            onChange={(e) => handleChange("innerRadius", e.target.value)}
            placeholder="1"
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="Stroke Width">Stroke Width: &nbsp;</label>
          <input
            type="number"
            name="strokeWidth"
            id="strokeWidth"
            step={1}
            placeholder="0"
            value={selectedShape.strokeWidth || 1}
            onChange={handleStrokeChange}
          />
        </div>
        <Tooltip id="tool-top" place="bottom-start" />
      </div>
    </>
  );
}

function TextEditorTopbar({ onStyleChange, selectedShapeId, shapes }) {
  const dispatch = useDispatch();
  const selectedFontSize = useSelector((state) => state.tool.selectedFontSize);
  const selectedFontFamily = useSelector((state) => state.tool.selectedFontFamily);
  const selectedAlignment = useSelector((state) => state.tool.selectedAlignment);
  const selectedFontStyle = useSelector((state) => state.tool.selectedFontStyle);
  const blockProgression = useSelector(state => state.tool.blockProgression || "normal");
  const [wordSuggestions, setWordSuggestions] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);

  const openModal = () => {
    console.log("text shapess", shapes);
    const selectedShape = shapes.find((shape) => shape.id === selectedShapeId);
    if (!selectedShape) {
      console.warn("Selected shape not found.");
      return;
    }
    const shapeClone = JSON.parse(JSON.stringify([selectedShape]));
    setModalData(shapeClone);
    setShowModal(true);
    fetchSuggestions(selectedShape);
  };
  const closeModal = () => {
    setShowModal(false);
    setModalData([]);
    setWordSuggestions({});
  };
  const replaceWord = (shapeIndex, wordIndex, replacement) => {
    setModalData((prev) => {
      const updated = [...prev];
      const words = updated[shapeIndex].text.split(" ");
      words[wordIndex] = replacement;
      updated[shapeIndex].text = words.join(" ");

      dispatch(updateShapePosition({
        id: updated[shapeIndex].id,
        text: updated[shapeIndex].text,
      }));

      return updated;
    });
  };
  const handleFontSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    dispatch(setFontSize(newSize));
    onStyleChange({ fontSize: newSize, id: selectedShapeId });
  };

  const handleFontFamilyChange = (e) => {
    const newFont = e.target.value;
    dispatch(setFontFamily(newFont));
    onStyleChange({ fontFamily: newFont, id: selectedShapeId });
  };

  const handleAlignmentChange = (e) => {
    const newAlignment = e.target.value;
    dispatch(setAlignment(newAlignment));
    onStyleChange({ alignment: newAlignment, id: selectedShapeId });
  };

  const handleFontStyleChange = (e) => {
    const newStyle = e.target.value;
    dispatch(setFontStyle(newStyle));
    onStyleChange({ fontStyle: newStyle, id: selectedShapeId });
  };

  const currentText = useSelector(
    (state) =>
      state.tool.layers[state.tool.selectedLayerIndex].shapes.find(
        (shape) => shape.id === selectedShapeId
      )?.text || ""
  );
  const handleTextTransformChange = (e) => {
    const transformType = e.target.value;

    let transformedText = currentText;

    if (transformType === "uppercase" && typeof currentText === "string") {
      transformedText = currentText.toUpperCase();
    } else if (transformType === "lowercase" && typeof currentText === "string") {
      transformedText = currentText.toLowerCase();
    } else if (transformType === "capitalize" && typeof currentText === "string") {
      transformedText = currentText
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    }
    dispatch(
      updateShapePosition({
        id: selectedShapeId,
        text: transformedText,
      })
    );
  };
  const selectedShape = useSelector(
    (state) =>
      state.tool.layers[state.tool.selectedLayerIndex].shapes.find(
        (shape) => shape.id === selectedShapeId
      ) || {}
  );
  const textDirection = selectedShape.textDirection || "ltr";
  const handleTextDirectionChange = (direction) => {
    if (selectedShapeId) {
      dispatch(
        updateShapePosition({
          id: selectedShapeId,
          textDirection: direction,
        })
      );
    }
    console.log("Text Direction Changed To:", direction);
  };
  const handleBlockProgressionChange = (progression) => {
    console.log("Block Progression Change Triggered:", progression);
    console.log("Selected Shape ID:", selectedShapeId);

    if (selectedShapeId) {
      dispatch(
        updateShapePosition({
          id: selectedShapeId,
          blockProgression: progression,
        })
      );
      console.log("Block Progression Changed To:", progression);
    } else {
      console.error("No shape is selected. Cannot update block progression.");
    }
  };
  const selectedLetterSpacing = useSelector(
    (state) =>
      state.tool.layers[state.tool.selectedLayerIndex].shapes.find(
        (shape) => shape.id === selectedShapeId
      )?.letterSpacing || 0
  );

  const handleLetterSpacingChange = (e) => {
    const newSpacing = parseFloat(e.target.value);
    onStyleChange({ letterSpacing: newSpacing, id: selectedShapeId });
  };
  const modalStyle = {
    position: 'fixed',
    top: "26%",
    right: "3%",
    height: '400px',
    width: '400px',
    backgroundColor: 'black',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    zIndex: 1000,
    transition: 'transform 0.3s ease-in-out',
    transform: showModal ? 'translateX(0)' : 'translateX(100%)',
    color: 'white',
  };
  const fetchSuggestions = async (shape) => {
    const words = new Set();

    shape.text?.split(" ").forEach((word) => {
      const cleaned = word.trim().toLowerCase();
      if (cleaned.length > 1) words.add(cleaned);
    });

    const results = {};
    for (let word of words) {
      try {
        const res = await fetch(`https://api.datamuse.com/sug?s=${word}`);
        const data = await res.json();
        results[word] = data.map((item) => item.word);
      } catch {
        results[word] = [];
      }
    }

    setWordSuggestions(results);
  };
  return (
    <div className="text-editor-topbar" style={{
      direction: textDirection,
      textAlign: textDirection === "rtl" ? "right" : "left",
    }}>
      <label>Font</label>
      <select value={selectedFontFamily} onChange={handleFontFamilyChange}>
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
        <option value="Verdana">Verdana</option>
        <option value="Georgia">Georgia</option>
        <option value="Comic Sans MS">Comic Sans MS</option>
        <option value="Trebuchet MS">Trebuchet MS</option>
        <option value="Impact">Impact</option>
        <option value="Lucida Console">Lucida Console</option>
        <option value="Tahoma">Tahoma</option>
        <option value="Palatino Linotype">Palatino Linotype</option>
        <option value="Garamond">Garamond</option>
        <option value="Bookman">Bookman</option>
        <option value="Candara">Candara</option>
        <option value="Helvetica">Helvetica</option>
        <option value="Gill Sans">Gill Sans</option>
        <option value="Century Gothic">Century Gothic</option>
        <option value="Franklin Gothic Medium">Franklin Gothic Medium</option>
      </select>

      <label>Size</label>
      <select value={selectedFontSize} onChange={handleFontSizeChange}>
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
        <option value={4}>4</option>
        <option value={5}>5</option>
        <option value={6}>6</option>
        <option value={7}>7</option>
        <option value={8}>8</option>
        <option value={9}>9</option>
        <option value={10}>10</option>
        <option value={12}>12</option>
        <option value={14}>14</option>
        <option value={16}>16</option>
        <option value={18}>18</option>
        <option value={36}>36</option>
      </select>

      <label>Align</label>
      <select value={selectedAlignment} onChange={handleAlignmentChange}>
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
      </select>

      <label>Style</label>
      <select value={selectedFontStyle} onChange={handleFontStyleChange}>
        <option value="normal">Normal</option>
        <option value="bold">Bold</option>
        <option value="italic">Italic</option>
        <option value="bold italic">Bold Italic</option>
      </select>

      <label>Transform</label>
      <select onChange={handleTextTransformChange}>
        <option value="none">None</option>
        <option value="uppercase">Uppercase</option>
        <option value="lowercase">Lowercase</option>
        <option value="capitalize">Capitalize</option>
      </select>
      <label>Direction</label>
      <select
        onChange={(e) => handleTextDirectionChange(e.target.value)}
        defaultValue="ltr"
      >
        <option value="ltr">Left to Right</option>
        <option value="rtl">Right to Left</option>
      </select>
      <label>Progression</label>
      <select
        value={blockProgression}
        onChange={e => {
          dispatch(setBlockProgression(e.target.value));
          handleBlockProgressionChange(e.target.value);
        }}
      >
        <option value="normal">Normal</option>
        <option value="vertical">Vertical</option>
        <option value="topToBottom">Top to Bottom</option>
      </select>
      <label>Spacing</label>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={selectedLetterSpacing}
        onChange={handleLetterSpacingChange}
        style={{ width: "150px", margin: "0 10px" }}
      />
      <span>{selectedLetterSpacing}px</span>
      <button
        style={{ height: "30px", width: "250px !important", marginBottom: 8 }}
        onClick={() => openModal()}
      >
        Check Spell
      </button>
      {showModal && (
        <div style={modalStyle}>
          <h2>Spell Checker</h2>
          {modalData.map((shape, shapeIndex) => (
            <div
              key={shape.id || shapeIndex}
              style={{
                marginBottom: "1rem",
                borderBottom: "1px solid gray",
                paddingBottom: "0.5rem",
              }}
            >
              <p><strong>ID:</strong> {shape.id}</p>
              <p><strong>Text:</strong> {shape.text}</p>

              {shape.text?.split(" ").map((word, wordIndex) => {
                const cleaned = word.trim().toLowerCase();
                const suggestions = wordSuggestions[cleaned] || [];

                return (
                  <div key={wordIndex} style={{ marginBottom: "0.5rem" }}>
                    <strong>{word}</strong>
                    <div style={{ fontSize: "0.9rem", color: "#ccc" }}>
                      {suggestions.slice(0, 5).map((s, idx) => (
                        <span
                          key={idx}
                          style={{
                            cursor: "pointer",
                            marginRight: "8px",
                            color: "#00f",
                            textDecoration: "underline",
                          }}
                          onClick={() => replaceWord(shapeIndex, wordIndex, s)}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <button onClick={closeModal} style={{ marginTop: "1rem" }}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

function SprayTopbar() {
  const dispatch = useDispatch();

  const {
    sprayWidth,
    sprayAmount,
    sprayRotation,
    sprayScale,
    sprayScatter,
    sprayFocus,
  } = useSelector((state) => state.tool);
  const [selectedTool, setSelectedTool] = useState(null);

  const selectedShapeId = useSelector((state) => state.tool.selectedShapeId);
  const sprayEraserMode = useSelector((state) => state.tool.sprayEraserMode);
  console.log("spray eraser mode", sprayEraserMode);
  const layers = useSelector((state) => state.tool.layers);
  const selectedLayerIndex = useSelector(
    (state) => state.tool.selectedLayerIndex
  );

  const handleInputChange = (field, value) => {
    dispatch(setSprayProperties({ [field]: value }));
  };
  const sprayMode = useSelector((state) => state.tool.sprayMode);
  return (
    <>
      <div className="d-flex flex-row mb-3">
        <div className="p-2 top-icon">
          <TbSelectAll
            data-tooltip-content="Select All"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 top-icon">
          <TbDeselect
            data-tooltip-content="Deselect"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 top-icon">
          <LuCopy
            data-tooltip-content="Spray Copies of the Selections"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 top-icon">
          <GrClone
            data-tooltip-content="Spray Clones of the Selections"
            data-tooltip-id="tool-top"
          />
        </div>
        <div
          className={`p-2 top-icon ${sprayMode === "singlePath" ? "active" : ""}`}
          onClick={() => dispatch(setSprayMode("singlePath"))}
        >
          <FaClone
            data-tooltip-content="Spray Objects in a Single Path"
            data-tooltip-id="tool-top"
          />
        </div>
        <div
          className={`p-2 top-icon ${sprayEraserMode ? "active" : ""}`}
          onClick={() => dispatch(setSprayEraserMode(!sprayEraserMode))}
        >
          <BiEraser
            data-tooltip-content="Delete Sprayed Items"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="Width">Width: &nbsp;</label>
          <input
            type="number"
            name="width"
            value={sprayWidth}
            onChange={(e) =>
              handleInputChange("sprayWidth", Number(e.target.value))
            }
            id="width"
            step={1}
            placeholder="0"
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="Amount">Amount: &nbsp;</label>
          <input
            type="number"
            name="amount"
            min={2}
            value={sprayAmount}
            onChange={(e) =>
              handleInputChange("sprayAmount", Math.max(2, Number(e.target.value)))
            }
            id="amount"
            step={1}
            placeholder="0"
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="Rotation">Rotation: &nbsp;</label>
          <input
            type="number"
            name="rotation"
            value={sprayRotation}
            onChange={(e) =>
              handleInputChange("sprayRotation", Number(e.target.value))
            }
            id="rotation"
            step={1}
            placeholder="0"
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="Scale">Scale: &nbsp;</label>
          <input
            type="number"
            name="scale"
            value={sprayScale}
            onChange={(e) =>
              handleInputChange("sprayScale", Number(e.target.value))
            }
            id="scale"
            step={0.1}
            max={2}
            placeholder="0"
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="Scatter">Scatter: &nbsp;</label>
          <input
            type="number"
            name="scatter"
            value={sprayScatter}
            onChange={(e) =>
              handleInputChange("sprayScatter", Number(e.target.value))
            }
            id="scatter"
            step={1}
            placeholder="0"
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="Focus">Focus: &nbsp;</label>
          <input
            type="number"
            name="focus"
            value={sprayFocus}
            onChange={(e) =>
              handleInputChange("sprayFocus", Number(e.target.value))
            }
            id="focus"
            step={1}
            placeholder="0"
          />
        </div>
        <Tooltip id="tool-top" place="bottom-start" />
      </div>
    </>
  );
}
function FontPanel({ selectedShape, selectedShapeId, onClose }) {
  const dispatch = useDispatch();
  const fontFamilies = [
    "Arial", "Times New Roman", "Courier New", "Verdana", "Georgia",
    "Comic Sans MS", "Trebuchet MS", "Impact", "Lucida Console", "Tahoma",
    "Palatino Linotype", "Garamond", "Bookman", "Candara", "Helvetica",
    "Gill Sans", "Century Gothic", "Franklin Gothic Medium"
  ];
  const fontStyles = [
    { label: "Normal", value: "normal" },
    { label: "Bold", value: "bold" },
    { label: "Italic", value: "italic" },
    { label: "Bold Italic", value: "bold italic" }
  ];
  const fontSizes = [8, 10, 12, 14, 16, 18, 24, 36, 48, 72];

  const [fontFamily, setFontFamily] = useState(selectedShape.fontFamily || "Arial");
  const [fontStyle, setFontStyle] = useState(selectedShape.fontStyle || "normal");
  const [fontSize, setFontSize] = useState(selectedShape.fontSize || 16);

  const handleApply = () => {
    if (selectedShapeId) {
      dispatch({
        type: "tool/updateShapePosition",
        payload: {
          id: selectedShapeId,
          fontFamily,
          fontStyle,
          fontSize: Number(fontSize)
        }
      });
    }
    onClose();
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label>Font Family:&nbsp;</label>
        <select
          value={fontFamily}
          onChange={e => setFontFamily(e.target.value)}
          style={{ minWidth: 180 }}
        >
          {fontFamilies.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Style:&nbsp;</label>
        <select
          value={fontStyle}
          onChange={e => setFontStyle(e.target.value)}
        >
          {fontStyles.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Size:&nbsp;</label>
        <select
          value={fontSize}
          onChange={e => setFontSize(e.target.value)}
        >
          {fontSizes.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleApply} style={{ background: "#007bff", color: "#fff", border: "none", borderRadius: 4, padding: "6px 16px" }}>Apply</button>
        <button onClick={onClose} style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}>Cancel</button>
      </div>
    </div>
  );
}

function SvgFontEditor({ onClose }) {

  const [fonts, setFonts] = useState([
    { name: "MySVGFont", glyphs: [{ char: "A", path: "" }, { char: "B", path: "" }] }
  ]);
  const [selectedFont, setSelectedFont] = useState(0);
  const [newFontName, setNewFontName] = useState("");
  const [newGlyphChar, setNewGlyphChar] = useState("");
  const [newGlyphPath, setNewGlyphPath] = useState("");

  const handleAddFont = () => {
    if (newFontName.trim()) {
      setFonts([...fonts, { name: newFontName, glyphs: [] }]);
      setNewFontName("");
    }
  };

  const handleAddGlyph = () => {
    if (newGlyphChar && newGlyphPath) {
      const updatedFonts = [...fonts];
      updatedFonts[selectedFont].glyphs.push({ char: newGlyphChar, path: newGlyphPath });
      setFonts(updatedFonts);
      setNewGlyphChar("");
      setNewGlyphPath("");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label>Fonts:&nbsp;</label>
        <select
          value={selectedFont}
          onChange={e => setSelectedFont(Number(e.target.value))}
        >
          {fonts.map((f, i) => (
            <option key={i} value={i}>{f.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="New font name"
          value={newFontName}
          onChange={e => setNewFontName(e.target.value)}
          style={{ marginLeft: 8 }}
        />
        <button onClick={handleAddFont} style={{ marginLeft: 4 }}>Add Font</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <h5>Glyphs for {fonts[selectedFont]?.name}</h5>
        <table style={{ width: "100%", marginBottom: 8 }}>
          <thead>
            <tr>
              <th>Char</th>
              <th>SVG Path</th>
            </tr>
          </thead>
          <tbody>
            {fonts[selectedFont]?.glyphs.map((g, idx) => (
              <tr key={idx}>
                <td>{g.char}</td>
                <td>
                  <input
                    type="text"
                    value={g.path}
                    onChange={e => {
                      const updatedFonts = [...fonts];
                      updatedFonts[selectedFont].glyphs[idx].path = e.target.value;
                      setFonts(updatedFonts);
                    }}
                    style={{ width: "90%" }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <input
          type="text"
          placeholder="Char"
          value={newGlyphChar}
          onChange={e => setNewGlyphChar(e.target.value)}
          style={{ width: 40, marginRight: 8 }}
        />
        <input
          type="text"
          placeholder="SVG Path"
          value={newGlyphPath}
          onChange={e => setNewGlyphPath(e.target.value)}
          style={{ width: 220, marginRight: 8 }}
        />
        <button onClick={handleAddGlyph}>Add Glyph</button>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onClose} style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}>Close</button>
      </div>
    </div>
  );
}

function UnicodePanel({ onClose }) {
  const dispatch = useDispatch();
  const selectedShapeId = useSelector(state => state.tool.selectedShapeId);
  const selectedLayerIndex = useSelector(state => state.tool.selectedLayerIndex);
  const shapes = useSelector(state => state.tool.layers[selectedLayerIndex]?.shapes || []);
  const selectedShape = shapes.find(s => s.id === selectedShapeId) || {};

  const fontFamilies = [
    "Arial", "Times New Roman", "Courier New", "Verdana", "Georgia", "Comic Sans MS"
  ];
  const fontStyles = [
    { label: "Normal", value: "normal" },
    { label: "Bold", value: "bold" },
    { label: "Italic", value: "italic" }
  ];
  const scripts = [
    { label: "Latin", value: "latin" },
    { label: "Greek", value: "greek" },
    { label: "Cyrillic", value: "cyrillic" },
    { label: "Hebrew", value: "hebrew" },
    { label: "Arabic", value: "arabic" },
    { label: "Devanagari", value: "devanagari" },
    { label: "CJK", value: "cjk" },

  ];
  const ranges = [
    { label: "Basic Latin", start: 0x0020, end: 0x007F },
    { label: "Latin-1 Supplement", start: 0x00A0, end: 0x00FF },
    { label: "Latin Extended-A", start: 0x0100, end: 0x017F },
    { label: "Latin Extended-B", start: 0x0180, end: 0x024F },
    { label: "IPA Extensions", start: 0x0250, end: 0x02AF },
    { label: "Greek and Coptic", start: 0x0370, end: 0x03FF },
    { label: "Cyrillic", start: 0x0400, end: 0x04FF },
    { label: "Hebrew", start: 0x0590, end: 0x05FF },
    { label: "Arabic", start: 0x0600, end: 0x06FF },
    { label: "Devanagari", start: 0x0900, end: 0x097F },
    { label: "Hiragana", start: 0x3040, end: 0x309F },
    { label: "Katakana", start: 0x30A0, end: 0x30FF },
    { label: "CJK Unified Ideographs", start: 0x4E00, end: 0x9FFF },
  ];

  const [fontFamily, setFontFamily] = useState(fontFamilies[0]);
  const [fontStyle, setFontStyle] = useState(fontStyles[0].value);
  const [script, setScript] = useState(scripts[0].value);
  const [rangeIdx, setRangeIdx] = useState(0);

  const chars = [];
  for (let i = ranges[rangeIdx].start; i <= ranges[rangeIdx].end; i++) {
    chars.push(String.fromCharCode(i));
  }

  const handleCharClick = (char) => {
    if (!selectedShapeId) {
      alert("Select a text object first.");
      return;
    }

    dispatch(updateShapePosition({
      id: selectedShapeId,
      text: (selectedShape.text || "") + char
    }));
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div>
          <label>Font family:&nbsp;</label>
          <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
            {fontFamilies.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label>Style:&nbsp;</label>
          <select value={fontStyle} onChange={e => setFontStyle(e.target.value)}>
            {fontStyles.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label>Script:&nbsp;</label>
          <select value={script} onChange={e => setScript(e.target.value)}>
            {scripts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label>Range:&nbsp;</label>
          <select value={rangeIdx} onChange={e => setRangeIdx(Number(e.target.value))}>
            {ranges.map((r, i) => (
              <option key={i} value={i}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(16, 1fr)",
          gap: 6,
          maxHeight: 260,
          overflowY: "auto",
          border: "1px solid #eee",
          padding: 8,
          background: "#fafafa"
        }}
      >
        {chars.map((char, idx) => (
          <span
            key={idx}
            style={{
              fontFamily,
              fontWeight: fontStyle === "bold" ? "bold" : "normal",
              fontStyle: fontStyle === "italic" ? "italic" : "normal",
              fontSize: 22,
              cursor: "pointer",
              textAlign: "center",
              padding: 2,
              borderRadius: 3,
              border: "1px solid #ddd",
              background: "#fff"
            }}
            title={`U+${(ranges[rangeIdx].start + idx).toString(16).toUpperCase()}`}
            onClick={() => handleCharClick(char)}
          >
            {char}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}>Close</button>
      </div>
    </div>
  );
}
function IconPreviewCanvas({ size }) {
  const shapes = useSelector(state => {
    const layers = state.tool.layers || [];
    const selectedLayer = layers[state.tool.selectedLayerIndex] || {};
    return selectedLayer.shapes || [];
  });
  const width = useSelector(state => state.tool.width);
  const height = useSelector(state => state.tool.height);

  const scale = Math.min(size / width, size / height);

  console.log("IconPreviewCanvas shapes:", shapes, "width:", width, "height:", height);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Stage width={size} height={size} scaleX={scale} scaleY={scale} style={{ background: "#fff", border: "1px solid #ccc" }}>
        <Layer>
          {shapes.map(shape =>
            renderShape(shape)
          )}
        </Layer>
      </Stage>
      <div style={{ fontSize: 12, marginTop: 4 }}>{size}x{size}</div>
    </div>
  );
}