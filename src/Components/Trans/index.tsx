import React from "react"
import { useIntl } from "umi"

export default ({ children }: { children: React.ReactNode }) => {
    const { formatMessage } = useIntl()
    return <>
        {formatMessage({ id: children as string })}
    </>
}