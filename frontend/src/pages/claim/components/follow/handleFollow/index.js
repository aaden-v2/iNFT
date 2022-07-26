import { signedTypeData, getAddressFromSigner, splitSignature } from "./ethers-service";
import { createFollowTypedData } from "./create-follow-typed-data";
import { lensHub } from "./lens-hub";

// lens contract info can all be found on the deployed
// contract address on polygon.
// not defining here as it will bloat the code example
export const handleFollow = async () => {
  // hard coded to make the code example clear
  const followRequest = [
    {
      profile: "0x0442"
      // },
      // {
      //   profile: "0x02",
      //   followModule: {
      //     feeFollowModule: {
      //       amount: {
      //         currency: "0xD40282e050723Ae26Aeb0F77022dB14470f4e011",
      //         value: "0.01"
      //       }
      //     }
      //   }
    }
  ];

  const result = await createFollowTypedData(followRequest);
  const typedData = result.data.createFollowTypedData.typedData;

  const signature = await signedTypeData(typedData.domain, typedData.types, typedData.value);
  const { v, r, s } = splitSignature(signature);
  // const hub = lensHub;
  // debugger;

  const tx = await lensHub.followWithSig({
    follower: getAddressFromSigner(),
    profileIds: typedData.value.profileIds,
    datas: typedData.value.datas,
    sig: {
      v,
      r,
      s,
      deadline: typedData.value.deadline
    }
  });
  console.log("tx.hash ---->", tx.hash);
  // 0x64464dc0de5aac614a82dfd946fc0e17105ff6ed177b7d677ddb88ec772c52d3
  // you can look at how to know when its been indexed here:
  //   - https://docs.lens.dev/docs/has-transaction-been-indexed
};

export default handleFollow;
