import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Video, Code, X, Settings } from "lucide-react";
import { ChatInterface, type ChatMessage } from "@/components/chat-interface";
import { InlineIDE } from "@/components/inline-ide";
import { VideoSuggestionsPanel } from "@/components/video-suggestions-panel";
import { cn } from "@/lib/utils";
import { generateAIResponse } from "@/lib/ai-responses";
import Sidebar from '@/components/Sidebar';
import "../theme.css";

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI programming tutor. I can help you learn programming concepts, solve coding problems, and suggest relevant video tutorials. What would you like to learn today?",
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
      // Generate AI response using RAG or direct LLM based on toggle
      const aiResponse = await generateAIResponse(content, useRAG);
      setMessages(prev => [...prev, aiResponse]);
      
      // Update current code exercise if one was provided
      if (aiResponse.metadata?.codeExercise) {
        setCurrentExercise(aiResponse.metadata.codeExercise);
        setShowIDE(true); // Auto-show IDE when code exercise is provided
      }

      // Update video suggestions only if feature is enabled
      if (showVideoSuggestions && aiResponse.metadata?.videoSuggestions) {
        setVideoSuggestions(aiResponse.metadata.videoSuggestions);
        setIsVideosPanelOpen(true);
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

  const handleVideoSuggestions = (suggestions: string[]) => {
    setVideoSuggestions(suggestions);
    setIsVideosPanelOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeSection="assistant" />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="h-8 w-8 text-blue-500" />
                    <div>
                      <CardTitle className="text-2xl text-gray-900">AI Assistant</CardTitle>
                      <CardDescription>Advanced programming tutor with knowledge base</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Controls Panel */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <HelpCircle className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Knowledge Base</span>
                      </div>
                      <Switch
                        checked={knowledgeBase}
                        onCheckedChange={setKnowledgeBase}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Enhanced responses</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Youtube className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Videos</span>
                      </div>
                      <Switch
                        checked={videos}
                        onCheckedChange={setVideos}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Auto-suggest</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Code className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">IDE</span>
                      </div>
                      <Switch
                        checked={ide}
                        onCheckedChange={(checked) => {
                          setIDE(checked);
                          setShowCodePanel(checked);
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Code editor visible</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Video className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Video Source</span>
                      </div>
                      <div className="flex space-x-1">
                        <Badge 
                          variant={videoSource === 'youtube' ? 'default' : 'outline'}
                          className="text-xs cursor-pointer"
                          onClick={() => setVideoSource('youtube')}
                        >
                          YouTube
                        </Badge>
                        <Badge 
                          variant={videoSource === 'pinecone' ? 'default' : 'outline'}
                          className="text-xs cursor-pointer"
                          onClick={() => setVideoSource('pinecone')}
                        >
                          Pinecone
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">YouTube</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Area */}
            <div className={`grid gap-6 ${showCodePanel ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {/* Chat Interface */}
              <Card className="h-[600px] flex flex-col">
                <CardContent className="flex-1 flex flex-col p-6">
                  {/* Chat Messages */}
                  <div className="flex-1 space-y-4 overflow-y-auto mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-lg p-4">
                        <p className="text-gray-900">
                          Hello! I'm your AI programming tutor. I can help you learn programming concepts, 
                          solve coding problems, and suggest relevant video tutorials. What would you like to learn today?
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Input Area */}
                  <div className="border-t pt-4">
                    <div className="flex space-x-3">
                      <Textarea
                        placeholder="Ask me anything about programming..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 min-h-[60px] resize-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendQuery();
                          }
                        }}
                      />
                      <Button 
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={handleSendQuery}
                        disabled={!query.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Code Panel */}
              {showCodePanel && (
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Interactive Code Editor</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Play className="h-4 w-4 mr-1" />
                          Run
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-6 pt-0">
                    {/* Code Editor */}
                    <div className="flex-1 bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400">
                      <div className="text-gray-400 mb-2">// Welcome to the Interactive Code Editor!</div>
                      <div className="text-gray-400 mb-2">// Type your code here and press Run to execute</div>
                      <div className="text-white mt-4">
                        console.log("Hello, World!");
                      </div>
                      <div className="text-gray-400 mt-4">// Try asking the AI for coding examples</div>
                    </div>
                    
                    {/* Output Panel */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Output</span>
                        <span className="text-xs text-gray-500">Press Ctrl+Enter to run</span>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-4 h-20">
                        <div className="text-gray-400 text-sm">Click "Run Code" to see output...</div>
                      </div>
                    </div>

                    {/* Standard Input */}
                    <div className="mt-4">
                      <div className="flex items-center mb-2">
                        <Monitor className="h-4 w-4 text-purple-500 mr-2" />
                        <span className="text-sm font-medium">Standard Input</span>
                      </div>
                      <Textarea
                        placeholder="Enter input for your program..."
                        className="h-16 resize-none text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}