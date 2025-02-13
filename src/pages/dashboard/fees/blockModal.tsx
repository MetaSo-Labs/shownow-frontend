import { addBlockedItem } from '@/request/api';
import { PlusOutlined } from '@ant-design/icons';
import {
    ModalForm,
    ProFormText,
} from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';

const waitTime = (time: number = 100) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
};

type BlockModalProps = {
    type: string;
    actionRef: any;
}

export default ({ type,actionRef }: BlockModalProps) => {
    const [form] = Form.useForm<{ blockContent: string; }>();
    return (
        <ModalForm<{
            blockContent: string;
        }>
            title="Add to the Block List"
            trigger={
                <Button type="primary">
                    Add
                </Button>
            }
            form={form}
            autoFocusFirstInput
            modalProps={{
                destroyOnClose: true,
                onCancel: () => console.log('run'),
            }}
            width={500}
            submitTimeout={2000}
            onFinish={async (values) => {
                const ret = await addBlockedItem({
                    blockType: type,
                    blockContent: values.blockContent,
                });
                if (ret.code !== 1) {
                    message.error(ret.message);
                    return false;
                }
                actionRef.current?.reload();
                message.success('Add successfully, Changes will take effect in 2 minutes.');
                return true;
            }}
        >

            <ProFormText name="blockContent" label={type.toUpperCase()} />

        </ModalForm>
    );
};