import { ProCard, ProFormColorPicker } from '@ant-design/pro-components';
import { Avatar, Button, ColorPicker, ConfigProvider, Divider, Input, message, notification, Segmented, Space, Switch, Tabs, theme, Upload } from 'antd';
import type { TabsProps } from 'antd';
import { useEffect, useRef, useState } from 'react';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import { saveConf } from '@/request/dashboard';
import RcResizeObserver from 'rc-resize-observer';
import { InputNumber } from 'antd/lib';
import ShowLayout from '@/layouts/showLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from '@/pages/home';
import IndexPage from '@/pages/index';
import './index.less'
import { bitBuzzConf, showNowConf } from '@/models/dashboard';

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
export default () => {
    const { showConf, loading, fetchConfig, setShowConf } = useModel('dashboard');
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
            onClose: ()=>{
                api.destroy(key);   
            },
        });
    };

    const handleSave = async () => {
        if (!styles) return;
        setSubmiting(true);
        try {
            await saveConf({ ...styles, alias: 'default' });
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

                    <Upload {...props} listType="picture" maxCount={1} onChange={handleChange}>
                        <Button icon={<UploadOutlined />}>Select Image</Button>
                    </Upload>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Home Background Image</span>

                    <Upload {...bgprops} listType="picture" maxCount={1} onChange={handleBackImageChange}>
                        <Button icon={<UploadOutlined />}>Select Image</Button>
                    </Upload>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                    <span>Twitter</span>

                    <Input value={styles?.twitterUrl} onChange={(e) => {
                        if (styles) {
                            setStyles({ ...styles, twitterUrl: e.target.value });
                        }

                    }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                    <span> Main Title</span>

                    <Input value={styles?.brandIntroMainTitle} onChange={(e) => {
                        if (styles) {
                            setStyles({ ...styles, brandIntroMainTitle: e.target.value });
                        }

                    }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                    <span> Sub Title</span>

                    <Input value={styles?.brandIntroSubTitle} onChange={(e) => {
                        if (styles) {
                            setStyles({ ...styles, brandIntroSubTitle: e.target.value });
                        }

                    }} />
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
            childRef.current.style.transform = `scale(${scaleX})`;
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
            <ProCard split={responsive ? 'horizontal' : 'vertical'}>

                <ProCard title="Recommended Theme" colSpan={responsive ? 24 : 8} extra={
                    <Space>
                        <Button type='link'  onClick={() => setStyles({
                            ...styles,
                            ...showNowConf as DB.ShowConfDto
                        })}>ShowNow</Button>
                        <Button type='link'  onClick={() => setStyles({
                            ...styles,
                            ...bitBuzzConf as DB.ShowConfDto
                        })}>BitBuzz</Button>
                    </Space>
                }>
                    <Tabs defaultActiveKey="1" items={items} />
                </ProCard>
                <ProCard colSpan={responsive ? 24 : 16} title="OverView" ref={parentRef} headerBordered extra={
                    <Button type="primary" onClick={handleSave} loading={submiting}>Save</Button>}
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