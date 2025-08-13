import Trans from "@/Components/Trans"
import { Card, Col, ConfigProvider, Flex, Row, Select, Space, Table, Tag, theme, Typography } from "antd"
import { useEffect, useMemo, useState } from "react"
import type { SelectProps, TableProps } from 'antd';
import { useQuery } from "@tanstack/react-query";
import { useModel } from "umi";
import { getHostNDV, getMetaBlockHostUserList, getMetaBlockHostUserValue, getMetaBlockHostValue, getMetaBlockNewest } from "@/request/api";
import NumberFormat from "@/Components/NumberFormat";
import PendingUser from "@/Components/UserInfo/PendingUser";
import _1 from '@/assets/rank/1.svg'
import _2 from '@/assets/rank/2.svg'
import _3 from '@/assets/rank/3.svg'
import './index.less'
import UserMetaSoReward from "@/Components/UserMetaSoReward";
interface DataType {
    key: string;
    name: string;
    age: number;
    address: string;
    tags: string[];
}
export default () => {

    const [options, setOptions] = useState<SelectProps['options']>([]);
    const [value, setValue] = useState<number | string>(1);
    const { admin, showConf } = useModel('dashboard');
    const { isLogin, user } = useModel('user')
    useEffect(() => {
        setOptions([
            { value: 1, label: <Trans>Now</Trans> },
            { value: 2, label: <Trans>2 Day</Trans> },
            { value: 3, label: <Trans>3 Day</Trans> },
            { value: 4, label: <Trans>4 Day</Trans> },
            { value: 5, label: <Trans>5 Day</Trans> },
            { value: 6, label: <Trans>6 Day</Trans> },
            { value: 7, label: <Trans>This Past Week</Trans> },
        ])
    }, [])

    const { data: _newest, } = useQuery({
        queryKey: ['getMetaBlockNewest',],
        queryFn: () => {
            return getMetaBlockNewest()
        }
    })

    const { data: _ndv, isFetching: _ndvFetching } = useQuery({
        queryKey: ['statisticsndv', admin?.host],
        enabled: Boolean(admin?.host),
        queryFn: () => {
            return getHostNDV({
                host: admin!.host,
                cursor: 0,
                size: 1
            })
        }
    })

    const startAndEndHeight = useMemo(() => {
        if (value === 1) return {
            heightBegin: -1,
            heightEnd: -1
        };
        if (!_newest) return null;
        const { progressStartBlock, progressEndBlock, syncMetaBlockHeight } = _newest.data;
        const heightEnd = syncMetaBlockHeight;
        const step = progressEndBlock - progressStartBlock + 1
        const heightBegin = heightEnd - Number(value) * step;
        return {
            heightBegin,
            heightEnd
        }
    }, [value, _newest])

    const { data: _hostValue, isFetching: _hostValueFetching } = useQuery({
        queryKey: ['_hostValue', startAndEndHeight, admin?.host],
        enabled: Boolean(admin?.host && startAndEndHeight),
        queryFn: () => {
            return getMetaBlockHostValue({
                size: 100,
                cursor: 0,
                host: admin!.host,
                // timeBegin: Math.floor(new Date().getTime() / 1000) - 60 * 60 * 24 * 7 * Number(value),
                // timeEnd: Math.floor(new Date().getTime() / 1000)
                heightBegin: startAndEndHeight!.heightBegin,
                heightEnd: startAndEndHeight!.heightEnd
            })
        }
    })

    const { data: _userValue, isFetching: _userValueFetching } = useQuery({
        queryKey: ['_userhostValue', startAndEndHeight, admin?.host, isLogin, user?.address],
        enabled: Boolean(admin?.host && startAndEndHeight && isLogin && user?.address),
        queryFn: () => {
            return getMetaBlockHostUserValue({
                size: 100,
                cursor: 0,
                host: admin!.host,
                address: user!.address,
                // timeBegin: Math.floor(new Date().getTime() / 1000) - 60 * 60 * 24 * 7 * Number(value),
                // timeEnd: Math.floor(new Date().getTime() / 1000)
                heightBegin: startAndEndHeight!.heightBegin,
                heightEnd: startAndEndHeight!.heightEnd
            })
        }
    })

    const { data: _listValue, isFetching: _listValueFetching } = useQuery({
        queryKey: ['_listhostValue', startAndEndHeight, admin?.host],
        enabled: Boolean(admin?.host && startAndEndHeight),
        queryFn: () => {
            return getMetaBlockHostUserList({
                size: 10,
                cursor: 0,
                host: admin!.host,
                // timeBegin: Math.floor(new Date().getTime() / 1000) - 60 * 60 * 24 * 7 * Number(value),
                // timeEnd: Math.floor(new Date().getTime() / 1000)
                heightBegin: startAndEndHeight!.heightBegin,
                heightEnd: startAndEndHeight!.heightEnd
            })
        }
    })
    const hostValue = useMemo(() => {
        if (!_hostValue || !_hostValue.data.list) return 0;
        return _hostValue.data.list.reduce((acc, cur) => acc + Number(cur.mdvDeltaValue), 0)
    }, [_hostValue])
    const totalNDV = useMemo(() => {
        if (!_ndv || !_ndv.data) return 0;
        return _ndv.data[0].dataValue
    }, [_ndv])

    const userValue = useMemo(() => {
        if (!_userValue || !_userValue.data.list) return 0;
        return _userValue.data.list.reduce((acc, cur) => acc + Number(cur.dataValue), 0)
    }
        , [_userValue])

    const columns: TableProps<API.MetaBlockValueListItem>['columns'] = [
        {
            title: '#',
            dataIndex: 'name',
            key: 'name',
            render: (text, record, index) => {
                if (index === 0) return <img src={_1} alt="" />
                if (index === 1) return <img src={_3} alt="" />
                if (index === 2) return <img src={_2} alt="" />
                return <Typography.Text>
                    {index + 1}
                </Typography.Text>
            },
        },
        {
            title: <Trans>User</Trans>,
            dataIndex: 'address',
            key: 'name',
            minWidth: 160,
            render: (text, record, index) => <PendingUser address={text} />,
        },
        {
            title: <Trans>Total Value</Trans>,
            dataIndex: 'dataValue',
            key: 'dataValue',
            align: 'center',
            render: (text, record, index) => <NumberFormat value={text} />,
        },
        {
            title: <Trans>Proportion%</Trans>,
            dataIndex: 'dataValue',
            key: 'Progress',
            align: 'center',
            render: (text, record, index) => <NumberFormat value={hostValue ? Number(text) / hostValue * 100 : '--'} suffix='%' precision={2} />,
        },
    ]
    return <ConfigProvider
        theme={{
            components: {
                Table: {
                    headerBg: 'transparent',
                    headerSplitColor: 'transparent',
                },
            },
        }}
    ><div className={`rankPage ${showConf?.theme}`}>
            <Card
                title={<Trans>Contribution value</Trans>}
                variant='borderless'
                styles={{
                    header: {
                        borderBottomColor: 'transparent'
                    }
                }}
                extra={
                    <Space >
                        <Typography.Text><Trans>Timeframe</Trans></Typography.Text>
                        <Select
                            placeholder="Select a time"
                            variant="filled"
                            style={{ flex: 1, width: 160 }}
                            options={options}
                            value={value}
                            onChange={(value) => {
                                setValue(value)
                            }}
                        />
                    </Space>
                }
            >
                <Row gutter={[12, 12]}>
                    <Col span={12}>
                        <Card loading={_ndvFetching}>
                            <Typography.Title level={4} style={{ padding: 0, margin: 0 }}><NumberFormat value={totalNDV} precision={4}></NumberFormat></Typography.Title>
                            <Typography.Text type='secondary'>
                                <Trans>total NDV</Trans>
                            </Typography.Text>
                        </Card>
                    </Col>

                    <Col span={12} style={{
                        visibility: isLogin ? 'visible' : 'hidden'
                    }}>
                        <Card loading={_userValueFetching || _hostValueFetching}>
                            <Typography.Title level={4} style={{ padding: 0, margin: 0 }}>
                                <NumberFormat value={userValue} precision={4}></NumberFormat>
                                <NumberFormat value={hostValue ? Number(userValue) / hostValue * 100 : '--'} precision={2} prefix=' (' suffix='%)'></NumberFormat>
                            </Typography.Title>
                            <Typography.Text type='secondary'>
                                <Trans>My contribution value</Trans>
                            </Typography.Text>
                        </Card>
                    </Col>
                </Row>
                {
                    isLogin && user?.address && <UserMetaSoReward address={user.address} host={admin!.host} />
                }
                <Typography.Title level={5}>
                    <Trans>Rank</Trans>
                </Typography.Title>
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

                    <Table<API.MetaBlockValueListItem>
                        columns={columns}
                        dataSource={_listValue?.data.list}
                        loading={_listValueFetching}
                        pagination={false}
                        size='small'
                        rowClassName={(record, index) => {
                            if (index < 3) {
                                return 'ant-table-row-' + index
                            }
                            return ''
                        }}
                        scroll={{
                            x: 'max-content'
                        }}


                    />

                </Card>



            </Card>
            {
                isLogin && user?.address && <Card variant='borderless' style={{
                    marginTop: 20
                }}>
                    <Flex align='center' gap={12} justify='space-between'>
                        <Flex align='center' gap={12} >
                            <PendingUser address={user.address} />
                            <div style={{
                                background: 'linear-gradient(125deg, #FF5D5D 15%, #FFDD6F 52%, #63FFBE 87%)',
                                borderRadius: 12,
                                height: 20,
                                fontSize: 12,
                                color: '#fff',
                                width: 30,
                                textAlign: 'center'
                            }}>
                                ME
                            </div>
                        </Flex>


                        <Typography.Text strong><NumberFormat value={userValue} precision={4}></NumberFormat></Typography.Text>
                        <Typography.Text ><NumberFormat value={hostValue ? Number(userValue) / hostValue * 100 : '--'} precision={2} prefix='' suffix='%'></NumberFormat></Typography.Text>

                    </Flex>


                </Card>
            }

        </div >
    </ConfigProvider>
}