// this is showing you how you use it with react for example
// if your using node or something else you can import using
// @apollo/client/core!
import { apolloClient } from "../apollo-client";
import { gql } from "@apollo/client";

const CREATE_FOLLOW_TYPED_DATA = `
  mutation($request: FollowRequest!) {
    createFollowTypedData(request: $request) {
      id
      expiresAt
      typedData {
        domain {
          name
          chainId
          version
          verifyingContract
        }
        types {
          FollowWithSig {
            name
            type
          }
        }
        value {
          nonce
          deadline
          profileIds
          datas
        }
      }
    }
  }
`;

export const createFollowTypedData = (followRequestInfo) => {
  return apolloClient.mutate({
    mutation: gql(CREATE_FOLLOW_TYPED_DATA),
    variables: {
      request: {
        follow: followRequestInfo
      }
    }
  });
};
