# Deployment Guide

This guide provides detailed instructions for deploying your Cloud Security Documentation site with RAG capabilities to production.

## Preparing for Deployment

Before deploying your application, you need to complete several important steps:

### 1. Database Setup

Ensure your Supabase database is properly configured:

1. Log into your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to the SQL Editor
3. Run the SQL setup script located in `scripts/setup-all-tables.sql`
4. Verify the script executed correctly by checking that the following tables exist:
   - `documents_embeddings`
   - `api_usage`
   - `response_cache`

### 2. Environment Check

Verify that your environment is correctly configured:

```bash
npm run check-env
```

This command will test your database connection and API credentials, reporting any issues that need to be fixed before deployment.

### 3. Generate Embeddings

Generate embeddings for your documentation:

```bash
npm run init-rag
```

This step is crucial as it pre-populates your vector database with embeddings. Doing this before deployment prevents timeout issues during the build process.

## Deploying to Vercel

Vercel is the recommended deployment platform for this project due to its excellent support for Next.js applications.

### 1. Push to GitHub

First, push your project to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Connect to Vercel

1. Create an account on [Vercel](https://vercel.com/) if you don't have one
2. Click "Import Project" from the Vercel dashboard
3. Choose "Import Git Repository" and select your GitHub repository
4. Authorize Vercel to access your repository if prompted

### 3. Configure Project Settings

On the import page:

1. Project Name: Enter a name for your project
2. Framework Preset: Verify that "Next.js" is selected
3. Root Directory: Keep as `.` (root)
4. Build Command: `npm run build`
5. Output Directory: `.next`
6. Install Command: `npm install`

### 4. Environment Variables

Add the following environment variables:

- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `OPENAI_API_KEY`: Your OpenAI API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

### 5. Deploy

Click "Deploy" and wait for the build process to complete.

### 6. Monitor Deployment

1. Watch the build logs for any errors
2. Once deployed, you'll receive a URL for your site
3. Test the site thoroughly, especially the AI assistant functionality

## Post-Deployment Tasks

### Verify Functionality

Test the following features:

1. Navigation between documentation pages
2. AI assistant responses
3. Admin usage dashboard at `/admin/usage`

### Custom Domain (Optional)

To add a custom domain:

1. Go to the "Domains" section in your Vercel project settings
2. Click "Add" and enter your domain
3. Follow Vercel's instructions for DNS configuration

### Vercel Analytics (Optional)

To enable analytics:

1. Go to the "Analytics" tab in your Vercel project
2. Click "Enable Analytics"
3. Follow the setup instructions

## Troubleshooting Deployment Issues

### Build Failures

If your build fails, check:

1. Vercel build logs for specific error messages
2. Ensure all environment variables are correctly set
3. Verify Supabase tables are properly set up
4. Make sure your Node.js version is compatible (14+)

### AI Assistant Not Working

If the AI assistant isn't functioning after deployment:

1. Check API key validity and permissions
2. Verify database connections in logs
3. Ensure embeddings were properly generated
4. Test if vector search is working correctly

### Performance Issues

If you're experiencing slow responses:

1. Optimize chunk sizes in the `RecursiveCharacterTextSplitter`
2. Implement more aggressive caching
3. Consider using a different model with faster response times
4. Upgrade your Supabase plan if database performance is the bottleneck

## Continuous Deployment

To set up continuous deployment:

1. Vercel will automatically deploy new commits to your main branch
2. Consider setting up a GitHub Action to regenerate embeddings when documentation changes:

```yaml
# .github/workflows/update-embeddings.yml
name: Update Embeddings

on:
  push:
    branches: [ main ]
    paths:
      - 'pages/**/*.mdx'
      - 'pages/**/*.md'

jobs:
  update-embeddings:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
      - run: npm install
      - run: npm run init-rag
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## Updating Your Deployment

When updating your documentation:

1. Make changes to your local repository
2. Regenerate embeddings if content has changed
3. Commit and push to GitHub
4. Vercel will automatically deploy the changes

Remember to keep your API keys and environment variables secure and never commit them to your repository. 