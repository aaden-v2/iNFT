import React from "react";
import ReactDOM from "react-dom";
import "antd/dist/antd.css";

import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
// import { MoralisProvider } from "react-moralis";
// import Moralis from "moralis";

// const SERVER_URL = "https://roa8dvydxnnu.usemoralis.com:2053/server";
// const APP_ID = "7ooPl4ZDUO8149QQc0bJSQeX5FWtTlWCdAxppLeK";

// Moralis.start({ serverUrl: SERVER_URL, appId: APP_ID });

// ReactDOM.render(
//   <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
//     <App />
//   </MoralisProvider>,
//   document.getElementById('root')
// );
ReactDOM.render(<App />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
