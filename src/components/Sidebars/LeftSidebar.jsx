import { GrSelect } from "react-icons/gr";
import { AiOutlineNodeIndex } from "react-icons/ai";
import { FaRegCircle, FaRegSquare, FaRegStar } from "react-icons/fa";
import { BiPolygon, BiSolidEraser, BiSolidEyedropper } from "react-icons/bi";
import { TiSpiral } from "react-icons/ti";
import { BsPaintBucket, BsPencil, BsVectorPen } from "react-icons/bs";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoText } from "react-icons/io5";
import { PiPaintBrush } from "react-icons/pi";
import { MdGradient } from "react-icons/md";
import { GiSpray, GiColombia } from "react-icons/gi";
import { Tooltip } from "react-tooltip";
import { FaArrowTrendDown } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedTool } from "../../Redux/Slice/toolSlice";
import { LiaRulerVerticalSolid } from "react-icons/lia";
import { ImCopy } from "react-icons/im";
import { CgPathDivide } from "react-icons/cg";
import { LuCircuitBoard } from "react-icons/lu";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { GiCube } from "react-icons/gi";
import React, { useRef, useState } from "react";
import "./LeftSidebar.css";

const LeftSidebar = () => {
  const dispatch = useDispatch();
  const selectedTool = useSelector((state) => state.tool.selectedTool);
  const showToolbox = useSelector((state) => state.tool.visibleIcons.Toolbox);

  const iconListRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleToolSelect = (tool) => {
    dispatch(setSelectedTool(tool));
  };

  const handleScroll = () => {
    if (iconListRef.current) {
      setScrollTop(iconListRef.current.scrollTop);
    }
  };

  if (!showToolbox) return null;

  const icons = [
    { tool: "Select", icon: <GrSelect data-tooltip-content="Select" data-tooltip-id="tool-left" /> },
    { tool: "Node", icon: <AiOutlineNodeIndex data-tooltip-content="Node" data-tooltip-id="tool-left" /> },
    { tool: "ShapeBuilder", icon: <CgPathDivide data-tooltip-content="Shape Builder Tool" data-tooltip-id="tool-left" /> },
    { tool: "Rectangle", icon: <FaRegSquare data-tooltip-content="Rectangle" data-tooltip-id="tool-left" /> },
    { tool: "Circle", icon: <FaRegCircle data-tooltip-content="Circle" data-tooltip-id="tool-left" /> },
    { tool: "Star", icon: <FaRegStar data-tooltip-content="Star" data-tooltip-id="tool-left" /> },
    { tool: "Polygon", icon: <BiPolygon data-tooltip-content="Polygon" data-tooltip-id="tool-left" /> },
    { tool: "3DBox", icon: <GiCube data-tooltip-content="3D Box" data-tooltip-id="tool-left" /> },
    { tool: "Spiral", icon: <TiSpiral data-tooltip-content="Spiral" data-tooltip-id="tool-left" /> },
    { tool: "Bezier", icon: <BsVectorPen data-tooltip-content="Bezier" data-tooltip-id="tool-left" /> },
    { tool: "Pencil", icon: <BsPencil data-tooltip-content="Pencil" data-tooltip-id="tool-left" /> },
    { tool: "Calligraphy", icon: <PiPaintBrush data-tooltip-content="Calligraphy" data-tooltip-id="tool-left" /> },
    { tool: "Dropper", icon: <BiSolidEyedropper data-tooltip-content="Dropper" data-tooltip-id="tool-left" /> },
    { tool: "PaintBucket", icon: <BsPaintBucket data-tooltip-content="Paint Bucket" data-tooltip-id="tool-left" /> },
    { tool: "Eraser", icon: <BiSolidEraser data-tooltip-content="Eraser" data-tooltip-id="tool-left" /> },
    { tool: "Connector", icon: <FaArrowTrendDown data-tooltip-content="Connector Tool" data-tooltip-id="tool-left" /> },
    { tool: "Text", icon: <IoText data-tooltip-content="Text" data-tooltip-id="tool-left" /> },
    { tool: "Gradient", icon: <MdGradient data-tooltip-content="Gradient" data-tooltip-id="tool-left" /> },
    { tool: "Mesh", icon: <LuCircuitBoard data-tooltip-content="Mesh Tool" data-tooltip-id="tool-left" /> },
    { tool: "Tweak", icon: <GiColombia data-tooltip-content="Tweak Tool" data-tooltip-id="tool-left" /> },
    { tool: "Spray", icon: <GiSpray data-tooltip-content="Spray" data-tooltip-id="tool-left" /> },
    { tool: "Measurement", icon: <LiaRulerVerticalSolid data-tooltip-content="Measure Tool" data-tooltip-id="tool-left" /> },
    { tool: "Zoom", icon: <FaMagnifyingGlass data-tooltip-content="Zoom Tool" data-tooltip-id="tool-left" /> },
    { tool: "Pages", icon: <ImCopy data-tooltip-content="Pages Tool" data-tooltip-id="tool-left" /> }
  ];

  const [showUp, setShowUp] = useState(false);
  const [showDown, setShowDown] = useState(false);

  React.useEffect(() => {
    const el = iconListRef.current;
    if (el) {
      setShowUp(el.scrollTop > 0);
      setShowDown(el.scrollTop + el.clientHeight < el.scrollHeight);
    }
  }, [scrollTop, icons.length]);

  const scrollBy = (amount) => {
    if (iconListRef.current) {
      iconListRef.current.scrollBy({ top: amount, behavior: "smooth" });
    }
  };

  return (
    <div className={`left-sidebar cursor-${selectedTool?.toLowerCase()}`}>
      <div className="d-flex mb-3" style={{ flexDirection: 'row !important' }}>
        <div style={{ position: "relative", width: "35px" }}>
          {showUp && (
            <div
              className="sidebar-arrow up-arrow"
              style={{ position: "absolute", top: 0, left: '0px', right: 0, zIndex: 2, textAlign: "center", cursor: "pointer" }}
              onClick={() => scrollBy(-60)}
            >
              <FaChevronUp />
            </div>
          )}
          <div
            className="left-icons"
            ref={iconListRef}
            style={{
              maxHeight: "475px",
              overflowY: "auto",
              paddingTop: showUp ? "24px" : "0",
              paddingBottom: showDown ? "24px" : "0"
            }}
            onScroll={handleScroll}
          >
            {icons.map(({ tool, icon }) => (
              <div
                key={tool}
                className={`p-2 left-icon${selectedTool === tool ? " selected-tool" : ""}`}
                onClick={() => handleToolSelect(tool)}
              >
                {icon}
              </div>
            ))}
          </div>
          {showDown && (
            <div
              className="sidebar-arrow down-arrow"
              style={{ position: "absolute", bottom: 0, left: '0px', right: 0, zIndex: 2, textAlign: "center", cursor: "pointer" }}
              onClick={() => scrollBy(60)}
            >
              <FaChevronDown />
            </div>
          )}
          <Tooltip id="tool-left" place="right" />
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;