import { ApolloError } from "@apollo/client";

interface ServerParseError {
  result?: {
    errors?: Array<{ message: string }>;
  };
  statusCode?: number;
  message?: string;
}

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

    // Check for network errors - they might contain GraphQL errors in the result
    if (error.networkError) {
      const networkError = error.networkError as ServerParseError;

      // Check if the network error contains GraphQL errors in the result
      if (networkError.result?.errors && networkError.result.errors.length > 0) {
        const messages = networkError.result.errors
          .map((err) => err.message)
          .filter(Boolean);

        if (messages.length > 0) {
          return messages.join(", ");
        }
      }

      // Fallback to network error message
      return networkError.message || "Network error occurred";
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

