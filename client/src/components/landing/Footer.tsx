import { Brain } from "lucide-react";

export default function Footer() {
  const platformLinks = ["Assessments", "Courses", "AI Assistant", "Code Playground"];
  const learningPaths = ["AIOps", "MLOps", "DevOps", "Cloud Operations"];
  const supportLinks = ["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"];

  return (
    <footer className="bg-slate-950 text-gray-300 py-16 border-t border-slate-800/50 relative">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-r from-orange-500 to-red-600 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full blur-3xl opacity-10"></div>
      </div>
      
      <div className="container-max relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/brillius-logo.png" 
                alt="Brillius Technologies Logo" 
                className="h-10 w-auto"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0ZGNkIzNSIvPgo8dGV4dCB4PSIyMCIgeT0iMjciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIj5CPC90ZXh0Pgo8L3N2Zz4K';
                }}
              />
              <span className="font-bold text-xl text-white">Brillius</span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              AI-powered assessment platform transforming how teams evaluate and hire DevOps talent.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-slate-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                <span className="text-sm font-bold">X</span>
              </div>
              <div className="w-10 h-10 bg-slate-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                <span className="text-sm font-bold">Li</span>
              </div>
              <div className="w-10 h-10 bg-slate-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                <span className="text-sm font-bold">Gh</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Platform</h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm relative group">
                    {link}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300 group-hover:w-full"></div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Assessments</h4>
            <ul className="space-y-3">
              {learningPaths.map((path) => (
                <li key={path}>
                  <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm relative group">
                    {path}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300 group-hover:w-full"></div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm relative group">
                    {link}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300 group-hover:w-full"></div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Newsletter Signup */}
        <div className="border-t border-slate-800/50 pt-12 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-6">Get the latest updates on AI-powered assessment techniques and hiring insights.</p>
            <div className="flex gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">
            © 2025 Brillius Technologies. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm relative group">
              Privacy Policy
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300 group-hover:w-full"></div>
            </a>
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm relative group">
              Terms of Service
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300 group-hover:w-full"></div>
            </a>
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm relative group">
              Cookie Policy
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300 group-hover:w-full"></div>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
