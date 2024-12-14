

import { Grid, Modal, Drawer } from "antd";
import React from "react";
import './index.less'
const { useBreakpoint } = Grid
type Props = {
    modalWidth?: number,
    show: boolean,
    onClose: () => void,
    children: React.ReactNode,
    title?: React.ReactNode
    closable?: boolean,
    maskClosable?: boolean,
    style?: React.CSSProperties,
    className?: string,
    bodyStyle?: React.CSSProperties,
}

const Popup: React.FC<Props> = ({ show, modalWidth, onClose, children, closable = false, maskClosable = true, title = null, style = {}, className = '', bodyStyle = {} }) => {
    const { md } = useBreakpoint()
    return (<>
        {md ?
            <Modal
                open={show}
                onCancel={onClose}
                width={modalWidth || 420}
                title={title}
                footer={null}
                closable={closable}
                maskClosable={maskClosable}
                style={{ padding: 0, ...style }}
                className={'hayPopup' + ' ' + className}
                styles={{ body: { padding: 0, borderRadius: 4, ...bodyStyle } }}
            >
                {children}
            </Modal> :
            <Drawer title={title} open={show} placement="bottom" onClose={onClose} closable={closable} maskClosable={maskClosable} style={{ height: 'auto', ...style }}
                styles={{
                    body: { height: 'auto', maxHeight: '90vh', padding: 10, ...bodyStyle }, wrapper: {
                        height: 'auto'
                    }
                }}
            >
                {children}
            </Drawer>
        }

    </>)
}

export default Popup