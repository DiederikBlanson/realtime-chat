import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
    schema: [
        {
            'http://localhost:4000/graphql': {
                headers: {
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJleGFtcGxlVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0OTM3MTQ3OSwiZXhwIjoyMDY0OTQ3NDc5fQ.f3MuiaHdCk4Fg_gM8ZtcwM6MtLIyJrcZBHSfS2mAf6I',
                },
            },
        },
    ],
    documents: ['src/graphql/queries/*.graphql'],
    generates: {
        './src/graphql/generated/graphql.tsx': {
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-react-apollo'
            ],
            config: {
                scalars: {
                    Date: 'Date',
                },
                withHooks: true,
                withHOC: false,
                withComponent: false,
            },
        },
    },
};
export default config;
