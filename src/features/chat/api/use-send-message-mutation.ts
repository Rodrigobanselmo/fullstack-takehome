import { gql, useMutation } from "@apollo/client";
import type {
  SendMessageMutation,
  SendMessageMutationVariables,
} from "generated/gql/graphql";
import { MESSAGES_QUERY } from "./use-query-messages";

const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input)
  }
`;

export function useSendMessageMutation() {
  return useMutation<SendMessageMutation, SendMessageMutationVariables>(
    SEND_MESSAGE_MUTATION,
    {
      refetchQueries: [MESSAGES_QUERY],
    },
  );
}
