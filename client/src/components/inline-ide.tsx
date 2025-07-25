import { MonacoIDE } from "./monaco-ide";

interface CodeExercise {
  language: string;
  title: string;
  code: string;
  testCases?: string[];
}

interface InlineIDEProps {
  exercise?: CodeExercise | null;
}

export function InlineIDE({ exercise }: InlineIDEProps) {

  return (
    <div className="h-full">
      <MonacoIDE 
        exercise={exercise} 
        height="100%"
        showAdvancedFeatures={false}
        className="h-full"
      />
    </div>
  );
}