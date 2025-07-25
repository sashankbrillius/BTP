import { Brain, Target, Code, Zap, Users, Clock, BarChart3, Shield } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: "AI-Driven Assessment",
      description: "Intelligent evaluation that adapts to candidate skill levels and provides deep insights into DevOps competency.",
      gradient: "from-orange-500 to-red-600",
      delay: "0ms"
    },
    {
      icon: Target,
      title: "Real-World Scenarios",
      description: "Hands-on coding challenges that mirror actual DevOps problems your team faces daily.",
      gradient: "from-blue-500 to-cyan-600",
      delay: "100ms"
    },
    {
      icon: Code,
      title: "Multi-Language Support",
      description: "Assess skills across Python, JavaScript, Go, and infrastructure-as-code languages.",
      gradient: "from-purple-500 to-violet-600",
      delay: "200ms"
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Real-time code execution with immediate results and detailed performance analytics.",
      gradient: "from-green-500 to-emerald-600",
      delay: "300ms"
    },
    {
      icon: Users,
      title: "Team Insights",
      description: "Comprehensive team performance dashboards and skill gap analysis for strategic hiring.",
      gradient: "from-pink-500 to-rose-600",
      delay: "400ms"
    },
    {
      icon: Clock,
      title: "Time-Efficient",
      description: "Complete assessments in 30-60 minutes with automated scoring and candidate ranking.",
      gradient: "from-indigo-500 to-blue-600",
      delay: "500ms"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep performance metrics, code quality analysis, and predictive hiring recommendations.",
      gradient: "from-yellow-500 to-orange-600",
      delay: "600ms"
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Enterprise-grade security with GDPR compliance and robust anti-cheating measures.",
      gradient: "from-teal-500 to-cyan-600",
      delay: "700ms"
    }
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="container-max relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-morphism border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-orange-600/10 mb-6">
            <span className="text-orange-300 font-medium">Core Features</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Why teams choose
            <div className="gradient-text">Brillius Assessments</div>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            From startups to enterprise companies, engineering teams trust our AI-powered platform to identify top DevOps talent efficiently and accurately.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative"
              style={{ animationDelay: feature.delay }}
            >
              <div className="glass-morphism bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center hover:border-orange-500/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10">
                {/* Gradient Background Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-500`}></div>
                
                {/* Icon */}
                <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white h-8 w-8" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-orange-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
