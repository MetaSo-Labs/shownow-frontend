import { ProCard, ProFormColorPicker } from '@ant-design/pro-components';
import { Avatar, Button, Card, Col, ColorPicker, ConfigProvider, Divider, Form, Input, message, Modal, notification, Row, Segmented, Select, Space, Switch, Tabs, theme, Typography, Upload } from 'antd';
import type { TabsProps } from 'antd';
import { useEffect, useRef, useState } from 'react';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import { DeleteOutlined, EditOutlined, LeftCircleFilled, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import { fetchShowConfList, saveAndApply, saveConf } from '@/request/dashboard';
import RcResizeObserver from 'rc-resize-observer';
import { InputNumber } from 'antd/lib';
import ShowLayout from '@/layouts/showLayout';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import HomePage from '@/pages/home';
import IndexPage from '@/pages/index';
import './index.less'
import { bitBuzzConf, showNowConf } from '@/models/dashboard';
import SetIcon from './setIcon';

const queryClient = new QueryClient()

const DEFAULT_COLOR = [
    {
        color: '#f824da',
        percent: 0,
    },
    {
        color: '#ff5815',
        percent: 100,
    },
];
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
const getBase64 = (img: FileType, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
};
const Content = ({ showConf, onClose }: { showConf: DB.ShowConfDto, onClose: any }) => {
    const { loading, fetchConfig, setShowConf } = useModel('dashboard');
    const [overView, setOverView] = useState('Home Page');
    const [themeTokens, setThemeTokens] = useState({});
    const [styles, setStyles] = useState<DB.ShowConfDto>();
    const [submiting, setSubmiting] = useState(false);
    const [api, contextHolder] = notification.useNotification();
    const [responsive, setResponsive] = useState(false);
    useEffect(() => {
        if (showConf) {
            setStyles(prev => {
                if (!prev) {
                    return showConf
                } else {
                    return prev
                }
            })
        }

    }, [showConf])

    useEffect(() => {
        if (styles) {
            console.log(styles, 'styles')
            setShowConf(styles)
        }
    }, [styles])
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [fileList2, setFileList2] = useState<UploadFile[]>([]);
    const [imageUrl, setImageUrl] = useState<string | undefined>();
    const props: UploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            setFileList([...fileList, file]);
            console.log(file);
            getBase64(file as FileType, (url) => {
                // setLoading(false);
                console.log(url);
                setImageUrl(url);
                if (styles) {
                    setStyles({ ...styles, logo: url });
                }
            });
            return false;
        },
        fileList,
    };

    const bgprops: UploadProps = {
        onRemove: (file) => {
            const index = fileList2.indexOf(file);
            const newFileList = fileList2.slice();
            newFileList.splice(index, 1);
            setFileList2(newFileList);
        },
        beforeUpload: (file) => {
            setFileList2([...fileList2, file]);
            console.log(file);
            getBase64(file as FileType, (url) => {

                if (styles) {
                    setStyles({ ...styles, homeBackgroundImage: url });
                }
            });
            return false;
        },
        fileList: fileList2,
    };

    const handleChange: UploadProps['onChange'] = (info) => {
        if (info.file.status === 'uploading') {
            //   setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj as FileType, (url) => {
                // setLoading(false);
                setImageUrl(url);
                if (styles) {
                    setStyles({ ...styles, logo: url });
                }
            });
        }
    };

    const handleBackImageChange: UploadProps['onChange'] = (info) => {
        if (info.file.status === 'uploading') {
            //   setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj as FileType, (url) => {
                // setLoading(false);
                setImageUrl(url);
                if (styles) {
                    setStyles({ ...styles, homeBackgroundImage: url });
                }
            });
        }
    };

    const openNotification = () => {
        const key = `open${Date.now()}`;
        const btn = (
            <Space>
                <Button type="link" size="small" onClick={() => {
                    api.destroy(key);
                    history.push('/')
                }}>
                    View
                </Button>
            </Space>
        );
        api.open({
            message: 'Save Success',
            btn,
            key,
            onClose: () => {
                api.destroy(key);
            },
        });
    };

    const handleSave = async () => {
        if (!styles) return;
        setSubmiting(true);


        try {
            if (styles.tabs?.length === 0) {

                throw new Error('Please select at least one tab')
            }
            if (styles.tabs.length === 1 && styles.tabs[0] === 'following') {
                throw new Error('Following tab is required')
            }
            await saveConf({ ...styles });
            message.success('Save Success');
        } catch (e: any) {
            console.log(e);
            message.error(e.message)
        }
        setSubmiting(false);

    }

    const handelSaveAndApply = async () => {
        if (!styles) return;
        setSubmiting(true);
        try {
            await saveAndApply({ ...styles });
            await fetchConfig();
            openNotification();
        } catch (e: any) {
            console.log(e);
            message.error(e.message)
        }
        setSubmiting(false);
    }

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Color',
            children: <div >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Theme</span>
                    <Segmented<'light' | 'dark'> options={['light', 'dark']} value={styles && styles.theme} onChange={(value) => {
                        if (styles) {
                            setStyles({ ...styles, theme: value })
                        }
                    }} />
                </div>
                <Divider />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Brand Color</span>
                    <ColorPicker size="large" showText value={styles && styles.brandColor} onChange={(color) => {
                        if (styles) {
                            setStyles({ ...styles, brandColor: color.toRgbString() });
                        }
                    }} />
                </div>
                <Divider />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Layout Color</span>
                    <ColorPicker size="large" showText value={styles && styles.colorBgLayout} onChange={(color) => {
                        if (styles) {
                            setStyles({ ...styles, colorBgLayout: color.toRgbString() });
                        }
                    }} />
                </div>
                <Divider />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Header Color</span>
                    <ColorPicker size="large" showText value={styles && styles.colorHeaderBg} onChange={(color) => {
                        if (styles) {
                            setStyles({ ...styles, colorHeaderBg: color.toRgbString() });
                        }
                    }} />
                </div>
                <Divider />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Gradient Color</span>
                    <ColorPicker
                        defaultValue={DEFAULT_COLOR}
                        allowClear

                        size="large"
                        mode={['single', 'gradient']}
                        onChangeComplete={(color) => {
                            console.log(color.toCssString());
                            if (styles) {
                                setStyles({ ...styles, gradientColor: color.toCssString() });
                            }
                        }}
                    />
                </div>
                <Divider />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Border Color</span>
                    <ColorPicker size="large" showText value={styles && styles.colorBorderSecondary} onChange={(color) => {
                        if (styles) {
                            setStyles({ ...styles, colorBorderSecondary: color.toRgbString() });
                        }
                    }} />
                </div>

                <Divider />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Button Text Color</span>
                    <ColorPicker size="large" showText value={styles && styles.colorButton} onChange={(color) => {
                        if (styles) {
                            setStyles({ ...styles, colorButton: color.toRgbString() });
                        }
                    }} />
                </div>



            </div>,
        },
        {
            key: '2',
            label: 'Layout',
            children: <div >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Slider Menu</span>
                    <Switch value={styles?.showSliderMenu} onChange={(value) => {
                        if (styles) {
                            setStyles({ ...styles, showSliderMenu: value })
                        }
                    }} />
                </div>
                <Divider />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Recommend</span>
                    <Switch value={styles?.showRecommend} onChange={(value) => {
                        if (styles) {
                            setStyles({ ...styles, showRecommend: value })
                        }
                    }} />
                </div>
                <Divider />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Content Size</span>
                    <InputNumber value={styles?.contentSize} onChange={(value) => {
                        if (styles) {
                            setStyles({ ...styles, contentSize: Number(value) })
                        }
                    }} />
                </div>
            </div>
        },
        {
            key: '3',
            label: 'Brand',
            children: <Space direction="vertical" style={{ width: '100%' }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Logo</span>

                    <Upload {...props} listType="picture-card"
                        className="avatar-uploader" maxCount={1} showUploadList={false} onChange={handleChange}
                    >
                        {styles?.logo ?
                            <div style={{ position: 'relative' }}>
                                <Button style={{
                                    position: 'absolute',
                                    right: '50%',
                                    top: '50%',
                                    transform: 'translate(50%,-50%)',
                                    background: 'rgba(0,0,0,0.5)',
                                    color: '#fff'
                                }} icon={<DeleteOutlined />} onClick={(e) => {
                                    e.stopPropagation();
                                    setStyles({ ...styles, logo: '' });
                                }}></Button>
                                <img src={styles?.logo} alt="avatar" style={{ width: '100%' }} />
                            </div> : <Button icon={<UploadOutlined />}></Button>}
                    </Upload>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Home Background</span>

                    <Upload {...bgprops}
                        listType="picture-card"
                        className="avatar-uploader" maxCount={1} showUploadList={false} onChange={handleBackImageChange}>
                        {styles?.homeBackgroundImage ?
                            <div style={{ position: 'relative' }}>
                                <Button style={{
                                    position: 'absolute',
                                    right: '50%',
                                    top: '50%',
                                    transform: 'translate(50%,-50%)',
                                    background: 'rgba(0,0,0,0.5)',
                                    color: '#fff'
                                }} icon={<DeleteOutlined />} onClick={(e) => {
                                    e.stopPropagation();
                                    setStyles({ ...styles, homeBackgroundImage: '' });
                                }}></Button>
                                <img src={styles?.homeBackgroundImage} alt="avatar" style={{ width: '100%' }} />
                            </div> : <Button icon={<UploadOutlined />}></Button>}

                    </Upload>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                    <span style={{ whiteSpace: 'nowrap' }}>Twitter</span>

                    <Input value={styles?.twitterUrl} onChange={(e) => {
                        if (styles) {
                            setStyles({ ...styles, twitterUrl: e.target.value });
                        }

                    }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                    <span style={{ whiteSpace: 'nowrap' }}> Main Title</span>

                    <Input value={styles?.brandIntroMainTitle} onChange={(e) => {
                        if (styles) {
                            setStyles({ ...styles, brandIntroMainTitle: e.target.value });
                        }
                    }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                    <span style={{ whiteSpace: 'nowrap' }}> Sub Title</span>

                    <Input value={styles?.brandIntroSubTitle} onChange={(e) => {
                        if (styles) {
                            setStyles({ ...styles, brandIntroSubTitle: e.target.value });
                        }

                    }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                    <span>Need Login</span>
                    <Switch value={styles?.checkLogin} onChange={(value) => {
                        if (styles) {
                            setStyles({ ...styles, checkLogin: value })
                        }
                    }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                    <span>Tabs</span>
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="at least one tab"
                        value={styles?.tabs ?? []}

                        onChange={(value) => {
                            if (styles) {
                                setStyles({ ...styles, tabs: value })
                            }
                        }
                        }
                        options={
                            [
                                {
                                    label: 'New',
                                    value: 'new',
                                },
                                {
                                    label: 'Hot',
                                    value: 'hot',
                                },
                                {
                                    label: 'Following',
                                    value: 'following',
                                },
                                {
                                    label: 'For You',
                                    value: 'recommend',
                                    disabled: true
                                },
                            ]
                        }

                    />
                </div>
            </Space>,
        },
    ];

    useEffect(() => {
        if (styles) {
            const tokens: any = {
                colorPrimary: styles.brandColor,
                colorLink: styles.brandColor,
            }
            if (styles.colorBgLayout) {
                tokens.colorBgLayout = styles.colorBgLayout
            }
            if (styles.colorBorderSecondary) {
                tokens.colorBorderSecondary = styles.colorBorderSecondary
            }
            const components = {
                "Avatar": {
                    "colorTextPlaceholder": styles.brandColor,
                },
                "Button": {
                    "defaultBorderColor": "rgba(217,217,217,0)",
                    "defaultShadow": "0 2px 0 rgba(0, 0, 0,0)"
                }
            }
            if (styles.colorButton) {
                components.Button.primaryColor = styles.colorButton
            }
            console.log(components, 'components')

            setThemeTokens({
                token: tokens,
                components
            })
        }

    }, [styles])

    const parentRef = useRef<HTMLDivElement>(null);
    const childRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (styles && parentRef.current && childRef.current) {
            const parent = parentRef.current.getBoundingClientRect();
            const child = childRef.current.getBoundingClientRect();
            const scaleX = (parent.width - 48) / document.body.clientWidth;
            childRef.current.style.zoom = scaleX.toString();
            childRef.current.style.transformOrigin = 'top left'; // 可调整缩放基准
        }
    }, [styles]);
    const handleChildScroll = (e: React.TouchEvent<HTMLDivElement>) => {
        e.stopPropagation(); // 阻止事件冒泡
    };

    if (!styles) return <div>no data</div>
    return <div>
        {contextHolder}
        <RcResizeObserver
            key="resize-observer"
            onResize={(offset) => {
                setResponsive(offset.width < 596);
            }}

        >
            <ProCard split={responsive ? 'horizontal' : 'vertical'}
                title={<Button variant='filled' type='text' icon={<LeftCircleFilled />} onClick={onClose} >Go Back</Button>}
                extra={
                    <Space>
                        <Button type="primary" onClick={handleSave} loading={submiting}>Save</Button>
                        <Button type="primary" onClick={handelSaveAndApply} loading={submiting}>Save & Apply</Button>
                    </Space>

                }
            >

                <ProCard colSpan={responsive ? 24 : 8} >
                    <Tabs defaultActiveKey="1" items={items} />
                </ProCard>
                <ProCard colSpan={responsive ? 24 : 16} title="OverView" ref={parentRef} headerBordered
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                        <Segmented<string> options={['Home Page', 'Login Page']} value={overView} onChange={(value) => {
                            setOverView(value)
                        }} />
                    </div>



                    <div ref={childRef} className='previewerDemo' style={{ height: '100vh', width: '100vw', position: 'relative', pointerEvents: 'auto' }} onClick={() => { }}>
                        <QueryClientProvider client={queryClient}>
                            <ConfigProvider
                                theme={{
                                    algorithm: styles?.theme !== 'dark' ? theme.defaultAlgorithm : theme.darkAlgorithm,
                                    ...themeTokens,
                                }}
                            >
                                <div style={{ pointerEvents: 'none', }} onTouchMove={handleChildScroll}>
                                    {
                                        overView === 'Home Page' ? <ShowLayout > <HomePage /></ShowLayout> : <IndexPage />
                                    }
                                </div>

                            </ConfigProvider>
                        </QueryClientProvider>



                    </div>
                </ProCard>
            </ProCard>
        </RcResizeObserver>
    </div>
}

const ThemeCard = ({ item, handleEdit }: { item: DB.ShowConfDto, handleEdit: any }) => {

    const styles = item as DB.ShowConfDto;
    let themeTokens: any = {};
    if (styles) {
        const tokens: any = {
            colorPrimary: styles.brandColor,
            colorLink: styles.brandColor,
        }
        if (styles.colorBgLayout) {
            tokens.colorBgLayout = styles.colorBgLayout
        }
        if (styles.colorBorderSecondary) {
            tokens.colorBorderSecondary = styles.colorBorderSecondary
        }
        const components = {
            "Avatar": {
                "colorTextPlaceholder": styles.brandColor,
            },
            "Button": {
                "defaultBorderColor": "rgba(217,217,217,0)",
                "defaultShadow": "0 2px 0 rgba(0, 0, 0,0)"
            }
        }
        if (styles.colorButton) {
            components.Button.primaryColor = styles.colorButton
        }
        console.log(components, 'components')

        themeTokens = {
            token: tokens,
            components
        }
    }
    const parentRef = useRef<HTMLDivElement>(null);
    const childRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (styles && parentRef.current && childRef.current) {
            const parent = parentRef.current.getBoundingClientRect();
            const child = childRef.current.getBoundingClientRect();
            const scaleX = (parent.width) / document.body.clientWidth;
            childRef.current.style.zoom = scaleX.toString()
        }
    }, [styles]);
    return <Col {...{ xs: 24, sm: 12, md: 12, lg: 8, xl: 6 }}>
        <Card
            actions={[
                <EditOutlined onClick={handleEdit} />,
                <DeleteOutlined onClick={() => {
                    message.info('Coming soon')
                }} />
            ]}
            ref={parentRef}
            style={{ borderColor: item.apply ? '#1890ff' : '#f0f0f0', overflow: 'hidden' }}


            cover={
                <div ref={childRef} className='previewerDemo' style={{ height: '100vh', width: '100vw', position: 'relative', pointerEvents: 'auto' }} onClick={() => { }}>
                    <ConfigProvider
                        theme={{
                            algorithm: item?.theme !== 'dark' ? theme.defaultAlgorithm : theme.darkAlgorithm,
                            ...themeTokens,
                        }}
                    >
                        <div style={{ pointerEvents: 'none', }} onTouchMove={() => { }}>
                            <ShowLayout children={<></>} _showConf={item} />
                        </div>

                    </ConfigProvider>
                </div>
            }

        >
            <Card.Meta
                avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />}
                title={item.name || item.alias}
                description={item.updateTime}
            />
            <div style={{ position: 'absolute', top: 0, right: 0, padding: 4, background: item.apply ? '#1890ff' : '#f0f0f0', color: '#fff' }}>{item.apply ? 'Applied' : ''}</div>



        </Card>
    </Col >
}

