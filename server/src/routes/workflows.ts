import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs-extra";
import multer from "multer";

const prisma = new PrismaClient();
const router = Router();
const upload = multer({ dest: path.join(process.cwd(), "uploads", "tmp") });

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
fs.ensureDirSync(UPLOADS_DIR);

// List all workflows
router.get("/", async (_req, res) => {
  const all = await prisma.workflow.findMany({ orderBy: { createdAt: "asc" } });
  res.json(all);
});
/**
 * IMPORT via JSON body
 * POST /workflows/import-json
 * body: { name, nodes, edges }
 */
router.post("/import-json", async (req, res) => {
  const { name = "Imported Workflow", nodes = [], edges = [] } = req.body || {};
  const wf = await prisma.workflow.create({ data: { name, nodes, edges } });
  res.json(wf);
});

/**
 * IMPORT via file upload (multipart) — file should be a .json with {name,nodes,edges}
 * POST /workflows/import-file  (form-data: file=<file>)
 */
router.post("/import-file", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file is required" });
  try {
    const content = await fs.readJson(req.file.path);
    const { name = "Imported Workflow", nodes = [], edges = [] } = content || {};
    const wf = await prisma.workflow.create({ data: { name, nodes, edges } });
    // move uploaded file into uploads/ for reference (optional)
    const finalName = `${name.replace(/\s+/g, "_")}_${wf.id}.json`;
    await fs.move(req.file.path, path.join(UPLOADS_DIR, finalName), { overwrite: true });
    res.json(wf);
  } catch (e) {
    res.status(400).json({ error: "Invalid JSON file" });
  }
});

// Get one workflow
router.get("/:id", async (req, res) => {
  const wf = await prisma.workflow.findUnique({ where: { id: req.params.id } });
  if (!wf) return res.status(404).json({ error: "Workflow not found" });
  res.json(wf);
});

// Create new workflow
router.post("/", async (req, res) => {
  const { name = "New Workflow", nodes = [], edges = [] } = req.body || {};
  const newWf = await prisma.workflow.create({ data: { name, nodes, edges } });
  res.json(newWf);
});

// Update workflow
router.put("/:id", async (req, res) => {
  const { name, nodes, edges } = req.body || {};
  const updated = await prisma.workflow.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(nodes !== undefined ? { nodes } : {}),
      ...(edges !== undefined ? { edges } : {}),
    },
  });
  res.json(updated);
});

// Delete workflow
router.delete("/:id", async (req, res) => {
  await prisma.workflow.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

/**
 * EXPORT: Download a workflow JSON directly (browser download)
 * GET /workflows/:id/export
 */
router.get("/:id/export", async (req, res) => {
  const wf = await prisma.workflow.findUnique({ where: { id: req.params.id } });
  if (!wf) return res.status(404).json({ error: "Workflow not found" });

  const filename = `${wf.name.replace(/\s+/g, "_")}_${wf.id}.json`;
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/json");
  res.send(
    JSON.stringify({ id: wf.id, name: wf.name, nodes: wf.nodes, edges: wf.edges }, null, 2)
  );
});

/**
 * EXPORT (mock S3): Save a workflow JSON into /uploads and return the path
 * POST /workflows/:id/export
 */
router.post("/:id/export", async (req, res) => {
  const wf = await prisma.workflow.findUnique({ where: { id: req.params.id } });
  if (!wf) return res.status(404).json({ error: "Workflow not found" });

  const filename = `${wf.name.replace(/\s+/g, "_")}_${wf.id}.json`;
  const outPath = path.join(UPLOADS_DIR, filename);
  await fs.writeJson(outPath, { id: wf.id, name: wf.name, nodes: wf.nodes, edges: wf.edges }, { spaces: 2 });
  res.json({ ok: true, path: outPath });
});

export default router;
