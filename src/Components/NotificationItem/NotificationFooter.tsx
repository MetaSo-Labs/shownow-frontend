import { curNetwork } from "@/config";
import { Notification } from "@/utils/NotificationStore";
import { LinkOutlined } from "@ant-design/icons";
import { Button, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
type Props = {
    item: Notification
}
export default ({ item }: Props) => {
    return <Space>
        <Button
            size="small"
            type="link"
            icon={<LinkOutlined />}
            style={{
                fontSize: 12,
            }}
            onClick={(e) => {
                e.stopPropagation();

                const link =
                    item.fromPinChain === "btc"
                        ? `${curNetwork === "testnet"
                            ? "https://mempool.space/testnet/tx/"
                            : "https://mempool.space/tx/"
                        }${item.fromPinId.substring(0, item.fromPinId.length - 2)}`
                        : `https://${curNetwork === "testnet" ? "test" : "www"
                        }.mvcscan.com/tx/${item.fromPinId.substring(0, item.fromPinId.length - 2)}`;
                window.open(link, "_blank");
            }}
        >
            {item.fromPinId.slice(0, 8)}
        </Button>
        <Tag

            bordered={false}
            color={item.fromPinChain === "mvc" ? "blue" : "orange"}
        >
            {item.fromPinChain.toUpperCase()}
        </Tag>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs.unix(item.notifcationTime).format("YYYY-MM-DD HH:mm:ss")}
        </Typography.Text>
    </Space>
}