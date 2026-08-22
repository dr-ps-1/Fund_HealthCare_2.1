export type GroqChatMessage = {
  role: "assistant" | "system" | "user"
  content: string
}

export type GroqChatCompletionInput = {
  messages: GroqChatMessage[]
  temperature?: number
  maxTokens?: number
  model?: string
}

export type GroqConfigReason =
  | "ok"
  | "missing"
  | "placeholder"
  | "invalid_format"

export type GroqConfigStatus = {
  configured: boolean
  reason: GroqConfigReason
  model: string
  hint?: string
}

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

const PLACEHOLDER_KEY_PATTERN =
  /your_groq|placeholder|example|changeme|insert.?key|xxx/i

export function getGroqConfigStatus(): GroqConfigStatus {
  const model = getGroqModel()
  const raw = process.env.GROQ_API_KEY?.trim()

  if (!raw) {
    return {
      configured: false,
      reason: "missing",
      model,
      hint: "Add GROQ_API_KEY=gsk_... to .env or .env.local in the project root, then restart pnpm dev.",
    }
  }

  if (PLACEHOLDER_KEY_PATTERN.test(raw)) {
    return {
      configured: false,
      reason: "placeholder",
      model,
      hint: "Replace the example GROQ_API_KEY with a real key from console.groq.com (starts with gsk_).",
    }
  }

  if (!raw.startsWith("gsk_")) {
    return {
      configured: false,
      reason: "invalid_format",
      model,
      hint: "Groq API keys start with gsk_. Check GROQ_API_KEY in .env and restart the dev server.",
    }
  }

  return { configured: true, reason: "ok", model }
}

export function isGroqConfigured() {
  return getGroqConfigStatus().configured
}

export function getGroqModel() {
  return process.env.GROQ_MODEL?.trim() || "llama-3.1-8b-instant"
}

function requireGroqApiKey(): string {
  const status = getGroqConfigStatus()
  if (!status.configured) {
    throw new Error(status.hint ?? "GROQ_API_KEY is not configured on the server.")
  }
  return process.env.GROQ_API_KEY!.trim()
}

/**
 * OpenAI-compatible Groq chat completions (same pattern as Vita AI).
 */
export async function createGroqChatCompletion(
  input: GroqChatCompletionInput
): Promise<string> {
  const apiKey = requireGroqApiKey()

  const groqResponse = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: input.model ?? getGroqModel(),
        temperature: input.temperature ?? 0.3,
        max_tokens: input.maxTokens ?? 800,
        messages: input.messages,
      }),
    }
  )

  if (!groqResponse.ok) {
    throw new Error(await groqResponse.text())
  }

  const payload = (await groqResponse.json()) as GroqChatCompletionResponse
  const content = payload.choices?.[0]?.message?.content?.trim()

  if (!content) {
    throw new Error("Groq returned an empty response.")
  }

  return content
}
