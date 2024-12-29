import { Link, Outlet, useModel } from 'umi';
import { Button, Col, ConfigProvider, Divider, Dropdown, FloatButton, Grid, Input, InputNumber, Layout, Menu, Row, Space, theme } from 'antd';
import { useEffect, useState } from 'react';
import './index.less';
import { createStyles } from 'antd-style';
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

  const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
      &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
        border-width: 0;
  
        > span {
          position: relative;
        }
  
        &::before {
          content: '';
          background: ${showConf?.gradientColor};
          position: absolute;
          inset: 0;
          opacity: 1;
          transition: all 0.3s;
          border-radius: inherit;
        }
  
        &:hover::before {
          opacity: 0;
        }
      }
    `,
  }));

  const { styles } = useStyle();


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
        components,

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
        button={{
          className: styles?.linearGradientButton || '',
        }}
      >


        <ShowLayout />

      </ConfigProvider>
    </QueryClientProvider>



  );
}
