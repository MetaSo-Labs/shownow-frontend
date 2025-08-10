import axios from "axios";

import md5 from "md5";

export type ResultArray = {
  src: string;
  dst: string;
}[];

type TransResult = {
  from: string;
  to: string;
  trans_result: ResultArray;
  error_code: number;
};

type TransQuery = {
  q: string;
  from: string;
  to: string;
  appid: string;
  salt: string;
  sign: string;
};
export async function fetchTranlateResult({
  sourceText,
  from,
  to,
}: {
  sourceText: string;
  from: "zh" | "en";
  to: "zh" | "en";
}): Promise<TransResult | undefined> {
  const salt = new Date().getTime().toString();
  const queryParams: TransQuery = {
    q: sourceText,
    from,
    to,
    appid: "20191010000340428",
    salt,
    sign: md5("20191010000340428" + sourceText + salt + "08cmCzBLrp1l_fKQ9TL6"),
  };
  // const url = `https://fanyi-api.baidu.com/api/trans/vip/translate`;
  const url = `https://api.metaid.io/baidufanyi/api/trans/vip/translate`;
  // const url = `/api/trans/vip/translate`;

  try {
    const data = await axios
      .get(url, { params: queryParams })  
      .then((res) => res.data);
    return data;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
