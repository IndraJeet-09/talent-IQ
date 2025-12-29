import express from "express";
import path from "path";
import cors from 'cors'
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import {serve} from "inngest/express"
import {inngest ,functions} from './lib/inngest.js'
import { clerkMiddleware } from '@clerk/express';
import chatRoutes from './routes/chatRoutes.js'

console.log("ENV loaded:", ENV); // 🔍 debug log

const app = express();

const __dirname = path.resolve();

app.use(express.json());

app.use(clerkMiddleware());
// credentials: true meaning? => server allows browser to include cookies on request
app.use(cors({origin:ENV.CLIENT_URL, credentials: true }));

app.use("/api/inngest", serve({client: inngest ,functions}))
app.use("/api/chat", chatRoutes)

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ msg: "API is up and running" });
});



// Serve frontend in production
if (ENV.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");

  app.use(express.static(frontendPath));

  app.use((req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

const PORT = ENV.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => 
      console.log(`✅ Server running at: ${ENV.PORT} `));
  } catch (error) {
    console.error("Error starting the server")
  }
};
startServer();