import Navbar from "./Navbar";
import "./Home.css";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";



const Home = () => {

  const showEveryTime = useSelector((state) => state.tool.showInitialScreen)
  const navigate = useNavigate();

  const handleNew2DDesign = () => {
    if (showEveryTime) {
      navigate("/modal");
    } else {
      navigate("/2d-panel");
    }
  };

  return (
    <>
      <Navbar />
      <div className="home">
        <div className="create-box">
          <h2>Create New Project</h2>
          <div className="boxes">
            <div onClick={handleNew2DDesign} className="box two-box" style={{ cursor: "pointer" }}>
              <h4>New 2D Design</h4>
            </div>
            <div className="box three-box">
              <h4>New 3D Design</h4>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;