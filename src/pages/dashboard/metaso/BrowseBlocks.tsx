import NumberFormat from "@/Components/NumberFormat";
import { fetchMetaBlockList } from "@/request/metaso";
import { useQuery } from "@tanstack/react-query";
import { ConfigProvider, Table, TableProps, Typography } from "antd";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime);
dayjs.locale('en');
import { useState } from "react";
import { useModel } from "umi";

export default () => {
    const { admin } = useModel('dashboard')
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
        title: 'tMDV',
        dataIndex: 'mdvValueStr',
        key: 'mdvValue',
        render: (text) => <NumberFormat value={text} />
    },
    {
        title: 'ΔtMDV',
        dataIndex: 'mdvDeltaValueStr',
        key: 'mdvDeltaValue',
        render: (text) => <NumberFormat value={text} />
    }, {
        title: 'My NDV',
        dataIndex: 'hostMdvValueStr',
        key: 'hostMdvValueStr',
        render: (text) => <NumberFormat value={text} />
    }, {
        title: 'My ΔNDV',
        dataIndex: 'hostMdvDeltaValueStr',
        key: 'hostMdvDeltaValueStr',
        render: (text) => <NumberFormat value={text} />
    }]
    const [page, setPage] = useState(0);
    const { isLoading, isError, error, data, isFetching, isPreviousData } =
        useQuery({
            enabled: Boolean(admin?.host),
            queryKey: ['metablockList', page, admin?.host],
            queryFn: () => {
                return fetchMetaBlockList({
                    cursor: page * 5,
                    size: 5,
                    host: admin!.host
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
            <Table<MS.MetaBlock>
                columns={columns}
                dataSource={data?.data.list}
                loading={isFetching}
                pagination={{
                    current: page + 1,
                    onChange: (page) => {
                        setPage(page - 1)
                    },
                    total: data?.data.total,
                    pageSize: 5
                }}
            />
        </ConfigProvider>

    </div>
}