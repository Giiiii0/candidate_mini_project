## Requirements

- Node.js (v14 or higher)
- Infura API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables:
   - Copy the `.env` file and update with your Infura API key
   ```
   PORT=3000
   INFURA_API_KEY=your_infura_api_key
   ETHEREUM_NETWORK=mainnet
   ```

## Running the API

Start the server:

```
npm start or npm run dev
```

## Using the GraphQL API

Example query:

```graphql
{
  aavePositions(walletAddress: "0xYourEthereumWalletAddress") {
    collateral_positions {
      tokenSymbol
      tokenAddress
      amount
      amountUSD
      interestRate
      lastUpdateTimestamp
    }
    borrowing_positions {
      tokenSymbol
      tokenAddress
      amount
      amountUSD
      interestRate
      lastUpdateTimestamp
    }
  }
}
```

### Testing with Postman

1. Open Postman and create a new request
2. Set the request type to **POST**
3. Enter the URL: `http://localhost:3000/graphql`
4. Go to the "Headers" tab and add:
   - Key: `Content-Type`
   - Value: `application/json`
5. Go to the "Body" tab and:
   - Select "raw"
   - Select "JSON" from the dropdown
   - Enter the following JSON:

```json
{
  "query": "{ aavePositions(walletAddress: \"0xYourEthereumWalletAddress\") { collateral_positions { tokenSymbol tokenAddress amount amountUSD interestRate lastUpdateTimestamp } borrowing_positions { tokenSymbol tokenAddress amount amountUSD interestRate lastUpdateTimestamp } } }"
}
```

6. Replace `0xYourEthereumWalletAddress` with a valid Ethereum address
7. Click "Send" to execute the request

### Testing with cURL

You can use the following cURL command in your terminal:

```bash
curl -X POST \
  http://localhost:3000/graphql \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "{ aavePositions(walletAddress: \"0xYourEthereumWalletAddress\") { collateral_positions { tokenSymbol tokenAddress amount amountUSD interestRate lastUpdateTimestamp } borrowing_positions { tokenSymbol tokenAddress amount amountUSD interestRate lastUpdateTimestamp } } }"
  }'
```

Replace `0xYourEthereumWalletAddress` with a valid Ethereum address.

For better readability, you can also use a multi-line approach with a here-document in bash:

```bash
curl -X POST \
  http://localhost:3000/graphql \
  -H 'Content-Type: application/json' \
  -d @- << EOF
{
  "query": "{ 
    aavePositions(walletAddress: \"0xYourEthereumWalletAddress\") { 
      collateral_positions { 
        tokenSymbol 
        tokenAddress 
        amount 
        amountUSD 
        interestRate 
        lastUpdateTimestamp 
      } 
      borrowing_positions { 
        tokenSymbol 
        tokenAddress 
        amount 
        amountUSD 
        interestRate 
        lastUpdateTimestamp 
      } 
    } 
  }"
}
EOF
```