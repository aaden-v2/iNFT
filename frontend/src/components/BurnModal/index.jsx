import { closeIcon } from "../../assets/icons";
import NAFTADABI from "../../abi/NFTAD.json";
import "./index.css";
import { Button, Input } from "antd";
import { ethers } from "ethers";
import React, { useState } from "react";
import { handleError } from "../../util/util";
import { updateSubscription } from "../../util/superfluid";

function BurnModal(props) {
  const { handleClose, nftTokenID } = props;
  const [twitterUrl, setTwitterUrl] = useState("");
  // const [transHash, setTransHash] = useState("");

  const clickConfirm = async () => {
    try {
      const NFTADAddress = "0xE15A0940Bc6F4cB555733DB33661dd20b0Cbe993";
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const NFTADContract = new ethers.Contract(NFTADAddress, NAFTADABI, signer);
      const options = {
        gasLimit: 1000000
      };
      const tx = await NFTADContract.burn(nftTokenID, 1, twitterUrl,  options);

      await updateSubscription();

      alert("Success!");
      handleClose();
      await tx.wait();
    } catch (error) {
      handleError(error, "confirm burn");
    }
  };

  return (
    <div className="App__modal App__about-modal-wrapper" data-visible={props.isModalVisible}>
      <div className="App__modal-content App__burn-modal">
        <div className="App__modal-title">
          <span>Gain Awards</span>
          <span className="App__modal-close" onClick={handleClose}>
            {closeIcon}
          </span>
        </div>
        <div className="App__modal-body">
          <p className="App__burn-modal-description">Please input the twitter random hash below</p>
          <Input
            className="App__burn-modal-input"
            value={twitterUrl}
            onChange={(e) => {
              setTwitterUrl(e.target.value);
            }}
            placeholder="twitter random hash"
          />
          <Button
            type="primary"
            htmlType="submit"
            onClick={clickConfirm}
            className="App__burn-modal-confirm"
          >
            confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BurnModal;
