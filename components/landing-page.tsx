import React, { useState, useEffect } from 'react';
import { ArrowRight, MessageSquare, Layers, Lock, Zap, Brain, Code2, Users, Check, X, DollarSign, TrendingDown } from 'lucide-react';

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
              {/* Logo */}
              <img 
                src="/generated-image (1).png" 
                alt="AI Orchestra Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-serif">AI Orchestra</span>
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
              Try it for free
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
            <div className="inline-flex items-center space-x-2 mb-8 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full backdrop-blur-sm animate-fade-in">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-zinc-400 text-sm">Power Meets Flexibility</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif mb-8 leading-tight tracking-tight">
              <span className="block mb-2 animate-fade-in-up">AI Orchestra</span>
              <span className="block bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
                Premium performance without premium prices
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              Built for students, developers, and creators who deserve enterprise-grade AI. 
              <span className="text-orange-400 font-semibold"> Pay only for the days you need brilliance.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-600">
              <button
                onClick={handleEnterApp}
                className="group relative px-8 py-4 bg-white text-zinc-950 text-lg font-medium rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Start free — No credit card</span>
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
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No commitment</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Floating Chat Preview */}
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
                    <span className="text-sm text-zinc-400">AI Orchestra</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-zinc-500">
                    <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded">Spark</span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded">Nova</span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded">Titan</span>
                  </div>
                </div>
                
                <div className="p-8 space-y-6 bg-gradient-to-b from-zinc-900 to-zinc-950">
                  <div className="flex items-start space-x-4 animate-slide-in-left">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      You
                    </div>
                    <div className="flex-1 bg-zinc-800/50 rounded-2xl rounded-tl-none p-5 border border-zinc-700/50">
                      <p className="text-zinc-300">Help me write an essay on climate change</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 animate-slide-in-right animation-delay-300">
                    <img 
                      src="/generated-image (1).png"
                      alt="AI Orchestra" 
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-2xl rounded-tl-none p-5 border border-zinc-700/50">
                      <p className="text-zinc-200 mb-3">I'll help you craft a comprehensive essay. Here's an outline and key points...</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <span className="px-2 py-1 bg-green-900/20 text-green-400 rounded">Spark Plan</span>
                        <span>•</span>
                        <span className="text-orange-400 font-semibold">Cost: ₹10 today</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why AI Orchestra Section */}
      <section id="why" className="relative py-32 px-6 lg:px-8 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-serif mb-6">
              Why flexible plans beat monthly subscriptions
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Traditional AI subscriptions force you to pay monthly. AI Orchestra lets you pay only for the days you actually need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-20">
            {/* Traditional Way */}
            <div className="relative p-8 bg-red-950/10 border border-red-900/30 rounded-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <X className="w-6 h-6 text-red-400" />
                <h3 className="text-2xl font-semibold text-red-300">Monthly Subscriptions</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-zinc-400">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>₹1500-5000/month whether you use it or not</span>
                </li>
                <li className="flex items-start space-x-3 text-zinc-400">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Pay for entire months when you only need a few days</span>
                </li>
                <li className="flex items-start space-x-3 text-zinc-400">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Locked into one pricing tier</span>
                </li>
                <li className="flex items-start space-x-3 text-zinc-400">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Can't scale down during slow periods</span>
                </li>
                <li className="flex items-start space-x-3 text-zinc-400">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Commitment pressure even when not needed</span>
                </li>
              </ul>
              <div className="mt-8 p-4 bg-red-950/20 rounded-lg border border-red-900/30">
                <p className="text-lg font-semibold text-red-300">Average waste: ₹400-1200/month</p>
                <p className="text-sm text-zinc-500 mt-1">Paying for unused days</p>
              </div>
            </div>

            {/* AI Orchestra Way */}
            <div className="relative p-8 bg-gradient-to-br from-green-950/10 to-orange-950/10 border border-green-900/30 rounded-2xl">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-green-500 rounded-2xl blur opacity-20" />
              <div className="relative">
                <div className="flex items-center space-x-3 mb-6">
                  <Check className="w-6 h-6 text-green-400" />
                  <h3 className="text-2xl font-semibold text-green-300">AI Orchestra Plans</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3 text-zinc-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Pay per day</strong> - ₹10-25/day when you need it</span>
                  </li>
                  <li className="flex items-start space-x-3 text-zinc-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Scale instantly</strong> - Upgrade for intense days, downgrade after</span>
                  </li>
                  <li className="flex items-start space-x-3 text-zinc-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Monthly option</strong> - Save more with ₹299-749/month plans</span>
                  </li>
                  <li className="flex items-start space-x-3 text-zinc-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong>No commitment</strong> - Activate only when inspiration strikes</span>
                  </li>
                  <li className="flex items-start space-x-3 text-zinc-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong>All features</strong> - File uploads, image understanding included</span>
                  </li>
                </ul>
                <div className="mt-8 p-4 bg-gradient-to-r from-green-950/20 to-orange-950/20 rounded-lg border border-green-900/30">
                  <p className="text-lg font-semibold text-green-300">Typical spend: ₹100-400/month</p>
                  <p className="text-sm text-zinc-400 mt-1">Based on 10-15 active days • Zero waste</p>
                </div>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-orange-900/50 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <TrendingDown className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Save 70-90%</h3>
              <p className="text-zinc-400">Most students save thousands per year vs. traditional monthly plans</p>
            </div>

            <div className="text-center p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-orange-900/50 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Right Plan for Every Task</h3>
              <p className="text-zinc-400">Use Spark for essays, Nova for projects, Titan for complex analysis</p>
            </div>

            <div className="text-center p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-orange-900/50 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Crystal Clear Pricing</h3>
              <p className="text-zinc-400">Know exactly what you're paying. Daily or monthly. Your choice.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-serif mb-6">
              Flexible Plans That Scale With You
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Pay per day or subscribe monthly. No wasted money, no long commitments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Spark Plan */}
            <div className="relative p-8 bg-gradient-to-br from-green-950/20 to-green-900/10 rounded-2xl border border-green-500/30">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                🌱 Student Favorite
              </div>
              <h3 className="text-2xl font-semibold mb-2 mt-2">Spark Plan</h3>
              <p className="text-zinc-400 mb-6">Smart choice for everyday brilliance</p>
              <div className="mb-6">
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-4xl font-bold text-green-400">₹10</span>
                  <span className="text-zinc-500">/day</span>
                </div>
                <div className="text-sm text-zinc-500">or ₹299/month</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Analyze notes & generate essays</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Solve advanced reasoning problems</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Hard-level coding challenges</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Fast & reliable for assignments</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Up to 20 file uploads/day</span>
                </li>
              </ul>
              <button 
                onClick={handleEnterApp}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors duration-300 font-semibold"
              >
                Start with Spark
              </button>
              <p className="text-center text-xs text-zinc-500 mt-4">Perfect for learners & writers</p>
            </div>

            {/* Nova Plan */}
            <div className="relative p-8 bg-gradient-to-br from-blue-950/20 to-blue-900/10 rounded-2xl border-2 border-blue-500">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                ⚙ Most Popular
              </div>
              <h3 className="text-2xl font-semibold mb-2 mt-2">Nova Plan</h3>
              <p className="text-zinc-400 mb-6">Built for creators and coders</p>
              <div className="mb-6">
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-4xl font-bold text-blue-400">₹15</span>
                  <span className="text-zinc-500">/day</span>
                </div>
                <div className="text-sm text-zinc-500">or ₹449/month</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Large document handling</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Long-form reasoning</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Multi-step code execution</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Contextual memory</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Up to 20 file uploads/day</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Image understanding</span>
                </li>
              </ul>
              <button 
                onClick={handleEnterApp}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-300 font-semibold"
              >
                Choose Nova
              </button>
              <p className="text-center text-xs text-zinc-500 mt-4">Ideal for developers & analysts</p>
            </div>

            {/* Titan Plan */}
            <div className="relative p-8 bg-gradient-to-br from-purple-950/20 to-purple-900/10 rounded-2xl border border-purple-500/30">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">
                🚀 Maximum Power
              </div>
              <h3 className="text-2xl font-semibold mb-2 mt-2">Titan Plan</h3>
              <p className="text-zinc-400 mb-6">Power beyond limits</p>
              <div className="mb-6">
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-4xl font-bold text-purple-400">₹25</span>
                  <span className="text-zinc-500">/day</span>
                </div>
                <div className="text-sm text-zinc-500">or ₹749/month</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Massive context handling</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Complex debugging & analysis</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Real-time problem solving</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Ultra-fast processing</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Up to 20 file uploads/day</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300">Deep reasoning & adaptation</span>
                </li>
              </ul>
              <button 
                onClick={handleEnterApp}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors duration-300 font-semibold"
              >
                Unlock Titan
              </button>
              <p className="text-center text-xs text-zinc-500 mt-4">For power users & researchers</p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-zinc-900/30 rounded-2xl border border-zinc-800">
            <h3 className="text-lg font-semibold mb-4 text-center">📂 All Plans Include</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-zinc-400">
                <Check className="w-4 h-4 text-orange-400" />
                <span><strong className="text-white">File Uploads:</strong> Up to 20/day</span>
              </div>
              <div className="flex items-center space-x-2 text-zinc-400">
                <Check className="w-4 h-4 text-orange-400" />
                <span><strong className="text-white">Image Understanding:</strong> Built-in</span>
              </div>
              <div className="flex items-center space-x-2 text-zinc-400">
                <Check className="w-4 h-4 text-orange-400" />
                <span><strong className="text-white">Pay-as-you-go:</strong> Ultimate freedom</span>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-orange-950/20 to-orange-900/10 rounded-2xl border border-orange-500/30 text-center">
            <p className="text-zinc-300">
              <strong className="text-white">💡 Why Students Love AI Orchestra:</strong> Students don't need 30-day subscriptions for a few intense hours of work. 
              Get <strong className="text-orange-400">enterprise-grade intelligence</strong> exactly when inspiration strikes — 
              starting at less than the price of a coffee. ☕
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6 lg:px-8 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-serif mb-6">
              Everything you need
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Professional tools for working with AI models
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Layers,
                title: "Flexible Plans",
                description: "Choose from Spark, Nova, or Titan plans. Scale up for intense work, scale down when you're done. Perfect for students and creators."
              },
              {
                icon: Brain,
                title: "Smart Context Retention",
                description: "Your conversations remember everything. Reference past discussions and build on previous work seamlessly."
              },
              {
                icon: Code2,
                title: "Developer Tools",
                description: "Built-in code highlighting, execution environments, and specialized models trained on technical documentation."
              },
              {
                icon: Lock,
                title: "Local Storage",
                description: "All data stored in your browser. Complete privacy and control over your conversations and files."
              },
              {
                icon: Zap,
                title: "Real-time Tracking",
                description: "Monitor usage and costs transparently. Know exactly what you're using each day."
              },
              {
                icon: Users,
                title: "File & Image Support",
                description: "Upload documents, analyze images, and get insights directly from your files. Up to 20 uploads per day."
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

      {/* Use Cases Section */}
      <section className="relative py-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-serif mb-20 text-center">
            Built for versatility
          </h2>
          
          <div className="space-y-16">
            {[
              {
                title: "For Students",
                description: "Write essays, solve problems, and learn concepts faster. Spark Plan handles assignments perfectly, while Nova helps with research projects.",
                gradient: "from-green-500/10 to-teal-500/10"
              },
              {
                title: "For Developers",
                description: "Debug complex issues, architect solutions, and generate production-ready code. Nova and Titan plans offer the power you need for serious coding.",
                gradient: "from-blue-500/10 to-purple-500/10"
              },
              {
                title: "For Creative Professionals",
                description: "Brainstorm ideas, refine copy, and develop content strategies. All plans understand nuance, tone, and creative direction.",
                gradient: "from-pink-500/10 to-purple-500/10"
              },
              {
                title: "For Researchers",
                description: "Analyze data, synthesize information, and maintain detailed conversation histories. Titan Plan provides the depth needed for academic work.",
                gradient: "from-orange-500/10 to-red-500/10"
              }
            ].map((useCase, i) => (
              <div
                key={i}
                className={`relative p-8 rounded-2xl border border-zinc-800 bg-gradient-to-br ${useCase.gradient} backdrop-blur-sm hover:border-zinc-700 transition-all duration-500`}
                style={{
                  animation: `fadeInUp 0.6s ease-out ${i * 0.2}s both`
                }}
              >
                <h3 className="text-2xl font-semibold mb-4">{useCase.title}</h3>
                <p className="text-lg text-zinc-400 leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 lg:px-8 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "3", label: "Flexible Plans", suffix: "" },
              { number: "20", label: "Files/Day", suffix: "" },
              { number: "₹10", label: "Starting From", suffix: "" },
              { number: "0", label: "Commitment", suffix: "" }
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

      {/* CTA Section */}
      <section className="relative py-32 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-16 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5" />
            
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-serif mb-6">
                Ready to work smarter?
              </h2>
              <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
                Join thousands who've discovered intelligent AI access. Pay only for the days you need brilliance.
              </p>
              
              <button
                onClick={handleEnterApp}
                className="group relative px-10 py-5 bg-white text-zinc-950 text-xl font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Get started now</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </button>
              
              <p className="text-sm text-zinc-500 mt-6">No credit card required • Start in seconds</p>
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
                alt="AI Orchestra Logo" 
                className="w-6 h-6 object-contain"
              />
              <span className="text-lg font-serif">AI Orchestra</span>
            </div>
            <div className="text-zinc-500 text-sm">
              © 2024 AI Orchestra. Power meets flexibility.
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
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
      `}</style>
    </div>
  );
}
