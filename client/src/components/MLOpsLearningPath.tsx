import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { BookOpen, CheckCircle, Lock, PlayCircle, ArrowRight } from "lucide-react";

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

interface MLOpsLearningPathProps {
  userInterest?: string;
}

export default function MLOpsLearningPath({ userInterest }: MLOpsLearningPathProps) {
  const [, setLocation] = useLocation();
  
  const { data: chapters, isLoading, refetch } = useQuery<Chapter[]>({
    queryKey: [`/api/learning/${userInterest || 'MLOps'}/chapters`],
    enabled: !!userInterest,
    refetchOnWindowFocus: true,
    refetchInterval: 3000, // Refresh every 3 seconds to catch chapter unlocks
    staleTime: 0, // Always consider data stale to force refetch
  });

  const handleChapterClick = (chapter: Chapter) => {
    if (chapter.isUnlocked) {
      setLocation(`/course/${chapter.domain.toLowerCase()}/${chapter.chapterNumber}`);
    }
  };

  const overallProgress = chapters ? 
    Math.round(chapters.reduce((acc, ch) => acc + ch.progress, 0) / chapters.length) : 0;

  const completedChapters = chapters ? chapters.filter(ch => ch.isCompleted).length : 0;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-heading text-xl flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-orange" />
          {userInterest} Learning Path
        </CardTitle>
        <CardDescription>
          Master {userInterest} through 10 comprehensive chapters with 40 expert-led videos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-800">Overall Progress</span>
              <span className="text-sm text-gray-600">
                {completedChapters}/10 Chapters Complete
              </span>
            </div>
            <Progress value={overallProgress} className="h-3 mb-2" />
            <div className="text-sm text-gray-600">
              {overallProgress}% of your {userInterest} mastery journey
            </div>
          </div>

          {/* S-Curve Chapter Navigation */}
          <div className="relative">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
              Interactive Learning Chapters
            </h3>
            
            {/* Desktop S-Curve Layout */}
            <div className="hidden md:block relative h-80 overflow-hidden">
              <svg viewBox="0 0 1000 300" className="w-full h-full">
                {/* S-Curve Path */}
                <path
                  d="M50 250 Q250 250, 500 150 T950 50"
                  stroke="#FF6B35"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="10 5"
                  opacity="0.5"
                />
                
                {/* Chapter Nodes */}
                {chapters?.map((chapter, index) => {
                  const t = index / 9;
                  const x = 50 + t * 900;
                  const y = 250 - (t * 200) - (Math.sin(t * Math.PI) * 30);
                  
                  return (
                    <g key={chapter.id}>
                      {/* Chapter Circle */}
                      <circle
                        cx={x}
                        cy={y}
                        r="25"
                        fill={chapter.isCompleted ? "#10B981" : chapter.isUnlocked ? "#FF6B35" : "#D1D5DB"}
                        stroke="white"
                        strokeWidth="3"
                        className={`transition-all duration-300 ${chapter.isUnlocked ? 'cursor-pointer hover:scale-110' : ''}`}
                        onClick={() => handleChapterClick(chapter)}
                      />
                      
                      {/* Chapter Icon/Number */}
                      {chapter.isCompleted ? (
                        <CheckCircle 
                          className="w-6 h-6 text-white" 
                          style={{ transform: `translate(${x-12}px, ${y-12}px)` }} 
                        />
                      ) : chapter.isUnlocked ? (
                        <PlayCircle 
                          className="w-6 h-6 text-white" 
                          style={{ transform: `translate(${x-12}px, ${y-12}px)` }} 
                        />
                      ) : (
                        <Lock 
                          className="w-5 h-5 text-gray-500" 
                          style={{ transform: `translate(${x-10}px, ${y-10}px)` }} 
                        />
                      )}
                      
                      {/* Chapter Label */}
                      <text
                        x={x}
                        y={y + 50}
                        textAnchor="middle"
                        className="text-xs font-medium fill-gray-700"
                      >
                        Chapter {chapter.chapterNumber}
                      </text>
                      
                      {/* Progress Indicator */}
                      {chapter.isUnlocked && (
                        <text
                          x={x}
                          y={y + 65}
                          textAnchor="middle"
                          className="text-xs fill-orange-600 font-semibold"
                        >
                          {chapter.progress}%
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Mobile Grid Layout */}
            <div className="md:hidden grid grid-cols-2 gap-3">
              {chapters?.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => handleChapterClick(chapter)}
                  disabled={!chapter.isUnlocked}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    chapter.isCompleted
                      ? 'bg-green-50 border-green-300 text-green-800'
                      : chapter.isUnlocked
                      ? 'bg-orange-50 border-orange-300 text-orange-800 hover:bg-orange-100'
                      : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Ch {chapter.chapterNumber}</span>
                    {chapter.isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : chapter.isUnlocked ? (
                      <PlayCircle className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="text-sm font-medium truncate">{chapter.title}</div>
                  {chapter.isUnlocked && (
                    <div className="mt-2">
                      <Progress value={chapter.progress} className="h-1" />
                      <div className="text-xs mt-1">{chapter.completedLessons}/{chapter.totalLessons} lessons</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button 
              onClick={() => {
                const nextChapter = chapters?.find(ch => ch.isUnlocked && !ch.isCompleted);
                if (nextChapter) {
                  handleChapterClick(nextChapter);
                }
              }}
              className="bg-brand-orange hover:bg-orange-600"
              disabled={!chapters?.some(ch => ch.isUnlocked && !ch.isCompleted)}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Continue Learning
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setLocation('/learning-path')}
            >
              View Full Course
            </Button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-600 pt-2 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>Locked</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}