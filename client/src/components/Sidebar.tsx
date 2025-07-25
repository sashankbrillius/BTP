import { Link, useLocation } from 'wouter';
import { 
  Home, 
  BarChart3, 
  BookOpen, 
  MessageCircle, 
  Code, 
  Video,
  LogOut 
} from 'lucide-react';
import "../theme.css";

interface SidebarProps {
  activeSection?: string;
}

export default function Sidebar({ activeSection = 'dashboard' }: SidebarProps) {
  const [, setLocation] = useLocation();
  
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'learning-path', label: 'Learning Path', icon: BarChart3, path: '/learning-path' },
    { id: 'course', label: 'Course', icon: BookOpen, path: '/course' },
    { id: 'assistant', label: 'AI Assistant', icon: MessageCircle, path: '/assistant' },
    { id: 'playground', label: 'Code Playground', icon: Code, path: '/playground' },
    { id: 'video-resources', label: 'Video Resources', icon: Video, path: '/video-resources' }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-brand-dark text-white z-40">
      <div className="p-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-3 mb-8">
          <img 
            src="/brillius-logo.png" 
            alt="Brillius Technologies Logo" 
            className="h-8 w-auto"
            onError={(e) => {
              console.error('Sidebar logo failed to load:', e);
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0ZGNkIzNSIvPgo8dGV4dCB4PSIyMCIgeT0iMjciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIj5CPC90ZXh0Pgo8L3N2Zz4K';
            }}
          />
        </Link>
        
        {/* Navigation */}
        <nav className="space-y-2">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setLocation(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  isActive 
                    ? 'bg-brand-orange text-white' 
                    : 'text-gray-300 hover:bg-brand-gray hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-open-sans">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Bottom Buttons */}
      <div className="absolute bottom-6 left-6 right-6 space-y-3">
        <button 
          onClick={() => setLocation('/dashboard')}
          className="w-full px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors"
        >
          Back to Dashboard
        </button>
        
        <button 
          onClick={() => window.location.href = '/api/logout'}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-300 hover:text-white border border-red-600 rounded-lg transition-colors hover:bg-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}