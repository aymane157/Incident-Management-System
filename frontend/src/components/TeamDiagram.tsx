import { useEffect, useMemo, useState } from 'react';
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
import type { MouseEvent } from 'react';
import '@xyflow/react/dist/style.css';
import { Plus, Trash2, Users, Save, X } from 'lucide-react';
import type { TeamDto } from '../lib/api';

type RootData = { label: string };
type TeamData = { name: string; teamType: string; color: string; size: number };
type MemberData = { name: string; role: string };

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrateur',
  CLIENT: 'Client',
  INCIDENT_MANAGER: 'Incident Manager',
  MEMBRE_EQUIPE: 'Technicien',
  RESPONSABLE_TRAITEMENT: 'Responsable traitement',
};

const ROLE_EMOJI: Record<string, string> = {
  Administrateur: '🛡️',
  'Incident Manager': '🧭',
  Technicien: '🔧',
  Client: '👤',
  'Responsable traitement': '📋',
};

const ROLE_COLOR: Record<string, string> = {
  Administrateur: 'orange',
  'Incident Manager': 'sky',
  Technicien: 'rose',
  Client: 'green',
  'Responsable traitement': 'indigo',
};

const TEAM_COLORS = ['sky', 'green', 'rose', 'amber', 'indigo', 'purple', 'teal'] as const;

