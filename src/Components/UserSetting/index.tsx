import { useModel } from "umi"
import Popup from "../ResponPopup"
import Trans from "../Trans"
import { Button, Typography } from "antd"
import _welcomePng from '@/assets/welcome.png'

type Props = {
    show: boolean
    onClose: () => void

}
export default () => {
    const { showSetting, setShowSetting, setShowProfileEdit } = useModel('user')
    const { showConf } = useModel('dashboard')
    return <Popup onClose={() => {
        setShowSetting(false)
    }} show={showSetting} modalWidth={740} style={{
        borderRadius: 24,
    }} bodyStyle={{
        padding: "24px 36px"
    }} closable title={<></>} >
        <Typography.Title style={{ textAlign: 'center', fontSize: 20, fontWeight: 600, }}>
            <Trans>Welcome to </Trans> {showConf?.brandIntroMainTitle || 'MetaSo'}!
        </Typography.Title>
        <Typography.Text type='secondary' style={{ textAlign: 'center', display: 'block', }}>
            <Trans>Let’s get you set up! We’ll guide you through the basics so you’re ready to go.</Trans>
        </Typography.Text>
        <div className="welcome" style={{ position: "relative" }}>
            
            <img src={_welcomePng} alt="Welcome" style={{ width: '100%', height: 'auto', marginTop: 20 }} />
        </div>
        <div style={{ marginTop: 20, display: 'flex', gap: 10, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
            <Button onClick={() => {
                setShowSetting(false)
            }} block size='large' shape='round' variant='filled' color='primary'>
                <Trans wrapper>Close</Trans>
            </Button>

            <Button size='large' block type='primary' shape='round'
                onClick={() => {
                    setShowSetting(false);
                    setShowProfileEdit(true);
                }}
            >
                <span>
                    <Trans>Next</Trans>
                </span>
            </Button>
        </div>


    </Popup>
}