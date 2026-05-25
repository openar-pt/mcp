#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API = "https://api.openar.pt";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

function qs(params: Record<string, string | number | boolean | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") p.append(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

const server = new McpServer({
  name: "openar",
  version: "0.1.0",
});

// ── Meta ────────────────────────────────────────────────────────────────────

server.tool(
  "get_meta",
  "Get available filter values: legislaturas, grupos parlamentares, tipos de iniciativa",
  { legislatura: z.string().optional().describe("Filter grupos/tipos to a specific legislatura") },
  async ({ legislatura }) => {
    const data = await get(`/meta${qs({ legislatura })}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Iniciativas ──────────────────────────────────────────────────────────────

server.tool(
  "list_iniciativas",
  "List legislative initiatives with optional filters",
  {
    legislatura: z.string().optional().describe("e.g. XVII, XVI"),
    tipo: z.enum(["R", "P", "J", "D", "S", "A", "I", "C"]).optional()
      .describe("R=Resolução P=Proposta J=Projeto D=Decreto S=Outros A=Apreciação I=Europeia C=Pergunta"),
    estado: z.string().optional().describe("e.g. Aprovado, Rejeitado, Caducado"),
    grupo: z.string().optional().describe("Party abbreviation e.g. PS, PSD, CH"),
    resultado: z.enum(["aprovado", "rejeitado", "pendente"]).optional(),
    q: z.string().optional().describe("Search in title"),
    deputado: z.string().optional().describe("Deputy ID or name (partial match)"),
    page: z.number().int().min(1).default(1).optional(),
    limit: z.number().int().min(1).max(200).default(50).optional(),
  },
  async (params) => {
    const data = await get(`/iniciativas${qs(params)}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_iniciativa",
  "Get a legislative initiative with full detail: authors, events, votes, publications, and committee phases (comissoesFases) with rapporteurs, documents, and hearings",
  { id: z.number().int().describe("Initiative ID (IniId)") },
  async ({ id }) => {
    const data = await get(`/iniciativas/${id}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Deputados ────────────────────────────────────────────────────────────────

server.tool(
  "list_deputados",
  "List MPs with optional filters",
  {
    legislatura: z.string().optional().describe("e.g. XVII"),
    grupo: z.string().optional().describe("Party abbreviation e.g. PS, PSD, BE"),
    q: z.string().optional().describe("Search by name"),
    situacao: z.string().optional().describe("Use 'ativo' for current MPs"),
    page: z.number().int().min(1).default(1).optional(),
    limit: z.number().int().min(1).max(200).default(50).optional(),
  },
  async (params) => {
    const data = await get(`/deputados${qs(params)}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_deputado",
  "Get an MP with all their mandates and recent initiatives",
  { id: z.number().int().describe("Deputy ID (DepCadId)") },
  async ({ id }) => {
    const data = await get(`/deputados/${id}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_deputado_atividade",
  "Get full parliamentary activity for an MP: initiatives, requirements, plenary interventions, committees",
  {
    id: z.number().int().describe("Deputy ID (DepCadId)"),
    legislatura: z.string().optional().describe("e.g. XVII — omit for full history"),
  },
  async ({ id, legislatura }) => {
    const data = await get(`/deputados/${id}/atividade${qs({ legislatura })}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Votações ─────────────────────────────────────────────────────────────────

server.tool(
  "list_votacoes",
  "List plenary votes with optional filters",
  {
    legislatura: z.string().optional().describe("e.g. XVII"),
    resultado: z.enum(["Aprovado", "Rejeitado"]).optional(),
    unanime: z.boolean().optional(),
    data_inicio: z.string().optional().describe("YYYY-MM-DD"),
    data_fim: z.string().optional().describe("YYYY-MM-DD"),
    page: z.number().int().min(1).default(1).optional(),
    limit: z.number().int().min(1).max(200).default(50).optional(),
  },
  async (params) => {
    const data = await get(`/votacoes${qs(params)}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_votacao",
  "Get a single vote with party breakdown",
  {
    id: z.string().describe("Vote ID"),
    iniciativa_id: z.number().int().describe("Initiative ID (required — vote IDs are unique per initiative)"),
  },
  async ({ id, iniciativa_id }) => {
    const data = await get(`/votacoes/${id}${qs({ iniciativa_id })}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Petições ─────────────────────────────────────────────────────────────────

server.tool(
  "list_peticoes",
  "List petitions with optional filters",
  {
    legislatura: z.string().optional().describe("e.g. XVII"),
    situacao: z.string().optional().describe("e.g. Admitida, Arquivada"),
    q: z.string().optional().describe("Search in subject"),
    page: z.number().int().min(1).default(1).optional(),
    limit: z.number().int().min(1).max(200).default(50).optional(),
  },
  async (params) => {
    const data = await get(`/peticoes${qs(params)}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_peticao",
  "Get a petition with committees, rapporteurs, and documents",
  { id: z.number().int().describe("Petition ID") },
  async ({ id }) => {
    const data = await get(`/peticoes/${id}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Comissões ────────────────────────────────────────────────────────────────

server.tool(
  "list_comissoes",
  "List parliamentary committees. Each committee is identified by a numero and may appear across multiple initiatives and legislatures.",
  {
    legislatura: z.string().optional().describe("Filter by the legislatura of associated initiatives, e.g. XVII"),
    q: z.string().optional().describe("Search in committee name"),
    page: z.number().int().min(1).default(1).optional(),
    limit: z.number().int().min(1).max(200).default(50).optional(),
  },
  async (params) => {
    const data = await get(`/comissoes${qs(params)}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_comissao",
  "Get a parliamentary committee with its paginated list of initiatives and rapporteurs per initiative",
  {
    numero: z.string().describe("Committee identifier, e.g. 1COM"),
    legislatura: z.string().optional().describe("Filter initiatives by legislatura, e.g. XVII"),
    page: z.number().int().min(1).default(1).optional(),
    limit: z.number().int().min(1).max(200).default(50).optional(),
  },
  async ({ numero, ...params }) => {
    const data = await get(`/comissoes/${encodeURIComponent(numero)}${qs(params)}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
