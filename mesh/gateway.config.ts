import {
    createInlineSigningKeyProvider,
    defineConfig,
    extractFromHeader
} from '@graphql-hive/gateway'

const signingKey = 'my-secret-key'

export const gatewayConfig = defineConfig({
    jwt: {
        tokenLookupLocations: [extractFromHeader({ name: 'authorization', prefix: 'Bearer' })],
        singingKeyProviders: [createInlineSigningKeyProvider(signingKey)],
        forward: {
            payload: true
        }
    }
})