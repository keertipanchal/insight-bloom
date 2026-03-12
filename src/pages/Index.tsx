import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import TopicInput from "@/components/TopicInput";
import ExplanationDisplay from "@/components/ExplanationDisplay";
import QuizSection from "@/components/QuizSection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AppPhase = "input" | "explaining" | "explained" | "loading-quiz" | "quiz";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/learn`;

const Index = () => {
  const [phase, setPhase] = useState<AppPhase>("input");
  const [topic, setTopic] = useState("");
  const [explanation, setExplanation] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const generateExplanation = useCallback(async (selectedTopic: string) => {
    setTopic(selectedTopic);
    setExplanation("");
    setPhase("explaining");

    try {
      const resp = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ topic: selectedTopic, type: "explanation" }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Failed to generate explanation");
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setExplanation(fullText);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      setPhase("explained");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
      setPhase("input");
    }
  }, []);

  const generateQuiz = useCallback(async () => {
    setPhase("loading-quiz");
    try {
      const { data, error } = await supabase.functions.invoke("learn", {
        body: { topic, type: "quiz" },
      });
      if (error) throw error;
      if (!data?.questions?.length) throw new Error("No questions generated");
      setQuestions(data.questions);
      setPhase("quiz");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate quiz");
      setPhase("explained");
    }
  }, [topic]);

  const restart = () => {
    setPhase("input");
    setTopic("");
    setExplanation("");
    setQuestions([]);
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="max-w-5xl mx-auto pb-16">
        <TopicInput
          onSubmit={generateExplanation}
          isLoading={phase === "explaining"}
        />

        {(phase === "explaining" || phase === "explained") && (
          <ExplanationDisplay
            content={explanation}
            topic={topic}
            isStreaming={phase === "explaining"}
            onReadyForQuiz={generateQuiz}
          />
        )}

        {phase === "loading-quiz" && (
          <div className="flex flex-col items-center gap-4 py-16 animate-float-in">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="font-handwritten text-2xl text-muted-foreground">
              Crafting your quiz questions...
            </p>
          </div>
        )}

        {phase === "quiz" && (
          <QuizSection
            questions={questions}
            topic={topic}
            onRestart={restart}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
