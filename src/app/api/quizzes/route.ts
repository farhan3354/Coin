import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data");
const FILE = path.join(DATA_PATH, "quizzes.json");

async function ensure() {
  try {
    await fs.mkdir(DATA_PATH, { recursive: true });
    await fs.access(FILE).catch(async () => {
      await fs.writeFile(FILE, "[]", "utf8");
    });
  } catch (e) {
    // ignore
  }
}

export async function GET() {
  await ensure();
  const raw = await fs.readFile(FILE, "utf8").catch(() => "[]");
  const quizzes = JSON.parse(raw || "[]");
  return NextResponse.json(quizzes);
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "admin") return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await ensure();
  const raw = await fs.readFile(FILE, "utf8").catch(() => "[]");
  const quizzes = JSON.parse(raw || "[]");
  const id = `q_${Date.now().toString(36)}`;
  const created = { ...body, id, createdAt: new Date().toISOString() };
  quizzes.unshift(created);
  await fs.writeFile(FILE, JSON.stringify(quizzes, null, 2), "utf8");
  return NextResponse.json(created);
}
