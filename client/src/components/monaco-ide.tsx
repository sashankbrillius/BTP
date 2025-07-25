import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Code, CheckCircle, XCircle, Loader2, Settings, Terminal, FileCode, Save, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CodeExercise {
  language: string;
  title: string;
  code: string;
  testCases?: string[];
}

interface MonacoIDEProps {
  exercise?: CodeExercise | null;
  height?: string;
  className?: string;
  showAdvancedFeatures?: boolean;
}

export function MonacoIDE({ exercise, height = "600px", className, showAdvancedFeatures = true }: MonacoIDEProps) {
  const [code, setCode] = useState(exercise?.code || getDefaultCode("javascript"));
  const [language, setLanguage] = useState(exercise?.language || "javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [showOutput, setShowOutput] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(false);
  const [minimap, setMinimap] = useState(true);
  const { toast } = useToast();
  const editorRef = useRef<any>(null);

  function getDefaultCode(lang: string): string {
    switch (lang) {
      case "python":
        return `# Python Code Editor
def hello_world():
    print("Hello, World!")
    return "Hello from Python!"

# Call the function
result = hello_world()
print(f"Result: {result}")`;
      case "java":
        return `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        String result = helloWorld();
        System.out.println("Result: " + result);
    }
    
    public static String helloWorld() {
        return "Hello from Java!";
    }
}`;
      case "cpp":
        return `#include <iostream>
#include <string>
using namespace std;

string helloWorld() {
    return "Hello from C++!";
}

int main() {
    cout << "Hello, World!" << endl;
    string result = helloWorld();
    cout << "Result: " << result << endl;
    return 0;
}`;
      case "go":
        return `package main

import "fmt"

func helloWorld() string {
    return "Hello from Go!"
}

func main() {
    fmt.Println("Hello, World!")
    result := helloWorld()
    fmt.Printf("Result: %s\\n", result)
}`;
      case "typescript":
        return `// TypeScript Code Editor
function helloWorld(): string {
    console.log("Hello, World!");
    return "Hello from TypeScript!";
}

// Call the function
const result = helloWorld();
console.log(\`Result: \${result}\`);`;
      default: // javascript
        return `// JavaScript Code Editor
function helloWorld() {
    console.log("Hello, World!");
    return "Hello from JavaScript!";
}

// Call the function
const result = helloWorld();
console.log(\`Result: \${result}\`);`;
    }
  }

  // Update code when exercise changes
  useEffect(() => {
    if (exercise?.code) {
      setCode(exercise.code);
      setLanguage(exercise.language);
    } else {
      setCode(getDefaultCode(language));
    }
  }, [exercise]);

  // Only update to default when language changes manually (not from exercise)
  useEffect(() => {
    if (!exercise?.code) {
      setCode(getDefaultCode(language));
    }
  }, [language]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Add custom key bindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      toast({
        title: "Saved",
        description: "Code saved to local storage",
      });
      localStorage.setItem(`brillius-code-${language}`, code);
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });

    // Configure editor features
    monaco.editor.defineTheme('brillius-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264f78',
        'editor.lineHighlightBackground': '#2a2d2e',
      }
    });

    monaco.editor.setTheme('brillius-dark');
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code first",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setOutput("");
    setTestResults([]);
    setShowOutput(true);

    try {
      const response = await fetch("/api/assistant/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          language,
          code,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        setOutput(`Error: ${data.error}`);
        toast({
          title: "Execution Error",
          description: "Check the output panel for details",
          variant: "destructive",
        });
      } else {
        setOutput(data.output || "Code executed successfully (no output)");
        toast({
          title: "Success",
          description: "Code executed successfully",
        });
      }
      
      if (data.testResults) {
        setTestResults(data.testResults);
      }
    } catch (error) {
      console.error("Code execution error:", error);
      setOutput(`Error executing code: ${(error as Error).message}`);
      toast({
        title: "Error",
        description: "Failed to execute code",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveCode = () => {
    localStorage.setItem(`brillius-code-${language}`, code);
    toast({
      title: "Saved",
      description: "Code saved to local storage",
    });
  };

  const handleLoadCode = () => {
    const savedCode = localStorage.getItem(`brillius-code-${language}`);
    if (savedCode) {
      setCode(savedCode);
      toast({
        title: "Loaded",
        description: "Code loaded from local storage",
      });
    } else {
      toast({
        title: "No saved code",
        description: "No saved code found for this language",
      });
    }
  };

  const handleDownloadCode = () => {
    const extension = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      go: 'go'
    }[language] || 'txt';

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: `Code downloaded as code.${extension}`,
    });
  };

  const getLanguageVersion = (lang: string) => {
    switch (lang) {
      case "python": return "Python 3.9";
      case "javascript": return "Node.js 18";
      case "typescript": return "TypeScript 4.9";
      case "java": return "Java 17";
      case "cpp": return "C++ 17";
      case "go": return "Go 1.19";
      default: return "Latest";
    }
  };

  const availableThemes = [
    { value: "vs-dark", label: "Dark (Visual Studio)" },
    { value: "vs", label: "Light (Visual Studio)" },
    { value: "hc-black", label: "High Contrast Dark" },
    { value: "brillius-dark", label: "Brillius Dark" },
  ];

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <FileCode className="h-5 w-5 mr-2" />
            {exercise?.title || "VSCode-like IDE"}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="go">Go</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-xs">
              {getLanguageVersion(language)}
            </Badge>
            {showAdvancedFeatures && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Settings Panel */}
        {showSettings && showAdvancedFeatures && (
          <div className="mt-3 p-3 border rounded-lg bg-gray-50 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableThemes.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Font Size</label>
                <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 12, 14, 16, 18, 20, 24].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={wordWrap}
                    onChange={(e) => setWordWrap(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Word Wrap</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={minimap}
                    onChange={(e) => setMinimap(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Minimap</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mt-3">
          <Button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Code
          </Button>
          <Button
            onClick={() => setShowOutput(!showOutput)}
            variant="outline"
            size="sm"
          >
            <Terminal className="h-4 w-4 mr-2" />
            {showOutput ? "Hide" : "Show"} Output
          </Button>
          {showAdvancedFeatures && (
            <>
              <Button onClick={handleSaveCode} variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleLoadCode} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Load
              </Button>
              <Button onClick={handleDownloadCode} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 min-h-0 p-0">
        {/* Monaco Editor */}
        <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
          <Editor
            height={height}
            language={language}
            value={code}
            theme={theme}
            onChange={(value) => setCode(value || "")}
            onMount={handleEditorDidMount}
            options={{
              fontSize,
              wordWrap: wordWrap ? "on" : "off",
              minimap: { enabled: minimap },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: "line",
              formatOnPaste: true,
              formatOnType: true,
              autoIndent: "full",
              contextmenu: true,
              mouseWheelZoom: true,
              multiCursorModifier: "ctrlCmd",
              accessibilitySupport: "on",
              quickSuggestions: true,
              parameterHints: { enabled: true },
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: "on",
              tabCompletion: "on",
              suggestSelection: "first",
              wordBasedSuggestions: "allDocuments",
              // Enable advanced features
              folding: true,
              foldingHighlight: true,
              unfoldOnClickAfterEndOfLine: true,
              showFoldingControls: "mouseover",
              foldingStrategy: "indentation",
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true,
              },
              rulers: [],
              renderLineHighlight: "all",
              selectionHighlight: true,
              occurrencesHighlight: "singleFile",
              codeLens: true,
              lightbulb: { enabled: true },
            }}
          />
        </div>

        {/* Output Panel */}
        {showOutput && (
          <div className="flex-shrink-0 border rounded-lg overflow-hidden">
            <Card className="m-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Terminal className="h-4 w-4 mr-2" />
                  Output
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-black text-green-400 font-mono text-sm p-3 rounded max-h-48 overflow-y-auto">
                  {output ? (
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <div className="text-gray-500">Click "Run Code" to see output...</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="flex-shrink-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Test Results</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                    >
                      <div className="flex-1">
                        <div className="text-xs text-gray-600">
                          Test {result.testCase}: {result.input}
                        </div>
                        <div className="text-xs">
                          Expected: <span className="font-mono">{result.expected}</span>
                        </div>
                        <div className="text-xs">
                          Got: <span className="font-mono">{result.actual}</span>
                        </div>
                      </div>
                      <div className="ml-2">
                        {result.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </div>
  );
}