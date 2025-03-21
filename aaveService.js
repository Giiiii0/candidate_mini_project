const { ethers } = require('ethers');
require('dotenv').config();

// AAVE V3 Pool contract ABI (limited to functions we need)
const AAVE_POOL_ABI = [
  "function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)",
  "function getUserConfiguration(address user) view returns (uint256)",
  "function getReservesList() view returns (address[])"
];

// AAVE V3 Data Provider ABI
const DATA_PROVIDER_ABI = [
  "function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)",
  "function getReserveData(address asset) view returns (tuple(uint256 unbacked, uint256 accruedToTreasury, uint256 liquidityIndex, uint256 currentLiquidityRate, uint256 variableBorrowIndex, uint256 currentVariableBorrowRate, uint256 currentStableBorrowRate, uint256 lastUpdateTimestamp, address id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 baseVariableBorrowRate, uint8 baseStableBorrowRate, uint8 optimalUsageRatio))",
  "function getUserReserveData(address asset, address user) view returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)"
];

// ERC20 ABI for token info
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

// Contract addresses for Aave V3 on Ethereum Mainnet
const AAVE_V3_ADDRESSES = {
  POOL: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
  POOL_DATA_PROVIDER: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3'
};

async function fetchAavePositions(walletAddress) {
  try {
    // Connect to Ethereum using Infura
    const provider = new ethers.providers.JsonRpcProvider(
      `https://${process.env.ETHEREUM_NETWORK}.infura.io/v3/${process.env.INFURA_API_KEY}`
    );

    // Initialize AAVE contracts
    const poolContract = new ethers.Contract(
      AAVE_V3_ADDRESSES.POOL,
      AAVE_POOL_ABI,
      provider
    );

    const dataProviderContract = new ethers.Contract(
      AAVE_V3_ADDRESSES.POOL_DATA_PROVIDER,
      DATA_PROVIDER_ABI,
      provider
    );

    // Fetch all reserves
    const reservesList = await poolContract.getReservesList();

    // Get user configuration (bitmap of active reserves)
    const userConfig = await poolContract.getUserConfiguration(walletAddress);
    
    // Convert user configuration to BigInt for bitwise operations
    const userConfigBigInt = BigInt(userConfig.toString());

    const collateralPositions = [];
    const borrowingPositions = [];

    // Process each reserve
    for (let i = 0; i < reservesList.length; i++) {
      const assetAddress = reservesList[i];
      
      // Check if user has this asset as collateral (bit 2*i)
      const isCollateral = (userConfigBigInt >> BigInt(i * 2)) & BigInt(1);
      
      // Check if user has borrowed this asset (bit 2*i+1)
      const isBorrowed = (userConfigBigInt >> BigInt(i * 2 + 1)) & BigInt(1);

      if (isCollateral || isBorrowed) {
        // Get user data for this reserve
        const userReserveData = await dataProviderContract.getUserReserveData(
          assetAddress,
          walletAddress
        );

        // Get token information
        const tokenContract = new ethers.Contract(
          assetAddress,
          ERC20_ABI,
          provider
        );
        
        const tokenSymbol = await tokenContract.symbol();
        const tokenDecimals = await tokenContract.decimals();

        // Format the position data
        if (isCollateral && userReserveData.currentATokenBalance.gt(0)) {
          const formattedAmount = ethers.utils.formatUnits(
            userReserveData.currentATokenBalance,
            tokenDecimals
          );
          
          collateralPositions.push({
            tokenSymbol,
            tokenAddress: assetAddress,
            amount: formattedAmount,
            amountUSD: 0, // Would need a price oracle to calculate USD value
            interestRate: parseFloat(ethers.utils.formatUnits(userReserveData.liquidityRate, 27)),
            lastUpdateTimestamp: new Date().toISOString() // Current timestamp as a placeholder
          });
        }

        if (isBorrowed) {
          // Check both variable and stable debt
          if (userReserveData.currentVariableDebt.gt(0)) {
            const formattedAmount = ethers.utils.formatUnits(
              userReserveData.currentVariableDebt,
              tokenDecimals
            );
            
            borrowingPositions.push({
              tokenSymbol,
              tokenAddress: assetAddress,
              amount: formattedAmount,
              amountUSD: 0, // Would need a price oracle to calculate USD value
              interestRate: 0, // Would need to fetch the current variable borrow rate
              lastUpdateTimestamp: new Date().toISOString() // Current timestamp as a placeholder
            });
          }

          if (userReserveData.currentStableDebt.gt(0)) {
            const formattedAmount = ethers.utils.formatUnits(
              userReserveData.currentStableDebt,
              tokenDecimals
            );
            
            borrowingPositions.push({
              tokenSymbol,
              tokenAddress: assetAddress,
              amount: formattedAmount,
              amountUSD: 0, // Would need a price oracle to calculate USD value
              interestRate: parseFloat(ethers.utils.formatUnits(userReserveData.stableBorrowRate, 27)),
              lastUpdateTimestamp: new Date().toISOString() // Using current timestamp as placeholder
            });
          }
        }
      }
    }

    return {
      collateral_positions: collateralPositions,
      borrowing_positions: borrowingPositions
    };
  } catch (error) {
    console.error('Error fetching AAVE positions:', error);
    throw new Error(`Failed to fetch AAVE positions: ${error.message}`);
  }
}

module.exports = { fetchAavePositions };
