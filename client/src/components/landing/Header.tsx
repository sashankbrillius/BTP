import { Link } from "wouter";
import { Menu, X, ChevronDown, User, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if user is authenticated
  const { data: userData } = useQuery({
    queryKey: ['/api/user'],
    retry: false
  }) as { data: { user?: { id: string; username: string; fullName?: string; email?: string; profileImageUrl?: string } } | undefined };

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      // Use fetch to call logout API then redirect
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Redirect to homepage after successful logout
        window.location.href = '/';
      } else {
        console.error('Logout failed');
        // Fallback: redirect anyway for better UX
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback: redirect to homepage even if there's an error
      window.location.href = '/';
    }
  };

  // Get user's first name for display
  const getDisplayName = () => {
    if (userData?.user?.fullName) {
      return userData.user.fullName.split(' ')[0];
    }
    return userData?.user?.username || 'User';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (userData?.user?.fullName) {
      return userData.user.fullName
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return userData?.user?.username?.[0]?.toUpperCase() || 'U';
  };

  return (
    <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${
      isScrolled ? 'bg-slate-900/95 backdrop-blur-md border-slate-800/50 shadow-2xl' : 'bg-transparent border-transparent'
    }`}>
      <div className="container-max">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-80 transition-all duration-200">
              <img
                src="/brillius-logo.png"
                alt="Brillius Technologies Logo"
                className="h-12 w-auto"
                onError={(e) => {
                  console.error('Logo failed to load:', e);
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0ZGNkIzNSIvPgo8dGV4dCB4PSIyMCIgeT0iMjciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIj5CPC90ZXh0Pgo8L3N2Zz4K';
                }}
              />
            </Link>
          </div>

          {/* Center Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            <a 
              href="#features" 
              className="px-4 py-2 text-white hover:text-orange-400 hover:bg-slate-800/50 rounded-lg transition-all duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 relative group"
            >
              Features
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300 group-hover:w-full"></div>
            </a>
            <a 
              href="#about" 
              className="px-4 py-2 text-white hover:text-orange-400 hover:bg-slate-800/50 rounded-lg transition-all duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 relative group"
            >
              How It Works
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300 group-hover:w-full"></div>
            </a>
            <a 
              href="#resources" 
              className="px-4 py-2 text-white hover:text-orange-400 hover:bg-slate-800/50 rounded-lg transition-all duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 relative group"
            >
              Resources
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300 group-hover:w-full"></div>
            </a>
            {userData && (
              <Link href="/dashboard">
                <div className="px-4 py-2 text-white hover:text-orange-400 hover:bg-slate-800/50 rounded-lg transition-all duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 cursor-pointer relative group">
                  Dashboard
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300 group-hover:w-full"></div>
                </div>
              </Link>
            )}
          </nav>

          {/* Right Section - Auth/Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {userData ? (
              /* User Profile Dropdown */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-2 px-3 py-2 h-auto hover:bg-orange-50 focus:ring-2 focus:ring-brand-orange focus:ring-opacity-20 transition-all duration-200"
                  >
                    <Avatar className="h-8 w-8 border-2 border-orange-100">
                      <AvatarImage src={userData.user?.profileImageUrl} alt="Profile" />
                      <AvatarFallback className="bg-brand-orange text-white text-sm font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center space-x-1">
                      <span className="text-brand-dark font-medium text-sm">
                        {getDisplayName()}
                      </span>
                      <ChevronDown className="h-4 w-4 text-brand-gray" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 animate-in slide-in-from-top-2 duration-200"
                >
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-brand-dark">
                      {userData.user?.fullName || userData.user?.username}
                    </p>
                    <p className="text-xs text-brand-gray">
                      {userData.user?.email}
                    </p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center space-x-2 w-full">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Auth Buttons for Non-Logged In Users */
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-brand-dark hover:text-brand-orange hover:bg-orange-50 font-poppins font-semibold transition-all duration-200 focus:ring-2 focus:ring-brand-orange focus:ring-opacity-20"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="btn-primary shadow-md hover:shadow-lg transition-all duration-200">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {userData && (
              <Avatar className="h-8 w-8 border-2 border-orange-100">
                <AvatarImage src={userData.user?.profileImageUrl} alt="Profile" />
                <AvatarFallback className="bg-brand-orange text-white text-xs font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            )}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden hover:bg-orange-50 focus:ring-2 focus:ring-brand-orange focus:ring-opacity-20"
                >
                  <Menu className="h-6 w-6 text-brand-dark" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <img
                      src="/brillius-logo.png"
                      alt="Brillius Technologies"
                      className="h-10 w-auto"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="hover:bg-gray-100"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex-1 overflow-y-auto">
                    <nav className="flex flex-col p-6 space-y-2">
                      <a
                        href="#features"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-brand-dark hover:text-brand-orange hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium"
                      >
                        Features
                      </a>
                      <a
                        href="#about"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-brand-dark hover:text-brand-orange hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium"
                      >
                        How It Works
                      </a>
                      <a
                        href="#resources"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-brand-dark hover:text-brand-orange hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium"
                      >
                        Resources
                      </a>
                      {userData && (
                        <Link href="/dashboard">
                          <div 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center px-4 py-3 text-brand-dark hover:text-brand-orange hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium cursor-pointer"
                          >
                            <LayoutDashboard className="h-5 w-5 mr-3" />
                            Dashboard
                          </div>
                        </Link>
                      )}
                    </nav>
                  </div>

                  {/* Mobile User Section */}
                  <div className="border-t border-gray-100 p-6">
                    {userData ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Avatar className="h-10 w-10 border-2 border-orange-100">
                            <AvatarImage src={userData.user?.profileImageUrl} alt="Profile" />
                            <AvatarFallback className="bg-brand-orange text-white font-semibold">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-brand-dark text-sm">
                              {userData.user?.fullName || userData.user?.username}
                            </p>
                            <p className="text-xs text-brand-gray">
                              {userData.user?.email}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-brand-dark hover:text-brand-orange hover:bg-orange-50"
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            Settings
                          </Button>
                          <Button 
                            variant="ghost" 
                            onClick={handleLogout}
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Log Out
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link href="/login">
                          <Button
                            variant="ghost"
                            className="w-full text-brand-dark hover:text-brand-orange hover:bg-orange-50 font-poppins font-semibold"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Login
                          </Button>
                        </Link>
                        <Link href="/signup">
                          <Button 
                            className="btn-primary w-full"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Get Started
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
