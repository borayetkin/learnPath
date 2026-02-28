# LearnPath - Turn Any Learning Goal Into a Clear Path

**Learn Anything. Master Everything.**

LearnPath is a universal AI-powered learning path generator that transforms any learning goal into a personalized, structured roadmap. From music to coding, mindfulness to photography, LearnPath creates curated learning journeys across **12 diverse categories** of human knowledge.

## Universal Learning Platform

Unlike traditional learning platforms focused on tech or business, LearnPath is built for **lifelong learners** across all domains:

🎵 **Music** • 🎨 **Visual Arts** • 🎬 **Film & Video** • 💼 **Business** • 🧘 **Personal Development** • 🌍 **Languages** • 🔬 **Science & Math** • 📚 **History & Humanities** • 💪 **Health & Fitness** • ✂️ **Crafts & Hobbies** • ✍️ **Writing** • 💻 **Technology**

## Features

- **Universal AI Path Generation**: Domain-aware AI creates personalized learning paths tailored to each category's unique pedagogical approaches
- **12 Learning Categories**: Comprehensive coverage from creative arts to technical skills, personal development to academic subjects
- **Interactive Learning Graph**: Visual, dependency-based graph showing prerequisites and learning progression using React Flow
- **Diverse Resource Types**: Curated recommendations including courses, videos, books, apps, podcasts, communities, sheet music, templates, and more
- **Category-Specific Guidance**: AI adapts its teaching approach based on the learning domain (e.g., practice-focused for music, project-based for coding)
- **Progress Tracking**: Track your learning progress across multiple paths with visual indicators and statistics
- **Category Discovery**: Browse and explore learning paths across all 12 categories
- **Beautiful, Responsive Design**: Modern UI built with Shadcn/ui and Tailwind CSS

## Example Learning Paths

LearnPath creates tailored roadmaps across diverse domains:

- 🎸 **Beginner Guitar** - From basic chords to playing your first song
- 📸 **Portrait Photography** - Master lighting, composition, and post-processing
- 🐍 **Python for Data Science** - From basics to machine learning
- 🇫🇷 **Conversational French** - Speak French in 6 months
- 🧘 **Mindfulness Meditation** - Build a daily practice from scratch
- 🎬 **Documentary Filmmaking** - From concept to completed film
- 💼 **Starting a Side Business** - Validate, build, and launch
- 🎨 **Watercolor Painting** - Techniques from beginner to intermediate
- ⚛️ **Understanding Quantum Physics** - Conceptual foundations for curious minds
- ✍️ **Writing Short Fiction** - Craft compelling short stories
- 💪 **Calisthenics Training** - Build strength with bodyweight exercises
- 🪡 **Modern Embroidery** - From basic stitches to custom designs

Each path is optimized for its domain with category-specific pedagogical approaches.

## Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **TypeScript**
- **React Flow** - Interactive graph visualization
- **Shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Hook Form + Zod** - Form handling and validation

### Backend
- **Next.js API Routes** (Serverless)
- **Supabase** (PostgreSQL) - Database
- **Anthropic Claude API** - AI path generation
- **NextAuth.js** - Authentication (ready for integration)

### Deployment
- **Vercel** - Hosting
- **Supabase Cloud** - Database hosting

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account
- An Anthropic API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/learnpath.git
   cd learnpath
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your credentials:
   ```env
   # Database
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key

   # Authentication
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key

   # AI
   ANTHROPIC_API_KEY=your_claude_api_key
   ```

4. **Set up the database**

   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and execute the SQL from `supabase/schema.sql`
   - This will create all necessary tables, indexes, and Row Level Security policies

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
learnpath/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── paths/            # Learning path endpoints
│   │   │   ├── generate/     # AI path generation
│   │   │   ├── save/         # Save generated path
│   │   │   └── [id]/         # CRUD operations
│   │   └── progress/         # Progress tracking endpoints
│   ├── path/                 # Path viewer pages
│   │   └── [id]/            # Dynamic path viewer
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (path generator)
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # Shadcn/ui components
│   ├── nodes/               # Custom React Flow nodes
│   ├── PathGenerationForm.tsx
│   ├── LearningGraph.tsx
│   └── NodeDetailPanel.tsx
├── lib/                     # Utility libraries
│   ├── ai/                  # AI integration
│   │   └── claude.ts        # Claude API service
│   ├── supabase/            # Database clients
│   │   ├── client.ts        # Browser client
│   │   └── server.ts        # Server client
│   └── utils/               # Utility functions
├── types/                   # TypeScript types
│   └── index.ts            # Type definitions and Zod schemas
├── supabase/               # Database files
│   └── schema.sql          # Database schema
└── .env.example            # Environment variables template
```

## How It Works

### 1. Path Generation

Users fill out a form with:
- Topic they want to learn
- Experience level (beginner, intermediate, advanced)
- Learning goals
- Time commitment
- Preferred resource types
- Current knowledge

### 2. AI Processing

The Claude API processes the request and generates:
- A structured learning path with 8-15 nodes
- Dependencies between topics (prerequisites)
- 3-5 high-quality resources per node
- Estimated time requirements
- Practical exercises and key takeaways

### 3. Visualization

The generated path is displayed as an interactive graph:
- Nodes represent learning topics
- Edges show prerequisites
- Colors indicate progress (not started, in progress, completed)
- Click nodes to view details and resources

### 4. Progress Tracking

Users can:
- Mark nodes as in-progress or completed
- View overall progress statistics
- Track time spent on each topic
- Save notes for each learning node

## API Endpoints

### Path Generation
```
POST /api/paths/generate
Body: { topic, userBackground, learningGoal, ... }
Response: { success, data: AIPathGenerationResponse }
```

### Save Path
```
POST /api/paths/save
Body: { userId, pathData }
Response: { success, data: { pathId, path } }
```

### Get Path
```
GET /api/paths/[id]
Response: { success, data: LearningPath }
```

### Update Progress
```
POST /api/progress/node
Body: { userId, pathId, nodeId, status }
Response: { success, data: UserProgress }
```

### Get Progress Stats
```
GET /api/progress/stats?userId=xxx&pathId=xxx
Response: { success, data: { completed, inProgress, ... } }
```

## Database Schema

The database consists of 6 main tables:

- **users** - User accounts
- **learning_paths** - Generated learning paths
- **learning_nodes** - Individual topics/concepts
- **resources** - Learning resources (courses, articles, etc.)
- **user_progress** - User progress tracking
- **resource_interactions** - User interactions with resources

See `supabase/schema.sql` for the complete schema with Row Level Security policies.

## Customization

### Adding New Resource Types

Edit `types/index.ts` to add new resource types:
```typescript
export type ResourceType = 'course' | 'article' | 'video' | 'book' | 'documentation' | 'exercise' | 'your-new-type';
```

### Modifying the AI Prompt

Edit `lib/ai/claude.ts` to customize how paths are generated:
```typescript
const SYSTEM_PROMPT = `Your custom system prompt...`;
```

### Styling

The app uses Tailwind CSS. Customize colors and themes in:
- `tailwind.config.ts` - Tailwind configuration
- `app/globals.css` - Global styles and CSS variables

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted with Docker

## Future Enhancements

- [ ] User authentication with NextAuth.js
- [ ] Public path sharing
- [ ] Community-created paths
- [ ] Mobile app (React Native)
- [ ] Spaced repetition system
- [ ] Calendar integration
- [ ] Export paths as PDF/Markdown
- [ ] AI study buddy chat interface
- [ ] Collaboration features
- [ ] Advanced analytics dashboard

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


**Built with ❤️ using Next.js, Claude AI, and React Flow**
