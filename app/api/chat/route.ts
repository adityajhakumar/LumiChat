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

// NEW: Intelligent file analysis function
async function analyzeFileIntelligently(
  fileContent: string,
  fileName: string,
  images: string[] | null,
  apiKey: string,
  userQuestion: string
): Promise<string> {
  const fileType = fileName.toLowerCase().split('.').pop()
  
  let analysisPrompt = ""
  
  // Create intelligent prompts based on file type
  if (fileType === 'xlsx' || fileType === 'xls') {
    analysisPrompt = `I've uploaded an Excel file named "${fileName}". Here's the extracted content:

${fileContent}

This is raw Excel data. Please:
1. Identify and describe the structure (sheets, columns, data types)
2. Recognize any tables, headers, and data patterns
3. Extract key insights and statistics if it's numerical data
4. Summarize what this spreadsheet contains
5. Be ready to answer specific questions about this data

User's question: ${userQuestion || "Please analyze this Excel file and tell me what it contains."}`
  } 
  else if (fileType === 'docx' || fileType === 'doc') {
    analysisPrompt = `I've uploaded a Word document named "${fileName}". Here's the extracted content:

${fileContent}

Please:
1. Understand the document structure (headings, sections, formatting)
2. Identify the main topics and key points
3. Summarize the document's purpose and content
4. Extract any important information, lists, or data
5. Be ready to answer questions about this document

User's question: ${userQuestion || "Please analyze this Word document and summarize its content."}`
  }
  else if (fileType === 'pdf') {
    if (images && images.length > 0) {
      // PDF has images - use vision analysis
      analysisPrompt = `I've uploaded a PDF file named "${fileName}" with ${images.length} pages.

${fileContent ? `Extracted text:\n${fileContent}\n\n` : ""}

I'm also sending you images of the PDF pages. Please:
1. Analyze both the text and visual content
2. Identify tables, charts, diagrams, and their data
3. Extract structured information
4. Recognize any forms, layouts, or special formatting
5. Summarize the complete document

User's question: ${userQuestion || "Please analyze this PDF thoroughly, including any visual elements."}`
    } else {
      // Text-only PDF
      analysisPrompt = `I've uploaded a PDF file named "${fileName}". Here's the extracted content:

${fileContent}

Please:
1. Understand the document structure and layout
2. Identify sections, headings, and organization
3. Extract and structure any tables or lists
4. Summarize key information
5. Be ready to answer questions about this PDF

User's question: ${userQuestion || "Please analyze this PDF and tell me what it contains."}`
    }
  }
  else {
    // Generic file analysis
    analysisPrompt = `I've uploaded a file named "${fileName}". Here's the content:

${fileContent}

Please analyze this file and provide insights.

User's question: ${userQuestion || "What does this file contain?"}`
  }

  // Call AI to analyze the file
  try {
    const contentParts: any[] = [
      { type: "text", text: analysisPrompt }
    ]
    
    // Add images for PDF visual analysis
    if (images && images.length > 0) {
      const imagesToSend = images.slice(0, 5)
      imagesToSend.forEach((img: string) => {
        contentParts.push({ 
          type: "image_url", 
          image_url: { url: img } 
        })
      })
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "LumiChats By TheVersync",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet", // Use a vision-capable model
        messages: [
          {
            role: "system",
            content: `You are an expert document analyzer. Extract structured information, identify patterns, and provide intelligent insights. When analyzing:
- Excel: Recognize data patterns, calculate statistics, identify trends
- Word: Understand document structure, extract key points, summarize effectively  
- PDF: Analyze both text and visual elements, extract tables accurately`
          },
          {
            role: "user",
            content: contentParts.length > 1 ? contentParts : analysisPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for more accurate analysis
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || fileContent
  } catch (error) {
    console.error("File analysis error:", error)
    // Fallback to raw content if analysis fails
    return fileContent
  }
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
      stream = true,
      analyzeFile = false  // NEW: Flag to trigger intelligent file analysis
    } = await request.json()

    if (!messages || !model) {
      return new Response(
        JSON.stringify({ error: "Missing messages or model" }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // NEW: If file analysis is requested, analyze it first
    let analyzedContent = fileContent
    if (analyzeFile && fileContent && fileName && API_KEYS[0]) {
      const userQuestion = messages[messages.length - 1]?.content || ""
      analyzedContent = await analyzeFileIntelligently(
        fileContent,
        fileName,
        images,
        API_KEYS[0],
        userQuestion
      )
    }

    const formattedMessages = messages.map((msg: any, index: number) => {
      if (msg.role === "user") {
        const contentParts: any[] = []
        
        if (index === messages.length - 1) {
          // Use analyzed content instead of raw content
          if (analyzedContent && analyzedContent.trim()) {
            const fileContext = fileName 
              ? `\n\n[Analyzed File: ${fileName}]\n${analyzedContent}\n[End of analysis]\n\n`
              : `\n\n[Analyzed content]\n${analyzedContent}\n[End of analysis]\n\n`
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
- Files have been pre-analyzed for structure and content
- You receive intelligent summaries and extracted information
- For Excel: Data patterns, statistics, and table structures are identified
- For Word: Document structure, key points, and formatting are preserved
- For PDF: Both text and visual elements are analyzed
- Always reference the analyzed content when answering questions
- Maintain context across conversation turns

When working with documents:
- Understand the pre-processed structure and insights
- Answer questions accurately based on the analysis
- Extract specific details when asked
- Provide summaries and insights
- Work with tables, data, and structured information intelligently

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
                  controller.enqueue(encoder.encode(line + '\n\n'))
                  continue
                }
                
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') {
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
                    
                    const reasoningChunk = parsed.choices?.[0]?.delta?.reasoning
                    if (reasoningChunk) {
                      reasoning += reasoningChunk
                      controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                    }
                    
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
