"use client";

import { useRouter } from "next/navigation";
import {
  Video,
  ArrowRight,
  Users,
  Shield,
  Zap,
  MessageSquare,
  Globe,
  Sparkles,
  ChevronRight,
  Play,
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-200/50 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-200/50 rounded-full blur-[128px]" />
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-fuchsia-200/40 rounded-full blur-[128px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
              <Video size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Vido</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-500 hover:text-slate-900 transition-colors">How it works</a>
            <a href="#security" className="text-slate-500 hover:text-slate-900 transition-colors">Security</a>
          </div>
          <button
            onClick={() => router.push('/meeting')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-5 rounded-full text-sm transition-all duration-300"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-fuchsia-100 border border-violet-200 rounded-full px-4 py-2 mb-8">
              <Sparkles size={16} className="text-violet-600" />
              <span className="text-sm text-violet-700 font-medium">Built with WebRTC Technology</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[0.9] tracking-tight">
              <span className="text-slate-900">
                Video Calls
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Crystal clear video meetings with zero hassle. Connect instantly with
              anyone, anywhere. No downloads required.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push('/meeting')}
                className="group relative bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 flex items-center gap-3 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-105"
              >
                <Play size={20} fill="currentColor" />
                Start Meeting
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/meeting')}
                className="group bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 flex items-center gap-3"
              >
                Join a Meeting
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Stats */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">100ms</div>
                <div className="text-sm text-slate-400 mt-1">Ultra-low latency</div>
              </div>
              <div className="h-12 w-px bg-slate-200 hidden md:block" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">1080p</div>
                <div className="text-sm text-slate-400 mt-1">HD video quality</div>
              </div>
              <div className="h-12 w-px bg-slate-200 hidden md:block" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent">P2P</div>
                <div className="text-sm text-slate-400 mt-1">Direct connection</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-6 py-24 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">
              Everything you need for
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent"> seamless meetings</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Powerful features designed to make your video calls smooth and professional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group relative bg-white border border-slate-200 rounded-3xl p-8 hover:border-violet-300 transition-all duration-500 hover:shadow-xl hover:shadow-violet-100">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-violet-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Video size={28} className="text-violet-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">HD Video Calls</h3>
                <p className="text-slate-500 leading-relaxed">
                  Crystal clear 1080p video with adaptive bitrate for the best quality on any connection.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white border border-slate-200 rounded-3xl p-8 hover:border-fuchsia-300 transition-all duration-500 hover:shadow-xl hover:shadow-fuchsia-100">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-100 to-fuchsia-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users size={28} className="text-fuchsia-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">Multi-Party Calls</h3>
                <p className="text-slate-500 leading-relaxed">
                  Connect with multiple participants in real-time with our mesh architecture.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white border border-slate-200 rounded-3xl p-8 hover:border-cyan-300 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-100">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare size={28} className="text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">In-Meeting Chat</h3>
                <p className="text-slate-500 leading-relaxed">
                  Share messages, links and ideas instantly without interrupting the conversation.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-white border border-slate-200 rounded-3xl p-8 hover:border-green-300 transition-all duration-500 hover:shadow-xl hover:shadow-green-100">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield size={28} className="text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">Secure by Design</h3>
                <p className="text-slate-500 leading-relaxed">
                  HTTPS/WSS encrypted connections ensure your conversations stay private.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative bg-white border border-slate-200 rounded-3xl p-8 hover:border-orange-300 transition-all duration-500 hover:shadow-xl hover:shadow-orange-100">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap size={28} className="text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">Instant Connect</h3>
                <p className="text-slate-500 leading-relaxed">
                  No downloads, no plugins. Just click and connect—works in any modern browser.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative bg-white border border-slate-200 rounded-3xl p-8 hover:border-pink-300 transition-all duration-500 hover:shadow-xl hover:shadow-pink-100">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-pink-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe size={28} className="text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">Works Anywhere</h3>
                <p className="text-slate-500 leading-relaxed">
                  NAT traversal with STUN/TURN ensures you can connect from any network.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">
              Start in <span className="bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent">3 simple steps</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Getting started is as easy as 1, 2, 3
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative inline-flex">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-violet-200">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-900">Create Account</h3>
              <p className="text-slate-500">Sign up with your email in seconds. No credit card required.</p>
            </div>

            <div className="text-center">
              <div className="relative inline-flex">
                <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-500 to-cyan-500 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-fuchsia-200">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-900">Start or Join</h3>
              <p className="text-slate-500">Create a new meeting or join with a code. It&apos;s that simple.</p>
            </div>

            <div className="text-center">
              <div className="relative inline-flex">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-cyan-200">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-900">Connect</h3>
              <p className="text-slate-500">Enjoy HD video calls with your team, friends, or family.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500 rounded-[2.5rem] p-12 md:p-16 text-center">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />

            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                Ready to start your
                <br />
                first meeting?
              </h2>
              <p className="text-white/80 mb-10 text-lg max-w-xl mx-auto">
                Join thousands of people who trust Vido for their video calls. Free forever for personal use.
              </p>
              <button
                onClick={() => router.push('/meeting')}
                className="group bg-white hover:bg-slate-50 text-slate-900 font-semibold py-4 px-10 rounded-2xl text-lg transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Get Started Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
              <Video size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900">Vido</span>
          </div>
          <div className="text-slate-400 text-sm">
            Built with WebRTC, Next.js & ❤️
          </div>
          <div className="text-slate-400 text-sm">
            © 2026 Vido. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
