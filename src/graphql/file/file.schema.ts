import { gql } from "graphql-tag";

export const fileTypeDefs = gql`
  type File {
    id: ID!
    key: String!
    bucket: String!
    region: String!
    url: String!
    filename: String!
    mimeType: String!
    size: Int!
    uploaderId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    uploader: User
  }

  extend type Recipe {
    image: File
  }

  extend type RecipeGroup {
    image: File
  }
`;

