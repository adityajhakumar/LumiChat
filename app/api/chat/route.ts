import { type NextRequest } from "next/server"

const API_KEYS = [
  process.env.OPENROUTER_API_KEY_1,
  process.env.OPENROUTER_API_KEY_2,
  process.env.OPENROUTER_API_KEY_3,
  process.env.OPENROUTER_API_KEY_4,
].filter(Boolean)

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

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
    const contentLines = firstLine.includes(".") ? lines.slice(1) : lines.slice(1)
    let fullContent = contentLines.join("\n").trim()

    let type = "explanation"
    if (fullContent.includes("```")) {
      type = "code"
      const codeMatch = fullContent.match(/```(?:\w+)?\n([\s\S]*?)```/)
      if (codeMatch) {
        fullContent = codeMatch[1].trim()
      } else {
        fullContent = fullContent.replace(/```(\w+)?\n/g, "").replace(/```$/g, "").trim()
      }
    } else if (fullContent.match(/\?|quiz|practice|challenge|question/i)) {
      type = "quiz"
    } else if (fullContent.match(/complexity|O\(|time|space/i)) {
      type = "complexity"
    }

    if (fullContent) {
      lessonSteps.push({ title: title || stepTitles[index], content: fullContent, type })
    }
  })

  if (lessonSteps.length === 0) {
    lessonSteps.push({ title: "Complete Lesson", content: content, type: "explanation" })
  }

  return lessonSteps
}

export async function POST(request: NextRequest) {
  try {
    const { 
      messages, 
      model, 
      image, 
      images,
      fileContent, 
      fileName,
      studyMode, 
      skillLevel = "beginner",
      useReasoning = false,
      reasoningEffort = "medium",
      stream = true  // Enable streaming by default
    } = await request.json()

    if (!messages || !model) {
      return new Response(
        JSON.stringify({ error: "Missing messages or model" }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const formattedMessages = messages.map((msg: any, index: number) => {
      if (msg.role === "user") {
        const contentParts: any[] = []
        
        if (index === messages.length - 1) {
          if (fileContent && fileContent.trim()) {
            const fileContext = fileName 
              ? `\n\n[File: ${fileName}]\n${fileContent}\n[End of file content]\n\n`
              : `\n\n[Uploaded content]\n${fileContent}\n[End of content]\n\n`
            contentParts.push({ type: "text", text: fileContext + msg.content })
          } else {
            contentParts.push({ type: "text", text: msg.content })
          }
          
          if (image) {
            contentParts.push({ type: "image_url", image_url: { url: image } })
          }
          
          if (images && Array.isArray(images) && images.length > 0) {
            const imagesToSend = images.slice(0, 5)
            imagesToSend.forEach((img: string) => {
              contentParts.push({ type: "image_url", image_url: { url: img } })
            })
            if (images.length > 5) {
              contentParts[0].text += `\n\n[Note: Showing first 5 of ${images.length} PDF pages]`
            }
          }
        } else {
          contentParts.push({ type: "text", text: msg.content })
        }
        
        return {
          role: msg.role,
          content: contentParts.length > 1 ? contentParts : contentParts[0].text,
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
When possible, point out common misconceptions.
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
      systemPrompt = `You are LumiChats AI, created by Aditya Kumar Jha.
You are a helpful, knowledgeable, and friendly assistant.

CRITICAL: When analyzing uploaded files or documents:
- The file content is included in the user's messages with markers like [File: filename]
- The file content persists throughout the ENTIRE conversation
- You have access to ALL previous messages, including the original file upload
- Always reference the file context from earlier messages when answering follow-up questions
- Maintain awareness of the file's content across multiple turns of conversation

When analyzing documents:
- Read and understand the entire content thoroughly
- Identify key information, patterns, and insights
- Answer questions about the document accurately based on previous context
- Extract specific details when asked
- Summarize if requested
- Analyze data, tables, and structured information
- For images, describe what you see in detail

If anyone asks who made you or who developed you, always respond:
"I was made by Aditya Kumar Jha at LumiChats."

Keep responses clear, polite, and engaging.`
    }

    let lastError: any = null
    for (const apiKey of API_KEYS) {
      if (!apiKey) continue

      try {
        const requestBody: any = {
          model,
          messages: [{ role: "system", content: systemPrompt }, ...formattedMessages],
          temperature: 0.7,
          max_tokens: 15000,
          stream: stream,
        }

        if (useReasoning) {
          requestBody.reasoning = {
            effort: reasoningEffort,
            exclude: false
          }
        }

        const response = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "LumiChats By TheVersync",
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          lastError = await response.json()
          continue
        }

        // If streaming is enabled, return the stream
        if (stream && response.body) {
          const encoder = new TextEncoder()
          const decoder = new TextDecoder()
          
          let fullContent = ""
          let reasoning = ""
          
          const transformStream = new TransformStream({
            async transform(chunk, controller) {
              const text = decoder.decode(chunk, { stream: true })
              const lines = text.split('\n').filter(line => line.trim() !== '')
              
              for (const line of lines) {
                if (line.startsWith(':')) {
                  // OpenRouter processing comment - pass through
                  controller.enqueue(encoder.encode(line + '\n\n'))
                  continue
                }
                
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') {
                    // Send final metadata
                    const finalData = {
                      done: true,
                      fullContent,
                      reasoning: reasoning || null,
                      lessonSteps: studyMode ? parseStudyModeResponse(fullContent) : undefined
                    }
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`))
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                    return
                  }
                  
                  try {
                    const parsed = JSON.parse(data)
                    
                    // Check for mid-stream error
                    if (parsed.error) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: parsed.error })}\n\n`))
                      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                      return
                    }
                    
                    const content = parsed.choices?.[0]?.delta?.content
                    if (content) {
                      fullContent += content
                      controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                    }
                    
                    // Capture reasoning if present
                    const reasoningChunk = parsed.choices?.[0]?.delta?.reasoning
                    if (reasoningChunk) {
                      reasoning += reasoningChunk
                      controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                    }
                    
                    // Check for finish reason
                    if (parsed.choices?.[0]?.finish_reason) {
                      controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                    }
                  } catch (e) {
                    // Invalid JSON, skip
                  }
                }
              }
            }
          })

          const stream = response.body.pipeThrough(transformStream)
          
          return new Response(stream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          })
        }

        // Non-streaming fallback
        const data = await response.json()
        const content = data.choices[0]?.message?.content || ""
        const reasoning = data.choices[0]?.message?.reasoning || null
        const tokenCount = data.usage?.total_tokens || 0

        let lessonSteps = undefined
        if (studyMode) {
          lessonSteps = parseStudyModeResponse(content)
        }

        return new Response(
          JSON.stringify({ content, reasoning, tokenCount, lessonSteps }),
          { headers: { "Content-Type": "application/json" } }
        )
      } catch (error) {
        lastError = error
        continue
      }
    }

    return new Response(
      JSON.stringify({ error: lastError?.message || "All API keys failed" }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
