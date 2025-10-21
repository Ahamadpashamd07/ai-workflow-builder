import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// List all workflows
router.get("/", async (_req, res) => {
  const all = await prisma.workflow.findMany();
  res.json(all);
});

// Get one workflow
router.get("/:id", async (req, res) => {
  const wf = await prisma.workflow.findUnique({ where: { id: req.params.id } });
  if (!wf) return res.status(404).json({ error: "Workflow not found" });
  res.json(wf);
});

// Create new workflow
router.post("/", async (req, res) => {
  const { name, nodes, edges } = req.body;
  const newWf = await prisma.workflow.create({
    data: { name, nodes, edges },
  });
  res.json(newWf);
});

// Update workflow
router.put("/:id", async (req, res) => {
  const { name, nodes, edges } = req.body;
  const updated = await prisma.workflow.update({
    where: { id: req.params.id },
    data: { name, nodes, edges },
  });
  res.json(updated);
});

// Delete workflow
router.delete("/:id", async (req, res) => {
  await prisma.workflow.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
