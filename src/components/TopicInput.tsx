import { useState } from "react";
import { Search, Sparkles } from "lucide-react";

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

const TopicInput = ({ onSubmit, isLoading }: TopicInputProps) => {
  const [topic, setTopic] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) onSubmit(topic.trim());
  };

  return (
    <section className="w-full max-w-3xl mx-auto px-4 pt-16 pb-8">
      <div className="text-center mb-10 animate-float-in">
        <h1 className="text-5xl md:text-7xl font-handwritten text-foreground mb-3 tracking-wide">
          Learn Anything
        </h1>
        <p className="font-serif text-lg md:text-xl text-muted-foreground italic">
          Type a topic and let AI craft a beautiful explanation just for you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="animate-float-in" style={{ animationDelay: "0.2s" }}>
        <div className="relative group">
          <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50" />
          <div className="relative flex items-center gap-3 bg-card border-2 border-border rounded-2xl px-5 py-4 shadow-soft focus-within:border-primary/50 focus-within:shadow-elevated transition-all duration-300">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic you want to learn..."
              className="flex-1 bg-transparent outline-none font-serif text-lg text-foreground placeholder:text-muted-foreground/60"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!topic.trim() || isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-handwritten text-lg hover:opacity-90 disabled:opacity-40 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? "Generating..." : "Generate Explanation"}
            </button>
          </div>
        </div>
      </form>

      <div className="flex flex-wrap justify-center gap-2 mt-6 animate-float-in" style={{ animationDelay: "0.4s" }}>
        {["Artificial Intelligence", "Climate Change", "History of India", "Quantum Physics", "Space Exploration"].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => { setTopic(suggestion); onSubmit(suggestion); }}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground font-body text-sm hover:bg-primary/10 hover:scale-105 transition-all duration-200 disabled:opacity-40"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </section>
  );
};

export default TopicInput;
