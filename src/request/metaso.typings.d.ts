declare namespace MS {
  interface IRet<T> {
    data: T;
    code: number;
    message: string;
  }
  type AreaInfo = {
    currentReward: string;
    lastReward: string;
    pendingReward: string;
    scale: string;
    totalReward: string;
  };
  type CoinSummary = {
    tickId: string;
    tick: string;
    tokenName: string;
    totalSupply: string;
    circulatingSupply: string;
    price: string;
    priceUsd: string;
    marketCap: string;
    marketCapUsd: string;
  };

  type MetaBlock = {
    mdvDeltaValue: number;
    mdvValue: number;
    metaBlockHash: string;
    metaBlockHeight: number;
    metaBlockTime: number;
    totalPin: number;
    totalSize: number;
  };
  type MetaBlockAreaInfo = {
    currentBlockHeight: number;
    currentMetaBlockHeight: number;
    currentTxCount: number;
    currentPins: number;
    currentMdvDeltaValue: number;
    ownMdvDeltaValue: number;
    progressBlockCount: number;
    progressBlockTotal: number;
  };
  type ClaimPreRes = {
    claimAmount: string;
    minerFee: number;
    minerGas: number;
    minerOutValue: number;
    orderId: string;
    receiveAddress: string;
    serviceFee: number;
    totalFee: number;
  };
  type ClaimCommitRes = {
    commitTxId: string;
    orderId: string;
    revealTxId: string;
    tickId: string;
    txId: string;
  };
}
