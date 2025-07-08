import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setFillColorForSelectedShape,
    setStrokeColorForSelectedShape,
    setStrokeWidthForSelectedShape,
    setStrokeStyleForSelectedShape,
    setMarkerForSelectedShape,
} from "../../Redux/Slice/toolSlice";
import "./FillStrokeDialog.css";
const MARKERS = [
    {
        id: "none",
        label: "None",
        svg: null,
    },
    {
        id: "arrow",
        label: "Arrow",
        svg: (
            <svg width="24" height="24">
                <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L10,3.5 L0,7 Z" fill="#222" />
                </marker>
                <line x1="2" y1="12" x2="22" y2="12" stroke="#222" strokeWidth="2" markerEnd="url(#arrow)" />
            </svg>
        ),
    },
    {
        id: "dot",
        label: "Dot",
        svg: (
            <svg width="24" height="24">
                <marker id="dot" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
                    <circle cx="3" cy="3" r="3" fill="#222" />
                </marker>
                <line x1="2" y1="12" x2="22" y2="12" stroke="#222" strokeWidth="2" markerEnd="url(#dot)" />
            </svg>
        ),
    },

];
const FillStrokeDialog = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const selectedShapeId = useSelector((state) => state.tool.selectedShapeId);
    const shapes = useSelector((state) => state.tool.layers.flatMap((layer) => layer.shapes));
    const selectedShape = shapes.find((shape) => shape.id === selectedShapeId);

    const [fillColor, setFillColorState] = useState(selectedShape?.fill || "#744646");
    const [strokeColor, setStrokeColorState] = useState(selectedShape?.stroke || "#46745D");
    const [strokeWidth, setStrokeWidthState] = useState(selectedShape?.strokeWidth || 1);
    const [strokeStyle, setStrokeStyleState] = useState(selectedShape?.strokeStyle || "line");

    const [markerStart, setMarkerStart] = useState(selectedShape?.markerStart || "none");
    const [markerMid, setMarkerMid] = useState(selectedShape?.markerMid || "none");
    const [markerEnd, setMarkerEnd] = useState(selectedShape?.markerEnd || "none");
    const customMarkers = useSelector(state => state.tool.markers || []);
    const allMarkers = [
        ...MARKERS,
        ...customMarkers.map(m => ({
            id: m.id,
            label: m.id,
            svg: <span dangerouslySetInnerHTML={{ __html: `<svg width="24" height="24"><defs>${m.svg}</defs><line x1="2" y1="12" x2="22" y2="12" stroke="#222" strokeWidth="2" markerEnd="url(#${m.id})" /></svg>` }} />
        }))
    ];
    const handleApply = () => {
        if (selectedShapeId) {
            dispatch(setFillColorForSelectedShape(fillColor));
            dispatch(setStrokeColorForSelectedShape(strokeColor));
            dispatch(setStrokeWidthForSelectedShape(strokeWidth));
            dispatch(setStrokeStyleForSelectedShape(strokeStyle));
            dispatch(setMarkerForSelectedShape({
                markerStart,
                markerMid,
                markerEnd,
            }));
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
                <div className="form-group">
                    <label>Markers:</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div>
                            <span style={{ marginRight: 8 }}>Start:</span>
                            {allMarkers.map(marker => (
                                <button
                                    key={marker.id}
                                    style={{
                                        border: markerStart === marker.id ? "2px solid #007bff" : "1px solid #ccc",
                                        background: "#fff",
                                        marginRight: 4,
                                        padding: 2,
                                        borderRadius: 4,
                                    }}
                                    onClick={() => setMarkerStart(marker.id)}
                                    title={marker.label}
                                >
                                    {marker.svg || <span style={{ padding: "0 8px" }}>None</span>}
                                </button>
                            ))}
                        </div>
                        <div>
                            <span style={{ marginRight: 8 }}>Mid:</span>
                            {allMarkers.map(marker => (
                                <button
                                    key={marker.id}
                                    style={{
                                        border: markerMid === marker.id ? "2px solid #007bff" : "1px solid #ccc",
                                        background: "#fff",
                                        marginRight: 4,
                                        padding: 2,
                                        borderRadius: 4,
                                    }}
                                    onClick={() => setMarkerMid(marker.id)}
                                    title={marker.label}
                                >
                                    {marker.svg || <span style={{ padding: "0 8px" }}>None</span>}
                                </button>
                            ))}
                        </div>
                        <div>
                            <span style={{ marginRight: 8 }}>End:</span>
                            {allMarkers.map(marker => (
                                <button
                                    key={marker.id}
                                    style={{
                                        border: markerEnd === marker.id ? "2px solid #007bff" : "1px solid #ccc",
                                        background: "#fff",
                                        marginRight: 4,
                                        padding: 2,
                                        borderRadius: 4,
                                    }}
                                    onClick={() => setMarkerEnd(marker.id)}
                                    title={marker.label}
                                >
                                    {marker.svg || <span style={{ padding: "0 8px" }}>None</span>}
                                </button>
                            ))}
                        </div>
                    </div>
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