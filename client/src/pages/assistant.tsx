import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Video, Code, X } from "lucide-react";
import { ChatInterface, type ChatMessage } from "@/components/chat-interface";
import { InlineIDE } from "@/components/inline-ide";
import { VideoSuggestionsPanel } from "@/components/video-suggestions-panel";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import ResizableSidebar from '@/components/ResizableSidebar';
import "../theme.css";

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI programming tutor powered by RAG (Retrieval-Augmented Generation) with Pinecone knowledge base. I can help you learn AIOps and MLOps concepts, solve coding problems, and suggest relevant resources from our comprehensive knowledge base. What would you like to learn today?",
      timestamp: new Date()
    }
  ]);
  
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [videoSuggestions, setVideoSuggestions] = useState<string[]>([]);
  const [isVideosPanelOpen, setIsVideosPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useRAG, setUseRAG] = useState(true);
  const [showVideoSuggestions, setShowVideoSuggestions] = useState(true);
  const [showIDE, setShowIDE] = useState(false);
  const [isCodePanelExpanded, setIsCodePanelExpanded] = useState(false);
  const [usePineconeVideosSource, setUsePineconeVideosSource] = useState(false);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Prepare conversation history for context
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      let aiResponseText = '';

      if (useRAG) {
        // Use RAG-enhanced response with Pinecone knowledge base
        const ragResponse = await fetch('/api/rag/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            query: content,
            conversationHistory
          })
        });
        const ragData = await ragResponse.json();
        aiResponseText = ragData.response;
      } else {
        // Use direct LLM response
        const llmResponse = await fetch('/api/llm/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            query: content
          })
        });
        const llmData = await llmResponse.json();
        aiResponseText = llmData.response;
      }

      // Create AI response message
      const aiResponse: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: aiResponseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      
      // Extract and auto-populate IDE with code from AI response
      const extractedCode = extractCodeFromMessage(aiResponseText);
      if (extractedCode) {
        console.log('Extracted code:', extractedCode);
        const newExercise = {
          title: `Code from: ${content.substring(0, 50)}...`,
          description: `Auto-generated from your question: "${content}"`,
          language: extractedCode.language,
          code: extractedCode.code,
          testCases: []
        };
        console.log('Setting new exercise:', newExercise);
        setCurrentExercise(newExercise);
        // Auto-open IDE if user mentioned code-related terms
        if (content.toLowerCase().includes('code') || content.toLowerCase().includes('write') || 
            content.toLowerCase().includes('function') || content.toLowerCase().includes('program')) {
          setShowIDE(true);
        }
      } else {
        console.log('No code extracted from AI response:', aiResponseText.substring(0, 200));
      }

      // Generate contextual video suggestions if enabled
      if (showVideoSuggestions) {
        const contextualSuggestions = generateContextualSuggestions(content);
        
        if (contextualSuggestions.length > 0) {
          setVideoSuggestions(contextualSuggestions);
          setIsVideosPanelOpen(true);
          console.log('Generated contextual video suggestions:', contextualSuggestions);
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      // Add fallback error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeExercise = (exercise: any) => {
    setCurrentExercise(exercise);
    setShowIDE(true);
  };

  // Generate contextual video suggestions based on user's specific question
  const generateContextualSuggestions = (userQuery: string): string[] => {
    const query = userQuery.toLowerCase();
    const suggestions: string[] = [];

    // Analyze the user's question for specific concepts
    if (query.includes('fibonacci')) {
      suggestions.push('Fibonacci Sequence Explained', 'Dynamic Programming with Fibonacci', 'Recursion vs Iteration Fibonacci');
    } else if (query.includes('sorting') || query.includes('sort')) {
      suggestions.push('Sorting Algorithms Comparison', 'Quick Sort Tutorial', 'Merge Sort Explained');
    } else if (query.includes('database') || query.includes('sql')) {
      suggestions.push('SQL Fundamentals', 'Database Design Principles', 'NoSQL vs SQL Databases');
    } else if (query.includes('api') || query.includes('rest')) {
      suggestions.push('RESTful API Design', 'API Security Best Practices', 'GraphQL vs REST APIs');
    } else if (query.includes('docker') || query.includes('container')) {
      suggestions.push('Docker Fundamentals', 'Container Orchestration', 'Docker vs Virtual Machines');
    } else if (query.includes('git') || query.includes('version control')) {
      suggestions.push('Git Workflow Tutorial', 'Git Branching Strategies', 'Git Merge vs Rebase');
    } else if (query.includes('machine learning') || query.includes('ml model')) {
      suggestions.push('Machine Learning Pipeline', 'Model Training Best Practices', 'ML Model Deployment');
    } else if (query.includes('mlops')) {
      suggestions.push('MLOps Best Practices', 'CI/CD for ML Models', 'ML Model Monitoring');
    } else if (query.includes('aiops')) {
      suggestions.push('AIOps Implementation Guide', 'AI-Driven IT Operations', 'AIOps vs Traditional Monitoring');
    } else if (query.includes('python')) {
      if (query.includes('function')) {
        suggestions.push('Python Functions Deep Dive', 'Python Lambda Functions', 'Python Decorators');
      } else if (query.includes('class') || query.includes('object')) {
        suggestions.push('Python OOP Concepts', 'Python Classes and Objects', 'Python Inheritance');
      } else {
        suggestions.push('Python Best Practices', 'Python Data Structures', 'Python Error Handling');
      }
    } else if (query.includes('javascript') || query.includes('js')) {
      if (query.includes('async') || query.includes('promise')) {
        suggestions.push('JavaScript Promises', 'Async/Await Tutorial', 'JavaScript Event Loop');
      } else if (query.includes('react')) {
        suggestions.push('React Hooks Tutorial', 'React State Management', 'React Component Patterns');
      } else {
        suggestions.push('JavaScript ES6 Features', 'JavaScript DOM Manipulation', 'JavaScript Closures');
      }
    } else if (query.includes('algorithm')) {
      suggestions.push('Algorithm Design Patterns', 'Time Complexity Analysis', 'Data Structures and Algorithms');
    } else if (query.includes('test') || query.includes('testing')) {
      suggestions.push('Unit Testing Best Practices', 'Test-Driven Development', 'Integration Testing');
    } else if (query.includes('deployment') || query.includes('deploy')) {
      suggestions.push('Application Deployment Strategies', 'CI/CD Pipeline Setup', 'Production Deployment Best Practices');
    } else if (query.includes('security')) {
      suggestions.push('Application Security Fundamentals', 'Secure Coding Practices', 'Authentication vs Authorization');
    } else if (query.includes('performance') || query.includes('optimization')) {
      suggestions.push('Code Optimization Techniques', 'Performance Monitoring', 'Database Query Optimization');
    } else {
      // Fallback: generic programming suggestions based on domain context
      if (query.includes('code') || query.includes('program') || query.includes('function')) {
        suggestions.push('Clean Code Principles', 'Code Review Best Practices', 'Programming Design Patterns');
      } else {
        suggestions.push('Software Development Fundamentals', 'Problem Solving in Programming', 'Technical Interview Preparation');
      }
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  };

  const extractCodeFromMessage = (content: string) => {
    console.log('Extracting code from:', content.substring(0, 300));
    
    // First try to extract code blocks from markdown format
    const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)```/g;
    let match;
    const matches = [];
    while ((match = codeBlockRegex.exec(content)) !== null) {
      matches.push(match);
    }
    
    if (matches.length > 0) {
      const language = matches[0][1] || 'python';
      const code = matches[0][2].trim();
      console.log('Found code block:', { language, code: code.substring(0, 100) });
      return { language, code };
    }

    // Look for Python function definitions
    const pythonDefMatch = content.match(/def\s+\w+\([^)]*\):\s*[\s\S]*?(?=\n\n|\n(?!\s)|$)/);
    if (pythonDefMatch) {
      console.log('Found Python function:', pythonDefMatch[0].substring(0, 100));
      return { language: 'python', code: pythonDefMatch[0].trim() };
    }

    // Look for JavaScript functions
    const jsFunctionMatch = content.match(/function\s+\w+\([^)]*\)\s*{[\s\S]*?}/);
    if (jsFunctionMatch) {
      console.log('Found JS function:', jsFunctionMatch[0].substring(0, 100));
      return { language: 'javascript', code: jsFunctionMatch[0].trim() };
    }

    // Look for any code-like patterns (indented blocks, semicolons, etc.)
    const lines = content.split('\n');
    let codeStartIndex = -1;
    let codeEndIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Look for common programming patterns
      if (line.includes('def ') || line.includes('function ') || 
          line.includes('class ') || line.includes('import ') ||
          line.includes('for ') || line.includes('if ') ||
          line.includes('return ') || line.includes('print(')) {
        if (codeStartIndex === -1) codeStartIndex = i;
        codeEndIndex = i;
      }
    }
    
    if (codeStartIndex !== -1 && codeEndIndex !== -1) {
      const codeLines = lines.slice(codeStartIndex, codeEndIndex + 1);
      const code = codeLines.join('\n').trim();
      
      // Detect language based on content
      let language = 'python';
      if (code.includes('function ') || code.includes('=>') || code.includes('console.log')) {
        language = 'javascript';
      } else if (code.includes('public static void main')) {
        language = 'java';
      }
      
      console.log('Found code pattern:', { language, code: code.substring(0, 100) });
      return { language, code };
    }
    
    console.log('No code found in content');
    return null;
  };

  const handleVideoSuggestions = (suggestions: string[]) => {
    setVideoSuggestions(suggestions);
    setIsVideosPanelOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ResizableSidebar activeSection="assistant" />
      
      <div 
        className="flex-1 transition-all duration-300 h-screen overflow-hidden" 
        style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
      >
        {/* Main Content Area */}
        <div className="flex h-full">
          {/* Chat + Controls Section */}
          <div className={cn(
            "flex flex-col transition-all duration-300",
            showIDE && !isCodePanelExpanded ? "w-1/2" : "flex-1"
          )}>
            {/* Enhanced Header with Controls */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-blue-600" />
                    AI Programming Tutor
                  </h2>
                  <p className="text-xs text-gray-500">Ask questions, get code examples, and practice coding</p>
                </div>
                {showIDE && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCodePanelExpanded(!isCodePanelExpanded)}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    {isCodePanelExpanded ? "Collapse" : "Expand"} IDE
                  </Button>
                )}
              </div>
              
              {/* Compact Control Panel */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                  <Brain className="h-3 w-3 text-purple-600" />
                  <Label htmlFor="rag-toggle" className="text-xs font-medium">Knowledge Base</Label>
                  <Switch
                    id="rag-toggle"
                    checked={useRAG}
                    onCheckedChange={setUseRAG}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                  <Video className="h-3 w-3 text-red-600" />
                  <Label htmlFor="video-toggle" className="text-xs font-medium">Videos</Label>
                  <Switch
                    id="video-toggle"
                    checked={showVideoSuggestions}
                    onCheckedChange={(checked) => {
                      setShowVideoSuggestions(checked);
                      if (!checked) setIsVideosPanelOpen(false);
                    }}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                  <Code className="h-3 w-3 text-green-600" />
                  <Label htmlFor="ide-toggle" className="text-xs font-medium">Code Editor</Label>
                  <Switch
                    id="ide-toggle"
                    checked={showIDE}
                    onCheckedChange={setShowIDE}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                  <Video className="h-3 w-3 text-blue-600" />
                  <Label htmlFor="video-source-toggle" className="text-xs font-medium">
                    {usePineconeVideosSource ? "Internal" : "YouTube"}
                  </Label>
                  <Switch
                    id="video-source-toggle"
                    checked={usePineconeVideosSource}
                    onCheckedChange={setUsePineconeVideosSource}
                    className="scale-75"
                  />
                </div>
              </div>
            </div>

            {/* Video Suggestions Button */}
            {videoSuggestions.length > 0 && !isVideosPanelOpen && showVideoSuggestions && (
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
                <Button
                  onClick={() => setIsVideosPanelOpen(true)}
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Video className="h-4 w-4 mr-2" />
                  View {videoSuggestions.length} Video Suggestions
                </Button>
              </div>
            )}



            {/* Chat Interface */}
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              onCodeExercise={handleCodeExercise}
              onVideoSuggestions={handleVideoSuggestions}
              isLoading={isLoading}
              className="flex-1 min-h-0"
            />
          </div>

          {/* Code Panel - Side by side or expanded */}
          {showIDE && (
            <div className={cn(
              "bg-white border-l border-gray-200 transition-all duration-300",
              isCodePanelExpanded ? "fixed inset-0 z-50 p-4" : "w-1/2 flex-shrink-0"
            )}>
              {isCodePanelExpanded && (
                <div className="absolute top-6 right-6 z-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCodePanelExpanded(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="h-full">
                <InlineIDE exercise={currentExercise} />
              </div>
            </div>
          )}

          {/* Video Suggestions Panel */}
          {showVideoSuggestions && isVideosPanelOpen && (
            <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200">
              <VideoSuggestionsPanel
                isOpen={isVideosPanelOpen}
                onClose={() => setIsVideosPanelOpen(false)}
                suggestions={videoSuggestions}
                usePinecone={usePineconeVideosSource}
              />
            </div>
          )}


        </div>
      </div>
    </div>
  );
}