import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { simplify } from "../../Redux/Slice/toolSlice";

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
    const dispatch = useDispatch();
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
        } else {
            onApply && onApply(effect);
        }
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
        </div>
    );
}