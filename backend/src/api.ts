import { readFileSync } from "fs";
import express from "express";

// Create a new express application instance
const app: express.Application = express();
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

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
