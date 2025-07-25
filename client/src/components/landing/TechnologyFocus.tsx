import { Zap, Brain, Settings, BarChart3, Shield, Cloud } from "lucide-react";

export default function TechnologyFocus() {
  const domains = [
    {
      title: "AIOps",
      subtitle: "AI-Powered Operations",
      description: "Evaluate expertise in intelligent monitoring, anomaly detection, automated incident response, and machine learning-driven operations.",
      skills: [
        "Anomaly Detection Algorithms",
        "Predictive Analytics", 
        "Automated Root Cause Analysis",
        "Machine Learning Operations",
        "Intelligent Alerting Systems",
        "Performance Optimization"
      ],
      gradient: "from-orange-500 to-red-600",
      icon: Brain
    },
    {
      title: "MLOps",
      subtitle: "Machine Learning Operations",
      description: "Assess skills in ML pipeline management, model deployment, monitoring, and scaling machine learning systems in production.",
      skills: [
        "CI/CD for ML Models",
        "Model Versioning & Registry",
        "Feature Store Management", 
        "Model Monitoring & Drift",
        "A/B Testing for ML",
        "Kubernetes for ML"
      ],
      gradient: "from-blue-500 to-cyan-600",
      icon: BarChart3
    },
    {
      title: "DevOps",
      subtitle: "Development Operations",
      description: "Test comprehensive DevOps knowledge including infrastructure automation, containerization, and continuous delivery practices.",
      skills: [
        "Infrastructure as Code",
        "Container Orchestration",
        "CI/CD Pipeline Design",
        "Monitoring & Observability",
        "Security & Compliance",
        "Cloud Architecture"
      ],
      gradient: "from-purple-500 to-violet-600",
      icon: Settings
    }
  ];

  return (
    <section id="domains" className="py-24 relative">
      <div className="container-max relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-morphism border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-orange-600/10 mb-6">
            <Zap className="h-4 w-4 text-orange-300" />
            <span className="text-orange-300 font-medium">Technology Domains</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Specialized Assessment
            <div className="gradient-text">Domains</div>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Deep technical evaluations tailored for modern engineering roles. Each domain features role-specific challenges that mirror real-world scenarios.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {domains.map((domain, index) => (
            <div 
              key={index} 
              className="glass-morphism bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 rounded-xl p-8 hover:border-orange-500/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10 group"
            >
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${domain.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <domain.icon className="text-white h-8 w-8" />
              </div>

              {/* Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-300 transition-colors duration-300">
                  {domain.title}
                </h3>
                <p className="text-orange-400 font-medium mb-4">{domain.subtitle}</p>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {domain.description}
                </p>
              </div>

              {/* Skills List */}
              <div className="space-y-3">
                <h4 className="text-white font-semibold mb-4">Key Assessment Areas:</h4>
                {domain.skills.map((skill, skillIndex) => (
                  <div key={skillIndex} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${domain.gradient}`}></div>
                    <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                      {skill}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="mt-8">
                <button className={`w-full px-6 py-3 bg-gradient-to-r ${domain.gradient} text-white font-semibold rounded-lg hover:scale-105 transition-all duration-300 opacity-80 hover:opacity-100`}>
                  View Sample Assessment
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="glass-morphism bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-slate-700/50 rounded-xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Shield className="h-8 w-8 text-orange-400" />
              <Cloud className="h-8 w-8 text-blue-400" />
              <Settings className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Enterprise-Ready Assessment Platform
            </h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Trusted by leading tech companies to evaluate thousands of candidates across all major DevOps and ML engineering roles.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span>SOC 2 Compliant</span>
              <span>•</span>
              <span>GDPR Ready</span>
              <span>•</span>
              <span>99.9% Uptime SLA</span>
              <span>•</span>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}