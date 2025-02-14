import { Result } from "antd"
import Trans from "../Trans"

export default () => {
    return <Result
        status="warning"
        title={
            <Trans>
                This Buzz has been blocked by the administrator.
            </Trans>
        }
    />
}