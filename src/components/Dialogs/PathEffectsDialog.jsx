import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { simplify, cloneShape, fillBetweenPaths, applyHatchesRough, applyMirrorSymmetry, applyPowerClip, applyPowerMask, applyRotateCopies, sliceShapes } from "../../Redux/Slice/toolSlice";
import BooleanOpsDialog from "./BooleanOpsDialog";
import { shapeToPoints } from "../Panel/Panel";

const INKSCAPE_LPE_CATEGORIES = [
    {
        title: "Edit/Tools",
        effects: [
            "Corners", "Knot", "Offset", "Power stroke", "Simplify", "Taper stroke",
        ]
    },
    {
        title: "Distort",
        effects: [
            "Bend", "Envelope Deformation", "Lattice Deformation", "Pattern Along Path", "Perspective/Envelope", "Roughen", "Transform by 2 points",
        ]
    },
    {
        title: "Generate",
        effects: [
            "Boolean operation", "Clone original", "Fill between many", "Hatches (rough)", "Mirror symmetry", "Power clip", "Power mask", "Rotate copies", "Sketch", "Slice", "Tiling", "VonKoch",
        ]
    },
    {
        title: "Convert",
        effects: [
            "Attach path", "Bounding Box", "Construct grid", "Dashed Stroke", "Ellipse from points", "Gears", "Interpolate points", "Join type", "Measure Segments", "Ruler", "Show handles",
        ]
    }
];

