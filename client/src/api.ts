const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export type FlowGraph = {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
};

export async function fetchDefaultWorkflow(): Promise<FlowGraph> {
  const res = await fetch(`${API_URL}/workflows/default`);
  if (!res.ok) throw new Error("Failed to load default workflow");
  return res.json();
}

export async function saveWorkflow(id: string, nodes: any[], edges: any[], name?: string) {
  const res = await fetch(`${API_URL}/workflows/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nodes, edges, name }),
  });
  if (!res.ok) throw new Error("Failed to save workflow");
  return res.json();
}
