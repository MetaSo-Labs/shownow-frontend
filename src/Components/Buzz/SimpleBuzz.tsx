import { isEmpty } from "ramda";
import RepostDetail from "./RepostDetail";
import { useQuery } from "@tanstack/react-query";
import { fetchBuzzDetail } from "@/request/api";
import { Card, theme } from "antd";

type Props = {
    buzzId: string;
}
export default ({ buzzId }: Props) => {
    const { token: { colorBgLayout } } = theme.useToken();
    const { isLoading, data: buzzDetail, refetch } = useQuery({
        enabled: !isEmpty(buzzId),
        queryKey: ['buzzDetail', buzzId],
        queryFn: () => fetchBuzzDetail({ pinId: buzzId! }),
    })
    if (isLoading || !buzzDetail) return <Card
        onClick={(e) => {
            e.stopPropagation();
        }}
        style={{ padding: 0, marginBottom: 12, boxShadow: "none" }}
        bordered={false}
        styles={{ body: { padding: 0 } }}
        loading={isLoading}
    >
        
    </Card>;

    return <RepostDetail buzzItem={{ ...buzzDetail.data.tweet, blocked: buzzDetail.data.blocked }} loading={isLoading} bordered={false} backgeround={colorBgLayout} />
}