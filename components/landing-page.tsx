import React, { useState, useEffect } from 'react';
import { ArrowRight, MessageSquare, Layers, Lock, Zap, Brain, Code2, Users, Check, X, DollarSign, TrendingDown, Sparkles, FileText, Image } from 'lucide-react';

interface LumiChatsLandingProps {
  onEnterApp?: () => void;
}

export default function LumiChatsLanding({ onEnterApp }: LumiChatsLandingProps) {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleEnterApp = () => {
    if (onEnterApp) {
      onEnterApp();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(234, 88, 12, 0.15), transparent 40%)`
        }}
      />

      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/generated-image (1).png" 
                alt="LUMICHAT Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-serif">LUMICHAT</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#why" className="text-zinc-400 hover:text-white transition-colors duration-300">Why Us</a>
              <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors duration-300">Pricing</a>
              <a href="#features" className="text-zinc-400 hover:text-white transition-colors duration-300">Features</a>
            </div>
            
            <button
              onClick={handleEnterApp}
              className="px-5 py-2 bg-white text-zinc-950 text-sm font-medium rounded-lg hover:bg-zinc-100 transition-all duration-300 hover:scale-105"
            >
              Start Free
            </button>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div 
            className="text-center transform transition-all duration-1000"
            style={{ 
              opacity: Math.max(0.3, 1 - scrollY / 500),
              transform: `translateY(${scrollY * 0.2}px)`
            }}
          >
            <div className="inline-flex items-center space-x-2 mb-8 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full backdrop-blur-sm animate-fade-in">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-zinc-400 text-sm">One Plan. Full Power. Zero Confusion.</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif mb-8 leading-tight tracking-tight">
              <span className="block mb-2 animate-fade-in-up">LUMICHAT</span>
              <span className="block bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
                Premium AI at Coffee Prices
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              Why pay ₹2000/month when you only use AI for 10 days? 
              <span className="text-orange-400 font-semibold"> ₹39/day — Pay only when your brain needs a boost.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-600">
              <button
                onClick={handleEnterApp}
                className="group relative px-8 py-4 bg-white text-zinc-950 text-lg font-medium rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Start Free — No Card Required</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              
              <button className="px-8 py-4 text-zinc-300 text-lg font-medium rounded-xl border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900/50 transition-all duration-300">
                See how it works
              </button>
            </div>

            <div className="flex items-center justify-center space-x-6 mt-8 text-sm text-zinc-500">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No tiers, no limits</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Everything unlocked</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          <div className="relative mt-24 perspective-1000">
            <div 
              className="relative max-w-5xl mx-auto transform transition-all duration-700"
              style={{
                transform: `translateY(${scrollY * 0.15}px) rotateX(${Math.min(scrollY * 0.02, 10)}deg)`,
                opacity: Math.max(0.2, 1 - scrollY / 800)
              }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-3xl blur-3xl opacity-20" />
              
              <div className="relative bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-zinc-700" />
                      <div className="w-3 h-3 rounded-full bg-zinc-700" />
                      <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    </div>
                    <span className="text-sm text-zinc-400">LUMICHAT Maestro</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="px-3 py-1 bg-gradient-to-r from-orange-900/30 to-orange-800/30 text-orange-400 rounded-full border border-orange-700/30">
                      ₹39/day — Full Power
                    </span>
                  </div>
                </div>
                
                <div className="p-8 space-y-6 bg-gradient-to-b from-zinc-900 to-zinc-950">
                  <div className="flex items-start space-x-4 animate-slide-in-left">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      You
                    </div>
                    <div className="flex-1 bg-zinc-800/50 rounded-2xl rounded-tl-none p-5 border border-zinc-700/50">
                      <p className="text-zinc-300">Help me debug this React component and optimize performance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 animate-slide-in-right animation-delay-300">
                    <img 
                      src="/generated-image (1).png"
                      alt="LUMICHAT" 
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-2xl rounded-tl-none p-5 border border-zinc-700/50">
                      <p className="text-zinc-200 mb-3">I will analyze your code and provide optimizations. Here is what I found...</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <span className="px-2 py-1 bg-orange-900/20 text-orange-400 rounded">1M tokens/day</span>
                        <span>•</span>
                        <span className="px-2 py-1 bg-green-900/20 text-green-400 rounded">Image analysis</span>
                        <span>•</span>
                        <span className="px-2 py-1 bg-blue-900/20 text-blue-400 rounded">Code execution</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="relative py-32 px-6 lg:px-8 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-serif mb-6">
              Why pay-per-day beats monthly subscriptions
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Most AI apps force you to pay ₹1500–₹3000 every month. LUMICHAT lets you pay only for the days you actually use.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div className="relative p-8 bg-red-950/10 border border-red-900/30 rounded-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <X className="w-6 h-6 text-red-400" />
                <h3 className="text-2xl font-semibold text-red-300">Traditional Monthly AI Apps</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-zinc-400">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>₹1500–₹3000/month whether you use it or not</span>
                </li>
                <li className="flex items-start space-x-3 text-zinc-400">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Pay for 30 days when you only need 8–12 intense days</span>
                </li>
                <li className="flex items-start space-x-3 text-zinc-400">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Features locked behind expensive tiers</span>
                </li>
                <li className="flex items-start space-x-3 text-zinc-400">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Cannot pause during exam breaks or holidays</span>
                </li>
                <li className="flex items-start space-x-3 text-zinc-400">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Auto-renewal pressure and subscription fatigue</span>
                </li>
              </ul>
              <div className="mt-8 p-4 bg-red-950/20 rounded-lg border border-red-900/30">
                <p className="text-lg font-semibold text-red-300">Average waste: ₹800–₹1800/month</p>
                <p className="text-sm text-zinc-500 mt-1">Paying for 18–22 unused days every month</p>
              </div>
            </div>

            <div className="relative p-8 bg-gradient-to-br from-green-950/10 to-orange-950/10 border border-green-900/30 rounded-2xl">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-green-500 rounded-2xl blur opacity-20" />
              <div className="relative">
                <div className="flex items-center space-x-3 mb-6">
                  <Check className="w-6 h-6 text-green-400" />
                  <h3 className="text-2xl font-semibold text-green-300">LUMICHAT Maestro Plan</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3 text-zinc-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong>₹39/day</strong> — Pay only when you need it</span>
                  </li>
                  <li className="flex items-start space-x-3 text-zinc-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Everything unlocked</strong> — No tiers, no limits, full power</span>
                  </li>
                  <li className="flex items-start space-x-3 text-zinc-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong>1M tokens/day</strong> — Massive context for complex work</span>
                  </li>
                  <li className="flex items-start space-x-3 text-zinc-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Unlimited uploads</strong> — Docs, code, images, everything</span>
                  </li>
                  <li className="flex items-start space-x-3 text-zinc-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Zero commitment</strong> — Activate when inspiration strikes</span>
                  </li>
                </ul>
                <div className="mt-8 p-4 bg-gradient-to-r from-green-950/20 to-orange-950/20 rounded-lg border border-green-900/30">
                  <p className="text-lg font-semibold text-green-300">Typical spend: ₹312–₹468/month</p>
                  <p className="text-sm text-zinc-400 mt-1">Based on 8–12 active days • Save 70–85% vs subscriptions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-orange-900/50 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <TrendingDown className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Save 70–85%</h3>
              <p className="text-zinc-400">Students save thousands per year compared to monthly AI subscriptions</p>
            </div>

            <div className="text-center p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-orange-900/50 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No Tier Confusion</h3>
              <p className="text-zinc-400">One plan with everything. No choosing, no regrets, just full power</p>
            </div>

            <div className="text-center p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-orange-900/50 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Zero Waste Guarantee</h3>
              <p className="text-zinc-400">Pay for 10 days, get 10 days. No unused days eating your money</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-serif mb-6">
              One Plan. Full Power. Simple Pricing.
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              No tiers. No confusion. No locked features. Everyone gets the complete premium experience.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="relative p-10 bg-gradient-to-br from-orange-950/20 via-purple-950/10 to-orange-900/10 rounded-3xl border-2 border-orange-500">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-full shadow-lg">
                🎯 MAESTRO PLAN — Everything Unlocked
              </div>
              
              <div className="text-center mt-4">
                <h3 className="text-3xl font-bold mb-3">The Only Plan You Need</h3>
                <p className="text-zinc-400 mb-8 text-lg">Premium AI without premium prices</p>
                
                <div className="mb-8">
                  <div className="flex items-baseline justify-center space-x-3 mb-3">
                    <span className="text-6xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">₹39</span>
                    <span className="text-2xl text-zinc-500">/day</span>
                  </div>
                  <div className="text-zinc-500 mb-4">Pay only on the days you use</div>
                  <div className="inline-block px-4 py-2 bg-zinc-900/50 rounded-lg border border-zinc-700">
                    <span className="text-sm text-zinc-400">Heavy user? Get </span>
                    <span className="text-orange-400 font-semibold">₹1199/month</span>
                    <span className="text-sm text-zinc-400"> (saves ₹71/month)</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
                  <div className="flex items-start space-x-3 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800">
                    <Check className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-white mb-1">1M Tokens Daily</div>
                      <div className="text-sm text-zinc-400">Massive context for complex projects</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800">
                    <Check className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-white mb-1">Unlimited Uploads</div>
                      <div className="text-sm text-zinc-400">PDFs, code, images — everything</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800">
                    <Check className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-white mb-1">Image Analysis</div>
                      <div className="text-sm text-zinc-400">Understand diagrams, charts, screenshots</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800">
                    <Check className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-white mb-1">Code Execution</div>
                      <div className="text-sm text-zinc-400">Run, test, debug in real-time</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800">
                    <Check className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-white mb-1">Long Context Memory</div>
                      <div className="text-sm text-zinc-400">Remembers your entire conversation</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800">
                    <Check className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-white mb-1">Fast Processing</div>
                      <div className="text-sm text-zinc-400">Lightning-quick responses</div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleEnterApp}
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-lg rounded-xl hover:from-orange-500 hover:to-orange-400 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 mb-4"
                >
                  Start Free — No Card Required
                </button>

                <div className="flex items-center justify-center space-x-4 text-sm text-zinc-500">
                  <div className="flex items-center space-x-1">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>No commitments</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Cancel anytime</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Instant activation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 p-8 bg-gradient-to-r from-green-950/20 to-emerald-950/10 rounded-2xl border border-green-900/30">
            <h3 className="text-2xl font-semibold mb-6 text-center">💰 Your Monthly Savings</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-zinc-900/50 rounded-xl">
                <div className="text-3xl font-bold text-orange-400 mb-2">8 days</div>
                <div className="text-zinc-400 mb-3">Light use month</div>
                <div className="text-2xl font-semibold text-green-400">₹312</div>
                <div className="text-sm text-zinc-500 mt-2">vs ₹2000 subscription</div>
                <div className="text-xs text-green-400 mt-1 font-semibold">Save ₹1,688</div>
              </div>

              <div className="text-center p-6 bg-zinc-900/50 rounded-xl border-2 border-orange-500/30">
                <div className="text-3xl font-bold text-orange-400 mb-2">12 days</div>
                <div className="text-zinc-400 mb-3">Average use month</div>
                <div className="text-2xl font-semibold text-green-400">₹468</div>
                <div className="text-sm text-zinc-500 mt-2">vs ₹2000 subscription</div>
                <div className="text-xs text-green-400 mt-1 font-semibold">Save ₹1,532</div>
              </div>

              <div className="text-center p-6 bg-zinc-900/50 rounded-xl">
                <div className="text-3xl font-bold text-orange-400 mb-2">20 days</div>
                <div className="text-zinc-400 mb-3">Heavy use month</div>
                <div className="text-2xl font-semibold text-green-400">₹780</div>
                <div className="text-sm text-zinc-500 mt-2">vs ₹2000 subscription</div>
                <div className="text-xs text-green-400 mt-1 font-semibold">Save ₹1,220</div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-orange-950/20 to-orange-900/10 rounded-2xl border border-orange-500/30 text-center">
            <p className="text-zinc-300 text-lg">
              <strong className="text-white">💡 Why Students Love LUMICHAT:</strong> You do not need 30-day subscriptions for intense bursts of work. 
              Get <strong className="text-orange-400">enterprise-grade AI</strong> exactly when you need it — 
              starting at less than a cup of coffee. ☕
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="relative py-32 px-6 lg:px-8 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-serif mb-6">
              Everything Included. Nothing Hidden.
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              One plan means no locked features. You get everything from day one.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "1M Tokens Per Day",
                description: "Massive context window for complex projects, long documents, and extended conversations. Perfect for research and development."
              },
              {
                icon: FileText,
                title: "Unlimited File Uploads",
                description: "Upload PDFs, Word docs, code files, spreadsheets — analyze everything without limits. Your files, your insights."
              },
              {
                icon: Image,
                title: "Image Understanding",
                description: "Analyze diagrams, charts, screenshots, and photos. Visual intelligence built right in, no extra cost."
              },
              {
                icon: Code2,
                title: "Code Execution",
                description: "Run Python, JavaScript, and more. Debug, test, and build directly in the chat. Real development power."
              },
              {
                icon: Layers,
                title: "Long Context Memory",
                description: "Your conversations remember everything. Reference past discussions and build on previous work seamlessly."
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Optimized for speed. Get responses in seconds, not minutes. No throttling, no slow-downs."
              },
              {
                icon: Lock,
                title: "Complete Privacy",
                description: "All data stored securely. Your conversations and files stay private. No training on your data."
              },
              {
                icon: Users,
                title: "Multi-Modal AI",
                description: "Text, images, code, documents — work with any format. One interface for everything."
              },
              {
                icon: DollarSign,
                title: "Transparent Pricing",
                description: "See exactly what you are using. Real-time tracking. No surprise charges. Cancel anytime."
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all duration-500 hover:transform hover:scale-105 cursor-pointer"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${i * 0.1}s both`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-600/0 group-hover:from-orange-500/5 group-hover:to-orange-600/5 rounded-2xl transition-all duration-500" />
                
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 group-hover:bg-orange-900/30 flex items-center justify-center mb-6 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-orange-500" strokeWidth={2} />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-orange-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-serif mb-20 text-center">
            Built for Every Kind of Work
          </h2>
          
          <div className="space-y-16">
            {[
              {
                title: "For Students",
                description: "Write essays, solve complex problems, understand difficult concepts. Perfect for assignments, research papers, and exam preparation. Use it 8-12 days per month and save thousands.",
                gradient: "from-green-500/10 to-teal-500/10",
                icon: "📚"
              },
              {
                title: "For Developers",
                description: "Debug complex issues, architect solutions, generate production code. Full code execution, massive context for large codebases. Pay for sprint weeks, save during planning.",
                gradient: "from-blue-500/10 to-purple-500/10",
                icon: "💻"
              },
              {
                title: "For Creative Professionals",
                description: "Brainstorm campaigns, refine copy, develop content strategies. Image analysis for visual work. Activate during project weeks, pause between clients.",
                gradient: "from-pink-500/10 to-purple-500/10",
                icon: "🎨"
              },
              {
                title: "For Researchers",
                description: "Analyze data, synthesize information across documents. 1M token context for comprehensive literature reviews. Use during research phases, save during field work.",
                gradient: "from-orange-500/10 to-red-500/10",
                icon: "🔬"
              }
            ].map((useCase, i) => (
              <div
                key={i}
                className={`relative p-8 rounded-2xl border border-zinc-800 bg-gradient-to-br ${useCase.gradient} backdrop-blur-sm hover:border-zinc-700 transition-all duration-500`}
                style={{
                  animation: `fadeInUp 0.6s ease-out ${i * 0.2}s both`
                }}
              >
                <div className="text-4xl mb-4">{useCase.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{useCase.title}</h3>
                <p className="text-lg text-zinc-400 leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-8 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "1", label: "Simple Plan", suffix: "" },
              { number: "∞", label: "Uploads/Day", suffix: "" },
              { number: "₹39", label: "Per Day", suffix: "" },
              { number: "85%", label: "Savings", suffix: "" }
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-pointer">
                <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-br from-orange-400 to-orange-600 bg-clip-text text-transparent group-hover:from-orange-300 group-hover:to-orange-500 transition-all duration-300">
                  {stat.suffix}{stat.number}
                </div>
                <div className="text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-16 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5" />
            
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-serif mb-6">
                Ready to Pay Only for What You Use?
              </h2>
              <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
                Join thousands who have discovered smarter AI pricing. No subscriptions, no waste, just brilliant AI when you need it.
              </p>
              
              <button
                onClick={handleEnterApp}
                className="group relative px-10 py-5 bg-white text-zinc-950 text-xl font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Start Free — No Card Required</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </button>
              
              <p className="text-sm text-zinc-500 mt-6">₹39/day • Everything unlocked • Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 lg:px-8 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img 
                src="/generated-image (1).png"
                alt="LUMICHAT Logo" 
                className="w-6 h-6 object-contain"
              />
              <span className="text-lg font-serif">LUMICHAT</span>
            </div>
            <div className="text-zinc-500 text-sm text-center md:text-right">
              <div className="mb-1">© 2024 LUMICHAT. Premium AI at coffee prices.</div>
              <div className="text-xs text-zinc-600">Founded by Aditya Kumar Jha</div>
            </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          animation-fill-mode: both;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          animation-fill-mode: both;
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}} />
    </div>
  );
}
