import { saveDomain, saveIntro } from "@/request/dashboard";
import { ProCard, ProForm, ProFormTextArea } from "@ant-design/pro-components";
import { message } from "antd";
import { useModel } from "umi";

export default () => {
    const { fees, updateFees, admin, setLogined } = useModel('dashboard')
    return <ProCard ghost gutter={8} >
        <ProForm<{
            introduction: string;
        }>
            onFinish={async (values) => {
                try {
                    await saveIntro(values);
                    await updateFees();
                    message.success('Save successfully');
                } catch (e: any) {
                    if (e.response && e.response.status === 401) {
                        message.error('Unauthorized')
                        setLogined(false)
                        return;
                    }
                    console.log(e)
                    message.error(e.message)
                }

            }}
            submitter={{
                searchConfig: {
                    submitText: 'Save',
                    resetText: 'Reset'
                },
            }}
            initialValues={admin}
            autoFocusFirstInput
        >
            <ProFormTextArea
                width='lg'
                name="introduction"
                label="Introduction"
                placeholder="Please enter the introduction "

                fieldProps={{
                    style: {
                        height: 300,
                    },
                    allowClear: true,
                    maxLength: 500,
                    showCount: true
                }}
                rules={[{
                    max: 500,
                    message: 'The maximum length is 500 characters'
                }, {
                    required: true,
                    message: 'Please enter the introduction'
                }]}




            />
        </ProForm>
    </ProCard>
}