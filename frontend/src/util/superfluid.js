import React, { useState } from "react";
import { Framework } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";

const token = "0x96b82b65acf7072efeb00502f45757f254c2a0d4"; // MATICx
const networkName = "mumbai";
const url = "https://rpc-mumbai.maticvigil.com/";
const customHttpProvider = new ethers.providers.JsonRpcProvider(url);
const indexCreated = 2;

//where the Superfluid logic takes place
const superfluidPay = async () => {
  const flowRate = BigInt(Math.floor((1 / 6 / 6 / 24 / 3) * 100000000000000)); // 0.1Maticx / month flowRate is wei/second
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const sf = await Framework.create({
    networkName: "mumbai",
    provider: provider
  });

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  const address = accounts[0];
  const signer = provider.getSigner();
  const receiver = "0xaA52010Fbf7CC209f7A06353f9769aCe2F3920A3";
  try {
    const createIndexOperation = sf.idaV1.createIndex({
      indexId: indexCreated,
      superToken: token
    });
    console.log("Creating your Index...");

    // const createFlowOperation = sf.cfaV1.createFlow({
    //   sender: address,
    //   receiver: receiver,
    //   flowRate: flowRate,
    //   superToken: token,
    //   // userData?: string
    //   overrides: {
    //     gasLimit: 1000000,
    //     gasPrice: 3e9
    //   }
    // });

    // console.log("Creating your stream...");

    // const result = await createFlowOperation.exec(signer);
    const result = await createIndexOperation.exec(signer);
    console.log(result);

    // console.log(
    //   `Congrats - you've just created a money stream!
    // View Your Stream At: https://app.superfluid.finance/dashboard/${receiver}
    // Network: mumbai
    // Super Token: Maticx
    // Sender: ${address},
    // Receiver: ${receiver},
    // FlowRate: ${flowRate}
    // `
    // );
    console.log(
      `Congrats - you've just created a new Index!
         Network: mumbai
         Super Token: Maticx
         Index ID: ${indexCreated}
      `
    );
  } catch (error) {
    console.log(
      "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
    );
    console.error(error);
  }
};

const updateSubscription = async () => {
  const sf = await Framework.create({
    networkName: networkName,
    provider: customHttpProvider
  });

  const signer = sf.createSigner({
    privateKey: "6cc198b1283c744756680beb238e177b822fdc85ba9cfbabe8d1da59af261943",
    provider: customHttpProvider
  });

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  const address = accounts[0];

  try {
    const updateSubscriptionOperation = sf.idaV1.updateSubscriptionUnits({
      indexId: indexCreated,
      superToken: token,
      subscriber: address,
      units: 1
      // userData?: string
    });

    console.log("Updating your Index...");

    await updateSubscriptionOperation.exec(signer);

    console.log(
      `Congrats - you've just updated an Index!
      Network: mumbai
      Super Token: Maticx
         Index ID: ${indexCreated}
         Subscriber: ${address}
         Units: 1 units
      `
    );
  } catch (error) {
    console.error(error);
  }
};

export { superfluidPay, updateSubscription };
