import { NextRequest, NextResponse } from "next/server";
import { postQuestions, roles, type RoleKey } from "@/lib/training";

const encoder = new TextEncoder();

function base64url(input: Uint8Array | string) {
  const bytes = typeof input === "string" ? encoder.encode(input) : input;
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return new Uint8Array([...binary].map((char) => char.charCodeAt(0)));
}

async function sign(payload: string) {
  const secret = process.env.CERT_SECRET;
  if (!secret) throw new Error("CERT_SECRET belum dikonfigurasi");
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

async function equalSignature(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { role?: RoleKey; post?: number[]; scenarios?: number[] };
    if (!body.role || !(body.role in roles) || !Array.isArray(body.post) || !Array.isArray(body.scenarios)) {
      return NextResponse.json({ error: "Data asesmen tidak lengkap." }, { status: 400 });
    }
    const questions = postQuestions(body.role);
    const postScore = body.post.reduce((sum, value, index) => sum + (value === questions[index]?.answer ? 1 : 0), 0);
    const scenarioScore = body.scenarios.reduce((sum, value, index) => sum + (value === roles[body.role!].scenarios[index]?.answer ? 1 : 0), 0);
    if (body.post.length !== 5 || body.scenarios.length !== 3 || postScore < 4 || scenarioScore < 2) {
      return NextResponse.json({ error: "Kriteria lulus belum tercapai.", postScore, scenarioScore }, { status: 403 });
    }
    const issued = new Date().toISOString().slice(0, 10);
    const payloadObject = { v: 1, r: body.role, s: postScore * 20, p: scenarioScore, d: issued, n: crypto.randomUUID().slice(0, 8) };
    const payload = base64url(JSON.stringify(payloadObject));
    const signature = base64url(await sign(payload));
    return NextResponse.json({ code: `SSU-${payload}.${signature}`, role: roles[body.role].title, score: postScore * 20, scenarioScore, issued });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Sertifikat gagal dibuat." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code")?.trim() || "";
    if (!code.startsWith("SSU-") || !code.includes(".")) return NextResponse.json({ valid: false });
    const [payload, encodedSignature] = code.slice(4).split(".");
    const expected = await sign(payload);
    const received = fromBase64url(encodedSignature);
    if (!(await equalSignature(expected, received))) return NextResponse.json({ valid: false });
    const decoded = new TextDecoder().decode(fromBase64url(payload));
    const data = JSON.parse(decoded) as { v: number; r: RoleKey; s: number; p: number; d: string };
    if (data.v !== 1 || !(data.r in roles) || data.s < 80 || data.p < 2) return NextResponse.json({ valid: false });
    return NextResponse.json({ valid: true, role: roles[data.r].title, score: data.s, scenarioScore: data.p, issued: data.d, scope: "Penyelesaian pelatihan awareness SiberSadar UMKM (non-Sertifikasi Kompetensi BNSP/LSP)" });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
