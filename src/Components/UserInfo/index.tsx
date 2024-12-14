import { Avatar, Typography } from "antd"
import './index.less'
import UserAvatar from "../UserAvatar"

type Props = {
    user: {
        avater: string,
        name: string,
        metaid: string
    }

}
export default ({ user }: Props) => {

    return <div className="userInfo">
        <UserAvatar src={user.avater} />
        <div className='desc'>
            <div className="name">
                <Typography.Text>{user.name}</Typography.Text>
            </div>
            <div className="metaid">
                <Typography.Text type='secondary'> MetaID:{user.metaid.slice(0, 8)}</Typography.Text>
            </div>
        </div>

    </div>
}