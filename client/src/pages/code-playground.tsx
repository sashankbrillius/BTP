import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Play,
  Square,
  RotateCcw,
  Copy,
  Download,
  ChevronDown
} from "lucide-react";
import Sidebar from '@/components/Sidebar';
import "../theme.css";

export default function CodePlaygroundPage() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(`// Write your code here
console.log('Hello, World!');`);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' }
  ];

  const runCode = async () => {
    setIsRunning(true);
    // Simulate code execution
    setTimeout(() => {
      setOutput('Code executed successfully!\nOutput: Hello, World!');
      setIsRunning(false);
    }, 2000);
  };

  const resetCode = () => {
    setCode(`// Write your code here
console.log('Hello, World!');`);
    setOutput('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeSection="code-playground" />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 text-blue-500" />
                    <div>
                      <CardTitle className="text-2xl text-gray-900">Code Playground</CardTitle>
                      <CardDescription>Practice coding with multi-language support</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Code Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Code Editor</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={resetCode}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                      <Button 
                        onClick={runCode}
                        disabled={isRunning}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isRunning ? (
                          <Square className="h-4 w-4 mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {isRunning ? 'Running...' : 'Run Code'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="min-h-96 font-mono text-sm"
                    placeholder="Write your code here..."
                  />
                </CardContent>
              </Card>

              {/* Output */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Output</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg min-h-96 font-mono text-sm whitespace-pre-wrap">
                    {output || 'Run your code to see the output here...'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Examples</CardTitle>
                <CardDescription>Click on any example to load it in the editor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="p-4 h-auto flex-col items-start"
                    onClick={() => setCode('// Hello World\nconsole.log("Hello, World!");')}
                  >
                    <div className="font-semibold">Hello World</div>
                    <div className="text-xs text-gray-500">Basic output example</div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="p-4 h-auto flex-col items-start"
                    onClick={() => setCode('// Array Operations\nconst arr = [1, 2, 3, 4, 5];\nconsole.log(arr.map(x => x * 2));')}
                  >
                    <div className="font-semibold">Array Operations</div>
                    <div className="text-xs text-gray-500">Working with arrays</div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="p-4 h-auto flex-col items-start"
                    onClick={() => setCode('// Function Example\nfunction factorial(n) {\n  return n <= 1 ? 1 : n * factorial(n - 1);\n}\nconsole.log(factorial(5));')}
                  >
                    <div className="font-semibold">Functions</div>
                    <div className="text-xs text-gray-500">Recursive factorial</div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}