import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { makeExecutableSchema } from '@graphql-tools/schema'
import path from 'path'
import resolvers from './resolvers'

const typeDefs = loadSchemaSync(path.join(__dirname, 'schema.graphql'), {
    loaders: [new GraphQLFileLoader()],
})

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
})

export default schema
