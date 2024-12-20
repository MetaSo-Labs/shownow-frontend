import { curNetwork, DASHBOARD_TOKEN } from '@/config';
import { fetchAdmin, login, loginWithWallet } from '@/request/dashboard';
import {
  AlipayOutlined,
  GlobalOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoOutlined,
  UserOutlined,
  WalletOutlined,
  WeiboOutlined,
} from '@ant-design/icons';
import {
  LoginFormPage,
  ProConfigProvider,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Avatar, Badge, Button, Col, ConfigProvider, Descriptions, Divider, Modal, Row, Space, Tabs, Typography, message, theme } from 'antd';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import _logo from '@/assets/dashboard/logo.svg'
import _bg from '@/assets/dashboard/bg.png'
import _metaletLogo from '@/assets/dashboard/metalet-logo.svg'
import './index.less'

type LoginType = 'phone' | 'account';

const iconStyles: CSSProperties = {
  color: 'rgba(0, 0, 0, 0.2)',
  fontSize: '18px',
  verticalAlign: 'middle',
  cursor: 'pointer',
};

const Page = () => {
  const { setLogined } = useModel('dashboard')
  const [modal, contextHolder] = Modal.useModal();
  const [loginType, setLoginType] = useState<LoginType>('account');
  const { token } = theme.useToken();
  const handleLogin = async (values: any) => {
    try {

      const ret = await login(values);
      if (ret.access_token) {
        message.success('Login successful')
        localStorage.setItem(DASHBOARD_TOKEN, ret.access_token)
        setTimeout(() => {
          history.push('/dashboard/styles')
        }, 0)
      }
    } catch (e: any) {
      console.log(e);
      message.error(e.response && e.response.data && e.response.data.message || e.message)
    }
  }
  const [admin, setAdmin] = useState<boolean>();
  const [showIntial, setShowIntial] = useState<boolean>(false);

  useEffect(() => {
    fetchAdmin().then((res) => {
      setAdmin(res.btcAddress ? true : false);
      if (!res.btcAddress) {
        setShowIntial(true)
      }
    })
  }, [])



  const handleLoginWithWallet = async () => {
    try {
      const isConnected: any = await window.metaidwallet.isConnected();
      if (isConnected.status === "no-wallets") {
        throw new Error("please init wallet");
      }
      if (isConnected.status === "locked") {
        throw new Error("please unlock your wallet");
      }
      if (isConnected.status === "not-connected") {
        throw new Error("not-connected");
      }
      if (isConnected === false) {
        const ret = await window.metaidwallet.connect();
        if (ret.status) {
          throw new Error(ret.status);
        }
      }
      let { network: _net } = await window.metaidwallet.getNetwork();
      if (_net !== curNetwork) {
        const ret = await window.metaidwallet.switchNetwork(
          curNetwork === "testnet" ? "testnet" : "livenet"
        );
        if (ret.status === "canceled") return;
        const { network } = await window.metaidwallet.getNetwork();
        if (network !== curNetwork) {
          throw new Error("network error");
        }
      }
      const btcAddress = await window.metaidwallet.btc.getAddress();
      const publicKey = await window.metaidwallet.btc.getPublicKey();
      const mvcAddress = await window.metaidwallet.getAddress();
      const signature: any = await window.metaidwallet.btc.signMessage('show.now');
      if (signature.status) {
        throw new Error(signature.status);
      }

      const admin = await fetchAdmin();
      if (!admin) {
        const confirmed = await modal.confirm({
          icon: null,
          title: <Badge status="success" text="Already connected" />,
         
          content: <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            textAlign: 'center',
          }}>
            <Descriptions layout="vertical" column={1} items={[{
              label: 'BTC Address',
              children: btcAddress,
            }, {
              label: 'MVC Address',
              children: mvcAddress,
            }]} />
            <Typography.Title level={5}>Whether to set this account as the highest administrator?</Typography.Title>
          </div>
        });
        if (!confirmed) {
          message.error('canceled')
          return
        }
      }

      const ret = await loginWithWallet({
        btcAddress,
        publicKey,
        mvcAddress,
        signature: signature,
      });
      if (ret.access_token) {
        message.success('Login successful')
        localStorage.setItem(DASHBOARD_TOKEN, ret.access_token)
        setLogined(true)
        setTimeout(() => {
          history.push('/dashboard/styles')
        }, 0)
      }
    } catch (e: any) {
      console.log(e);
      message.error(e.response && e.response.data && e.response.data.message || e.message)
      // message.error(e.message)
    }
  }
  return (
    <div
      className='dashboard-login'
    >
      <Row style={{ height: '100%' }}>


        <Col sm={0} xs={0} md={12} lg={16} xl={18} className='descWrap'>
          <div className='descContent'>
            <Typography.Title level={1} >Building a Scalable Decentralized Social Media Network on Bitcoin</Typography.Title>
            <Typography.Paragraph >An open-source middleware & services for social sites based on MetaID. Devs can deploy a decentralized web3 social app in 20 mins via config file mods. MetaSo network is DAO-initiated & -operated. </Typography.Paragraph>
          </div>
        </Col>
        <Col sm={24} xs={24} md={12} lg={8} xl={6} className='login-panel'>
          <img src={_logo} alt="" className="logo" />
          <Button size='large' block type='default' style={{ height: 64 }} onClick={handleLoginWithWallet}>
            <Space>
              <Avatar size={44} src={_metaletLogo} />
              Metalet Wallet
            </Space>
          </Button>
        </Col>
      </Row>


      {contextHolder}
      <Modal

        open={showIntial}
        footer={null}
        closable={false}
        onOk={() => {
          setShowIntial(false)
        }}
        onCancel={() => {
          setShowIntial(false)
        }}
        styles={{
          body: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 16

          }
        }}
      >
        <Button type='primary' size='large' shape='circle' icon={<GlobalOutlined />} />
        <Typography.Title level={3}>Node Initialization Configuration</Typography.Title>
        <Typography.Text type='secondary'>Welcome to MetaSo Node Management System. First use requires setting up the top admin account. Connect your wallet and set it as the admin. </Typography.Text>
        <Button type='primary' block size='large' icon={<WalletOutlined />} onClick={handleLoginWithWallet}>
          Connect
        </Button>

      </Modal>
    </div>
  );
};

export default () => {
  return (
    <ConfigProvider theme={{
      token: { "borderRadius": 1 }
    }}>
      <Page />
    </ConfigProvider>
  );
};