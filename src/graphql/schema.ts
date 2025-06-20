import { gql } from 'graphql-tag';
import { authTypeDefs } from './auth/auth.schema';

const baseTypeDefs = gql`
  type Query {
    _empty: String
  }
  
  type Mutation {
    _empty: String
  }
`;

export const typeDefs = [baseTypeDefs, authTypeDefs];