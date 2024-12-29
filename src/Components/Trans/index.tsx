import React from "react"
import { useIntl } from "umi"

export default ({ children, wrapper = false }: { children: React.ReactNode, wrapper?: boolean }) => {
    const { formatMessage } = useIntl();
    if (!children) return null;
    if (wrapper) return <>
        <span>{formatMessage({ id: children as string })}</span>
    </>
    return <>
        {formatMessage({ id: children as string })}
    </>
}