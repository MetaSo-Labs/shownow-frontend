import { Button, message, Space } from "antd"
import Popup from "../ResponPopup"
import { useModel, history } from "umi"


export default () => {
    const { showConnect, setShowConnect, connect, checkUserSetting } = useModel('user');
    const { showConf } = useModel('dashboard');
    const handleConnect = async (chain: API.Chain) => {
        try {
            await connect(chain);
            setTimeout(() => {
                history.push('/')
                
            }, 100);
        } catch (e: any) {
            message.error(e.message)
        }

    }
    return <Popup show={showConnect} onClose={() => {
        setShowConnect(false)
    }} title={'Connect Wallet'} modalWidth={375}>
        <Space direction='vertical' size={10} style={{ width: '100%' }}>
            <Button onClick={() => {
                handleConnect('btc')
            }} size='large' block type='primary' className="linerButton" style={{ background: showConf?.gradientColor }}> BTC Network</Button>
            <Button
                onClick={() => {
                    handleConnect('mvc')
                }}
                size='large' block type='primary' className="linerButton" style={{ background: showConf?.gradientColor }}> MVC Network</Button>
        </Space>
    </Popup>
}