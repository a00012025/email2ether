import { google } from "googleapis";
import * as fs from "fs";
import { OAuth2Client } from "google-auth-library";
import readline from "readline";
import { generateInputs } from "./gen-input";
import { generateWitness } from "./gen-witness";
import shelljs from "shelljs";

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

async function main() {
  await init();
  const email = await getOneEmail();
  if (!email) {
    console.error("No email found");
    return;
  }
  const inputs = await generateInputs(email);
  console.log("Input generated");
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
}

main().catch(console.error);
