import { isEmpty } from "ramda";
import RepostDetail from "./RepostDetail";
import { useQuery } from "@tanstack/react-query";
import { fetchBuzzContent, fetchBuzzDetail } from "@/request/api";
import { Alert, Button, Card, Skeleton, Spin, theme, Typography } from "antd";
import Trans from "../Trans";
import { FormatBuzz, formatSimpleBuzz, SimpleBuzz } from "@/utils/buzz";
import EnhancedMediaGallery from "./EnhancedMediaGallery";
import PendingUserAvatar from "../UserInfo/PendingUserAvatar";
import { history } from "umi";
import BuzzOriginLink from "./components/BuzzOriginLink";

type Props = {
    buzzId: string;
    userAddress?: string;
    host?: string;
}

type BuzzDetail = {
    type: 'details' | 'content',
    details?: API.BuzzDetailData,
    content?: FormatBuzz,
    isLoading?: boolean,
}
export const SimpleBuzzContent = ({ buzzId, host = '' }: Props) => {
    const { token: { colorBgLayout } } = theme.useToken();
    const { isLoading, data: buzzDetail, refetch } = useQuery({
        enabled: !isEmpty(buzzId),
        queryKey: ['buzzContent', buzzId],
        queryFn: async (): Promise<BuzzDetail> => {
            const buzzDetails = await fetchBuzzDetail({ pinId: buzzId! });
            console.log('buzzDetails', buzzDetails);
            if (buzzDetails.data) {
                return {
                    type: 'details',
                    details: buzzDetails.data,
                }
            }
            const ret = await fetchBuzzContent({ pinId: buzzId! });
            console.log('buzzDetails', ret);
            if (typeof ret === 'string') {
                const content = await formatSimpleBuzz({ content: '', attachments: [] } as SimpleBuzz);;
                return {
                    type: 'content',
                    content,
                    isLoading: true,
                }
            }
            if (typeof ret.content === 'string') {
                const content = await formatSimpleBuzz(ret as SimpleBuzz);
                return {
                    type: 'content',
                    content,
                    isLoading: false,
                }
            } else {
                return {
                    type: 'content',
                    content: ret as FormatBuzz,
                    isLoading: false,
                }
            }
        },
    })
    return <div style={{ flexGrow: 1 }}>{isLoading ? <Skeleton active /> : <div>{

        buzzDetail?.type === 'details' && <RepostDetail buzzItem={buzzDetail.details?.tweet} refetchDecrypt={refetch} showHeader={false} panding={0} bordered={false} backgeround={colorBgLayout} showFooter={false} />

    }
        {
            buzzDetail?.type === 'content' && <Spin spinning={buzzDetail.isLoading} >
                <BuzzOriginLink host={host} buzzId={buzzId}>
                    <Typography.Paragraph style={{ marginBottom: 0, fontSize: 12 }}><Typography.Text style={{ lineHeight: '34px' }} >{buzzDetail?.content?.publicContent}</Typography.Text></Typography.Paragraph>
                    {
                        buzzDetail?.content && <EnhancedMediaGallery decryptContent={buzzDetail.content} />
                    }

                </BuzzOriginLink>

            </Spin>
        }




    </div>}</div>
}
export default ({ buzzId, userAddress, host }: Props) => {
    const { token: { colorBgLayout } } = theme.useToken();
    return <Card style={{ padding: 0, marginBottom: 12, boxShadow: "none", border: 'none', background: colorBgLayout }} styles={{
        body: { paddingBottom: 0 }
    }} >
        <div style={{ display: 'flex', gap: 8 }}>
            <PendingUserAvatar address={userAddress!} size={34} />
            <SimpleBuzzContent buzzId={buzzId} host={host} />
        </div>
    </Card>
}