import { getMetasoConf, setMetasoConfBlockedHost, setMetasoConfChain, setMetasoConfInitialHeight, setMetasoConfSyncHost } from "@/request/api"
import { ProCard, ProForm, ProFormDigit, ProFormInstance, ProFormSelect } from "@ant-design/pro-components"
import { useQuery } from "@tanstack/react-query"
import { message, Spin } from "antd"
import { useEffect, useMemo, useRef } from "react"
import { useModel } from "umi"
const formatHost = (host: string[] | null) => {
    if (!host || host.length === 0) {
        return [];
    }
    if (host.length === 1 && host[0] === '*') {
        return [];
    }
    return host;
}
export default () => {
    const { fees, updateFees, admin, setLogined } = useModel('dashboard')
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["metasoConf"],
        queryFn: () => getMetasoConf()
    })

    //  blockedHost: string[] | null;
    //   chain: string;
    //   initialHeight: {
    //     btc: number;
    //     mvc: number;
    //   };
    //   syncHost: string[] | null;
    const formRef = useRef<ProFormInstance>();
    useEffect(() => {
        if (data && data.data) {
            const _data = {
                blockedHost: formatHost(data.data.blockedHost),
                chain: data.data.chain ? data.data.chain.split(',') : [],
                syncHost: formatHost(data.data.syncHost),
                btcInitialHeight: data.data.initialHeight?.btc || 0,
                mvcInitialHeight: data.data.initialHeight?.mvc || 0,
            }
            formRef.current?.setFieldsValue(_data);
        }

    }, [data])

    return (
        <Spin spinning={isLoading} style={{ width: '100%' }}>
            <ProCard ghost gutter={8} >
                <ProForm<any>
                    onFinish={async (values) => {
                        try {
                            const { blockedHost, chain, syncHost, btcInitialHeight, mvcInitialHeight } = values;
                            console.log(syncHost,'syncHost')
                            await setMetasoConfChain({
                                chain: chain.join(','),
                            })
                            await setMetasoConfBlockedHost({
                                host: blockedHost.length > 0 ? blockedHost.join(',') : "*",
                            })

                            await setMetasoConfSyncHost({
                                host: syncHost.length > 0 ? syncHost.join(',') : '*',
                            })

                            await setMetasoConfInitialHeight({
                                chain: 'btc',
                                height: btcInitialHeight,
                            })
                            await setMetasoConfInitialHeight({
                                chain: 'mvc',
                                height: mvcInitialHeight,
                            })

                            await refetch();
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

                        },
                    }}

                    autoFocusFirstInput
                    formRef={formRef}
                >
                    <ProFormSelect
                        name="chain"
                        label='Chain'
                        tooltip="Select the blockchain networks to be used. Multiple chains can be selected."
                        mode="multiple"
                        options={[
                            { label: 'MVC', value: 'mvc' },
                            { label: 'BTC', value: 'btc' },
                        ]}
                        rules={[{ required: true, message: 'Please select at least one chain!' }]}
                        width="xl"
                    />


                    <ProFormDigit

                        name="btcInitialHeight"
                        label="BTC Initial Height"
                        tooltip="The initial height of the Bitcoin blockchain, used for syncing."
                        placeholder="Enter BTC Initial Height"
                        fieldProps={{ precision: 0, }}
                        width="xl"
                    />
                    <ProFormDigit

                        name="mvcInitialHeight"
                        label="MVC Initial Height"
                        tooltip="The initial height of the Bitcoin Cash blockchain, used for syncing."
                        placeholder="Enter MVC Initial Height"
                        fieldProps={{ precision: 0, }}
                        width="xl"
                    />

                    <ProFormSelect
                        name="syncHost"
                        label='Sync Host'
                        tooltip="The host addresses for syncing the blockchain data. Multiple hosts can be specified."
                        mode="tags"
                        width="xl"
                    />
                    <ProFormSelect
                        name="blockedHost"
                        label='Blocked Host'
                        tooltip="The host addresses that are blocked from accessing the service. Multiple hosts can be specified."
                        mode="tags"
                        width="xl"
                    />
                </ProForm>
            </ProCard>
        </Spin>
    )
}