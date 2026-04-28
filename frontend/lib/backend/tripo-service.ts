// Vercel Serverless override for native console logging
const logger = console;

const TRIPO_KEYS = [
  process.env.TRIPO_API_KEY,
  "tsk_bSrErgVv77tUa5mUhYgiJi9wXXri47_O-4thDQ7Vla1" // User's Secondary Key
].filter(Boolean);

export async function createTripoTask(prompt: string) {
  if (TRIPO_KEYS.length === 0) {
    throw new Error("No TRIPO_API_KEYs configured");
  }

  let lastError: any = null;
  for (const key of TRIPO_KEYS) {
    try {
      // Shorten prompt to avoid Tripo 1024 char limit
      const cleanPrompt = prompt.length > 1000
        ? prompt.substring(0, 950) + "... [Truncated for structural efficiency]"
        : prompt;

      logger.info({
        action: "tripo_task_init",
        keyPreview: key?.substring(0, 10) + "...",
        promptPreview: cleanPrompt.substring(0, 100)
      }, "Initiating Tripo 3D Generation Task");

      const response = await fetch("https://api.tripo3d.ai/v2/openapi/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          type: "text_to_model",
          prompt: cleanPrompt,
        }),
      });

      const data: unknown = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Try to extract error message if possible
        const errMsg = typeof data === "object" && data !== null && "message" in data ? (data as any).message : response.statusText;
        if (response.status === 401 || response.status === 429) {
          logger.warn({ status: response.status }, "Tripo key exhausted or invalid, trying next...");
          continue;
        }
        throw new Error(`Tripo API Error: ${errMsg}`);
      }

      // Type guard for expected Tripo response
      if (
        typeof data === "object" && data !== null &&
        "data" in data && typeof (data as any).data === "object" && (data as any).data !== null &&
        "task_id" in (data as any).data
      ) {
        logger.info({
          action: "tripo_task_success",
          taskId: (data as any).data.task_id
        }, "Tripo 3D Task successfully queued");
        return (data as any).data;
      } else {
        throw new Error("Tripo API: Malformed response");
      }
    } catch (e: any) {
      lastError = e;
      logger.error({ error: e.message }, "Tripo attempt failed");
    }
  }

  throw lastError || new Error("All Tripo keys failed");
}

export async function getTripoTaskStatus(taskId: string) {
  let lastError: any = null;
  for (const key of TRIPO_KEYS) {
    try {
      const response = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) continue;
        throw new Error(`Polling failed: ${response.status}`);
      }

      const data: unknown = await response.json();
      // Type guard for expected Tripo status response
      if (
        typeof data === "object" && data !== null &&
        "data" in data && typeof (data as any).data === "object"
      ) {
        return (data as any).data;
      } else {
        throw new Error("Tripo API: Malformed status response");
      }
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error("Could not check Tripo status with any key");
}
