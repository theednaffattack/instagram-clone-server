import { gql } from "apollo-boost";

export const GET_ALL_MY_MESSAGES = gql`
  query GetAllMyMessages {
    getAllMyMessages {
      id
      firstName
      lastName
      mappedMessages {
        id
        created_at
        updated_at
        message
        sentBy {
          id
          firstName
          lastName
        }
        user {
          id
          firstName
          lastName
        }
      }
    }
  }
`;
