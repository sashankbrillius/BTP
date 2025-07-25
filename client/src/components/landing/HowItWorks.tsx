import { ClipboardCheck, Route, Code, TrendingUp } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Take Assessment",
      description: "Complete our AI-powered evaluation with real-world coding challenges and technical scenarios",
      icon: ClipboardCheck,
      gradient: "from-orange-500 to-red-600"
    },
    {
      step: "02", 
      title: "Get Insights",
      description: "Receive detailed performance analytics, skill ratings, and personalized hiring recommendations",
      icon: Route,
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      step: "03",
      title: "Review Results",
      description: "Access comprehensive candidate reports with code quality metrics and competency breakdown",
      icon: Code,
      gradient: "from-purple-500 to-violet-600"
    },
    {
      step: "04",
      title: "Make Decisions",
      description: "Use data-driven insights to identify top talent and make confident hiring decisions",
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-600"
    }
  ];

  return (
    <section id="about" className="py-24 relative">
      <div className="container-max relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-morphism border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-orange-600/10 mb-6">
            <span className="text-orange-300 font-medium">How It Works</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Streamlined 
            <div className="gradient-text">Assessment Process</div>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            From initial assessment to final hiring decision - our platform guides you through every step with AI-powered insights and data-driven recommendations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative group">
              {/* Step Number Background */}
              <div className="text-8xl font-bold text-slate-800/30 mb-4 select-none">
                {step.step}
              </div>
              
              {/* Icon with Gradient */}
              <div className={`w-20 h-20 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 -mt-12 relative z-10 group-hover:scale-110 transition-transform duration-300 shadow-2xl`}>
                <step.icon className="text-white h-10 w-10" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-orange-300 transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                {step.description}
              </p>
              
              {/* Connecting Arrow */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-8 h-0.5 bg-gradient-to-r from-orange-400 to-transparent -translate-x-4 z-0">
                  <div className="absolute right-0 top-1/2 w-0 h-0 border-l-4 border-l-orange-400 border-t-2 border-b-2 border-t-transparent border-b-transparent -translate-y-1/2"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}