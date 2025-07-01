import { AVATAR_BASE_URL, BASE_MAN_URL, DEFAULT_AVATAR } from "@/config";
import { Avatar } from "antd";

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
    }} src={src ? (src.startsWith('http') ? '' : AVATAR_BASE_URL) + src : DEFAULT_AVATAR} onError={({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src = DEFAULT_AVATAR;
    }}></img>} size={size}  onClick={onClick} alt="avatar" >

    </Avatar>
}