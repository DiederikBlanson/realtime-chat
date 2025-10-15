import { handleHeartbeat} from '../controller'

const resolvers = {
    Mutation: {
        heartbeat: async (_: any, args: any) => {
            // Simulate 40% failure rate
            const shouldFail = Math.random() < 0.4

            if (shouldFail) {
                throw new Error("Simulated random error (40%)")
            }

            await handleHeartbeat(args.uid as string)
            return true
        }
    }
}

export default resolvers