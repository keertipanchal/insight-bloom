import { useMemo } from "react";
import { BookOpen } from "lucide-react";

interface ExplanationDisplayProps {
  content: string;
  topic: string;
  isStreaming: boolean;
  onReadyForQuiz: () => void;
}

const ExplanationDisplay = ({ content, topic, isStreaming, onReadyForQuiz }: ExplanationDisplayProps) => {
  const renderedContent = useMemo(() => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="text-3xl md:text-4xl font-handwritten text-foreground mt-8 mb-3">
            {line.replace("## ", "")}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={i} className="text-2xl font-handwritten text-foreground mt-6 mb-2">
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={i} className="ml-6 font-serif text-foreground/90 text-lg leading-relaxed list-disc">
            {renderInlineFormatting(line.replace("- ", ""))}
          </li>
        );
      }
      if (line.trim() === "") return <div key={i} className="h-3" />;
      return (
        <p key={i} className="font-serif text-foreground/90 text-lg leading-relaxed mb-3">
          {renderInlineFormatting(line)}
        </p>
      );
    });
  }, [content]);

  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-8 animate-float-in">
      <div className="bg-card rounded-3xl border border-border shadow-elevated p-8 md:p-12 gradient-card">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <BookOpen className="w-6 h-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-handwritten text-foreground">
            {topic}
          </h2>
        </div>

        <div className="prose-custom">
          {renderedContent}
          {isStreaming && (
            <span className="inline-block w-2 h-5 bg-primary rounded-sm animate-pulse-soft ml-1" />
          )}
        </div>

        {!isStreaming && content && (
          <div className="mt-10 pt-6 border-t border-border text-center animate-float-in">
            <p className="font-serif text-muted-foreground italic mb-4">
              Finished reading? Test your knowledge!
            </p>
            <button
              onClick={onReadyForQuiz}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-handwritten text-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-soft"
            >
              Done Reading — Ready for Quiz ✨
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default ExplanationDisplay;
