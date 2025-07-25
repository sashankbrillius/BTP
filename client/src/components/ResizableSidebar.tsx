import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  BarChart3, 
  BookOpen, 
  MessageCircle, 
  Code, 
  Video,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import "../theme.css";

interface ResizableSidebarProps {
  activeSection?: string;
}

export function ResizableSidebar({ activeSection = 'dashboard' }: ResizableSidebarProps) {
  const [, setLocation] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Update CSS custom property for layout adjustments
  const updateLayout = (collapsed: boolean) => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '4rem' : '16rem');
  };

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    updateLayout(newCollapsed);
  };

  // Initialize layout on mount
  useEffect(() => {
    updateLayout(isCollapsed);
  }, []);
  
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'learning-path', label: 'Learning Path', icon: BarChart3, path: '/learning-path' },
    { id: 'course', label: 'Course', icon: BookOpen, path: '/course' }, // Will auto-redirect to domain-specific route
    { id: 'assistant', label: 'AI Assistant', icon: MessageCircle, path: '/assistant' },
    { id: 'playground', label: 'Code Playground', icon: Code, path: '/playground' },
    { id: 'video-resources', label: 'Video Resources', icon: Video, path: '/video-resources' }
  ];

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <>
      {/* Mobile Hamburger Menu Button - only visible when sidebar is collapsed */}
      {isCollapsed && (
        <button
          className="fixed top-4 left-4 z-50 lg:hidden bg-brand-dark text-white p-2 rounded-md shadow-lg hover:bg-brand-gray transition-colors"
          onClick={() => setIsCollapsed(false)}
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Overlay for mobile when sidebar is open */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full bg-brand-dark text-white z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
        style={{ '--sidebar-width': isCollapsed ? '4rem' : '16rem' } as React.CSSProperties}
      >
        
        {/* Header with Logo and Close Button */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <Link href="/dashboard" className="flex items-center space-x-3 flex-1">
              <img 
                src="/brillius-logo.png" 
                alt="Brillius Technologies Logo" 
                className={isCollapsed ? "h-8 w-8" : "h-8 w-auto"}
                onError={(e) => {
                  console.error('Sidebar logo failed to load:', e);
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0ZGNkIzNSIvPgo8dGV4dCB4PSIyMCIgeT0iMjciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIj5CPC90ZXh0Pgo8L3N2Zz4K';
                }}
              />
              {!isCollapsed && <span className="text-white font-bold text-lg">Brillius</span>}
            </Link>
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="text-white hover:bg-gray-700 p-2 ml-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          
          {/* Navigation */}
          <nav className="space-y-2">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setLocation(item.path)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg transition-all duration-200 text-left ${
                    isActive 
                      ? 'bg-brand-orange text-white' 
                      : 'text-gray-300 hover:bg-brand-gray hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-open-sans">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Bottom Buttons */}
        <div className="absolute bottom-6 left-4 right-4 space-y-3">
          {!isCollapsed && (
            <button 
              onClick={() => setLocation('/dashboard')}
              className="w-full px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors text-center"
            >
              Back to Dashboard
            </button>
          )}
          <button 
            onClick={handleLogout}
            className={`w-full ${isCollapsed ? 'px-2' : 'px-4'} py-2 text-gray-300 hover:text-white border border-red-600 rounded-lg transition-colors flex items-center ${isCollapsed ? 'justify-center' : 'justify-start space-x-2'}`}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
}

// Also export as default for backward compatibility
export default ResizableSidebar;