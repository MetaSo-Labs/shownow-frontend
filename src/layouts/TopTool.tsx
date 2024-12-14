import Trans from "@/Components/Trans";
import { ArrowLeftOutlined, LeftOutlined } from "@ant-design/icons";
import { Button, ConfigProvider, Radio, theme } from "antd";
import { useEffect, useState } from "react";
import { useLocation, history, useModel } from "umi";
const indexPath = ['/home', '/follow', '/', '/dashboard/styles']
export default () => {
    const { showConf } = useModel('dashboard')
    const [curMenu, setCurMenu] = useState<string>('home');
    const location = useLocation();
    const path = location.pathname;
    const { token: {
        colorBgBase
    } } = theme.useToken()

    useEffect(() => {
        if (path === '/' || path === '/dashboard/styles') {
            setCurMenu('home')
        } else {
            setCurMenu(path.split('/')[1])
        }

    }, [path])

    return <>
        {
            indexPath.includes(path) ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ConfigProvider
                    theme={{
                        components: {
                            Radio: {
                                buttonSolidCheckedColor: colorBgBase,
                                buttonPaddingInline: 32
                            },
                        },
                    }}>
                    <Radio.Group block options={[
                        {
                            label: <Trans>New</Trans>,
                            value: 'home'
                        },
                        {
                            label: <Trans>Follow</Trans>,
                            value: 'follow'
                        }
                    ]} value={curMenu} onChange={(e) => {
                        history.push("/" + e.target.value)
                    }} optionType="button" buttonStyle="solid" size='large' style={{ color: '#000' }} />
                </ConfigProvider>

            </div> : <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: "flex-start", width: showConf?.contentSize, maxWidth: 'calc( 100vw - 24px )' }}>
                <Button type="text" size='large' onClick={() => history.back()} icon={<LeftOutlined />}>
                    <Trans>Back</Trans>
                </Button>
            </div>
        }
    </>
}