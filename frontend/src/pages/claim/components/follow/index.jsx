import React, { useState, useEffect, useRef } from "react";
// import BurnModal from "../../components/BurnModal";
// import { get, post } from "../../network";
// import { Pagination, Card, Avatar, Spin, Popover, message, Empty } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import handleFollow from "./handleFollow/index";
import login from "./login/index";
const Follow = () => {
  const [loading, setLoading] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const toggleFollow = () => setIsFollowed((cur) => !cur);

  return isFollowed ? (
    <HeartFilled
      key="heart-filled"
      onClick={toggleFollow}
      style={{ color: "#1890ff" }}
      disabled={!loading}
    />
  ) : (
    <HeartOutlined
      key="heart-outlined"
      disabled={!loading}
      // onClick={toggleFollow}
      onClick={() => {
        setLoading(true);
        login()
          .then(handleFollow)
          .finally(() => {
            toggleFollow();
            setLoading(false);
          });
      }}
    />
  );
};

export default Follow;
