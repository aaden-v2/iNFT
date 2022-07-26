import { useState, useEffect } from "react";
import { getNFTOwners } from "../util/util";
import AZUKI from "../assets/topNFTs/AZUKI.png";
import BAYC from "../assets/topNFTs/BAYC.png";
import MAYC from "../assets/topNFTs/MAYC.png";
import CLONEX from "../assets/topNFTs/CLONEX.png";
import CRYPTOPUNKS from "../assets/topNFTs/CRYPTOPUNKS.png";
import HAPE from "../assets/topNFTs/HAPE.png";
import DOODLES from "../assets/topNFTs/DOODLES.png";
import PHB from "../assets/topNFTs/PHB.png";
import LAND from "../assets/topNFTs/LAND.png";
import WOW from "../assets/topNFTs/WOW.png";

const nftImages = {
  AZUKI,
  BAYC,
  MAYC,
  CLONEX,
  CRYPTOPUNKS,
  HAPE,
  DOODLES,
  PHB,
  LAND,
  WOW
};
const topNFTKeys = [
  "AZUKI",
  "BAYC",
  "MAYC",
  "CLONEX",
  "CRYPTOPUNKS",
  "HAPE",
  "DOODLES",
  "PHB",
  "LAND",
  "WOW"
];
const contractConsts = {
  AZUKI: "0xed5af388653567af2f388e6224dc7c4b3241c544",
  BAYC: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
  MAYC: "0x60e4d786628fea6478f785a6d7e704777c86a7c6",
  CLONEX: "0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B",
  CRYPTOPUNKS: "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
  HAPE: "0x4Db1f25D3d98600140dfc18dEb7515Be5Bd293Af",
  DOODLES: "0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e",
  PHB: "0x67D9417C9C3c250f61A83C7e8658daC487B56B09",
  LAND: "0x50f5474724e0Ee42D9a4e711ccFB275809Fd6d4a",
  WOW: "0xe785e82358879f061bc3dcac6f0444462d4b5330"
};

const INVALID_TIME = 365 * 24 * 60 * 60 * 1000;
const CACHE_KEY = "topNFTs";
const LAST_FETCH_KET = "lastFetchTopNFTs";

const isCacheInvalid = async () => {
  const last = Number(await localStorage.getItem(LAST_FETCH_KET));
  if (!last) {
    return true;
  }
  return Date.now() > last + INVALID_TIME;
};

const useTopNFTs = () => {
  const [topNFTs, setTopNFTs] = useState([]);
  const fetchTopNFT = async () => {
    const results1 = await Promise.all(
      topNFTKeys.slice(0, 5).map(async (item) => {
        const nftOwners = await getNFTOwners(contractConsts[item]);
        return {
          key: item,
          image: nftImages[item],
          nftOwners
        };
      })
    );
    const results2 = await Promise.all(
      topNFTKeys.slice(5, 10).map(async (item) => {
        const nftOwners = await getNFTOwners(contractConsts[item]);
        return {
          key: item,
          image: nftImages[item],
          nftOwners
        };
      })
    );
    const results = [...results1, ...results2];
    localStorage.setItem(CACHE_KEY, JSON.stringify(results));
    localStorage.setItem(LAST_FETCH_KET, Date.now());

    setTopNFTs(results);
  };

  const getCachedTopNFTKeys = async () => {
    const isInvalid = await isCacheInvalid();
    if (isInvalid) {
      return;
    }
    const res = await localStorage.getItem("topNFTs");
    if (!res) {
      return;
    }
    return res;
  };

  useEffect(() => {
    getCachedTopNFTKeys().then((results) => {
      if (results) {
        setTopNFTs(JSON.parse(results));
        return;
      }
      return fetchTopNFT();
    });
  }, []);

  return { topNFTs };
};

export default useTopNFTs;
