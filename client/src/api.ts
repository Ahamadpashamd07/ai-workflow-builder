const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export type FlowGraph = {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
};

export async function listWorkflows(): Promise<FlowGraph[]> {
  const r = await fetch(`${API_URL}/workflows`);
  if (!r.ok) throw new Error("Failed to list workflows");
  return r.json();
}

export async function createWorkflow(name: string): Promise<FlowGraph> {
  const r = await fetch(`${API_URL}/workflows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, nodes: [], edges: [] }),
  });
  if (!r.ok) throw new Error("Failed to create workflow");
  return r.json();
}

export async function deleteWorkflow(id: string): Promise<void> {
  const r = await fetch(`${API_URL}/workflows/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Failed to delete workflow");
}

export async function fetchWorkflow(id: string): Promise<FlowGraph> {
  const r = await fetch(`${API_URL}/workflows/${id}`);
  if (!r.ok) throw new Error("Failed to fetch workflow");
  return r.json();
}

export async function saveWorkflow(id: string, nodes: any[], edges: any[], name?: string) {
  const r = await fetch(`${API_URL}/workflows/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nodes, edges, name }),
  });
  if (!r.ok) throw new Error("Failed to save workflow");
  return r.json();
}

export async function runLambda(id: string): Promise<{ id: string; status: string }> {
  const r = await fetch(`${API_URL}/lambda/run/${id}`, { method: "POST" });
  if (!r.ok) throw new Error("Failed to run lambda");
  return r.json();
}

export function exportWorkflowDownload(id: string) {
  window.open(`${API_URL}/workflows/${id}/export`, "_blank");
}

export async function importWorkflowJSON(body: { name: string; nodes: any[]; edges: any[] }) {
  const r = await fetch(`${API_URL}/workflows/import-json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Failed to import JSON");
  return r.json();
}

export async function importWorkflowFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  const r = await fetch(`${API_URL}/workflows/import-file`, { method: "POST", body: form });
  if (!r.ok) throw new Error("Failed to import file");
  return r.json();
}

export async function fetchDefaultWorkflow() {
  const r = await fetch(`${API_URL}/workflows`, { method: "GET" });
  const list = await r.json();
  if (list.length > 0) return list[0];
  const c = await createWorkflow("Default Workflow");
  return c;
}
