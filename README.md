# CMU Cloud Security Documentation

This repository contains the documentation for the CMU Cloud Security course, featuring an AI-powered chatbot to answer questions about cloud security concepts.

## Project Overview

The documentation site is built with:
- [Next.js](https://nextjs.org/) - React framework
- [Nextra](https://nextra.site/) - Documentation theme
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI chat functionality 
- [Anthropic Claude](https://www.anthropic.com/) - AI model powering the chat

## Prerequisites

Before getting started, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or newer)
- [pnpm](https://pnpm.io/) (v8 or newer)
- A code editor (VS Code recommended)
- Git

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/GeorgeWerbacher/cmu-cloud-sec-documentation.git
cd cmu-cloud-sec-documentation
```

### 2. Install Dependencies

This project uses pnpm as the package manager:

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

Add the following environment variables:

```
ANTHROPIC_API_KEY=your_anthropic_api_key
```

You'll need to obtain an API key from [Anthropic](https://www.anthropic.com/) to use the Claude AI model.

### 4. Start the Development Server

```bash
pnpm dev
```

This will start the development server at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
.
├── components/               # React components
│   ├── ChatComponent.tsx     # Chat interface component
│   └── FloatingChatButton.tsx # Floating chat button
├── pages/                    # Next.js pages
│   ├── api/                  # API routes
│   │   └── chat.ts           # Claude AI chat endpoint
│   ├── _app.js               # Custom App component
│   ├── _meta.json            # Navigation structure
│   ├── index.mdx             # Homepage content
│   └── about.mdx             # About page
├── public/                   # Static assets
├── .env.local                # Environment variables (create this)
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore rules
├── next.config.js            # Next.js configuration
├── package.json              # Project dependencies
├── pnpm-lock.yaml           # pnpm lock file
└── theme.config.tsx          # Nextra theme configuration
```

## Available Commands

- `pnpm dev` - Start the development server
- `pnpm build` - Build the production version
- `pnpm start` - Start the production server (after building)

## Troubleshooting

### Common Issues

#### "Failed to parse stream string. Invalid code data"

This error might occur if the streaming format from the Claude API doesn't match what the client expects. The current implementation handles this properly.

#### Build Failures Related to Package Lock Files

If you're getting errors about package lock files:

```bash
# Remove Next.js build cache
rm -rf .next
# Ensure pnpm lock file is up to date
pnpm install --no-frozen-lockfile
```

#### Streaming Issues with the AI Chat

If the AI chat is not working properly:
1. Check that your Anthropic API key is valid and properly set in `.env.local`
2. Verify that the model specified in `pages/api/chat.ts` is available to your API key
3. Check the console for any API errors

## Deployment

This project is set up to deploy to Vercel through a GitHub integration. When you push changes to the main branch, they are automatically deployed.

### Vercel Environment Variables

When deploying to Vercel, make sure to set the following environment variables:
- `ANTHROPIC_API_KEY`: Your Anthropic API key

## Working with the Claude AI Integration

The AI chatbot uses Anthropic's Claude model to answer questions about cloud security. The integration is handled in `pages/api/chat.ts` using the Vercel AI SDK's streaming functionality.

If you need to modify the AI behavior:
1. Adjust the system message in `pages/api/chat.ts` to change how the AI responds
2. Update the model version if needed (currently using `claude-3-7-sonnet-20250219`)
3. Modify temperature or other parameters to control response randomness

## License

MIT
