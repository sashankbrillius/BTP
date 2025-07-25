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
import { Play, CheckCircle, XCircle, AlertCircle, Code, Clock, User, BookOpen, Trophy, Zap, Terminal, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Editor } from "@monaco-editor/react";
import confetti from "canvas-confetti";

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
  const editorRef = useRef<any>(null);

  // Confetti animation for successful tests
  const triggerSuccessConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: ['#ff6b35', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  // Fetch assessment data
  const { data: assessmentData, isLoading } = useQuery<AssessmentData>({
    queryKey: ['/api/assessment/questions'],
  });

  // Initialize starter code and timer
  useEffect(() => {
    if (assessmentData?.codeQuestion?.starterCode) {
      setUserCode(assessmentData.codeQuestion.starterCode);
      setSelectedLanguage(assessmentData.codeQuestion.language || 'javascript');
      console.log('Assessment language detected:', assessmentData.codeQuestion.language);
    }
    
    // Auto-select answers for testing purposes (remove this later)
    if (assessmentData?.mcqQuestions && Object.keys(mcqAnswers).length === 0) {
      const autoAnswers: Record<string, string> = {};
      assessmentData.mcqQuestions.forEach(question => {
        autoAnswers[question.id] = 'A'; // Auto-select first option for testing
      });
      setMCQAnswers(autoAnswers);
      console.log('Auto-selected answers for testing:', autoAnswers);
    }
  }, [assessmentData, mcqAnswers]);

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
      
      // Trigger confetti if all tests passed
      if (data.testResults && data.testResults.length > 0) {
        const passedTests = data.testResults.filter((t: any) => t.passed).length;
        const totalTests = data.testResults.length;
        
        if (passedTests === totalTests) {
          setTimeout(() => {
            triggerSuccessConfetti();
          }, 500); // Small delay to let UI update first
          
          toast({
            title: "🎉 All tests passed!",
            description: `Perfect! You solved the challenge with ${passedTests}/${totalTests} test cases passing.`,
            duration: 4000,
          });
        } else if (passedTests > 0) {
          toast({
            title: "Some tests passed",
            description: `${passedTests}/${totalTests} test cases are passing. Keep going!`,
            duration: 3000,
          });
        }
      }
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
        codeLanguage: selectedLanguage,
        timeSpent,
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

  const getLanguageTemplate = (lang: string) => {
    const templates = {
      javascript: `function calculateAccuracy(correct, total) {
    // Your code here
    // Return the accuracy as a percentage with 2 decimal places
    return (correct / total * 100).toFixed(2);
}`,
      python: `def calculateAccuracy(correct, total):
    # Your code here
    # Return the accuracy as a percentage with 2 decimal places
    return format(correct / total * 100, '.2f')`,
      java: `public class Solution {
    public static String calculateAccuracy(int correct, int total) {
        // Your code here
        // Return the accuracy as a percentage with 2 decimal places
        return String.format("%.2f", (double)correct / total * 100);
    }
}`,
      cpp: `#include <iostream>
#include <iomanip>
#include <sstream>
using namespace std;

string calculateAccuracy(int correct, int total) {
    // Your code here
    // Return the accuracy as a percentage with 2 decimal places
    stringstream ss;
    ss << fixed << setprecision(2) << (double)correct / total * 100;
    return ss.str();
}`,
      go: `package main

import "fmt"

func calculateAccuracy(correct, total int) string {
    // Your code here
    // Return the accuracy as a percentage with 2 decimal places
    return fmt.Sprintf("%.2f", float64(correct)/float64(total)*100)
}`
    };
    return templates[lang as keyof typeof templates] || templates.javascript;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700">Preparing Your Assessment...</p>
          <p className="text-gray-500 mt-2">Loading personalized questions and coding challenges</p>
        </div>
      </div>
    );
  }

  if (!assessmentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Assessment Unavailable</h2>
          <p className="text-gray-600">Unable to load assessment questions. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Assessment Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Technical Assessment</h1>
                <p className="text-sm text-gray-600">
                  {showCodeQuestion ? 'Coding Challenge' : `Question ${currentMCQIndex + 1} of ${assessmentData?.mcqQuestions?.length || 0}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-mono text-gray-700">{formatTime(timeSpent)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-gray-700">Professional Assessment</span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Progress</span>
              <span>{showCodeQuestion ? '100%' : `${Math.round(((currentMCQIndex + 1) / (assessmentData?.mcqQuestions?.length || 1)) * 90)}%`}</span>
            </div>
            <Progress 
              value={showCodeQuestion ? 100 : ((currentMCQIndex + 1) / (assessmentData?.mcqQuestions?.length || 1)) * 90} 
              className="w-full h-2"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {!showCodeQuestion ? (
          // MCQ Questions Section - Professional Design
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-2">
                      {assessmentData?.mcqQuestions[currentMCQIndex]?.question}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-blue-100">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span className="text-sm">Multiple Choice</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="h-4 w-4" />
                        <span className="text-sm">Technical Knowledge</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-1 text-sm font-medium">
                    {currentMCQIndex + 1}/{assessmentData?.mcqQuestions?.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <RadioGroup 
                  value={mcqAnswers[assessmentData?.mcqQuestions[currentMCQIndex]?.id] || ""} 
                  onValueChange={(value) => handleMCQAnswer(assessmentData!.mcqQuestions[currentMCQIndex].id, value)}
                  className="space-y-4"
                >
                  {(() => {
                    const currentQuestion = assessmentData?.mcqQuestions[currentMCQIndex];
                    if (!currentQuestion) return null;
                    
                    const options = currentQuestion.options;
                    const optionKeys = ['A', 'B', 'C', 'D'];
                    
                    return optionKeys.map((optionKey, index) => {
                      const optionText = options[index];
                      if (!optionText) return null;
                      
                      const isSelected = mcqAnswers[currentQuestion.id] === optionKey;
                      
                      return (
                        <div 
                          key={optionKey} 
                          className={`flex items-start space-x-4 p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 shadow-sm' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <RadioGroupItem 
                            value={optionKey} 
                            id={`option-${optionKey}`} 
                            className="mt-0.5 data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-500"
                          />
                          <Label htmlFor={`option-${optionKey}`} className="flex-1 cursor-pointer">
                            <div className="flex items-start space-x-3">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {optionKey}
                              </span>
                              <span className="text-gray-800 leading-relaxed">{optionText}</span>
                            </div>
                          </Label>
                        </div>
                      );
                    });
                  })()}
                </RadioGroup>

                <div className="flex justify-between items-center pt-8 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePreviousMCQ}
                    disabled={currentMCQIndex === 0}
                    className="px-6"
                  >
                    Previous Question
                  </Button>

                  <Button
                    onClick={handleNextMCQ}
                    disabled={!canProceed()}
                    className="px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    {currentMCQIndex === assessmentData.mcqQuestions.length - 1 ? 'Continue to Coding →' : 'Next Question →'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Coding Challenge Section - Professional LeetCode-style
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              {/* Coding Header */}
              <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      <Code className="h-6 w-6" />
                      {assessmentData.codeQuestion.title}
                    </h2>
                    <div className="flex items-center space-x-4 mt-2 text-green-100">
                      <div className="flex items-center space-x-1">
                        <Terminal className="h-4 w-4" />
                        <span className="text-sm">Coding Challenge</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Settings className="h-4 w-4" />
                        <span className="text-sm">Algorithm & Logic</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-2">
                    <div className="text-xs font-medium">Language</div>
                    <div className="text-sm font-bold">{selectedLanguage.toUpperCase()}</div>
                  </div>
                </div>
              </div>

              {/* Fixed Height Layout - No scrolling */}
              <div className="flex h-[600px]">
                
                {/* Left Panel - Problem Description & Test Results */}
                <div className="w-1/2 border-r border-gray-200 flex flex-col">
                  {/* Problem Description - Fixed height */}
                  <div className="p-4 border-b border-gray-200 h-48">
                    <h3 className="font-semibold text-gray-900 mb-3">Problem Description</h3>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <p>{assessmentData.codeQuestion.description}</p>
                    </div>
                  </div>
                  
                  {/* Examples - Compact */}
                  <div className="p-4 border-b border-gray-200 h-44">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      Examples
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {assessmentData.codeQuestion.testCases.map((testCase, index) => (
                        <div key={index} className="bg-gray-50 rounded p-2 border">
                          <div className="font-medium text-gray-900 mb-1">Ex {index + 1}:</div>
                          <div className="space-y-1">
                            <div>
                              <div className="text-gray-600 font-medium">Input:</div>
                              <code className="bg-white p-1 rounded text-xs block">{testCase.input}</code>
                            </div>
                            <div>
                              <div className="text-gray-600 font-medium">Output:</div>
                              <code className="bg-white p-1 rounded text-xs block">{testCase.expectedOutput}</code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Test Results - Always visible, updates when run */}
                  <div className="flex-1 p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      Test Results {testResults.length > 0 && `(${testResults.filter(t => t.passed).length}/${testResults.length} passed)`}
                    </h4>
                    <div className="space-y-2">
                      {testResults.length === 0 ? (
                        // Show placeholder test cases before running
                        assessmentData.codeQuestion.testCases.map((testCase, index) => (
                          <div key={index} className="p-3 rounded border-l-4 border-gray-300 bg-gray-50">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-sm text-gray-600">Test {index + 1}: Ready to run</span>
                            </div>
                            <div className="text-xs text-gray-500 pl-6">
                              <div>Input: <code className="bg-white px-1 rounded">{testCase.input}</code></div>
                              <div>Expected: <code className="bg-white px-1 rounded">{testCase.expectedOutput}</code></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        // Show actual test results after running
                        testResults.map((result, index) => (
                          <div 
                            key={index} 
                            className={`p-3 rounded border-l-4 ${
                              result.passed 
                                ? 'bg-green-50 border-green-500' 
                                : 'bg-red-50 border-red-500'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {result.passed ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className={`font-medium text-sm ${
                                result.passed ? 'text-green-800' : 'text-red-800'
                              }`}>
                                Test {result.testCase}: {result.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>
                            <div className="text-xs space-y-0.5 pl-6">
                              <div>Input: <code className="bg-white px-1 rounded">{result.input}</code></div>
                              <div>Expected: <code className="bg-white px-1 rounded">{result.expected}</code></div>
                              <div>Got: <code className={`px-1 rounded ${
                                result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>{result.actual || 'No output'}</code></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Panel - Code Editor */}
                <div className="w-1/2 flex flex-col">
                  {/* Editor Header - Compact */}
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm">Code Editor</h3>
                      <Select value={selectedLanguage} onValueChange={(value) => {
                        setSelectedLanguage(value);
                        setUserCode(getLanguageTemplate(value));
                        setTestResults([]); // Clear test results when changing language
                      }}>
                        <SelectTrigger className="w-28 h-8 text-xs">
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
                  
                  {/* Monaco Editor - Fixed height */}
                  <div className="h-96">
                    <Editor
                      height="100%"
                      language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
                      value={userCode}
                      onChange={(value) => setUserCode(value || "")}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        contextmenu: true,
                        selectOnLineNumbers: true,
                        bracketPairColorization: { enabled: true },
                      }}
                      onMount={(editor) => {
                        editorRef.current = editor;
                      }}
                    />
                  </div>

                  {/* Console Output - Compact */}
                  <div className="border-t border-gray-200 bg-gray-900 text-green-400 p-3 h-20">
                    <div className="text-xs font-medium text-green-300 mb-1">Console:</div>
                    <div className="text-xs font-mono overflow-hidden">
                      {codeOutput || "Ready to run..."}
                    </div>
                  </div>

                  {/* Action Buttons - Compact */}
                  <div className="p-3 border-t border-gray-200 bg-white">
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={() => setShowCodeQuestion(false)}
                        className="px-3 h-8 text-xs"
                      >
                        ← Back to MCQs
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleRunCode}
                          disabled={isRunningCode || !userCode.trim()}
                          className="px-4 h-8 text-xs flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          {isRunningCode ? 'Running...' : 'Run Tests'}
                        </Button>
                        
                        <Button
                          onClick={() => submitAssessmentMutation.mutate()}
                          disabled={!canSubmit() || submitAssessmentMutation.isPending}
                          className="px-4 h-8 text-xs bg-green-600 hover:bg-green-700"
                        >
                          {submitAssessmentMutation.isPending ? 'Submitting...' : 'Submit Solution'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}