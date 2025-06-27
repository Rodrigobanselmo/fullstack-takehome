import { gql, useQuery } from "@apollo/client";
import type {
  ConversationByParticipantsQuery,
  ConversationByParticipantsQueryVariables,
} from "generated/gql/graphql";

const JOB_CONVERSATION_QUERY = gql`
  query conversationByParticipants($contractorId: ID!, $homeownerId: ID!) {
    conversationByParticipants(
      contractorId: $contractorId
      homeownerId: $homeownerId
    ) {
      id
    }
  }
`;

export function useQueryJobConversation({
  contractorId,
  homeownerId,
}: {
  contractorId: string;
  homeownerId: string;
}) {
  return useQuery<
    ConversationByParticipantsQuery,
    ConversationByParticipantsQueryVariables
  >(JOB_CONVERSATION_QUERY, {
    variables: {
      contractorId,
      homeownerId,
    },
  });
}
