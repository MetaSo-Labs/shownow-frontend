import { Link, Outlet, useModel, history, useIntl, useLocation, useOutlet } from 'umi';
import { Button, Col, ConfigProvider, Divider, Dropdown, FloatButton, Grid, Input, InputNumber, Layout, Menu, message, notification, Radio, Row, Segmented, Space, Tag, theme, Typography } from 'antd';
import { useEffect, useLayoutEffect, useState } from 'react';
import './index.less';
import Menus from './Menus';
import { CaretDownOutlined, EditOutlined, EllipsisOutlined, LoginOutlined, PoweroffOutlined, ProjectOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import {
    QueryClient,
    QueryClientProvider,
    useQueryClient,
} from '@tanstack/react-query'
import NewPost from '@/Components/NewPost';
import Mobilefooter from './Mobilefooter';
import _btc from '@/assets/btc.png'
import _mvc from '@/assets/mvc.png'
import Recommend from '@/Components/Recommend';
import UserAvatar from '@/Components/UserAvatar';
import TopTool from './TopTool';
import SelectLang from './SelectLang';
import Trans from '@/Components/Trans';
import HeaderMenus from './HeaderMenus';

import { Activity } from '@ivliu/react-offscreen';
import { DefaultLogo } from '@/config';
import UserSetting from '@/Components/UserSetting';
import ConnectWallet from '@/Components/ConnectWallet';
import ProfileSetting from '@/Components/ProfileSetting';



const { useBreakpoint } = Grid

const { Header, Content, Footer, Sider } = Layout;

export default function ShowLayout({ children, _showConf }: { children?: React.ReactNode, _showConf?: DB.ShowConfDto }) {
    const location = useLocation();
    const { formatMessage } = useIntl()
    const queryClient = useQueryClient();
    const [collapsed, setCollapsed] = useState(false);
    const { showConf: __showConf } = useModel('dashboard')
    const { user, chain, disConnect, feeRate, setFeeRate, connect, switchChain, checkUserSetting, isLogin } = useModel('user')
    const { md } = useBreakpoint();
    const { token: {
        colorPrimary,
        colorTextSecondary,
        colorBgBase,
        colorBgLayout,
        colorBgContainer,
    } } = theme.useToken()
    const [api, contextHolder] = notification.useNotification();
    const showConf = _showConf || __showConf

    const [followMode, setFollowMode] = useState('hide')

    useEffect(() => {
        if (location.pathname === '/follow') {
            setTimeout(() => {
                setFollowMode('visible')
            }, 1000)

        } else {
            setFollowMode('hide')
        }
    }, [location.pathname])

    useLayoutEffect(() => {
        if (location.pathname.indexOf('dashboard') > -1) {
            return
        } else {
            checkUserSetting()
        }

    }, [checkUserSetting, location.pathname])

    const openNotification = () => {
        const key = `open${Date.now()}`;
        const btn = (
            <Space>
                <Button type="primary" style={{ background: showConf?.brandColor }} size="small" onClick={() => {
                    window.open(
                        "https://chromewebstore.google.com/detail/metalet/lbjapbcmmceacocpimbpbidpgmlmoaao"
                    );
                    api.destroy()
                }}>
                    Install Wallet Now
                </Button>
            </Space>
        );
        api.open({
            message: 'Metalat Wallet',
            description:
                "It looks like you don't have a wallet installed yet. Please install the Metalat wallet.",
            btn,
        });
    }

    const setShowConnect = async (_show: boolean) => {
        if (_show && !window.metaidwallet) {
            openNotification();
            return
        }
        try {
            await connect()
            setTimeout(() => {
                history.push('/')
            }, 100);
        } catch (err: any) {
            message.error(err.message)
        }

    }







    const [showPost, setShowPost] = useState(false)
    if (!showConf) return null

    return (
        <div style={{ background: colorBgLayout, maxHeight: '100vh', overflow: 'hidden' }}>
            <Layout className='layout' style={{ width: showConf.showSliderMenu ? showConf.contentSize : '100%', }} >
                {
                    md && showConf?.showSliderMenu ?
                        <Sider style={{ background: colorBgContainer, height: '100vh' }} collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} className='sider'>
                            <div>
                                <div className="logoWrap">
                                    <img src={showConf?.logo || DefaultLogo} alt="" className="logo" />
                                </div>
                                <Menus />
                            </div>
                            <Button size='large' shape='round' type='primary' onClick={() => {
                                if (!isLogin) {
                                    setShowConnect(true)
                                    return
                                }
                                const isPass = checkUserSetting();
                                if (!isPass) {
                                    return;
                                }
                                setShowPost(true)
                            }}>
                                {formatMessage({ id: 'Post' })}
                            </Button>
                        </Sider> : ''
                }
                <Layout className='layout2' style={{ background: colorBgLayout, padding: 0, flexGrow: 1 }} >
                    <Header style={{
                        width: '100%',
                        padding: 0,
                        background: showConf?.colorHeaderBg || colorBgLayout,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }} className='header'>
                        <Row style={{ width: !showConf.showSliderMenu ? showConf.contentSize : '100%', maxWidth: "100%", }} gutter={[12, 12]}>
                            {
                                !showConf?.showSliderMenu && <Col span={6} md={showConf?.showSliderMenu ? 0 : 5} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 8 }} >
                                    {
                                        md && <div className="logoWrap" onClick={() => history.push('/')}>
                                            <img src={showConf?.logo || DefaultLogo} alt="" className="logo" />
                                        </div>
                                    }

                                    <HeaderMenus />
                                </Col>
                            }

                            {md ? <Col span={24} md={showConf?.showSliderMenu ? 14 : 9}>

                                <div className="searchWrap" style={{ background: colorBgContainer }} onClick={() => {
                                    if (!isLogin) {
                                        setShowConnect(true)
                                        return
                                    }
                                    const isPass = checkUserSetting();
                                    if (!isPass) return;
                                    setShowPost(true)
                                }}>
                                    <Input size="large" prefix={
                                        <EditOutlined style={{ color: showConf?.brandColor }} />
                                    } placeholder={formatMessage({
                                        id: 'post_placeholder'
                                    })} variant="borderless" suffix={
                                        <Button shape='round' style={{ background: showConf?.gradientColor, color: showConf.colorButton, marginRight: 12 }} >
                                            {formatMessage({ id: 'Post' })}
                                        </Button>
                                    } />
                                </div>
                            </Col> : ''}
                            <Col span={showConf?.showSliderMenu ? 24 : 18} md={10}>
                                <div className="userPanel" style={{ background: colorBgContainer }}>
                                    {
                                        isLogin ? <Dropdown placement='bottom' menu={
                                            {
                                                items: [
                                                    {
                                                        key: 'rank',
                                                        label: formatMessage({ id: 'Rank' }),
                                                        icon: <ProjectOutlined />,
                                                        onClick: () => {
                                                            history.push('/rank')
                                                        }
                                                    }, 
                                                    {
                                                        key: 'profile',
                                                        label: formatMessage({ id: 'Profile' }),
                                                        icon: <UserOutlined />,
                                                        onClick: () => {
                                                            history.push('/profile')
                                                        }
                                                    },

                                                    {
                                                        key: 'setting',
                                                        label: formatMessage({ id: 'Settings' }),
                                                        icon: <SettingOutlined />,
                                                        onClick: () => {
                                                            history.push('/setting')
                                                        }
                                                    },
                                                    {
                                                        key: 'logout',
                                                        label: formatMessage({ id: 'Log out' }),
                                                        icon: <PoweroffOutlined />,
                                                        onClick: disConnect
                                                    }
                                                ]
                                            }
                                        }  >
                                            <div className="user" >
                                                <UserAvatar src={user.avater} />
                                                <div className='desc'>
                                                    <Typography.Text className="name">
                                                        {user.name || 'Unnamed'}
                                                    </Typography.Text>
                                                    <Typography.Text className="metaid" style={{ whiteSpace: 'nowrap' }}>
                                                        MetaID:{user.metaid.slice(0, 8)}
                                                    </Typography.Text>
                                                </div>
                                            </div>
                                        </Dropdown> : <Button type="primary" shape='round' onClick={() => {
                                            setShowConnect(true)
                                        }} >
                                            <Trans wrapper>Connect</Trans>
                                        </Button  >
                                    }

                                    <div className="actions">

                                        <Dropdown placement='bottom' dropdownRender={() => {
                                            return <div>
                                                <Menu>
                                                    <Menu.Item key='1' disabled={chain === 'btc'} onClick={async () => {
                                                        await switchChain('btc');
                                                        queryClient.invalidateQueries({ queryKey: ['homebuzzesnew'] });
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", width: "100%", gap: 16, padding: 8 }}>
                                                            <Space>
                                                                <img src={_btc} alt="" style={{ width: 24, height: 24 }} />
                                                                <div style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <Typography.Text style={{ lineHeight: 1 }}>BTC </Typography.Text>
                                                                    {/* <Typography.Text type='secondary' style={{ lineHeight: 1 }}>Network</Typography.Text> */}
                                                                </div>
                                                            </Space>
                                                            <InputNumber value={feeRate} onChange={(_value) => {
                                                                setFeeRate(Number(_value))
                                                            }} controls={false} suffix={'sats'}
                                                                precision={0}
                                                            >
                                                            </InputNumber>
                                                        </div>


                                                    </Menu.Item>
                                                    <Menu.Item key='2' disabled={chain === 'mvc'} onClick={() => {
                                                        switchChain('mvc')
                                                    }}>

                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", gap: 16, padding: 8 }}>
                                                            <Space>
                                                                <img src={_mvc} alt="" style={{ width: 24, height: 24 }} />
                                                                <div style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: 4
                                                                }}>
                                                                    <Typography.Text style={{ lineHeight: 1 }}>MVC  </Typography.Text>
                                                                    <Typography.Text type='secondary' style={{ lineHeight: 1 }}>  <Tag color='orange' bordered={false}><Trans>
                                                                        Bitcoin Sidechain
                                                                    </Trans> </Tag></Typography.Text>

                                                                </div>
                                                            </Space>
                                                            <InputNumber value={1} disabled variant='borderless' controls={false} suffix={'sats'}
                                                                precision={0}
                                                            >
                                                            </InputNumber>
                                                        </div>


                                                    </Menu.Item>
                                                </Menu>
                                            </div>
                                        }}>

                                            <Button shape='round' type='text' variant='filled' color='default' style={{ height: 34 }}>
                                                <img src={chain === 'btc' ? _btc : _mvc} alt="" style={{ width: 24, height: 24 }} />
                                                <Typography>
                                                    <Typography.Text style={{ color: colorPrimary }}>{chain === 'btc' ? feeRate : 1} </Typography.Text>
                                                    <Typography.Text type='secondary'> sats</Typography.Text>
                                                </Typography>
                                                <CaretDownOutlined style={{ color: colorTextSecondary }} />
                                            </Button>

                                        </Dropdown>

                                        {/* <Button shape='circle' type='text' color='default' onClick={disConnect}>
                                            <PoweroffOutlined />
                                        </Button> */}
                                        <SelectLang />
                                    </div>

                                </div>
                            </Col>
                        </Row>
                    </Header>
                    {
                        !showConf?.showSliderMenu && <TopTool />
                    }
                    <Content style={{ flexGrow: 1, width: !showConf.showSliderMenu ? showConf.contentSize : '100%', maxWidth: "100%", padding: 12 }}>
                        <Row gutter={[12, 12]} style={{ height: '100%', position: 'relative', padding: 0, }}>
                            <Col span={24} md={showConf?.showRecommend ? 14 : 24} style={{ height: '100%', width: '100%', overflow: 'scroll' }} >
                                {children ? children : <>
                                    <Activity mode={location.pathname === '/follow' ? 'visible' : 'hidden'}><Outlet /></Activity>
                                    <Activity mode={location.pathname === '/home' ? 'visible' : 'hidden'}><Outlet /></Activity>
                                    <Activity mode={location.pathname === '/' ? 'visible' : 'hidden'}><Outlet /></Activity>
                                    <Activity mode={location.pathname === '/profile' ? 'visible' : 'hidden'}><Outlet /></Activity>
                                    {
                                        !['/home', '/follow', '/', '/profile'].includes(location.pathname) && <Outlet />
                                    }

                                </>}


                            </Col>
                            {
                                (md && showConf?.showRecommend) && <Col md={10} span={24}>
                                    <Recommend />
                                </Col>
                            }
                        </Row>
                    </Content>

                    {!md && showConf?.showSliderMenu ? <Footer className='footer' style={{ background: colorBgContainer }}><Mobilefooter /></Footer> : ''}
                </Layout>

                <NewPost show={showPost} onClose={() => {
                     
                    setShowPost(false)
                }} />
                {
                    !md && <FloatButton style={{ bottom: 100 }} icon={<EditOutlined />} onClick={() => {
                        if (!isLogin) {
                            setShowConnect(true)
                            return
                        }
                        const isPass = checkUserSetting();
                        if (!isPass) return;
                        setShowPost(true)
                    }} />
                }
                <UserSetting />
                <ProfileSetting />
            </Layout>
            {contextHolder}
        </div>

    );
}
