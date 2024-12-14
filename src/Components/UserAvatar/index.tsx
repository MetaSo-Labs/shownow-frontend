import { BASE_MAN_URL } from "@/config";
import { Avatar } from "antd";
import defaultAvatar from '@/assets/defaultAvatar.svg'

type Props = {
    src: string | null | undefined;
    size?: number;
}
export default (
    {
        src,
        size = 40
    }: Props
) => {
    return <Avatar style={{
        minHeight: size,
        minWidth: size,
        maxHeight: size,
        maxWidth: size,
    }} src={<img style={{

        objectFit: 'cover',
    }} src={src ? (src.startsWith('http') ? '' : BASE_MAN_URL) + src : defaultAvatar} onError={({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src = defaultAvatar;
    }}></img>} size={size} >

    </Avatar>
}