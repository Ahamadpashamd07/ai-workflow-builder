import { useEffect, useRef, useState } from "react";
import Canvas from "./Canvas";
import {
  listWorkflows,
  createWorkflow,
  deleteWorkflow,
  runLambda,
  fetchDefaultWorkflow,
  exportWorkflowDownload,
  importWorkflowJSON,
  importWorkflowFile,
} from "./api";

export default function App() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

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
      setTimeout(() => setStatus(""), 2000);
    } catch {
      setStatus("Run failed");
      setTimeout(() => setStatus(""), 2000);
    }
  };

  const onExport = (id: string) => exportWorkflowDownload(id);

  const onImportJSON = async () => {
    const wf = await importWorkflowJSON({ name: "Imported (JSON body)", nodes: [], edges: [] });
    setWorkflows((w) => [...w, wf]);
  };

  const onImportFileClick = () => fileRef.current?.click();
  const onImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const wf = await importWorkflowFile(f);
    setWorkflows((w) => [...w, wf]);
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside
        style={{
          width: 300,
          borderRight: "1px solid #ddd",
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <h3 style={{ margin: 0 }}>Workflows</h3>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={onCreate}>+ New</button>
          <button onClick={onImportJSON}>Import (JSON)</button>
          <button onClick={onImportFileClick}>Import (File)</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={onImportFileChange}
          />
        </div>

        <ul style={{ listStyle: "none", padding: 0, marginTop: 6 }}>
          {workflows.map((wf) => (
            <li key={wf.id} style={{ marginBottom: 8 }}>
              <button onClick={() => setSelected(wf.id)} style={{ fontWeight: selected === wf.id ? 700 : 400 }}>
                {wf.name}
              </button>
              <button onClick={() => onRun(wf.id)} style={{ marginLeft: 6 }}>▶️ Run</button>
              <button onClick={() => onExport(wf.id)} style={{ marginLeft: 6 }}>⬇️ Export</button>
              <button onClick={() => onDelete(wf.id)} style={{ marginLeft: 6 }}>🗑️</button>
            </li>
          ))}
        </ul>
        <div style={{ minHeight: 20, opacity: 0.8 }}>{status}</div>
      </aside>

      <main style={{ flex: 1 }}>
        {selected ? <Canvas workflowId={selected} /> : <p style={{ padding: 12 }}>Select or create a workflow</p>}
      </main>
    </div>
  );
}
