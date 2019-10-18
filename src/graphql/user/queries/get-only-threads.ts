import { gql } from "apollo-boost";

export const GET_ONLY_THREADS = gql`
  query GetOnlyThreads($feedinput: FeedInput!) {
    getOnlyThreads(feedinput: $feedinput) {
      edges {
        node {
          created_at
          updated_at
          last_message
          message_count
          id
          invitees {
            id
            firstName
            lastName
          }
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
