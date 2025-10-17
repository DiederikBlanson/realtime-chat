import { handleHeartbeat, subscribeToOther } from '../controller'
import { Contact } from '../generated/graphql'

const resolvers = {
    Mutation: {
        heartbeat: async (_: any, args: any): Promise<boolean> => {
            await handleHeartbeat(args.uid as string)
            return true
        },

        subscribeToOther: async (_: any, args: any): Promise<Contact | null> =>
            await subscribeToOther(args.user, args.uuid, args.to)
    }
}

export default resolvers