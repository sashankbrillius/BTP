import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import TechnologyFocus from "@/components/landing/TechnologyFocus";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import "@/theme.css";

export default function Home() {
  const { isAuthenticated, isFullyOnboarded, needsProfileCompletion, needsAssessmentCompletion } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect authenticated users based on their completion status
    if (isAuthenticated) {
      if (needsProfileCompletion) {
        setLocation('/basic-details');
      } else if (needsAssessmentCompletion) {
        setLocation('/assessment');
      } else if (isFullyOnboarded) {
        setLocation('/dashboard');
      }
    }
  }, [isAuthenticated, needsProfileCompletion, needsAssessmentCompletion, isFullyOnboarded, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 font-open-sans text-white relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 0h50v50H0V0z' stroke='white' stroke-width='1' fill='none'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Central Orb */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-500 to-purple-600 rounded-full blur-3xl opacity-20 animate-float" />
        
        {/* Corner Orbs */}
        <div className="absolute top-20 left-20 w-24 h-24 bg-gradient-to-r from-orange-500 to-red-600 rounded-full blur-2xl opacity-30 animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-30 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        {/* Floating Accent Orbs */}
        <div className="absolute top-32 right-32 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-xl opacity-40 animate-float-slow" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-32 left-32 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full blur-xl opacity-40 animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full blur-lg opacity-50 animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full blur-2xl opacity-30 animate-pulse-slow" style={{ animationDelay: '2.5s' }} />
        
        {/* Floating Particles */}
        <div className="absolute top-16 left-16 w-2 h-2 bg-orange-400 rounded-full opacity-60 animate-float" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-orange-400 rounded-full opacity-60 animate-float" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-orange-400 rounded-full opacity-60 animate-float" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        <div className="absolute bottom-16 right-16 w-1 h-1 bg-orange-400 rounded-full opacity-60 animate-float" style={{ animationDelay: '3s', animationDuration: '6s' }} />
        <div className="absolute top-2/3 left-2/3 w-2 h-2 bg-orange-400 rounded-full opacity-60 animate-float" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }} />
        <div className="absolute bottom-2/3 right-2/3 w-1 h-1 bg-orange-400 rounded-full opacity-60 animate-float" style={{ animationDelay: '2.5s', animationDuration: '3.5s' }} />
      </div>
      
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <TechnologyFocus />
      <CTA />
      <Footer />
    </div>
  );
}
