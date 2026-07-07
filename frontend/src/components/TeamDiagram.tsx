import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
  Panel,
  addEdge,
  type Node,
  type Edge,
  type NodeProps,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Trash2, Users, Save, X } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

type RootData   = { label: string };
type TeamData   = { name: string; teamType: string; color: string };
type MemberData = { name: string; role: string };

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLES = ['Administrateur', 'Incident Manager', 'Technicien', 'Client'] as const;

const ROLE_EMOJI: Record<string, string> = {
  'Administrateur':   '🛡️',
  'Incident Manager': '👑',
  'Technicien':       '🔧',
  'Client':           '👤',
};

const ROLE_COLOR: Record<string, string> = {
  'Administrateur':   'orange',
  'Incident Manager': 'sky',
  'Technicien':       'rose',
  'Client':           'green',
};

const TEAM_COLORS = ['sky', 'green', 'rose', 'amber', 'indigo', 'purple', 'teal'] as const;

// Static color map so Tailwind can scan all class names
const C: Record<string, { bg: string; border: string; text: string }> = {
  sky:    { bg: 'bg-sky-50',    border: 'border-sky-300',    text: 'text-sky-700'    },
  green:  { bg: 'bg-green-50',  border: 'border-green-300',  text: 'text-green-700'  },
  rose:   { bg: 'bg-rose-50',   border: 'border-rose-300',   text: 'text-rose-700'   },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-300',  text: 'text-amber-700'  },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-300',   text: 'text-teal-700'   },
};

// ─── Custom node components ───────────────────────────────────────────────────

function RootNode({ data }: NodeProps) {
  const d = data as unknown as RootData;
  return (
    <>
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl px-8 py-4 shadow-xl min-w-[200px] text-center cursor-grab active:cursor-grabbing select-none">
        <div className="text-lg font-bold tracking-tight">{d.label}</div>
        <div className="text-indigo-200 text-xs mt-0.5">Organisation</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#818CF8', width: 8, height: 8, border: '2px solid #fff' }}
      />
    </>
  );
}

function TeamNode({ data, selected }: NodeProps) {
  const d  = data as unknown as TeamData;
  const c  = C[d.color] ?? C.indigo;
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#94A3B8', width: 8, height: 8, border: '2px solid #fff' }}
      />
      <div
        className={`
          ${c.bg} border-2 ${c.border} rounded-xl px-5 py-3 shadow
          min-w-[170px] text-center cursor-grab active:cursor-grabbing select-none
          transition-shadow
          ${selected ? 'ring-2 ring-offset-2 ring-indigo-400 shadow-lg' : 'hover:shadow-md'}
        `}
      >
        <div className={`text-sm font-bold ${c.text}`}>👥 {d.name}</div>
        <div className="text-[10px] text-gray-500 mt-0.5">{d.teamType}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#94A3B8', width: 8, height: 8, border: '2px solid #fff' }}
      />
    </>
  );
}

function MemberNode({ data, selected }: NodeProps) {
  const d     = data as unknown as MemberData;
  const color = ROLE_COLOR[d.role] ?? 'sky';
  const c     = C[color];
  const emoji = ROLE_EMOJI[d.role] ?? '👤';
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#94A3B8', width: 6, height: 6, border: '2px solid #fff' }}
      />
      <div
        className={`
          bg-white border ${c.border} rounded-xl px-4 py-2 shadow-sm
          min-w-[150px] text-center cursor-grab active:cursor-grabbing select-none
          transition-shadow
          ${selected ? 'ring-2 ring-offset-1 ring-indigo-400 shadow-md' : 'hover:shadow'}
        `}
      >
        <div className="text-xs font-semibold text-gray-800">{emoji} {d.name}</div>
        <div className={`text-[10px] font-medium mt-0.5 ${c.text}`}>{d.role}</div>
      </div>
    </>
  );
}

const nodeTypes = { root: RootNode, team: TeamNode, member: MemberNode };

// ─── Initial data ─────────────────────────────────────────────────────────────

const RAW_TEAMS = [
  { id: 't1', name: 'Reseau',  teamType: 'Support Technique',   color: 'sky'    },
  { id: 't2', name: 'Base de donnees',  teamType: 'Data',     color: 'green'  },
  { id: 't3', name: 'Système',  teamType: 'Infrastructure',      color: 'rose'   },
  { id: 't4', name: 'Applicatif',       teamType: 'Development', color: 'amber'  },

];

