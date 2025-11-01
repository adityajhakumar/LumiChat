"use client"

import { useState } from 'react';
import { Share2, Copy, Check, Lock, Globe, X } from 'lucide-react';

interface ShareChatProps {
  chatId: string;
  chatName: string;
  messages: Array<{ role: string; content: string }>;
}

export default function ShareChat({ chatId, chatName, messages }: ShareChatProps) {
  const [showModal, setShowModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    
    try {
      // Generate unique share ID
      const shareId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const shareData = {
        id: shareId,
        chatId,
        chatName,
        messages,
        isPublic,
        createdAt: Date.now(),
        views: 0
      };

      // Store in localStorage with shared_ prefix
      if (typeof window !== "undefined") {
        localStorage.setItem(`shared_${shareId}`, JSON.stringify(shareData));
        
        // Also keep a registry of all shared chats
        const registry = localStorage.getItem('shared_chats_registry');
        const registryData = registry ? JSON.parse(registry) : [];
        registryData.push({
          id: shareId,
          chatName,
          createdAt: Date.now()
        });
        localStorage.setItem('shared_chats_registry', JSON.stringify(registryData));
      }
      
      // Generate share link
      const link = `${window.location.origin}/share/${shareId}`;
      setShareLink(link);
      
    } catch (error) {
      console.error('Failed to create share link:', error);
      alert('Failed to create share link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 rounded-md hover:bg-[#2A2A2A] text-[#9B9B95] hover:text-[#E5E5E0] transition-colors"
        title="Share chat"
      >
        <Share2 size={18} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-xl max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2E2E2E]">
              <h2 className="text-lg font-semibold text-[#E5E5E0]">Share Chat</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-[#2A2A2A] rounded-md transition-colors text-[#9B9B95]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Chat Preview */}
              <div>
                <p className="text-sm text-[#9B9B95] mb-2">Sharing conversation:</p>
                <div className="bg-[#2A2A2A] rounded-lg p-3 border border-[#3A3A3A]">
                  <p className="text-sm text-[#E5E5E0] font-medium truncate">{chatName}</p>
                  <p className="text-xs text-[#6B6B65] mt-1">{messages.length} messages</p>
                </div>
              </div>

              {/* Privacy Toggle */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-[#E5E5E0]">Privacy</p>
                
                <button
                  onClick={() => setIsPublic(true)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isPublic
                      ? 'bg-[#2A2A2A] border-[#CC785C] text-[#E5E5E0]'
                      : 'bg-[#1A1A1A] border-[#3A3A3A] text-[#9B9B95] hover:border-[#4A4A4A]'
                  }`}
                >
                  <Globe size={18} />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Public</p>
                    <p className="text-xs text-[#6B6B65]">Anyone with the link can view</p>
                  </div>
                </button>

                <button
                  onClick={() => setIsPublic(false)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    !isPublic
                      ? 'bg-[#2A2A2A] border-[#CC785C] text-[#E5E5E0]'
                      : 'bg-[#1A1A1A] border-[#3A3A3A] text-[#9B9B95] hover:border-[#4A4A4A]'
                  }`}
                >
                  <Lock size={18} />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Private</p>
                    <p className="text-xs text-[#6B6B65]">Only you can view (coming soon)</p>
                  </div>
                </button>
              </div>

              {/* Share Link Section */}
              {shareLink ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[#E5E5E0]">Share Link</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-sm text-[#E5E5E0] focus:outline-none focus:border-[#CC785C]"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 bg-[#CC785C] hover:bg-[#B8674A] text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-[#6B6B65]">
                    Share links are stored locally in your browser. They will be available as long as your browser data is not cleared.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleShare}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#CC785C] hover:bg-[#B8674A] disabled:bg-[#3A3A3A] disabled:text-[#6B6B65] text-white rounded-lg transition-colors font-medium"
                >
                  {loading ? 'Creating link...' : 'Create share link'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
