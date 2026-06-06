import { runAdvisor, type AdvisorRequest } from "../src/lib/advisorHandler";

type Req = { method?: string; body?: unknown };
type Res = {
  status: (code: number) => { json: (body: unknown) => void; end: () => void };
  setHeader: (name: string, value: string) => void;
};

export default async function handler(req: Req, res: Res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { status, body } = await runAdvisor(req.body as AdvisorRequest, process.env.VITE_ANTHROPIC_API_KEY);
  return res.status(status).json(body);
}
