import React, { useState } from "react";
import { Upload, Modal, Form, Input, Button, Checkbox, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import NAFTADABI from "../../abi/NFTAD.json";

import { closeIcon } from "../../assets/icons";
import { post, HOST } from "../../network";
import useTopNFTs from "../../hooks/useTopNFTs";
import { DropDefaultDescription, IPFS_HOST } from "../../util/constant";
import { handleError, getBase64 } from "../../util/util";
import { superfluidPay } from "../../util/superfluid";
import { create } from "ipfs-http-client";

import "./index.css";

const ipfsClient = create({
  protocol: "https",
  host: IPFS_HOST,
  port: 5001,
  headers: {
    Authorization: `Basic ${btoa("27ayHM2Z1ob8olLVsAIdCqpOrvA:5d527e85ef9828937c5be0f38ef3ca34")}`
  }
});

function StartModal(props) {
  const { handleClose, address, validateMetamask } = props;
  const [form] = Form.useForm();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const { TextArea } = Input;
  const { topNFTs } = useTopNFTs();
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    setPreviewVisible(false);
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf("/") + 1));
  };

  const uploadFile = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("fileName", file.name);
    const res = await post("/api/upload", data, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }).catch((error) => handleError(error, "ipfs upload"));
    return res.data.fileName;
  };

  const addRecord = async ({ imgUrl, description }) => {
    const uploadUrl = `/api/tokens/`;
    try {
      const res = await post(
        uploadUrl,
        {
          image_url: imgUrl,
          description: description
        },
        { headers: { address } }
      );
      return res.data.data.id;
    } catch (error) {
      handleError(error, "upload");
    }
  };

  const packOptions = topNFTs.map(({ key, nftOwners, image }) => {
    return {
      label: <img src={image} alt={key} className="App__owners-package-nft-image" />,
      value: nftOwners?.join()
    };
  });

  const getAllRecipients = () => {
    const packs = form.getFieldValue("pack");
    const recs = form.getFieldValue("recipients").split("\n");
    const allRecipients = packs
      .join()
      .split(",")
      .concat(Array.from(new Set(recs)))
      .filter(Boolean);
    return allRecipients;
  };

  const handlePay = async () => {
    if (!validateMetamask()) {
      return;
    }
    try {
      setLoading(true);
      const { upload, description } = await form.validateFields();
      const [file] = upload;
      const add = await ipfsClient.add(file.thumbUrl);
      const imgUrl = `${HOST}/api/ipfs/${add.path}`;
      const tokenId = await addRecord({ imgUrl, description });

      const NFTADAddress = "0xdCaEB6A15d53F6A03893a8a841213ce57a2EcB94";
      const allRecipients = getAllRecipients();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const NFTADContract = new ethers.Contract(NFTADAddress, NAFTADABI, signer);
      const fees = (0.1 * allRecipients.length).toString();
      const value = ethers.utils.parseEther(fees);
      const options = {
        value,
        gasLimit: 1000000
      };
      await NFTADContract.mintToMany(allRecipients, tokenId, 1, options);
      post("/api/tokens/confirm", { tokenId }, { headers: { address } });

      await superfluidPay();
      alert("Success!");
      handleClose();
    } catch (error) {
      handleError(error, "pay");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App__modal App__about-modal-wrapper" data-visible={props.isModalVisible}>
      {address ? (
        <div className="App__modal-content" style={{ overflow: "scroll" }}>
          <Spin spinning={loading}>
            <div className="App__modal-title">
              <span>Send to many recipients</span>
              <span className="App__modal-close" onClick={handleClose}>
                {closeIcon}
              </span>
            </div>
            <div className="App__modal-body">
              <div className="App__modal-start-description">
                Input any token address and then batch transfer tokens to many different recipients
                in a single tx.
              </div>
              <div className="App__modal-start-body">
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{ pack: [], recipients: "" }}
                  onFinish={handlePay}
                >
                  <Form.Item
                    label="UPLOAD A PICTURE"
                    name="upload"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                    rules={[{ required: true }]}
                  >
                    <Upload
                      maxCount={1}
                      accept=".png,.jpg,.jpeg,.bmp,.svg,.svgz,.webp,.gif,.tif,.ico"
                      listType="picture-card"
                      beforeUpload={() => false}
                      onPreview={handlePreview}
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    </Upload>
                  </Form.Item>
                  <Form.Item
                    label="RECIPIENTS"
                    name="recipients"
                    rules={[
                      {
                        required: true
                      }
                    ]}
                  >
                    <TextArea
                      placeholder={[
                        "0xABCDFA1DC112917c781942Cc01c68521c415e",
                        "0x00192Fb10dF37c9FB26829eb2CC623cd1BF599E8",
                        "0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c",
                        "0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8",
                        "...",
                        "use newline to split multiple addresses"
                      ].join("\n")}
                      rows={10}
                    />
                  </Form.Item>
                  <Form.Item label="CHOOSE CROWED PACK OF THE NFT" name="pack">
                    {packOptions.length > 0 ? (
                      <Checkbox.Group
                        options={packOptions}
                        className="App__owners-packages"
                        onChange={(value) => form.setFields([{ value, name: "pack" }])}
                      />
                    ) : (
                      <Spin />
                    )}
                  </Form.Item>
                  <Form.Item label="DESCRIPTION" name="description">
                    <TextArea placeholder={DropDefaultDescription} rows={8} />
                  </Form.Item>
                  <Form.Item
                    label="CONFIRMATION DETAILS"
                    shouldUpdate={(prevValues, curValues) =>
                      prevValues.pack !== curValues.pack ||
                      prevValues.recipients !== curValues.recipients
                    }
                  >
                    {() => {
                      const num = getAllRecipients().length;
                      return (
                        <div>
                          <div>0.1Matic/Per</div>
                          <div>
                            now you have select{" "}
                            <span style={{ color: "#FF5733", fontWeight: "bold" }}>{num}</span>{" "}
                            address
                          </div>
                        </div>
                      );
                    }}
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Pay
                    </Button>
                  </Form.Item>
                </Form>
                <Modal
                  visible={previewVisible}
                  title={previewTitle}
                  footer={null}
                  onCancel={handleCancel}
                >
                  <img alt="example" style={{ width: "100%" }} src={previewImage} />
                </Modal>
              </div>
            </div>
          </Spin>
        </div>
      ) : (
        <div className="App__modal-content">
          <div className="App__modal-title">
            <span>Attention</span>
            <span className="App__modal-close" onClick={handleClose}>
              {closeIcon}
            </span>
          </div>
          <div className="App__modal-body">Please connect to the wallet first!</div>
        </div>
      )}
    </div>
  );
}

export default StartModal;
