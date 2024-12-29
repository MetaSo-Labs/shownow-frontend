import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { Navigate, Outlet, useModel } from 'umi'

export default (props) => {
  const { isLogin, initializing } = useModel('user');
  const { showConf, loading } = useModel('dashboard')
  if (initializing || loading) {
    return <Spin spinning fullscreen indicator={<LoadingOutlined style={{ color: showConf?.brandColor }} spin />} />
  }
  if (isLogin || !showConf?.checkLogin) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
}