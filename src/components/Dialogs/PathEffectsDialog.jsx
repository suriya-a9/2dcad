import React from "react";

const INKSCAPE_LPE_CATEGORIES = [
    {
        title: "Edit/Tools",
        effects: [
            "Bend", "Envelope Deformation", "Lattice Deformation", "Perspective/Envelope", "Power Stroke", "Power Clip", "Power Mask", "Pattern Along Path", "Mirror Symmetry", "Knot", "Taper Stroke", "Simplify", "Sketch", "Clone Original", "Attach Path", "Rotate Copies", "Show Handles"
        ]
    },
    {
        title: "Distort",
        effects: [
            "Roughen", "Jitter Nodes", "Vonkoch", "Hatches", "Perpendicular Bisector", "Offset", "Transform by 2 Points", "Perspective Envelope", "Lattice Deformation 2", "Interpolate", "Knot", "Mirror Symmetry", "Pattern Along Path", "Power Stroke", "Simplify", "Sketch"
        ]
    },
    {
        title: "Generate",
        effects: [
            "Spiro", "BSpline", "Stitch Sub-Paths", "Interpolate", "Construct Grid", "Construct 3D Box", "Construct Ellipse from Points", "Construct Star from Points", "Construct Polygon from Points", "Construct Spiral from Points", "Construct Path from Points"
        ]
    },
    {
        title: "Convert",
        effects: [
            "Convert to Path", "Convert to Guides", "Convert to Pattern", "Convert to Symbol", "Convert to Clone", "Convert to Group", "Convert to Mask", "Convert to Clip"
        ]
    }
];

export default function PathEffectsDialog({ isOpen, onClose, onApply }) {
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
                                        onClick={() => onApply && onApply(effect)}
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
        </div>
    );
}