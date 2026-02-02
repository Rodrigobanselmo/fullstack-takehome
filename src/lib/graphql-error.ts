import { ApolloError } from "@apollo/client";

/**
 * Extracts a user-friendly error message from an Apollo GraphQL error
 * @param error - The error object from Apollo Client
 * @returns A formatted error message string
 */
export function extractGraphQLErrorMessage(error: unknown): string {
  if (error instanceof ApolloError) {
    // Check for GraphQL errors first (validation errors, business logic errors, etc.)
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      // Get all error messages from GraphQL errors
      const messages = error.graphQLErrors
        .map((gqlError) => gqlError.message)
        .filter(Boolean);
      
      if (messages.length > 0) {
        return messages.join(", ");
      }
    }

    // Check for network errors
    if (error.networkError) {
      return `Network error: ${error.networkError.message}`;
    }

    // Fallback to the error message
    if (error.message) {
      return error.message;
    }
  }

  // Handle regular Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback for unknown error types
  return "An unexpected error occurred";
}

