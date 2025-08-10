import Buzz from "@/Components/Buzz"
import BlockedBuzz from "@/Components/Buzz/BlockedBuzz"
import Comment from "@/Components/Comment"
import CommentPanel from "@/Components/CommentPanel"
import Recommend from "@/Components/Recommend"
import Trans from "@/Components/Trans"
import UserAvatar from "@/Components/UserAvatar"
import { fetchBuzzDetail, getPinDetailByPid } from "@/request/api"
import { ArrowLeftOutlined, LeftOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { Alert, Avatar, Button, Card, Col, Divider, Input, message, Row } from "antd"
import { isEmpty } from "ramda"
import { useEffect, useState } from "react"
import { useIntl, useMatch, useModel } from "umi"
type Props = {
    quotePinId: string
    onClose?: () => void
}

export const TweetCard = ({ quotePinId, onClose = () => history.back() }: Props) => {
    const { formatMessage } = useIntl()
    const { user, checkUserSetting, isLogin } = useModel('user')
    const { showConf } = useModel('dashboard')

    const [refetchNum, setRefetchNum] = useState(0);
    const [reLoading, setReLoading] = useState(false)
    const [showComment, setShowComment] = useState(false);
    const [commentData, setCommentData] = useState<API.CommentRes[]>([]);
    const { isLoading: isQuoteLoading, data: buzzDetail, refetch } = useQuery({
        enabled: !isEmpty(quotePinId),
        queryKey: ['buzzDetail', quotePinId, user.address],
        queryFn: () => fetchBuzzDetail({ pinId: quotePinId! }),
    })

    useEffect(() => {
        if (buzzDetail?.data?.tweet) {
            setCommentData(buzzDetail.data.comments || [])
        }

    }, [buzzDetail])

    if (!buzzDetail) return null;



    return (<Card loading={isQuoteLoading} bordered={false} style={{ boxShadow: 'none', paddingBottom: 100 }} title={<>
        {
            showConf?.showSliderMenu && <Button type="text" size='small' icon={<LeftOutlined />} onClick={onClose}>

            </Button>
        }
    </>

    } styles={{
        header: {
            borderBottom: 'none',
            minHeight: 30,
            padding: '12px 20px'
        },
        body: {

        }
    }}>
        {
            !buzzDetail.data ? <Alert
                message={<Trans>Data Retrieval Error</Trans>}
                showIcon
                description={<Trans>The data might not be synchronized on this node yet.</Trans>}
                type="error"

            /> : <>
                {
                    buzzDetail.data.blocked && buzzDetail.data.tweet.createMetaId !== user.metaid ? <BlockedBuzz /> :
                        <>
                            <Buzz buzzItem={{ ...buzzDetail.data.tweet, blocked: buzzDetail.data.blocked }} showActions={true} padding={0} reLoading={reLoading} refetch={refetch} like={buzzDetail.data.like} donate={buzzDetail.data.donates} />
                            <Divider />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <UserAvatar src={user?.avatar} size={48} />
                                <Input value={''} placeholder={formatMessage({ id: "What's happening?" })} variant='borderless' style={{ flexGrow: 1 }} onClick={() => {
                                    if (!isLogin) {
                                        message.error(formatMessage({ id: 'Please connect your wallet first' }))
                                        return
                                    }
                                    const isPass = checkUserSetting();
                                    if (!isPass) {
                                        return;
                                    }
                                    setShowComment(true)
                                }} />
                                <Button type='primary' shape='round' onClick={() => {
                                    if (!isLogin) {
                                        message.error(formatMessage({ id: 'Please connect your wallet first' }))
                                        return
                                    }
                                    const isPass = checkUserSetting();
                                    if (!isPass) {
                                        return;
                                    }
                                    setShowComment(true)
                                }}>
                                    {formatMessage({ id: "Comment" })}
                                </Button>
                            </div>
                            <Comment tweetId={quotePinId ?? ''} onClose={(mockComment?: API.CommentRes) => {
                                setShowComment(false)
                                if (mockComment) {
                                    console.log(mockComment, 'mockComment')
                                    setCommentData([...commentData, mockComment])
                                }
                            }} show={showComment} />
                            <Divider />
                            <CommentPanel tweetId={quotePinId ?? ''} refetchNum={refetchNum} commentData={commentData} />
                        </>
                }
            </>
        }


    </Card>)
}
export default () => {
    const match = useMatch('/buzz/:id')
    const match2 = useMatch('/tweet/:id')
    const quotePinId = match?.params.id || match2?.params.id
    return <TweetCard quotePinId={quotePinId!} />
}