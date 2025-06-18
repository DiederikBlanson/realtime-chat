import { defineConfig, loadGraphQLHTTPSubgraph } from '@graphql-mesh/compose-cli'
import * as dotenv from 'dotenv'

dotenv.config()

export const composeConfig = defineConfig({
    subgraphs: [
        {
            sourceHandler: loadGraphQLHTTPSubgraph('chat-messages', {
                endpoint: `${process.env.MESSAGING_SERVICE_URL}/graphql`
            })
        }
    ],
    fetch
})