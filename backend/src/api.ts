import { readFileSync } from "fs";
import express from "express";
import bodyParser from "body-parser";
import { initWallet, handleOpsRaw } from "./wallet";

async function main() {
  await initWallet();

  // Create a new express application instance
  const app: express.Application = express();
  app.use(function (_req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
  });
  app.use(bodyParser.json());
  app.get("/account", (req, res) => {
    const emailHash = req.query.email_hash;
    if (!emailHash) {
      return res.status(400).json({ error: "email_hash is required" });
    }
    try {
      const state = JSON.parse(readFileSync("state.json", "utf-8"));
      if (new Set(state).has(emailHash as string)) {
        return res.json({ processing: true });
      }
    } catch (error) {
    } finally {
      return res.json({ processing: false });
    }
  });
  app.post("/send_user_op", async (req, res) => {
    try {
      const userOp = req.body;
      const txHash = await handleOpsRaw(userOp, "421614");
      res.json({ tx_hash: txHash });
    } catch (error) {
      res.json({ error });
    }
  });

  const PORT = 8080;
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

main().catch(console.error);
