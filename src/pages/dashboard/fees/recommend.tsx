import PendingUser from "@/Components/UserInfo/PendingUser";
import { deleteRecommendedItem, getBlockedList, getRecommendedList } from "@/request/api";
import { ActionType, ProList } from "@ant-design/pro-components";
import { Button } from "antd";
import AddRecommend from "./AddRecommend";
import { useRef } from "react";

export default () => {
    const action = useRef<ActionType>();
    return <ProList<any>
        ghost
        actionRef={action}
        request={async (params, sorter, filter) => {
            const ret = await getRecommendedList({
                cursor: (params.current ? params.current - 1 : 0) * (params.pageSize || 10),
                size: params.pageSize || 10,
            })
            return {
                data: ret.data.list || [],
                success: true,
                total: ret.data.total || 0,
            }
        }}


        toolBarRender={() => {
            return [
                <AddRecommend reload={() => { action?.current?.reload() }} />
            ];
        }}

        itemCardProps={{
            ghost: true,
        }}
        pagination={{
            defaultPageSize: 8,
            showSizeChanger: false,
        }}
        showActions="hover"
        rowSelection={false}
        grid={{ gutter: 16, column: 4 }}
        // onItem={(record: any) => {
        //     return {
        //         onMouseEnter: () => {
        //             console.log(record);
        //         },
        //         onClick: () => {
        //             console.log(record);
        //         },
        //     };
        // }}
        metas={{
            title: {
                dataIndex: 'authorId',
                render: (text, row) => {
                    return <PendingUser address={row.authorId} />
                }
            },
            content: {
                dataIndex: 'authorName',

            },

            actions: {
                cardActionProps: 'extra',
                render: (text, row) => [
                    <Button type="link" size="small" onClick={async () => {
                        await deleteRecommendedItem({
                            authorAddress: row.authorId,
                        })

                        action?.current?.reload();
                    }
                    }>Delete</Button>
                ],

            },
        }}
        headerTitle="Recommended"

    />
}