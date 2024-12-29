import { useModel } from "umi"
import Popup from "../ResponPopup"
import Trans from "../Trans"
import { Button } from "antd"

type Props = {
    show: boolean
    onClose: () => void

}
export default () => {
    const { showSetting, setShowSetting, setShowProfileEdit } = useModel('user')
    return <Popup onClose={() => {
        setShowSetting(false)
    }} show={showSetting} modalWidth={380} closable title={<Trans>Set up</Trans>}>
        <Trans>
            Your avatar and name have not been set up, Please go to Settings to complete your profile.
        </Trans>
        <Button size='large' block type='primary' shape='round' style={{
            marginTop: 20
        }}
            onClick={() => {
                setShowSetting(false);
                setShowProfileEdit(true);
            }}
        >
            <span>
                <Trans>Go to Setting</Trans>
            </span>
        </Button>
    </Popup>
}