const Page = () => {
    const [showCreate, setShowCreate] = useState(false);
    const { data: styleList, refetch } = useQuery({
        queryKey: ['dashboardstyles'],
        queryFn: async () => {
            return await fetchShowConfList();
        }
    })

    const [current, setCurrent] = useState<DB.ShowConfDto>();
    const [form] = Form.useForm();
    if (current) {
        return <Content showConf={current} onClose={() => { setCurrent(undefined); refetch() }} />
    }
    return <Row
        gutter={[16, 16]}

    >
        <Col span={24}>
            <Space>
                <Button type='primary' icon={<PlusOutlined />} onClick={() => {
                    setShowCreate(true)
                }}>Create Styles</Button>
                <SetIcon />
            </Space>
        </Col>
        {
            (styleList ?? []).map(item => {
                return <ThemeCard item={item} key={item.id} handleEdit={() => { setCurrent(item) }} />
            })
        }

        <Modal

            open={showCreate}

            title='Create Design Theme'
            styles={{
                body: {
                    paddingTop: 20,
                    paddingBottom: 20
                }
            }}
            okText='Next'
            onOk={async () => {
                const { name } = await form.getFieldsValue()
                console.log(name, 'name')
                if (!name) return message.error('Name is required')
                setShowCreate(false)
                setCurrent({ ...showNowConf, name } as DB.ShowConfDto)
            }}
            onCancel={() => {
                setShowCreate(false)
            }}
        >
            <Form
                layout="vertical"
                autoComplete="off"
                variant='filled'
                form={form}
            >
                <Form.Item
                    name="name"
                    label="Design Theme Name"
                    rules={[{ required: true }]}
                >
                    <Input placeholder="" />
                </Form.Item>

            </Form>




        </Modal>
    </Row>
}
export default Page;