const RAW_MEMBERS = [
  { id: 'm1',  teamId: 't1', name: 'Marie Martin',   role: 'Incident Manager' },
  { id: 'm2',  teamId: 't1', name: 'Thomas Bernard', role: 'Technicien'       },
  { id: 'm3',  teamId: 't1', name: 'Lucas Petit',    role: 'Technicien'       },
  { id: 'm4',  teamId: 't2', name: 'Sophie Leroy',   role: 'Client'           },
  { id: 'm5',  teamId: 't2', name: 'Paul Roux',      role: 'Client'           },
  { id: 'm6',  teamId: 't3', name: 'Ahmed Benali',   role: 'Technicien'       },
  { id: 'm7',  teamId: 't3', name: 'Claire Morin',   role: 'Technicien'       },
  { id: 'm8',  teamId: 't3', name: 'Nicolas Dubois', role: 'Technicien'       },
  { id: 'm9',  teamId: 't4', name: 'Jean Dupont',    role: 'Client'           },
  { id: 'm10', teamId: 't4', name: 'Emma Laurent',   role: 'Client'           },
  { id: 'm11', teamId: 't5', name: 'Admin DXC',      role: 'Administrateur'   },
  { id: 'm12', teamId: 't5', name: 'Responsable IT', role: 'Administrateur'   },
];

function buildInitialGraph(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const n = RAW_TEAMS.length;
  const TEAM_SPACING  = 400;
  const MEMBER_SPACING = 175;

  nodes.push({
    id: 'root',
    type: 'root',
    position: { x: 0, y: 0 },
    data: { label: '🏢 DXC Technology' },
  });

  RAW_TEAMS.forEach((team, ti) => {
    const tx = (ti - (n - 1) / 2) * TEAM_SPACING;
    const ty = 180;

    nodes.push({
      id: team.id,
      type: 'team',
      position: { x: tx, y: ty },
      data: { name: team.name, teamType: team.teamType, color: team.color },
    });

    edges.push({
      id: `root-${team.id}`,
      source: 'root',
      target: team.id,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#A5B4FC' },
      style: { stroke: '#A5B4FC', strokeWidth: 2 },
    });

    const members = RAW_MEMBERS.filter(m => m.teamId === team.id);
    members.forEach((member, mi) => {
      nodes.push({
        id: member.id,
        type: 'member',
        position: {
          x: tx + (mi - (members.length - 1) / 2) * MEMBER_SPACING,
          y: ty + 180,
        },
        data: { name: member.name, role: member.role },
      });
      edges.push({
        id: `${team.id}-${member.id}`,
        source: team.id,
        target: member.id,
        type: 'smoothstep',
        style: { stroke: '#CBD5E1', strokeWidth: 1.5 },
      });
    });
  });

  return { nodes, edges };
}

const { nodes: INIT_NODES, edges: INIT_EDGES } = buildInitialGraph();

// ─── Edit panel ───────────────────────────────────────────────────────────────

