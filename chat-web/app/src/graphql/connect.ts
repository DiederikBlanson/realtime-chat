import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJleGFtcGxlVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0OTM3MTQ3OSwiZXhwIjoyMDY0OTQ3NDc5fQ.f3MuiaHdCk4Fg_gM8ZtcwM6MtLIyJrcZBHSfS2mAf6I"

const httpLink = new HttpLink({
    uri: `${import.meta.env.VITE_APP_FEDERATED_GRAPH}/graphql`
})
const authLink = setContext((_, { headers }) => ({
    headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
    }
}))

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
})