import { Typography } from "antd"
import React from "react";
import { Link, useModel } from "umi";

type Props = {
    textContent: string
}


const LinkifyText: React.FC<{ text: string }> = ({ text }) => {
    const { idCoins } = useModel('dashboard');
    // 正则识别 URL（http、https）和 @用户名（以空格结尾）
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const atUserRegex = /(@[A-Za-z0-9_]+)(?=\s|$)/g;

    // 先将文本按 URL 和 @用户名拆分
    const parts = text.split(/(https?:\/\/[^\s]+|@[A-Za-z0-9_]+(?=\s|$))/g);

    return (
        <span>
            {parts.map((part, index) => {
                if (urlRegex.test(part)) {
                    // URL 链接渲染
                    return (
                        <Typography.Link key={index} href={part} target="_blank" rel="noopener noreferrer" onClick={(e) => {
                            e.stopPropagation();
                        }}>
                            {part}
                        </Typography.Link>
                    );
                } else if (atUserRegex.test(part) && idCoins.includes(part.slice(1).toUpperCase())) {
                    // @用户名渲染
                    return (
                        <Link key={index} to={`/user/${part.slice(1)}`} onClick={(e) => {
                            e.stopPropagation();
                        }}
                        >
                            {part}
                        </Link>
                    );
                } else {
                    // 普通文本渲染
                    return <Typography.Text key={index}>{part}</Typography.Text>;
                }
            })}
        </span>
    );
};





export default ({ textContent }: Props) => {
    return <>
        {(textContent ?? "")
            .split("\n")
            .map((line: string, index: number) => (
                <span key={index} style={{}}>
                    <Typography.Paragraph
                        style={{ minHeight: 22 }}

                    >
                        <LinkifyText text={line} />
                    </Typography.Paragraph>
                </span>
            ))}
    </>
}