# ScribeStream

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

ScribeStream is a modern web application that extracts transcripts from YouTube videos and generates AI-powered summaries using Google's Gemini AI. Built with Next.js 14 and TypeScript, it provides a seamless experience for transcribing and summarizing video content.

## ✨ Features

- 🎥 **YouTube Transcript Extraction** - Extract transcripts from any YouTube video using video URL or ID
- 🤖 **AI-Powered Summaries** - Generate intelligent summaries using Google Gemini 2.5 Flash
- 📋 **Copy to Clipboard** - Easily copy transcripts and summaries
- 💾 **Download Options** - Download transcripts and summaries as text files
- ⚡ **Chunked Processing** - Efficient handling of long transcripts with intelligent text chunking
- 🎨 **Modern UI** - Clean, responsive interface built with Tailwind CSS and Radix UI
- 🔍 **Real-time Validation** - Input validation with Zod schemas
- 📊 **Loading States** - Informative loading indicators and error handling

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or later
- pnpm (recommended) or npm
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lindsaysperring/scribestream.git
cd scribestream
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

4. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
scribestream/
├── app/                      # Next.js app directory
│   ├── (main)/              # Main route group
│   │   ├── page.tsx         # Home page
│   │   ├── error.tsx        # Error boundary
│   │   └── loading.tsx      # Loading state
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── features/           # Feature-specific components
│   │   ├── summary/        # Summary display components
│   │   └── transcript/     # Transcript components
│   ├── providers/          # Context providers
│   ├── shared/             # Shared components
│   └── ui/                 # UI primitives (shadcn/ui)
├── lib/                    # Core library code
│   ├── actions/           # Server actions
│   ├── constants/         # Constants and prompts
│   ├── hooks/             # Custom React hooks
│   ├── services/          # External service integrations
│   │   ├── gemini-service.ts    # Google Gemini AI
│   │   └── youtube-service.ts   # YouTube API
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── validations/       # Zod schemas
├── config/                # Configuration files
└── public/                # Static assets
```

## 🛠️ Tech Stack

### Core
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[React 18](https://react.dev/)** - UI library

### AI & Data
- **[@google/generative-ai](https://ai.google.dev/)** - Google Gemini AI integration
- **[youtubei.js](https://github.com/LuanRT/YouTube.js)** - YouTube transcript extraction
- **[Zod](https://zod.dev/)** - Schema validation

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[Radix UI](https://www.radix-ui.com/)** - Accessible UI primitives
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[react-markdown](https://github.com/remarkjs/react-markdown)** - Markdown rendering

### Utilities
- **[clsx](https://github.com/lukeed/clsx)** - Conditional class names
- **[cheerio](https://cheerio.js.org/)** - HTML parsing
- **[class-variance-authority](https://cva.style/docs)** - Component variants

## 📝 Usage

1. **Enter a YouTube URL or Video ID**
   - Paste a full YouTube URL or just the video ID
   - The app will automatically validate and extract the video ID

2. **Get Transcript**
   - Click "Get Transcript" to fetch the video transcript
   - View the transcript with timestamps in chunks

3. **Generate Summary**
   - After the transcript loads, click "Generate Summary"
   - The AI will analyze the transcript and create a concise summary

4. **Copy or Download**
   - Use the copy button to copy text to clipboard
   - Use the download button to save as a text file

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NODE_ENV` | Environment (development/production/test) | No |

### Customization

- **Chunk Size**: Modify `MAX_CHUNK_SIZE` in `lib/constants/prompts.ts`
- **AI Prompts**: Customize prompts in `lib/constants/prompts.ts`
- **Site Config**: Update branding in `config/site-config.ts`

## 📦 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## 🚢 Deployment

### Vercel (Recommended)

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add your `GEMINI_API_KEY` environment variable
4. Deploy!

### Other Platforms

ScribeStream can be deployed to any platform that supports Next.js:
- [Netlify](https://www.netlify.com/)
- [Railway](https://railway.app/)
- [Render](https://render.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Vercel](https://vercel.com/) for hosting and deployment

## 📧 Contact

Lindsay Sperring - [@lindsaysperring](https://github.com/lindsaysperring)

Project Link: [https://github.com/lindsaysperring/scribestream](https://github.com/lindsaysperring/scribestream)

---

Made with ❤️ using Next.js and AI
