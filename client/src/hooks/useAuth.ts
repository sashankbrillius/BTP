import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  currentRole?: string;
  yearsExperience?: string;
  interest?: string;
  profileCompleted: boolean;
  assessmentCompleted: boolean;
  resumeUrl?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get current user query
  const { data: user, isLoading, error, refetch } = useQuery<User>({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/logout');
    },
    onSuccess: () => {
      queryClient.removeQueries();
      queryClient.clear();
      setLocation('/');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: any) => {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      queryClient.removeQueries();
      queryClient.clear();
      setLocation('/');
    },
  });

  // Force refresh user data
  const refreshUser = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const isAuthenticated = !!user && !error;
  const isUnauthenticated = !user && !isLoading && (error?.message?.includes('401') || error?.message?.includes('Not authenticated'));

  return {
    user,
    isLoading,
    isAuthenticated,
    isUnauthenticated,
    error,
    logout,
    refreshUser,
    refetch,
    // Helper methods for user completion status
    needsProfileCompletion: user && !user.profileCompleted,
    needsAssessmentCompletion: user && user.profileCompleted && !user.assessmentCompleted,
    isFullyOnboarded: user && user.profileCompleted && user.assessmentCompleted,
  };
}