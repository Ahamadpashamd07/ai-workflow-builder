import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import workflowRouter from "./routes/workflows";

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "api", time: new Date().toISOString() });
});

app.use("/workflows", workflowRouter);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
