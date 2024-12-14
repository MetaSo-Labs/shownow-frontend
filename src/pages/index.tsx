import { Button, Space, Grid, notification, message, theme, Typography } from 'antd';
import logo from '../assets/logo.svg';
import bg from '../assets/bg.svg';
import './index.less';
import { useModel, history } from 'umi';
import styles from './dashboard/styles';
import ConnectWallet from '@/Components/ConnectWallet';
const { useBreakpoint } = Grid


export default function HomePage() {
  const { isLogin, setIsLogin, connect, setShowConnect: _setShowConnect } = useModel('user');
  const [api, contextHolder] = notification.useNotification();
  const { showConf } = useModel('dashboard');
  const { token: {
    colorBgLayout
  } } = theme.useToken()
  const { md } = useBreakpoint()
  const handleConnect = async () => {
    await connect();
    setTimeout(() => {
      history.push('/')
    }, 100);
  }

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
  return (
    <div className='indexPage' style={{ background: showConf?.colorBgLayout || colorBgLayout }} >
      {md && <img src={showConf?.homeBackgroundImage || bg} alt="" className="bgImg" />}
      <div className="indexContent">
        <div className="header">
          <img src={showConf?.logo} alt="" className="logo" />
          <Button shape='round' onClick={() => {
            setShowConnect(true)
          }} style={{ color: showConf?.brandColor }}>Connect</Button>
        </div>
        <div className="info">
          <Typography.Title >{showConf?.brandIntroMainTitle || 'Unbounded Creation Infinite Earnings'}</Typography.Title>
          <Typography.Text>{showConf?.brandIntroSubTitle || 'At Show Now, post and create videos to turn your creativity and talent into interaction and revenue'}</Typography.Text>
          <Typography.Title level={3} style={{ marginTop: 113 }}>
            Get Started
          </Typography.Title>
          <Typography.Text>Connect your wallet to create a new Account or open an existing one</Typography.Text>
          <Space style={{ marginTop: 100 }}>
            <Button shape='round' disabled={!showConf?.twitterUrl} onClick={() => {
              window.open(showConf?.twitterUrl)
            }}>Twitter</Button>
            <Button type="primary" shape='round' onClick={() => {
              setShowConnect(true)
            }} style={{ background: showConf?.brandColor }}>Connect</Button  >
          </Space>
        </div>
      </div>
      <ConnectWallet />
      {contextHolder}
    </div>
  );
}
