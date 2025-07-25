import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocation, useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Maximize, 
  CheckCircle, 
  Lock,
  BookOpen,
  ArrowLeft
} from "lucide-react";

interface Lesson {
  id: number;
  chapterId: number;
  domain: string;
  lessonNumber: number;
  title: string;
  videoUrl: string;
  videoId: string;
  duration: string;
  description: string;
  completed: boolean;
  watchedDuration: number;
  isUnlocked: boolean;
}

export default function CoursePage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get user data to automatically show their domain content
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });
  
  // Use user's domain instead of URL parameter to ensure they only see their content
  const userDomain = user ? (user as any).interest?.toUpperCase() || 'MLOps' : 'MLOps';
  const domain = userDomain; // Always use user's domain
  
  // Get user's last watched lesson to resume from correct position
  const { data: lastWatched } = useQuery({
    queryKey: [`/api/learning/${domain}/last-watched`],
    enabled: !!user && !!domain,
  });
  
  // Use chapter NUMBER (1, 2, 3...) not database ID for URL routing
  const chapterNumber = parseInt(params.chapterId || '1'); // This should be chapter number, not database ID
  
  // Get last watched chapter NUMBER (not ID) for default redirect
  const defaultChapterNumber = lastWatched ? 
    ((lastWatched as any)?.chapterNumber || 1) : 1; // Use chapterNumber, not chapterId
  
  // Redirect logic for course page routing
  useEffect(() => {
    if (user && (user as any).interest) {
      const actualUserDomain = (user as any).interest.toUpperCase();
      const domainForUrl = actualUserDomain.toLowerCase();
      
      // Case 1: No domain in URL (direct /course access) - redirect to user's domain
      if (!params.domain) {
        console.log('Course page: No domain in URL, redirecting to user domain with chapter:', defaultChapterNumber);
        setLocation(`/course/${domainForUrl}/${defaultChapterNumber}`);
        return;
      }
      
      // Case 2: Domain in URL doesn't match user's domain - redirect to user's domain
      if (params.domain) {
        const urlDomain = params.domain.toUpperCase();
        if (urlDomain !== actualUserDomain) {
          console.log('Course page: URL domain mismatch, redirecting from', params.domain, 'to', domainForUrl, 'with chapter:', chapterNumber);
          setLocation(`/course/${domainForUrl}/${chapterNumber}`);
          return;
        }
      }
    }
  }, [user, params.domain, params.chapterId, chapterNumber, defaultChapterNumber, setLocation]);
  
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLIFrameElement>(null);

  // Get lessons for current chapter using chapter NUMBER not database ID
  const { data: lessons, isLoading } = useQuery<Lesson[]>({
    queryKey: [`/api/learning/${domain}/chapters/number/${chapterNumber}/lessons`],
    enabled: !!chapterNumber && !!domain,
  });

  // Update lesson progress mutation with auto-advance
  const updateProgressMutation = useMutation({
    mutationFn: async ({ lessonId, completed, watchedDuration }: {
      lessonId: number;
      completed: boolean;
      watchedDuration: number;
    }) => {
      const response = await apiRequest('POST', `/api/learning/lessons/${lessonId}/progress`, {
        completed,
        watchedDuration
      });
      return response.json();
    },
    onSuccess: (_, { completed }) => {
      // Invalidate and refetch lessons to update progress
      queryClient.invalidateQueries({ queryKey: [`/api/learning/${domain}/chapters/number/${chapterNumber}/lessons`] });
      queryClient.invalidateQueries({ queryKey: [`/api/learning/${domain}/chapters`] });
      
      // Also invalidate dashboard and all chapter queries to update unlocks
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: [`/api/learning/${domain.toUpperCase()}/chapters`] });
      queryClient.invalidateQueries({ queryKey: [`/api/learning/MLOps/chapters`] });
      queryClient.invalidateQueries({ queryKey: [`/api/learning/AIOps/chapters`] });
      
      // Auto-advance to next video if current video is completed
      if (completed && lessons) {
        const nextIndex = currentLessonIndex + 1;
        const nextLesson = lessons[nextIndex];
        
        if (nextLesson) {
          setTimeout(() => {
            setCurrentLessonIndex(nextIndex);
            toast({
              title: "Video Completed!",
              description: `Auto-advancing to: ${nextLesson.title}`,
            });
          }, 2000); // Wait 2 seconds before auto-advancing
        } else {
          // All lessons in chapter completed - check if this unlocks next chapter
          toast({
            title: "Chapter Complete!",
            description: "Great job! Returning to dashboard to unlock next chapter.",
          });
          setTimeout(() => {
            setLocation('/dashboard');
          }, 3000);
        }
      }
    }
  });

  const currentLesson = lessons?.[currentLessonIndex];

  // Handle lesson completion with auto-advance preview
  const markLessonComplete = () => {
    if (currentLesson && !currentLesson.completed) {
      updateProgressMutation.mutate({
        lessonId: currentLesson.id,
        completed: true,
        watchedDuration: 100 // Mark as fully watched
      });
      
      toast({
        title: "Lesson Completed!",
        description: "Auto-advancing to next video in 2 seconds...",
      });
    }
  };

  // Handle next lesson
  const goToNextLesson = () => {
    if (lessons && currentLessonIndex < lessons.length - 1) {
      const nextLesson = lessons[currentLessonIndex + 1];
      if (nextLesson.isUnlocked) {
        setCurrentLessonIndex(currentLessonIndex + 1);
        setCurrentTime(0);
      } else {
        toast({
          title: "Complete Current Lesson",
          description: "Finish the current lesson to unlock the next one.",
          variant: "destructive"
        });
      }
    } else {
      // Chapter completed, redirect to dashboard
      toast({
        title: "Chapter Complete!",
        description: "Congratulations! You've completed this chapter.",
      });
      setLocation('/dashboard');
    }
  };

  // Handle previous lesson
  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      setCurrentTime(0);
    }
  };

  const selectLesson = (index: number) => {
    const lesson = lessons?.[index];
    if (lesson?.isUnlocked) {
      setCurrentLessonIndex(index);
      setCurrentTime(0);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p className="text-brand-gray">Loading course content...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lessons || lessons.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No lessons found for this chapter.</p>
            <Button onClick={() => setLocation('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => {
                console.log('Course page: Navigating to dashboard');
                setLocation('/dashboard');
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">
                Chapter {chapterNumber}: {lessons[0]?.title?.replace(/Lesson \d+:?\s*/, '') || 'Course Content'}
              </h1>
              <p className="text-sm text-gray-600">{domain} Learning Path</p>
            </div>
            <div className="text-sm text-gray-600">
              Lesson {currentLessonIndex + 1} of {lessons.length}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player - Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                {/* Video Container */}
                <div className="relative bg-black rounded-t-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  {currentLesson ? (
                    <iframe
                      ref={videoRef}
                      src={`https://www.youtube.com/embed/${currentLesson.videoId}?enablejsapi=1&origin=${window.location.origin}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={currentLesson.title}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">
                      <div className="text-center">
                        <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Select a lesson to begin</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Controls */}
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                      {currentLesson?.title || 'Select a Lesson'}
                    </h2>
                    {currentLesson && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPreviousLesson}
                          disabled={currentLessonIndex === 0}
                        >
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={markLessonComplete}
                          disabled={currentLesson.completed}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {currentLesson.completed ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Completed
                            </>
                          ) : (
                            'Mark Complete'
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={goToNextLesson}
                          disabled={!currentLesson.completed && currentLessonIndex === lessons.length - 1}
                          className="bg-brand-orange hover:bg-orange-600"
                        >
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {currentLesson && (
                    <div className="space-y-3">
                      <p className="text-gray-600">{currentLesson.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Lesson Progress</span>
                          <span>{currentLesson.completed ? '100%' : '0%'}</span>
                        </div>
                        <Progress 
                          value={currentLesson.completed ? 100 : 0} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chapter Playlist - Right Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-brand-orange" />
                  Chapter {chapterNumber} Lessons
                </CardTitle>
                <div className="text-sm text-gray-600">
                  {lessons.filter(l => l.completed).length} of {lessons.length} completed
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => selectLesson(index)}
                      disabled={!lesson.isUnlocked}
                      className={`w-full p-3 text-left border-b transition-colors ${
                        index === currentLessonIndex
                          ? 'bg-orange-50 border-l-4 border-l-brand-orange'
                          : lesson.isUnlocked
                          ? 'hover:bg-gray-50'
                          : 'bg-gray-50 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {lesson.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : lesson.isUnlocked ? (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                          ) : (
                            <Lock className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-800 truncate">
                            {lesson.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            Lesson {lesson.lessonNumber} • {lesson.duration}
                          </p>
                          {lesson.completed && (
                            <div className="text-xs text-green-600 mt-1">✓ Completed</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chapter Progress Summary */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Chapter Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Completed Lessons</span>
                    <span>{lessons.filter(l => l.completed).length}/{lessons.length}</span>
                  </div>
                  <Progress 
                    value={(lessons.filter(l => l.completed).length / lessons.length) * 100} 
                    className="h-2"
                  />
                  <div className="text-xs text-gray-600 text-center">
                    {Math.round((lessons.filter(l => l.completed).length / lessons.length) * 100)}% Complete
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}