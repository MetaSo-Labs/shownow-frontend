import React from "react"
import { useIntl } from "umi"

type TransProps = {
    children: React.ReactNode;
    wrapper?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export default ({ children, wrapper = false, className, style }: TransProps) => {
    const { formatMessage } = useIntl();
    if (!children) return null;
    if (wrapper) return (
        <span className={className} style={style}>
            {formatMessage({ id: children as string })}
        </span>
    );
    return formatMessage({ id: children as string });
}