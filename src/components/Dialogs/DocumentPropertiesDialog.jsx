import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setPageSize } from "../../Redux/Slice/toolSlice";

const tabs = [
    "Display",
    "Guides",
    "Grids",
    "Color",
    "Scripting",
    "Metadata",
    "License",
];

const formatGroups = [
    {
        label: "ISO A",
        options: [
            { value: "A0", label: "A0", width: 841, height: 1189 },
            { value: "A1", label: "A1", width: 594, height: 841 },
            { value: "A2", label: "A2", width: 420, height: 594 },
            { value: "A3", label: "A3", width: 297, height: 420 },
            { value: "A4", label: "A4", width: 210, height: 297 },
            { value: "A5", label: "A5", width: 148, height: 210 },
            { value: "A6", label: "A6", width: 105, height: 148 },
            { value: "A7", label: "A7", width: 74, height: 105 },
            { value: "A8", label: "A8", width: 52, height: 74 },
        ],
    },
    {
        label: "ISO B",
        options: [
            { value: "B0", label: "B0", width: 1000, height: 1414 },
            { value: "B1", label: "B1", width: 707, height: 1000 },
            { value: "B2", label: "B2", width: 500, height: 707 },
            { value: "B3", label: "B3", width: 353, height: 500 },
            { value: "B4", label: "B4", width: 250, height: 353 },
            { value: "B5", label: "B5", width: 176, height: 250 },
            { value: "B6", label: "B6", width: 125, height: 176 },
        ],
    },
    {
        label: "US",
        options: [
            { value: "Letter", label: "Letter", width: 216, height: 279 },
            { value: "Legal", label: "Legal", width: 216, height: 356 },
            { value: "Tabloid", label: "Tabloid", width: 279, height: 432 },
            { value: "Executive", label: "Executive", width: 184, height: 267 },
            { value: "Ledger", label: "Ledger", width: 432, height: 279 },
        ],
    },
    {
        label: "Other",
        options: [
            { value: "Custom", label: "Custom" },
        ],
    },
];
const getFormatSize = (value) => {
    for (const group of formatGroups) {
        const found = group.options.find(opt => opt.value === value);
        if (found && found.width && found.height) return { width: found.width, height: found.height };
    }
    return null;
};

