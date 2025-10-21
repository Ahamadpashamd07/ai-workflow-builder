import { Router } from "express";
const router = Router();

// Simulate a Lambda run
router.post("/run/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`Simulating Lambda for workflow ${id}...`);
  await new Promise((r) => setTimeout(r, 1500)); // pretend processing
  const success = Math.random() > 0.2; // 80% success rate
  res.json({ id, status: success ? "success" : "failed" });
});

export default router;
