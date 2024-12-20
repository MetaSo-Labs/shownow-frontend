import { curNetwork, DASHBOARD_TOKEN } from '@/config';
import { fetchAdmin, login, loginWithWallet } from '@/request/dashboard';
import {
  AlipayOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoOutlined,
  UserOutlined,
  WeiboOutlined,
} from '@ant-design/icons';
import {
  LoginFormPage,
  ProConfigProvider,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Descriptions, Divider, Modal, Space, Tabs, message, theme } from 'antd';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { history, useModel } from 'umi';

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

  useEffect(() => {
    fetchAdmin().then((res) => {
      setAdmin(res.btcAddress ? true : false)
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
          title: 'Set this wallet account as the super administrator?',
          content: <Descriptions column={1} items={[{
            label: 'BTC Address',
            children: btcAddress,
          }, {
            label: 'MVC Address',
            children: mvcAddress,
          }]} />
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
      style={{
        background: 'linear-gradient(to top, #feada6 0%, #f5efef 100%)',
        height: '100vh',
      }}
    >
      <LoginFormPage
        submitter={{
          searchConfig: {
            submitText: 'Connect',
          }
        }}

        // backgroundImageUrl="https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/dsm/dsm_banner_bg.png"
        title="ShowNOW"
        logo="data:image/png;base64,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"
        // backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"

        containerStyle={{
          backgroundColor: 'rgba(0, 0, 0,0.65)',
          backdropFilter: 'blur(4px)',
        }}
        subTitle={admin ? 'Super Administrator' : 'This is the initialization configuration for the Metaso node. Please set up the super administrator account.'}
        onFinish={handleLoginWithWallet}


      >
        <Divider />

        {/* <>
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: (
                <UserOutlined
                  style={{
                    color: token.colorText,
                  }}
                  className={'prefixIcon'}
                />
              ),
            }}
            placeholder={''}
            rules={[
              {
                required: true,
                message: 'please enter your username!',
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: (
                <LockOutlined
                  style={{
                    color: token.colorText,
                  }}
                  className={'prefixIcon'}
                />
              ),
            }}
            placeholder={''}
            rules={[
              {
                required: true,
                message: 'please enter your password!',
              },
            ]}
          />
        </> */}



      </LoginFormPage>
      {contextHolder}
    </div>
  );
};

export default () => {
  return (
    <ProConfigProvider dark>
      <Page />
    </ProConfigProvider>
  );
};