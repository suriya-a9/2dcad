import './ColorPalette.css';
import { useState } from "react";
// import { CirclePicker } from "react-color";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { setStrokeColor, setFillColor } from '../../Redux/Slice/toolSlice';

import { useDispatch } from 'react-redux';

const ColorPalette = () => {

  const handleColorChange = (newColor) => {
    dispatch(setStrokeColor(newColor));
  };

  const dispatch = useDispatch();
  const colors = [
    { color: "#000000", name: "Black" },
    { color: "#2E2E2E", name: "Black Light" },
    { color: "#595959", name: "Black Medium" },
    { color: "#8C8C8C", name: "Black Dark" },

    { color: "#FFFFFF", name: "White" },
    { color: "#F0F0F0", name: "White Light" },
    { color: "#DCDCDC", name: "White Medium" },
    { color: "#BEBEBE", name: "White Dark" },

    { color: "#FF0000", name: "Red" },
    { color: "#FF4D4D", name: "Red Light" },
    { color: "#B30000", name: "Red Medium" },
    { color: "#800000", name: "Red Dark" },

    { color: "#00FF00", name: "Lime" },
    { color: "#33FF33", name: "Lime Light" },
    { color: "#009900", name: "Lime Medium" },
    { color: "#006600", name: "Lime Dark" },

    { color: "#0000FF", name: "Blue" },
    { color: "#3333FF", name: "Blue Light" },
    { color: "#0000B3", name: "Blue Medium" },
    { color: "#000066", name: "Blue Dark" },

    { color: "#FFFF00", name: "Yellow" },
    { color: "#FFFF66", name: "Yellow Light" },
    { color: "#CCCC00", name: "Yellow Medium" },
    { color: "#999900", name: "Yellow Dark" },

    { color: "#008000", name: "Green" },
    { color: "#33CC33", name: "Green Light" },
    { color: "#006600", name: "Green Medium" },
    { color: "#003300", name: "Green Dark" },

    { color: "#FFA500", name: "Orange" },
    { color: "#FFB84D", name: "Orange Light" },
    { color: "#B36B00", name: "Orange Medium" },
    { color: "#7A4500", name: "Orange Dark" },

    { color: "#800080", name: "Purple" },
    { color: "#9B30FF", name: "Purple Light" },
    { color: "#4B0082", name: "Purple Medium" },
    { color: "#6A0DAD", name: "Purple Dark" },

    { color: "#FFC0CB", name: "Pink" },
    { color: "#FFB6C1", name: "Pink Light" },
    { color: "#FF69B4", name: "Pink Medium" },
    { color: "#FF1493", name: "Pink Dark" },

    { color: "#A52A2A", name: "Brown" },
    { color: "#B5651D", name: "Brown Light" },
    { color: "#6A3E27", name: "Brown Medium" },
    { color: "#3E1F1B", name: "Brown Dark" },

    { color: "#808080", name: "Gray" },
    { color: "#A9A9A9", name: "Gray Light" },
    { color: "#696969", name: "Gray Medium" },
    { color: "#505050", name: "Gray Dark" },

    { color: "#FF6347", name: "Tomato" },
    { color: "#FF7F50", name: "Tomato Light" },
    { color: "#FF4500", name: "Tomato Medium" },
    { color: "#B22222", name: "Tomato Dark" },

    { color: "#87CEEB", name: "SkyBlue" },
    { color: "#ADD8E6", name: "SkyBlue Light" },
    { color: "#4682B4", name: "SkyBlue Medium" },
    { color: "#1E90FF", name: "SkyBlue Dark" },

    { color: "#FFD700", name: "Gold" },
    { color: "#FFCC00", name: "Gold Light" },
    { color: "#E5C100", name: "Gold Medium" },
    { color: "#B8860B", name: "Gold Dark" }
  ];
  return (
    <div className='bottom-color-palette'>
      {/* <h1>Color</h1> */}
      <div className='colors'>
        {colors.map(({ color, name }) => (
          <div
            key={`${color}-${name}`}
            style={{
              backgroundColor: color,
            }}
            onClick={() => {
              dispatch(setStrokeColor(color));
              dispatch(setFillColor(color));
            }}
            data-tooltip-id="color-tooltip"
          // data-tooltip-content={name}
          ></div>
        ))}
        <Tooltip id="color-tooltip" place="top" />
      </div>
    </div>
  )
}

export default ColorPalette