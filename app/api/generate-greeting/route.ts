
import { generateGreeting } from "@/lib/zhipu";
import { NextResponse } from "next/server";

async function parseName(req: Request) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const data = (await req.json()) as unknown;
      if (typeof data === "object" && data !== null && "name" in data) {
        const name = (data as { name?: unknown }).name;
        return typeof name === "string" ? name : null;
      }
      return null;
    } catch {
      try {
        const text = await req.text();
        const data = JSON.parse(text) as unknown;
        if (typeof data === "object" && data !== null && "name" in data) {
          const name = (data as { name?: unknown }).name;
          return typeof name === "string" ? name : null;
        }
        return null;
      } catch {
        return null;
      }
    }
  }

  try {
    const form = await req.formData();
    const name = form.get("name");
    return typeof name === "string" ? name : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    console.log(`GET /api/generate-greeting name=${name}`);
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const greeting = await generateGreeting(name);
    return NextResponse.json(greeting, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Error generating greeting:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const name = await parseName(req);
    console.log(`POST /api/generate-greeting name=${name}`);
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const greeting = await generateGreeting(name);
    return NextResponse.json(greeting, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Error generating greeting:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
