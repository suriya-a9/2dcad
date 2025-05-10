// import { createAsyncThunk } from '@reduxjs/toolkit';

// export const updateShapePositionAction = createAsyncThunk(
//   'shapes/updateShapePositionAction',
//    (payload, { getState }) => {
//    try{
//     const { id, x, y, width, height, rotation, fill, stroke, scaleX, scaleY, strokeWidth } = payload;
//     const state = getState(); // Get the current state if needed
//     console.log(state,'state')
//     const selectedLayer = state.tool.layers[state.shapes.selectedLayerIndex]??[];
//     const shape = selectedLayer.shapes.find((shape) => shape.id === id);
//     console.log(shape,'shape')

//     if (shape) {
//       if (x !== undefined) shape.x =  x;
//       if (y !== undefined) shape.y =  y;
//       if (width !== undefined) shape.width =  width;
//       if (height !== undefined) shape.height =  height;
//       if (rotation !== undefined) shape.rotation =  rotation;
//       if (fill !== undefined) shape.fill =  fill;
//       if (stroke !== undefined) shape.stroke =  stroke;
//       if (strokeWidth !== undefined) shape.strokeWidth =  strokeWidth;
//       if (scaleX !== undefined) shape.scaleX =  scaleX;
//       if (scaleY !== undefined) shape.scaleY =  scaleY;
//     }

//     return { id, selectedLayer }; // Return the updated data if needed
// }catch(err){
//     console.log(err)
// }
//   }

// );
