"use client"

import { useState, useEffect } from 'react';
import { Share2, Copy, Check, Lock, Globe, X, Clock, Eye, Trash2, Link2, Mail, Download, QrCode, Shield } from 'lucide-react';

interface ShareChatProps {
  chatId: string;
  chatName: string;
  messages: Array<{ role: string; content: string }>;
}

interface SharedLink {
  id: string;
  chatId: string;
  chatName: string;
  messages: any[];
  isPublic: boolean;
  createdAt: number;
  expiresAt: number | null;
  views: number;
  lastViewed: number | null;
  password?: string;
}

export default function ShareChat({ chatId, chatName, messages }: ShareChatProps) {
  const [showModal, setShowModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [expiresIn, setExpiresIn] = useState<string>('never');
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [existingLinks, setExistingLinks] = useState<SharedLink[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new');

  useEffect(() => {
    if (showModal) {
      loadExistingLinks();
    }
  }, [showModal, chatId]);

  const loadExistingLinks = () => {
    if (typeof window === "undefined") return;
    
    const registry = localStorage.getItem('shared_chats_registry');
    if (!registry) return;
    
    const registryData: SharedLink[] = JSON.parse(registry);
    const chatLinks = registryData.filter(link => link.chatId === chatId);
    setExistingLinks(chatLinks);
  };

  const calculateExpiration = (duration: string): number | null => {
    if (duration === 'never') return null;
    
    const now = Date.now();
    const durations: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    
    return now + (durations[duration] || 0);
  };

  const handleShare = async () => {
    setLoading(true);
    
    try {
      const shareId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = calculateExpiration(expiresIn);
      
      const shareData: SharedLink = {
        id: shareId,
        chatId,
        chatName,
        messages,
        isPublic,
        createdAt: Date.now(),
        expiresAt,
        views: 0,
        lastViewed: null,
        ...(usePassword && password ? { password } : {})
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(`shared_${shareId}`, JSON.stringify(shareData));
        
        const registry = localStorage.getItem('shared_chats_registry');
        const registryData = registry ? JSON.parse(registry) : [];
        registryData.push(shareData);
        localStorage.setItem('shared_chats_registry', JSON.stringify(registryData));
      }
      
      const link = `${window.location.origin}/share/${shareId}`;
      setShareLink(link);
      setActiveTab('new');
      loadExistingLinks();
      
    } catch (error) {
      console.error('Failed to create share link:', error);
      alert('Failed to create share link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (link?: string) => {
    await navigator.clipboard.writeText(link || shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (linkId: string) => {
    if (!confirm('Are you sure you want to delete this share link?')) return;
    
    if (typeof window === "undefined") return;
    
    localStorage.removeItem(`shared_${linkId}`);
    
    const registry = localStorage.getItem('shared_chats_registry');
    if (registry) {
      const registryData = JSON.parse(registry);
      const updated = registryData.filter((link: SharedLink) => link.id !== linkId);
      localStorage.setItem('shared_chats_registry', JSON.stringify(updated));
    }
    
    loadExistingLinks();
    if (shareLink.includes(linkId)) {
      setShareLink('');
    }
  };

  const formatTimeRemaining = (expiresAt: number | null) => {
    if (!expiresAt) return 'Never expires';
    
    const now = Date.now();
    const diff = expiresAt - now;
    
    if (diff < 0) return 'Expired';
    
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Expires in ${days}d`;
    if (hours > 0) return `Expires in ${hours}h`;
    return 'Expires soon';
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this conversation: ${chatName}`);
    const body = encodeURIComponent(`I wanted to share this conversation with you:\n\n${shareLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleReset = () => {
    setShareLink('');
    setPassword('');
    setUsePassword(false);
    setExpiresIn('never');
    setShowQR(false);
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
          <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-[#1E1E1E] flex items-center justify-between p-6 border-b border-[#2E2E2E] z-10">
              <h2 className="text-lg font-semibold text-[#E5E5E0]">Share Chat</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-[#2A2A2A] rounded-md transition-colors text-[#9B9B95]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#2E2E2E] px-6">
              <button
                onClick={() => setActiveTab('new')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'new'
                    ? 'border-[#CC785C] text-[#E5E5E0]'
                    : 'border-transparent text-[#9B9B95] hover:text-[#E5E5E0]'
                }`}
              >
                Create New Link
              </button>
              <button
                onClick={() => setActiveTab('existing')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
                  activeTab === 'existing'
                    ? 'border-[#CC785C] text-[#E5E5E0]'
                    : 'border-transparent text-[#9B9B95] hover:text-[#E5E5E0]'
                }`}
              >
                Existing Links
                {existingLinks.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-[#CC785C] text-white text-xs rounded-full">
                    {existingLinks.length}
                  </span>
                )}
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'new' ? (
                <div className="space-y-6">
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
                        <p className="text-xs text-[#6B6B65]">Only accessible with password</p>
                      </div>
                    </button>
                  </div>

                  {/* Expiration */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-[#E5E5E0] flex items-center gap-2">
                      <Clock size={16} />
                      Link Expiration
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {['1h', '24h', '7d', '30d', 'never'].map((duration) => (
                        <button
                          key={duration}
                          onClick={() => setExpiresIn(duration)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            expiresIn === duration
                              ? 'bg-[#CC785C] text-white'
                              : 'bg-[#2A2A2A] text-[#9B9B95] hover:bg-[#3A3A3A]'
                          }`}
                        >
                          {duration === 'never' ? 'Never' : duration}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Password Protection */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={usePassword}
                        onChange={(e) => setUsePassword(e.target.checked)}
                        className="w-4 h-4 rounded border-[#3A3A3A] bg-[#2A2A2A] text-[#CC785C] focus:ring-[#CC785C] focus:ring-offset-0"
                      />
                      <span className="text-sm font-medium text-[#E5E5E0] flex items-center gap-2">
                        <Shield size={16} />
                        Password Protection (Optional)
                      </span>
                    </label>
                    
                    {usePassword && (
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-sm text-[#E5E5E0] placeholder-[#6B6B65] focus:outline-none focus:border-[#CC785C]"
                      />
                    )}
                  </div>

                  {/* Share Link Section */}
                  {shareLink ? (
                    <div className="space-y-4">
                      <div className="bg-[#2A4A2A] border border-[#3A5A3A] rounded-lg p-4">
                        <p className="text-sm font-medium text-[#90EE90] mb-2">✓ Link Created Successfully!</p>
                        <p className="text-xs text-[#6B8B6B]">Your share link is ready to use</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[#E5E5E0]">Share Link</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="flex-1 px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-sm text-[#E5E5E0] focus:outline-none"
                          />
                          <button
                            onClick={() => handleCopy()}
                            className="px-4 py-2 bg-[#CC785C] hover:bg-[#B8674A] text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleEmailShare}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#E5E5E0] rounded-lg transition-colors text-sm"
                        >
                          <Mail size={16} />
                          Email
                        </button>
                        <button
                          onClick={() => setShowQR(!showQR)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#E5E5E0] rounded-lg transition-colors text-sm"
                        >
                          <QrCode size={16} />
                          QR Code
                        </button>
                      </div>

                      {showQR && (
                        <div className="bg-[#2A2A2A] rounded-lg p-4 flex items-center justify-center">
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-black text-xs text-center">QR Code would appear here</p>
                            <p className="text-black text-xs text-center mt-1">(Requires QR library)</p>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleReset}
                        className="w-full px-4 py-2 text-[#9B9B95] hover:text-[#E5E5E0] text-sm transition-colors"
                      >
                        Create Another Link
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleShare}
                      disabled={loading || (usePassword && !password)}
                      className="w-full px-4 py-3 bg-[#CC785C] hover:bg-[#B8674A] disabled:bg-[#3A3A3A] disabled:text-[#6B6B65] text-white rounded-lg transition-colors font-medium"
                    >
                      {loading ? 'Creating link...' : 'Create share link'}
                    </button>
                  )}

                  <p className="text-xs text-[#6B6B65] text-center">
                    Share links are stored locally. They persist until browser data is cleared.
                  </p>
                </div>
              ) : (
                /* Existing Links Tab */
                <div className="space-y-4">
                  {existingLinks.length === 0 ? (
                    <div className="text-center py-12">
                      <Link2 size={48} className="mx-auto text-[#6B6B65] mb-4" />
                      <p className="text-[#9B9B95]">No existing share links</p>
                      <p className="text-sm text-[#6B6B65] mt-2">Create your first share link in the other tab</p>
                    </div>
                  ) : (
                    existingLinks.map((link) => (
                      <div
                        key={link.id}
                        className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {link.isPublic ? (
                                <Globe size={14} className="text-[#6B6B65]" />
                              ) : (
                                <Lock size={14} className="text-[#6B6B65]" />
                              )}
                              <span className="text-xs text-[#6B6B65]">
                                {link.isPublic ? 'Public' : 'Private'}
                              </span>
                              {link.password && (
                                <Shield size={14} className="text-[#CC785C]" />
                              )}
                            </div>
                            <p className="text-sm text-[#E5E5E0] font-medium mb-1">
                              {new Date(link.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-[#6B6B65]">
                              <span className="flex items-center gap-1">
                                <Eye size={12} />
                                {link.views} views
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {formatTimeRemaining(link.expiresAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleCopy(`${window.location.origin}/share/${link.id}`)}
                              className="p-2 hover:bg-[#3A3A3A] rounded-md transition-colors text-[#9B9B95] hover:text-[#E5E5E0]"
                              title="Copy link"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(link.id)}
                              className="p-2 hover:bg-[#3A3A3A] rounded-md transition-colors text-[#9B9B95] hover:text-red-400"
                              title="Delete link"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
