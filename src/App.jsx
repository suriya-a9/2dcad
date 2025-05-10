import { Routes, Route } from "react-router-dom";
import "./App.css";
import React from "react";
import Modal from "./components/Modal/Modal";
import EditableText from "./Example";

const Home = React.lazy(() => import('./components/Home/Home'));
const Main = React.lazy(() => import("./components/Main/Main"));

function App() {

  return (
    <>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/2d-panel" element={<Main />} />
          <Route path="/modal" element={<Modal />} />
          <Route path="/example" element={<EditableText />} />
        </Routes>
      </div>
    </>
  );
}

export default App;