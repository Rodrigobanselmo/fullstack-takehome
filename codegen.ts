// codegen.ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: ["src/graphql/**/*.schema.ts"],
  documents: ["src/**/*.tsx", "src/**/*.ts"],
  generates: {
    "generated/gql/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
      },
      config: {
        scalars: {
          DateTime: "Date",
        },
        useTypeImports: true,
      },
    },
  },
  ignoreNoDocuments: true,
  hooks: {
    afterAllFileWrite: ["eslint --fix", "prettier --write"],
  },
};

export default config;
