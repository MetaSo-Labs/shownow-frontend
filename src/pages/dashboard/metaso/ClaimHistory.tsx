
import { getClaimRecords } from "@/request/metaso";
import { FileTextOutlined } from "@ant-design/icons";
import { ProList } from "@ant-design/pro-components";
import { Button, Modal, Space, Typography } from "antd";
import { useState } from "react";
import { useModel } from "umi";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'
import NumberFormat from "@/Components/NumberFormat";
dayjs.extend(relativeTime);
dayjs.locale('en');
import _mataso from '@/assets/dashboard/mataso.svg'
import './claimRecord.less'
import { ArrowUpRight } from "lucide-react";
import { curNetwork } from "@/config";

export default () => {
    const { admin } = useModel('dashboard')
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
        <Button color="primary" variant="outlined" onClick={showModal} icon={
            <FileTextOutlined />
        }>
        </Button>
        <Modal title="Historical Records" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null}>
            <ProList<MS.ClaimRecord>
                search={false}
                rowKey="txId"
                ghost={true}
                request={async (params = {} as Record<string, any>) => {
                    const res = await getClaimRecords({
                        cursor: ((params.current || 1) - 1) * 5,
                        size: 5,
                        host: admin!.host
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
                            return <Typography.Text type={
                                record.orderState === 2 ? record.confirmationState === 1 ? 'warning' : 'success' : 'danger'
                            }>{
                                    record.orderState === 2 ? record.confirmationState === 1 ? 'Pending' : 'Success' : 'Failed'
                                }</Typography.Text>

                        }
                    },
                    actions: {
                        render: (text, record) => {
                            return <Space direction="vertical" align='end'>
                                <Space>
                                    <img src={_mataso} alt="mataso" style={{
                                        display: 'flex'
                                    }}>
                                    </img>
                                    <Typography.Text strong><NumberFormat value={record.claimAmount} suffix=' $METASO'></NumberFormat></Typography.Text>
                                    <a href={
                                        `${curNetwork === "testnet"
                                            ? "https://mempool.space/testnet/tx/"
                                            : "https://mempool.space/tx/"
                                        }${record.txId}`
                                    } target="_blank"> <ArrowUpRight size={20} /></a>
                                </Space>
                                {
                                    dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')
                                }
                            </Space>
                        }
                    },
                }}
            />
        </Modal>
    </>
}