// Types for the parts of apps/editor/core.js the server uses. The file is copied into src/data by scripts/sync-editor.mjs.
declare module "@/data/epixo-core.cjs" {
  export type Board = { id: string; brand: string; name: string; w: number; h: number; round: boolean; rot?: number; [k: string]: unknown };
  export type Project = { name: string; pid?: string; board: Board; cur: string | null; screens: { id: string; name: string; widgets: unknown[] }[]; [k: string]: unknown };
  export type ToolSpec = { name: string; description: string; inputSchema: Record<string, unknown> };
  const core: {
    BOARDS: Board[];
    TPL: Record<string, { n: string; d: string }>;
    READ_ONLY: Record<string, 1>;
    DESIGN_RULES: string;
    toolSpecs(): ToolSpec[];
    toolNote(name: string, input: Record<string, unknown>): string;
    runTool(p: Project, name: string, input: Record<string, unknown>): unknown;
    blank(board: Board): Project;
    mkScreen(p: Project, name: string): { id: string };
    addTemplate(p: Project, key: string, w: number, h: number, round: boolean): { id: string }[];
    withRotation(b: Board, rot: number): Board;
  };
  export default core;
}
