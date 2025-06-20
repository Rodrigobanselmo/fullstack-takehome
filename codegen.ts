import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: ["src/graphql/**/*.schema.ts"], 
  documents: ["src/**/*.tsx", "src/**/*.ts"],
  generates: {
    "generated/gql/": { 
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
  ignoreNoDocuments: true,
  hooks: {
    afterAllFileWrite: ["eslint --fix", "prettier --write"]
  }
};

export default config;