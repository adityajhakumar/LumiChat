import { type NextRequest, NextResponse } from "next/server"

const API_KEYS = [
  process.env.OPENROUTER_API_KEY_1,
  process.env.OPENROUTER_API_KEY_2,
  process.env.OPENROUTER_API_KEY_3,
  process.env.OPENROUTER_API_KEY_4,
].filter(Boolean)

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

function extractCodeFromMarkdown(text: string): string {
  const codeBlockMatch = text.match(/```(?:\w+)?\n([\s\S]*?)```/)
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim()
  }
  return text
}

function parseStudyModeResponse(content: string): any[] {
  const lessonSteps: any[] = []

  const sections = content.split(/^##\s+/m).filter((s) => s.trim())

  const stepTitles = [
    "Understanding the Problem",
    "Building Intuition",
    "Brute-Force Approach",
    "Optimized Solution",
    "Test Your Understanding",
  ]

  sections.forEach((section, index) => {
    if (index >= 5) return

    const lines = section.trim().split("\n")
    const firstLine = lines[0] || ""
    const title = firstLine.replace(/^\d+\.\s/, "").trim() || stepTitles[index] || `Step ${index + 1}`

    // Get content (everything after the title)
    const contentLines = firstLine.includes(".") ? lines.slice(1) : lines.slice(1)
    let fullContent = contentLines.join("\n").trim()

    let type = "explanation"

    if (fullContent.includes("```")) {
      type = "code"
      const codeMatch = fullContent.match(/```(?:\w+)?\n([\s\S]*?)```/)
      if (codeMatch) {
        fullContent = codeMatch[1].trim()
      } else {
        fullContent = fullContent
          .replace(/```(\w+)?\n/g, "")
          .replace(/```$/g, "")
          .trim()
      }
    } else if (fullContent.match(/\?|quiz|practice|challenge|question/i)) {
      type = "quiz"
    } else if (fullContent.match(/complexity|O\(|time|space/i)) {
      type = "complexity"
    }

    if (fullContent) {
      lessonSteps.push({
        title: title || stepTitles[index],
        content: fullContent,
        type,
      })
    }
  })

  // Fallback: if parsing didn't create steps, create a single comprehensive step
  if (lessonSteps.length === 0) {
    lessonSteps.push({
      title: "Complete Lesson",
      content: content,
      type: "explanation",
    })
  }

  return lessonSteps
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model, image, studyMode, skillLevel = "beginner" } = await request.json()

    if (!messages || !model) {
      return NextResponse.json({ error: "Missing messages or model" }, { status: 400 })
    }

    // Prepare message content with image if provided
    const formattedMessages = messages.map((msg: any) => {
      if (msg.role === "user" && image) {
        return {
          role: msg.role,
          content: [
            { type: "text", text: msg.content },
            {
              type: "image_url",
              image_url: { url: image },
            },
          ],
        }
      }
      return msg
    })

    let systemPrompt = ""

    if (studyMode) {
      const adaptiveGuidance =
        skillLevel === "beginner"
          ? "Use simple analogies and avoid complex jargon. Break down concepts into small, digestible pieces."
          : skillLevel === "intermediate"
            ? "Assume familiarity with basic concepts. Focus on patterns and optimization techniques."
            : "Dive deep into advanced patterns, edge cases, and performance considerations."

      systemPrompt = `You are an expert AI tutor who teaches computer science, math, and programming concepts.
Be deeply thoughtful, logical, and context-aware.
Explain *why* things work before *how* they work.
Use real-world analogies, progressive examples, and structured reasoning.
When possible, point out common misconceptions .
Always adapt tone and depth based on learner skill level.
Show reasoning clearly but concisely.
Use markdown formatting for clarity.

Learner Level: ${skillLevel}
${adaptiveGuidance}

When explaining any topic, ALWAYS structure your response with these 5 sections:

## 1. Understanding the Problem
Start with a simple, real-world analogy. Explain what the problem is asking in everyday language. Make it relatable and interesting.

## 2. Building Intuition
Explain the core concepts and patterns. Use diagrams (in text), examples, and step-by-step thinking. Help the learner understand the "why" before the "how". Relate with real life example to explain so that anyone can understand in depth and gets the logic.

## 3. Brute-Force Approach
Show the simplest solution first. Include:
- Complete working code with comments
- Time Complexity: O(...)
- Space Complexity: O(...)
- Why this approach works but isn't optimal
- Dry run with sample example step by step with detailed explanation of each line of code (not inside code block)

## 4. Optimized Solution
Show the efficient approach. Include:
- Complete working code with detailed comments
- Time Complexity: O(...)
- Space Complexity: O(...)
- Explanation of why this is better
- Trade-offs (time vs space)
- Dry run with sample example step by step with detailed explanation of each line of code (not inside code block)

## 5. Test Your Understanding
Provide 2-3 practice questions or challenges:
- Conceptual questions to test understanding
- Coding challenges to practice
- Edge cases to consider

IMPORTANT: Always use proper markdown code blocks with language specification like \`\`\`python or \`\`\`cpp. Be encouraging, use clear formatting, and make learning enjoyable!`
    } else {
      // Normal Chat Mode Prompt
      systemPrompt = `You are LumiChats AI, created by Aditya Kumar Jha.
You are a helpful, knowledgeable, and friendly assistant.
If anyone asks who made you or who developed you, always respond:
"I was made by Aditya Kumar Jha at LumiChats."
Keep responses clear, polite, and engaging.`
    }

    // Try each API key until one works
    let lastError: any = null
    for (const apiKey of API_KEYS) {
      if (!apiKey) continue

      try {
        const response = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "LumiChats By TheVersync",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "system", content: systemPrompt }, ...formattedMessages],
            temperature: 0.7,
            max_tokens: 15000,
          }),
        })

        if (!response.ok) {
          lastError = await response.json()
          continue
        }

        const data = await response.json()
        const content = data.choices[0]?.message?.content || ""
        const tokenCount = data.usage?.total_tokens || 0

        let lessonSteps = undefined
        if (studyMode) {
          lessonSteps = parseStudyModeResponse(content)
        }

        return NextResponse.json({
          content,
          tokenCount,
          lessonSteps,
        })
      } catch (error) {
        lastError = error
        continue
      }
    }

    return NextResponse.json({ error: lastError?.message || "All API keys failed" }, { status: 500 })
  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
