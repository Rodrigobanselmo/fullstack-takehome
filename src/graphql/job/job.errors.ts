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

export function JobNotContractorError() {
  return new GraphQLError("You are not the contractor of this job.", {
    extensions: {
      code: "JOB_NOT_CONTRACTOR",
      http: {
        status: 403,
      },
    },
  });
}
