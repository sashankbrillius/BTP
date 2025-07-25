import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { InlineIDE } from "./inline-ide";
import { ChatInterface } from "./chat-interface";
import { VideoSuggestions } from "./video-suggestions";
import { cn } from "@/lib/utils";
import {
  Brain,
  Code,
  Video,
  MessageSquare,
  X,
  Settings,
  Maximize2,
  Minimize2,
  RotateCcw,
  GripVertical,
  GripHorizontal
} from "lucide-react";

interface ResizableAssistantProps {
  useRAG: boolean;
  setUseRAG: (value: boolean) => void;
  showVideoSuggestions: boolean;
  setShowVideoSuggestions: (value: boolean) => void;
  showIDE: boolean;
  setShowIDE: (value: boolean) => void;
  usePineconeVideosSource: boolean;
  setUsePineconeVideosSource: (value: boolean) => void;
  isVideosPanelOpen: boolean;
  setIsVideosPanelOpen: (value: boolean) => void;
  currentExercise: any;
}

export function ResizableAssistant({
  useRAG,
  setUseRAG,
  showVideoSuggestions,
  setShowVideoSuggestions,
  showIDE,
  setShowIDE,
  usePineconeVideosSource,
  setUsePineconeVideosSource,
  isVideosPanelOpen,
  setIsVideosPanelOpen,
  currentExercise,
}: ResizableAssistantProps) {
  // Panel size states
  const [chatWidth, setChatWidth] = useState(50); // Percentage
  const [ideHeight, setIdeHeight] = useState(50); // Percentage when in vertical split
  const [videoWidth, setVideoWidth] = useState(30); // Percentage
  
  // Panel visibility and layout states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'horizontal' | 'vertical' | 'grid'>('horizontal');
  const [expandedPanel, setExpandedPanel] = useState<'chat' | 'ide' | 'video' | null>(null);
  
  // Resize handlers
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Mouse resize handlers
  const handleMouseDown = (panel: string) => {
    setIsResizing(panel);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !resizeRef.current) return;
    
    const container = resizeRef.current;
    const rect = container.getBoundingClientRect();
    
    if (isResizing === 'chat-ide') {
      const newChatWidth = ((e.clientX - rect.left) / rect.width) * 100;
      setChatWidth(Math.max(20, Math.min(80, newChatWidth)));
    } else if (isResizing === 'chat-video') {
      const newVideoWidth = ((rect.right - e.clientX) / rect.width) * 100;
      setVideoWidth(Math.max(20, Math.min(60, newVideoWidth)));
    } else if (isResizing === 'ide-vertical') {
      const newIdeHeight = ((e.clientY - rect.top) / rect.height) * 100;
      setIdeHeight(Math.max(20, Math.min(80, newIdeHeight)));
    }
  };

  const handleMouseUp = () => {
    setIsResizing(null);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  // Panel expansion handlers
  const togglePanelExpansion = (panel: 'chat' | 'ide' | 'video') => {
    setExpandedPanel(expandedPanel === panel ? null : panel);
  };

  // Reset layout to defaults
  const resetLayout = () => {
    setChatWidth(50);
    setIdeHeight(50);
    setVideoWidth(30);
    setExpandedPanel(null);
    setLayoutMode('horizontal');
  };

  // Get active panels count
  const activePanels = [
    true, // Chat always active
    showIDE,
    showVideoSuggestions && isVideosPanelOpen
  ].filter(Boolean).length;

  return (
    <div ref={resizeRef} className="h-full flex flex-col">
      {/* Sticky Control Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-blue-600" />
              AI Programming Tutor
            </h2>
            <p className="text-xs text-gray-500">
              {activePanels} panel{activePanels !== 1 ? 's' : ''} active • {layoutMode} layout
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Layout Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLayoutMode(layoutMode === 'horizontal' ? 'vertical' : 'horizontal')}
              title="Toggle Layout"
            >
              {layoutMode === 'horizontal' ? <GripVertical className="h-4 w-4" /> : <GripHorizontal className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetLayout}
              title="Reset Layout"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Compact Toggle Controls */}
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

        {/* Advanced Settings Panel */}
        {isSettingsOpen && (
          <div className="mt-3 p-3 border rounded-lg bg-gray-50 space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Chat Width</Label>
                <Input
                  type="range"
                  min="20"
                  max="80"
                  value={chatWidth}
                  onChange={(e) => setChatWidth(parseInt(e.target.value))}
                  className="mt-1"
                />
                <div className="text-xs text-gray-500">{chatWidth}%</div>
              </div>
              <div>
                <Label className="text-xs">IDE Height</Label>
                <Input
                  type="range"
                  min="20"
                  max="80"
                  value={ideHeight}
                  onChange={(e) => setIdeHeight(parseInt(e.target.value))}
                  className="mt-1"
                />
                <div className="text-xs text-gray-500">{ideHeight}%</div>
              </div>
              <div>
                <Label className="text-xs">Video Width</Label>
                <Input
                  type="range"
                  min="20"
                  max="60"
                  value={videoWidth}
                  onChange={(e) => setVideoWidth(parseInt(e.target.value))}
                  className="mt-1"
                />
                <div className="text-xs text-gray-500">{videoWidth}%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area with Resizable Panels */}
      <div className="flex-1 flex relative min-h-0">
        {/* Chat Panel */}
        <div 
          className={cn(
            "flex flex-col transition-all duration-200",
            expandedPanel === 'chat' ? 'w-full' : 
            expandedPanel && expandedPanel !== 'chat' ? 'w-0 overflow-hidden' :
            layoutMode === 'horizontal' && showIDE ? `w-[${chatWidth}%]` :
            showVideoSuggestions && isVideosPanelOpen ? `w-[${100 - videoWidth}%]` :
            'flex-1'
          )}
        >
          {/* Chat Header */}
          <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">Chat Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePanelExpansion('chat')}
            >
              {expandedPanel === 'chat' ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Chat Interface */}
          <div className="flex-1 min-h-0">
            <ChatInterface
              useRAG={useRAG}
              usePineconeVideosSource={usePineconeVideosSource}
              showVideoSuggestions={showVideoSuggestions}
              setIsVideosPanelOpen={setIsVideosPanelOpen}
              className="h-full"
            />
          </div>
        </div>

        {/* Horizontal Resize Handle between Chat and IDE */}
        {showIDE && layoutMode === 'horizontal' && !expandedPanel && (
          <div
            className="w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize relative group"
            onMouseDown={() => handleMouseDown('chat-ide')}
          >
            <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-200 opacity-0 group-hover:opacity-50" />
          </div>
        )}

        {/* IDE Panel */}
        {showIDE && (
          <div 
            className={cn(
              "flex flex-col transition-all duration-200",
              expandedPanel === 'ide' ? 'w-full' :
              expandedPanel && expandedPanel !== 'ide' ? 'w-0 overflow-hidden' :
              layoutMode === 'horizontal' ? `w-[${100 - chatWidth}%]` :
              'w-full'
            )}
          >
            {/* IDE Header */}
            <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">Code Editor</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePanelExpansion('ide')}
                >
                  {expandedPanel === 'ide' ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowIDE(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* IDE Content */}
            <div className="flex-1 min-h-0">
              <InlineIDE exercise={currentExercise} />
            </div>
          </div>
        )}

        {/* Horizontal Resize Handle between Chat and Video */}
        {showVideoSuggestions && isVideosPanelOpen && !showIDE && !expandedPanel && (
          <div
            className="w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize relative group"
            onMouseDown={() => handleMouseDown('chat-video')}
          >
            <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-200 opacity-0 group-hover:opacity-50" />
          </div>
        )}

        {/* Video Panel */}
        {showVideoSuggestions && isVideosPanelOpen && (
          <div 
            className={cn(
              "flex flex-col border-l border-gray-200 transition-all duration-200",
              expandedPanel === 'video' ? 'w-full' :
              expandedPanel && expandedPanel !== 'video' ? 'w-0 overflow-hidden' :
              `w-[${videoWidth}%]`
            )}
          >
            {/* Video Header */}
            <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="h-4 w-4 text-red-600" />
                <span className="font-medium text-sm">Video Suggestions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePanelExpansion('video')}
                >
                  {expandedPanel === 'video' ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVideosPanelOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Video Content */}
            <div className="flex-1 min-h-0">
              <VideoSuggestions usePineconeVideosSource={usePineconeVideosSource} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}