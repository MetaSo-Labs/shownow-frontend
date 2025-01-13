import { ChromeOutlined, DollarOutlined, SettingOutlined } from '@ant-design/icons';
import { PageContainer, ProLayout } from '@ant-design/pro-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, Outlet, useModel, history, useLocation } from 'umi';
const queryClient = new QueryClient()
export default () => {
    const location = useLocation();
    const path = location.pathname;
    const [pathname, setPathname] = useState(path);
    return <QueryClientProvider client={queryClient}><div
        style={{
            height: '100vh',
        }}
    >
        <ProLayout
            location={{
                pathname,
            }}
            title="SHOW NOW"
            logo="data:image/png;base64,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"
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
                    // {
                    //     path: '/dashboard/metaso',
                    //     name: '$METASO',
                    //     icon: <DollarOutlined />,
                    // },
                ],
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
};