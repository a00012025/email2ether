# Welcome to Email2Ether

Keyless, Secure Wallet via Email & ZK Proofs

<p align="center">
  <img width="250" height="250" src="./assets/logo.png">
</p>

## Introduction

The Email2Ether Wallet Connector is an innovative solution designed for the Ethereum ecosystem, offering a seamless and secure way for users to connect to their wallets using just their email addresses. Developed during a vibrant hackathon at an Ethereum conference, this project introduces a groundbreaking approach to wallet authentication and ownership management, eliminating the need for users to remember or manage private keys.

## Demo

## Features

- **Email-Based Authentication:** Users can easily authenticate and access their wallet using their email address, simplifying the login process.
- **Temporary Key Pair Generation:** For each session, a temporary key pair is generated, corresponding to a session-specific wallet. This enhances security by ensuring that each session is isolated and protected.
- **DKIM Signature Verification:** Utilizing zero-knowledge (zk) proofs and the verification of DKIM signatures in email headers, we ensure a secure and private authentication process.
- **ERC-4337 Contract Wallet Integration:** Ownership of the ERC-4337 contract wallet can be transferred to the temporary wallet address, streamlining the user experience without compromising on security.
- **Cross-Chain Compatibility:** The ERC-4337 smart contract wallet address corresponding to the email remains constant across all EVM-compatible chains, ensuring a unified wallet experience regardless of the blockchain network.
- **No Need for Private Key Management:** Users are relieved from the hassle of remembering and managing private keys, as each session generates a new, temporary wallet address and private key.

## Current Limitations and Future Work

- **Email Provider Support:** For demonstration purposes, we currently support authentication via **Gmail** only. However, expanding support to include additional email providers is planned for future development and requires minimal effort.
- **Expiration Time:** Incorporating expiration times in the emails sent by users, alongside mechanisms like passkeys, to secure sessions on-chain within the designated expiration timeframe.
- **Enterprise Paymaster:** Enabling enterprise email domains to act as Paymasters, covering gas fees for their employees through verifiable zk proofs on the blockchain.

## Getting Started

This section provides a comprehensive guide to setting up the Ethereum Email Wallet Connector on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following tools and accounts set up:

- [Node.js](https://nodejs.org/en): A JavaScript runtime built on Chrome's V8 JavaScript engine.
- [Pnpm](https://pnpm.io/installation) or any other package manager like npm: For managing project dependencies.
- [Bun](https://bun.sh/): Utilized for enhanced frontend development experience due to its speed.
- [Foundry](https://book.getfoundry.sh/getting-started/installation): A smart contract development toolkit.
- [Circom](https://docs.circom.io/getting-started/installation/): For developing and compiling zero-knowledge circuits.
- An email service with DKIM signature support: Currently, for demonstration purposes, Gmail is the supported email service.

### Installation

#### Cloning the Repository

Start by cloning the project repository:

```bash
git clone https://github.com/a00012025/email2ether.git
```

### Smart Contract Setup

1. **Install Smart Contract Dependencies:**

   Navigate to the `contracts` directory and install the necessary dependencies:

   ```bash
   cd contracts && pnpm install
   ```

2. **Configure Environment Variables:**

   Set up your environment variables for deployment:

   ```bash
   export PRIVATE_KEY=<YOUR_PRIVATE_KEY>
   export RPC_URL=<RPC_URL>
   ```

3. **Deploy the Email Account Factory:**

   Deploy your smart contract with the provided script:

   ```bash
   ./script/deploy-contract.sh

   # Verify the contract if you want
   # Caution: You should modify the variables inside the shell script to the deployment address before running the script
   ./script/verify-contract.sh
   ```

### Zero-Knowledge Circuits

4. **Install Circom Dependencies:**

   Move to the `circuits` directory and install dependencies: development

   ```bash
   cd ../circuits && pnpm install
   ```

5. **Build the Circuits:**

   Compile your zero-knowledge circuits:

   ```bash
   pnpm run build
   ```

6. **Trusted Setup:**

   Perform the trusted setup for the circuits:

   ```bash
   pnpm run trusted-setup
   ```

7. **Generate and Verify Proofs (Optional):**

   Test proof generation and verification:

   ```bash
   pnpm run gen-proof && pnpm run verify-proof
   ```

### Backend Configuration

8. **Install Backend Dependencies:**

   Prepare your backend environment:

   ```bash
   cd ../backend && pnpm install
   # Establish a soft link to your rapidsnark binary
   ls -s <YOUR_RAPIDSNARK_BINARY> ./rapidsnark
   ```

9. **Update Smart Contract Address:**

   In `./src/wallet.ts`, update the address with the one from your deployed Email Account Factory.

10. **Launch the Backend Service:**

    Begin listening for requests:

    ```bash
    pnpm run listen
    ```

### Frontend Launch

11. **Prepare Frontend Environment:**

    Install frontend dependencies:

    ```bash
    cd ../frontend && bun install
    ```

12. **Start the Development Server:**

    Launch your frontend application:

    ```
    bun run dev
    ```

## Meet the Team

Our project is brought to life by a dedicated team of professionals. Get to know the individuals behind this innovative project:

### Harry Chen - Full Stack Developer

<p align="left">
  <img src="https://github.com/a00012025.png" width="100" height="100" style="border-radius:50%; margin-right: 20px;" alt="Harry Chen">
  <strong>Harry Chen</strong> is a Full Stack Developer with a strong focus on integrating zero-knowledge proofs to enhance the project's functionality. As the Lead Developer, his extensive knowledge ensures the project's workflow is seamless and efficient, underpinning the technical architecture with advanced solutions. <a href="https://github.com/a00012025">Profile</a>
</p>

### Kuan - Frontend & Smart Contract Developer

<p align="left">
  <img src="https://github.com/kuan0808.png" width="100" height="100" style="border-radius:50%; margin-right: 20px;" alt="Kuan">
  <strong>Kuan</strong> is a key developer focusing on smart contract development for decentralized applications, complementing his expertise with frontend development to enhance user interfaces.  <a href="https://github.com/kuan0808">Profile</a>
</p>

### Sterling Cobb - Frontend Developer & UI/UX Designer

<p align="left">
  <img src="https://github.com/fourcolors.png" width="100" height="100" style="border-radius:50%; margin-right: 20px;" alt="Sterling Cobb">
  <strong>Sterling Cobb</strong> leverages his sharp design instincts and creativity to elevate the project's aesthetics and user experience. His commitment to intuitive design and user-centric development ensures the application is not only visually captivating but also offers an unparalleled user experience. <a href="https://github.com/fourcolors">Profile</a>
</p>

## License

MIT License - Email2Ether
