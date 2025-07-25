import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import MLOpsLearningPath from "@/components/MLOpsLearningPath";
import ResizableSidebar from "@/components/ResizableSidebar";


interface DashboardData {
  user: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    currentRole?: string;
    interest?: string;
  };
  assessmentResults?: {
    totalScore: number;
    mcqScore: number;
    codingScore: number;
    completedAt: string;
    status: string;
  };
  courseProgress?: {
    domain: string;
    currentChapter: string;
    progress: Record<string, boolean>;
  };
}

export default function DashboardPage() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();


  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
    enabled: isAuthenticated,
  });

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    setLocation('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p className="text-brand-gray">Loading your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-brand-gray mb-4">Unable to load dashboard data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex">
      <ResizableSidebar activeSection="dashboard" />
      
      {/* Main Content */}
      <div 
        className="flex-1 transition-all duration-300" 
        style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
      >
        {/* Main content area */}
        <div className="p-4 lg:p-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-heading mb-2">
              Welcome back, {dashboardData.user.fullName || dashboardData.user.username}!
            </h1>
            <p className="text-brand-gray text-base lg:text-lg">
              Continue your {dashboardData.user.interest || 'MLOps'} learning journey
            </p>
          </div>

          {/* MLOps Learning Path - Main Focus */}
          <MLOpsLearningPath userInterest={dashboardData.user.interest || 'MLOps'} />
        </div>
      </div>
    </div>
  );
}