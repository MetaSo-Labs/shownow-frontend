
import React from "react";
import Details from "./Details";
import RepostDetail from "./RepostDetail";


type Props = {
    buzzItem: API.Buzz
    showActions?: boolean
    loading?: boolean
}

const RepostDetails = React.memo(({ buzzItem, showActions = true, loading }: Props) => {
    if (!buzzItem || !buzzItem.address) return null;
    return <RepostDetail buzzItem={buzzItem} loading={loading} />
});

export default RepostDetails;