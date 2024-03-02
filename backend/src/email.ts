import { google } from "googleapis";
import * as fs from "fs";
import { OAuth2Client } from "google-auth-library";
import readline from "readline";
import { poseidonCircom, stringToCircomArray } from "./utils/poseidon-circom";

const TOKEN_PATH = "credentials/token.json";
const CREDENTIALS_PATH = "credentials/credentials.json";
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
];
let gmail: ReturnType<typeof google.gmail>;

export async function initEmailAuth() {
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

export async function getOneEmail() {
  const res = await gmail.users.messages.list({
    userId: "me",
  });
  const messages = res.data.messages;
  if (!messages || messages.length === 0) {
    throw new Error("No messages found");
  }
  const latestEmailId = messages[0].id;
  if (!latestEmailId) {
    throw new Error("No email found");
  }
  const content = await getEmail(latestEmailId);
  return content;
}

export async function getEmail(messageId: string): Promise<string> {
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

export const processingEmails = new Set<string>();
export async function listenForNewEmails(
  processEmail: (email: string) => Promise<void>,
  interval: number = 3
) {
  console.log(`Starting to listen for new emails every ${interval} seconds`);

  const checkEmails = async () => {
    try {
      const res = await gmail.users.messages.list({
        userId: "me",
        labelIds: ["INBOX"], // Adjust if you want to check other labels
        q: "is:unread", // Adjust this query to filter messages
      });
      const messages = res.data.messages || [];
      for (const message of messages) {
        const emailId = message.id;
        if (!emailId) continue;
        try {
          await gmail.users.messages.modify({
            userId: "me",
            id: emailId,
            requestBody: {
              removeLabelIds: ["UNREAD"], // Removes the 'UNREAD' label
            },
          });
        } catch (error) {
          console.error("Error marking email as read");
        }

        const rawEmail = await getEmail(emailId);
        if (rawEmail) {
          console.log("Start processing email:", emailId);
          const re_from =
            /(?:(?:\r\n)|^)From:(?:[^\r\n]+<)?([A-Za-z0-9!#$%&'\\*\\+-/=\\?^_`{\\|}~\\.]+@[A-Za-z0-9\\.-]+)/gm;
          const match_from = Array.from(rawEmail.matchAll(re_from))[0];
          const sender = match_from[1];
          const circomArray = stringToCircomArray(sender);
          const emailHash: string = await poseidonCircom(circomArray);
          processingEmails.add(emailHash);
          fs.writeFileSync("state.json", JSON.stringify([...processingEmails]));
          processEmail(rawEmail)
            .then(() => {
              console.log(
                `Finished processing email from ${sender}, ${emailId}`
              );
            })
            .catch((error) => {
              console.log(
                `Finished processing email from ${sender}, ${emailId}, ${error}`
              );
            })
            .finally(() => {
              processingEmails.delete(emailHash);
              fs.writeFileSync(
                "state.json",
                JSON.stringify([...processingEmails])
              );
            });
        }
      }
    } catch (error) {
      console.error("Error while checking for new emails:", error);
    }
  };

  await checkEmails();
  setInterval(checkEmails, interval * 1000);
}
