import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  CheckCircle, 
  Play, 
  Lock, 
  Clock,
  FileText,
  Users,
  Video,
  Code
} from "lucide-react";
import ResizableSidebar from '@/components/ResizableSidebar';
import { useAuth } from "@/hooks/useAuth";
import "../theme.css";

interface Chapter {
  id: number;
  domain: string;
  chapterNumber: number;
  title: string;
  description: string;
  totalLessons: number;
  progress: number;
  completedLessons: number;
  isCompleted: boolean;
  isUnlocked: boolean;
}

export default function LearningPathPage() {
  const [, setLocation] = useLocation();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const { user } = useAuth();

  // Get user's domain and fetch real chapter data
  const userDomain = user?.interest || 'MLOps';

  const { data: chapters, isLoading } = useQuery<Chapter[]>({
    queryKey: [`/api/learning/${userDomain}/chapters`],
    enabled: !!userDomain,
    refetchOnWindowFocus: true,
    refetchInterval: 3000,
    staleTime: 0,
  });

  const overallProgress = chapters ? 
    Math.round(chapters.reduce((acc, ch) => acc + ch.progress, 0) / chapters.length) : 0;

  const completedChapters = chapters ? chapters.filter(ch => ch.isCompleted).length : 0;

  useEffect(() => {
    if (chapters && chapters.length > 0) {
      setSelectedChapter(chapters[0]);
    }
  }, [chapters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ResizableSidebar activeSection="learning-path" />
      
      {/* Main Content */}
      <div 
        className="transition-all duration-300 p-8" 
        style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
      >
        <div className="container-max">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-heading text-3xl mb-2">Learning Path</h1>
            <p className="text-body text-lg">Progress through your personalized {userDomain} course</p>
            
            <div className="mt-4 flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-body">Overall Progress:</span>
                <Progress value={overallProgress} className="w-32 h-2" />
                <span className="text-brand-orange font-semibold">{overallProgress}%</span>
              </div>
              <Badge variant="outline" className="text-brand-orange border-brand-orange">
                {completedChapters} of {chapters?.length || 10} Chapters
              </Badge>
            </div>
          </div>

          {/* Video Chapters Horizontal Scroll */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-heading text-xl flex items-center gap-2">
                <Video className="h-5 w-5 text-brand-orange" />
                Chapter Videos
              </CardTitle>
              <CardDescription>Click on any unlocked chapter to start learning</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex space-x-6 overflow-x-auto pb-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-80">
                      <Card className="h-full animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                        <CardContent className="p-4">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex space-x-6 overflow-x-auto pb-4">
                  {chapters?.map((chapter) => (
                    <div
                      key={chapter.id}
                      className={`flex-shrink-0 w-80 cursor-pointer transition-all duration-300 ${
                        !chapter.isUnlocked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                      }`}
                      onClick={() => {
                        if (chapter.isUnlocked) {
                          setLocation(`/course/${chapter.domain.toLowerCase()}/${chapter.chapterNumber}`);
                        }
                      }}
                    >
                    <Card className={`h-full ${selectedChapter?.id === chapter.id ? 'ring-2 ring-brand-orange' : ''}`}>
                      <div className="relative">
                        {/* Video Thumbnail */}
                        <div className="h-48 bg-gradient-to-br from-brand-dark to-brand-gray rounded-t-lg flex items-center justify-center">
                          {chapter.isUnlocked ? (
                            <div className="text-center">
                              <Play className="h-12 w-12 text-white mb-2 mx-auto" />
                              <span className="text-white text-sm">{chapter.totalLessons} videos</span>
                            </div>
                          ) : (
                            <Lock className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          {chapter.isCompleted ? (
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : chapter.isUnlocked ? (
                            <Badge className="bg-brand-orange text-white">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Lock className="h-3 w-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-brand-dark mb-2 line-clamp-2">
                          Chapter {chapter.chapterNumber}: {chapter.title}
                        </h3>
                        <p className="text-body text-sm mb-3 line-clamp-2">
                          {chapter.description}
                        </p>
                        
                        <div className="flex justify-between items-center text-xs text-brand-gray">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <Video className="h-3 w-3 mr-1" />
                              {chapter.totalLessons} Videos
                            </span>
                            <span className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {chapter.completedLessons} Done
                            </span>
                          </div>
                        </div>
                        
                        {chapter.isUnlocked && (
                          <Button 
                            className="w-full mt-3"
                            variant={chapter.isCompleted ? "outline" : "default"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(`/course/${chapter.domain.toLowerCase()}/${chapter.chapterNumber}`);
                            }}
                          >
                            {chapter.isCompleted ? 'Review' : 'Start Learning'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chapter Progress Info */}
          {selectedChapter && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-heading text-xl">Chapter Details</CardTitle>
                  <CardDescription>{selectedChapter.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-body">{selectedChapter.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Video className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{selectedChapter.totalLessons}</div>
                      <div className="text-sm text-body">Total Videos</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">{selectedChapter.completedLessons}</div>
                      <div className="text-sm text-body">Completed</div>
                    </div>
                  </div>
                  
                  {selectedChapter.isUnlocked && (
                    <Button 
                      className="w-full btn-primary"
                      onClick={() => setLocation(`/course/${selectedChapter.domain.toLowerCase()}/${selectedChapter.chapterNumber}`)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {selectedChapter.isCompleted ? 'Review Chapter' : 'Start Chapter'}
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-heading text-xl">Learning Resources</CardTitle>
                  <CardDescription>Additional materials for this chapter</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Video className="h-5 w-5 text-brand-orange" />
                        <span className="font-medium">Video Lecture</span>
                      </div>
                      <Badge variant="outline">Required</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Reading Materials</span>
                      </div>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Code className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Code Examples</span>
                      </div>
                      <Badge variant="outline">Practice</Badge>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full" onClick={() => setLocation('/video-resources')}>
                    Browse More Resources
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}