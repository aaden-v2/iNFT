import React, { useState, useEffect, useRef } from "react";
import BurnModal from "../../components/BurnModal";
import { get, post } from "../../network";
import { Pagination, Card, Avatar, Spin, Popover, message, Empty } from "antd";
import {
  // CalendarOutlined,
  TwitterOutlined,
  BlockOutlined,
  ArrowRightOutlined
} from "@ant-design/icons";
import { useWallet } from "../../hooks/useWallet";
import { handleError, handleAddress } from "../../util/util";
// import dayjs from "dayjs";
import { ethers } from "ethers";
import NAFTADABI from "../../abi/NFTAD.json";
import Follow from "./components/follow/index";

import "./index.css";

const { Meta } = Card;

const INITIAL_PAGE = 1;
const INITIAL_PAGE_SIZE = 8;
const NFTADAddress = "0xE15A0940Bc6F4cB555733DB33661dd20b0Cbe993";
const INITIAL_NFTTokenID = 0;

const Claim = () => {
  const { walletState } = useWallet();
  const { address, isLogin } = walletState;
  const [dropList, setDropList] = useState([]);
  const [page, setPage] = useState(INITIAL_PAGE);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [isBurnModalVisible, setIsBurnModalVisible] = useState(false);
  const [nftTokenID, setNftTokenID] = useState(INITIAL_NFTTokenID);
  const tokenIds = useRef([]);

  const clickToBurn = (tokenId) => {
    setNftTokenID(tokenId);
    setIsBurnModalVisible(true);
  };
  const handleBurnModalClose = () => {
    setIsBurnModalVisible(false);
  };
  const postTwitter = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const NFTADContract = new ethers.Contract(NFTADAddress, NAFTADABI, signer);
    const randomNum = await NFTADContract.getRandomResult();
    console.log(randomNum);
    window.open(
      "https://twitter.com/intent/tweet?text=Come%20and%20Join%20NFT%20Ads%20to%20gain%20benifits%20together%20with%20advertisor.%20%F0%9F%94%A5%F0%9F%94%A5%20https://nftads.info/%20ramdom hash: " +
        randomNum,
      "_blank"
    );
  };

  const jumpToOpensea = (tokenId) => {
    if (!tokenId) return;
    // const url = `https://testnets.opensea.io/assets/mumbai/${NFTADAddress}/${tokenId}`;
    const url = 'https://testnets.opensea.io/assets/mumbai/0x2953399124f0cbb46d2cbacd8a89cf0599974963/77038073044778630494831988387293518801844021017408144300324123197403249508353'
    window.open(url, "_blank");
  };

  const getTokenIds = async () => {
    if (!address) {
      message.warning("need login");
    }
    try {
      setLoading(true);
      const { data } = await get(`/api/tokens/all`, { headers: { address } });
      const { tokenIds } = data;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const NFTADContract = new ethers.Contract(NFTADAddress, NAFTADABI, signer);
      const result = await NFTADContract.balanceOfBatch(
        new Array(tokenIds.length).fill(address),
        tokenIds
      );
      const ownedTokenIds = result.reduce((pre, el, i) => {
        Boolean(Number(el)) && pre.push(tokenIds[i]);
        return pre;
      }, []);
      tokenIds.current = ownedTokenIds;
      setTotal(ownedTokenIds.length);
      return ownedTokenIds;
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getDropList = async ({ page, pageSize, address, ids }) => {
    if (!address) {
      message.warning("need login");
    }
    ids = Boolean(ids?.length) ? ids : tokenIds.current;
    if (ids.length <= 0) {
      return;
    }
    try {
      setLoading(true);
      const res = await post(
        "/api/tokens/batch",
        {
          tokenIds: ids.slice((page - 1) * pageSize, page * pageSize)
        },
        { headers: { address } }
      );
      setDropList(res.data.tokens);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!address || !isLogin) {
      return;
    }
    const init = async () => {
      const ids = await getTokenIds();
      await getDropList({ page: INITIAL_PAGE, pageSize: INITIAL_PAGE_SIZE, address, ids });
    };
    init();
  }, [address, isLogin]);

  return (
    <Spin spinning={loading}>
      <div className="drop-list-container">
        {dropList.map((item) => (
          <Card
            className="drop-list-card-wrapper"
            key={item.tokenId}
            cover={<img alt={item.tokenId} src={item.imgUrl} className="drop-record-img" />}
            actions={[
              // <Popover content={`create at ${dayjs(item.createAt).format("YYYY-MM-DD HH:mm:ss")}`}>
              //   <CalendarOutlined key="calendar" />
              // </Popover>,
              <Popover content={"post twitter"}>
                <TwitterOutlined key="twitter" onClick={postTwitter} />
              </Popover>,
              <Follow />,
              <BlockOutlined key="block" onClick={() => clickToBurn(item.tokenId)} />,
              <Popover content={"to opensea"}>
                <ArrowRightOutlined key="opensea" onClick={() => jumpToOpensea(item.tokenId)} />
              </Popover>
            ]}
          >
            <Meta
              avatar={<Avatar src="/favicon.png" />}
              title={handleAddress(item.address)}
              description={
                <Popover
                  content={<div className="drop-list-description-detail">{item.description}</div>}
                  placement="topLeft"
                >
                  <div className="drop-list-description">{item.description}</div>
                </Popover>
              }
            />
          </Card>
        ))}
      </div>
      {dropList.length > 0 ? (
        <div className="drop-list-pagination">
          <Pagination
            showSizeChanger
            current={page}
            total={total}
            pageSize={pageSize}
            pageSizeOptions={[4, 8, 12, 16, 20]}
            onChange={(page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
              getDropList({ page, pageSize, address });
            }}
          />
        </div>
      ) : (
        <Empty />
      )}
      <BurnModal
        isModalVisible={isBurnModalVisible}
        handleClose={handleBurnModalClose}
        nftTokenID={nftTokenID}
      />
    </Spin>
  );
};

export default Claim;
