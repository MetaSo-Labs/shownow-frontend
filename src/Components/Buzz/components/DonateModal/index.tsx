import { Button, Input, Typography, Select } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import Decimal from "decimal.js";
import UserAvatar from "../../../UserAvatar";
import Unlock from "../../../Unlock";
import _btc from "@/assets/btc.png";
import _mvc from "@/assets/mvc.png";

interface DonateModalProps {
  show: boolean;
  isLegacy: boolean;
  onClose: () => void;
  userInfo?: {
    avatar?: string | null;
    name?: string | null;
    metaid?: string | null;
  };
  balance: number;
  chain: string;
  setChain?: (chain: string) => void;
  paying: boolean;
  donateAmount: string;
  donateMessage: string;
  setDonateAmount: (amount: string) => void;
  setDonateMessage: (message: string) => void;
  onDonate: () => void;
}

const DonateModal: React.FC<DonateModalProps> = ({
  show,
  isLegacy,
  onClose,
  userInfo,
  balance,
  chain,
  setChain,
  paying,
  donateAmount,
  donateMessage,
  setDonateAmount,
  setDonateMessage,
  onDonate,
}) => {
  return (
    <Unlock
      show={show}
      bodyStyle={{
        padding: "0 16px",
      }}
      onClose={onClose}
    >
      <div style={{ position: "absolute", right: 16, top: 16, zIndex: 10 }}>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          style={{
            width: 40,
            height: 40,
            display: "flex",
            borderRadius: "50%",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="hover-bg-button"
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          width: "100%",
          padding: "30px 0",
        }}
      >
        <UserAvatar src={userInfo?.avatar} size={60} />
        <Typography.Title
          level={3}
          style={{ margin: 0, fontSize: 24, fontWeight: 600 }}
        >
          {userInfo?.name || "Unnamed"}
        </Typography.Title>
        <Typography.Text style={{ fontSize: 14, color: "rgba(0, 0, 0, 0.45)" }}>
          MetaID:{" "}
          {userInfo?.metaid
            ? `${userInfo.metaid.slice(0, 8)}...${userInfo.metaid.slice(-4)}`
            : ""}
        </Typography.Text>

        <div style={{ width: "100%", marginTop: 12 }}>
          <div style={{ position: "relative" }}>
            <Typography.Title
              level={4}
              style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 600 }}
            >
              Reward amount
            </Typography.Title>
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                color: "rgba(0, 0, 0, 0.45)",
                fontSize: 14,
              }}
            >
              Availabile {new Decimal(balance).div(1e8).toFixed(8)}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                gap: "12px",
                padding: "16px",
                marginBottom: "32px",
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div style={{ flex: "1 1 0%", minWidth: 0, overflow: "hidden" }}>
                <Input
                  placeholder="Enter amount"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(e.target.value)}
                  style={{
                    border: "none",
                    boxShadow: "none",
                    fontSize: 16,
                    padding: 0,
                    color: "rgba(0, 0, 0, 0.88)",
                    width: "100%",
                  }}
                />
              </div>
              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#F5F5F5",
                  padding: "4px 12px",
                  borderRadius: "20px",
                }}
              >
                {isLegacy ? (
                  <Select
                    value={chain}
                    onChange={(value) => setChain?.(value)}
                    style={{ width: 100 }}
                    options={[
                      {
                        value: 'btc',
                        label: (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <img src={_btc} alt="BTC" width={20} height={20} />
                            <span>BTC</span>
                          </div>
                        ),
                      },
                      {
                        value: 'mvc',
                        label: (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <img src={_mvc} alt="MVC" width={20} height={20} />
                            <span>MVC</span>
                          </div>
                        ),
                      },
                    ]}
                    // bordered={false}
                    variant="borderless"
                    dropdownStyle={{ minWidth: 120 }}
                  />
                ) : (
                  <>
                    <img
                      src={_btc}
                      alt="BTC"
                      width={20}
                      height={20}
                      style={{ flexShrink: 0 }}
                    />
                    <Typography.Text
                      style={{
                        fontSize: 14,
                        margin: 0,
                        color: "rgba(0, 0, 0, 0.88)",
                      }}
                    >
                      BTC
                    </Typography.Text>
                  </>
                )}
              </div>
            </div>

            <Typography.Title
              level={4}
              style={{
                margin: "24px 0 16px 0",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Message
            </Typography.Title>
            <div
              style={{
                width: "100%",
                padding: "16px",
                marginBottom: "32px",
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Input.TextArea
                placeholder="Enter message"
                value={donateMessage}
                onChange={(e) => setDonateMessage(e.target.value)}
                style={{
                  border: "none",
                  boxShadow: "none",
                  fontSize: 16,
                  padding: 0,
                  color: "rgba(0, 0, 0, 0.88)",
                  width: "100%",
                  resize: "none",
                }}
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                type="primary"
                block
                size="large"
                shape="round"
                loading={paying}
                onClick={onDonate}
                style={{
                  width: "220px",
                  height: "52px",
                  background:
                    "linear-gradient(270deg, #F824DA 0%, #FF5815 100%)",
                  border: "none",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Unlock>
  );
};

export default DonateModal;
