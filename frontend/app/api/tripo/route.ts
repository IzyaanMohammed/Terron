import { NextResponse } from 'next/server';
import { generateTripoSmartPrompt } from '../../../lib/backend/ai-service';
import { createTripoTask, getTripoTaskStatus } from '../../../lib/backend/tripo-service';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const executionLog: any[] = [];
  let finalPrompt;

  try {
    const { prompt: userPrompt, projectData, ecoDossier } = await req.json();
    finalPrompt = userPrompt;

    // Use reasoning to build a smarter prompt if project context is available
    if (projectData && ecoDossier) {
      try {
        finalPrompt = await generateTripoSmartPrompt(projectData, ecoDossier, executionLog);
      } catch (e) {
        console.warn("Smart 3D prompt generation failed, using provided prompt or fallback");
      }
    }

    if (!finalPrompt) {
      return NextResponse.json({ error: "prompt or project context required" }, { status: 400 });
    }

    const tripoPrompt = typeof finalPrompt === "object" ? finalPrompt.tripo_prompt : finalPrompt;
    const taskData = await createTripoTask(tripoPrompt);
    
    return NextResponse.json({ taskId: taskData.task_id, executionLog, prompt: finalPrompt });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, executionLog }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 });
  }

  try {
    const statusData = await getTripoTaskStatus(taskId);
    return NextResponse.json({ data: statusData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
