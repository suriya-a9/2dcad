import React from "react";

export default function BooleanOpsDialog({ isOpen, onClose, onApply }) {
    if (!isOpen) return null;
    return (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.3)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <div style={{
                background: "#fff", padding: 24, borderRadius: 8, minWidth: 340, boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
            }}>
                <h4>Boolean Operations</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <button onClick={() => onApply("Union")}>Union</button>
                    <button onClick={() => onApply("Intersection")}>Intersection</button>
                    <button onClick={() => onApply("Difference")}>Difference</button>
                    <button onClick={() => onApply("Division")}>Division</button>
                </div>
                <div style={{ marginTop: 24, textAlign: "right" }}>
                    <button onClick={onClose} style={{ border: "none", borderRadius: 4, padding: "6px 16px" }}>Close</button>
                </div>
            </div>
        </div>
    );
}