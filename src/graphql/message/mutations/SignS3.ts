import { gql } from "apollo-boost";

export const SIGN_S3 = gql`
  mutation SignS3($files: [ImageSubInput!]!) {
    signS3(files: $files) {
      signatures {
        url
        signedRequest
      }
    }
  }
`;
