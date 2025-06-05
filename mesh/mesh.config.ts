import { defineConfig, loadGraphQLHTTPSubgraph } from '@graphql-mesh/compose-cli'

export const composeConfig = defineConfig({
    subgraphs: [
        {
            sourceHandler: loadGraphQLHTTPSubgraph('Chat-Messages', {
                endpoint: 'http://localhost:5678/graphql'
            })
        }
    ],
    fetch
})