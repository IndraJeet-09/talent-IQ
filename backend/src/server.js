import express from "express";
import path from "path";
import { ENV } from "./lib/env.js";

console.log("ENV loaded:", ENV); // 🔍 debug log

const app = express();

const __dirname = path.resolve();

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ msg: "API is up and running" });
});

// Serve frontend in production
if (ENV.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");

  app.use(express.static(frontendPath));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

const PORT = ENV.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
