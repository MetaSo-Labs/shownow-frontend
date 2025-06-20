import { ProList } from "@ant-design/pro-components"
import { Button, Modal, Space, Typography } from "antd"
import Trans from "../Trans"
import { useModel } from "umi"
import { useState } from "react"
import NumberFormat from "../NumberFormat"
import { curNetwork } from "@/config"
import { ArrowUpRight, FileText } from "lucide-react"
import dayjs from "dayjs"
import { getClaimRecords, getUserClaimRecords } from "@/request/metaso"
import _mataso from '@/assets/dashboard/mataso.svg'
import './index.less'
import { FileTextOutlined } from "@ant-design/icons"

export default () => {
    const { admin } = useModel('dashboard');
    const { user } = useModel('user')
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    return <>
        <Button size='small' type='text' onClick={showModal} icon={<FileText />}>

        </Button>
        <Modal title={<Trans>Historical Records</Trans>} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null}>
            <ProList<MS.UserClaimRecord>
                search={false}
                rowKey="txId"
                ghost={true}
                request={async (params = {} as Record<string, any>) => {
                    const res = await getUserClaimRecords({
                        cursor: ((params.current || 1) - 1) * 5,
                        size: 5,
                        address: user!.address
                    })
                    return {
                        data: res.data.list,
                        success: true,
                        total: res.data.total,
                    }
                }
                }
                pagination={{
                    pageSize: 5,
                }}
                showActions="hover"
                rowClassName="claim-record"
                grid={{ gutter: 16, column: 1 }}
                metas={{
                    title: {
                        render: (text, record) => {
                            return <Space>
                                <img src={_mataso} alt="mataso" style={{
                                    display: 'flex',
                                    width: 50,
                                    height: 50
                                }}>
                                </img>
                                <Typography.Text strong style={{ fontSize: 20 }}><NumberFormat value={record.claimAmount} suffix=' $METASO'></NumberFormat></Typography.Text>
                                <a href={
                                    `${curNetwork === "testnet"
                                        ? "https://mempool.space/testnet/tx/"
                                        : "https://mempool.space/tx/"
                                    }${record.txId}`
                                } target="_blank"> <ArrowUpRight size={20} /></a>
                            </Space>
                        }
                    },
                    actions: {
                        render: (text, record) => {
                            return <Space direction="vertical" align='end'>
                                <Typography.Text type={
                                    record.orderState === 2 ? record.confirmationState === 1 ? 'warning' : 'success' : 'danger'
                                }>{
                                        record.orderState === 2 ? record.confirmationState === 1 ? 'Pending' : 'Success' : 'Failed'
                                    }</Typography.Text>
                                <Typography.Text type='secondary'>
                                    {
                                        dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')
                                    }
                                </Typography.Text>
                            </Space>
                        }
                    },
                }}
            />
        </Modal>
    </>
}