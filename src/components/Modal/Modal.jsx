import React, { useState, useRef } from "react";
import initial from "../../assets/logo-2d.png";
import "../Modal/Modal.css";
import img from "../../assets/img.png";
import USLetterP from "../../assets/US Letter P.png";
import USLetterL from "../../assets/USLetterL.png";
import A0 from "../../assets/A0.png";
import A1 from "../../assets/A1.png";
import A2 from "../../assets/A2.png";
import USExecutive from "../../assets/USExecutive.png";
import USLegal from "../../assets/USLegal.png";
import DLEnvelop from "../../assets/DLEnvelop.png";
import ZineBooklet from "../../assets/ZineBooklet.png";
import CDLabel from "../../assets/CDLabel.png";
import Business from "../../assets/Business.png";
import DVD from "../../assets/DVD.png";
import Video from "../../assets/Video.png";
import A4Portrait from "../../assets/A4Portrait.png";
import FacebookCover from "../../assets/FacebookCover.png";
import Socialportrait from "../../assets/Socialportrait.png";
import Socialsquare from "../../assets/Socialsquare.png";
import Desktop from "../../assets/Desktop.png";
import DesktopSD from "../../assets/DesktopSD.png";
import Phone from "../../assets/Phone.png";
import Ipad from "../../assets/Ipad.png";
import Trellis from "../../assets/Trellis.png";
import Diamond from "../../assets/Diamond.png";
import Cross from "../../assets/Cross.png";
import VaryCross from "../../assets/VaryCross.png";
import Target from "../../assets/Target.png";
import Hive from "../../assets/Hive.png";
import DoubleVision from "../../assets/DoubleVision.png";
import CelticFlower from "../../assets/CelticFlower.png";
import CelticKnot from "../../assets/CelticKnot.png";
import KitchenTile from "../../assets/KitchenTile.png";
import Rose from "../../assets/Rose.png";
import Lily from "../../assets/Lily.png";
import Crown from "../../assets/Crown.png";
import DiamondTarget from "../../assets/DiamondTarget.png";
import TVTestPattern from "../../assets/TVTestPattern.png";
import Explosion from "../../assets/Explosion.png";
import Droplet from "../../assets/Droplet.png";
import Icon from "../../assets/Icon.png";
import Seamless from "../../assets/Seamless.png";
import Customs from "../../assets/Custom.png";
import { setPageSize, addImage, toggleShowInitialScreen } from "../../Redux/Slice/toolSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Modal = () => {
  const [activeTab, setActiveTab] = useState("Time to Draw");
  const [canvasTheme, setCanvasTheme] = useState("Default");
  const [selectedSidebar, setSelectedSidebar] = useState("Existing Files");
  const [keyboardTheme, setKeyboardTheme] = useState(
    "Inkscape default (default.xml)"
  );
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState("Browse for other files...");
  const [appearanceTheme, setAppearanceTheme] = useState("Colorful");
  const [selectedSize, setSelectedSize] = useState(null);
  const showEveryTime = useSelector((state) => state.tool.showInitialScreen)
  console.log(showEveryTime, 'showEveryTime');

  const [isDarkMode, setIsDarkMode] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const pageSizes = [
    {
      name: "A4 (Portrait)",
      size: { width: 630, height: 891, unit: "px" },
      icon: <img src={A4Portrait} />,
    },
    {
      name: "A4 (Landscape)",
      size: { width: 1123, height: 794, unit: "px" },
      icon: <img src={img} />,
    },
    {
      name: "US Letter (Portrait)",
      size: { width: 816, height: 1056, unit: "px" },
      icon: <img src={USLetterP} />,
    },
    {
      name: "US Letter (Landscape)",
      size: { width: 1056, height: 816, unit: "px" },
      icon: <img src={USLetterL} />,
    },
    {
      name: "A0",
      size: { width: 3179, height: 4494, unit: "px" },
      icon: <img src={A0} />,
    },
    {
      name: "A1",
      size: { width: 2245, height: 3179, unit: "px" },
      icon: <img src={A1} />,
    },
    {
      name: "A2",
      size: { width: 1654, height: 2339, unit: "px" },
      icon: <img src={A2} />,
    },
    {
      name: "A3",
      size: { width: 1169, height: 1654, unit: "px" },
      icon: <img src={A2} />,
    },
    {
      name: "A5",
      size: { width: 559, height: 794, unit: "px" },
      icon: <img src={A2} />,
    },
    {
      name: "Ledger/Tabloid",
      size: { width: 1056, height: 1632, unit: "px" },
      icon: <img src={A2} />,
    },
    {
      name: "US Executive",
      size: { width: 696, height: 1008, unit: "px" },
      icon: <img src={USExecutive} />,
    },
    {
      name: "US Legal",
      size: { width: 816, height: 1344, unit: "px" },
      icon: <img src={USLegal} />,
    },
    {
      name: "DL Envelope",
      size: { width: 834, height: 417, unit: "px" },
      icon: <img src={DLEnvelop} />,
    },
    {
      name: "US #10 Envelope",
      size: { width: 912, height: 396, unit: "px" },
      icon: <img src={DLEnvelop} />,
    },
    {
      name: "Zine Booklet (A4)",
      size: { width: 1123, height: 794, unit: "px" },
      icon: <img src={ZineBooklet} />,
    },
    {
      name: "Zine Booklet (US)",
      size: { width: 1056, height: 816, unit: "px" },
      icon: <img src={ZineBooklet} />,
    },
    {
      name: "CD Label",
      size: { width: 453, height: 453, unit: "px" },
      icon: <img src={CDLabel} />,
    },
    {
      name: "Business Card",
      size: "Various Countries",
      icon: <img src={Business} />,
    },
    { name: "DVD Cover", size: "Various Sizes", icon: <img src={DVD} /> },
  ];
  const video = [
    {
      name: "Video SD PAL",
      size: { width: 768, height: 576, unit: "px" },
      icon: <img src={Video} />,
    },
    {
      name: "Video SD widescreen/PAL",
      size: { width: 1024, height: 576, unit: "px" },
      icon: <img src={Video} />,
    },
    {
      name: "Video SD NTSC",
      size: { width: 544, height: 480, unit: "px" },
      icon: <img src={Video} />,
    },
    {
      name: "Video SD widescreen NTSC",
      size: { width: 872, height: 486, unit: "px" },
      icon: <img src={Video} />,
    },
    {
      name: "Video HD 720p",
      size: { width: 1280, height: 720, unit: "px" },
      icon: <img src={Video} />,
    },
    {
      name: "Video HD 1080p",
      size: { width: 1920, height: 1080, unit: "px" },
      icon: <img src={Video} />,
    },
    {
      name: "Video DCI 2K full frame",
      size: { width: 2048, height: 1080, unit: "px" },
      icon: <img src={Video} />,
    },
    {
      name: "Video UHD 4K",
      size: { width: 3840, height: 2160, unit: "px" },
      icon: <img src={Video} />,
    },
    {
      name: "Video DCI 4K ful frame",
      size: { width: 4096, height: 2160, unit: "px" },
      icon: <img src={Video} />,
    },
    {
      name: "Video UHD 8K ",
      size: { width: 7680, height: 4320, unit: "px" },
      icon: <img src={Video} />,
    },
  ];
  const Social = [
    {
      name: "Facebook cover photo",
      size: { width: 820, height: 462, unit: "px" },
      icon: <img src={FacebookCover} />,
    },
    {
      name: "Facebook event image",
      size: { width: 1920, height: 1080, unit: "px" },
      icon: <img src={FacebookCover} />,
    },
    {
      name: "Facebook image post",
      size: { width: 1200, height: 630, unit: "px" },
      icon: <img src={FacebookCover} />,
    },
    {
      name: "Facebook link image",
      size: { width: 1200, height: 630, unit: "px" },
      icon: <img src={FacebookCover} />,
    },
    {
      name: "Facebook profile picture",
      size: { width: 180, height: 180, unit: "px" },
      icon: <img src={Socialsquare} />,
    },
    {
      name: "Facebook video",
      size: { width: 1280, height: 720, unit: "px" },
      icon: <img src={FacebookCover} />,
    },
    {
      name: "Instagram landscape",
      size: { width: 1080, height: 608, unit: "px" },
      icon: <img src={FacebookCover} />,
    },
    {
      name: "Instagram portrait",
      size: { width: 1080, height: 1350, unit: "px" },
      icon: <img src={Socialportrait} />,
    },
    {
      name: "Instagram square",
      size: { width: 1080, height: 1080, unit: "px" },
      icon: <img src={Socialsquare} />,
    },
    {
      name: "LinkedIn business banner image",
      size: { width: 646, height: 220, unit: "px" },
      icon: <img src={FacebookCover} />,
    },
    {
      name: "LinkedIn company logo",
      size: { width: 300, height: 300, unit: "px" },
      icon: <img src={Socialsquare} />,
    },
    {
      name: "LinkedIn cover photo",
      size: { width: 300, height: 300, unit: "px" },
      icon: <img src={FacebookCover} />,
    },
    {
      name: "LinkedIn dynamic ad",
      size: { width: 100, height: 100, unit: "px" },
      icon: <img src={Socialsquare} />,
    },
    {
      name: "LinkedIn hero image",
      size: { width: 1128, height: 376, unit: "px" },
      icon: <img src={FacebookCover} />,
    },
    {
      name: "LinkedIn sponsored content image",
      size: { width: 1200, height: 627, unit: "px" },
      icon: <img src={FacebookCover} />,
    },
    {
      name: "Snapchat advertisement",
      size: { width: 1080, height: 1920, unit: "px" },
      icon: <img src={Socialportrait} />,
    },
    {
      name: "Twitter card image",
      size: { width: 1200, height: 628, unit: "px" },
      icon: <img src={FacebookCover} />,
    },
    {
      name: "Twitter header",
      size: { width: 1500, height: 500, unit: "px" },
      icon: <img src={FacebookCover} />,
    },
    {
      name: "Twitter post image",
      size: { width: 1024, height: 512, unit: "px" },
      icon: <img src={FacebookCover} />,
    },
    {
      name: "Twitter profile picture",
      size: { width: 400, height: 400, unit: "px" },
      icon: <img src={Socialportrait} />,
    },
    {
      name: "Twitter video landscape",
      size: { width: 1280, height: 720, unit: "px" },
      icon: <img src={FacebookCover} />,
    },
    {
      name: "Twitter video portrait",
      size: { width: 720, height: 1280, unit: "px" },
      icon: <img src={Socialportrait} />,
    },
    {
      name: "Twitter video square",
      size: { width: 720, height: 720, unit: "px" },
      icon: <img src={Socialsquare} />,
    },
  ];
  const Screen = [
    {
      name: "Desktop 1080p",
      size: { width: 1920, height: 1080, unit: "px" },
      icon: <img src={Desktop} />,
    },
    {
      name: "Desktop 2K",
      size: { width: 2560, height: 1440, unit: "px" },
      icon: <img src={Desktop} />,
    },
    {
      name: "Desktop 4K",
      size: { width: 3840, height: 2160, unit: "px" },
      icon: <img src={Desktop} />,
    },
    {
      name: "Desktop 720p",
      size: { width: 1366, height: 768, unit: "px" },
      icon: <img src={Desktop} />,
    },
    {
      name: "Desktop SD",
      size: { width: 1024, height: 768, unit: "px" },
      icon: <img src={DesktopSD} />,
    },
    {
      name: "iPhone 5",
      size: { width: 640, height: 1136, unit: "px" },
      icon: <img src={Phone} />,
    },
    { name: "iPhone X ", size: "1125 × 2436 px", icon: <img src={Phone} /> },
    {
      name: "Mobile-smallest",
      size: { width: 360, height: 640, unit: "px" },
      icon: <img src={Phone} />,
    },
    {
      name: "iPad Pro ",
      size: { width: 2388, height: 1668, unit: "px" },
      icon: <img src={Ipad} />,
    },
    {
      name: "Tablet-smallest",
      size: { width: 1024, height: 768, unit: "px" },
      icon: <img src={Ipad} />,
    },
  ];
  const ShapeBuilder = [
    { name: "Trellis", icon: <img src={Trellis} /> },
    { name: "Diamond", icon: <img src={Diamond} /> },
    { name: "Cross", icon: <img src={Cross} /> },
    { name: "Very Cross", icon: <img src={VaryCross} /> },
    { name: "Target", icon: <img src={Target} /> },
    { name: "Hive", icon: <img src={Hive} /> },
    { name: "Double Vision", icon: <img src={DoubleVision} /> },
    { name: "Celtic Flower", icon: <img src={CelticFlower} /> },
    { name: "Celtic Knot", icon: <img src={CelticKnot} /> },
    { name: "Kitchen Tile", icon: <img src={KitchenTile} /> },
    { name: "Rose", icon: <img src={Rose} /> },
    { name: "Lily", icon: <img src={Lily} /> },
    { name: "Crown", icon: <img src={Crown} /> },
    { name: "Diamond Target", icon: <img src={DiamondTarget} /> },
    { name: "TV Test Patter", icon: <img src={TVTestPattern} /> },
    { name: "Explosion", icon: <img src={Explosion} /> },
    { name: "Droplet", icon: <img src={Droplet} /> },
  ];
  const Other = [
    {
      name: "Icon 16 × 16",
      size: { width: 16, height: 16, unit: "px" },
      icon: <img src={Icon} />,
    },
    {
      name: "Icon 32 × 32",
      size: { width: 32, height: 32, unit: "px" },
      icon: <img src={Icon} />,
    },
    {
      name: "Icon 48 × 48",
      size: { width: 48, height: 48, unit: "px" },
      icon: <img src={Icon} />,
    },
    {
      name: "Icon 120 × 120",
      size: { width: 120, height: 120, unit: "px" },
      icon: <img src={Icon} />,
    },
    {
      name: "Icon 180 × 180",
      size: { width: 180, height: 180, unit: "px" },
      icon: <img src={Icon} />,
    },
    {
      name: "Icon 512 × 512",
      size: { width: 512, height: 512, unit: "px" },
      icon: <img src={Icon} />,
    },
    {
      name: "Seamless Pattern ",
      size: "Tiled Canvas",
      icon: <img src={Seamless} />,
    },
  ];
  const Custom = [
    {
      name: "A4 leaflet 3-fold Roll",
      size: "Custom Template",
      icon: <img src={Customs} />,
    },
    {
      name: "About Screen",
      size: "Custom Template",
      icon: <img src={Customs} />,
    },
    {
      name: "LaTeX Beamet",
      size: "Custom Template",
      icon: <img src={Customs} />,
    },
    { name: "No Layers", size: "Custom Template", icon: <img src={Customs} /> },
    {
      name: "Typography Canvas",
      size: "Custom Template",
      icon: <img src={Customs} />,
    },
  ];
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        dispatch(addImage({ url: imageUrl, name: file.name }));

        if (showEveryTime) {
          navigate("/2d-panel")
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <div>
        <div className="d-flex flex-column align-items-center justify-content-center vh-100" style={{ backgroundColor: 'black' }}>
          <div className="col-lg-5">
            <div className="d-flex flex-column justify-content-center  border border-1 border-dark   rounded-bottom-end shadow bg-white">
              <div>
                <h1 style={{ backgroundColor: 'black', textAlign: 'center', color: 'white', fontWeight: 'bold', padding: '20px 0px' }}>2D CAD</h1>
              </div>
              <div
                style={{ backgroundColor: isDarkMode ? "#4B4B4B" : "#E5DDDD" }}
              >
                <ul
                  className="d-flex gap-4 list-inline list-unstyled ps-3 pt-1 "
                  style={{
                    marginBottom: "0px",
                    fontSize: "13px",
                    color: isDarkMode ? "white" : "black",
                  }}
                >
                  {["Quick Setup", "Supported by You", "Time to Draw"].map(
                    (item) => (
                      <li
                        key={item}
                        className={`list-inline-item px-2 pb-1 ${activeTab === item
                          ? "border-bottom border-4 border-primary"
                          : ""
                          }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setActiveTab(item)}
                      >
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
              {activeTab === "Quick Setup" && (
                <div
                  className={` p-4`}
                  style={{
                    fontSize: "13px",
                    backgroundColor: isDarkMode ? "#4B4B4B" : "white",
                    color: isDarkMode ? "white" : "black",
                    borderTop: isDarkMode
                      ? "1px solid black"
                      : "1px solid #D1C7C7",
                    height: '300px'
                  }}
                >
                  <div>
                    <div>
                      {[
                        {
                          label: "Canvas:",
                          state: canvasTheme,
                          setState: setCanvasTheme,
                          options: [
                            "Default",
                            "Dark",
                            "Light Checkerboard",
                            "Dark Checkerboard",
                            "Solid White",
                          ],
                        },
                        {
                          label: "Keyboard:",
                          state: keyboardTheme,
                          setState: setKeyboardTheme,
                          options: [
                            "Inkscape default (default.xml)",
                            "ACD Systems Canvas 11 (acd-canvas.xml)",
                            "Adobe Illustrator (adobe-illustrator.cs2.xml)",
                            "Corel DRAW (Corel-draw.x4.xml)",
                            "Corel DRAW X8 (Corel-draw x8.xml)",
                            "Inkscape default (Inkscape.xml)",
                            "Macromedia Freehand (Macromedia-freehand-mx.xml)",
                            "Right Handed Illustration (right-hand-illustration.xml)",
                            "Xara (xara.xml)",
                            "Zoner Draw (Zoner draw.xml)",
                          ],
                        },
                        {
                          label: "Appearance:",
                          state: appearanceTheme,
                          setState: setAppearanceTheme,
                          options: [
                            "Colorful",
                            "GrayScale",
                            "Classic Symbolic",
                            "Compacted (Small Screens)",
                            "System Default",
                            "Classic Inkscape",
                          ],
                        },
                      ].map(({ label, state, setState, options }) => (
                        <div
                          className="d-flex gap-5 justify-content-left align-items-center mt-3"
                          key={label}
                        >
                          <span
                            className="me-2 text-end"
                            style={{ minWidth: "120px" }}
                          >
                            {label}
                          </span>
                          <div
                            className="dropdown d-flex"
                            style={{
                              width: label === "Appearance:" ? "40%" : "68%",
                            }}
                          >
                            <button
                              className="btn  dropdown-toggle w-100 d-flex justify-content-between align-items-center"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                              style={{
                                fontSize: "13px",
                                backgroundColor: isDarkMode
                                  ? "white"
                                  : "#4B4B4B",
                                color: isDarkMode ? "black" : "white",
                              }}
                            >
                              {state}
                            </button>
                            <ul
                              className="dropdown-menu dropdown-menu-dark w-100"
                              style={{ fontSize: "13px" }}
                            >
                              {options.map((option) => (
                                <li key={option}>
                                  <button
                                    className={`dropdown-item ${state === option ? "active" : ""
                                      }`}
                                    onClick={() => setState(option)}
                                  >
                                    {option}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {/* {label === "Appearance:" && (
                            <div className="form-check form-switch ms-3 d-flex align-items-center gap-2 ps-0">
                              <span
                                className="form-check-label mt-1"
                                htmlFor="flexSwitchCheckDefault"
                              >
                                Dark
                              </span>
                              <input
                                className="form-check-input ms-2 fs-5"
                                type="checkbox"
                                role="switch"
                                id="flexSwitchCheckDefault"
                                checked={isDarkMode}
                                onChange={() => setIsDarkMode(!isDarkMode)}
                              />
                            </div>
                          )} */}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "Supported by You" && (
                <div
                  style={{
                    fontSize: "13px",
                    backgroundColor: isDarkMode ? "#4B4B4B" : "white",
                    color: isDarkMode ? "white" : "black",
                    borderTop: isDarkMode
                      ? "1px solid black"
                      : "1px solid #D1C7C7",
                    height: '300px'
                  }}
                  className=" ps-4 pt-3"
                >
                  <p>
                    <strong>The Inkscape project is supported by users like you.</strong> Through our collective time, money and skill, we have made this software for everyone in the world to enjoy free from restrictions and free from costs.
                  </p>
                  <p><strong>If you would like to get involved and make the next version of Inkscape even better, please consider joining the Inkscape project today.</strong></p>
                </div>
              )}
              {activeTab === "Time to Draw" && (
                <div
                  className="d-flex "
                  style={{
                    fontSize: "13px",
                    backgroundColor: isDarkMode ? "#4B4B4B" : "white",
                    color: isDarkMode ? "white" : "black",
                    border: isDarkMode
                      ? "1px solid black"
                      : "1px solid #D1C7C7",
                    height: '300px'
                  }}
                >
                  <div
                    className="ps-1  pe-1"
                    style={{
                      backgroundColor: isDarkMode ? "#4B4B4B" : "#E5DDDD",
                      borderRight: isDarkMode
                        ? "1px solid black"
                        : "1px solid #D1C7C7",
                    }}
                  >
                    <ul className="list-unstyled pt-2  text-center">
                      {[
                        "Existing Files",
                        "Print",
                        "Video",
                        "Social",
                        "Screen",
                        "Shape Builder",
                        "Other",
                        "Custom",
                      ].map((item) => (
                        <li
                          key={item}
                          className={`pt-2 ${selectedSidebar === item
                            ? "border-end border-4 border-primary"
                            : ""
                            }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedSidebar(item)}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className="col-lg-10 ps-2 pt-2"
                    style={{
                      marginBottom: "0px",
                      fontSize: "13px",
                      color: isDarkMode ? "white" : "black",
                    }}
                  >
                    {selectedSidebar === "Existing Files" && (
                      <>
                        <span>Recent Files</span>
                        <hr className="m-0 mb-1" />
                        <ul className="list-unstyled">
                          {["Browse for other files..."].map((file) => (
                            <li
                              key={file}
                              className={`p-1 ${selectedFile === file
                                ? "bg-primary text-white"
                                : ""
                                }`}
                              style={{ cursor: "pointer" }}
                              onClick={() => setSelectedFile(file)}
                            >
                              {file}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {selectedSidebar === "Print" && (
                      <div className="scroll-container">
                        <div className="grid-container">
                          {pageSizes.map((item) => (
                            <div
                              key={item.name}
                              className={`cardcolor page-card ${selectedSize === item.name
                                ? "bg-primary text-white"
                                : ""
                                }`}
                              onClick={() => {
                                dispatch(setPageSize(item.size));
                                navigate("/2d-panel");
                              }}
                            >
                              <div className="card-body p-2">
                                <p className="card-title">{item.icon}</p>
                                <p
                                  className="card-title pt-3"
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.name}
                                </p>
                                <p
                                  className="card-text pt-2 "
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.size.width} × {item.size.height}{" "}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedSidebar === "Video" && (
                      <div className="scroll-container">
                        <div className="grid-container">
                          {video.map((item) => (
                            <div
                              key={item.name}
                              className={`cardcolor page-card ${selectedSize === item.name
                                ? "bg-primary text-white"
                                : ""
                                }`}
                              onClick={() => {
                                dispatch(setPageSize(item.size));
                                navigate("/2d-panel");
                              }}
                            >
                              <div className="card-body p-2">
                                <p className="card-title">{item.icon}</p>
                                <p
                                  className="card-title pt-3"
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.name}
                                </p>
                                <p
                                  className="card-text pt-2 "
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.size.width} × {item.size.height}{" "}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedSidebar === "Social" && (
                      <div className="scroll-container">
                        <div className="grid-container">
                          {Social.map((item) => (
                            <div
                              key={item.name}
                              className={`cardcolor page-card ${selectedSize === item.name
                                ? "bg-primary text-white"
                                : ""
                                }`}
                              onClick={() => {
                                dispatch(setPageSize(item.size));
                                navigate("/2d-panel");
                              }}
                            >
                              <div className="card-body p-2">
                                <p className="card-title">{item.icon}</p>
                                <p
                                  className="card-title pt-3"
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.name}
                                </p>
                                <p
                                  className="card-text pt-2 "
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.size.width} × {item.size.height}{" "}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedSidebar === "Screen" && (
                      <div className="scroll-container">
                        <div className="grid-container">
                          {Screen.map((item) => (
                            <div
                              key={item.name}
                              className={`cardcolor page-card ${selectedSize === item.name
                                ? "bg-primary text-white"
                                : ""
                                }`}
                              onClick={() => {
                                dispatch(setPageSize(item.size));
                                navigate("/2d-panel");
                              }}
                            >
                              <div className="card-body p-2">
                                <p className="card-title">{item.icon}</p>
                                <p
                                  className="card-title pt-3"
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.name}
                                </p>
                                <p
                                  className="card-text pt-2 "
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.size.width} × {item.size.height}{" "}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedSidebar === "Shape Builder" && (
                      <div className="scroll-container">
                        <div className="grid-container">
                          {ShapeBuilder.map((item) => (
                            <div
                              key={item.name}
                              className={`cardcolor page-card ${selectedSize === item.name
                                ? "bg-primary text-white"
                                : ""
                                }`}
                              onClick={() => setSelectedSize(item.name)}
                            >
                              <div className="card-body p-2">
                                <p className="card-title">{item.icon}</p>
                                <p
                                  className="card-title pt-3"
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.name}
                                </p>
                                <p
                                  className="card-text pt-2 "
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.size}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedSidebar === "Other" && (
                      <div className="scroll-container">
                        <div className="grid-container">
                          {Other.map((item) => (
                            <div
                              key={item.name}
                              className={`cardcolor page-card ${selectedSize === item.name
                                ? "bg-primary text-white"
                                : ""
                                }`}
                              onClick={() => {
                                dispatch(setPageSize(item.size));
                                navigate("/2d-panel");
                              }}
                            >
                              <div className="card-body p-2">
                                <p className="card-title">{item.icon}</p>
                                <p
                                  className="card-title pt-3"
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.name}
                                </p>
                                <p
                                  className="card-text pt-2 "
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.size.width} × {item.size.height}{" "}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedSidebar === "Custom" && (
                      <div className="scroll-container">
                        <div className="grid-container">
                          {Custom.map((item) => (
                            <div
                              key={item.name}
                              className={`cardcolor page-card ${selectedSize === item.name
                                ? "bg-primary text-white"
                                : ""
                                }`}
                              onClick={() => setSelectedSize(item.name)}
                            >
                              <div className="card-body p-2">
                                <p className="card-title">{item.icon}</p>
                                <p
                                  className="card-title pt-3"
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.name}
                                </p>
                                <p
                                  className="card-text pt-2 "
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.size}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Bottom Section */}
              {activeTab === "Time to Draw" && (
                <div
                  className="d-flex justify-content-between"
                  style={{ backgroundColor: isDarkMode ? "#4B4B4B" : "white" }}
                >
                  <div className="p-2">
                    <form>
                      <input
                        type="checkbox"
                        id="show-every-time"
                        name="show-every-time"
                        checked={showEveryTime}
                        onChange={() => dispatch(toggleShowInitialScreen())}
                      />
                      <label
                        htmlFor="show-every-time"
                        className="ms-1"
                        style={{
                          fontSize: "13px",
                          color: isDarkMode ? "white" : "black",
                        }}
                      >
                        Show this every time
                      </label>
                    </form>
                  </div>

                  {selectedSidebar === "Existing Files" ? (
                    <div>
                      <button
                        className="btn border border-1 border-dark  ps-4 pe-4 mt-2  me-2"
                        style={{
                          fontSize: "13px",
                          color: isDarkMode ? "white" : "black",
                          paddingTop: "2px",
                          paddingBottom: "2px",
                        }}
                        onClick={handleImportClick}
                      >
                        Open
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        multiple
                      />
                      <button
                        className="btn border border-1 border-dark  ps-4 pe-4 mt-2 me-2"
                        style={{
                          fontSize: "13px",
                          color: isDarkMode ? "white" : "black",
                          paddingTop: "2px",
                          paddingBottom: "2px",
                        }}
                        onClick={() => {
                          navigate("/2d-panel");
                        }}
                      >
                        New Document
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <button
                          className="btn border border-1 border-dark  ps-4 pe-4 mt-2  me-2"
                          style={{
                            fontSize: "13px",
                            color: isDarkMode ? "white" : "black",
                            paddingTop: "2px",
                            paddingBottom: "2px",
                          }}
                        >
                          New Document
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              {activeTab === "Supported by You" && (
                <div
                  className="d-flex justify-content-end align-items-end"
                  style={{ backgroundColor: isDarkMode ? "#4B4B4B" : "white" }}
                >
                  <button
                    className="btn border border-1 border-dark pt-1 pb-1 ps-4 pe-4 mt-2  me-2 mb-2"
                    style={{
                      fontSize: "13px",
                      color: isDarkMode ? "white" : "black",
                    }}
                  >
                    Thanks!
                  </button>
                </div>
              )}
              {activeTab === "Quick Setup" && (
                <div
                  className="d-flex justify-content-end align-items-end"
                  style={{ backgroundColor: isDarkMode ? "#4B4B4B" : "white" }}
                >
                  <button
                    className="btn border border-1 border-dark pt-1 pb-1 ps-4 pe-4 mt-2  me-2 mb-2"
                    style={{
                      fontSize: "13px",
                      color: isDarkMode ? "white" : "black",
                    }}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;