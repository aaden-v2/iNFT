import React, { useState, useEffect } from "react";
import { get } from "../../../network";
import { Pagination, Card, Avatar, Spin, Popover, message, Progress, Empty } from "antd";
// import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { useWallet } from "../../../hooks/useWallet";
import { handleError, handleAddress } from "../../../util/util";

import "./index.css";

const { Meta } = Card;

const INITIAL_PAGE = 1;
const INITIAL_PAGE_SIZE = 4;

const DropHistory = () => {
  const { walletState } = useWallet();
  const { address, isLogin } = walletState;
  const [dropList, setDropList] = useState([]);
  const [page, setPage] = useState(INITIAL_PAGE);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const getDropList = async (page, pageSize, address) => {
    if (!address) {
      message.warning("need login");
    }
    try {
      setLoading(true);
      const { data } = await get(`/api/tokens/page/${page}/pageSize/${pageSize}/`, {
        headers: { address }
      });
      const { total = 0, tokens = [] } = data;
      setTotal(total);
      setDropList(tokens);
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
    getDropList(INITIAL_PAGE, INITIAL_PAGE_SIZE, address);
  }, [address, isLogin]);

  return (
    <Spin spinning={loading}>
      <div className="drop-list-container">
        {dropList.map((item) => {
          const percent = Math.floor(Math.random() * 100);
          return (
            <Card
              className="drop-list-card-wrapper"
              key={item.tokenId}
              cover={<img alt={item.tokenId} src={item.imgUrl} className="drop-record-img" />}
              // actions={[
              //     <SettingOutlined key="setting" />,
              //     <EditOutlined key="edit" />,
              //     <EllipsisOutlined key="ellipsis" />,
              // ]}
              actions={[
                <Progress
                  percent={percent > 80 ? 100 : percent}
                  status={percent > 80 ? "success" : "active"}
                  style={{ padding: "0.2rem 1rem" }}
                />
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
          );
        })}
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
              getDropList(page, pageSize, address);
            }}
          />
        </div>
      ) : (
        <Empty />
      )}
    </Spin>
  );
};

export default DropHistory;
