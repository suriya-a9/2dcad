import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setFillColorForSelectedShape,
    setStrokeColorForSelectedShape,
    setStrokeWidthForSelectedShape,
    setStrokeStyleForSelectedShape,
} from "../../Redux/Slice/toolSlice";
import "./FillStrokeDialog.css";

const FillStrokeDialog = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const selectedShapeId = useSelector((state) => state.tool.selectedShapeId);
    const shapes = useSelector((state) => state.tool.layers.flatMap((layer) => layer.shapes));
    const selectedShape = shapes.find((shape) => shape.id === selectedShapeId);

    const [fillColor, setFillColorState] = useState(selectedShape?.fill || "#744646");
    const [strokeColor, setStrokeColorState] = useState(selectedShape?.stroke || "#46745D");
    const [strokeWidth, setStrokeWidthState] = useState(selectedShape?.strokeWidth || 1);
    const [strokeStyle, setStrokeStyleState] = useState(selectedShape?.strokeStyle || "line");

    const handleApply = () => {
        if (selectedShapeId) {
            dispatch(setFillColorForSelectedShape(fillColor));
            dispatch(setStrokeColorForSelectedShape(strokeColor));
            dispatch(setStrokeWidthForSelectedShape(strokeWidth));
            dispatch(setStrokeStyleForSelectedShape(strokeStyle));
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fill-stroke-dialog">
            <div className="dialog-content">
                <div className="dialog-header">
                    <h3>Fill & Stroke</h3>
                    <p onClick={onClose}>X</p>
                </div>
                <div className="form-group">
                    <label>Fill Color:</label>
                    <input
                        type="color"
                        value={fillColor}
                        onChange={(e) => setFillColorState(e.target.value)}
                        style={{ cursor: "pointer" }}
                    />
                </div>
                <div className="form-group">
                    <label>Stroke Color:</label>
                    <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => setStrokeColorState(e.target.value)}
                        style={{ cursor: "pointer" }}
                    />
                </div>
                <div className="form-group">
                    <label>Stroke Width:</label>
                    <input
                        type="number"
                        min="1"
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidthState(Number(e.target.value))}
                    />
                </div>
                <div className="form-group">
                    <label>Stroke Style:</label>
                    <select
                        value={strokeStyle}
                        onChange={(e) => setStrokeStyleState(e.target.value)}
                        style={{ cursor: "pointer" }}
                    >
                        <option value="line">Line</option>
                        <option value="dotted">Dotted</option>
                        <option value="dashed">Dashed</option>
                    </select>
                </div>
                <div className="dialog-actions">
                    <button onClick={handleApply}>Apply</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default FillStrokeDialog;