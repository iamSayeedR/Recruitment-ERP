import { defineConfig } from 'orval';

export default defineConfig({
  'recruitment-erp': {
    input: {
      target: 'http://localhost:8081/v3/api-docs',
      validation: false,
    },
    output: {
      target: './src/generated/api.ts',
      schemas: './src/generated/schemas',
      client: 'react-query',
      mode: 'tags-split',
      override: {
        mutator: {
          path: './src/lib/api-client.ts',
          name: 'apiClient',
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
});
