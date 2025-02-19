import { deleteBlockedItem, getBlockedList } from "@/request/api";
import { ActionType, ProColumns, ProFormInstance, ProTable } from "@ant-design/pro-components";
import { Button, ConfigProvider, message, Popconfirm } from "antd";
import BlockModal from "./blockModal";
import { useRef } from "react";
import './index.less'
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime);
dayjs.locale('en');

type Props = {
    type: string;
}
export type TableListItem = {
    blockedType: number;
    blockedContent: string;
};
export default ({ type }: Props) => {
    const actionRef = useRef<ActionType>();

    const columns: ProColumns<TableListItem>[] = [
        {
            title: 'Content',
            dataIndex: type === 'host' ? 'originalContent' : 'blockedContent',
            copyable: true,
            ellipsis: true,
        },
        {
            title: 'Time',
            dataIndex: 'timestamp',
            render: (text) => text ? dayjs(text * 1000).format('YYYY-MM-DD HH:mm:ss') : '--'
        },
        {
            title: 'Operation',
            key: 'option',
            width: 120,
            valueType: 'option',
            render: (_, record) => [
                <Popconfirm
                    title="Delete the item"
                    description="Are you sure to delete this item?"
                    onConfirm={async () => {
                        const ret = await deleteBlockedItem(
                            {
                                blockType: type,
                                blockContent: record.blockedContent,
                            }
                        )
                        if (ret.code !== 1) {
                            message.error(ret.message);
                            return false;
                        }
                        actionRef.current?.reload();
                        message.success('Delete successfully, Changes will take effect in 2 minutes.');
                    }}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button danger type='link' size='small'>Delete</Button>
                </Popconfirm>

            ],
        },
    ];
    return <div
        className="block-table"

    ><ProTable<TableListItem>
            columns={columns}

            actionRef={actionRef}
            request={async (params, sorter, filter) => {
                const ret = await getBlockedList({
                    blockType: type,
                    cursor: (params.current ? params.current - 1 : 0) * (params.pageSize || 10),
                    size: params.pageSize || 10,
                })
                return {
                    data: ret.data.list || [],
                    success: true,
                    total: ret.data.total || 0,
                }
            }}
            toolbar={{
                actions: [
                    <BlockModal type={type} actionRef={actionRef} />,
                ],
            }}
            rowKey="blockedContent"
            search={false}
        /></div>
}