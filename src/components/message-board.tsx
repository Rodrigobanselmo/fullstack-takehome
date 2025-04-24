"use client";

import { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";

// Define GraphQL operations
const HELLO_QUERY = gql`
  query HelloQuery {
    hello
  }
`;

const GET_MESSAGES = gql`
  query GetMessages {
    messages {
      id
      text
      createdAt
    }
  }
`;

const ADD_MESSAGE = gql`
  mutation AddMessage($text: String!) {
    addMessage(text: $text) {
      id
      text
      createdAt
    }
  }
`;

export function MessageBoard() {
  const [messageText, setMessageText] = useState("");
  
  // Query for hello message
  const { data: helloData } = useQuery(HELLO_QUERY);
  
  // Query for messages
  const { data: messagesData, loading, error, refetch } = useQuery(GET_MESSAGES);
  
  // Mutation for adding a message
  const [addMessage] = useMutation(ADD_MESSAGE, {
    onCompleted: () => {
      // Clear the input field and refetch messages
      setMessageText("");
      refetch();
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      addMessage({ variables: { text: messageText } });
    }
  };
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  
  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">GraphQL Demo</h2>
      
      {helloData && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold">Query Result:</h3>
          <p>{helloData.hello}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Enter a message"
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </form>
      
      <div>
        <h3 className="font-semibold mb-2">Messages:</h3>
        {messagesData?.messages.length === 0 ? (
          <p className="text-gray-500">No messages yet</p>
        ) : (
          <ul className="space-y-2">
            {messagesData?.messages.map((message: any) => (
              <li key={message.id} className="p-3 bg-gray-100 rounded-lg">
                <p>{message.text}</p>
                <p className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
