import { VscNewFile } from "react-icons/vsc";
import FillStrokeDialog from "../Dialogs/FillStrokeDialog";
import "./RightSidebar.css";
import {
  FaChevronDown,
  FaChevronUp,
  FaRegCopy,
  FaRegFolderOpen,
} from "react-icons/fa";
import { BiLayerPlus, BiRectangle, BiSave } from "react-icons/bi";
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
} from "../../Redux/Slice/toolSlice";
import { useCallback, useRef, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaTools } from "react-icons/fa";
import { RiFileSettingsLine } from "react-icons/ri";
import { PiChartBarHorizontalFill } from "react-icons/pi";
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
          <div className="p-2 right-icon" onClick={() => dispatch(zoomIn())}>
            <LuZoomIn
              data-tooltip-content="Zoom In"
              data-tooltip-id="tool-right"
            />
          </div>
          <div className="p-2 right-icon" onClick={() => dispatch(zoomOut())}>
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
            {/* <div className="p-2 right-icon">
              <HiDuplicate
                data-tooltip-content="Duplicate"
                data-tooltip-id="tool-top"
                x
              />
            </div> */}
            {/* <div className="p-2 right-icon">
              <LuFileLock
                data-tooltip-content="Clone"
                data-tooltip-id="tool-top"
                x
              />
            </div> */}
            {/* <div className="p-2 right-icon">
              <FaClone
                data-tooltip-content="Unlink Clone"
                data-tooltip-id="tool-top"
                x
              />
            </div> */}
            {/* <div className="p-2 right-icon">
              <FaObjectGroup
                data-tooltip-content="Group"
                data-tooltip-id="tool-top"
                x
              />
            </div> */}
            {/* <div className="p-2 right-icon">
              <FaObjectUngroup
                data-tooltip-content="Ungroup"
                data-tooltip-id="tool-top"
                x
              />
            </div> */}
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
            {/* <div className="p-2 right-icon">
              <PiChartBarHorizontalFill
                data-tooltip-content="Align and Distribute"
                data-tooltip-id="tool-top"
              />
            </div> */}
            {/* <div className="p-2 right-icon">
              <RiFileSettingsLine
                data-tooltip-content="Document Properties"
                data-tooltip-id="tool-top"
              />
            </div> */}
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