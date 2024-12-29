import Popup from "../ResponPopup"

type Props = {
    show: boolean
    onClose: () => void
    children?: React.ReactNode
}
export default ({ show, onClose, children }: Props) => {
    return <Popup onClose={onClose} show={show} modalWidth={400} closable title='Unlock'>
        {children}
    </Popup>
}