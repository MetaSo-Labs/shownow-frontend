import { useQuery } from "@tanstack/react-query"
import CoinSummary from "./CoinSummary"
import MyArea from "./MyArea"
import MetaBlockArea from "./MetaBlockArea"
import BrowseBlocks from "./BrowseBlocks"
import MyAllocation from "./MyAllocation"

export default () => {
    return <>
        <CoinSummary />
        <MyArea />
        <MyAllocation />
        <MetaBlockArea />
        <BrowseBlocks />
    </>
}