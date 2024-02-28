import { google } from "googleapis";
import * as fs from "fs";
import { OAuth2Client } from "google-auth-library";
import readline from "readline";
import { generateInputs } from "./gen-input";
import { generateWitness } from "./gen-witness";
import shelljs from "shelljs";
import { poseidonCircom, stringToCircomArray } from "./utils/poseidon-circom";
import EmailAccountFactoryAbi from "./abi/EmailAccountFactory";
import EmailAccountAbi from "./abi/EmailAccount";
import {
  createPublicClient,
  http,
  getContract,
  createWalletClient,
} from "viem";
import { arbitrumSepolia } from "viem/chains";
import dotenv from "dotenv";
import { privateKeyToAccount } from "viem/accounts";
dotenv.config();

const TOKEN_PATH = "credentials/token.json";
const CREDENTIALS_PATH = "credentials/credentials.json";
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
let gmail: ReturnType<typeof google.gmail>;

async function init() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  let token;
  try {
    token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
  } catch (error) {
    token = await getNewToken(oAuth2Client);
  }
  oAuth2Client.setCredentials(token);

  gmail = google.gmail({ version: "v1", auth: oAuth2Client });
}

async function getNewToken(oAuth2Client: OAuth2Client): Promise<any> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const code = await new Promise<string>((resolve) => {
    rl.question("Enter the code from that page here: ", (code) =>
      resolve(code)
    );
  });
  rl.close();
  const { tokens } = await oAuth2Client.getToken(code);
  // Store the token to disk for later program executions
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log("Token stored to", TOKEN_PATH);
  return tokens;
}

async function getOneEmail() {
  try {
    const res = await gmail.users.messages.list({
      userId: "me",
    });
    const messages = res.data.messages;
    if (!messages || messages.length === 0) {
      console.log("No messages found.");
      return null;
    }
    const latestEmailId = messages[2].id;
    if (!latestEmailId) {
      return null;
    }
    const content = await getEmail(latestEmailId);
    return content;
  } catch (err) {
    console.log("The API returned an error: " + err);
    return null;
  }
}

async function getEmail(messageId: string): Promise<string> {
  try {
    const res = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "raw",
    });
    const raw = res.data.raw;
    if (!raw) {
      return "";
    }
    const emailData = Buffer.from(raw, "base64").toString("utf-8");
    return emailData;
  } catch (error) {
    console.error("Error retrieving email:", error);
    return "";
  }
}

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

async function main() {
  if (!PRIVATE_KEY || !RPC_URL) {
    console.error("PRIVATE_KEY or RPC_URL env variable is missing");
    return;
  }

  await init();
  const email = await getOneEmail();
  if (!email) {
    console.error("No email found");
    return;
  }
  const { circuitInputs: inputs, sender_email } = await generateInputs(email);
  console.log("Input generated. Email:", sender_email);
  const witness = await generateWitness(
    inputs,
    "./src/witness/email_change_owner.wasm"
  );
  const uid = Math.random().toString(36).substring(7);
  const witnessFile = `files/witness-${uid}.wtns`;
  const proofFile = `files/proof-${uid}.json`;
  const publicFile = `files/public-${uid}.json`;
  fs.writeFileSync(witnessFile, witness);
  console.log("Witness file written to", witnessFile);

  shelljs.exec(
    `./rapidsnark ../circuits/setup/email_change_owner_0001.zkey ${witnessFile} ${proofFile} ${publicFile}`
  );
  console.log("Proof generated");

  // calculate email hash
  const circomArray = stringToCircomArray(sender_email);
  const emailHash: string = await poseidonCircom(circomArray);
  const walletClient = createWalletClient({
    account: privateKeyToAccount(PRIVATE_KEY as `0x${string}`),
    chain: arbitrumSepolia,
    transport: http(),
  });
  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  });
  const accountFactory = getContract({
    address: process.env.ACCOUNT_FACTORY_CONTRACT_ADDRESS! as `0x${string}`,
    abi: EmailAccountFactoryAbi,
    client: walletClient,
  });
  const nonce = await publicClient.getTransactionCount({
    address: walletClient.account.address as `0x${string}`,
  });

  const tx1 = await accountFactory.write.createAccount(
    [BigInt(emailHash), 0n] as const,
    { nonce: nonce }
  );
  console.log("Contract account created. Tx:", tx1);

  const accountAddress = await accountFactory.read.getAddress([
    BigInt(emailHash),
    0n,
  ]);

  // send proof on chain
  const proofJSON = JSON.parse(fs.readFileSync(proofFile, "utf-8"));
  const publicSignalsJSON = JSON.parse(fs.readFileSync(publicFile, "utf-8"));
  const proof = [
    BigInt(proofJSON.pi_a[0]),
    BigInt(proofJSON.pi_a[1]),
    BigInt(proofJSON.pi_b[0][1]),
    BigInt(proofJSON.pi_b[0][0]),
    BigInt(proofJSON.pi_b[1][1]),
    BigInt(proofJSON.pi_b[1][0]),
    BigInt(proofJSON.pi_c[0]),
    BigInt(proofJSON.pi_c[1]),
  ] as const;
  const publicSignals = publicSignalsJSON.map((x: string) => BigInt(x));
  const emailAccount = getContract({
    address: accountAddress,
    abi: EmailAccountAbi,
    client: walletClient,
  });
  const res = await emailAccount.write.transferOwnership(
    [proof, publicSignals],
    { nonce: nonce + 1 }
  );
  console.log("Ownership transferred", res);
}

main().catch(console.error);
