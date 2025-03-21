const { 
  GraphQLSchema, 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLList,
  GraphQLFloat,
  GraphQLNonNull
} = require('graphql');

const { fetchAavePositions } = require('./aaveService');

// Define types for AAVE positions
const PositionType = new GraphQLObjectType({
  name: 'Position',
  fields: () => ({
    tokenSymbol: { type: GraphQLString },
    tokenAddress: { type: GraphQLString },
    amount: { type: GraphQLString },
    amountUSD: { type: GraphQLFloat },
    interestRate: { type: GraphQLFloat },
    lastUpdateTimestamp: { type: GraphQLString }
  })
});

const AavePositionsType = new GraphQLObjectType({
  name: 'AavePositions',
  fields: () => ({
    collateral_positions: { type: new GraphQLList(PositionType) },
    borrowing_positions: { type: new GraphQLList(PositionType) }
  })
});

// Root Query
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    aavePositions: {
      type: AavePositionsType,
      args: {
        walletAddress: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, args) => {
        const { walletAddress } = args;
        
        // Validate Ethereum address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
          throw new Error('Invalid Ethereum wallet address format');
        }
        
        return await fetchAavePositions(walletAddress);
      }
    }
  }
});

// Create and export the schema
const schema = new GraphQLSchema({
  query: RootQuery
});

module.exports = { schema };
