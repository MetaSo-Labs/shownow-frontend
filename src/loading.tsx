import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import React from "react";
import "./global.less";

const antIcon = (
  <LoadingOutlined style={{ fontSize: 24, color: "#8565F2" }} spin />
);

const App: React.FC = () => {
  // 
  return (
    <div className="init_loading" >
      <Spin indicator={antIcon} />
    </div>
  );
};

export default App;
