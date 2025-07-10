import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface UserProfile {
  name?: string
  company?: string
  primaryChallenge?: string
  teamSize?: string
  industry?: string
  previousSolutions?: string[]
  painPoints?: string[]
  goals?: string[]
}

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationStage, userProfile, messageHistory } = await request.json()

    // Build conversation context
    const systemPrompt = `You are a helpful assistant for Campfire, an AI-powered operating system for high-performance cultures. You're having a warm, consultative conversation with a former customer to understand their current team and culture challenges.

Campfire helps companies with:
- Building high-performance, people-centered cultures
- Team engagement and performance measurement
- Cultural transformation and alignment
- Manager development and leadership support
- Employee experience optimization

Your goal is to:
1. Have a genuine, consultative conversation (not pushy sales)
2. Understand their current team culture challenges
3. Provide thoughtful questions and micro-insights
4. Build toward demonstrating how Campfire could help

Current conversation stage: ${conversationStage}
- Stage 0: Initial challenge identification
- Stage 1: Deep dive into specific pain points
- Stage 2: Explore impact and consequences
- Stage 3: Discuss what they've tried before
- Stage 4: Assess readiness for solutions

User profile so far: ${JSON.stringify(userProfile)}

Keep responses conversational, empathetic, and focused on understanding their situation. Ask thoughtful follow-up questions. Provide brief insights when relevant. Stay warm and human.`

    // Build message history for context
    const contextMessages = messageHistory.map((msg: Message) => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text
    }))

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...contextMessages,
        { role: 'user', content: message }
      ],
      max_tokens: 200,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || 
      "I'd love to hear more about that. Can you tell me what specific challenges you're facing?"

    return NextResponse.json({ response })

  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Campfire Chat API is running' })
}