import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Dropdown, Menu } from "antd";
import {
  ExclamationCircleOutlined,
  BarsOutlined,
  FunnelPlotOutlined,
  LogoutOutlined
} from "@ant-design/icons";
import logo from "../../assets/logo.png";
import metaMaskLogo from "../../assets/metamask.png";
import AboutModal from "../../components/AboutModal";
import { handleAddress, handleError } from "../../util/util";
import { post } from "../../network";
import { useWallet } from "../../hooks/useWallet";

import "./index.css";

const Header = () => {
  const history = useHistory();
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const { walletState, web3, connectMetamask, disconnectMetamask, setIsLogin } = useWallet();
  const { address, isLogin } = walletState;
  const login = async () => {
    const address = await connectMetamask();
    if (!address) {
      return;
    }
    try {
      const { nounce } = (await post("/login/nounce", { address }))?.data?.data;
      const signedNounce = await web3.current.eth.personal.sign(nounce, address);
      if (!signedNounce) {
        return;
      }
      await post("/login/token", { address, nounce, signedNounce, user_data: {} });
      getTransferMatic(address);
      setIsLogin(true);
    } catch (error) {
      handleError(error, "login");
    }
  };

  const logout = async () => {
    disconnectMetamask();
    await window.cookieStore.delete("token");
  };

  //给登录的用户空投测试币
  const getTransferMatic = async (currentAddress) => {
    if (!currentAddress) {
      console.log("need currentAddress");
      return;
    }

    console.log("getTransferMatic" + currentAddress);
      

    try {
      const requestParams = { network: "mumbai", address: currentAddress, token: "maticToken" };

      const resp = await fetch("https://api.faucet.matic.network/transferTokens", {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "zh-CN,zh;q=0.9",
          "content-type": "application/json;charset=UTF-8",
          "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site"
        },
        "referrer": "https://faucet.polygon.technology/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": JSON.stringify(requestParams),
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
      });

      console.log(success);
    } catch (error) {
      console.error(error);
    }
  };

  const clickAbout = () => {
    setIsAboutModalVisible(true);
  };
  const handleAboutModalClose = () => {
    setIsAboutModalVisible(false);
  };
  const handleFaucet = () => window.open("https://faucet.polygon.technology/", "blank");
  return (
    <header className="App__header">
      <img src={logo} className="App-logo" alt="logo" onClick={() => history.push("/home")} />
      <div className="App__header-menu">
        <div className="App__header-menu-item" onClick={clickAbout}>
          <ExclamationCircleOutlined />
          <span className="App__header-menu-about">About</span>
        </div>
        {address && isLogin ? (
          <div className="App__header-menu-item">
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={() => history.push("/profile/drop-history")}
                    key="history"
                    icon={<BarsOutlined />}
                  >
                    Drop History
                  </Menu.Item>
                  <Menu.Item onClick={handleFaucet} key="faucet" icon={<FunnelPlotOutlined />}>
                    Faucet
                  </Menu.Item>
                  <Menu.Item onClick={logout} key="logout" icon={<LogoutOutlined />}>
                    Disconnect Wallet
                  </Menu.Item>
                </Menu>
              }
            >
              <div className="App__header-menu-disconnect">
                <span className="App__header-account-address">{handleAddress(address)}</span>
              </div>
            </Dropdown>
          </div>
        ) : (
          <div className="App__header-menu-login-item" onClick={login}>
            <img src={metaMaskLogo} className="App__metaMaskLogo" alt="metaMaskLogo" />
            <span className="App__header-menu-login">connect</span>
          </div>
        )}
      </div>
      <AboutModal isModalVisible={isAboutModalVisible} handleClose={handleAboutModalClose} />
    </header>
  );
};

export default Header;
