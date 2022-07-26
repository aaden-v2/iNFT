import { closeIcon } from "../../assets/icons";
import "./index.css";
import logo from "../../assets/logo.png";
import React from "react";

const data = {
  title: "About",
  description:
    "NFT Ads is an AD delivery tool for Web3 users, including individuals, DAOs and other crypto teams.The dApp was inspired by the ideas and creations of projects like Polygon, Moralis and many more. Thanks for using NFT Ads! 🙏"
};

function AboutModal(props) {
  const { handleClose } = props;

  return (
    <div className="App__modal App__about-modal-wrapper" data-visible={props.isModalVisible}>
      <div className="App__modal-content">
        <div className="App__modal-title">
          <span>{data.title}</span>
          <span className="App__modal-close" onClick={handleClose}>
            {closeIcon}
          </span>
        </div>
        <div className="App__modal-body">
          <img className="App__about-modal-logo" src={logo} alt="logo" />
          <div className="App__about-modal-content-description">{data.description}</div>
        </div>
      </div>
    </div>
  );
}

export default AboutModal;
