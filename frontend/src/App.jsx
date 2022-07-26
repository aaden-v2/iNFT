import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";
import Loadable from "react-loadable";
import { Spin } from "antd";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { WalletProvider } from "./hooks/useWallet";

const App = () => {
  return (
    <div className="App">
      <Router>
        <Header />
        <Switch>
          <Route
            path="/home"
            component={Loadable({
              loader: () => import("./pages/home"),
              loading: () => <Spin spinning />
            })}
          />
          <Route
            path="/profile"
            exact
            component={Loadable({
              loader: () => import("./pages/profile"),
              loading: () => <Spin spinning />
            })}
          />
          <Route
            path="/profile/drop-history"
            component={Loadable({
              loader: () => import("./pages/profile/drop-history"),
              loading: () => <Spin spinning />
            })}
          />
          <Route
            path="/claim"
            component={Loadable({
              loader: () => import("./pages/claim"),
              loading: () => <Spin spinning />
            })}
          />
          <Redirect from={"/profile/*"} to={"/profile"} />
          <Redirect from={"/*"} to={"/home"} />
        </Switch>
      </Router>
      <Footer />
    </div>
  );
};

const WrappedApp = () => <WalletProvider>{App}</WalletProvider>;

export default WrappedApp;
