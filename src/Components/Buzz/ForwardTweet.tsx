
import Details from "./Details";


type Props = {
    buzzItem: API.Buzz
    showActions?: boolean
    loading?: boolean
}

export default ({ buzzItem, showActions = true, loading }: Props) => {
    if (!buzzItem || !buzzItem.address) return null
    return <Details buzzItem={buzzItem} showActions={false} padding={0} reLoading={false} isForward loading={loading} />
}