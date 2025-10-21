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

// Fallback: get-or-create a default workflow
export async function fetchDefaultWorkflow(): Promise<FlowGraph> {
  const r = await fetch(`${API_URL}/workflows/default`);
  if (!r.ok) throw new Error("Failed to load default workflow");
  return r.json();
}
