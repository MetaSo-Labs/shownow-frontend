import { BASE_MAN_URL } from "@/config";
import { Avatar } from "antd";
import defaultAvatar from '@/assets/defaultAvatar.svg'

type Props = {
    src: string | null | undefined;
    size?: number;
    onClick?: (e:any) => void;
}
export default (
    {
        src,
        size = 40,
        onClick
    }: Props
) => {
    return <Avatar style={{
        minHeight: size,
        minWidth: size,
        maxHeight: size,
        maxWidth: size,
        border: "1px solid rgba(0, 0, 0, 0.06)"
    }} src={<img style={{

        objectFit: 'cover',
    }} src={src ? (src.startsWith('http') ? '' : BASE_MAN_URL) + src : defaultAvatar} onError={({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src = defaultAvatar;
    }}></img>} size={size}  onClick={onClick} alt="avatar" >

    </Avatar>
}