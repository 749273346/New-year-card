
import { generateGreeting } from "@/lib/zhipu";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const greeting = await generateGreeting(name);
    return NextResponse.json(greeting);
  } catch (error: unknown) {
    console.error("Error generating greeting:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
