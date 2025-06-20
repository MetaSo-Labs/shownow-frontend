import { fetchUserMetablockList } from "@/request/metaso";
import { useQuery } from "@tanstack/react-query";
import { ColumnsType } from "antd/es/table";
import { Card, Table, theme } from 'antd';
import Trans from "../Trans";
import dayjs from "dayjs";

type Props = {
    address: string;
    host: string;
}

export default ({ address, host }: Props) => {
    const { token: { colorBorder } } = theme.useToken();
    const columns: ColumnsType<MS.MetaBlockListItem> = [{
        title: <Trans>Height</Trans>,
        dataIndex: "metaBlockHeight",
        key: "metaBlockHeight",
        width: 150,
    }, {
        title: <Trans>Timestamp (utc)</Trans>,
        dataIndex: "metaBlockTime",
        key: "metaBlockTime",
        width: 200,
        render: (text) => {
            return dayjs(text).format('MM-DD HH:mm:ss')
        }
    }, {
        title: <Trans>State</Trans>,
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (text) => {
            return <span style={{
                color: text === 'claimable' ? '#52c41a' : text === 'fail' ? '#ff4d4f' : '#FC7345'
            }}>{text}</span>
        }
    }, {
        title: <Trans>Metaso</Trans>,
        dataIndex: "reward",
        key: "reward",
        width: 150,
    }]

    const { data, isFetching, refetch } = useQuery({
        queryKey: ['fetchUserBlockList', address, host],
        queryFn: () => {
            return fetchUserMetablockList({
                host,
                address
            })
        }
    })

    return (
        <Card style={{
            padding: 0,
            overflow: 'hidden'
        }}
            styles={{
                body: {
                    padding: 0,
                }
            }}
        >
            <Table
                size="small"
                rowKey="metaBlockHeight"
                columns={columns}
                dataSource={data?.data?.list || []}
                loading={isFetching}
                pagination={false}
            />
        </Card>
    );
}