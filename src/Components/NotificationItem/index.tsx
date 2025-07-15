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
import BuzzOriginLink from "../Buzz/components/BuzzOriginLink";
import NotificationFooter from "./NotificationFooter";


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
                        <NotificationFooter item={notification} />
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
                        <Typography.Text><PendingUserName address={notification.fromAddress} /> reward your <BuzzOriginLink host={notification.notifcationHost} buzzId={notification.notifcationPin}><Typography.Link >buzz</Typography.Link></BuzzOriginLink></Typography.Text>
                        <RewardContent pinId={notification.fromPinId} />
                        <NotificationFooter item={notification} />
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
                        <Typography.Text><PendingUserName address={notification.fromAddress} /> liked your <BuzzOriginLink host={notification.notifcationHost} buzzId={notification.notifcationPin}><Typography.Link >buzz</Typography.Link></BuzzOriginLink></Typography.Text>
                        <SimpleBuzz buzzId={notification.notifcationPin} userAddress={address} host={notification.notifcationHost} />
                        <NotificationFooter item={notification} />
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
                        <Typography.Text><PendingUserName address={notification.fromAddress} /> reply your <BuzzOriginLink host={notification.notifcationHost} buzzId={notification.notifcationPin}><Typography.Link >buzz</Typography.Link></BuzzOriginLink></Typography.Text>
                        <ReplyBuzz buzzId={notification.notifcationPin} replyPinId={notification.fromPinId} replyAddress={notification.fromAddress} userAddress={address} host={notification.notifcationHost} type="comment"/>
                        <NotificationFooter item={notification} />
                    </div>
                </div>
            )
        case '/protocols/simplebuzz':
            return (
                <div className="notificationItem">
                    <div className="notificationIcon">
                        <img src={_repost} alt="Like Icon" />
                    </div>
                    <div className="notificationContent">
                        <PendingUser address={notification.fromAddress} />
                        <Typography.Text><PendingUserName address={notification.fromAddress} /> forward your <BuzzOriginLink host={notification.notifcationHost} buzzId={notification.notifcationPin}><Typography.Link >buzz</Typography.Link></BuzzOriginLink></Typography.Text>
                        <ReplyBuzz buzzId={notification.notifcationPin} replyPinId={notification.fromPinId} replyAddress={notification.fromAddress} userAddress={address} host={notification.notifcationHost} type="repost"  fromHost={notification.fromPinHost}/>
                        <NotificationFooter item={notification} />
                    </div>
                </div>
            )
        default:
            return null
    }



}