interface EditPanelProps {
  node: Node | null;
  onClose: () => void;
  onSave: (id: string, data: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onAddMember: (teamId: string) => void;
}

function EditPanel({ node, onClose, onSave, onDelete, onAddMember }: EditPanelProps) {
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (node) setForm(node.data as Record<string, string>);
  }, [node?.id]);

  if (!node) return null;

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="absolute right-0 top-0 h-full w-72 bg-white border-l border-gray-100 shadow-2xl z-20 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h3 className="font-bold text-gray-800 text-sm">
            {node.type === 'root' ? '🏢 Organisation' : node.type === 'team' ? '👥 Équipe' : '👤 Membre'}
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Cliquez sur Enregistrer pour confirmer</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Fields */}
      <div className="p-4 flex-1 overflow-auto space-y-4">
        {/* Root node */}
        {node.type === 'root' && (
          <label className="block">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nom</span>
            <input
              value={form.label ?? ''}
              onChange={e => set('label', e.target.value)}
              className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
            />
          </label>
        )}

        {/* Team node */}
        {node.type === 'team' && (
          <>
            <label className="block">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nom de l'équipe</span>
              <input
                value={form.name ?? ''}
                onChange={e => set('name', e.target.value)}
                className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type d'équipe</span>
              <input
                value={form.teamType ?? ''}
                onChange={e => set('teamType', e.target.value)}
                className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
              />
            </label>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Couleur</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {TEAM_COLORS.map(col => (
                  <button
                    key={col}
                    title={col}
                    onClick={() => set('color', col)}
                    className={`
                      w-7 h-7 rounded-full border-2 transition-all
                      ${C[col].bg}
                      ${form.color === col
                        ? 'border-indigo-500 scale-125 shadow-md'
                        : 'border-gray-200 hover:scale-110'}
                    `}
                  />
                ))}
              </div>
            </div>
            <div className="pt-1">
              <button
                onClick={() => { onSave(node.id, form); onAddMember(node.id); }}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 rounded-xl py-2 text-xs font-medium transition-colors"
              >
                <Users className="w-3.5 h-3.5" /> Ajouter un membre
              </button>
            </div>
          </>
        )}

        {/* Member node */}
        {node.type === 'member' && (
          <>
            <label className="block">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nom complet</span>
              <input
                value={form.name ?? ''}
                onChange={e => set('name', e.target.value)}
                className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
              />
            </label>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rôle</span>
              <div className="mt-2 space-y-1.5">
                {ROLES.map(r => {
                  const col = ROLE_COLOR[r];
                  const c   = C[col];
                  const selected = form.role === r;
                  return (
                    <button
                      key={r}
                      onClick={() => set('role', r)}
                      className={`
                        w-full text-left px-3 py-2 rounded-xl text-sm border-2 transition-all
                        flex items-center gap-2 font-medium
                        ${selected
                          ? `${c.bg} ${c.border} ${c.text}`
                          : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'}
                      `}
                    >
                      <span className="text-base">{ROLE_EMOJI[r]}</span>
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <button
          onClick={() => { onSave(node.id, form); onClose(); }}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow"
        >
          <Save className="w-4 h-4" /> Enregistrer
        </button>
        {node.type !== 'root' && (
          <button
            onClick={() => { onDelete(node.id); onClose(); }}
            className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Supprimer
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main diagram component ───────────────────────────────────────────────────

export default function TeamDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INIT_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INIT_EDGES);
  const [selectedNode, setSelectedNode]  = useState<Node | null>(null);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  const onConnect = useCallback<OnConnect>(
    params =>
      setEdges(eds =>
        addEdge({ ...params, type: 'smoothstep', style: { stroke: '#CBD5E1', strokeWidth: 1.5 } }, eds)
      ),
    [setEdges]
  );

  const handleSave = useCallback((id: string, data: Record<string, unknown>) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data } : n));
    setSelectedNode(prev => prev?.id === id ? { ...prev, data } : prev);
  }, [setNodes]);

  const handleDelete = useCallback((id: string) => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const addTeam = useCallback(() => {
    const id = `t-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'team',
      position: { x: (Math.random() - 0.5) * 600, y: 180 },
      data: { name: 'Nouvelle équipe', teamType: "Type d'équipe", color: 'indigo' },
    };
    setNodes(nds => [...nds, newNode]);
    setEdges(eds => [...eds, {
      id: `root-${id}`,
      source: 'root',
      target: id,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#A5B4FC' },
      style: { stroke: '#A5B4FC', strokeWidth: 2 },
    }]);
    setSelectedNode(newNode);
  }, [setNodes, setEdges]);

  const addMember = useCallback((teamId: string) => {
    const id = `m-${Date.now()}`;
    const teamNode = nodes.find(n => n.id === teamId);
    const newNode: Node = {
      id,
      type: 'member',
      position: {
        x: (teamNode?.position.x ?? 0) + (Math.random() - 0.5) * 60,
        y: (teamNode?.position.y ?? 180) + 180,
      },
      data: { name: 'Nouveau membre', role: 'Technicien' },
    };
    setNodes(nds => [...nds, newNode]);
    setEdges(eds => [...eds, {
      id: `${teamId}-${id}`,
      source: teamId,
      target: id,
      type: 'smoothstep',
      style: { stroke: '#CBD5E1', strokeWidth: 1.5 },
    }]);
    setSelectedNode(newNode);
  }, [nodes, setNodes, setEdges]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: '580px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.15}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-slate-50"
      >
        <Background color="#E2E8F0" gap={24} />
        <Controls className="!shadow-md !rounded-xl !border !border-gray-100" />
        <MiniMap
          nodeColor={n => {
            if (n.type === 'root')   return '#6366F1';
            if (n.type === 'team')   return '#A5B4FC';
            return '#CBD5E1';
          }}
          className="!rounded-xl !border !border-gray-100 !shadow-md"
        />

        {/* Top-left toolbar */}
        <Panel position="top-left" className="flex items-center gap-2 mt-1 ml-1">
          <button
            onClick={addTeam}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Nouvelle équipe
          </button>

          {/* Tip shown when no node is selected */}
          {!selectedNode && (
            <span className="text-[10px] text-gray-400 bg-white/80 backdrop-blur px-2 py-1 rounded-lg border border-gray-100">
              Cliquez sur un nœud pour le modifier · Glissez pour déplacer
            </span>
          )}

          {/* Add member shortcut when a team is selected */}
          {selectedNode?.type === 'team' && (
            <button
              onClick={() => addMember(selectedNode.id)}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold py-2 px-3 rounded-xl shadow-sm transition-colors"
            >
              <Users className="w-3.5 h-3.5" /> Ajouter un membre
            </button>
          )}
        </Panel>
      </ReactFlow>

      {/* Edit panel — slides in from the right */}
      <EditPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onSave={handleSave}
        onDelete={handleDelete}
        onAddMember={addMember}
      />
    </div>
  );
}
