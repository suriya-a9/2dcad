import { GrSelect } from "react-icons/gr";
import "./LeftSidebar.css";
import { AiOutlineNodeIndex } from "react-icons/ai";
import { FaRegCircle, FaRegSquare, FaRegStar } from "react-icons/fa";
import { BiPolygon, BiSolidEraser, BiSolidEyedropper } from "react-icons/bi";
import { TiSpiral } from "react-icons/ti";
import { BsPaintBucket, BsPencil, BsVectorPen } from "react-icons/bs";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoText } from "react-icons/io5";
import { PiPaintBrush } from "react-icons/pi";
import { MdGradient } from "react-icons/md";
import { GiSpray } from "react-icons/gi";
import { Tooltip } from "react-tooltip";
import { LuBox } from "react-icons/lu";
import { FaArrowTrendDown } from "react-icons/fa6";
import "react-tooltip/dist/react-tooltip.css";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedTool } from "../../Redux/Slice/toolSlice";
import { LiaRulerVerticalSolid } from "react-icons/lia";
import { ImCopy } from "react-icons/im";
import { CgPathDivide } from "react-icons/cg";
import { FcLightAtTheEndOfTunnel } from "react-icons/fc";
import { GiColombia } from "react-icons/gi";
import { LuCircuitBoard } from "react-icons/lu";
const LeftSidebar = () => {
  const dispatch = useDispatch();
  const selectedTool = useSelector((state) => state.tool.selectedTool);

  const handleToolSelect = (tool) => {
    console.log("Selected Tool:", tool);
    dispatch(setSelectedTool(tool));
  };

  return (
    <div className={`left-sidebar cursor-${selectedTool?.toLowerCase()}`}>
      <div className="d-flex mb-3" style={{ flexDirection: 'row !important' }}>
        <div className="left-icons">
          <div
            className={`p-2 left-icon${selectedTool === "Select" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Select")}
          >
            <GrSelect
              data-tooltip-content="Select"
              data-tooltip-id="tool-left"
            />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "Node" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Node")}
          >
            <AiOutlineNodeIndex
              data-tooltip-content="Node"
              data-tooltip-id="tool-left"
            />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "ShapeBuilder" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("ShapeBuilder")}
          >
            <CgPathDivide
              data-tooltip-content="Shape Builder Tool"
              data-tooltip-id="tool-left"
            />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "Rectangle" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Rectangle")}
          >
            <FaRegSquare
              data-tooltip-content="Rectangle"
              data-tooltip-id="tool-left"
            />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "Circle" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Circle")}
          >
            <FaRegCircle
              data-tooltip-content="Circle"
              data-tooltip-id="tool-left"
            />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "Star" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Star")}
          >
            <FaRegStar
              data-tooltip-content="Star"
              data-tooltip-id="tool-left"
            />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "Polygon" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Polygon")}
          >
            <BiPolygon
              data-tooltip-content="Polygon"
              data-tooltip-id="tool-left"
            />
          </div>
          {/* <div
            className={`p-2 left-icon${selectedTool === "Select" ? " selected-tool" : ""}`}
          >
            <LuBox
              data-tooltip-content="3D Box Tool"
              data-tooltip-id="tool-left"
            />
          </div> */}
          <div
            className={`p-2 left-icon${selectedTool === "Spiral" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Spiral")}
          >
            <TiSpiral
              data-tooltip-content="Spiral"
              data-tooltip-id="tool-left"
            />
          </div>
          {/* <div
            className={`p-2 left-icon${selectedTool === "Pen" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Pen")}
          >
            <BsVectorPen
              data-tooltip-content="Pen"
              data-tooltip-id="tool-left"
            />
          </div> */}
          <div
            className={`p-2 left-icon${selectedTool === "Bezier" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Bezier")}
          >
            <BsVectorPen
              data-tooltip-content="Bezier"
              data-tooltip-id="tool-left"
            />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "Pencil" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Pencil")}
          >
            <BsPencil
              data-tooltip-content="Pencil"
              data-tooltip-id="tool-left"
            />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "Calligraphy" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Calligraphy")}
          >
            <PiPaintBrush
              data-tooltip-content="Calligraphy"
              data-tooltip-id="tool-left"
            />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "Dropper" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Dropper")}
          >
            <BiSolidEyedropper
              data-tooltip-content="Dropper"
              data-tooltip-id="tool-left"
            />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "PaintBucket" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("PaintBucket")}
          >
            <BsPaintBucket
              data-tooltip-content="Paint Bucket"
              data-tooltip-id="tool-left"
            />
          </div>
          {/* <div className="p-2 right-icon"> <input type="color" name="" id="" style={{ inlineSize: "20px", blockSize: "20px" }} /> </div> */}
          <div
            className={`p-2 left-icon${selectedTool === "Eraser" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Eraser")}
          >
            <BiSolidEraser
              data-tooltip-content="Eraser"
              data-tooltip-id="tool-left"
            />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "Connector" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Connector")}
          >
            <FaArrowTrendDown
              data-tooltip-content="Connector Tool"
              data-tooltip-id="tool-left"
            />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "Text" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Text")}
          >
            <IoText data-tooltip-content="Text" data-tooltip-id="tool-left" />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "Gradient" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Gradient")}
          >
            <MdGradient data-tooltip-content="Gradient" data-tooltip-id="tool-left" />
          </div>
          {/* <div
            className={`p-2 left-icon${selectedTool === "Select" ? " selected-tool" : ""}`}
          >
            <MdGradient
              data-tooltip-content="Gradient Tool"
              data-tooltip-id="tool-left"
            />
          </div> */}
          <div
            className={`p-2 left-icon${selectedTool === "Mesh" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Mesh")}
          >
            <LuCircuitBoard
              data-tooltip-content="Mesh Tool"
              data-tooltip-id="tool-left"
            />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "Tweak" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Tweak")}
          >
            <GiColombia
              data-tooltip-content="Tweak Tool"
              data-tooltip-id="tool-left"
            />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "Spray" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Spray")}
          >
            <GiSpray data-tooltip-content="Spray" data-tooltip-id="tool-left" />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "Measurement" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Measurement")}
          >
            <LiaRulerVerticalSolid data-tooltip-content="Measure Tool" data-tooltip-id="tool-left" />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "Zoom" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Zoom")}
          >
            <FaMagnifyingGlass data-tooltip-content="Zoom Tool" data-tooltip-id="tool-left" />
          </div>
          <div
            className={`p-2 left-icon${selectedTool === "Pages" ? " selected-tool" : ""}`}
            onClick={() => handleToolSelect("Pages")}
          >
            <ImCopy data-tooltip-content="Pages Tool" data-tooltip-id="tool-left" />
          </div>
          <Tooltip id="tool-left" place="right" />
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;