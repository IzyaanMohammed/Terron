import { NextResponse } from 'next/server';
import { analyzeProject } from '../../../lib/backend/ai-service';

export const maxDuration = 60; // Maximize Vercel Execution window to prevent 504 Timeouts
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const executionLog: any[] = [];
  try {
    const body = await req.json();
    console.info({ action: "analyze_request", project: body.name }, "Incoming Project Analysis Request");
    
    // Core engine handler
    const analysis = await analyzeProject(body, executionLog);
    
    return NextResponse.json({ ...analysis, executionLog });
    
  } catch (error: any) {
    console.error({ action: "analyze_error", error: error.message }, "Analysis Route Failed");
    return NextResponse.json({ error: error.message, executionLog }, { status: 500 });
  }
}
