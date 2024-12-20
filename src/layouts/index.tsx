import { Link, Outlet, useModel } from 'umi';
import { Button, Col, ConfigProvider, Divider, Dropdown, FloatButton, Grid, Input, InputNumber, Layout, Menu, Row, Space, theme } from 'antd';
import { useEffect, useState } from 'react';
import './index.less';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'




import ShowLayout from './showLayout';
import KeepAliveLayout from '@/hooks/useKeepAlive';


const queryClient = new QueryClient()


export default function Lay() {
  const { showConf } = useModel('dashboard')

  const [themeTokens, setThemeTokens] = useState({});


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

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: showConf?.theme !== 'dark' ? theme.defaultAlgorithm : theme.darkAlgorithm,
          ...themeTokens,
        }}
      >
         

          <ShowLayout />
         
      </ConfigProvider>
    </QueryClientProvider>



  );
}
