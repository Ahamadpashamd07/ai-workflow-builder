import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

router.get("/default", async (_req, res) => {
  const name = "Default Workflow";
  let wf = await prisma.workflow.findFirst({ where: { name } });
  if (!wf) wf = await prisma.workflow.create({ data: { name, nodes: [], edges: [] } });
  res.json(wf);
});

router.get("/:id", async (req, res) => {
  const wf = await prisma.workflow.findUnique({ where: { id: req.params.id } });
  if (!wf) return res.status(404).json({ error: "Not found" });
  res.json(wf);
});

router.post("/", async (req, res) => {
  const { name = "Untitled Workflow", nodes = [], edges = [] } = req.body || {};
  const wf = await prisma.workflow.create({ data: { name, nodes, edges } });
  res.status(201).json(wf);
});

router.put("/:id", async (req, res) => {
  const { nodes, edges, name } = req.body || {};
  try {
    const wf = await prisma.workflow.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(nodes !== undefined ? { nodes } : {}),
        ...(edges !== undefined ? { edges } : {}),
      },
    });
    res.json(wf);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

export default router;
