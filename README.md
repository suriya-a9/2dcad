# 🖼️ Konva.js React Redux Project

A web-based interactive canvas application built with React, Redux, and Konva.js. This project enables users to draw, manipulate, and manage objects on a canvas with state managed through Redux.

---

## 🚀 Features

- 🖌️ Canvas rendering with React-Konva  
- 🔁 State management with Redux Toolkit  
- 🧩 Supports shapes like rectangles, circles, and lines  
- 🖱️ Drag-and-drop, resize, and rotate elements  
- 💾 Save and load canvas state  
- 🧭 Zoom and pan support  
- ♻️ Undo/Redo functionality  

---

## 🏗️ Tech Stack

- React (Functional Components + Hooks)  
- Redux Toolkit for state management  
- React-Konva as canvas rendering wrapper  
- Konva.js for 2D canvas drawing  

---

## 🗂️ Project Structure

src/
├── assets/
├── components/ # React components (Dialogs, Panel, Modal, Toolbar, etc.)
├── Redux/ # Redux store and slices
│ ├── Action/
│ │ └── toolsAction.js
│ ├── Slice/
│ │ └── toolSlice.js
│ └── store.js
├── App.jsx # Main app component
├── index.js # Entry point

---

## 🧠 Key Concepts

**Canvas Rendering**  
`react-konva` wraps `Konva.js` to integrate with React's virtual DOM.

**State Management**  
Shapes and canvas actions are stored in Redux for predictable state transitions.

**Performance Optimization**  
Memoization and selective re-renders are used for complex scenes.