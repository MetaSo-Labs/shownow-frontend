import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { ConfigProvider, theme } from 'antd';
import { Activity } from '@ivliu/react-offscreen';


const KeepAliveWrap = ({ children }: { children: React.ReactNode }) => {
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
       
            <ConfigProvider
                theme={{
                    algorithm: showConf?.theme !== 'dark' ? theme.defaultAlgorithm : theme.darkAlgorithm,
                    ...themeTokens,
                }}
            >
                {children}
            </ConfigProvider>
       

    );
}

export default KeepAliveWrap;
