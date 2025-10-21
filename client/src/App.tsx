import { useEffect, useState } from "react";
import Canvas from "./Canvas";
import { listWorkflows, createWorkflow, deleteWorkflow, runLambda, fetchDefaultWorkflow } from "./api";

export default function App() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  // Load list on mount
  useEffect(() => {
    (async () => {
      try {
        const list = await listWorkflows();
        setWorkflows(list);
        if (list.length === 0) {
          const def = await fetchDefaultWorkflow();
          setWorkflows([def]);
          setSelected(def.id);
        } else {
          setSelected(list[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const onCreate = async () => {
    const wf = await createWorkflow(`Workflow ${workflows.length + 1}`);
    setWorkflows((w) => [...w, wf]);
    setSelected(wf.id);
  };

  const onDelete = async (id: string) => {
    await deleteWorkflow(id);
    setWorkflows((w) => w.filter((x) => x.id !== id));
    if (selected === id) setSelected(null);
  };

  const onRun = async (id: string) => {
    setStatus("Running…");
    try {
      const { status } = await runLambda(id);
      setStatus(`Workflow ${id}: ${status}`);
      setTimeout(() => setStatus(""), 2500);
    } catch {
      setStatus("Run failed");
      setTimeout(() => setStatus(""), 2500);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside style={{ width: 260, borderRight: "1px solid #ddd", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 style={{ margin: 0 }}>Workflows</h3>
        <button onClick={onCreate}>+ New</button>
        <div style={{ overflowY: "auto" }}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {workflows.map((wf) => (
              <li key={wf.id} style={{ marginBottom: 6 }}>
                <button onClick={() => setSelected(wf.id)} style={{ fontWeight: selected === wf.id ? 700 : 400 }}>
                  {wf.name}
                </button>
                <button onClick={() => onRun(wf.id)} style={{ marginLeft: 6 }}>▶️ Run</button>
                <button onClick={() => onDelete(wf.id)} style={{ marginLeft: 6 }}>🗑️</button>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ minHeight: 20, opacity: 0.8 }}>{status}</div>
      </aside>
      <main style={{ flex: 1 }}>
        {selected ? <Canvas workflowId={selected} /> : <p style={{ padding: 12 }}>Select or create a workflow</p>}
      </main>
    </div>
  );
}
