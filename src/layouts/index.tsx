import { Link, Outlet, useModel } from 'umi';
import { Button, Col, ConfigProvider, Divider, Dropdown, FloatButton, Grid, Input, InputNumber, Layout, Menu, Row, Space, theme } from 'antd';
import { useEffect, useState } from 'react';
import './index.less';
import Menus from './Menus';
import { CaretDownOutlined, EditOutlined, EllipsisOutlined, LoginOutlined } from '@ant-design/icons';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import NewPost from '@/Components/NewPost';
import Mobilefooter from './Mobilefooter';
import _btc from '@/assets/btc.png'
import _mvc from '@/assets/mvc.png'
import Recommend from '@/Components/Recommend';
import UserAvatar from '@/Components/UserAvatar';
import ShowLayout from './showLayout';
import { bitBuzzConf, showNowConf } from '@/models/dashboard';
const { useBreakpoint } = Grid

const queryClient = new QueryClient()
const { Header, Content, Footer, Sider } = Layout;

export default function Lay() {
  const [collapsed, setCollapsed] = useState(false);
  const { showConf,setShowConf } = useModel('dashboard')
  const { user, chain, disConnect, feeRate, setFeeRate, connect, switchChain } = useModel('user')
  const [themeTokens, setThemeTokens] = useState({});
  const { md } = useBreakpoint();
  const { token: {
    colorBgLayout
  } } = theme.useToken()

  useEffect(() => {
    if (showConf) {
      const tokens: any = {
        colorPrimary: showConf.brandColor,
        colorLink: showConf.brandColor,
      }
      if (showConf.colorBgLayout) {
        tokens.colorBgLayout = showConf.colorBgLayout
      }
      if (showConf.colorBorderSecondary) {
        tokens.colorBorderSecondary = showConf.colorBorderSecondary
      }
      const components = {
        "Avatar": {
          "colorTextPlaceholder": showConf.brandColor,
        },
        "Button": {
          "defaultBorderColor": "rgba(217,217,217,0)",
          "defaultShadow": "0 2px 0 rgba(0, 0, 0,0)"
        }
      }
      if (showConf.colorButton) {
        components.Button.primaryColor = showConf.colorButton
      }

      setThemeTokens({
        token: tokens,
        components
      })
    }

  }, [showConf])

  const [showPost, setShowPost] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: showConf?.theme !== 'dark' ? theme.defaultAlgorithm : theme.darkAlgorithm,
          ...themeTokens,
        }}
      >
        <ShowLayout />

        {/* <FloatButton
          shape="square"
          type="primary"
          style={{ insetInlineEnd: 94 }}
          description='Show Now'
          onClick={() => setShowConf(showNowConf)}
        />
        <FloatButton
          shape="square"
          type="primary"
        
          style={{ insetInlineEnd: 24 }}
          description='Bit Buzz'
          onClick={() => setShowConf(bitBuzzConf)}
        /> */}
      </ConfigProvider>
    </QueryClientProvider>
  );
}
