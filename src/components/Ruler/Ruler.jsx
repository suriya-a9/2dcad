import React, { useState } from "react";
import "./Ruler.css";

const unitConversionFactors = {
    px: 1,
    mm: 3.779528,
    cm: 37.79528,
    in: 96,
    pt: 1.333333,
    pc: 16,
};

const convertToUnit = (value, unit) => {
    return value / unitConversionFactors[unit];
};

const Ruler = ({ orientation, length, scale, position, canvasSize, canvasPosition, unit, onClick, onDragGuide, onRightClick, highlightRange }) => {
    const isHorizontal = orientation === "horizontal";
    const tickSpacing = 50;
    const totalTicks = Math.ceil(length / (tickSpacing * scale));
    const startOffset = isHorizontal ? position.x : position.y;
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e) => {
        if (e.button === 0) {

            const position = orientation === "horizontal" ? e.clientY : e.clientX;
            onDragGuide(orientation, position);
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        if (onRightClick) {
            onRightClick(e);
        }
    };
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const canvasStart = isHorizontal ? canvasPosition.x * scale : canvasPosition.y * scale;
    console.log("canvasStart", canvasStart);
    console.log(canvasPosition, canvasSize, scale);
    const canvasEnd = isHorizontal
        ? (canvasPosition.x + canvasSize.width) * scale
        : (canvasPosition.y + canvasSize.height) * scale;
    console.log("canvasEnd", canvasEnd);
    const rulerStyle = {
        position: "absolute",
        top: isHorizontal ? "19.5%" : "0",
        left: isHorizontal ? "4%" : "2.5%",
        width: isHorizontal ? `${length}px` : "20px",
        height: isHorizontal ? "20px" : `${length}px`,
        backgroundColor: "#f0f0f0",
        position: "fixed",
        borderBottom: isHorizontal ? "1px solid #ccc" : "none",
        borderRight: isHorizontal ? "none" : "1px solid #ccc",
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        alignItems: "center",
        overflow: "hidden",
        zIndex: 0,
        ...(window.innerWidth <= 768 && {
            left: isHorizontal ? "2%" : "1%",
            width: isHorizontal ? `${length * 0.8}px` : "15px",
            height: isHorizontal ? "15px" : `${length * 0.8}px`,
        }),
    };

    return (
        <div
            className={`ruler ${orientation}`}
            style={rulerStyle}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
            onMouseUp={handleMouseUp}
        >
            <div
                style={{
                    position: "absolute",
                    top: isHorizontal ? "0px" : "160px",
                    left: isHorizontal ? `${(window.innerWidth - (canvasEnd - canvasStart)) / 2}px` : "0%",
                    width: isHorizontal ? `${canvasEnd - canvasStart}px` : "100%",
                    height: isHorizontal ? "20px" : `${canvasEnd - canvasStart}px`,
                    backgroundColor: "rgba(0, 123, 255, 0.2)",
                    zIndex: 5,
                    pointerEvents: "none",
                }}
            ></div>
            {Array.from({ length: totalTicks }).map((_, i) => {
                const tickPosition = (i - totalTicks / 2) * tickSpacing * scale + startOffset;
                const convertedTick = convertToUnit(tickPosition, unit);

                return (
                    <div
                        key={i}
                        style={{
                            width: isHorizontal ? `${tickSpacing * scale}px` : "100%",
                            height: isHorizontal ? "100%" : `${tickSpacing * scale}px`,
                            borderRight: isHorizontal ? "1px solid #ccc" : "none",
                            borderBottom: isHorizontal ? "none" : "1px solid #ccc",
                            textAlign: "center",
                            fontSize: "10px",
                            transform: isHorizontal ? "none" : "rotate(-90deg)",
                            lineHeight: isHorizontal ? "20px" : `${tickSpacing * scale}px`,
                            color: "#666",
                        }}
                    >
                        {`${Math.round(convertedTick)}${unit}`}
                    </div>
                );
            })}
            {highlightRange && (
                <div
                    style={{
                        position: 'absolute',
                        left: isHorizontal
                            ? `${highlightRange.start - canvasStart}px`
                            : 0,
                        top: !isHorizontal
                            ? `${highlightRange.start - canvasStart}px`
                            : 0,
                        width: isHorizontal
                            ? `${highlightRange.end - highlightRange.start}px`
                            : '100%',
                        height: !isHorizontal
                            ? `${highlightRange.end - highlightRange.start}px`
                            : '100%',
                        background: 'rgba(255, 200, 0, 0.3)',
                        pointerEvents: 'none',
                        zIndex: 100,
                    }}
                />
            )}
        </div>
    );
};

export default Ruler;