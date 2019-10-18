import { gql } from "apollo-boost";

export const GET_MESSAGE_THREADS = gql`
  query GetMessagesByThreadId($input: GetMessagesByThreadIdInput!) {
    getMessagesByThreadId(input: $input) {
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          id
          created_at
          message
          images {
            id
            uri
          }
          user {
            id
            firstName
            lastName
          }
          sentBy {
            id
            firstName
            lastName
          }
        }
      }
    }
  }
`;
