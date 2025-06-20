import { ChromeOutlined, DollarOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { PageContainer, ProLayout } from '@ant-design/pro-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Dropdown } from 'antd';
import { useState } from 'react';
import { Link, Outlet, useModel, history, useLocation } from 'umi';
import _defaultAvatar from '@/assets/defaultAvatar.svg'
import VersionContorl from './VersionContorl';
import enUS from 'antd/locale/en_US';
import _metasoSvg from '@/assets/dashboard/mataso.svg';
const queryClient = new QueryClient()
export default () => {
    const location = useLocation();
    const path = location.pathname;
    const [pathname, setPathname] = useState(path);
    const { admin } = useModel('dashboard')
    return <ConfigProvider locale={enUS}><QueryClientProvider client={queryClient}><div
        style={{
            height: '100vh',
        }}
    >
        <ProLayout
            location={{
                pathname,
            }}
            title="MetaSo"
            logo={_metasoSvg}
            route={{
                path: '/dashboard',
                routes: [
                    {
                        path: '/dashboard/styles',
                        name: 'Style',
                        icon: <ChromeOutlined />,
                    },
                    {
                        path: '/dashboard/fees',
                        name: 'Settings',
                        icon: <SettingOutlined />,
                    },
                    {
                        path: '/dashboard/metaso',
                        name: '$METASO',
                        icon: <DollarOutlined />,
                    },
                ],
            }}
            avatarProps={{
                src: _defaultAvatar,
                title: admin?.host.slice(0, 6),
                render: (props, dom) => {
                    return (
                        <Dropdown
                            menu={{
                                items: [
                                    {
                                        key: 'logout',
                                        icon: <LogoutOutlined />,
                                        label: 'Logout',
                                        onClick: () => {
                                            localStorage.clear()
                                            history.push('/dashboardLogin')
                                        }
                                    },
                                ],
                            }}
                        >
                            {dom}
                        </Dropdown>
                    );
                },
            }}

            actionsRender={(props) => {
                return [
                    <VersionContorl />
                ];
            }}
            menuItemRender={(item, dom) => (
                <a
                    onClick={() => {
                        setPathname(item.path || '/dashboard/styles');
                        history.push(item.path || '/dashboard/styles');
                    }}
                >
                    {dom}
                </a>
            )}
        >
            <PageContainer >
                <Outlet />
            </PageContainer>
        </ProLayout>
    </div>
    </QueryClientProvider>
    </ConfigProvider>
};