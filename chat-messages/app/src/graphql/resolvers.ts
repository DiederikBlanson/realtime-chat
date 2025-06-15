import DataModel from '../model/dataModel'
import logger from '../logger'

const dataModel = new DataModel()

const resolvers = {
    Query: {
        messages: async (_: any, args: any) => {
            try {
                return await dataModel.getInitialMessages(args.name)
            } catch (e){
                logger.error(`Error when retrieving all messages: ${e}`, { service: 'chat-messages' }) // TODO: define chat-messages in logger.ts
            }
        }
    }
}

export default resolvers;