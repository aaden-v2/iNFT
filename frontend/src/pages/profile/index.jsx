import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "antd";

const Profile = () => {
  const history = useHistory();
  return (
    <div>
      <div>to be continue</div>
      <div>
        <Button onClick={() => history.push("/profile/drop-history")}>跳转到空投历史页</Button>
      </div>
    </div>
  );
};

export default Profile;
