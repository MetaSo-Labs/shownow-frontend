import { Avatar, Typography } from "antd";
import Popup from "../ResponPopup";
import Trans from "../Trans";
import _buttonBg from '@/assets/buttonBg.png'
import _metaletIcon from '@/assets/dashboard/metalet-logo.svg'
type Props = {
    visible: boolean;
    onClose: () => void;
}
export default (props: Props) => {
    return <Popup show={props.visible} onClose={props.onClose} modalWidth={589} style={{}} bodyStyle={
        {
            padding: 24
        }
    }>
        <div>


            <Typography.Title level={4} style={{ textAlign: 'left', marginBottom: 24 }}>
                <Trans>Wallet Installation Required</Trans>
            </Typography.Title>
            <Typography.Paragraph>
                <Typography.Text type="secondary">
                    <Trans>We are a decentralized Web3 application that requires a wallet for signing, authorization, and more.</Trans>
                </Typography.Text>
            </Typography.Paragraph>
            <Typography.Paragraph>
                <Typography.Text type="secondary">
                    <Trans>You haven't installed the corresponding wallet yet. Click the button, and we will guide you to the Metalet wallet official website for installation (we recommend the browser extension version).</Trans>
                </Typography.Text>
            </Typography.Paragraph>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <div onClick={() => {
                    window.open(
                        "https://www.metalet.space/"
                    );
                }} style={{ width: 218, height: 79, backgroundImage: `url(${_buttonBg})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#fff', cursor: 'pointer', marginTop: -16 }}>
                        <Avatar src={_metaletIcon} style={{ width: 40, height: 40, marginRight: 8 }} />
                        <Typography.Text style={{ color: '#fff' }} strong>
                            <Trans>Get Metalet Wallet</Trans>
                        </Typography.Text>
                    </div>


                </div>
            </div>

        </div>
    </Popup>
}