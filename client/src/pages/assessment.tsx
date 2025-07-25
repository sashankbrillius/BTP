import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Play, CheckCircle, XCircle, AlertCircle, Code, Clock, User, BookOpen, Trophy, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Editor from "@monaco-editor/react";

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  category: string;
}

interface CodeQuestion {
  id: string;
  title: string;
  description: string;
  language: string;
  starterCode: string;
  testCases: Array<{
    input: string;
    expectedOutput: string;
    description: string;
  }>;
}

interface AssessmentData {
  mcqQuestions: MCQQuestion[];
  codeQuestion: CodeQuestion;
}

export default function AssessmentPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State for assessment
  const [currentMCQIndex, setCurrentMCQIndex] = useState(0);
  const [mcqAnswers, setMCQAnswers] = useState<Record<string, string>>({});
  const [showCodeQuestion, setShowCodeQuestion] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [codeOutput, setCodeOutput] = useState("");
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [testResults, setTestResults] = useState<Array<{
    testCase: number;
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }>>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [assessmentStartTime] = useState(Date.now());
  const editorRef = useRef(null);

  // Fetch assessment questions
  const { data: assessmentData, isLoading } = useQuery<AssessmentData>({
    queryKey: ['/api/assessment/questions'],
  });

  // Initialize starter code and timer
  useEffect(() => {
    if (assessmentData?.codeQuestion?.starterCode) {
      setUserCode(assessmentData.codeQuestion.starterCode);
      setSelectedLanguage(assessmentData.codeQuestion.language || 'javascript');
    }
  }, [assessmentData]);

  // Timer for assessment tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - assessmentStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [assessmentStartTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Run code with test cases
  const runCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/assessment/run-code-tests', {
        language: selectedLanguage,
        code: userCode,
        testCases: assessmentData?.codeQuestion?.testCases || [],
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setCodeOutput(data.output || "Code executed successfully");
      setTestResults(data.testResults || []);
    },
    onError: (error: any) => {
      setCodeOutput(`Error: ${error.message}`);
      setTestResults([]);
    },
    onSettled: () => {
      setIsRunningCode(false);
    },
  });

  // Submit assessment mutation
  const submitAssessmentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/assessment/submit', {
        mcqAnswers,
        codeAnswer: userCode,
        codeQuestionId: assessmentData?.codeQuestion?.id,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Assessment Submitted",
        description: "Your assessment has been completed successfully.",
      });
      setLocation('/results');
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRunCode = () => {
    if (!userCode.trim()) return;
    setIsRunningCode(true);
    setCodeOutput("");
    setTestResults([]);
    runCodeMutation.mutate();
  };

  const handleMCQAnswer = (questionId: string, optionKey: string) => {
    setMCQAnswers(prev => ({ ...prev, [questionId]: optionKey }));
  };

  const handleNextMCQ = () => {
    if (!assessmentData) return;
    
    if (currentMCQIndex < assessmentData.mcqQuestions.length - 1) {
      setCurrentMCQIndex(prev => prev + 1);
    } else {
      setShowCodeQuestion(true);
    }
  };

  const handlePreviousMCQ = () => {
    if (currentMCQIndex > 0) {
      setCurrentMCQIndex(prev => prev - 1);
    }
  };

  const canProceed = () => {
    if (!assessmentData) return false;
    const currentQuestion = assessmentData.mcqQuestions[currentMCQIndex];
    return mcqAnswers[currentQuestion?.id];
  };

  const canSubmit = () => {
    if (!assessmentData) return false;
    const allMCQAnswered = assessmentData.mcqQuestions.every(q => mcqAnswers[q.id]);
    const hasCodeAnswer = userCode.trim().length > 0;
    return allMCQAnswered && hasCodeAnswer;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p className="text-brand-gray">Loading your personalized assessment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assessmentData) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-red-600">Failed to load assessment. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalQuestions = assessmentData.mcqQuestions.length + 1; // MCQs + 1 coding question
  const currentProgress = showCodeQuestion 
    ? ((assessmentData.mcqQuestions.length) / totalQuestions) * 100
    : ((currentMCQIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-primary p-4">
      <div className="container-max">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-heading text-3xl">Assessment</h1>
            <div className="text-brand-gray">
              {showCodeQuestion ? 'Coding Challenge' : `Question ${currentMCQIndex + 1} of ${assessmentData.mcqQuestions.length}`}
            </div>
          </div>
          <Progress value={currentProgress} className="h-2" />
        </div>

        {!showCodeQuestion ? (
          // MCQ Questions Section
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-heading text-xl">Multiple Choice Question</CardTitle>
              <CardDescription className="text-body">
                Category: {assessmentData.mcqQuestions[currentMCQIndex]?.category}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg text-brand-dark">
                {assessmentData.mcqQuestions[currentMCQIndex]?.question}
              </div>

              <RadioGroup
                value={mcqAnswers[assessmentData.mcqQuestions[currentMCQIndex]?.id] || ""}
                onValueChange={(optionKey) => handleMCQAnswer(assessmentData.mcqQuestions[currentMCQIndex].id, optionKey)}
                className="space-y-3"
              >
                {(() => {
                  const currentQuestion = assessmentData.mcqQuestions[currentMCQIndex];
                  const options = currentQuestion?.options;
                  
                  // Handle both array and object formats
                  let optionsToRender = [];
                  if (Array.isArray(options)) {
                    // Convert array to object with A, B, C, D keys
                    const optionLetters = ['A', 'B', 'C', 'D'];
                    optionsToRender = options.map((optionText: string, index: number) => [
                      optionLetters[index],
                      optionText
                    ]);
                  } else if (typeof options === 'object' && options !== null) {
                    // Already in object format
                    optionsToRender = Object.entries(options);
                  }
                  
                  return optionsToRender.map(([optionKey, optionText]) => (
                    <div key={optionKey} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={optionKey} id={`option-${optionKey}`} />
                      <Label htmlFor={`option-${optionKey}`} className="flex-1 cursor-pointer text-body">
                        <span className="font-medium mr-2">{optionKey}.</span>{optionText}
                      </Label>
                    </div>
                  ));
                })()}
              </RadioGroup>

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePreviousMCQ}
                  disabled={currentMCQIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  className="btn-primary"
                  onClick={handleNextMCQ}
                  disabled={!canProceed()}
                >
                  {currentMCQIndex === assessmentData.mcqQuestions.length - 1 ? 'Continue to Coding' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Code Question Section - LeetCode Style Layout
          <div className="w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-4">
              <h1 className="text-heading text-2xl font-bold flex items-center gap-2 mb-2">
                <Code className="h-6 w-6" />
                {assessmentData.codeQuestion.title}
              </h1>
            </div>

            {/* Split Layout Container */}
            <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[600px]">
              
              {/* Left Panel - Problem Description & Test Cases */}
              <div className="w-1/2 flex flex-col">
                <Card className="flex-1 flex flex-col">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Problem Description</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto space-y-4">
                    {/* Problem Description */}
                    <div className="prose max-w-none">
                      <p className="text-brand-dark whitespace-pre-wrap text-sm leading-relaxed">
                        {assessmentData.codeQuestion.description}
                      </p>
                    </div>

                    {/* Test Cases */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold text-brand-dark mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Examples
                      </h3>
                      <div className="space-y-4">
                        {assessmentData.codeQuestion.testCases.map((testCase, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                            <div className="text-sm">
                              <div className="font-semibold text-brand-dark mb-2">Example {index + 1}:</div>
                              <div className="space-y-2">
                                <div>
                                  <span className="font-medium text-gray-600">Input:</span>
                                  <div className="mt-1">
                                    <code className="bg-white px-3 py-2 rounded border text-sm block">
                                      {testCase.input}
                                    </code>
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Output:</span>
                                  <div className="mt-1">
                                    <code className="bg-white px-3 py-2 rounded border text-sm block">
                                      {testCase.expectedOutput}
                                    </code>
                                  </div>
                                </div>
                                {testCase.description && (
                                  <div>
                                    <span className="font-medium text-gray-600">Explanation:</span>
                                    <p className="text-brand-gray text-sm mt-1">{testCase.description}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Test Results */}
                    {testResults.length > 0 && (
                      <div className="border-t pt-4">
                        <h3 className="font-semibold text-brand-dark mb-3 flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          Test Results ({testResults.filter(t => t.passed).length}/{testResults.length} passed)
                        </h3>
                        <div className="space-y-3">
                          {testResults.map((result, index) => (
                            <div key={index} className={`p-3 rounded-lg border-l-4 ${
                              result.passed 
                                ? 'bg-green-50 border-green-500' 
                                : 'bg-red-50 border-red-500'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                {result.passed ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <span className={`font-medium text-sm ${
                                  result.passed ? 'text-green-800' : 'text-red-800'
                                }`}>
                                  Test {result.testCase}: {result.passed ? 'PASSED ✅' : 'FAILED ❌'}
                                </span>
                              </div>
                              <div className="text-xs space-y-1 ml-6">
                                <div>
                                  <span className="font-medium">Input:</span> 
                                  <code className="ml-2 bg-white px-2 py-1 rounded text-xs">{result.input}</code>
                                </div>
                                <div>
                                  <span className="font-medium">Expected:</span> 
                                  <code className="ml-2 bg-white px-2 py-1 rounded text-xs">{result.expected}</code>
                                </div>
                                <div>
                                  <span className="font-medium">Got:</span> 
                                  <code className={`ml-2 px-2 py-1 rounded text-xs ${
                                    result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {result.actual || 'No output'}
                                  </code>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Code Editor */}
              <div className="w-1/2 flex flex-col">
                <Card className="flex-1 flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Code Editor</CardTitle>
                      {/* Language Selection */}
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Language:</Label>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                            <SelectItem value="go">Go</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {/* Code Editor */}
                    <div className="flex-1 mb-4">
                      <Textarea
                        value={userCode}
                        onChange={(e) => setUserCode(e.target.value)}
                        className="w-full h-full font-mono text-sm resize-none border-2 focus:border-brand-primary"
                        placeholder={`// Write your ${selectedLanguage} solution here...
// Function signature is already provided
// Implement your logic and return the result`}
                      />
                    </div>

                    {/* Control Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setShowCodeQuestion(false)}
                        className="flex items-center gap-2"
                      >
                        Back to MCQs
                      </Button>
                      
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={handleRunCode}
                          disabled={isRunningCode || !userCode.trim()}
                          className="flex items-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          {isRunningCode ? 'Running...' : 'Run Tests'}
                        </Button>
                        
                        <Button
                          className="btn-primary"
                          onClick={() => submitAssessmentMutation.mutate()}
                          disabled={!canSubmit() || submitAssessmentMutation.isPending}
                        >
                          {submitAssessmentMutation.isPending ? 'Submitting...' : 'Submit Solution'}
                        </Button>
                      </div>
                    </div>

                    {/* Console Output */}
                    {codeOutput && (
                      <div className="mt-4 border-t pt-4">
                        <Label className="text-sm font-medium mb-2 block">Console Output:</Label>
                        <div className="p-3 bg-gray-900 text-green-400 rounded-lg font-mono text-xs whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {codeOutput}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}