import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import Home from "@/pages/home";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import BasicDetails from "@/pages/basic-details";
import Assessment from "@/pages/assessment-new";
import Results from "@/pages/results";
import Dashboard from "@/pages/dashboard";
import LearningPath from "@/pages/learning-path";
import Course from "@/pages/course";
import Assistant from "@/pages/assistant";
import Playground from "@/pages/playground";
import VideoResources from "@/pages/video-resources";
import NotFound from "@/pages/not-found";

function AuthenticatedRoute({ component: Component, ...props }: any) {
  const { isAuthenticated, isLoading, needsProfileCompletion, needsAssessmentCompletion } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    } else if (isAuthenticated) {
      // Redirect based on completion status
      if (needsProfileCompletion && window.location.pathname !== '/basic-details') {
        setLocation('/basic-details');
      } else if (needsAssessmentCompletion && !window.location.pathname.includes('/assessment') && window.location.pathname !== '/results') {
        setLocation('/assessment');
      }
    }
  }, [isAuthenticated, isLoading, needsProfileCompletion, needsAssessmentCompletion, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <Component {...props} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/basic-details">
        <AuthenticatedRoute component={BasicDetails} />
      </Route>
      <Route path="/assessment">
        <AuthenticatedRoute component={Assessment} />
      </Route>
      <Route path="/results">
        <AuthenticatedRoute component={Results} />
      </Route>
      <Route path="/dashboard">
        <AuthenticatedRoute component={Dashboard} />
      </Route>
      <Route path="/learning-path">
        <AuthenticatedRoute component={LearningPath} />
      </Route>
      <Route path="/course">
        <AuthenticatedRoute component={Course} />
      </Route>
      <Route path="/course/:domain">
        <AuthenticatedRoute component={Course} />
      </Route>
      <Route path="/course/:domain/:chapterId">
        <AuthenticatedRoute component={Course} />
      </Route>
      <Route path="/start-learning">
        <AuthenticatedRoute component={LearningPath} />
      </Route>
      <Route path="/assistant">
        <AuthenticatedRoute component={Assistant} />
      </Route>
      <Route path="/playground">
        <AuthenticatedRoute component={Playground} />
      </Route>
      <Route path="/video-resources">
        <AuthenticatedRoute component={VideoResources} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
