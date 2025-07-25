import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Hero() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    featuresSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white py-20 lg:py-32 overflow-hidden">
      <div className="container-max relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Badge Element */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-morphism border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-orange-600/10">
              <Sparkles className="h-4 w-4 text-orange-300" />
              <span className="text-orange-300 font-medium">AI-Powered Assessment Platform</span>
              <Zap className="h-4 w-4 text-orange-300" />
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-8xl font-bold leading-tight">
                <div className="mb-4">Master DevOps with</div>
                <div className="gradient-text mb-4">AI-Powered Assessments</div>
                <div className="text-2xl lg:text-3xl text-gray-300 font-normal">With native AI at every step.</div>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed font-open-sans max-w-4xl mx-auto">
                Transform your hiring process with intelligent coding assessments that evaluate real-world skills in DevOps, AIOps, and MLOps
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
              <Link href="/signup">
                <Button className="group relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:via-red-600 hover:to-red-700 text-white font-semibold text-lg py-4 px-8 rounded-lg shadow-2xl hover:scale-105 transition-all duration-300 border-0">
                  {/* Shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative flex items-center gap-2">
                    Sign Up
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              
              <Button 
                onClick={scrollToFeatures}
                className="glass-morphism border border-violet-500/50 bg-violet-600/20 hover:bg-violet-700/30 text-white font-semibold text-lg py-4 px-8 rounded-lg backdrop-blur-xl transition-all duration-300 hover:scale-105"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Interactive Code Demo */}
            <div className="mt-12 max-w-2xl mx-auto">
              <div className="glass-morphism bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-lg border border-slate-700/50 hover:border-orange-500/30 transition-all duration-500 overflow-hidden">
                {/* Mac-style window controls */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">Live Assessment</span>
                  </div>
                </div>
                
                {/* Code content */}
                <div className="p-6 font-mono text-sm text-left">
                  <div className="space-y-2">
                    <div><span className="text-gray-500"># AI-powered assessment in action</span></div>
                    <div><span className="text-purple-400">def</span> <span className="text-yellow-400">assess_devops_skills</span>(<span className="text-orange-400">candidate</span>):</div>
                    <div className="ml-4"><span className="text-blue-400">ai_engine</span> = <span className="text-green-400">AIAssessment</span>()</div>
                    <div className="ml-4"><span className="text-blue-400">results</span> = <span className="text-orange-400">ai_engine</span>.<span className="text-green-400">evaluate</span>(<span className="text-orange-400">candidate</span>)</div>
                    <div className="ml-4"><span className="text-purple-400">return</span> <span className="text-orange-400">results</span>.<span className="text-green-400">generate_insights</span>()</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-12 pt-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-300">10K+</div>
                <div className="text-sm text-gray-400">Professionals Trained</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-300">97%</div>
                <div className="text-sm text-gray-400">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-300">24/7</div>
                <div className="text-sm text-gray-400">AI Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
