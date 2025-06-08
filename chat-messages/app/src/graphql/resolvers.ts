import DataModel from '../model/dataModel'

const dataModel = new DataModel()

const resolvers = {
    Query: {
        messages: async (_: any, args: any) =>
            await dataModel.getInitialMessages(args.name)
    }
}

export default resolvers;