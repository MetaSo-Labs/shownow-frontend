import { Pen } from "lucide-react";
import PendingUser from "../UserInfo/PendingUser";
import Popup from "../ResponPopup";
import { Button, Input, message, Select, Typography } from "antd";
import Decimal from "decimal.js";
import { useEffect, useMemo, useState } from "react";
import { useModel } from "umi";
import { determineAddressInfo, formatMessage, getEffectiveBTCFeerate } from "@/utils/utils";
import _btc from "@/assets/btc.png";
import _mvc from "@/assets/mvc.png";
import { getMvcBalance, getUtxoBalance } from "@/utils/psbtBuild";
import { curNetwork, FLAG } from "@/config";
import { isNil } from "lodash";


type Props = {
    show: boolean;
    onClose: () => void;
    callback: () => void;
    pinId: string;
    donateAddress: string;

}
export default ({ show, onClose, callback, pinId, donateAddress }: Props) => {
    const { user, chain, isLogin, checkUserSetting, btcConnector, mvcConnector, feeRate, mvcFeeRate } = useModel('user');
    const { showConf, fetchServiceFee } = useModel('dashboard');
    const [donateAmount, setDonateAmount] = useState('');
    const [donateMessage, setDonateMessage] = useState('');
    const [balance, setBalance] = useState<number>(0);
    const [paying, setPaying] = useState(false);
    const [selectedChain, setSelectedChain] = useState<string>(
        determineAddressInfo(donateAddress) === 'p2pkh' ? chain : 'btc'
    );

    useEffect(() => {
        const fetchBalance = async () => {
            if (isLogin && selectedChain === "btc") {
                try {
                    const bal = await getUtxoBalance();
                    setBalance(bal);
                } catch (e) {
                    console.error("Failed to fetch balance:", e);
                }
            } else if (isLogin && selectedChain === "mvc") {
                try {
                    const bal = await getMvcBalance();
                    setBalance(bal);
                } catch (e) {
                    console.error("Failed to fetch balance:", e);
                }
            }
        };
        fetchBalance();
    }, [isLogin, selectedChain]);

    const isLegacy = useMemo(() => {
        return determineAddressInfo(donateAddress) === 'p2pkh'
    }, [donateAddress])

    const onDonate = async () => {
        if (!isLogin) {
            message.error(formatMessage("Please connect your wallet first"));
            return;
        }
        const isPass = checkUserSetting();
        if (!isPass) return;

        if (!donateAmount || parseFloat(donateAmount) <= 0) {
            message.error("Please enter a valid amount");
            return;
        }

        setPaying(true);
        try {
            if (selectedChain === "btc") {
                const donateEntity = await btcConnector!.use("simpledonate");
                const donateRes = await donateEntity.create({
                    dataArray: [
                        {
                            body: JSON.stringify({
                                createTime: Date.now().toString(),
                                to: donateAddress,
                                coinType: chain,
                                amount: donateAmount,
                                toPin: pinId,
                                message: donateMessage,
                            }),
                            flag: FLAG,
                            contentType: "application/json;utf-8",
                            path: `${showConf?.host || ""}/protocols/simpledonate`,
                        },
                    ],
                    options: {
                        noBroadcast: "no",
                        feeRate: getEffectiveBTCFeerate(Number(feeRate)),
                        outputs: [
                            {
                                address: donateAddress,
                                satoshis: new Decimal(donateAmount).times(1e8).toString(),
                            },
                        ],
                        service: fetchServiceFee("donate_service_fee_amount", "BTC"),
                    },
                });
                if (donateRes.status) {
                    throw new Error(donateRes.status)
                }

                if (!isNil(donateRes?.revealTxIds[0])) {
                    message.success("Donate successfully");
                    onClose();
                    callback && callback();
                    setDonateAmount("");
                    setDonateMessage("");
                }
            } else if (selectedChain === "mvc") {
                console.log(chain);

                const donateEntity = (await mvcConnector!.use("simpledonate"));
                console.log(donateEntity, 'donateEntity');
                const donateRes = await donateEntity.create({
                    data: {
                        body: JSON.stringify({
                            createTime: Date.now().toString(),
                            to: donateAddress,
                            coinType: chain,
                            amount: donateAmount,
                            toPin: pinId,
                            message: donateMessage,
                        }),
                        flag: FLAG,
                        contentType: "application/json;utf-8",
                        path: `${showConf?.host || ""}/protocols/simpledonate`,
                    },
                    options: {
                        network: curNetwork,
                        signMessage: "donate buzz",
                        service: fetchServiceFee("donate_service_fee_amount", "MVC"),
                        outputs: [
                            {
                                address: donateAddress,
                                satoshis: new Decimal(donateAmount).times(1e8).toString(),
                            },
                        ],
                    },
                })

                console.log(donateRes, 'donateRes');



                if (!isNil(donateRes?.txid)) {
                    message.success("Donate successfully");
                    onClose();
                    callback && callback();
                    setDonateAmount("");
                    setDonateMessage("");
                }
            } else {
                throw new Error("Donate not supported on this chain");
            }
        } catch (error: unknown) {
            const errorMessage = (error as any)?.message ?? error;
            const toastMessage = errorMessage?.includes(
                'Cannot read properties of undefined'
            )
                ? 'User Canceled'
                : errorMessage;
            message.error(toastMessage);
        }
        setPaying(false);
    };

    return <Popup
        show={show}
        bodyStyle={{
            padding: 40,
        }}
        onClose={onClose}
        closable
        modalWidth={680}
    >
        <PendingUser address={donateAddress} />

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
                                value={selectedChain}
                                onChange={(value) => setSelectedChain(value)}
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
                                variant='borderless'
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

    </Popup>
}