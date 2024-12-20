import { DASHBOARD_TOKEN } from '@/config';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { Navigate, Outlet, useModel } from 'umi'

export default (props) => {
    const { logined } = useModel('dashboard')

    if (logined) {
        return <Outlet />;
    } else {
        return <Navigate to="/dashboardLogin" />;
    }
}