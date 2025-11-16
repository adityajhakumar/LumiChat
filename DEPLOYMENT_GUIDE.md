# LumiChat Deployment Guide

## Prerequisites
- Supabase project set up with authentication enabled
- Environment variables configured in Vercel

## Environment Variables Required

Add these to your Vercel project settings (Vars section):

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY_1=your_api_key
OPENROUTER_API_KEY_2=your_api_key
OPENROUTER_API_KEY_3=your_api_key
OPENROUTER_API_KEY_4=your_api_key
\`\`\`

## Database Setup

1. Go to your Supabase project SQL editor
2. Run the migration script from `scripts/001_create_chat_histories.sql`
3. This creates the `chat_histories` table with proper RLS policies

## Features

✅ **User Authentication**
- Email/password login and signup
- Secure session management with middleware

✅ **Chat Persistence**
- Auto-save messages to Supabase (2-second debounce)
- Chat history synced across devices
- Organized by time (Today, Yesterday, etc.)

✅ **Study Mode**
- PDF viewer with page selection
- AI-powered page and document summarization
- Cross-questioning on document content

✅ **Multi-Model Support**
- Auto-fallback system if primary model fails
- Support for 20+ AI models via OpenRouter
- Reasoning mode for advanced thinking

✅ **File Analysis**
- Intelligent Excel, Word, PDF analysis
- Visual content extraction from PDFs
- Structured data extraction

## Deployment Steps

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel project settings
4. Run the SQL migration in Supabase
5. Deploy to Vercel

## Post-Deployment

- Users can sign up at `/auth/sign-up`
- Login at `/auth/login`
- Chat history automatically saves and syncs
- All data is encrypted and protected by RLS policies

## Support

For issues, check:
- Supabase dashboard for auth and database status
- Vercel logs for API errors
- Browser console for frontend issues
