"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2, Copy } from 'lucide-react'

export default function DatabaseSetup() {
  const [copied, setCopied] = useState(false)

  const sqlScript = `-- Create chat_histories table for storing user chat sessions
create table if not exists public.chat_histories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Chat',
  messages jsonb not null default '[]'::jsonb,
  model text not null default 'meta-llama/llama-4-maverick:free',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.chat_histories enable row level security;

-- Create policies
create policy "Users can view their own chat histories"
  on public.chat_histories for select
  using (auth.uid() = user_id);

create policy "Users can create their own chat histories"
  on public.chat_histories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own chat histories"
  on public.chat_histories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own chat histories"
  on public.chat_histories for delete
  using (auth.uid() = user_id);

-- Create indices for faster queries
create index if not exists chat_histories_user_id_idx on public.chat_histories(user_id);
create index if not exists chat_histories_user_created_at_idx on public.chat_histories(user_id, created_at desc);`

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#2E2E2E]">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-[#CC785C] flex-shrink-0 mt-1" size={24} />
            <div>
              <h2 className="text-lg font-semibold text-[#E5E5E0]">Database Setup Required</h2>
              <p className="text-sm text-[#9B9B95] mt-1">
                The chat_histories table needs to be created in your Supabase database.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-medium text-[#E5E5E0] mb-2">Steps:</h3>
            <ol className="space-y-2 text-sm text-[#9B9B95] list-decimal list-inside">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to the SQL Editor</li>
              <li>Create a new query and paste the SQL below</li>
              <li>Click "Run" to execute</li>
              <li>Refresh this page</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium text-[#E5E5E0] mb-2">SQL Script:</h3>
            <div className="relative">
              <pre className="bg-[#0F0F0F] border border-[#2E2E2E] rounded p-4 text-xs text-[#E5E5E0] overflow-x-auto">
                <code>{sqlScript}</code>
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded transition-colors"
              >
                {copied ? (
                  <CheckCircle2 size={18} className="text-green-500" />
                ) : (
                  <Copy size={18} className="text-[#9B9B95]" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-[#0F0F0F] border border-[#2E2E2E] rounded p-4">
            <p className="text-sm text-[#9B9B95]">
              After running the SQL, your chat history will be automatically saved and synced across all devices.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-[#CC785C] hover:bg-[#B86B4A] text-white rounded-md transition-colors font-medium"
          >
            Retry After Setup
          </button>
        </div>
      </div>
    </div>
  )
}
