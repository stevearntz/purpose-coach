# Campfire Guides

An AI-powered platform designed to empower employees and transform workplace culture through personalized coaching tools and development resources.

## Overview

Campfire Guides (formerly Purpose Coach) is a comprehensive coaching platform that helps companies and teams address workplace challenges through AI-driven conversations, assessments, and personalized recommendations. The platform features a modern purple-themed design with an intuitive multi-step workflow.

## Features

### Current Features

- **AI-Powered Challenge Discovery**: Intelligent conversational interface to identify team and culture challenges
- **Personalized Tool Recommendations**: Smart matching of tools and courses based on specific workplace challenges
- **Multi-Screen Workflow**: Seamless user journey from lead capture to tool selection
- **Purpose Discovery Tool**: Complete 3-stage assessment for finding personal and professional purpose
- **PDF Export**: Download assessment results and insights
- **Responsive Design**: Modern UI with purple gradients and glassmorphism effects
- **Demo Mode**: Try tools without API credentials

### In Development
- Values Explorer
- Strengths Assessment
- Decision Audit Tool
- Trust Assessment
- Feedback Conversation Guides
- Change Leadership Resources

## Tech Stack

- **Framework**: Next.js 15.3.4 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with PostCSS
- **AI Integration**: OpenAI API (GPT-4)
- **PDF Generation**: jsPDF
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)
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
    /api/chat       # OpenAI GPT-4 chat endpoint
    /tools          # Coaching tool modules
      /purpose      # Purpose discovery tool (fully implemented)
      /values       # Values explorer (coming soon)
      /strengths    # Strengths assessment (coming soon)
      /career       # Career guidance (coming soon)
      /clarity      # Clarity tool (coming soon)
      /relationships # Relationships tool (coming soon)
    layout.tsx      # Root layout with app metadata
    page.tsx        # Homepage with AI challenge discovery chat
```

## Application Flow

### 1. **Homepage - Challenge Discovery** (`/`)
- AI-powered chat interface to identify workplace challenges
- 5-stage conversation flow
- Automatically suggests scheduling a demo based on responses

### 2. **Tools Selection** (`/tools`)
- **Screen 1**: Lead capture form with animated platform preview
- **Screen 2**: Choose from 9 workplace challenges:
  - Connect teams to goals
  - Support managers in change
  - Build culture of feedback, care, and trust
  - Strengthen decision making
  - Build confidence and capability
  - Improve communication
  - Increase emotional well-being
  - Align expectations
  - Scale without burning out
- **Screen 3**: Receive personalized tool and course recommendations
- **Screen 4**: Launch tools (currently shows Decision Audit preview)

### 3. **Purpose Discovery Tool** (`/tools/purpose`)
- 3-stage assessment: Purpose, Mission, and Vision
- Interactive questionnaire with progress tracking
- PDF export of results
- Share functionality for team collaboration

## Development

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Design System

### Color Palette
- **Primary**: Purple-600, Purple-500
- **Secondary**: Pink-500, Orange-500
- **Backgrounds**: Purple gradients, Gray-50
- **Text**: Gray-900 (primary), Gray-600 (secondary)

### UI Components
- **Cards**: White backgrounds with subtle borders and shadows
- **Buttons**: Purple-600 primary buttons, white secondary buttons
- **Forms**: Clean inputs with purple focus states
- **Navigation**: Sticky header with Campfire branding

## Roadmap

### Phase 1 (Current)
- ✅ Challenge discovery chat interface
- ✅ Tools recommendation engine
- ✅ Purpose discovery tool
- ✅ Lead capture and workflow

### Phase 2 (Next)
- [ ] Complete Decision Audit tool
- [ ] Implement Values Explorer
- [ ] Add Strengths Assessment
- [ ] User authentication and profiles
- [ ] Results dashboard

### Phase 3 (Future)
- [ ] Team collaboration features
- [ ] Progress tracking
- [ ] Custom assessments
- [ ] Integration with HR systems
- [ ] Analytics and reporting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js and Tailwind CSS
- AI capabilities powered by OpenAI GPT-4
- Modern UI design with purple gradients and glassmorphism
- Focused on empowering workplace culture transformation
