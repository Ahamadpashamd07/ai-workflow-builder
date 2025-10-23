import { useCallback, useEffect, useState } from "react";
import ReactFlow, { Background, Controls, addEdge, MiniMap } from "reactflow";
import type { Connection, Edge, Node } from "reactflow";
import "reactflow/dist/style.css";
import { fetchWorkflow, saveWorkflow } from "./api";

export default function Canvas({ workflowId }: { workflowId: string }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    (async () => {
      const wf = await fetchWorkflow(workflowId);
      setName(wf.name);
      setNodes((wf.nodes as Node[]) || []);
      setEdges((wf.edges as Edge[]) || []);
    })().catch(console.error);
  }, [workflowId]);

  useEffect(() => {
    if (!workflowId) return;
    const t = setTimeout(() => {
      saveWorkflow(workflowId, nodes, edges, name).catch(console.error);
    }, 400);
    return () => clearTimeout(t);
  }, [workflowId, nodes, edges, name]);

  const onConnect = useCallback((c: Connection) => setEdges((eds) => addEdge(c, eds)), []);
  const addNode = () => {
    setNodes((nds) => {
      const id = (nds.length + 1).toString();
      return [...nds, { id, data: { label: `Node ${id}` }, position: { x: Math.random()*400, y: Math.random()*200 } }];
    });
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <div style={{ padding: 8, borderBottom: "1px solid #ddd", display: "flex", gap: 8 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workflow name" style={{ padding: 6, minWidth: 240 }} />
        <button onClick={addNode}>+ Add Node</button>
        <span style={{ opacity: 0.7 }}>Auto-saves…</span>
      </div>
      <ReactFlow nodes={nodes} edges={edges} onConnect={onConnect} fitView>
        <MiniMap /><Controls /><Background />
      </ReactFlow>
    </div>
  );
}
