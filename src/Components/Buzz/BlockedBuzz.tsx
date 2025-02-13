import { Result } from "antd"
import Trans from "../Trans"

export default () => {
    return <Result
        status="warning"
        title={
            <Trans>
                Blocked Buzz
            </Trans>
        }
    />
}