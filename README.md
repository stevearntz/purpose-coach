# Purpose Coach - Chat by the Fire

An AI-powered personal development and coaching platform that helps individuals discover their purpose, values, and strengths through guided conversations.

## Overview

Purpose Coach (branded as "Chat by the Fire") provides interactive AI-driven coaching tools designed to help users explore and understand their personal and professional development goals. The platform features a warm, inviting campfire theme with glassmorphism design elements.

## Features

- **AI-Powered Conversations**: Leverages OpenAI's API for intelligent, context-aware coaching dialogues
- **Purpose Discovery Tool**: Guided journey to uncover personal purpose and life direction
- **Downloadable Results**: Export coaching session insights as PDF documents
- **Beautiful UI**: Modern glassmorphism design with animated backgrounds and intuitive interface
- **Demo Mode**: Try the platform without API keys for testing

### Planned Features
- Values Explorer
- Strengths Assessment
- Career Path Guidance
- Personal Growth Tracking

## Tech Stack

- **Framework**: Next.js 15.3.4 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with PostCSS
- **AI Integration**: OpenAI API
- **PDF Generation**: jsPDF
- **Authentication**: Google OAuth (implemented but currently disabled)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional for demo mode)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/purpose-coach.git
cd purpose-coach
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here # Optional
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/src
  /app
    /api/chat       # OpenAI chat endpoint
    /tools          # Coaching tool modules
      /purpose      # Purpose discovery tool
      /values       # Values explorer (planned)
      /strengths    # Strengths assessment (planned)
    layout.tsx      # Root layout with glassmorphism theme
    page.tsx        # Homepage with main chat interface
```

## Usage

1. **Main Chat**: Start a conversation on the homepage for general coaching
2. **Purpose Tool**: Navigate to `/tools/purpose` for a structured purpose discovery journey
3. **Demo Mode**: Click "Try Demo" to explore without API credentials
4. **Export Results**: Download your coaching insights as a PDF at any time

## Development

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js and Tailwind CSS
- AI capabilities powered by OpenAI
- Campfire theme inspired by the warmth of meaningful conversations
