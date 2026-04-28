import { NextResponse } from 'next/server';
import { chatWithAI } from '../../../lib/backend/ai-service';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { project, message, history } = await req.json();
    console.info({ action: "chat_request", project: project?.name }, "Incoming AI Chat Request");
    
    // Call unified AI service layer
    const reply = await chatWithAI(project, message, history || []);
    
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error({ action: "chat_error", error: error.message }, "Chat Route Failed");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
