import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Trophy, Target, BookOpen, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

interface AssessmentResults {
  mcqScore: number;
  codingScore: number;
  totalScore: number;
  mcqCorrect: number;
  mcqTotal: number;
  mcqDetails?: Array<{
    id: string;
    question: string;
    options: Record<string, string>;
    correctAnswer: string;
    userAnswer: string;
    isCorrect: boolean;
  }>;
  testCaseResults?: Array<{
    testCase: number;
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }>;
  feedback: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    overallPerformance: string;
  };
  completedAt: string;
}

export default function ResultsPage() {
  const [location, setLocation] = useLocation();

  const { data: results, isLoading } = useQuery<AssessmentResults>({
    queryKey: ['/api/assessment/results'],
  });

  const handleGenerateCourse = () => {
    setLocation('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p className="text-brand-gray">Analyzing your assessment results...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Unable to load your results.</p>
            <Button variant="outline" onClick={() => setLocation('/assessment')}>
              Retake Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-primary p-4">
      <div className="container-max">
        <div className="text-center mb-8">
          <Trophy className="h-16 w-16 text-brand-orange mx-auto mb-4" />
          <h1 className="text-heading text-4xl mb-2">Assessment Complete!</h1>
          <p className="text-body text-lg">Here's how you performed</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Overall Score Card */}
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-heading text-2xl flex items-center justify-center gap-2">
                <Target className="h-6 w-6" />
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-6xl font-bold ${getScoreColor(results.totalScore)} mb-4`}>
                {results.totalScore}%
              </div>
              <Progress value={results.totalScore} className="h-4 mb-4" />
              <Badge variant={getScoreBadgeVariant(results.totalScore)} className="text-lg px-4 py-2">
                {results.totalScore >= 80 ? 'Excellent' : results.totalScore >= 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </CardContent>
          </Card>

          {/* Breakdown Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-heading text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-brand-dark font-medium">Multiple Choice Questions</span>
                  <span className={`font-bold ${getScoreColor(results.mcqScore)}`}>
                    {results.mcqScore}%
                  </span>
                </div>
                <Progress value={results.mcqScore} className="h-3" />
                <p className="text-sm text-brand-gray mt-1">
                  {results.mcqCorrect} out of {results.mcqTotal} questions correct
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-brand-dark font-medium">Coding Challenge</span>
                  <span className={`font-bold ${getScoreColor(results.codingScore)}`}>
                    {results.codingScore}%
                  </span>
                </div>
                <Progress value={results.codingScore} className="h-3" />
                <p className="text-sm text-brand-gray mt-1">
                  Code quality, logic, and test cases
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Feedback Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="text-heading text-xl flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {results.feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-brand-dark">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-heading text-xl flex items-center gap-2 text-blue-600">
                <Target className="h-5 w-5" />
                Areas for Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {results.feedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-brand-dark">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Overall Performance & Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-heading text-xl">AI Analysis & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-brand-dark font-medium mb-3">Overall Performance:</h3>
              <p className="text-body leading-relaxed">{results.feedback.overallPerformance}</p>
            </div>

            <div>
              <h3 className="text-brand-dark font-medium mb-3">Personalized Learning Recommendations:</h3>
              <ul className="space-y-2">
                {results.feedback.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-brand-orange mt-0.5 flex-shrink-0" />
                    <span className="text-brand-dark">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* MCQ Details Section */}
        {results.mcqDetails && results.mcqDetails.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-heading text-xl">MCQ Question Review</CardTitle>
              <CardDescription>Review your answers to multiple choice questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {results.mcqDetails.map((q, index) => (
                  <div key={q.id} className={`p-4 rounded-lg border ${q.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-brand-dark">Question {index + 1}</h4>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${q.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {q.isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>
                    <p className="text-brand-dark mb-3">{q.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Your Answer: </span>
                        <span className={q.isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {q.userAnswer}. {q.options[q.userAnswer]}
                        </span>
                      </div>
                      {!q.isCorrect && (
                        <div>
                          <span className="font-medium">Correct Answer: </span>
                          <span className="text-green-600">
                            {q.correctAnswer}. {q.options[q.correctAnswer]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Case Results Section */}
        {results.testCaseResults && results.testCaseResults.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-heading text-xl">Coding Challenge Test Cases</CardTitle>
              <CardDescription>Detailed results for each test case</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.testCaseResults.map((testCase, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${testCase.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-brand-dark">Test Case {testCase.testCase}</h4>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${testCase.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {testCase.passed ? 'PASSED' : 'FAILED'}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Input: </span>
                        <code className="text-blue-600">{testCase.input}</code>
                      </div>
                      <div>
                        <span className="font-medium">Expected: </span>
                        <code className="text-green-600">{testCase.expected}</code>
                      </div>
                      <div>
                        <span className="font-medium">Your Output: </span>
                        <code className={testCase.passed ? 'text-green-600' : 'text-red-600'}>
                          {testCase.actual || 'No output'}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <div className="text-center">
          <Button 
            onClick={handleGenerateCourse}
            className="btn-primary text-lg px-8 py-6"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Generate My Personalized Course
          </Button>
          <p className="text-brand-gray mt-4">
            Based on your results, we'll create a customized learning path just for you
          </p>
        </div>
      </div>
    </div>
  );
}