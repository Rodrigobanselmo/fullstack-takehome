import { GraphQLError } from "graphql";

export function JobNotFoundError() {
  return new GraphQLError("Job not found.", {
    extensions: {
      code: "JOB_NOT_FOUND",
      http: {
        status: 404,
      },
    },
  });
}
