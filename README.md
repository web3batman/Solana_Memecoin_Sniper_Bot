# Solana Bot Package

This Solana Bot Package is designed to automate interactions with the Raydium decentralized exchange and the Solana blockchain. The package includes two main bots: the Raydium Sniper Bot and the Meme Coin Bot. These bots help users efficiently manage their tokens, create markets, and optimize trading strategies.

https://github.com/user-attachments/assets/e6ddef8e-62f9-41c4-a798-d152c342a59e
https://github.com/user-attachments/assets/38f71a01-bf3d-43fd-9c0e-9577847683a8

## Features

### 1. Raydium Sniper Bot

#### Description:
The Raydium Sniper Bot aims to catch new pools on Raydium and execute buy/sell transactions to make a profit. It allows for manual and automated trading, giving users the flexibility to optimize their strategies and maximize returns.

#### Features:
- **Wallet Registration**: Register your own wallet for transactions.
- **Track New Pools on Raydium**: Monitor new pools and filter them based on SOL amount. Filter feature can be disabled, and if disabled, catch all pools.
- **Buy and Sell**: 
  - Manual buy and sell for each pool which tracked.
  - Show the status of buy/sell on every pools.
  - Auto buy and sell with specific amount, time delay, profit, and loss percentages.
  - Jito Mode: Execute transactions with Jito mode, allowing manual adjustment of Jito fees.

### 2. Meme Coin Bot

#### Description:
The Meme Coin Bot is designed to create and manage Raydium pools, handle liquidity, and attract more users. By creating a booming pool with multiple transactions from various wallets, it aims to draw in more users and generate significant profit.

#### Features:
- **Token Creation**: Set meme coin name, symbol, image, decimal, and total supply.
- **Open Book Market Creation**: Create a market for the newly minted token.
- **Raydium Pool Creation**: 
  - Create a Raydium pool from the market newly created.
  - Set SOL and token amount to deposit to the pool.
  - Enable/disable burn LP token and freeze wallets that swap tokens.
- **Wallet Management**: 
  - Create customized counts of random wallets and distribute SOL and tokens to them.
  - Airdrop tokens to other wallets for marketing.
- **Instant Swap After Pool Creation**: 
  - Perform swaps instantly after pool creation with a customized percentage of SOL amount. These will be the first wallets which buy tokens from the pool.
- **Management Auto Trading**: 
  - Set buy amount of SOL per seconds and sell percentage of tokens per seconds. You can customize amount of sol and token, also the duration for each wallet
  - Start/stop auto trading for each wallet and also show real-time view of sol and token amount for each wallet.
  - Refund all SOL of wallet to the main wallet after trading.
- **Withdraw SOL**: Withdraw all SOL from pool, in the case of owning LP tokens, after all trading activities.

## Getting Started

To use this Solana Bot Package, you will need to have a basic understanding of Solana, Raydium, and automated trading. Follow the instructions below to get started:

1. **Clone the Repository**: 
   ```bash
   git clone https://github.com/your-repository/solana-bot-package.git
   ```
2. **Install Dependencies**:
   ```bash
   cd solana-bot-package
   npm install
   ```
3. **Configure Your Wallet**: Update the configuration file with your wallet details and desired settings.

4. **Run the Bots**:
     ```bash
     npm run start
     ```

## Configuration Guide

### Frontend Configuration
Update the following environment variables in your frontend `.env` file:

- `VITE_SERVER_URL=`: Set this to your backend server URL.
- `VITE_RPC_URL=`: Define your RPC URL.
- `VITE_DEV_RPC_URL=`: Define your development RPC URL.
- `VITE_PINATA_API_KEY=`: Set your Pinata API key.
- `VITE_PINATA_URL=`: Set your Pinata URL.

### Backend Configuration
Update the following environment variables in your backend `.env` file:

- `MONGO_URL=`: Your MongoDB URL.
- `RPC_ENDPOINT=`: Define your RPC endpoint.
- `WEBSOCKET_ENDPOINT=`: Define your WebSocket endpoint.
- `RPC_SUB_ENDPOINT=`: Define your RPC subscription endpoint.
- `WEBSOCKET_SUB_ENDPOINT=`: Define your WebSocket subscription endpoint.
- `DEV_NET_RPC=`: Define your development network RPC.
- `DEV_NET_WSS=`: Define your development network WebSocket.
- `DEV_NET_SUB_RPC=`: Define your development network subscription RPC.
- `DEV_NET_SUB_WSS=`: Define your development network subscription WebSocket.
- `LOG_LEVEL=info`: Set the log level.
- `BLOCKENGINE_URL=`: Define your BlockEngine URL.
- `JITO_FEE=`: Set your Jito fee.
- `JITO_KEY=`: Set your Jito key.
- `CHECK_IF_MINT_IS_MUTABLE=`: Set this to true or false to check if mint is mutable.
- `CHECK_IF_MINT_IS_BURNED=`: Set this to true or false to check if mint is burned.
- `CHECK_IF_MINT_IS_FROZEN=`: Set this to true or false to check if mint is frozen.
- `CHECK_IF_MINT_IS_RENOUNCED=`: Set this to true or false to check if mint is renounced.
- `COMMITMENT_LEVEL=`: Set the commitment level.
- `ORIGIN_URL=`: The frontend URL for allowing CORS.

## Note
This repo includes only sniping part due to the security problem. However, you can check its full functionality in this link:
[Solana Sniper and Meme coin Bot](https://solana-trading-bot-fe-production.up.railway.app/sniper)

If you have any questions or want more customized app for specific use cases, please feel free to contact me to below contacts.

- E-Mail: adamglab0731.pl@gmail.com
- Telegram: [@bettyjk_0915](https://t.me/bettyjk_0915)
