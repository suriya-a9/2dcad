import { VscNewFile } from "react-icons/vsc";
import FillStrokeDialog from "../Dialogs/FillStrokeDialog";
import "./RightSidebar.css";
import {
  FaChevronDown,
  FaChevronUp,
  FaRegCopy,
  FaRegFolderOpen,
  FaProjectDiagram
} from "react-icons/fa";
import { BiLayerPlus, BiRectangle, BiSave, BiShuffle, BiSortAlt2 } from "react-icons/bi";
import { TiPrinter } from "react-icons/ti";
import { TbCut, TbFileExport, TbFileImport } from "react-icons/tb";
import {
  LuLayers,
  LuRedo2,
  LuUndo2,
  LuZoomIn,
  LuZoomOut,
} from "react-icons/lu";
import { FaRegPaste } from "react-icons/fa6";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { BsFillTrashFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import {
  addLayer,
  deleteLayer,
  moveLayerUp,
  moveLayerDown,
  selectLayer,
  selectShape,
  deleteShape,
  moveShapeDown,
  moveShapeUp,

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
  jumpToHistory,
  deselectAllShapes,
  moveShapeIntoGroup,
  selectAllShapesInGroup,
  duplicateShape,
} from "../../Redux/Slice/toolSlice";
import {
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify,
  FaAlignJustify as FaAlignVerticalCenter,
} from "react-icons/fa";
import { MdSwapHoriz, MdSwapVert, MdClearAll } from "react-icons/md";
import { MdVerticalAlignTop, MdVerticalAlignCenter, MdVerticalAlignBottom } from "react-icons/md";
import { useCallback, useRef, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { TbArrowsShuffle } from "react-icons/tb"
import { FaTools } from "react-icons/fa";
import { RiFileSettingsLine } from "react-icons/ri";
import { PiChartBarHorizontalFill } from "react-icons/pi";
import { PiCircleDashed } from "react-icons/pi";
import { FaLayerGroup } from "react-icons/fa";
import { TbArrowsExchange } from "react-icons/tb";
import { GiClamp } from "react-icons/gi";
import { PiBracketsCurlyFill } from "react-icons/pi";
import { BiCodeBlock } from "react-icons/bi";
import { IoLayers } from "react-icons/io5";
import { BiText } from "react-icons/bi";
import { PiPaintBrushFill } from "react-icons/pi";
import { FaObjectGroup } from "react-icons/fa6";
import { FaObjectUngroup } from "react-icons/fa6";
import { FaClone } from "react-icons/fa";
import { LuFileLock } from "react-icons/lu";
import { HiDuplicate } from "react-icons/hi";
const RightSidebar = ({
  toggleSidebar,
  activeTab,
  setActiveTab,
  isSidebarOpen,
  handleSave,
  onZoomIn,
  onZoomOut,
  handleDownloadPdf,
  selectedGroupId,
  setSelectedGroupId,
}) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const layers = useSelector((state) => state.tool.layers);
  const selectedShapeId = useSelector((state) => state.tool.selectedShapeId);
  const selectedShapeIds = useSelector((state) => state.tool.selectedShapeIds);
  const undoHistory = useSelector((state) => state.tool.undoHistory);
  const [showPropertiesIcons, setShowPropertiesIcons] = useState(false);
  const [isFillStrokeDialogOpen, setIsFillStrokeDialogOpen] = useState(false);
  const [isAlignPanelOpen, setIsAlignPanelOpen] = useState(false);
  const [alignTab, setAlignTab] = useState("align");
  const [horizontalSpacing, setHorizontalSpacing] = useState(10);
  const [verticalSpacing, setVerticalSpacing] = useState(10);
  const [gridRows, setGridRows] = useState(2);
  const [gridCols, setGridCols] = useState(2);
  const [equalWidth, setEqualWidth] = useState(true);
  const [equalHeight, setEqualHeight] = useState(true);
  const [gridMode, setGridMode] = useState('fit');
  const [gridSpacingX, setGridSpacingX] = useState(20);
  const [gridSpacingY, setGridSpacingY] = useState(20);
  const [circularAnchor, setCircularAnchor] = useState("bbox");
  const [arrangeOn, setArrangeOn] = useState("first");
  const [paramCenterX, setParamCenterX] = useState(0);
  const [paramCenterY, setParamCenterY] = useState(0);
  const [paramRadiusX, setParamRadiusX] = useState(100);
  const [paramRadiusY, setParamRadiusY] = useState(100);
  const [paramAngleStart, setParamAngleStart] = useState(0);
  const [paramAngleEnd, setParamAngleEnd] = useState(360);
  const [rotateObjects, setRotateObjects] = useState(false);
  const alignOptions = [
    { key: "left", label: "Align Left", icon: <FaAlignLeft /> },
    { key: "center", label: "Align Center", icon: <FaAlignCenter /> },
    { key: "right", label: "Align Right", icon: <FaAlignRight /> },
    { key: "top", label: "Align Top", icon: <MdVerticalAlignTop /> },
    { key: "middle", label: "Align Middle", icon: <MdVerticalAlignCenter /> },
    { key: "bottom", label: "Align Bottom", icon: <MdVerticalAlignBottom /> },
    { key: "vertical-center", label: "Center Vertically", icon: <FaAlignVerticalCenter /> },
    { key: "horizontal-center", label: "Center Horizontally", icon: <FaAlignJustify /> },
    { key: "distribute-horizontally", label: "Distribute Horizontally", icon: <MdSwapHoriz /> },
    { key: "distribute-vertically", label: "Distribute Vertically", icon: <MdSwapVert /> },
    { key: "distribute-left", label: "Distribute Left", icon: <FaAlignLeft /> },
    { key: "distribute-right", label: "Distribute Right", icon: <FaAlignRight /> },
  ];
  const distributeOptions = [
    { key: "distribute-left", label: "Distribute Left Edges", icon: <FaAlignLeft /> },
    { key: "distribute-center", label: "Distribute Centers Horizontally", icon: <FaAlignCenter /> },
    { key: "distribute-right", label: "Distribute Right Edges", icon: <FaAlignRight /> },
    { key: "distribute-top", label: "Distribute Top Edges", icon: <MdVerticalAlignTop /> },
    { key: "distribute-middle", label: "Distribute Centers Vertically", icon: <MdVerticalAlignCenter /> },
    { key: "distribute-bottom", label: "Distribute Bottom Edges", icon: <MdVerticalAlignBottom /> },
    { key: "distribute-horizontally", label: "Distribute Horizontally", icon: <MdSwapHoriz /> },
    { key: "distribute-vertically", label: "Distribute Vertically", icon: <MdSwapVert /> },
    { key: "distribute-row-gap", label: "Distribute Row Gaps", icon: <MdSwapVert /> },
    { key: "distribute-column-gap", label: "Distribute Column Gaps", icon: <MdSwapHoriz /> },
  ];
  const rearrangeOptions = [
    { key: "rearrange-graph", label: "Rearrange as a Graph", icon: <FaProjectDiagram /> },
    { key: "exchange-selection-under", label: "Exchange in Selection Under", icon: <TbArrowsExchange /> },
    { key: "exchange-z-order", label: "Exchange in Z-order", icon: <FaLayerGroup /> },
    { key: "exchange-center", label: "Exchange Around Center", icon: <PiCircleDashed /> },
    { key: "random-exchange", label: "Random Exchange", icon: <TbArrowsShuffle /> },
    { key: "unclump", label: "Unclump", icon: <GiClamp /> },
  ];
  const handleAlign = (key) => {
    if (!selectedShapeIds || selectedShapeIds.length < 2) return;


    const selectedLayer = layers[selectedLayerIndex];
    const selectedShapes = selectedLayer.shapes.filter(shape =>
      selectedShapeIds.includes(shape.id)
    );

    if (selectedShapes.length < 2) return;


    const minX = Math.min(...selectedShapes.map(s => s.x ?? 0));
    const maxX = Math.max(...selectedShapes.map(s => (s.x ?? 0) + (s.width ?? 0)));
    const minY = Math.min(...selectedShapes.map(s => s.y ?? 0));
    const maxY = Math.max(...selectedShapes.map(s => (s.y ?? 0) + (s.height ?? 0)));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;


    const sortedByX = [...selectedShapes].sort((a, b) => (a.x ?? 0) - (b.x ?? 0));
    const sortedByY = [...selectedShapes].sort((a, b) => (a.y ?? 0) - (b.y ?? 0));

    switch (key) {
      case "left":
      case "center":
      case "right":
      case "top":
      case "middle":
      case "bottom":
        selectedShapes.forEach(shape => {
          let newX = shape.x;
          let newY = shape.y;
          switch (key) {
            case "left":
              newX = minX;
              break;
            case "center":
              newX = centerX - (shape.width ?? 0) / 2;
              break;
            case "right":
              newX = maxX - (shape.width ?? 0);
              break;
            case "top":
              newY = minY;
              break;
            case "middle":
              newY = centerY - (shape.height ?? 0) / 2;
              break;
            case "bottom":
              newY = maxY - (shape.height ?? 0);
              break;
            default:
              return;
          }
          dispatch({
            type: "tool/updateShapePosition",
            payload: { id: shape.id, x: newX, y: newY }
          });
        });
        break;

      case "distribute-left": {
        if (sortedByX.length < 3) return;
        const step = (maxX - minX) / (sortedByX.length - 1);
        sortedByX.forEach((shape, i) => {
          dispatch({
            type: "tool/updateShapePosition",
            payload: { id: shape.id, x: minX + i * step }
          });
        });
        break;
      }


      case "distribute-center": {
        if (sortedByX.length < 3) return;
        const minCenter = Math.min(...sortedByX.map(s => (s.x ?? 0) + (s.width ?? 0) / 2));
        const maxCenter = Math.max(...sortedByX.map(s => (s.x ?? 0) + (s.width ?? 0) / 2));
        const step = (maxCenter - minCenter) / (sortedByX.length - 1);
        sortedByX.forEach((shape, i) => {
          const center = minCenter + i * step;
          dispatch({
            type: "tool/updateShapePosition",
            payload: { id: shape.id, x: center - (shape.width ?? 0) / 2 }
          });
        });
        break;
      }


      case "distribute-right": {
        if (sortedByX.length < 3) return;
        const minRight = Math.min(...sortedByX.map(s => (s.x ?? 0) + (s.width ?? 0)));
        const maxRight = Math.max(...sortedByX.map(s => (s.x ?? 0) + (s.width ?? 0)));
        const step = (maxRight - minRight) / (sortedByX.length - 1);
        sortedByX.forEach((shape, i) => {
          dispatch({
            type: "tool/updateShapePosition",
            payload: { id: shape.id, x: minRight + i * step - (shape.width ?? 0) }
          });
        });
        break;
      }


      case "distribute-top": {
        if (sortedByY.length < 3) return;
        const step = (maxY - minY) / (sortedByY.length - 1);
        sortedByY.forEach((shape, i) => {
          dispatch({
            type: "tool/updateShapePosition",
            payload: { id: shape.id, y: minY + i * step }
          });
        });
        break;
      }


      case "distribute-middle": {
        if (sortedByY.length < 3) return;
        const minCenter = Math.min(...sortedByY.map(s => (s.y ?? 0) + (s.height ?? 0) / 2));
        const maxCenter = Math.max(...sortedByY.map(s => (s.y ?? 0) + (s.height ?? 0) / 2));
        const step = (maxCenter - minCenter) / (sortedByY.length - 1);
        sortedByY.forEach((shape, i) => {
          const center = minCenter + i * step;
          dispatch({
            type: "tool/updateShapePosition",
            payload: { id: shape.id, y: center - (shape.height ?? 0) / 2 }
          });
        });
        break;
      }


      case "distribute-bottom": {
        if (sortedByY.length < 3) return;
        const minBottom = Math.min(...sortedByY.map(s => (s.y ?? 0) + (s.height ?? 0)));
        const maxBottom = Math.max(...sortedByY.map(s => (s.y ?? 0) + (s.height ?? 0)));
        const step = (maxBottom - minBottom) / (sortedByY.length - 1);
        sortedByY.forEach((shape, i) => {
          dispatch({
            type: "tool/updateShapePosition",
            payload: { id: shape.id, y: minBottom + i * step - (shape.height ?? 0) }
          });
        });
        break;
      }


      case "distribute-horizontally": {
        if (sortedByX.length < 3) return;
        const totalWidth = sortedByX.reduce((sum, s) => sum + (s.width ?? 0), 0);
        const gap = ((maxX - minX) - totalWidth) / (sortedByX.length - 1);
        let x = minX;
        sortedByX.forEach((shape, i) => {
          dispatch({
            type: "tool/updateShapePosition",
            payload: { id: shape.id, x }
          });
          x += (shape.width ?? 0) + gap;
        });
        break;
      }


      case "distribute-vertically": {
        if (sortedByY.length < 3) return;
        const totalHeight = sortedByY.reduce((sum, s) => sum + (s.height ?? 0), 0);
        const gap = ((maxY - minY) - totalHeight) / (sortedByY.length - 1);
        let y = minY;
        sortedByY.forEach((shape, i) => {
          dispatch({
            type: "tool/updateShapePosition",
            payload: { id: shape.id, y }
          });
          y += (shape.height ?? 0) + gap;
        });
        break;
      }


      case "distribute-row-gap": {
        if (sortedByY.length < 2) return;


        const totalHeight = sortedByY.reduce((sum, s) => sum + (s.height ?? 0), 0);
        const gap = ((maxY - minY) - totalHeight) / (sortedByY.length - 1);
        let y = minY;
        sortedByY.forEach((shape, i) => {
          dispatch({
            type: "tool/updateShapePosition",
            payload: { id: shape.id, y }
          });
          y += (shape.height ?? 0) + gap;
        });
        break;
      }


      case "distribute-column-gap": {
        if (sortedByX.length < 2) return;


        const totalWidth = sortedByX.reduce((sum, s) => sum + (s.width ?? 0), 0);
        const gap = ((maxX - minX) - totalWidth) / (sortedByX.length - 1);
        let x = minX;
        sortedByX.forEach((shape, i) => {
          dispatch({
            type: "tool/updateShapePosition",
            payload: { id: shape.id, x }
          });
          x += (shape.width ?? 0) + gap;
        });
        break;
      }

      case "vertical-center":
        selectedShapes.forEach(shape => {
          dispatch({
            type: "tool/updateShapePosition",
            payload: { id: shape.id, y: centerY - (shape.height ?? 0) / 2 }
          });
        });
        break;


      case "horizontal-center":
        selectedShapes.forEach(shape => {
          dispatch({
            type: "tool/updateShapePosition",
            payload: { id: shape.id, x: centerX - (shape.width ?? 0) / 2 }
          });
        });
        break;

      default:
        return;
    }
  };

  const handleRearrange = (key) => {
    if (!selectedShapeIds || selectedShapeIds.length < 2) return;

    const selectedLayer = layers[selectedLayerIndex];
    const selectedShapes = selectedLayer.shapes.filter(shape =>
      selectedShapeIds.includes(shape.id)
    );

    switch (key) {
      case "rearrange-graph": {
        if (selectedShapes.length === 0) return;

        const minX = Math.min(...selectedShapes.map(s => s.x ?? 0));
        const minY = Math.min(...selectedShapes.map(s => s.y ?? 0));

        const avgWidth = selectedShapes.reduce((sum, s) => sum + (s.width ?? 40), 0) / selectedShapes.length;
        const avgHeight = selectedShapes.reduce((sum, s) => sum + (s.height ?? 40), 0) / selectedShapes.length;
        const cols = Math.ceil(Math.sqrt(selectedShapes.length));
        selectedShapes.forEach((shape, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          dispatch({
            type: "tool/updateShapePosition",
            payload: {
              id: shape.id,
              x: minX + col * (avgWidth + 20),
              y: minY + row * (avgHeight + 20),
            }
          });
        });
        break;
      }

      case "exchange-selection-under":

        if (selectedShapes.length >= 2) {
          const [a, b] = selectedShapes;
          dispatch({ type: "tool/updateShapePosition", payload: { id: a.id, x: b.x, y: b.y } });
          dispatch({ type: "tool/updateShapePosition", payload: { id: b.id, x: a.x, y: a.y } });
        }
        break;

      case "exchange-z-order":

        {
          const ids = selectedShapes.map(s => s.id).reverse();

          dispatch({ type: "tool/reorderShapes", payload: { layerIndex: selectedLayerIndex, ids } });
        }
        break;

      case "exchange-center":

        {
          const cx = selectedShapes.reduce((sum, s) => sum + (s.x ?? 0), 0) / selectedShapes.length;
          const cy = selectedShapes.reduce((sum, s) => sum + (s.y ?? 0), 0) / selectedShapes.length;
          const positions = selectedShapes.map(s => ({ x: s.x, y: s.y }));
          const rotated = [...positions.slice(1), positions[0]];
          selectedShapes.forEach((shape, i) => {
            dispatch({
              type: "tool/updateShapePosition",
              payload: { id: shape.id, x: rotated[i].x, y: rotated[i].y }
            });
          });
        }
        break;

      case "random-exchange":

        {
          const positions = selectedShapes.map(s => ({ x: s.x, y: s.y }));
          for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
          }
          selectedShapes.forEach((shape, i) => {
            dispatch({
              type: "tool/updateShapePosition",
              payload: { id: shape.id, x: positions[i].x, y: positions[i].y }
            });
          });
        }
        break;

      case "unclump":

        {
          const minX = Math.min(...selectedShapes.map(s => s.x ?? 0));
          const maxX = Math.max(...selectedShapes.map(s => s.x ?? 0));
          const step = (maxX - minX) / (selectedShapes.length - 1);
          selectedShapes
            .sort((a, b) => (a.x ?? 0) - (b.x ?? 0))
            .forEach((shape, i) => {
              dispatch({
                type: "tool/updateShapePosition",
                payload: { id: shape.id, x: minX + i * step }
              });
            });
        }
        break;

      default:
        break;
    }
  };
  const handleRemoveOverlaps = (hGap, vGap) => {

    if (!selectedShapeIds || selectedShapeIds.length < 2) return;
    const selectedLayer = layers[selectedLayerIndex];
    const selectedShapes = selectedLayer.shapes.filter(shape =>
      selectedShapeIds.includes(shape.id)
    );
    let x = Math.min(...selectedShapes.map(s => s.x ?? 0));
    let y = Math.min(...selectedShapes.map(s => s.y ?? 0));
    selectedShapes.forEach((shape, i) => {
      dispatch({
        type: "tool/updateShapePosition",
        payload: { id: shape.id, x: x, y: y }
      });
      x += (shape.width ?? 40) + hGap;
      y += (shape.height ?? 40) + vGap;
    });
  };
  const handleGridArrange = () => {
    if (!selectedShapeIds || selectedShapeIds.length < 2) return;
    const selectedLayer = layers[selectedLayerIndex];
    const selectedShapes = selectedLayer.shapes.filter(shape =>
      selectedShapeIds.includes(shape.id)
    );
    if (selectedShapes.length === 0) return;


    const rowCount = gridRows;
    const colCount = gridCols;


    const minX = Math.min(...selectedShapes.map(s => s.x ?? 0));
    const minY = Math.min(...selectedShapes.map(s => s.y ?? 0));
    const maxX = Math.max(...selectedShapes.map(s => (s.x ?? 0) + (s.width ?? 40)));
    const maxY = Math.max(...selectedShapes.map(s => (s.y ?? 0) + (s.height ?? 40)));
    const totalWidth = maxX - minX;
    const totalHeight = maxY - minY;


    const maxWidth = Math.max(...selectedShapes.map(s => s.width ?? 40));
    const maxHeight = Math.max(...selectedShapes.map(s => s.height ?? 40));

    if (gridMode === "fit") {

      const cellW = equalWidth ? maxWidth : totalWidth / colCount;
      const cellH = equalHeight ? maxHeight : totalHeight / rowCount;

      selectedShapes.forEach((shape, idx) => {
        const row = Math.floor(idx / colCount);
        const col = idx % colCount;

        const w = equalWidth ? maxWidth : (shape.width ?? 40);
        const h = equalHeight ? maxHeight : (shape.height ?? 40);
        const x = minX + col * cellW + (equalWidth ? 0 : (cellW - w) / 2);
        const y = minY + row * cellH + (equalHeight ? 0 : (cellH - h) / 2);
        dispatch({
          type: "tool/updateShapePosition",
          payload: { id: shape.id, x, y }
        });
      });
    } else {

      selectedShapes.forEach((shape, idx) => {
        const row = Math.floor(idx / colCount);
        const col = idx % colCount;
        const w = equalWidth ? maxWidth : (shape.width ?? 40);
        const h = equalHeight ? maxHeight : (shape.height ?? 40);
        const x = minX + col * (w + gridSpacingX);
        const y = minY + row * (h + gridSpacingY);
        dispatch({
          type: "tool/updateShapePosition",
          payload: { id: shape.id, x, y }
        });
      });
    }
  };
  const handleCircularArrange = () => {
    if (!selectedShapeIds || selectedShapeIds.length < 2) return;
    const selectedLayer = layers[selectedLayerIndex];
    const selectedShapes = selectedLayer.shapes.filter(shape =>
      selectedShapeIds.includes(shape.id)
    );
    if (selectedShapes.length === 0) return;

    let cx, cy, rx, ry, angleStart, angleEnd;

    if (arrangeOn === "param") {
      cx = paramCenterX;
      cy = paramCenterY;
      rx = paramRadiusX;
      ry = paramRadiusY;
      angleStart = (paramAngleStart * Math.PI) / 180;
      angleEnd = (paramAngleEnd * Math.PI) / 180;
    } else {
      const refShapes = arrangeOn === "first"
        ? selectedShapes
        : [...selectedShapes].reverse();
      const refShape = refShapes.find(s => {
        const t = (s.type || "").toLowerCase();
        return t === "circle" || t === "ellipse" || t === "arc";
      });
      if (!refShape) {
        window.alert("No circle shape");
        return;
      }
      cx = (refShape.x ?? 0) + (refShape.width ?? refShape.radius ?? 40) / 2;
      cy = (refShape.y ?? 0) + (refShape.height ?? refShape.radius ?? 40) / 2;
      rx = (refShape.width ?? refShape.radius ?? 40) / 2;
      ry = (refShape.height ?? refShape.radius ?? 40) / 2;
      angleStart = 0;
      angleEnd = 2 * Math.PI;
    }

    const count = selectedShapes.length;
    const angleStep = (angleEnd - angleStart) / count;

    selectedShapes.forEach((shape, i) => {
      const angle = angleStart + i * angleStep;
      let x, y;
      if (circularAnchor === "bbox") {
        const w = shape.width ?? 40;
        const h = shape.height ?? 40;
        x = cx + rx * Math.cos(angle) - w / 2;
        y = cy + ry * Math.sin(angle) - h / 2;
      } else {
        x = cx + rx * Math.cos(angle);
        y = cy + ry * Math.sin(angle);
      }
      dispatch({
        type: "tool/updateShapePosition",
        payload: { id: shape.id, x, y }
      });

      if (rotateObjects) {
        const rotation = (angle * 180) / Math.PI + 90;
        dispatch({
          type: "tool/updateShapeRotation",
          payload: { id: shape.id, rotation }
        });
      }
    });
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
  const handleOpenFillStrokeDialog = () => {
    setIsFillStrokeDialogOpen(true);
  };

  const handleCloseFillStrokeDialog = () => {
    setIsFillStrokeDialogOpen(false);
  };

  const selectedLayerIndex = useSelector(
    (state) => state.tool.selectedLayerIndex
  );

  const [isEditing, setIsEditing] = useState(false);
  const [newLayerName, setNewLayerName] = useState("");
  const [editingLayerIndex, setEditingLayerIndex] = useState(null);

  const handleRenameLayer = (index) => {
    setIsEditing(true);
    setEditingLayerIndex(index);
    setNewLayerName(layers[index].name);
  };

  const handleLayerNameChange = (e) => {
    setNewLayerName(e.target.value);
  };

  const handleLayerNameSubmit = (e) => {
    if (e.key === "Enter" && newLayerName.trim() !== "") {
      dispatch(
        renameLayer({ index: editingLayerIndex, newName: newLayerName })
      );
      setIsEditing(false);
      setEditingLayerIndex(null);
      setNewLayerName("");
    }
  };

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

  const handleDelete = () => {
    if (selectedShapeIds && selectedShapeIds.length > 0) {
      selectedShapeIds.forEach(id => dispatch(deleteShape(id)));
    } else if (selectedShapeId) {
      dispatch(deleteShape(selectedShapeId));
    } else if (selectedLayerIndex !== null) {
      dispatch(deleteLayer());
    }
  };

  const handleMoveUp = () => {
    if (selectedShapeId) {
      dispatch(moveShapeUp());
    } else if (selectedLayerIndex > 0) {
      dispatch(moveLayerUp());
    }
  };

  const handleMoveDown = () => {
    if (selectedShapeId) {
      dispatch(moveShapeDown());
    } else if (selectedLayerIndex < layers.length - 1) {
      dispatch(moveLayerDown());
    }
  };

  const handleSelectLayer = useCallback(
    (index) => {
      dispatch(selectLayer(index));
    },
    [dispatch]
  );

  const handleSelectShape = useCallback(
    (shapeId) => {
      if (selectedShapeIds.includes(shapeId)) {

        dispatch(deselectAllShapes());
      } else {

        dispatch(selectShape(shapeId));
      }
    },
    [dispatch, selectedShapeIds]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = useCallback(
    (e, targetLayerIndex) => {
      e.preventDefault();
      const shapeId = e.dataTransfer.getData("text/plain");
      dispatch(moveShapeToLayer({ shapeId, targetLayerIndex }));
    },
    [dispatch]
  );

  const handleGroupClick = (groupId) => {
    if (selectedGroupId === groupId) {
    } else {
      setSelectedGroupId(groupId);
    }
  };



  const handleDragStart = useCallback(
    (e, shapeId) => {
      e.dataTransfer.setData("shapeId", shapeId);
      e.dataTransfer.setData("text/plain", shapeId);
    },
    [dispatch]
  );


  const handleDropShape = (e, groupId) => {
    e.preventDefault();
    const shapeId = e.dataTransfer.getData("shapeId");
    if (!shapeId) return;
    dispatch(moveShapeIntoGroup({ shapeId, groupId }));
  };

  return (
    <div className="right-sidebar">
      <div className="d-flex flex-column align-items-end mb-3">
        <div className="right-icons">
          <div className="p-2 right-icon">
            <LuLayers
              data-tooltip-content="Layer & Objects"
              data-tooltip-id="tool-right"
              onClick={toggleSidebar}
              style={{ cursor: "pointer" }}
            />
          </div>
          <div
            className="p-2 right-icon"
            onClick={() => dispatch(createNewPage())}
          >
            <VscNewFile
              data-tooltip-content="New File"
              data-tooltip-id="tool-right"
            />
          </div>
          <div className="p-2 right-icon" onClick={handleUploadClick}>
            <FaRegFolderOpen
              data-tooltip-content="Open File"
              data-tooltip-id="tool-right"
            />
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={haleUploadFile}
            multiple
          />
          <div className="p-2 right-icon">
            <BiSave
              data-tooltip-content="Save File"
              data-tooltip-id="tool-right"
              onClick={handleSave}
            />
          </div>
          <div className="p-2 right-icon">
            <TiPrinter
              data-tooltip-content="Print"
              data-tooltip-id="tool-right"
              onClick={handleDownloadPdf}
            />
          </div>
          <div className="p-2 right-icon" onClick={handleImportClick}>
            <TbFileImport
              data-tooltip-content="Import Image"
              data-tooltip-id="tool-right"
            />
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            multiple
          />
          <div className="p-2 right-icon">
            <TbFileExport
              data-tooltip-content="Export"
              data-tooltip-id="tool-right"
              onClick={handleSave}
            />
          </div>
          <div className="p-2 right-icon" onClick={() => dispatch(undo())}>
            <LuUndo2 data-tooltip-content="Undo" data-tooltip-id="tool-right" />
          </div>
          <div className="p-2 right-icon" onClick={() => dispatch(redo())}>
            <LuRedo2 data-tooltip-content="Redo" data-tooltip-id="tool-right" />
          </div>
          <div className="p-2 right-icon" onClick={() => dispatch(copy())}>
            <FaRegCopy
              data-tooltip-content="Copy"
              data-tooltip-id="tool-right"
            />
          </div>
          <div className="p-2 right-icon" onClick={() => dispatch(cut())}>
            <TbCut data-tooltip-content="Cut" data-tooltip-id="tool-right" />
          </div>
          <div className="p-2 right-icon" onClick={() => dispatch(paste())}>
            <FaRegPaste
              data-tooltip-content="Paste"
              data-tooltip-id="tool-right"
            />
          </div>
          <div className="p-2 right-icon" onClick={onZoomIn}>
            <LuZoomIn
              data-tooltip-content="Zoom In"
              data-tooltip-id="tool-right"
            />
          </div>
          <div className="p-2 right-icon" onClick={onZoomOut}>
            <LuZoomOut
              data-tooltip-content="Zoom Out"
              data-tooltip-id="tool-right"
            />
          </div>
          <div className="p-2 right-icon" onClick={() => setShowPropertiesIcons(!showPropertiesIcons)}>
            <IoMdArrowDropdown
              data-tooltip-content="Zoom Out"
              data-tooltip-id="tool-right"
              style={{ border: "1px solid white", borderRadius: "3px" }}
            />
          </div>

          <Tooltip id="tool-right" place="left" />
        </div>

        {showPropertiesIcons && (
          <div className="d-flex bg-black right-bottom-icons">
            <div className="p-2 right-icon">
              <HiDuplicate
                onClick={() => dispatch(duplicateShape())}
                data-tooltip-content="Duplicate"
                data-tooltip-id="tool-top"
                x
              />
            </div>
            <div className="p-2 right-icon" onClick={handleClone}>
              <LuFileLock
                data-tooltip-content="Clone"
                data-tooltip-id="tool-top"
              />
            </div>
            <div className="p-2 right-icon" onClick={handleUnlinkClone}>
              <FaClone
                data-tooltip-content="Unlink Clone"
                data-tooltip-id="tool-top"
              />
            </div>
            <div className="p-2 right-icon" onClick={() => {
              if (selectedShapeIds && selectedShapeIds.length > 1) {
                dispatch({ type: "tool/groupShapes", payload: { ids: selectedShapeIds } });
              }
            }}>
              <FaObjectGroup
                data-tooltip-content="Group"
                data-tooltip-id="tool-top"
              />
            </div>
            <div className="p-2 right-icon" onClick={() => {
              if (selectedShapeIds && selectedShapeIds.length > 0) {
                dispatch({ type: "tool/ungroupShapes", payload: { ids: selectedShapeIds } });
              }
            }}>
              <FaObjectUngroup
                data-tooltip-content="Ungroup"
                data-tooltip-id="tool-top"
              />
            </div>
            <div className="p-2 right-icon">
              <PiPaintBrushFill
                data-tooltip-content="Fill & Stroke"
                data-tooltip-id="tool-top"
                onClick={handleOpenFillStrokeDialog}
              />
            </div>
            <FillStrokeDialog
              isOpen={isFillStrokeDialogOpen}
              onClose={handleCloseFillStrokeDialog}
            />
            {/* <div className="p-2 right-icon">
              <BiText
                data-tooltip-content="Text and Font"
                data-tooltip-id="tool-top"
              />
            </div> */}
            {/* <div className="p-2 right-icon">
              <IoLayers
                data-tooltip-content="Layer and Objects"
                data-tooltip-id="tool-top"
              />
            </div> */}
            {/* <div className="p-2 right-icon">
              <BiCodeBlock
                data-tooltip-content="XML Editor"
                data-tooltip-id="tool-top"
              />
            </div> */}
            {/* <div className="p-2 right-icon">
              <PiBracketsCurlyFill
                data-tooltip-content="Selector and CSS"
                data-tooltip-id="tool-top"
              />
            </div> */}
            <div className="p-2 right-icon">
              <PiChartBarHorizontalFill
                data-tooltip-content="Align and Distribute"
                data-tooltip-id="tool-top"
                onClick={() => setIsAlignPanelOpen(true)}
                style={{ cursor: "pointer" }}
              />
            </div>
            {isAlignPanelOpen && (
              <div className="align-panel" style={{
                position: "absolute",
                right: 60,
                top: -250,
                background: "#222",
                color: "#fff",
                height: 250,
                overflowX: "scroll",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                zIndex: 2000,
                padding: 16,
                minWidth: 240
              }}>
                <div style={{ display: "flex", borderBottom: "1px solid #444", marginBottom: 8 }}>
                  <button style={{ flex: 1, background: alignTab === "align" ? "#444" : "none", color: "#fff" }} onClick={() => setAlignTab("align")}>Align</button>
                  <button style={{ flex: 1, background: alignTab === "grid" ? "#444" : "none", color: "#fff" }} onClick={() => setAlignTab("grid")}>Grid</button>
                  <button style={{ flex: 1, background: alignTab === "circular" ? "#444" : "none", color: "#fff" }} onClick={() => setAlignTab("circular")}>Circular</button>
                </div>
                <div>
                  {alignTab === "align" && (
                    <>
                      <div style={{ fontWeight: "bold", marginBottom: 4 }}>Align</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 12 }}>
                        {alignOptions.map(opt => (
                          <button
                            key={opt.key}
                            title={opt.label}
                            style={{
                              width: 40,
                              height: 40,
                              background: "#333",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 22,
                              cursor: "pointer"
                            }}
                            onClick={() => handleAlign(opt.key)}
                          >
                            {opt.icon}
                          </button>
                        ))}
                      </div>
                      <div style={{ fontWeight: "bold", marginBottom: 4 }}>Distribute</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                        {distributeOptions.map(opt => (
                          <button
                            key={opt.key}
                            title={opt.label}
                            style={{
                              width: 40,
                              height: 40,
                              background: "#333",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 22,
                              cursor: "pointer"
                            }}
                            onClick={() => handleAlign(opt.key)}
                          >
                            {opt.icon}
                          </button>
                        ))}
                      </div>
                      <div style={{ fontWeight: "bold", marginBottom: 4, marginTop: 8 }}>Rearrange</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                        {rearrangeOptions.map(opt => (
                          <button
                            key={opt.key}
                            title={opt.label}
                            style={{
                              width: 40,
                              height: 40,
                              background: "#333",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 22,
                              cursor: "pointer"
                            }}
                            onClick={() => handleRearrange(opt.key)}
                          >
                            {opt.icon}
                          </button>
                        ))}
                      </div>
                      <div style={{ fontWeight: "bold", marginBottom: 4, marginTop: 8 }}>Remove Overlaps</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>

                        <input
                          type="number"
                          value={horizontalSpacing}
                          min={0}
                          onChange={e => setHorizontalSpacing(Number(e.target.value))}
                          style={{ width: 50, marginLeft: 4, marginRight: 4 }}
                          placeholder="H"
                          title="Horizontal spacing"
                        />
                        <input
                          type="number"
                          value={verticalSpacing}
                          min={0}
                          onChange={e => setVerticalSpacing(Number(e.target.value))}
                          style={{ width: 50, marginLeft: 4, marginRight: 4 }}
                          placeholder="V"
                          title="Vertical spacing"
                        />
                        <button
                          title="Remove Overlaps"
                          style={{
                            width: 40,
                            height: 40,
                            background: "#333",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 22,
                            cursor: "pointer"
                          }}
                          onClick={() => handleRemoveOverlaps(horizontalSpacing, verticalSpacing)}
                        >
                          <MdClearAll />
                        </button>
                      </div>
                    </>
                  )}
                  {alignTab === "grid" && (
                    <div style={{ padding: 8 }}>
                      <div style={{ fontWeight: "bold", marginBottom: 8 }}>Arrange in Grid</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <label style={{ minWidth: 50 }}>Rows</label>
                        <input
                          type="number"
                          min={1}
                          value={gridRows}
                          onChange={e => setGridRows(Number(e.target.value))}
                          style={{ width: 60 }}
                        />
                        <label style={{ minWidth: 60 }}>Columns</label>
                        <input
                          type="number"
                          min={1}
                          value={gridCols}
                          onChange={e => setGridCols(Number(e.target.value))}
                          style={{ width: 60 }}
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                        <label>
                          <input
                            type="checkbox"
                            checked={equalWidth}
                            onChange={e => setEqualWidth(e.target.checked)}
                            style={{ marginRight: 4 }}
                          />
                          Equal Width
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={equalHeight}
                            onChange={e => setEqualHeight(e.target.checked)}
                            style={{ marginRight: 4 }}
                          />
                          Equal Height
                        </label>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label>
                          <input
                            type="radio"
                            name="gridMode"
                            value="fit"
                            checked={gridMode === "fit"}
                            onChange={() => setGridMode("fit")}
                            style={{ marginRight: 4 }}
                          />
                          Fit into selection box
                        </label>
                        <label style={{ marginLeft: 16 }}>
                          <input
                            type="radio"
                            name="gridMode"
                            value="spacing"
                            checked={gridMode === "spacing"}
                            onChange={() => setGridMode("spacing")}
                            style={{ marginRight: 4 }}
                          />
                          Set spacing
                        </label>
                      </div>
                      {gridMode === "spacing" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                          <label>
                            x:
                            <input
                              type="number"
                              value={gridSpacingX}
                              min={0}
                              onChange={e => setGridSpacingX(Number(e.target.value))}
                              style={{ width: 50, marginLeft: 4, marginRight: 8 }}
                              placeholder="Horizontal"
                              title="Horizontal spacing"
                            />
                          </label>
                          <label>
                            y:
                            <input
                              type="number"
                              value={gridSpacingY}
                              min={0}
                              onChange={e => setGridSpacingY(Number(e.target.value))}
                              style={{ width: 50, marginLeft: 4 }}
                              placeholder="Vertical"
                              title="Vertical spacing"
                            />
                          </label>
                        </div>
                      )}
                      <button
                        style={{
                          width: "100%",
                          background: "#333",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: 8,
                          fontWeight: "bold",
                          cursor: "pointer"
                        }}
                        onClick={handleGridArrange}
                      >
                        Arrange
                      </button>
                    </div>
                  )}
                  {alignTab === "circular" && (
                    <div style={{ padding: 8 }}>
                      <div style={{ fontWeight: "bold", marginBottom: 8 }}>Arrange in Circle</div>
                      <div style={{ fontWeight: "bold", marginBottom: 4 }}>Anchor point</div>
                      <div style={{ marginBottom: 12 }}>
                        <label>
                          <input
                            type="radio"
                            name="circularAnchor"
                            value="bbox"
                            checked={circularAnchor === "bbox"}
                            onChange={() => setCircularAnchor("bbox")}
                            style={{ marginRight: 4 }}
                          />
                          Objects bounding boxes
                        </label>
                        <label style={{ marginLeft: 16 }}>
                          <input
                            type="radio"
                            name="circularAnchor"
                            value="center"
                            checked={circularAnchor === "center"}
                            onChange={() => setCircularAnchor("center")}
                            style={{ marginRight: 4 }}
                          />
                          Objects rotational center
                        </label>
                      </div>
                      <div style={{ fontWeight: "bold", marginBottom: 4 }}>Arrange On</div>
                      <div style={{ marginBottom: 12 }}>
                        <label>
                          <input
                            type="radio"
                            name="arrangeOn"
                            value="first"
                            checked={arrangeOn === "first"}
                            onChange={() => setArrangeOn("first")}
                            style={{ marginRight: 4 }}
                          />
                          First selected circle, ellipse or arc
                        </label>
                        <label style={{ marginLeft: 16 }}>
                          <input
                            type="radio"
                            name="arrangeOn"
                            value="last"
                            checked={arrangeOn === "last"}
                            onChange={() => setArrangeOn("last")}
                            style={{ marginRight: 4 }}
                          />
                          Last selected circle, ellipse or arc
                        </label>
                        <label style={{ marginLeft: 16 }}>
                          <input
                            type="radio"
                            name="arrangeOn"
                            value="param"
                            checked={arrangeOn === "param"}
                            onChange={() => setArrangeOn("param")}
                            style={{ marginRight: 4 }}
                          />
                          Parameterized
                        </label>
                      </div>
                      {arrangeOn === "param" && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ marginBottom: 4, fontWeight: "bold" }}>Center</div>
                          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                            <input
                              type="number"
                              value={paramCenterX}
                              onChange={e => setParamCenterX(Number(e.target.value))}
                              style={{ width: 60 }}
                              placeholder="X"
                            />
                            <input
                              type="number"
                              value={paramCenterY}
                              onChange={e => setParamCenterY(Number(e.target.value))}
                              style={{ width: 60 }}
                              placeholder="Y"
                            />
                          </div>
                          <div style={{ marginBottom: 4, fontWeight: "bold" }}>Radius</div>
                          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                            <input
                              type="number"
                              value={paramRadiusX}
                              onChange={e => setParamRadiusX(Number(e.target.value))}
                              style={{ width: 60 }}
                              placeholder="X"
                            />
                            <input
                              type="number"
                              value={paramRadiusY}
                              onChange={e => setParamRadiusY(Number(e.target.value))}
                              style={{ width: 60 }}
                              placeholder="Y"
                            />
                          </div>
                          <div style={{ marginBottom: 4, fontWeight: "bold" }}>Angle</div>
                          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                            <input
                              type="number"
                              value={paramAngleStart}
                              onChange={e => setParamAngleStart(Number(e.target.value))}
                              style={{ width: 60 }}
                              placeholder="Start"
                            />
                            <input
                              type="number"
                              value={paramAngleEnd}
                              onChange={e => setParamAngleEnd(Number(e.target.value))}
                              style={{ width: 60 }}
                              placeholder="End"
                            />
                          </div>
                        </div>
                      )}
                      <div style={{ marginBottom: 12 }}>
                        <label>
                          <input
                            type="checkbox"
                            checked={rotateObjects}
                            onChange={e => setRotateObjects(e.target.checked)}
                            style={{ marginRight: 4 }}
                          />
                          Rotate objects
                        </label>
                      </div>
                      <button
                        style={{
                          width: "100%",
                          background: "#333",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: 8,
                          fontWeight: "bold",
                          cursor: "pointer"
                        }}
                        onClick={handleCircularArrange}
                      >
                        Arrange
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={() => setIsAlignPanelOpen(false)} style={{ marginTop: 8 }}>Close</button>
              </div>
            )}
            <div className="p-2 right-icon">
              <RiFileSettingsLine
                data-tooltip-content="Document Properties"
                data-tooltip-id="tool-top"
              />
            </div>
            {/* <div className="p-2 right-icon">
              <FaTools
                data-tooltip-content="Preferences"
                data-tooltip-id="tool-top"
              />
            </div> */}
          </div>
        )}


      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="undo-history undo-history-effect-scale undo-history-theme-1">
          <input
            type="radio"
            name="undo-history"
            checked={activeTab === "layers"}
            onChange={() => setActiveTab("layers")}
            id="layers"
            className="tab-content-first"
          />
          <label htmlFor="layers">Layers & Objects</label>
          <input
            type="radio"
            name="undo-history"
            checked={activeTab === "undo-history"}
            onChange={() => setActiveTab("undo-history")}
            id="undo-history"
            className="tab-content-2"
          />
          <label htmlFor="undo-history">Undo History</label>
          <ul className="pt-2">
            <li
              className={`tab-content tab-content-first typography ${activeTab === "layers" ? "active" : ""
                }`}
            >
              {/* Layers & Objects */}
              <div className="layer-tools d-flex align-items-center py-2 gap-5">
                <div
                  className="layer-tool"
                  onClick={() => dispatch(addLayer())}
                >
                  <BiLayerPlus size={24} />
                </div>
                <div className="layer-tool" onClick={handleDelete}>
                  <BsFillTrashFill size={18} />
                </div>
                <div className="layer-tool" onClick={handleMoveUp}>
                  <FaChevronUp size={18} />
                </div>
                <div className="layer-tool" onClick={handleMoveDown}>
                  <FaChevronDown size={18} />
                </div>
              </div>

              {layers.map((layer, index) => {
                if (!layer.visible) {
                  return null;
                }

                const layerStyle =
                  index === selectedLayerIndex
                    ? {
                      backgroundColor: "#222222",
                      color: "white",
                      fontSize: "15px",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }
                    : {
                      backgroundColor: "transparent",
                      color: "black",
                      fontSize: "15px",
                      padding: "5px 10px",
                      cursor: "pointer",
                    };

                return (
                  <div
                    key={index}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    {isEditing && editingLayerIndex === index ? (
                      <input
                        type="text"
                        value={newLayerName}
                        onChange={handleLayerNameChange}
                        onKeyDown={handleLayerNameSubmit}
                        onBlur={() => {
                          setIsEditing(false);
                          setEditingLayerIndex(null);
                          setNewLayerName("");
                        }}
                        style={{ fontSize: "15px", padding: "5px 10px" }}
                      />
                    ) : (
                      <div
                        style={layerStyle}
                        onClick={() => handleSelectLayer(index)}
                        onDoubleClick={() => handleRenameLayer(index)}
                      >
                        {layer.name}
                      </div>
                    )}

                    {selectedLayerIndex === index &&
                      layer.shapes.length > 0 && (
                        <div style={{ paddingLeft: "20px" }}>
                          {layer.shapes.map((shape, idx) => {
                            const isSelected = selectedShapeIds.includes(
                              shape.id
                            );


                            if (shape.groupId) {
                              return null;
                            }

                            if (shape.type === "Group") {
                              return (
                                <div
                                  key={shape.id}
                                  onDrop={(e) => handleDropShape(e, shape.id)}
                                  onDragOver={(e) => e.preventDefault()}
                                  style={{
                                    cursor: "pointer",
                                    fontSize: "15px",
                                    padding: "5px 10px",
                                    backgroundColor: isSelected
                                      ? "#222"
                                      : "transparent",
                                    color: isSelected ? "white" : "black",
                                    border: "1px solid #000",
                                  }}
                                >
                                  <strong
                                    onClick={() => {
                                      handleGroupClick(shape.id);
                                      dispatch(
                                        selectAllShapesInGroup({
                                          groupId: shape.id,
                                        })
                                      );
                                    }}
                                    style={{
                                      cursor: "pointer",
                                      color: "#000000",
                                    }}
                                  >
                                    {shape.name}
                                  </strong>
                                  <div style={{ paddingLeft: "10px" }}>
                                    {shape.shapes.map((subShape) => {
                                      const isSubShapeSelected =
                                        selectedShapeIds.includes(subShape.id);
                                      return (
                                        <div
                                          key={subShape.id}
                                          onClick={() =>
                                            handleSelectShape(subShape.id)
                                          }
                                          draggable
                                          onDragStart={(e) =>
                                            handleDragStart(e, subShape.id)
                                          }
                                          style={{
                                            cursor: "pointer",
                                            fontSize: "15px",
                                            padding: "5px 10px",
                                            backgroundColor:
                                              isSubShapeSelected ||
                                                subShape.id === selectedShapeId
                                                ? "#222222"
                                                : "transparent",
                                            color:
                                              isSubShapeSelected ||
                                                subShape.id === selectedShapeId
                                                ? "white"
                                                : "black",
                                          }}
                                        >
                                          {subShape.name}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            } else {
                              return (
                                <div
                                  key={shape.id}
                                  onClick={() => handleSelectShape(shape.id)}
                                  draggable
                                  onDragStart={(e) =>
                                    handleDragStart(e, shape.id)
                                  }
                                  style={{
                                    cursor: "pointer",
                                    fontSize: "15px",
                                    padding: "5px 10px",
                                    backgroundColor:
                                      isSelected || shape.id === selectedShapeId
                                        ? "#222222"
                                        : "transparent",
                                    color:
                                      isSelected || shape.id === selectedShapeId
                                        ? "white"
                                        : "black",
                                  }}
                                >
                                  {shape.name}
                                </div>
                              );
                            }
                          })}
                        </div>
                      )}
                  </div>
                );
              })}
            </li>
            <li
              className={`tab-content tab-content-2 typography ${activeTab === "undo-history" ? "active" : ""
                }`}
            >
              {/* <h6>Undo History</h6> */}
              <div className="history-tools d-flex py-2 gap-5">
                <ul
                  style={{
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  {undoHistory.map((entry, index) => (
                    <li key={index}>
                      <button
                        onClick={() => dispatch(jumpToHistory(index))}
                        style={{
                          background: "none",
                          border: "1px solid #ccc",
                          marginTop: "5px",
                          padding: "5px 10px",
                          cursor: "pointer",
                        }}
                      >
                        {entry.action}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;