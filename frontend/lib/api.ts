const API_BASE_URL = '/api';

export async function analyzeProject(projectData: any) {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
  });

  const text = await response.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (e: any) {
    const parseErr: any = new Error(`Analysis endpoint returned invalid JSON: ${text?.slice(0, 100)}`);
    parseErr.rawResponse = text;
    console.error("ANALYSIS_PARSE_ERROR:", text);
    throw parseErr;
  }

  if (!response.ok) {
    const err: any = new Error(data?.error || 'Analysis failed');
    err.executionLog = data?.executionLog || [];
    throw err;
  }

  return data;
}

export async function chatWithAI(project: any, message: string, history: any[]) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project, message, history }),
  });
  if (!response.ok) throw new Error('Chat failed');
  return response.json();
}

// Smart image generation: Gemini 2.0 Flash primary → Pollinations fallback
// Returns object with url and source
export async function generateImage(
  prompt: string,
  seed: number,
  type: string,
  images: string[] = [],
  visualSpecs: string = "",
  variationToken: string = "",
  projectData: any = null
) {
  try {
    const response = await fetch(`${API_BASE_URL}/neural-render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, max-age=0',
        Pragma: 'no-cache'
      },
      cache: 'no-store',
      body: JSON.stringify({ 
        prompt, 
        seed, 
        type, 
        images, 
        visualSpecs, 
        variationToken, 
        cacheBust: Date.now(), 
        projectData: projectData || { name: "Unknown" } 
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: "Invalid JSON response", raw: text };
    }

    if (response.ok) {
      return data;
    }
    return { url: null, executionLog: data.executionLog || [], source: 'Backend Error' };
  } catch (e) {
    console.error("Image generation backend failed:", e);
    const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    const shortPrompt = cleanPrompt.length > 200 ? cleanPrompt.slice(0, 200) : cleanPrompt;
    return {
      url: `https://image.pollinations.ai/prompt/${encodeURIComponent(shortPrompt)}?width=1280&height=720&nologo=true&enhance=false&seed=${seed}`,
      source: 'Pollinations (Client Fallback)',
      executionLog: []
    };
  }
}

export async function createTripoTask(prompt?: string, projectData?: any, ecoDossier?: any[]) {
  const response = await fetch(`${API_BASE_URL}/tripo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, projectData, ecoDossier }),
  });
  if (!response.ok) throw new Error('Tripo task failed');
  return response.json();
}

export async function getTripoTask(taskId: string) {
  const response = await fetch(`${API_BASE_URL}/tripo?taskId=${taskId}`);
  if (!response.ok) throw new Error('Tripo polling failed');
  return response.json();
}
