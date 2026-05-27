import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { noteSchema } from "@/lib/leadSchema";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const input = noteSchema.parse(await request.json());
    const note = await prisma.leadNote.create({
      data: {
        leadId: id,
        content: input.content
      }
    });
    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Observação inválida." }, { status: 400 });
    }
    return NextResponse.json({ error: "Não foi possível salvar a observação." }, { status: 400 });
  }
}
