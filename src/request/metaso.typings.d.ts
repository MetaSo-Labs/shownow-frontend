declare namespace MS {
  interface IRet<T> {
    data: T;
    code: number;
    message: string;
  }
  type AreaInfo = {
    currentReward: string;
    currentExpectedMetaBlockReward: string;
    totalAcquisitionReward: string;
    lastMetaBlockShare: string;
    lastMetaBlockReward: string;
    lastReward: string;
    pendingReward: string;
    scale: string;
    totalReward: string;
  };
  type CoinSummary = {
    isActive: boolean;
    activeMetaBlockHeight: number;
    tickId: string;
    tick: string;
    tokenName: string;
    totalSupply: string;
    circulatingSupply: string;
    price: string;
    priceUsd: string;
    marketCap: string;
    marketCapUsd: string;
    priceChange24h: string;
    marketCapChange24h:string
  };

  type MetaBlock = {
    mdvDeltaValue: number;
    mdvDeltaValueStr: string;
    mdvValue: number;
    mdvValueStr: string;
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
    currentMdvDeltaValueStr: string;
    ownMdvDeltaValue: number;
    ownMdvDeltaValueStr: string;
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
