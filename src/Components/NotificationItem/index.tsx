import { Notification } from "@/utils/NotificationStore"
import _comment from "@/assets/notify/comment.svg";
import _like from "@/assets/notify/like.svg";
import _follow from "@/assets/notify/follow.svg";
import _reward from "@/assets/notify/reward.svg";
import _repost from "@/assets/notify/repost.svg";
import UserInfo from "../UserInfo";
import PendingUser from "../UserInfo/PendingUser";
import './index.less'
import SimpleBuzz from "../Buzz/SimpleBuzz";
import ReplyBuzz from "../Buzz/ReplyBuzz";
import PendingUserName from "../UserInfo/PendingUserName";
import { Typography } from "antd";
import RewardContent from "./RewardContent";
import { history } from "umi";


type NotificationProps = {
    notification: Notification,
    address: string
}
export default ({ notification, address }: NotificationProps) => {
    switch (notification.notifcationType) {
        case '/follow':
            return (
                <div className="notificationItem">
                    <div className="notificationIcon">
                        <img src={_follow} alt="Like Icon" />
                    </div>
                    <div className="notificationContent">
                        <PendingUser address={notification.fromAddress} />
                        <Typography.Text><PendingUserName address={notification.fromAddress} /> followed you</Typography.Text>
                    </div>
                </div>
            )
        case '/protocols/simpledonate':
            return (
                <div className="notificationItem">
                    <div className="notificationIcon">
                        <img src={_reward} alt="Like Icon" />
                    </div>
                    <div className="notificationContent">
                        <PendingUser address={notification.fromAddress} />
                        <Typography.Text><PendingUserName address={notification.fromAddress} /> reward your <Typography.Link onClick={() => {
                            history.push(`/tweet/${notification.notifcationPin}`)
                        }}>buzz</Typography.Link></Typography.Text>
                        <RewardContent pinId={notification.fromPinId} />
                    </div>
                </div>
            )
        case '/protocols/paylike':
            return (
                <div className="notificationItem">
                    <div className="notificationIcon">
                        <img src={_like} alt="Like Icon" />
                    </div>
                    <div className="notificationContent">
                        <PendingUser address={notification.fromAddress} />
                        <Typography.Text><PendingUserName address={notification.fromAddress} /> liked your buzz</Typography.Text>
                        <SimpleBuzz buzzId={notification.notifcationPin} />
                    </div>



                </div>
            )
        case '/protocols/paycomment':
            return (
                <div className="notificationItem">
                    <div className="notificationIcon">
                        <img src={_comment} alt="Like Icon" />
                    </div>
                    <div className="notificationContent">
                        <PendingUser address={notification.fromAddress} />
                        <Typography.Text><PendingUserName address={notification.fromAddress} /> reply your buzz</Typography.Text>
                        <ReplyBuzz buzzId={notification.notifcationPin} replyPinId={notification.fromPinId} replyAddress={notification.fromAddress} userAddress={address} />
                    </div>
                </div>
            )
        case '/protocols/simplerepost':
            return (
                <div className="notificationItem">
                    <div className="notificationIcon">
                        <img src={_repost} alt="Like Icon" />
                    </div>
                    <div className="notificationContent">
                        <PendingUser address={notification.fromAddress} />
                        <Typography.Text><PendingUserName address={notification.fromAddress} /> forward your buzz</Typography.Text>
                        <ReplyBuzz buzzId={notification.notifcationPin} replyPinId={notification.fromPinId} replyAddress={notification.fromAddress} userAddress={address} />
                    </div>
                </div>
            )
        default:
            return null
    }



}