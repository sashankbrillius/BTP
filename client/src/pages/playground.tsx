import { MonacoIDE } from "@/components/monaco-ide";
import ResizableSidebar from '@/components/ResizableSidebar';
import "../theme.css";

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ResizableSidebar activeSection="playground" />
      
      <div 
        className="flex-1 transition-all duration-300 p-6" 
        style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Code Playground</h1>
          <p className="text-gray-600">
            Write, test, and experiment with code in multiple programming languages.
            Features include syntax highlighting, auto-completion, and live code execution.
          </p>
        </div>

        <div className="h-[calc(100vh-200px)]">
          <MonacoIDE 
            height="100%"
            showAdvancedFeatures={true}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}