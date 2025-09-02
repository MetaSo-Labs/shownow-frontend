import { fetchTranlateResult } from "@/request/baidu-translate";
import { Button, message, theme } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "umi";
import TextContent from "./TextContent";
import { formatMessage } from "@/utils/utils";
import { DownOutlined } from "@ant-design/icons";

type Props = {
    text: string
}

export default ({ text }: Props) => {
    const { token: { colorBgBlur, colorBgContainer } } = theme.useToken();
    const [showTrans, setShowTrans] = useState(false);
    const [isTranslated, setIsTranslated] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [transResult, setTransResult] = useState<string[]>([]);
    const contentRef = useRef<HTMLDivElement>(null); // 引用内容容器
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false); // 是否溢出

    const { locale } = useIntl();
    const handleTranslate = async () => {
        if (!text) return;
        setShowTrans(!showTrans);
        if (isTranslated) {
            setIsTranslated(false);
            return;
        }
        setIsTranslating(true);
        try {

            const res = await fetchTranlateResult({
                sourceText: text,
                from: locale === "en-US" ? "zh" : "en",
                to: locale === "en-US" ? "en" : "zh",
            });

            setTransResult(
                res!.trans_result.map((item) => {
                    return item.dst;
                })
            );

            setIsTranslated(true);
        } catch (e) {
            message.error("Translate Failed");
        }
        setIsTranslating(false);
    };
    const textContent = useMemo(() => {
        if (!text) return "";
        if (!showTrans || isTranslating) {
            return text;
        } else {
            return transResult.join("\n");
        }
    }, [showTrans, transResult, text, isTranslating]);

    useEffect(() => {
        // 检测内容是否溢出
        if (contentRef.current) {
            const { scrollHeight, offsetHeight } = contentRef.current;
            setIsOverflowing(scrollHeight > offsetHeight);
        }
    }, [contentRef.current, textContent]); // 当内容变化时重新检测

    return <>{textContent.length > 0 && (
        <div
            className="text"
            ref={contentRef}
            style={{
                position: "relative",
                maxHeight: isExpanded ? "none" : 200,
                overflow: "hidden",
                transition: "max-height 0.3s ease",
            }}
        >
            <TextContent textContent={textContent} />

            <Button
                type="link"
                style={{ padding: 0 }}
                loading={isTranslating}
                onClick={(e) => {
                    e.stopPropagation();
                    handleTranslate();
                }}
            >
                {showTrans
                    ? formatMessage("Show original content")
                    : formatMessage("Translate")}
            </Button>

            {isOverflowing && !isExpanded && (
                <div
                    style={{
                        width: "100%",
                        paddingTop: 78,
                        backgroundImage: `linear-gradient(-180deg,${colorBgBlur} 0%,${colorBgContainer} 100%)`,
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Button
                        variant="filled"
                        color="primary"
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(true);
                        }}
                        icon={<DownOutlined />}
                    />
                </div>
            )}
        </div>
    )}
    </>
}