import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import React from "react";
import "./global.less";
import { useModel } from "umi";

const antIcon = (
  <LoadingOutlined style={{ fontSize: 24, color: "#8565F2" }} spin />
);

const App: React.FC = () => {
  // 
  const { showConf } = useModel('dashboard');
  return (
    <Spin spinning fullscreen indicator={<LoadingOutlined style={{color:showConf?.brandColor}} spin />} />
  );
};

export default App;
