import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Code, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    codeExercise?: {
      language: string;
      title: string;
      code: string;
      testCases: string[];
    };
    videoSuggestions?: string[];
  };
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onCodeExercise?: (exercise: any) => void;
  onVideoSuggestions?: (suggestions: string[]) => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatInterface({
  messages,
  onSendMessage,
  onCodeExercise,
  onVideoSuggestions,
  isLoading = false,
  className
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "flex items-start space-x-3 max-w-[80%]",
                message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.role === "user"
                    ? "bg-blue-500"
                    : "bg-gradient-to-r from-purple-500 to-blue-500"
                )}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1">
                <Card
                  className={cn(
                    "p-4",
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-50"
                  )}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                </Card>

                {/* Action Buttons for AI Messages */}
                {message.role === "assistant" && message.metadata && (
                  <div className="flex items-center space-x-2 mt-2">
                    {message.metadata.codeExercise && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCodeExercise?.(message.metadata!.codeExercise)}
                        className="text-xs"
                      >
                        <Code className="h-3 w-3 mr-1" />
                        Try Exercise
                      </Button>
                    )}
                    {message.metadata.videoSuggestions && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onVideoSuggestions?.(message.metadata!.videoSuggestions || [])}
                        className="text-xs"
                      >
                        <Video className="h-3 w-3 mr-1" />
                        Watch Videos
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Message */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <Card className="p-4 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="text-sm text-gray-500">AI is thinking...</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about programming..."
            className="flex-1 min-h-[60px] max-h-32 resize-none"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}