const DocumentPropertiesDialog = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const reduxWidth = useSelector(state => state.tool.width);
    const reduxHeight = useSelector(state => state.tool.height);
    const grids = useSelector(state => state.tool.grids);
    const [activeTab, setActiveTab] = useState("Display");
    const [format, setFormat] = useState("A4");
    const [width, setWidth] = useState(reduxWidth);
    const [height, setHeight] = useState(reduxHeight);
    const [orientation, setOrientation] = useState("portrait");
    const [scriptingTab, setScriptingTab] = useState("external");
    const [externalScriptInput, setExternalScriptInput] = useState("");
    const [embeddedScriptInput, setEmbeddedScriptInput] = useState("");
    const externalScripts = useSelector(state => state.tool.externalScripts || []);
    const embeddedScripts = useSelector(state => state.tool.embeddedScripts || []);
    const availableColorProfiles = useSelector(state => state.tool.availableColorProfiles);
    const linkedColorProfiles = useSelector(state => state.tool.linkedColorProfiles);
    const pageColor = useSelector(state => state.tool.pageColor || "#fff");
    const borderColor = useSelector(state => state.tool.borderColor || "#fff");
    const deskColor = useSelector(state => state.tool.deskColor || "#e5e5e5");
    const showCheckerboard = useSelector(state => state.tool.showCheckerboard);
    const showGuides = useSelector(state => state.tool.showGuides);
    const guideColor = useSelector(state => state.tool.guideColor);
    if (!isOpen) return null;

    const handleFormatChange = (e) => {
        const val = e.target.value;
        setFormat(val);
        const size = getFormatSize(val);
        if (size) {
            let w = size.width, h = size.height;
            if (orientation === "landscape") [w, h] = [h, w];
            setWidth(w);
            setHeight(h);
            dispatch(setPageSize({ width: w, height: h }));
        }
    };

    const handleWidthChange = (e) => {
        const w = Number(e.target.value);
        setWidth(w);
        dispatch(setPageSize({ width: w, height }));
    };

    const handleHeightChange = (e) => {
        const h = Number(e.target.value);
        setHeight(h);
        dispatch(setPageSize({ width, height: h }));
    };

    const handleOrientationChange = (e) => {
        const o = e.target.value;
        setOrientation(o);
        let w = width, h = height;
        if ((o === "landscape" && height > width) || (o === "portrait" && width > height)) {
            [w, h] = [h, w];
            setWidth(w);
            setHeight(h);
            dispatch(setPageSize({ width: w, height: h }));
        }
    };

    const handleLinkedProfilesChange = (e) => {
        const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
        dispatch({ type: "tool/setLinkedColorProfiles", payload: options });
    };

    const handleAddExternalScript = () => {
        if (externalScriptInput.trim()) {
            dispatch({ type: "tool/setExternalScripts", payload: [...externalScripts, externalScriptInput.trim()] });
            setExternalScriptInput("");
        }
    };

    const handleRemoveExternalScript = (idx) => {
        const updated = externalScripts.filter((_, i) => i !== idx);
        dispatch({ type: "tool/setExternalScripts", payload: updated });
    };

    const handleAddEmbeddedScript = () => {
        if (embeddedScriptInput.trim()) {
            dispatch({ type: "tool/setEmbeddedScripts", payload: [...embeddedScripts, embeddedScriptInput.trim()] });
            setEmbeddedScriptInput("");
        }
    };

    const handleRemoveEmbeddedScript = (idx) => {
        const updated = embeddedScripts.filter((_, i) => i !== idx);
        dispatch({ type: "tool/setEmbeddedScripts", payload: updated });
    };

    return (
        <div
            style={{
                position: "fixed",
                top: "25%",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#222",
                color: "#fff",
                zIndex: 3000,
                borderRadius: 8,
                boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
                minWidth: 480,
                minHeight: 400,
                padding: 0,
            }}
        >
            <div style={{ display: "flex", borderBottom: "1px solid #444" }}>
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            padding: "12px 0",
                            background: activeTab === tab ? "#444" : "none",
                            color: "#fff",
                            border: "none",
                            borderBottom: activeTab === tab ? "2px solid #007bff" : "none",
                            fontWeight: "bold",
                            cursor: "pointer",
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div style={{ padding: 24, minHeight: 300 }}>
                {activeTab === "Display" && (
                    <div style={{ display: "flex", gap: 32 }}>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ marginBottom: 12 }}>Front Page</h4>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4 }}>Format</label>
                                <select value={format} onChange={handleFormatChange} style={{ width: "100%", padding: 6, borderRadius: 4 }}>
                                    {formatGroups.map(group => (
                                        <optgroup key={group.label} label={group.label}>
                                            {group.options.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", marginBottom: 4 }}>Width</label>
                                    <input type="number" value={width} onChange={handleWidthChange} style={{ width: "100%", padding: 6, borderRadius: 4 }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", marginBottom: 4 }}>Height</label>
                                    <input type="number" value={height} onChange={handleHeightChange} style={{ width: "100%", padding: 6, borderRadius: 4 }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4 }}>Orientation</label>
                                <div>
                                    <label style={{ marginRight: 16 }}>
                                        <input type="radio" name="orientation" value="portrait" checked={orientation === "portrait"} onChange={handleOrientationChange} /> Portrait
                                    </label>
                                    <label>
                                        <input type="radio" name="orientation" value="landscape" checked={orientation === "landscape"} onChange={handleOrientationChange} /> Landscape
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ marginBottom: 12 }}>Display</h4>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4 }}>Page Color</label>
                                <input
                                    type="color"
                                    value={pageColor}
                                    onChange={e => dispatch({ type: "tool/setPageColor", payload: e.target.value })}
                                    style={{ width: 40, height: 32, border: "none", background: "none" }}
                                />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4 }}>Border Color</label>
                                <input
                                    type="color"
                                    value={borderColor}
                                    onChange={e => dispatch({ type: "tool/setBorderColor", payload: e.target.value })}
                                    style={{ width: 40, height: 32, border: "none", background: "none" }}
                                />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4 }}>Desk Color</label>
                                <input
                                    type="color"
                                    value={deskColor}
                                    onChange={e => dispatch({ type: "tool/setDeskColor", payload: e.target.value })}
                                    style={{ width: 40, height: 32, border: "none", background: "none" }}
                                />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={showCheckerboard}
                                        onChange={e => dispatch({ type: "tool/setShowCheckerboard", payload: e.target.checked })}
                                    />
                                    Checkerboard
                                </label>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === "Guides" && (
                    <div>
                        <h3>Guides</h3>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input
                                    type="checkbox"
                                    checked={showGuides}
                                    onChange={e => dispatch({ type: "tool/setShowGuides", payload: e.target.checked })}
                                />
                                Show Guides
                            </label>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: "block", marginBottom: 4 }}>Guide Color</label>
                            <input
                                type="color"
                                value={guideColor}
                                onChange={e => dispatch({ type: "tool/setGuideColor", payload: e.target.value })}
                                style={{ width: 40, height: 32, border: "none", background: "none" }}
                            />
                        </div>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <button
                                onClick={() =>
                                    dispatch({
                                        type: "tool/createGuide",
                                        payload: { orientation: "horizontal", position: 0 }
                                    })
                                }
                            >
                                Top Guide
                            </button>
                            <button
                                onClick={() =>
                                    dispatch({
                                        type: "tool/createGuide",
                                        payload: { orientation: "horizontal", position: height - 1 }
                                    })
                                }
                            >
                                Bottom Guide
                            </button>
                            <button
                                onClick={() =>
                                    dispatch({
                                        type: "tool/createGuide",
                                        payload: { orientation: "vertical", position: 0 }
                                    })
                                }
                            >
                                Left Guide
                            </button>
                            <button
                                onClick={() =>
                                    dispatch({
                                        type: "tool/createGuide",
                                        payload: { orientation: "vertical", position: width - 1 }
                                    })
                                }
                            >
                                Right Guide
                            </button>
                            <button
                                onClick={() => dispatch({ type: "tool/deleteGuide" })}
                            >
                                Delete Guide
                            </button>
                        </div>
                    </div>
                )}
                {activeTab === "Grids" && (
                    <div>
                        <h3>Grids</h3>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: "block", marginBottom: 8 }}>Add Grid</label>
                            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                                <button
                                    disabled={grids.some(g => g.type === "rectangular")}
                                    onClick={() => dispatch({ type: "tool/addGrid", payload: { type: "rectangular" } })}
                                >
                                    Rectangular
                                </button>
                                <button
                                    disabled={grids.some(g => g.type === "axonometric")}
                                    onClick={() => dispatch({ type: "tool/addGrid", payload: { type: "axonometric" } })}
                                >
                                    Axonometric
                                </button>
                                <button
                                    disabled={grids.some(g => g.type === "modular")}
                                    onClick={() => dispatch({ type: "tool/addGrid", payload: { type: "modular" } })}
                                >
                                    Modular
                                </button>
                            </div>
                        </div>
                        {grids.map((grid, idx) => (
                            <div key={idx} style={{ marginBottom: 12, padding: 8, background: "#333", borderRadius: 4 }}>
                                <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                                    {grid.type.charAt(0).toUpperCase() + grid.type.slice(1)} Grid
                                </div>
                                <label style={{ marginRight: 16 }}>
                                    <input
                                        type="checkbox"
                                        checked={grid.enabled}
                                        onChange={() => dispatch({ type: "tool/toggleGridEnabled", payload: { index: idx } })}
                                    /> Enable
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={grid.visible}
                                        onChange={() => dispatch({ type: "tool/toggleGridVisible", payload: { index: idx } })}
                                    /> Visible
                                </label>
                                {grid.type === "rectangular" && (
                                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 12 }}>
                                        <div>
                                            <label>Origin X</label>
                                            <input
                                                type="number"
                                                value={grid.originX ?? 0}
                                                onChange={e => dispatch({ type: "tool/updateGrid", payload: { index: idx, key: "originX", value: Number(e.target.value) } })}
                                                style={{ width: 60 }}
                                            />
                                        </div>
                                        <div>
                                            <label>Origin Y</label>
                                            <input
                                                type="number"
                                                value={grid.originY ?? 0}
                                                onChange={e => dispatch({ type: "tool/updateGrid", payload: { index: idx, key: "originY", value: Number(e.target.value) } })}
                                                style={{ width: 60 }}
                                            />
                                        </div>
                                        <div>
                                            <label>Spacing X</label>
                                            <input
                                                type="number"
                                                value={grid.spacingX ?? 50}
                                                min={1}
                                                onChange={e => dispatch({ type: "tool/updateGrid", payload: { index: idx, key: "spacingX", value: Number(e.target.value) } })}
                                                style={{ width: 60 }}
                                            />
                                        </div>
                                        <div>
                                            <label>Spacing Y</label>
                                            <input
                                                type="number"
                                                value={grid.spacingY ?? 50}
                                                min={1}
                                                onChange={e => dispatch({ type: "tool/updateGrid", payload: { index: idx, key: "spacingY", value: Number(e.target.value) } })}
                                                style={{ width: 60 }}
                                            />
                                        </div>
                                        <div>
                                            <label>Line Color</label>
                                            <input
                                                type="color"
                                                value={grid.lineColor ?? "#bbb"}
                                                onChange={e => dispatch({ type: "tool/updateGrid", payload: { index: idx, key: "lineColor", value: e.target.value } })}
                                                style={{ width: 40, height: 32, border: "none", background: "none" }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {grid.type === "axonometric" && (
                                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 12 }}>
                                        <div>
                                            <label>Origin X</label>
                                            <input
                                                type="number"
                                                value={grid.originX ?? 0}
                                                onChange={e => dispatch({ type: "tool/updateGrid", payload: { index: idx, key: "originX", value: Number(e.target.value) } })}
                                                style={{ width: 60 }}
                                            />
                                        </div>
                                        <div>
                                            <label>Origin Y</label>
                                            <input
                                                type="number"
                                                value={grid.originY ?? 0}
                                                onChange={e => dispatch({ type: "tool/updateGrid", payload: { index: idx, key: "originY", value: Number(e.target.value) } })}
                                                style={{ width: 60 }}
                                            />
                                        </div>
                                        <div>
                                            <label>Spacing Y</label>
                                            <input
                                                type="number"
                                                value={grid.spacingY ?? 50}
                                                min={1}
                                                onChange={e => dispatch({ type: "tool/updateGrid", payload: { index: idx, key: "spacingY", value: Number(e.target.value) } })}
                                                style={{ width: 60 }}
                                            />
                                        </div>
                                        <div>
                                            <label>Angle X</label>
                                            <input
                                                type="number"
                                                value={grid.angleX ?? 30}
                                                min={0}
                                                max={180}
                                                onChange={e => dispatch({ type: "tool/updateGrid", payload: { index: idx, key: "angleX", value: Number(e.target.value) } })}
                                                style={{ width: 60 }}
                                            />
                                        </div>
                                        <div>
                                            <label>Angle Z</label>
                                            <input
                                                type="number"
                                                value={grid.angleZ ?? 150}
                                                min={0}
                                                max={180}
                                                onChange={e => dispatch({ type: "tool/updateGrid", payload: { index: idx, key: "angleZ", value: Number(e.target.value) } })}
                                                style={{ width: 60 }}
                                            />
                                        </div>
                                        <div>
                                            <label>Line Color</label>
                                            <input
                                                type="color"
                                                value={grid.lineColor ?? "#8af"}
                                                onChange={e => dispatch({ type: "tool/updateGrid", payload: { index: idx, key: "lineColor", value: e.target.value } })}
                                                style={{ width: 40, height: 32, border: "none", background: "none" }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === "Color" && (
                    <div>
                        <h3>Color</h3>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: "block", marginBottom: 4 }}>Available Color Profiles</label>
                            <select
                                multiple
                                value={linkedColorProfiles}
                                onChange={handleLinkedProfilesChange}
                                style={{ width: "100%", padding: 6, borderRadius: 4, minHeight: 80 }}
                            >
                                {availableColorProfiles.map(profile => (
                                    <option key={profile.id} value={profile.id}>
                                        {profile.name}
                                    </option>
                                ))}
                            </select>
                            <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
                                Hold Ctrl (Windows) or Cmd (Mac) to select multiple.
                            </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: "block", marginBottom: 4 }}>Linked Color Profiles</label>
                            <div style={{
                                background: "#333",
                                borderRadius: 4,
                                padding: 8,
                                color: "#fff"
                            }}>
                                {linkedColorProfiles.length > 0
                                    ? linkedColorProfiles.map(id => {
                                        const p = availableColorProfiles.find(p => p.id === id);
                                        return <span key={id} style={{ marginRight: 12 }}>{p ? p.name : id}</span>;
                                    })
                                    : <span>No profile linked</span>}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === "Scripting" && (
                    <div>
                        <h3>Scripting</h3>
                        <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                            <button
                                style={{
                                    flex: 1,
                                    background: scriptingTab === "external" ? "#444" : "#222",
                                    color: "#fff",
                                    border: "none",
                                    borderBottom: scriptingTab === "external" ? "2px solid #007bff" : "none",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    padding: 8,
                                    borderRadius: 4,
                                }}
                                onClick={() => setScriptingTab("external")}
                            >
                                External Scripts
                            </button>
                            <button
                                style={{
                                    flex: 1,
                                    background: scriptingTab === "embedded" ? "#444" : "#222",
                                    color: "#fff",
                                    border: "none",
                                    borderBottom: scriptingTab === "embedded" ? "2px solid #007bff" : "none",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    padding: 8,
                                    borderRadius: 4,
                                }}
                                onClick={() => setScriptingTab("embedded")}
                            >
                                Embedded Scripts
                            </button>
                        </div>
                        {scriptingTab === "external" && (
                            <div>
                                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                                    <input
                                        type="text"
                                        placeholder="Paste external script URL"
                                        value={externalScriptInput}
                                        onChange={e => setExternalScriptInput(e.target.value)}
                                        style={{ flex: 1, padding: 6, borderRadius: 4 }}
                                    />
                                    <button
                                        onClick={handleAddExternalScript}
                                        style={{
                                            background: "#007bff",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: 32,
                                            height: 32,
                                            fontSize: 20,
                                            fontWeight: "bold",
                                            cursor: "pointer",
                                        }}
                                        title="Add Script"
                                    >+</button>
                                </div>
                                <div>
                                    {externalScripts.length === 0 && <div style={{ color: "#aaa" }}>No external scripts added.</div>}
                                    {externalScripts.map((script, idx) => (
                                        <div key={idx} style={{
                                            display: "flex",
                                            alignItems: "center",
                                            background: "#222",
                                            borderRadius: 4,
                                            padding: "4px 8px",
                                            marginBottom: 6,
                                        }}>
                                            <span style={{ flex: 1, wordBreak: "break-all" }}>{script}</span>
                                            <button
                                                onClick={() => handleRemoveExternalScript(idx)}
                                                style={{
                                                    background: "#d9534f",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "50%",
                                                    width: 28,
                                                    height: 28,
                                                    fontSize: 18,
                                                    fontWeight: "bold",
                                                    marginLeft: 8,
                                                    cursor: "pointer",
                                                }}
                                                title="Remove Script"
                                            >–</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {scriptingTab === "embedded" && (
                            <div>
                                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                                    <textarea
                                        placeholder="Paste embedded script code"
                                        value={embeddedScriptInput}
                                        onChange={e => setEmbeddedScriptInput(e.target.value)}
                                        style={{ flex: 1, padding: 6, borderRadius: 4, minHeight: 48, resize: "vertical" }}
                                    />
                                    <button
                                        onClick={handleAddEmbeddedScript}
                                        style={{
                                            background: "#007bff",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: 32,
                                            height: 32,
                                            fontSize: 20,
                                            fontWeight: "bold",
                                            cursor: "pointer",
                                        }}
                                        title="Add Script"
                                    >+</button>
                                </div>
                                <div>
                                    {embeddedScripts.length === 0 && <div style={{ color: "#aaa" }}>No embedded scripts added.</div>}
                                    {embeddedScripts.map((script, idx) => (
                                        <div key={idx} style={{
                                            display: "flex",
                                            alignItems: "center",
                                            background: "#222",
                                            borderRadius: 4,
                                            padding: "4px 8px",
                                            marginBottom: 6,
                                        }}>
                                            <span style={{ flex: 1, wordBreak: "break-all", whiteSpace: "pre-line" }}>{script}</span>
                                            <button
                                                onClick={() => handleRemoveEmbeddedScript(idx)}
                                                style={{
                                                    background: "#d9534f",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "50%",
                                                    width: 28,
                                                    height: 28,
                                                    fontSize: 18,
                                                    fontWeight: "bold",
                                                    marginLeft: 8,
                                                    cursor: "pointer",
                                                }}
                                                title="Remove Script"
                                            >–</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === "Metadata" && (
                    <div>
                        <h3>Metadata</h3>
                        <p>Title, author, description, etc.</p>
                    </div>
                )}
                {activeTab === "License" && (
                    <div>
                        <h3>License</h3>
                        <p>Document license information.</p>
                    </div>
                )}
            </div>
            <div style={{ textAlign: "right", padding: 16 }}>
                <button
                    onClick={onClose}
                    style={{
                        background: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "8px 24px",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default DocumentPropertiesDialog;