# CMU Cloud Security Documentation Site

A comprehensive documentation site for Cloud Security built with Next.js, featuring a powerful Retrieval-Augmented Generation (RAG) AI assistant. This project combines a user-friendly documentation interface with an intelligent AI assistant that uses your own documentation content to provide accurate and contextually relevant answers.

## Features

- **Documentation with Nextra**: Clean, searchable, and well-organized documentation using Nextra's docs theme
- **AI-Powered Assistant**: Intelligent chatbot that answers questions based on your documentation content
- **Vector Search**: Semantic search capabilities using Supabase and pgvector
- **Cost-Optimized**: Implements caching and usage tracking to minimize AI API costs
- **Analytics Dashboard**: Admin interface to track API usage, token consumption, and estimated costs
- **Multi-Model Support**: Works with both Claude (Anthropic) and GPT (OpenAI) models

## Tech Stack

- **Frontend**: Next.js, React, Nextra
- **Database**: Supabase (PostgreSQL with pgvector)
- **AI Models**: Claude by Anthropic, GPT by OpenAI
- **Embeddings**: OpenAI embeddings for vector search
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 16+ and npm
- Supabase account (free tier works for development)
- Anthropic API key (for Claude)
- OpenAI API key (for embeddings and optional GPT)

## Local Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/your-username/cmu-cloud-sec-documentation.git
cd cmu-cloud-sec-documentation
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory with the following variables:

```
# AI API Keys
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key

# Supabase
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. **Set up Supabase**

- Create a new Supabase project
- In the SQL Editor, run the setup script located at `scripts/setup-all-tables.sql`
- This will:
  - Enable the pgvector extension
  - Create the documents_embeddings table
  - Create the API usage tracking tables
  - Set up the necessary search functions

5. **Verify environment setup**

```bash
npm run check-env
```

6. **Generate embeddings**

This will process your documentation and create embeddings for vector search:

```bash
npm run init-rag
```

7. **Start the development server**

```bash
npm run dev
```

8. **Access the site**

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The project uses the following database tables:

- **documents_embeddings**: Stores document chunks and their vector embeddings
- **api_usage**: Tracks API requests and token usage
- **response_cache**: Caches responses to reduce API costs

## API Usage Tracking

The project includes an admin dashboard to track AI API usage:

- Access at `/admin/usage`
- View total tokens used
- Monitor request counts
- Calculate estimated costs
- Track usage over time

## Deployment

### Deploy to Vercel

1. Push your repository to GitHub
2. Import the project in Vercel
3. Set the required environment variables
4. Deploy

For detailed deployment instructions, see our [Deployment Guide](docs/deployment.md).

### Important pre-deployment steps:

1. Run the embeddings generation process before deployment:
   ```bash
   npm run init-rag
   ```
2. Make sure your Supabase database tables are properly set up.

## Adding Content

To add new documentation:

1. Create Markdown (.mdx) files in the `pages` directory
2. Update navigation in the appropriate `_meta.json` files
3. Regenerate embeddings to include new content:
   ```bash
   npm run init-rag
   ```

## Troubleshooting

### Common Issues

- **Missing Tables Error**: Run the SQL setup script in Supabase
- **AI API Key Issues**: Verify your API keys are correctly set in environment variables
- **Navigation Errors**: Check your `_meta.json` files for proper JSON formatting
- **Embedding Errors**: Ensure your OpenAI API key has access to embeddings

For more troubleshooting, see the console logs or check the API response.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Nextra](https://nextra.site/) for the documentation framework
- [Supabase](https://supabase.com/) for the database and vector search
- [Anthropic](https://www.anthropic.com/) for the Claude AI model
- [OpenAI](https://openai.com/) for embeddings and GPT model
- [Vercel](https://vercel.com/) for hosting and deployment
