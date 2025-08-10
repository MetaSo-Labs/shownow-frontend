import { getVersionInfo } from "@/request/api"
import { useQuery } from "@tanstack/react-query"
import { Badge, Modal, Tag, Typography } from "antd"
import { useCallback, useEffect } from "react"

export default () => {
    const [modal, contextHolder] = Modal.useModal();
    const { data, isFetching, refetch } = useQuery({
        queryKey: ['getVeisionInfo'],
        queryFn: () => {
            return getVersionInfo()
        },
    })

    // const data = {
    //     data: {
    //         curNo: 1,
    //         curVer: '1.0.0',
    //         lastNo: 2,
    //         lastVer: '1.0.1',
    //         serverUrl: 'https://www.baidu.com',
    //         mandatory: true
    //     }
    // }



    const showNotioce = useCallback(() => {
        return
        if (!data) return
        if (!data.data) return;
        if (data.data.curNo < data.data.lastNo) {
            modal.confirm({
                title: 'Update Available!',
                content: <Typography><Typography.Paragraph>
                    <Typography.Text>Your current version: v{data.data.curVer}</Typography.Text>
                </Typography.Paragraph>
                    <Typography.Paragraph>
                        <Typography.Text>Latest version: v{data.data.lastVer}</Typography.Text> {data.data.mandatory ? <Typography.Text type='danger'>(Required for continued use)</Typography.Text> : null}
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                        <Typography.Text>A new version is available with exciting features and improvements! Update now to get the best experience.</Typography.Text>
                    </Typography.Paragraph>
                </Typography>,
                onOk: () => {
                    window.location.href = data.data.serverUrl
                },
                cancelButtonProps: {
                    disabled: data.data.mandatory
                }
            });
        }

    }, [data])
    useEffect(() => {
        showNotioce()
    }, [showNotioce])
    if (!data || !data?.data) return null
    return <><Badge dot={data.data.curNo < data.data.lastNo} onClick={() => {
        showNotioce()
    }}>
        <Tag>
            v{data.data.curVer}
        </Tag>

    </Badge>
        {contextHolder}
    </>
}