import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle, Users, Target, Zap } from "lucide-react";
import { Link } from "wouter";

export default function CTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full blur-3xl opacity-20"></div>
      
      <div className="container-max relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-morphism border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-orange-600/10 mb-8">
            <Sparkles className="h-4 w-4 text-orange-300" />
            <span className="text-orange-300 font-medium">Start Your AI-Powered Assessment</span>
          </div>

          {/* Main Headline */}
          <h2 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            Ready to transform
            <div className="gradient-text">your hiring process?</div>
          </h2>
          
          <p className="text-xl lg:text-2xl text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto">
            Join leading companies using AI-powered assessments to identify top DevOps talent. Get started in minutes, see results immediately.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/signup">
              <Button className="group relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:via-red-600 hover:to-red-700 text-white font-bold text-xl py-6 px-12 rounded-lg shadow-2xl hover:scale-105 transition-all duration-300 border-0">
                {/* Shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative flex items-center gap-3">
                  Start Free Trial
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            
            <Button className="glass-morphism border border-violet-500/50 bg-violet-600/20 hover:bg-violet-700/30 text-white font-semibold text-xl py-6 px-12 rounded-lg backdrop-blur-xl transition-all duration-300 hover:scale-105">
              Schedule Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">50,000+</div>
              <div className="text-gray-400">Assessments Completed</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">94%</div>
              <div className="text-gray-400">Hiring Accuracy</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">75%</div>
              <div className="text-gray-400">Time Saved</div>
            </div>
          </div>

          {/* Features List */}
          <div className="flex flex-wrap justify-center gap-8 text-gray-300">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>No Setup Required</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Free Trial Available</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>24/7 Support</span>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="glass-morphism bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-slate-700/50 rounded-xl p-8">
              <blockquote className="text-xl text-gray-300 italic mb-6">
                "Brillius transformed our hiring process. We went from 6-week assessment cycles to finding the right candidates in just 2 days. The AI insights are incredibly accurate."
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SC</span>
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold">Sarah Chen</div>
                  <div className="text-gray-400 text-sm">Head of Engineering, TechCorp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}