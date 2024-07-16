# Privy Auth `create-react-app` Starter

This is a minimal template for integrating [Privy Auth](https://www.privy.io/) into a new create-react-app project with [Gelato Relay](https://docs.gelato.network/web3-services/relay).

## Setup:

1. Clone this repository and open it in your terminal.
```
git clone https://github.com/leirbag95/gelato-relay-send-token.git
```

2. Install the necessary dependencies (including [Privy Auth](https://www.npmjs.com/package/@privy-io/react-auth) and [Gelato](https://www.npmjs.com/package/@gelatonetwork/relay-sdk) with `npm`.
```sh
npm install --force
```

3. Initialize your environment variables by copying the `.env.example` file to an `.env` file. Then, [paste your Privy App ID from the console](https://docs.privy.io/guide/console/api-keys) in `.env`.
```sh
# In your terminal, create .env from .env.example
cp .env.example .env

# Add your Privy App ID to .env
REACT_APP_PRIVY_APP_ID=<your-privy-app-id>
REACT_APP_RELAY_API_KEY=<your-gelato-relay-key>
```

## Building locally:

In your project directory, run `npm run start`. You can now visit http://localhost:3000 to see your app and login with Privy!

## Contract

The contracts are already deployed on Sepolia, so it's up to you to redeploy them on any network you wish
Just be sure to replace them in `src/utils/address.ts`