const C: Record<string, { bg: string; border: string; text: string }> = {
  sky: { bg: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-700' },
  green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-700' },
};

function RootNode({ data }: NodeProps) {
  const d = data as unknown as RootData;
  return (
    <>
      <div className="min-w-[200px] select-none rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 px-8 py-4 text-center font-bold tracking-tight text-white shadow-xl">
        <div className="text-lg">{d.label}</div>
        <div className="mt-0.5 text-xs text-indigo-200">Organisation</div>
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
  const d = data as unknown as TeamData;
  const c = C[d.color] ?? C.indigo;
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#94A3B8', width: 8, height: 8, border: '2px solid #fff' }}
      />
      <div
        className={[
          'min-w-[170px] select-none rounded-xl border-2 px-5 py-3 text-center shadow transition-shadow',
          c.bg,
          c.border,
          selected ? 'ring-2 ring-indigo-400 ring-offset-2 shadow-lg' : 'hover:shadow-md',
        ].join(' ')}
      >
        <div className={`text-sm font-bold ${c.text}`}>👥 {d.name}</div>
        <div className="mt-0.5 text-[10px] text-gray-500">{d.teamType}</div>
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          {d.size} member{d.size === 1 ? '' : 's'}
        </div>
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
  const d = data as unknown as MemberData;
  const color = ROLE_COLOR[d.role] ?? 'sky';
  const c = C[color];
  const emoji = ROLE_EMOJI[d.role] ?? '👤';
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#94A3B8', width: 6, height: 6, border: '2px solid #fff' }}
      />
      <div
        className={[
          'min-w-[150px] select-none rounded-xl border bg-white px-4 py-2 text-center shadow-sm transition-shadow',
          c.border,
          selected ? 'ring-2 ring-indigo-400 ring-offset-1 shadow-md' : 'hover:shadow',
        ].join(' ')}
      >
        <div className="text-xs font-semibold text-gray-800">
          {emoji} {d.name}
        </div>
        <div className={`mt-0.5 text-[10px] font-medium ${c.text}`}>{d.role}</div>
      </div>
    </>
  );
}

const nodeTypes = { root: RootNode, team: TeamNode, member: MemberNode };

function normalizeRole(role?: string | null): string {
  if (!role) return 'Technicien';
  return ROLE_LABEL[role] ?? role.replace(/_/g, ' ');
}

function pickTeamColor(index: number): string {
  return TEAM_COLORS[index % TEAM_COLORS.length];
}

function buildGraph(teams: TeamDto[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    {
      id: 'root',
      type: 'root',
      position: { x: 0, y: 0 },
      data: { label: 'DXC Technology' },
    },
  ];
  const edges: Edge[] = [];

  if (teams.length === 0) {
    return { nodes, edges };
  }

  const teamSpacing = 380;
  const memberSpacing = 170;

  teams.forEach((team, teamIndex) => {
    const members = team.members ?? [];
    const teamX = (teamIndex - (teams.length - 1) / 2) * teamSpacing;
    const teamY = 180;
    const color = pickTeamColor(teamIndex);
    const teamType = team.functionRole ? team.functionRole.replace(/_/g, ' ') : 'Equipe';

    nodes.push({
      id: `team-${team.id}`,
      type: 'team',
      position: { x: teamX, y: teamY },
      data: {
        name: team.name ?? 'Equipe sans nom',
        teamType,
        color,
        size: members.length,
      },
    });

    edges.push({
      id: `root-team-${team.id}`,
      source: 'root',
      target: `team-${team.id}`,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#A5B4FC' },
      style: { stroke: '#A5B4FC', strokeWidth: 2 },
    });

    members.forEach((member, memberIndex) => {
      nodes.push({
        id: `member-${member.id}`,
        type: 'member',
        position: {
          x: teamX + (memberIndex - (members.length - 1) / 2) * memberSpacing,
          y: teamY + 180,
        },
        data: {
          name: [member.firstName, member.lastName].filter(Boolean).join(' ') || member.email || 'Membre',
          role: normalizeRole(member.role),
        },
      });

      edges.push({
        id: `team-${team.id}-member-${member.id}`,
        source: `team-${team.id}`,
        target: `member-${member.id}`,
        type: 'smoothstep',
        style: { stroke: '#CBD5E1', strokeWidth: 1.5 },
      });
    });
  });

  return { nodes, edges };
}

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

  const set = (key: string, val: string) => setForm((current) => ({ ...current, [key]: val }));

  return (
    <div className="absolute right-0 top-0 z-20 flex h-full w-72 flex-col border-l border-gray-100 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">
            {node.type === 'root' ? 'Organisation' : node.type === 'team' ? 'Equipe' : 'Membre'}
          </h3>
          <p className="mt-0.5 text-[10px] text-gray-400">Cliquez sur Enregistrer pour confirmer</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-gray-200">
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-auto p-4">
        {node.type === 'root' && (
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nom</span>
            <input
              value={form.label ?? ''}
              onChange={(event) => set('label', event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </label>
        )}

        {node.type === 'team' && (
          <>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Nom de l'equipe
              </span>
              <input
                value={form.name ?? ''}
                onChange={(event) => set('name', event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Type d'equipe
              </span>
              <input
                value={form.teamType ?? ''}
                onChange={(event) => set('teamType', event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </label>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Couleur</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {TEAM_COLORS.map((color) => (
                  <button
                    key={color}
                    title={color}
                    onClick={() => set('color', color)}
                    className={[
                      'h-7 w-7 rounded-full border-2 transition-all',
                      C[color].bg,
                      form.color === color
                        ? 'scale-125 border-indigo-500 shadow-md'
                        : 'border-gray-200 hover:scale-110',
                    ].join(' ')}
                  />
                ))}
              </div>
            </div>
            <div className="pt-1">
              <button
                onClick={() => {
                  onSave(node.id, form);
                  onAddMember(node.id);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-600"
              >
                <Users className="h-3.5 w-3.5" /> Ajouter un membre
              </button>
            </div>
          </>
        )}

        {node.type === 'member' && (
          <>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nom complet</span>
              <input
                value={form.name ?? ''}
                onChange={(event) => set('name', event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Role</span>
              <input
                value={form.role ?? ''}
                onChange={(event) => set('role', event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </label>
          </>
        )}
      </div>

      <div className="space-y-2 border-t border-gray-100 p-4">
        <button
          onClick={() => {
            onSave(node.id, form);
            onClose();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow transition-colors hover:bg-indigo-700"
        >
          <Save className="h-4 w-4" /> Enregistrer
        </button>
        {node.type !== 'root' && (
          <button
            onClick={() => {
              onDelete(node.id);
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Supprimer
          </button>
        )}
      </div>
    </div>
  );
}

export default function TeamDiagram({ teams }: { teams: TeamDto[] }) {
  const graph = useMemo(() => buildGraph(teams), [teams]);
  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    setNodes(graph.nodes);
    setEdges(graph.edges);
    setSelectedNode(null);
  }, [graph.nodes, graph.edges, setNodes, setEdges]);

  const onNodeClick = (_event: MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const onPaneClick = () => setSelectedNode(null);

  const onConnect = (params: Parameters<OnConnect>[0]) => {
    setEdges((current) =>
      addEdge({ ...params, type: 'smoothstep', style: { stroke: '#CBD5E1', strokeWidth: 1.5 } }, current)
    );
  };

  const handleSave = (id: string, data: Record<string, unknown>) => {
    setNodes((current) => current.map((node) => (node.id === id ? { ...node, data } : node)));
    setSelectedNode((current) => (current?.id === id ? { ...current, data } : current));
  };

  const handleDelete = (id: string) => {
    setNodes((current) => current.filter((node) => node.id !== id));
    setEdges((current) => current.filter((edge) => edge.source !== id && edge.target !== id));
    setSelectedNode(null);
  };

  const addTeam = () => {
    const id = `team-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'team',
      position: { x: (Math.random() - 0.5) * 600, y: 180 },
      data: { name: 'Nouvelle equipe', teamType: 'Equipe', color: 'indigo', size: 0 },
    };

    setNodes((current) => [...current, newNode]);
    setEdges((current) => [
      ...current,
      {
        id: `root-${id}`,
        source: 'root',
        target: id,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#A5B4FC' },
        style: { stroke: '#A5B4FC', strokeWidth: 2 },
      },
    ]);
    setSelectedNode(newNode);
  };

  const addMember = (teamId: string) => {
    const id = `member-${Date.now()}`;
    const teamNode = nodes.find((node) => node.id === teamId);
    const newNode: Node = {
      id,
      type: 'member',
      position: {
        x: (teamNode?.position.x ?? 0) + (Math.random() - 0.5) * 60,
        y: (teamNode?.position.y ?? 180) + 180,
      },
      data: { name: 'Nouveau membre', role: 'Technicien' },
    };

    setNodes((current) => [...current, newNode]);
    setEdges((current) => [
      ...current,
      {
        id: `${teamId}-${id}`,
        source: teamId,
        target: id,
        type: 'smoothstep',
        style: { stroke: '#CBD5E1', strokeWidth: 1.5 },
      },
    ]);
    setSelectedNode(newNode);
  };

  const hasTeams = teams.length > 0;

  return (
    <div className="relative h-[580px] w-full overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
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
        <Controls className="!rounded-xl !border !border-gray-100 !shadow-md" />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'root') return '#6366F1';
            if (node.type === 'team') return '#A5B4FC';
            return '#CBD5E1';
          }}
          className="!rounded-xl !border !border-gray-100 !shadow-md"
        />

        <Panel position="top-left" className="ml-1 mt-1 flex items-center gap-2">
          <button
            onClick={addTeam}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" /> Nouvelle equipe
          </button>

          {!selectedNode && (
            <span className="rounded-lg border border-gray-100 bg-white/80 px-2 py-1 text-[10px] text-gray-400 backdrop-blur">
              Cliquez sur un noeud pour le modifier
            </span>
          )}

          {selectedNode?.type === 'team' && (
            <button
              onClick={() => addMember(selectedNode.id)}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <Users className="h-3.5 w-3.5" /> Ajouter un membre
            </button>
          )}
        </Panel>
      </ReactFlow>

      {!hasTeams && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/40">
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm text-gray-500 shadow-sm">
            Aucune equipe disponible pour le moment
          </div>
        </div>
      )}

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
