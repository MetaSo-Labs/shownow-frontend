import NumberFormat from "@/Components/NumberFormat";
import { fetchMetaBlockList } from "@/request/metaso";
import { useQuery } from "@tanstack/react-query";
import { ConfigProvider, Table, TableProps, Typography } from "antd";
import dayjs from "dayjs";
import { useState } from "react";

export default () => {
    const columns: TableProps<MS.MetaBlock>['columns'] = [{
        title: 'Height',
        dataIndex: 'metaBlockHeight',
        key: 'metaBlockHeight',
    }, {
        title: 'Timestamp (utc)',
        dataIndex: 'metaBlockTime',
        key: 'metaBlockTime',
        render: (text) => dayjs(text * 1000).format('YYYY-MM-DD HH:mm:ss')
    }, {
        title: 'Age',
        dataIndex: 'metaBlockTime',
        key: 'metaBlockTimeAge',
        render: (text) => dayjs().to(dayjs(text * 1000))
    }, {
        title: 'MDV',
        dataIndex: 'mdvValue',
        key: 'mdvValue',
        render: (text) => <NumberFormat value={text} />
    }]
    const [page, setPage] = useState(0);
    const { isLoading, isError, error, data, isFetching, isPreviousData } =
        useQuery({
            queryKey: ['metablockList', page],
            queryFn: () => {
                return fetchMetaBlockList({
                    cursor: page * 10,
                    size: 10
                })
            },
        });
    return <div>
        <Typography.Title level={4}>Browse Blocks</Typography.Title>
        <ConfigProvider
            theme={{
                components: {
                    Table: {
                        headerBg: '#2563EB',
                        headerColor: '#fff',
                    },
                },
            }}
        >
            <Table<MS.MetaBlock> columns={columns} dataSource={data?.data.list} />
        </ConfigProvider>

    </div>
}