import { Avatar, Button, Card, ConfigProvider, Descriptions, Form, Input, InputNumber, message, Modal, notification, Select, Slider, Space, Table, TableProps, Tag, Typography } from "antd"
import _mvc from "@/assets/mvc.png";
import Decimal from "decimal.js";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useModel } from "umi";
import { getMetaBlockHostUserList, getMetaBlockHostValue, getMetaBlockNewest, getMrc20AddressUtxo, getUserMrc20List, transferMrc20Commit, transfertMrc20Pre } from "@/request/api";
import _1 from '@/assets/rank/1.svg'
import _2 from '@/assets/rank/2.svg'
import _3 from '@/assets/rank/3.svg'
import Trans from "@/Components/Trans";
import PendingUser from "@/Components/UserInfo/PendingUser";
import NumberFormat from "@/Components/NumberFormat";
import { getPkScriprt } from "@/utils/psbtBuild";
import { curNetwork } from "@/config";
import { transferMRC20PSBT } from "@/utils/mrc20";

export default () => {
    const [api, contextHolder2] = notification.useNotification();
    const [modal, contextHolder] = Modal.useModal();
    const [form] = Form.useForm();
    const { admin } = useModel('dashboard')
    const { feeRate } = useModel('user')
    const [value, setValue] = useState<number | string>(1);
    const { data: list } = useQuery({
        queryKey: ['userMrc20List', admin?.host],
        enabled: Boolean(admin?.host),
        queryFn: async () => {
            const res = await getUserMrc20List({
                address: admin!.host,
                cursor: 0,
                size: 100,
            })

            return res?.data?.list || [];
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })
    const _transferTickerId = Form.useWatch('transferTickerId', form);

    const maxAmount = useMemo(() => {
        if (_transferTickerId && list && list.length > 0) {
            const token = list.find(item => item.id === _transferTickerId)
            if (token) {
                return Number(token.balance)
            }
        }
        return 0
    }, [_transferTickerId, list])
    const { data: _newest, } = useQuery({
        queryKey: ['getMetaBlockNewest',],
        queryFn: () => {
            return getMetaBlockNewest()
        }
    })
    const startAndEndHeight = useMemo(() => {
        if (value === 1) return {
            heightBegin: -1,
            heightEnd: -1
        };
        if (!_newest) return null;
        const { progressStartBlock, progressEndBlock, syncMetaBlockHeight } = _newest.data;
        const heightEnd = syncMetaBlockHeight;
        const step = progressEndBlock - progressStartBlock + 1
        const heightBegin = heightEnd - Number(value) * step;
        return {
            heightBegin,
            heightEnd
        }
    }, [value, _newest])

    const { data: _hostValue, isFetching: _hostValueFetching } = useQuery({
        queryKey: ['_hostValue', startAndEndHeight, admin?.host],
        enabled: Boolean(admin?.host && startAndEndHeight),
        queryFn: () => {
            return getMetaBlockHostValue({
                size: 100,
                cursor: 0,
                host: admin!.host,
                // timeBegin: Math.floor(new Date().getTime() / 1000) - 60 * 60 * 24 * 7 * Number(value),
                // timeEnd: Math.floor(new Date().getTime() / 1000)
                heightBegin: startAndEndHeight!.heightBegin,
                heightEnd: startAndEndHeight!.heightEnd
            })
        }
    })

    const hostValue = useMemo(() => {
        if (!_hostValue || !_hostValue.data.list) return 0;
        return _hostValue.data.list.reduce((acc, cur) => acc + Number(cur.mdvDeltaValue), 0)
    }, [_hostValue])

    const { data: _listValue, isFetching: _listValueFetching } = useQuery({
        queryKey: ['_listhostValue', startAndEndHeight, admin?.host],
        enabled: Boolean(admin?.host && startAndEndHeight),
        queryFn: () => {
            return getMetaBlockHostUserList({
                size: 100,
                cursor: 0,
                host: admin!.host,
                // timeBegin: Math.floor(new Date().getTime() / 1000) - 60 * 60 * 24 * 7 * Number(value),
                // timeEnd: Math.floor(new Date().getTime() / 1000)
                heightBegin: startAndEndHeight!.heightBegin,
                heightEnd: startAndEndHeight!.heightEnd
            })
        }
    })

    // const _listValue = {
    //     "code": 1,
    //     "message": "ok",
    //     "data": {
    //         "list": [
    //             {
    //                 "address": "n18EnQDAEh47fYQbLJdzt6xdw8TvUs7haL",
    //                 "dataValue": "614.5904"
    //             },
    //             {
    //                 "address": "mvsDHZ9kG68rRhzcswemCjvDpUUoWqtzfz",
    //                 "dataValue": "350.8537"
    //             },
    //             {
    //                 "address": "mqMrLrQYAaZiZUgSeVoCwrG1QSoAnWM5Dk",
    //                 "dataValue": "319.4476"
    //             },
    //             {
    //                 "address": "mpvWryQ8FTY9QXhDMoJGQFHgsCRfUDR6vH",
    //                 "dataValue": "286.097"
    //             },
    //             {
    //                 "address": "mkrSFdDJTQkFE3bWycQj1ZhzYBRLd87NVo",
    //                 "dataValue": "283.6199"
    //             },
    //         ],
    //         "total": 42
    //     }
    // }

    const successNotice = (txid: string) => {
        const key = `open${Date.now()}`;
        const btn = (
            <Space>
                <Button type="primary" size="small" onClick={() => {
                    const link = `${curNetwork === "testnet"
                        ? "https://mempool.space/testnet/tx/"
                        : "https://mempool.space/tx/"
                        }${txid}`

                    window.open(link, "_blank");
                }}>
                    open
                </Button>
            </Space>
        );
        api.open({
            message: 'Airdrop Success',
            description: txid,
            btn,
            key,
        });
    };
    const handleTransfer = async (values: any) => {

        try {


            const { transferTickerId, amount, addressCount } = values;
            const token = list?.find(item => item.id === transferTickerId)
            if (!token) return;
            const { data: utxoList } = await getMrc20AddressUtxo({ address: admin!.host, tickId: String(transferTickerId), cursor: 0, size: 100 }, {
            });
            if (utxoList.list.length === 0) throw new Error('No UTXO');
            const selectedUtxos = [];
            let totalAmount = 0;
            for (const utxo of utxoList.list) {
                if (utxo.blockHeight === -1) continue;
                for (const tick of utxo.mrc20s) {
                    if (Number(tick.amount) > 0) {
                        totalAmount += Number(tick.amount)
                        selectedUtxos.push({
                            utxoIndex: utxo.outputIndex,
                            utxoTxId: utxo.txId,
                            utxoOutValue: utxo.satoshi,
                            tickerId: transferTickerId,
                            amount: tick.amount,
                            address: utxo.address,
                            pkScript: utxo.scriptPk
                        })
                    }
                    if (totalAmount > amount) {
                        break
                    }
                }
                if (totalAmount > amount) {
                    break
                }
            }
            if (totalAmount < amount) {
                throw new Error('No available UTXOs. Please wait for existing transactions to be confirmed. ')
            }
            const preAmount = new Decimal(amount).div(Number(addressCount)).toString()
            const publicKey = await window.metaidwallet.btc.getPublicKey();
            const publicKeySign =
                await window.metaidwallet.btc.signMessage("metaid.market");
            if (publicKeySign.status) throw new Error('Sign failed');
            const authParams = { "X-Public-Key": publicKey, "X-Signature": publicKeySign }
            const params: API.TransferMRC20PreReq = {
                networkFeeRate: feeRate,
                tickerId: transferTickerId,
                changeAddress: admin!.host,
                changeOutValue: 546,
                transfers: selectedUtxos,
                mrc20Outs: _listValue!.data!.list!.slice(0, Number(addressCount)).map((item) => {
                    return {
                        amount: preAmount,
                        address: item.address,
                        outValue: 546,
                        pkScript: getPkScriprt(item.address, curNetwork)
                    }
                }),
            }
            const { code, message, data } = await transfertMrc20Pre(params, {
                headers: {
                    ...authParams,
                },
            })
            if (code !== 0) throw new Error(message);

            const { rawTx, revealPrePsbtRaw, commitFee } = await transferMRC20PSBT(data, feeRate, admin!.host, curNetwork);

            const confirmed = await modal.confirm({
                title: 'Trade Confirm',

                content: <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16,
                    textAlign: 'left',
                }}>
                    <Descriptions column={1} items={[{
                        label: 'Amount',
                        children: <NumberFormat value={amount} suffix={''}></NumberFormat>,
                    }, {
                        label: 'Receive Address',
                        children: <Space wrap>{
                            params.mrc20Outs.map((item: any, key) => {
                                return <div key={item.address} >
                                    <PendingUser address={item.address} />
                                    <NumberFormat value={item.amount} suffix=' '></NumberFormat>
                                </div>
                            }
                            )
                        }</Space>,
                    },
                    {
                        label: 'Gas Fee',
                        children: <NumberFormat value={new Decimal(commitFee).toFixed(8)} suffix=' SAT'></NumberFormat>,
                    },
                    {
                        label: 'Fee Rate',
                        children: <NumberFormat value={feeRate} suffix=' sat/vB'></NumberFormat>,
                    }]} />
                </div>
            });
            if (!confirmed) throw new Error('Canceled');

            const ret = await transferMrc20Commit({ orderId: data.orderId, commitTxRaw: rawTx, commitTxOutIndex: 0, revealPrePsbtRaw }, { headers: { ...authParams } });
            if (ret.code !== 0) throw new Error(ret.message);
            successNotice(ret.data.commitTxId);

        } catch (e: any) {
            console.error(e)
            message.error(e.message || 'Error')
        }


    }

    const columns: TableProps<API.MetaBlockValueListItem>['columns'] = [
        {
            title: '#',
            dataIndex: 'name',
            key: 'name',
            render: (text, record, index) => {
                if (index === 0) return <img src={_1} alt="" />
                if (index === 1) return <img src={_3} alt="" />
                if (index === 2) return <img src={_2} alt="" />
                return <Typography.Text>
                    {index + 1}
                </Typography.Text>
            },
        },
        {
            title: <Trans>User</Trans>,
            dataIndex: 'address',
            key: 'name',
            minWidth: 160,
            render: (text, record, index) => <PendingUser address={text} />,
        },
        {
            title: <Trans>Total Value</Trans>,
            dataIndex: 'dataValue',
            key: 'dataValue',
            align: 'center',
            render: (text, record, index) => <NumberFormat value={text} />,
        },
        {
            title: <Trans>Proportion%</Trans>,
            dataIndex: 'dataValue',
            key: 'Progress',
            align: 'center',
            render: (text, record, index) => <NumberFormat value={hostValue ? Number(text) / hostValue * 100 : '--'} suffix='%' precision={2} />,
        },
    ]

    return <Card title="Airdrop" style={{ width: '100%', maxWidth: 600 }}>
        <Form
            form={form}
            layout="vertical"
            variant="filled"
            initialValues={{
                network: 'MicrovisonChain',
            }}
            onFinish={handleTransfer}
        >
            <Form.Item label="Network" required name="network" >
                <Input placeholder="input placeholder" size='large' prefix={<img src={_mvc} style={{ width: 40, height: 40 }}></img>} disabled />
            </Form.Item>
            <Form.Item label='Token' name="transferTickerId"
                rules={[{ required: true }]}
            >
                <Select



                    style={{ textAlign: 'left', height: 60 }} size="large"
                    placeholder='Select a token'
                    options={(list ?? []).map(item => {
                        return { label: <Space><Avatar>{item.name[0]}</Avatar>  {item.name}<Tag >{item.balance}</Tag></Space>, value: item.id }
                    })}
                >

                </Select>
            </Form.Item>
            <Form.Item label='Amount' name="amount" rules={[{ required: true }, { min: 1, type: 'number', max: maxAmount }]}>
                <InputNumber
                    size="large"
                    style={{ width: '100%', lineHeight: '60px' }}

                />
            </Form.Item>

            <ConfigProvider
                theme={{
                    components: {
                        Table: {
                            headerBg: 'transparent',
                            headerSplitColor: 'transparent',
                        },
                    },
                }}
            >
                <Table<API.MetaBlockValueListItem>
                    columns={columns}
                    dataSource={_listValue?.data.list}
                    loading={_listValueFetching}
                    pagination={false}
                    rowClassName={(record, index) => {
                        if (index < 3) {
                            return 'ant-table-row-' + index
                        }
                        return ''
                    }}
                    scroll={{
                        x: 'max-content'
                    }}


                />
            </ConfigProvider>

            <Form.Item label='Airdrop Address Count' name="addressCount" rules={[{ required: true }]}>
                <Slider max={_listValue?.data?.list?.length || 0} />

            </Form.Item>


            <Form.Item >
                <Button type='primary' htmlType="submit">Save</Button>
            </Form.Item>
        </Form>
        {contextHolder}
        {contextHolder2}
    </Card>
}