export default function PathEffectsDialog({ isOpen, onClose, onApply, selectedShape, onSetCornerRadius, onSetKnotOptions, onSetOffset, onSetPowerStroke }) {
    const [showRadiusDialog, setShowRadiusDialog] = useState(false);
    const [radius, setRadius] = useState(selectedShape?.cornerRadius || 10);
    const [showKnotDialog, setShowKnotDialog] = useState(false);
    const [knotSize, setKnotSize] = useState(selectedShape?.knotSize || 10);
    const [gapLength, setGapLength] = useState(selectedShape?.knotGapLength || 5);
    const [showOffsetDialog, setShowOffsetDialog] = useState(false);
    const [offsetAmount, setOffsetAmount] = useState(selectedShape?.offsetAmount || 10);
    const [showPowerStrokeDialog, setShowPowerStrokeDialog] = useState(false);
    const [powerStrokeWidth, setPowerStrokeWidth] = useState(selectedShape?.powerStrokeWidth || 10);
    const [showTaperStrokeDialog, setShowTaperStrokeDialog] = useState(false);
    const [taperStrokeWidth, setTaperStrokeWidth] = useState(selectedShape?.taperStrokeWidth || 10);
    const [taperStart, setTaperStart] = useState(selectedShape?.taperStart ?? 1);
    const [taperEnd, setTaperEnd] = useState(selectedShape?.taperEnd ?? 1);
    const [showEnvelopeDialog, setShowEnvelopeDialog] = useState(false);
    const [envelopeTop, setEnvelopeTop] = useState(selectedShape?.envelopeTop || [0, 0, 1, 0]);
    const [envelopeBottom, setEnvelopeBottom] = useState(selectedShape?.envelopeBottom || [0, 1, 1, 1]);
    const [envelopeLeft, setEnvelopeLeft] = useState(selectedShape?.envelopeLeft || [0, 0, 0, 1]);
    const [envelopeRight, setEnvelopeRight] = useState(selectedShape?.envelopeRight || [1, 0, 1, 1]);
    const [showLatticeDialog, setShowLatticeDialog] = useState(false);
    const [showBooleanDialog, setShowBooleanDialog] = useState(false);
    const selectedShapeIds = useSelector(state => state.tool.selectedShapeIds);
    const dispatch = useDispatch();
    const getDefaultLatticePoints = (shape, rows, cols) => {
        if (!shape || !Array.isArray(shape.points)) return Array(rows * cols).fill([0, 0]);
        const normPoints = shape.points.map(p =>
            Array.isArray(p) ? { x: p[0], y: p[1] } : { x: p.x, y: p.y }
        );
        const minX = Math.min(...normPoints.map(p => p.x));
        const maxX = Math.max(...normPoints.map(p => p.x));
        const minY = Math.min(...normPoints.map(p => p.y));
        const maxY = Math.max(...normPoints.map(p => p.y));
        const points = [];
        for (let row = 0; row < rows; row++) {
            const v = row / (rows - 1);
            for (let col = 0; col < cols; col++) {
                const u = col / (cols - 1);
                points.push([
                    minX + (maxX - minX) * u,
                    minY + (maxY - minY) * v
                ]);
            }
        }
        return points;
    };

    const [latticeRows, setLatticeRows] = useState(2);
    const [latticeCols, setLatticeCols] = useState(2);
    const [latticePoints, setLatticePoints] = useState(
        selectedShape?.latticePoints ||
        getDefaultLatticePoints(selectedShape, latticeRows, latticeCols)
    );
    const handleEffectClick = (effect) => {
        if (effect === "Corners") {
            setShowRadiusDialog(true);
        } else if (effect === "Knot") {
            setShowKnotDialog(true);
        } else if (effect === "Offset") {
            setShowOffsetDialog(true);
        } else if (effect === "Power stroke") {
            setShowPowerStrokeDialog(true);
        } else if (effect === "Simplify") {
            if (selectedShape) {
                dispatch(simplify(selectedShape.id));
            }
            onApply && onApply("Simplify");
        } else if (effect === "Taper stroke") {
            setShowTaperStrokeDialog(true);
        } else if (effect === "Envelope Deformation") {
            if (selectedShape) {
                const normPoints = selectedShape.points?.map(p =>
                    Array.isArray(p) ? { x: p[0], y: p[1] } : { x: p.x, y: p.y }
                ) || [];
                const minX = Math.min(...normPoints.map(p => p.x));
                const maxX = Math.max(...normPoints.map(p => p.x));
                const minY = Math.min(...normPoints.map(p => p.y));
                const maxY = Math.max(...normPoints.map(p => p.y));
                const envelopeTop = [minX, minY, maxX, minY];
                const envelopeBottom = [minX, maxY, maxX, maxY];
                const envelopeLeft = [minX, minY, minX, maxY];
                const envelopeRight = [maxX, minY, maxX, maxY];
                if (onApply) {
                    onApply("Envelope Deformation", {
                        id: selectedShape.id,
                        envelopeTop,
                        envelopeBottom,
                        envelopeLeft,
                        envelopeRight,
                        lpeEffect: "Envelope Deformation"
                    });
                }
            }
            onClose && onClose();
        } else if (effect === "Lattice Deformation") {
            if (selectedShape) {
                const latticeRows = 2;
                const latticeCols = 2;
                const latticePoints = getDefaultLatticePoints(selectedShape, latticeRows, latticeCols);
                if (onApply) {
                    onApply("Lattice Deformation", {
                        id: selectedShape.id,
                        lpeEffect: "Lattice Deformation",
                        latticeRows,
                        latticeCols,
                        latticePoints
                    });
                }
            }
            onClose && onClose();
        } else if (effect === "Perspective/Envelope") {
            if (selectedShape) {
                const normPoints = selectedShape.points?.map(p =>
                    Array.isArray(p) ? { x: p[0], y: p[1] } : { x: p.x, y: p.y }
                ) || [];
                const minX = Math.min(...normPoints.map(p => p.x));
                const maxX = Math.max(...normPoints.map(p => p.x));
                const minY = Math.min(...normPoints.map(p => p.y));
                const maxY = Math.max(...normPoints.map(p => p.y));
                const perspectiveCorners = [
                    [minX, minY],
                    [maxX, minY],
                    [maxX, maxY],
                    [minX, maxY],
                ];
                if (onApply) {
                    onApply("Perspective/Envelope", {
                        id: selectedShape.id,
                        lpeEffect: "Perspective/Envelope",
                        perspectiveCorners,
                    });
                }
            }
            onClose && onClose();
        } else if (effect === "Roughen") {
            if (selectedShape) {
                if (onApply) {
                    onApply("Roughen", {
                        id: selectedShape.id,
                        lpeEffect: "Roughen",
                        roughenAmplitude: 6,
                        roughenFrequency: 1.5,
                    });
                }
            }
            onClose && onClose();
        } else if (effect === "Transform by 2 points") {
            if (selectedShape) {
                const points = shapeToPoints(selectedShape);
                if (points.length < 2) {
                    alert("Shape needs at least 2 points for this effect.");
                    return;
                }
                const x1 = points[0].x, y1 = points[0].y;
                const x2 = points[1].x, y2 = points[1].y;
                const x1p = x1 + 200, y1p = y1 + 0;
                const x2p = x2 + 200, y2p = y2 + 0;

                if (onApply) {
                    onApply("Transform by 2 points", {
                        id: selectedShape.id,
                        lpeEffect: "Transform by 2 points",
                        transform2Points: {
                            from: [[x1, y1], [x2, y2]],
                            to: [[x1p, y1p], [x2p, y2p]]
                        }
                    });
                }
            }
            onClose && onClose();
        } else if (effect === "Boolean operation") {
            setShowBooleanDialog(true);
            return;
        } else if (effect === "Clone original") {
            if (selectedShape) {
                dispatch(cloneShape({ id: selectedShape.id }));
                onApply && onApply("Clone original");
            }
            onClose && onClose();
            return;
        } else if (effect === "Fill between many") {
            if (selectedShape) {
                dispatch(fillBetweenPaths());
                onApply && onApply("Fill between many");
            }
            onClose && onClose();
            return;
        } else if (effect === "Hatches (rough)") {
            if (selectedShape) {
                dispatch(applyHatchesRough({ id: selectedShape.id }));
                onApply && onApply("Hatches (rough)");
            }
            onClose && onClose();
            return;
        } else if (effect === "Mirror symmetry") {
            if (selectedShape) {
                dispatch(applyMirrorSymmetry({ id: selectedShape.id, axis: "vertical" }));
                onApply && onApply("Mirror symmetry");
            }
            onClose && onClose();
            return;
        } else if (effect === "Power clip") {
            if (selectedShape && selectedShapeIds.length === 2) {
                dispatch(applyPowerClip({
                    contentId: selectedShapeIds[0],
                    clipPathId: selectedShapeIds[1]
                }));
                onApply && onApply("Power clip");
            } else {
                alert("Select two shapes: first the content, then the clip path.");
            }
            onClose && onClose();
            return;
        } else if (effect === "Power mask") {
            if (selectedShape && selectedShapeIds.length === 2) {
                dispatch(applyPowerMask({
                    contentId: selectedShapeIds[0],
                    maskShapeId: selectedShapeIds[1]
                }));
                onApply && onApply("Power mask");
            } else {
                alert("Select two shapes: first the content, then the mask shape.");
            }
            onClose && onClose();
            return;
        } else if (effect === "Rotate copies") {
            if (selectedShape) {
                const numCopies = 12;
                const angleStep = 360 / numCopies;
                dispatch({
                    type: "tool/applyRotateCopies",
                    payload: {
                        id: selectedShape.id,
                        numCopies,
                        angleStep
                    }
                });
                onApply && onApply("Rotate copies");
            }
            onClose && onClose();
            return;
        } else if (effect === "Sketch") {
            if (selectedShape) {
                dispatch({
                    type: "tool/applySketchEffect",
                    payload: {
                        id: selectedShape.id,
                        amplitude: 4,
                        frequency: 2,
                        passes: 3
                    }
                });
                onApply && onApply("Sketch");
            }
            onClose && onClose();
            return;
        } else if (effect === "Slice") {
            dispatch(sliceShapes());
            onApply && onApply("Slice");
            onClose && onClose();
            return;
        } else if (effect === "Tiling") {
            dispatch({ type: "tool/tilingShapes" });
            onApply && onApply("Tiling");
            onClose && onClose();
            return;
        } else if (effect === "VonKoch") {
            dispatch({ type: "tool/vonKochEffect" });
            onApply && onApply("VonKoch");
            onClose && onClose();
            return;
        } else if (effect === "Attach path") {
            dispatch({ type: "tool/attachPath" });
            onApply && onApply("Attach path");
            onClose && onClose();
            return;
        } else if (effect === "Bounding Box") {
            dispatch({ type: "tool/boundingBox" });
            onApply && onApply("Bounding Box");
            onClose && onClose();
            return;
        } else if (effect === "Construct grid") {
            dispatch({ type: "tool/constructGrid", payload: { rows: 5, cols: 5 } });
            onApply && onApply("Construct grid");
            onClose && onClose();
            return;
        } else if (effect === "Dashed Stroke") {
            dispatch({ type: "tool/setDashedStroke" });
            onApply && onApply("Dashed Stroke");
            onClose && onClose();
            return;
        } else if (effect === "Ellipse from points") {
            dispatch({ type: "tool/ellipseFromPoints" });
            onApply && onApply("Ellipse from points");
            onClose && onClose();
            return;
        } else if (effect === "Gears") {
            dispatch({ type: "tool/gears", payload: { numTeeth: 12, innerRadius: 40, outerRadius: 60 } });
            onApply && onApply("Gears");
            onClose && onClose();
            return;
        } else if (effect === "Interpolate points") {
            dispatch({ type: "tool/interpolatePoints", payload: { numSteps: 5 } });
            onApply && onApply("Interpolate points");
            onClose && onClose();
            return;
        } else if (effect === "Join type") {
            dispatch({ type: "tool/joinType" });
            onApply && onApply("Join type");
            onClose && onClose();
            return;
        } else if (effect === "Measure Segments") {
            dispatch({ type: "tool/measureSegments" });
            onApply && onApply("Measure Segments");
            onClose && onClose();
            return;
        } else if (effect === "Show handles") {
            dispatch({ type: "tool/setShowHandles", payload: { shapeId: selectedShape?.id } });
            onApply && onApply("Show handles");
            onClose && onClose();
            return;
        } else {
            onApply && onApply(effect);
        }
    };

    const handleBooleanApply = (op) => {
        if (onApply) onApply(op);
        setShowBooleanDialog(false);
        onClose && onClose();
    };

    const handleApplyRadius = () => {
        if (onSetCornerRadius && selectedShape) {
            onSetCornerRadius(selectedShape.id, radius);
        }
        setShowRadiusDialog(false);
        onApply && onApply("Corners");
    };

    const handleApplyKnot = () => {
        if (onSetKnotOptions && selectedShape) {
            onSetKnotOptions(selectedShape.id, { knotSize, gapLength });
        }
        setShowKnotDialog(false);
        onApply && onApply("Knot");
    };

    const handleApplyOffset = () => {
        if (onSetOffset && selectedShape) {
            onSetOffset(selectedShape.id, offsetAmount);
        }
        setShowOffsetDialog(false);
        onApply && onApply("Offset");
    };

    const handleApplyPowerStroke = () => {
        if (onSetPowerStroke && selectedShape) {
            onSetPowerStroke(selectedShape.id, powerStrokeWidth);
        }
        setShowPowerStrokeDialog(false);
        onApply && onApply("Power stroke");
    };

    const handleApplyTaperStroke = () => {
        if (onApply && selectedShape) {
            onApply("Taper stroke", {
                id: selectedShape.id,
                taperStrokeWidth,
                taperStart,
                taperEnd,
            });
        }
        setShowTaperStrokeDialog(false);
    };

    const handleApplyEnvelope = () => {
        if (onApply && selectedShape) {
            onApply("Envelope Deformation", {
                id: selectedShape.id,
                envelopeTop,
                envelopeBottom,
                envelopeLeft,
                envelopeRight,
                lpeEffect: "Envelope Deformation"
            });
        }
        setShowEnvelopeDialog(false);
    };

    const parseEnvelopeInput = (value, fallback) => {
        if (!value || value.trim() === "") return fallback;
        const arr = value.split(",").map(v => {
            const n = Number(v.trim());
            return isNaN(n) ? null : n;
        });
        if (arr.length !== 4 || arr.some(n => n === null)) return fallback;
        return arr;
    };

    const handleApplyLattice = () => {
        if (onApply && selectedShape) {
            onApply("Lattice Deformation", {
                id: selectedShape.id,
                latticeRows,
                latticeCols,
                latticePoints,
                lpeEffect: "Lattice Deformation"
            });
        }
        setShowLatticeDialog(false);
    };
    if (!isOpen) return null;
    return (
        <div className="path-effects-dialog" style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.3)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <div style={{
                background: "#fff", padding: 24, borderRadius: 8, minWidth: 400, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
            }}>
                <h3>Path Effects (LPE)</h3>
                {INKSCAPE_LPE_CATEGORIES.map(cat => (
                    <div key={cat.title} style={{ marginBottom: 24 }}>
                        <h4 style={{ borderBottom: "1px solid #eee", paddingBottom: 4 }}>{cat.title}</h4>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {cat.effects.map(effect => (
                                <li key={effect} style={{ marginBottom: 6 }}>
                                    <button
                                        style={{
                                            width: "100%", textAlign: "left", padding: "8px 12px",
                                            border: "1px solid #ccc", borderRadius: 4, background: "#f8f8f8", cursor: "pointer"
                                        }}
                                        onClick={() => handleEffectClick(effect)}
                                    >
                                        {effect}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
                <div style={{ textAlign: "right" }}>
                    <button onClick={onClose} style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}>Close</button>
                </div>
            </div>
            {showRadiusDialog && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                    background: "rgba(0,0,0,0.2)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <div style={{
                        background: "#fff", padding: 24, borderRadius: 8, minWidth: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
                    }}>
                        <h4>Set Corner Radius</h4>
                        <input
                            type="number"
                            min={0}
                            max={200}
                            value={radius}
                            onChange={e => setRadius(Number(e.target.value))}
                            style={{ width: 80, marginRight: 12 }}
                        />
                        <button onClick={handleApplyRadius} style={{ marginRight: 8 }}>Apply</button>
                        <button onClick={() => setShowRadiusDialog(false)}>Cancel</button>
                    </div>
                </div>
            )}
            {showKnotDialog && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                    background: "rgba(0,0,0,0.2)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <div style={{
                        background: "#fff", padding: 24, borderRadius: 8, minWidth: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
                    }}>
                        <h4>Knot Options</h4>
                        <div style={{ marginBottom: 12 }}>
                            <label>Switcher Size: </label>
                            <input
                                type="number"
                                min={1}
                                max={200}
                                value={knotSize}
                                onChange={e => setKnotSize(Number(e.target.value))}
                                style={{ width: 80, marginLeft: 8 }}
                            />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label>Gap Length: </label>
                            <input
                                type="number"
                                min={0}
                                max={200}
                                value={gapLength}
                                onChange={e => setGapLength(Number(e.target.value))}
                                style={{ width: 80, marginLeft: 8 }}
                            />
                        </div>
                        <button onClick={handleApplyKnot} style={{ marginRight: 8 }}>Apply</button>
                        <button onClick={() => setShowKnotDialog(false)}>Cancel</button>
                    </div>
                </div>
            )}
            {showOffsetDialog && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                    background: "rgba(0,0,0,0.2)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <div style={{
                        background: "#fff", padding: 24, borderRadius: 8, minWidth: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
                    }}>
                        <h4>Offset Options</h4>
                        <div style={{ marginBottom: 12 }}>
                            <label>Offset Amount: </label>
                            <input
                                type="number"
                                min={-200}
                                max={200}
                                value={offsetAmount}
                                onChange={e => setOffsetAmount(Number(e.target.value))}
                                style={{ width: 80, marginLeft: 8 }}
                            />
                        </div>
                        <button onClick={handleApplyOffset} style={{ marginRight: 8 }}>Apply</button>
                        <button onClick={() => setShowOffsetDialog(false)}>Cancel</button>
                    </div>
                </div>
            )}
            {showPowerStrokeDialog && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                    background: "rgba(0,0,0,0.2)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <div style={{
                        background: "#fff", padding: 24, borderRadius: 8, minWidth: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
                    }}>
                        <h4>Power Stroke Options</h4>
                        <div style={{ marginBottom: 12 }}>
                            <label>Stroke Width: </label>
                            <input
                                type="number"
                                min={1}
                                max={200}
                                value={powerStrokeWidth}
                                onChange={e => setPowerStrokeWidth(Number(e.target.value))}
                                style={{ width: 80, marginLeft: 8 }}
                            />
                        </div>
                        <button onClick={handleApplyPowerStroke} style={{ marginRight: 8 }}>Apply</button>
                        <button onClick={() => setShowPowerStrokeDialog(false)}>Cancel</button>
                    </div>
                </div>
            )}
            {showTaperStrokeDialog && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                    background: "rgba(0,0,0,0.2)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <div style={{
                        background: "#fff", padding: 24, borderRadius: 8, minWidth: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
                    }}>
                        <h4>Taper Stroke Options</h4>
                        <div style={{ marginBottom: 12 }}>
                            <label>Stroke Width: </label>
                            <input
                                type="number"
                                min={1}
                                max={200}
                                value={taperStrokeWidth}
                                onChange={e => setTaperStrokeWidth(Number(e.target.value))}
                                style={{ width: 80, marginLeft: 8 }}
                            />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label>Start Offset (0-1): </label>
                            <input
                                type="number"
                                min={0}
                                max={1}
                                step={0.01}
                                value={taperStart}
                                onChange={e => setTaperStart(Number(e.target.value))}
                                style={{ width: 80, marginLeft: 8 }}
                            />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label>End Offset (0-1): </label>
                            <input
                                type="number"
                                min={0}
                                max={1}
                                step={0.01}
                                value={taperEnd}
                                onChange={e => setTaperEnd(Number(e.target.value))}
                                style={{ width: 80, marginLeft: 8 }}
                            />
                        </div>
                        <button onClick={handleApplyTaperStroke} style={{ marginRight: 8 }}>Apply</button>
                        <button onClick={() => setShowTaperStrokeDialog(false)}>Cancel</button>
                    </div>
                </div>
            )}
            {showEnvelopeDialog && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                    background: "rgba(0,0,0,0.2)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <div style={{
                        background: "#fff", padding: 24, borderRadius: 8, minWidth: 340, boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
                    }}>
                        <h4>Envelope Deformation</h4>
                        <div style={{ marginBottom: 12 }}>
                            <label>Top Curve:</label>
                            <input
                                type="number"
                                value={envelopeTop[0]}
                                onChange={e => setEnvelopeTop([Number(e.target.value), envelopeTop[1], envelopeTop[2], envelopeTop[3]])}
                                style={{ width: 50, marginLeft: 8 }}
                                placeholder="x1"
                            />
                            <input
                                type="number"
                                value={envelopeTop[1]}
                                onChange={e => setEnvelopeTop([envelopeTop[0], Number(e.target.value), envelopeTop[2], envelopeTop[3]])}
                                style={{ width: 50, marginLeft: 4 }}
                                placeholder="y1"
                            />
                            <input
                                type="number"
                                value={envelopeTop[2]}
                                onChange={e => setEnvelopeTop([envelopeTop[0], envelopeTop[1], Number(e.target.value), envelopeTop[3]])}
                                style={{ width: 50, marginLeft: 4 }}
                                placeholder="x2"
                            />
                            <input
                                type="number"
                                value={envelopeTop[3]}
                                onChange={e => setEnvelopeTop([envelopeTop[0], envelopeTop[1], envelopeTop[2], Number(e.target.value)])}
                                style={{ width: 50, marginLeft: 4 }}
                                placeholder="y2"
                            />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label>Bottom Curve:</label>
                            <input
                                type="number"
                                value={envelopeBottom[0]}
                                onChange={e => setEnvelopeBottom([Number(e.target.value), envelopeBottom[1], envelopeBottom[2], envelopeBottom[3]])}
                                style={{ width: 50, marginLeft: 8 }}
                                placeholder="x1"
                            />
                            <input
                                type="number"
                                value={envelopeBottom[1]}
                                onChange={e => setEnvelopeBottom([envelopeBottom[0], Number(e.target.value), envelopeBottom[2], envelopeBottom[3]])}
                                style={{ width: 50, marginLeft: 4 }}
                                placeholder="y1"
                            />
                            <input
                                type="number"
                                value={envelopeBottom[2]}
                                onChange={e => setEnvelopeBottom([envelopeBottom[0], envelopeBottom[1], Number(e.target.value), envelopeBottom[3]])}
                                style={{ width: 50, marginLeft: 4 }}
                                placeholder="x2"
                            />
                            <input
                                type="number"
                                value={envelopeBottom[3]}
                                onChange={e => setEnvelopeBottom([envelopeBottom[0], envelopeBottom[1], envelopeBottom[2], Number(e.target.value)])}
                                style={{ width: 50, marginLeft: 4 }}
                                placeholder="y2"
                            />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label>Left Curve:</label>
                            <input
                                type="number"
                                value={envelopeLeft[0]}
                                onChange={e => setEnvelopeLeft([Number(e.target.value), envelopeLeft[1], envelopeLeft[2], envelopeLeft[3]])}
                                style={{ width: 50, marginLeft: 8 }}
                                placeholder="x1"
                            />
                            <input
                                type="number"
                                value={envelopeLeft[1]}
                                onChange={e => setEnvelopeLeft([envelopeLeft[0], Number(e.target.value), envelopeLeft[2], envelopeLeft[3]])}
                                style={{ width: 50, marginLeft: 4 }}
                                placeholder="y1"
                            />
                            <input
                                type="number"
                                value={envelopeLeft[2]}
                                onChange={e => setEnvelopeLeft([envelopeLeft[0], envelopeLeft[1], Number(e.target.value), envelopeLeft[3]])}
                                style={{ width: 50, marginLeft: 4 }}
                                placeholder="x2"
                            />
                            <input
                                type="number"
                                value={envelopeLeft[3]}
                                onChange={e => setEnvelopeLeft([envelopeLeft[0], envelopeLeft[1], envelopeLeft[2], Number(e.target.value)])}
                                style={{ width: 50, marginLeft: 4 }}
                                placeholder="y2"
                            />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label>Right Curve:</label>
                            <input
                                type="number"
                                value={envelopeRight[0]}
                                onChange={e => setEnvelopeRight([Number(e.target.value), envelopeRight[1], envelopeRight[2], envelopeRight[3]])}
                                style={{ width: 50, marginLeft: 8 }}
                                placeholder="x1"
                            />
                            <input
                                type="number"
                                value={envelopeRight[1]}
                                onChange={e => setEnvelopeRight([envelopeRight[0], Number(e.target.value), envelopeRight[2], envelopeRight[3]])}
                                style={{ width: 50, marginLeft: 4 }}
                                placeholder="y1"
                            />
                            <input
                                type="number"
                                value={envelopeRight[2]}
                                onChange={e => setEnvelopeRight([envelopeRight[0], envelopeRight[1], Number(e.target.value), envelopeRight[3]])}
                                style={{ width: 50, marginLeft: 4 }}
                                placeholder="x2"
                            />
                            <input
                                type="number"
                                value={envelopeRight[3]}
                                onChange={e => setEnvelopeRight([envelopeRight[0], envelopeRight[1], envelopeRight[2], Number(e.target.value)])}
                                style={{ width: 50, marginLeft: 4 }}
                                placeholder="y2"
                            />
                        </div>
                        <button onClick={handleApplyEnvelope} style={{ marginRight: 8 }}>Apply</button>
                        <button onClick={() => setShowEnvelopeDialog(false)}>Cancel</button>
                    </div>
                </div>
            )}
            <BooleanOpsDialog
                isOpen={showBooleanDialog}
                onClose={() => setShowBooleanDialog(false)}
                onApply={handleBooleanApply}
            />
            {showLatticeDialog && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                    background: "rgba(0,0,0,0.2)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <div style={{
                        background: "#fff", padding: 24, borderRadius: 8, minWidth: 340, boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
                    }}>
                        <h4>Lattice Deformation</h4>
                        <div style={{ marginBottom: 12 }}>
                            <label>Rows: </label>
                            <input
                                type="number"
                                min={2}
                                max={4}
                                value={latticeRows}
                                onChange={e => {
                                    const rows = Math.max(2, Math.min(4, Number(e.target.value)));
                                    setLatticeRows(rows);
                                    setLatticePoints(getDefaultLatticePoints(selectedShape, rows, latticeCols));
                                }}
                                style={{ width: 50, marginLeft: 8 }}
                            />
                            <label style={{ marginLeft: 16 }}>Columns: </label>
                            <input
                                type="number"
                                min={2}
                                max={4}
                                value={latticeCols}
                                onChange={e => {
                                    const cols = Math.max(2, Math.min(4, Number(e.target.value)));
                                    setLatticeCols(cols);
                                    setLatticePoints(getDefaultLatticePoints(selectedShape, latticeRows, cols));
                                }}
                                style={{ width: 50, marginLeft: 8 }}
                            />
                        </div>
                        <div>
                            <table>
                                <tbody>
                                    {Array.from({ length: latticeRows }).map((_, row) => (
                                        <tr key={row}>
                                            {Array.from({ length: latticeCols }).map((_, col) => {
                                                const idx = row * latticeCols + col;
                                                const [x, y] = latticePoints[idx] || [0, 0];
                                                return (
                                                    <td key={col}>
                                                        <input
                                                            type="number"
                                                            value={x}
                                                            onChange={e => {
                                                                const newPoints = [...latticePoints];
                                                                newPoints[idx] = [Number(e.target.value), y];
                                                                setLatticePoints(newPoints);
                                                            }}
                                                            style={{ width: 40, margin: 2 }}
                                                            placeholder="x"
                                                        />
                                                        <input
                                                            type="number"
                                                            value={y}
                                                            onChange={e => {
                                                                const newPoints = [...latticePoints];
                                                                newPoints[idx] = [x, Number(e.target.value)];
                                                                setLatticePoints(newPoints);
                                                            }}
                                                            style={{ width: 40, margin: 2 }}
                                                            placeholder="y"
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={handleApplyLattice} style={{ marginRight: 8 }}>Apply</button>
                        <button onClick={() => setShowLatticeDialog(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}