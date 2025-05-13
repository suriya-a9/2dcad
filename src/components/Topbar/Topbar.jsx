import "./Topbar.css";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setFontSize, setFontFamily, setAlignment, setFontStyle, clearPoints, handleUnion, intersection } from "../../Redux/Slice/toolSlice";
import { setBezierOption } from "../../Redux/Slice/toolSlice";
import { BsVectorPen } from "react-icons/bs";
import { TbBrandSnapseed } from "react-icons/tb";
import { FaBezierCurve, FaProjectDiagram, FaDrawPolygon, FaPlus, FaLink, FaUnlink } from "react-icons/fa";
import { MdRoundedCorner, MdOutlineVerticalAlignTop } from "react-icons/md";
import { AiOutlineVerticalAlignBottom } from "react-icons/ai";
import { GiStraightPipe } from "react-icons/gi";
import { PiPath } from "react-icons/pi";
import { setSelectedTool } from "../../Redux/Slice/toolSlice";
import { EditorState, ContentState } from "draft-js";
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
}) => {
  const selectedTool = useSelector((state) => state.tool.selectedTool);
  const dispatch = useDispatch();
  const layers = useSelector((state) => state.tool.layers);
  const fillColor = useSelector((state) => state.tool.fillColor);
  const strokeColor = useSelector((state) => state.tool.strokeColor);

  const navigate = useNavigate();

  let selectedShapeId = useSelector((state) => state.tool.selectedShapeId);
  const shapes = useSelector(
    (state) => state.tool.layers[state.tool.selectedLayerIndex].shapes || []
  );
  const selectedLayerIndex = useSelector(
    (state) => state.tool.selectedLayerIndex
  );

  const selectedShape =
    shapes.find((shape) => shape.id === selectedShapeId) || {};

  const [isRenaming, setIsRenaming] = useState(false);
  const [newLayerName, setNewLayerName] = useState("");
  const fileInputRef = useRef(null);

  const handleRenameLayer = () => {
    if (selectedLayerIndex !== null) {
      setIsRenaming(true);
      setNewLayerName(layers[selectedLayerIndex].name);
    }
  };

  const handleSaveClick = () => {
    dispatch(saveState());
    if (handleSave) handleSave();
    alert("Design saved successfully!");
  };

  const handleSaveAsClick = () => {
    const name = prompt("Enter a name for the file:") || "design";
    const savedData = {
      layers: layers,
      selectedTool: selectedTool,
      strokeColor: strokeColor,
      fillColor: fillColor,
    };

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

  const handleUndo = useCallback(() => {
    dispatch(undo());
  }, [dispatch]);

  const handlRedo = useCallback(() => {
    dispatch(redo());
  }, [dispatch]);

  const handleCut = useCallback(() => {
    dispatch(cut());
  }, [dispatch]);

  const handleCopy = useCallback(() => {
    dispatch(copy());
  }, [dispatch]);

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

  const handleAddLayer = () => {
    dispatch(addLayer());
  };

  const moveLayerUpHandler = () => {
    if (!selectedShapeId && selectedLayerIndex > 0) {
      dispatch(moveLayerUp());
    }
  };
  const moveLayerDownHandler = () => {
    if (!selectedShapeId && selectedLayerIndex < layers.length - 1) {
      dispatch(moveLayerDown());
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
  const handleResetFlip = () => {
    if (selectedShapeId) {
      dispatch(
        updateShapePosition({ id: selectedShapeId, scaleX: 1, scaleY: 1 })
      );
    }
  };
  const handleDuplicateLayer = () => {
    dispatch(duplicateLayer());
  };

  const handleDuplicateShape = () => {
    if (selectedShapeId) {
      dispatch(duplicateShape());
    }
  };

  const handleToggleLayerVisibility = () => {
    dispatch(toggleLayerVisibility());
  };

  const handleGroupShapes = () => {
    dispatch(groupShapes());
  };

  const handleUngroupShapes = () => {
    if (selectedGroupId) {
      dispatch(ungroupShapes({ groupId: selectedGroupId }));
      setSelectedGroupId(null);
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

  const handleQuit = () => {
    navigate("/");
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

  const EditOptions = [
    { id: 1, label: "Undo...", onClick: handleUndo },
    { id: 2, label: "Redo...", onClick: handlRedo },
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
        { id: 71, label: "In Place" },
        { id: 72, label: "On Page" },
        { id: 73, label: "Style" },
        { id: 74, label: "Size" },
        { id: 75, label: "Width" },
        { id: 76, label: "Height" },
        { id: 77, label: "Size Separately" },
        { id: 78, label: "Width Separately" },
        { id: 79, label: "Height Separately" },
      ],
    },
    { id: 8, label: "Find/Replace ...." },
    { id: 9, label: "Duplicate...", onClick: handleDuplicateShape },
    {
      id: 10,
      label: "Clone",
      subMenu: [
        { id: 101, label: "Create Clone", onClick: handleDuplicateShape },
        { id: 102, label: "Create Tiled Clones" },
        { id: 103, label: "Unlink Clone" },
        { id: 104, label: "Unlink Clones Recursively" },
        { id: 105, label: "Relink to Copied" },
        { id: 106, label: "Select Original" },
        { id: 107, label: "Clone Original" },
        { id: 108, label: "Path (LPE)" },
      ],
    },
    { id: 11, label: "Make a Bitmap Copy" },
    { id: 12, label: " Select All...", onClick: handleSelectAll },
    { id: 13, label: "Select All in All Layers" },
    {
      id: 14,
      label: "Select Same",
      subMenu: [
        { id: 141, label: "Fill and Stroke" },
        { id: 142, label: "Fill Color" },
        { id: 143, label: "Stroke Color" },
        { id: 144, label: "Stroke Style" },
        { id: 145, label: "Object Type" },
      ],
    },
    { id: 15, label: "Invert Selection" },
    { id: 16, label: "Deselect... ", onClick: handleDeselectAll },
    { id: 17, label: "Resize Page to selection" },
    { id: 18, label: "Create guide around the current page" },
    { id: 19, label: "Lock all guides" },
    { id: 20, label: "Delete all guides" },
    { id: 21, label: "XML Editor" },
  ];

  const ViewOptions = [
    {
      id: 1,
      label: "Zoom",
      icon: <MdOutlineArrowRight style={{ fontSize: "25px" }} />,
      subItems: [
        { label: "Zoom In", onClick: handleZoomIn },
        { label: "Zoom Out", onClick: handleZoomOut },
        { label: "Zoom to 1:1" },
        { label: "Zoom to 1:2" },
        { label: "Zoom to 2:1" },
        { label: "Zoom Selection" },
        { label: "Zoom Drawing" },
        { label: "Zoom Page" },
        { label: "Zoom Page Width" },
        { label: "Center Page" },
        { label: "Zoom Previous" },
        { label: "Zoom Next" },
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
        { label: "Lock Rotation" },
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
        },
        {
          type: "radio",
          id: "Outline",
          name: "DisplayMode",
          value: "Outline",
          label: "Outline",
        },
        {
          type: "radio",
          id: "OutlineOverlay",
          name: "DisplayMode",
          value: "OutlineOverlay",
          label: "Outline Overlay",
        },
        {
          type: "radio",
          id: "EnhanceThinLines",
          name: "DisplayMode",
          value: "EnhanceThinLines",
          label: "Enhance Thin Lines",
        },
        {
          type: "radio",
          id: "NoFilters",
          name: "DisplayMode",
          value: "NoFilters",
          label: "No Filters",
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
      id: "GrayScale",
      name: "GrayScale",
      value: "GrayScale",
      label: "Gray Scale",
    },
    {
      id: 7,
      type: "checkbox",
      id: "ColorManagement",
      name: "ColorManagement",
      value: "ColorManagement",
      label: "Color Management",
    },
    {
      id: 8,
      type: "checkbox",
      id: "PageGrid",
      name: "PageGrid",
      value: "PageGrid",
      label: "Page Grid",
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
          id: "SnapControlsBar",
          name: "SnapControlsBar",
          value: "SnapControlsBar",
          label: "Snap Controls Bar",
        },
        {
          type: "checkbox",
          id: "ToolControlsBar",
          name: "ToolControlsBar",
          value: "ToolControlsBar",
          label: "Tool Controls Bar",
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
      label: "Show/ Hide Dialogues",
    },
    {
      id: 13,
      label: "Command Palette",
    },
    {
      id: 14,
      type: "separator",
    },
    {
      id: 15,
      label: "Swatches",
    },
    {
      id: 16,
      label: "Messages",
    },
    {
      id: 17,
      label: "Previous Window",
    },
    {
      id: 18,
      label: "Next Window",
    },
    {
      id: 19,
      type: "separator",
    },
    {
      id: 20,
      label: "Icon Preview",
    },
    {
      id: 21,
      label: "Duplicate Window",
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
    { id: 7, label: "Lock/Unlock Current Layer" },
    { id: 8, type: "divider" },
    { id: 9, label: "Switch to Layer Above", onClick: moveLayerUpHandler },
    { id: 10, label: "Switch to Layer Below", onClick: moveLayerDownHandler },
    { id: 11, type: "divider" },
    { id: 12, label: "Move Selection to Layer Above" },
    { id: 13, label: "Move Selection to Layer Below" },
    { id: 14, label: "Move Selection to Layer" },
    { id: 15, type: "divider" },
    { id: 16, label: "Layer to Top", href: "#" },
    { id: 17, label: "Raise Layer", href: "#" },
    { id: 18, label: "Lower Layer", href: "#" },
    { id: 19, label: "Layer to Bottom", href: "#" },
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
    { label: "Fill and Stroke", onClick: handleFillAndStroke },
    { label: "Object Properties" },
    { label: "Symbols" },
    { label: "Paint Servers" },
    { label: "Selectors and CSS" },
    "divider",
    { label: "Group", onClick: handleGroupShapes },
    { label: "UnGroup", onClick: handleUngroupShapes },
    { label: "Pop Selected objects out of groups" },
    {
      label: "Clip",
      subMenu: [
        { label: "Set Clip" },
        { label: "Set Inverse Clip (LPE)" },
        { label: "Release Clip" },
      ],
    },
    {
      label: "Mask",
      subMenu: [
        { label: "Set Mask" },
        { label: "Set Inverse Mask (LPE)" },
        { label: "Release Mask" },
      ],
    },
    {
      label: "Pattern",
      subMenu: [
        { label: "Objects to Pattern" },
        { label: "Pattern to Objects" },
      ],
    },
    "divider",
    { label: "Objects to Marker" },
    { label: "Objects to Guide" },
    "divider",
    { label: "Raise to top" },
    { label: "Raise" },
    { label: "Lower" },
    { label: "Lower to bottom" },
    "divider",
    { label: "Rotate 90 CW", onClick: handleRotateClockwise },
    { label: "Rotate 90 ACW", onClick: handleRotateCounterClockwise },
    { label: "Flip Horizontal", onClick: handleFlipHorizontal },
    { label: "Flip Vertical", onClick: handleFlipVertical },
    "divider",
    { label: "Unhide All" },
    { label: "Unlock All" },
    "divider",
    { label: "Transform" },
    { label: "Align & Distribute" },
    "divider",
  ];

  const PathOptions = [
    { label: "Object to Path" },
    { label: "Stroke to Path" },
    { label: "Trace Bitemap..." },
    "divider",
    { label: "Union", onClick: () => dispatch(handleUnion()) },
    { label: "Difference" },
    { label: "intersection", onClick: () => dispatch(intersection()) },
    { label: "Exclusion" },
    { label: "Division" },
    { label: "Cut Path" },
    "divider",
    { label: "Combine" },
    { label: "Break Apart" },
    { label: "Split Path" },
    { label: "Fracture" },
    { label: "Flatten" },
    "divider",
    { label: "inset" },
    { label: "Outset" },
    { label: "Dynamic Offset" },
    { label: "Linked Offset" },
    "divider",
    { label: "Difference" },
    "divider",
    { label: "Simplify" },
    { label: "Reverse" },
    { label: "Path Effects..." },
    { label: "Paste Path Effect" },
    { label: "Remove Path Effect" },
  ];

  const HelpOptions = [
    { label: "Cad Manual", link: "#" },
    { label: "Tutorial", link: "#" },
    { label: "Learn More", link: "#" },
    { label: "New in this Version", link: "#" },
    { label: "About Cad", link: "#" },
  ];

  return (
    <div>
      <nav className="navbar navbar-expand-lg">
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
                          onClick={handleCreateNewPage}
                        >
                          New...
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item">New Form Template</a>
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
                        <a className="dropdown-item">Open Recent</a>
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
                        <a className="dropdown-item" href="#">
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
                        <a className="dropdown-item">Document Resources</a>
                      </li>
                      <hr style={{ margin: "0px" }} />
                      <li>
                        <a className="dropdown-item" onClick={handleCleanUp}>
                          Document Properties
                        </a>
                      </li>
                      <hr style={{ margin: "0px" }} />
                      <li>
                        <a className="dropdown-item" href="#">
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
                                  <a href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (sub.onClick) sub.onClick();
                                    }}
                                  >{sub.label}</a>
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
                              <a className="dropdown-item">{item.label}</a>
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
                      Path
                    </a>
                    <ul className="dropdown-menu" style={{ cursor: "pointer" }}>
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
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      Filter
                    </a>
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
      </nav>
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
          ) : (
            <DefaultTopbar />
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;

function DefaultTopbar() {
  const selectedTool = useSelector((state) => state.tool.selectedTool);
  const dispatch = useDispatch();
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


      if (name === "horizontalRadius" || name === "verticalRadius") {
        const shape = shapes.find((shape) => shape.id === selectedShapeId);
        if (shape) {
          const horizontalRadius = name === "horizontalRadius" ? newValue : shape.horizontalRadius || 0;
          const verticalRadius = name === "verticalRadius" ? newValue : shape.verticalRadius || 0;

          updatedShape.radius = Math.max(horizontalRadius, verticalRadius);
        }
      }

      dispatch(updateShapePosition(updatedShape));
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
  return (
    <>
      <div className="d-flex flex-row mb-3" style={{ alignItems: "center" }}>
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
          <label htmlFor="X">X: &nbsp;</label>
          <input
            type="number"
            name="x"
            id="X"
            step={0.01}
            placeholder="0.00"
            value={selectedShape.x ?? shapes?.[shapes?.length - 1]?.x ?? 0}
            onChange={handleInputChange}
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="Y">Y: &nbsp;</label>
          <input
            type="number"
            name="y"
            id="Y"
            step={0.01}
            placeholder="0.00"
            value={selectedShape.y ?? shapes?.[shapes?.length - 1]?.y ?? 0}
            onChange={handleInputChange}
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="skewX">Skew X: &nbsp;</label>
          <input
            type="number"
            name="skewX"
            id="skewX"
            step={1}
            placeholder="0"
            value={selectedShape.skewX || 0}
            onChange={(e) => handleSkewChange("skewX", e.target.value)}
          />
        </div>
        <div className="p-2 value">
          <label htmlFor="skewY">Skew Y: &nbsp;</label>
          <input
            type="number"
            name="skewY"
            id="skewY"
            step={1}
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
              ? { display: "block" }
              : { display: "none" }
          }
        >
          <label htmlFor="W">W: &nbsp;</label>
          <input
            type="number"
            name="width"
            id="W"
            step={0.01}
            placeholder="0.00"
            value={
              selectedShape.width ?? shapes?.[shapes?.length - 1]?.width ?? 0
            }
            onChange={handleInputChange}
          />
        </div>
        <div
          className="p-2 value"
          style={
            selectedTool === "Rectangle"
              ? { display: "block" }
              : { display: "none" }
          }
        >
          <label htmlFor="H">H: &nbsp;</label>
          <input
            type="number"
            name="height"
            id="H"
            step={0.01}
            placeholder="0.00"
            value={
              selectedShape.height ?? shapes?.[shapes?.length - 1]?.height ?? 0
            }
            onChange={handleInputChange}
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
              : { display: "block" }
          }
        >
          <label htmlFor="Stroke">Stroke: &nbsp;</label>
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
              ? { display: "block" }
              : { display: "none" }
          }
        >
          <label htmlFor="Radius">Radius: &nbsp;</label>
          <input
            type="number"
            name="radius"
            id="radius"
            step={0.01}
            placeholder="0.00"
            value={
              selectedShape.radius || shapes?.[shapes?.length - 1]?.radius || 0
            }
            onChange={handleRadiusChange}
          />
        </div>
        <div
          className="p-2 value"
          style={selectedTool === "Circle" ? { display: "block" } : { display: "none" }}
        >
          <label htmlFor="horizontalRadius">Horizontal Radius: &nbsp;</label>
          <input
            type="number"
            name="horizontalRadius"
            id="horizontalRadius"
            step={1}
            placeholder="0"
            value={selectedShape.horizontalRadius || 0}
            onChange={handleRadiusChange}
          />
        </div>
        <div
          className="p-2 value"
          style={selectedTool === "Circle" ? { display: "block" } : { display: "none" }}
        >
          <label htmlFor="verticalRadius">Vertical Radius: &nbsp;</label>
          <input
            type="number"
            name="verticalRadius"
            id="verticalRadius"
            step={1}
            placeholder="0"
            value={selectedShape.verticalRadius || 0}
            onChange={handleRadiusChange}
          />
        </div>
        <div
          className="p-2 value"
          style={
            selectedTool === "Star" || selectedTool === "Polygon"
              ? { display: "block" }
              : { display: "none" }
          }
        >
          <label htmlFor="Corners">Corners: &nbsp;</label>
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
          style={selectedTool === "Star" ? { display: "block" } : { display: "none" }}
        >
          <label htmlFor="spokeRatio">Spoke Ratio: &nbsp;</label>
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
          style={selectedTool === "Star" ? { display: "block" } : { display: "none" }}
        >
          <label htmlFor="rounded">Rounded: &nbsp;</label>
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
          style={selectedTool === "Star" ? { display: "block" } : { display: "none" }}
        >
          <label htmlFor="randomized">Randomized: &nbsp;</label>
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

  return (
    <div className="d-flex flex-row mb-3 top-icons" style={{ alignItems: "center", color: "white" }}>
      {/* Dropdown for Calligraphy Options */}
      <div className="p-2 value" style={{ display: "flex", alignItems: "center" }}>
        <label>Calligraphy Options: &nbsp;</label>
        <select
          value={calligraphyOption}
          onChange={(e) => handleOptionSelect(e.target.value)}
          style={{ padding: "5px", borderRadius: "4px", height: '40px' }}
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
    </div>
  );
}
function NodeTopbar() {
  const dispatch = useDispatch();
  const selectedTool = useSelector((state) => state.tool.selectedTool);

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
    dispatch({ type: "MAKE_SELECTED_NODES_SMOOTH" });
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

  useEffect(() => {
    console.log("Updated selectedTool:", selectedTool);
  }, [selectedTool]);

  return (
    <div className="d-flex flex-row mb-3 top-icons" style={{ alignItems: "center", color: "white" }}>
      {/* Insert Node */}
      <div className="p-2 top-icon" onClick={handleInsertNode}>
        <FaPlus size={20} title="Insert Node" />
      </div>

      {/* Join Selected Nodes */}
      <div className="p-2 top-icon" onClick={handleJoinSelectedNodes}>
        <FaLink size={20} title="Join Selected Nodes" />
      </div>

      {/* Join Selected Endnodes with a New Segment */}
      <div className="p-2 top-icon" onClick={handleJoinEndNodesWithSegment}>
        <FaBezierCurve size={20} title="Join Selected Endnodes with a New Segment" />
      </div>

      {/* Separate Selected Paths */}
      <div className="p-2 top-icon" onClick={handleSeparatePaths}>
        <FaUnlink size={20} title="Separate Selected Paths" />
      </div>

      {/* Make Selected Nodes Corner */}
      <div className="p-2 top-icon" onClick={handleMakeNodesCorner}>
        <FaDrawPolygon size={20} title="Make Selected Nodes Corner" />
      </div>

      {/* Make Selected Nodes Smooth */}
      <div className="p-2 top-icon" onClick={handleMakeNodesSmooth}>
        <FaBezierCurve size={20} title="Make Selected Nodes Smooth" />
      </div>

      {/* Make Selected Nodes Curve */}
      <div className="p-2 top-icon" onClick={handleCurveLine}>
        <FaBezierCurve size={20} title="Make Selected Nodes Curve line" />
      </div>

      {/* Make Selected Nodes Straight */}
      <div className="p-2 top-icon" onClick={handleStraightLine}>
        <GiStraightPipe size={20} title="Make Selected Nodes Straight line" />
      </div>

      {/* Make Shape Rounded Corner */}
      <div className="p-2 top-icon" onClick={handleShapeCorner}>
        <MdRoundedCorner size={20} title="Make Selected Shapes Rounded Corner" />
      </div>
      {/* Make Stroke to Path */}
      <div className="p-2 top-icon" onClick={handleStrokePath}>
        <PiPath size={20} title="Make Strokr to Path" />
      </div>
    </div>
  );
}
function PencilTopbar() {
  const dispatch = useDispatch();
  const pencilOption = useSelector((state) => state.tool.pencilOption);
  const pencilSmoothing = useSelector((state) => state.tool.pencilSmoothing);
  const pencilMode = useSelector((state) => state.tool.pencilMode);
  const pencilScale = useSelector((state) => state.tool.pencilScale);

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

  return (
    <div className="d-flex flex-row mb-3" style={{ alignItems: "center", color: "white" }}>
      {/* Dropdown for Pencil Options */}
      <div className="p-2 value" style={{ display: "flex", alignItems: "center", padding: "0.3rem" }}>
        <label>Pencil Options: &nbsp;</label>
        <select
          value={pencilOption}
          onChange={(e) => handleOptionSelect(e.target.value)}
          style={{ padding: "0px", borderRadius: "4px", height: '30px' }}
        >
          <option value="None">None</option>
          <option value="TriangleIn">Triangle In</option>
          <option value="TriangleOut">Triangle Out</option>
          <option value="Ellipse">Ellipse</option>
        </select>
      </div>

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
          max="5"
          step="0.1"
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

function TextEditorTopbar({ onStyleChange, selectedShapeId }) {
  const dispatch = useDispatch();
  const selectedFontSize = useSelector((state) => state.tool.selectedFontSize);
  const selectedFontFamily = useSelector((state) => state.tool.selectedFontFamily);
  const selectedAlignment = useSelector((state) => state.tool.selectedAlignment);
  const selectedFontStyle = useSelector((state) => state.tool.selectedFontStyle);

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


    if (transformType === "uppercase") {
      transformedText = currentText.toUpperCase();
    } else if (transformType === "lowercase") {
      transformedText = currentText.toLowerCase();
    } else if (transformType === "capitalize") {
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
  return (
    <div className="text-editor-topbar" style={{
      direction: textDirection,
      textAlign: textDirection === "rtl" ? "right" : "left",
    }}>
      <label>Font Family</label>
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

      <label>Font Size</label>
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

      <label>Font Alignment</label>
      <select value={selectedAlignment} onChange={handleAlignmentChange}>
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
      </select>

      <label>Font Style</label>
      <select value={selectedFontStyle} onChange={handleFontStyleChange}>
        <option value="normal">Normal</option>
        <option value="bold">Bold</option>
        <option value="italic">Italic</option>
        <option value="bold italic">Bold Italic</option>
      </select>

      <label>Text Transform</label>
      <select onChange={handleTextTransformChange}>
        <option value="none">None</option>
        <option value="uppercase">Uppercase</option>
        <option value="lowercase">Lowercase</option>
        <option value="capitalize">Capitalize</option>
      </select>
      <label>Text Direction</label>
      <select
        onChange={(e) => handleTextDirectionChange(e.target.value)}
        defaultValue="ltr"
      >
        <option value="ltr">Left to Right</option>
        <option value="rtl">Right to Left</option>
      </select>
      <label>Block Progression</label>
      <select
        onChange={(e) => handleBlockProgressionChange(e.target.value)}
        defaultValue="normal"
      >
        <option value="normal">Normal</option>
        <option value="topToBottom">Top to Bottom</option>
      </select>
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
  const layers = useSelector((state) => state.tool.layers);
  const selectedLayerIndex = useSelector(
    (state) => state.tool.selectedLayerIndex
  );

  const handleInputChange = (field, value) => {
    dispatch(setSprayProperties({ [field]: value }));
  };

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
        <div className="p-2 top-icon">
          <FaClone
            data-tooltip-content="Spray Objects in a Single Path"
            data-tooltip-id="tool-top"
          />
        </div>
        <div className="p-2 top-icon">
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
            value={sprayAmount}
            onChange={(e) =>
              handleInputChange("sprayAmount", Number(e.target.value))
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
            step={1}
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