
import Details from "./Details";

type Props = {
    buzzItem: API.Buzz
    showActions?: boolean,
    padding?: number
    reLoading?: boolean
    refetch?: () => Promise<any>
    like?: API.LikeRes[]
    donate?: API.DonateRes[];
    handleClick?: () => void
}

export default ({ buzzItem, showActions = true, padding = 20, reLoading = false, refetch, like = [], handleClick, donate = [] }: Props) => {
    return <Details buzzItem={buzzItem} showActions={showActions} padding={padding} reLoading={reLoading} refetch={refetch} isForward={false} like={like} donate={donate} handleClick={handleClick} />
}