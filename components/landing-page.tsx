import React, { useState, useEffect } from 'react';
import { ArrowRight, FileText, Image, Code2, Zap, Brain, Lock, Layers, Database, Check, X, TrendingDown, DollarSign, Sparkles } from 'lucide-react';

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
      {/* Animated gradient background */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(234, 88, 12, 0.15), transparent 40%)`
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/generated-image (1).png" 
                alt="LUMICHAT Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold tracking-wider">LUMICHAT</span>
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div 
            className="text-center transform transition-all duration-1000"
            style={{ 
              opacity: Math.max(0.3, 1 - scrollY / 500),
              transform: `translateY(${scrollY * 0.2}px)`
            }}
          >
            <div className="inline-flex items-center space-x-2 mb-8 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full backdrop-blur-sm">
              <span className="text-zinc-400 text-sm">One Plan. Full Power. Zero Confusion.</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight">
              <span className="block mb-2">LUMICHAT</span>
              <span className="block bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                Premium AI at Coffee Prices
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-zinc-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Why pay ₹2000/month when you only use AI for 10 days?
              <span className="block mt-2 text-3xl font-bold text-white">₹39/day</span>
              <span className="block mt-2 text-orange-400">Pay only when your brain needs a boost.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleEnterApp}
                className="group relative px-8 py-4 bg-white text-zinc-950 text-lg font-medium rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Start Free — No Card Required</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
              
              <button className="px-8 py-4 text-zinc-300 text-lg font-medium rounded-xl border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900/50 transition-all duration-300">
                See how it works
              </button>
            </div>

            <div className="flex items-center justify-center space-x-6 mt-8 text-sm text-zinc-500">
              <span>No tiers, no limits</span>
              <span>•</span>
              <span>Everything unlocked</span>
              <span>•</span>
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Floating Chat Preview */}
          <div className="relative mt-24">
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-3xl blur-3xl opacity-20" />
              
              <div className="relative bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-zinc-400 font-semibold">LUMICHAT Maestro</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-zinc-500">
                    <span className="px-3 py-1 bg-orange-900/30 text-orange-400 rounded-full">₹39/day — Full Power</span>
                  </div>
                </div>
                
                <div className="p-8 space-y-6 bg-gradient-to-b from-zinc-900 to-zinc-950">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      You
                    </div>
                    <div className="flex-1 bg-zinc-800/50 rounded-2xl rounded-tl-none p-5 border border-zinc-700/50">
                      <p className="text-zinc-300">Help me debug this React component and optimize performance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <img 
                      src="/generated-image (1).png"
                      alt="LUMICHAT" 
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-2xl rounded-tl-none p-5 border border-zinc-700/50">
                      <p className="text-zinc-200 mb-3">I will analyze your code and provide optimizations. Here is what I found...</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <span>1M tokens/day</span>
                        <span>•</span>
                        <span>Image analysis</span>
                        <span>•</span>
                        <span>Code execution</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Pay-Per-Day Section */}
      <section className="relative py-32 px-6 lg:px-8 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Why pay-per-day beats monthly subscriptions
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Most AI apps force you to pay ₹1500–₹3000 every month. LUMICHAT lets you pay only for the days you actually use.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Traditional Monthly AI Apps */}
            <div className="relative p-8 bg-red-950/10 border border-red-900/30 rounded-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <X className="w-6 h-6 text-red-400" />
                <h3 className="text-2xl font-semibold text-red-300">Traditional Monthly AI Apps</h3>
              </div>
              <ul className="space-y-4 mb-8">
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
              <div className="p-4 bg-red-950/20 rounded-lg border border-red-900/30">
                <p className="text-lg font-semibold text-red-300">Average waste: ₹800–₹1800/month</p>
                <p className="text-sm text-zinc-500 mt-1">Paying for 18–22 unused days every month</p>
              </div>
            </div>

            {/* LUMICHAT Maestro Plan */}
            <div className="relative p-8 bg-gradient-to-br from-green-950/10 to-orange-950/10 border border-green-900/30 rounded-2xl">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-green-500 rounded-2xl blur opacity-20" />
              <div className="relative">
                <div className="flex items-center space-x-3 mb-6">
                  <Check className="w-6 h-6 text-green-400" />
                  <h3 className="text-2xl font-semibold text-green-300">LUMICHAT Maestro Plan</h3>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start space-x-3 text-zinc-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">₹39/day</strong> — Pay only when you need it</span>
                  </li>
                  <li className="flex items-start space-x-3 text-zinc-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Everything unlocked</strong> — No tiers, no limits, full power</span>
                  </li>
                  <li className="flex items-start space-x-3 text-zinc-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">1M tokens/day</strong> — Massive context for complex work</span>
                  </li>
                  <li className="flex items-start space-x-3 text-zinc-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Unlimited uploads</strong> — Docs, code, images, everything</span>
                  </li>
                  <li className="flex items-start space-x-3 text-zinc-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Zero commitment</strong> — Activate when inspiration strikes</span>
                  </li>
                </ul>
                <div className="p-4 bg-gradient-to-r from-green-950/20 to-orange-950/20 rounded-lg border border-green-900/30">
                  <p className="text-lg font-semibold text-green-300">Typical spend: ₹312–₹468/month</p>
                  <p className="text-sm text-zinc-400 mt-1">Based on 8–12 active days • Save 70–85% vs subscriptions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-orange-900/50 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <TrendingDown className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Save 70–85%</h3>
              <p className="text-zinc-400">Students save thousands per year compared to monthly AI subscriptions</p>
            </div>

            <div className="text-center p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-orange-900/50 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Layers className="w-8 h-8" />
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

      {/* Pricing Section */}
      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              One Plan. Full Power. Simple Pricing.
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              No tiers. No confusion. No locked features. Everyone gets the complete premium experience.
            </p>
          </div>

          {/* Single Pricing Card */}
          <div className="max-w-4xl mx-auto">
            <div className="relative p-12 bg-gradient-to-br from-orange-950/20 to-orange-900/10 rounded-3xl border-2 border-orange-500">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-full shadow-lg">
                🎯 MAESTRO PLAN — Everything Unlocked
              </div>
              
              <div className="text-center mb-8 mt-4">
                <h3 className="text-2xl font-bold mb-2 text-orange-400">The Only Plan You Need</h3>
                <p className="text-zinc-400 text-lg mb-6">Premium AI without premium prices</p>
                
                <div className="flex items-baseline justify-center space-x-3 mb-2">
                  <span className="text-7xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">₹39</span>
                  <span className="text-3xl text-zinc-500">/day</span>
                </div>
                <p className="text-zinc-400 mb-2">Pay only on the days you use</p>
                <p className="text-sm text-zinc-500">Heavy user? Get <span className="text-orange-400 font-semibold">₹1199/month</span> (saves ₹71/month)</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
                  <div className="flex items-start space-x-3">
                    <Database className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">1M Tokens Daily</h4>
                      <p className="text-zinc-400 text-sm">Massive context for complex projects</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Unlimited Uploads</h4>
                      <p className="text-zinc-400 text-sm">PDFs, code, images — everything</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
                  <div className="flex items-start space-x-3">
                    <Image className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Image Analysis</h4>
                      <p className="text-zinc-400 text-sm">Understand diagrams, charts, screenshots</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
                  <div className="flex items-start space-x-3">
                    <Code2 className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Code Execution</h4>
                      <p className="text-zinc-400 text-sm">Run, test, debug in real-time</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
                  <div className="flex items-start space-x-3">
                    <Brain className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Long Context Memory</h4>
                      <p className="text-zinc-400 text-sm">Remembers your entire conversation</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Fast Processing</h4>
                      <p className="text-zinc-400 text-sm">Lightning-quick responses</p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleEnterApp}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                Start Free — No Card Required
              </button>
              
              <div className="flex items-center justify-center space-x-4 mt-6 text-sm text-zinc-500">
                <span>No commitments</span>
                <span>•</span>
                <span>Cancel anytime</span>
                <span>•</span>
                <span>Instant activation</span>
              </div>
            </div>
          </div>

          {/* Monthly Savings */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-center mb-12">💰 Your Monthly Savings</h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <div className="text-center">
                  <p className="text-orange-400 font-semibold mb-2">8 days</p>
                  <p className="text-zinc-400 text-sm mb-4">Light use month</p>
                  <p className="text-4xl font-bold text-white mb-2">₹312</p>
                  <p className="text-zinc-500 text-sm mb-3">vs ₹2000 subscription</p>
                  <p className="text-green-400 font-semibold text-lg">Save ₹1,688</p>
                </div>
              </div>

              <div className="p-8 bg-gradient-to-br from-orange-950/20 to-orange-900/10 rounded-2xl border-2 border-orange-500/50">
                <div className="text-center">
                  <p className="text-orange-400 font-semibold mb-2">12 days</p>
                  <p className="text-zinc-400 text-sm mb-4">Average use month</p>
                  <p className="text-4xl font-bold text-white mb-2">₹468</p>
                  <p className="text-zinc-500 text-sm mb-3">vs ₹2000 subscription</p>
                  <p className="text-green-400 font-semibold text-lg">Save ₹1,532</p>
                </div>
              </div>

              <div className="p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <div className="text-center">
                  <p className="text-orange-400 font-semibold mb-2">20 days</p>
                  <p className="text-zinc-400 text-sm mb-4">Heavy use month</p>
                  <p className="text-4xl font-bold text-white mb-2">₹780</p>
                  <p className="text-zinc-500 text-sm mb-3">vs ₹2000 subscription</p>
                  <p className="text-green-400 font-semibold text-lg">Save ₹1,220</p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Message */}
          <div className="mt-12 p-8 bg-gradient-to-r from-orange-950/20 to-orange-900/10 rounded-2xl border border-orange-500/30 text-center max-w-4xl mx-auto">
            <Sparkles className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <p className="text-lg text-zinc-300">
              <strong className="text-white">💡 Why Students Love LUMICHAT:</strong> You do not need 30-day subscriptions for intense bursts of work. 
              Get <strong className="text-orange-400">enterprise-grade AI</strong> exactly when you need it — 
              starting at less than a cup of coffee. ☕
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6 lg:px-8 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Everything Included. Nothing Hidden.
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              One plan means no locked features. You get everything from day one.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Database,
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
                icon: Brain,
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
                icon: Layers,
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
                className="group relative p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-orange-900/50 transition-all duration-300"
              >
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
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative py-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-20 text-center">
            Built for Every Kind of Work
          </h2>
          
          <div className="space-y-12">
            <div className="p-8 rounded-2xl border border-zinc-800 bg-gradient-to-br from-green-500/10 to-teal-500/10 backdrop-blur-sm hover:border-zinc-700 transition-all duration-500">
              <div className="flex items-start space-x-4 mb-4">
                <span className="text-4xl">📚</span>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">For Students</h3>
                  <p className="text-lg text-zinc-400 leading-relaxed">
                    Write essays, solve complex problems, understand difficult concepts. Perfect for assignments, research papers, and exam preparation. Use it 8-12 days per month and save thousands.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border border-zinc-800 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm hover:border-zinc-700 transition-all duration-500">
              <div className="flex items-start space-x-4 mb-4">
                <span className="text-4xl">💻</span>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">For Developers</h3>
                  <p className="text-lg text-zinc-400 leading-relaxed">
                    Debug complex issues, architect solutions, generate production code. Full code execution, massive context for large codebases. Pay for sprint weeks, save during planning.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border border-zinc-800 bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-sm hover:border-zinc-700 transition-all duration-500">
              <div className="flex items-start space-x-4 mb-4">
                <span className="text-4xl">🎨</span>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">For Creative Professionals</h3>
                  <p className="text-lg text-zinc-400 leading-relaxed">
                    Brainstorm campaigns, refine copy, develop content strategies. Image analysis for visual work. Activate during project weeks, pause between clients.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border border-zinc-800 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm hover:border-zinc-700 transition-all duration-500">
              <div className="flex items-start space-x-4 mb-4">
                <span className="text-4xl">🔬</span>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">For Researchers</h3>
                  <p className="text-lg text-zinc-400 leading-relaxed">
                    Analyze data, synthesize information across documents. 1M token context for comprehensive literature reviews. Use during research phases, save during field work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 lg:px-8 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "1", label: "Simple Plan", suffix: "" },
              { number: "∞", label: "Uploads/Day", suffix: "" },
              { number: "39", label: "Per Day", suffix: "₹" },
              { number: "85", label: "Savings", suffix: "", extra: "%" }
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-pointer">
                <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-br from-orange-400 to-orange-600 bg-clip-text text-transparent group-hover:from-orange-300 group-hover:to-orange-500 transition-all duration-300">
                  {stat.suffix}{stat.number}{stat.extra}
                </div>
                <div className="text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-16 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5" />
            
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Ready to Pay Only for What You Use?
              </h2>
              <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
                Join thousands who have discovered smarter AI pricing. No subscriptions, no waste, just brilliant AI when you need it.
              </p>
              
              <button
                onClick={handleEnterApp}
                className="group relative px-10 py-5 bg-white text-zinc-950 text-xl font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30 mb-4"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Start Free — No Card Required</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </button>
              
              <p className="text-sm text-zinc-500">₹39/day • Everything unlocked • Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img 
                src="/generated-image (1).png"
                alt="LUMICHAT Logo" 
                className="w-6 h-6 object-contain"
              />
              <span className="text-lg font-bold tracking-wider">LUMICHAT</span>
            </div>
            <div className="text-zinc-500 text-sm text-center md:text-right">
              <p>© 2024 LUMICHAT. Premium AI at coffee prices.</p>
              <p className="mt-1">Founded by Aditya Kumar Jha</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
