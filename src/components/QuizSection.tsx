import { useState } from "react";
import { CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface QuizSectionProps {
  questions: QuizQuestion[];
  topic: string;
  onRestart: () => void;
}

const QuizSection = ({ questions, topic, onRestart }: QuizSectionProps) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIndex: number, oIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }));
  };

  const handleSubmit = () => setSubmitted(true);

  const score = submitted
    ? questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0)
    : 0;

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-8 animate-float-in">
      <div className="bg-card rounded-3xl border border-border shadow-elevated p-8 md:p-12 gradient-card">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-handwritten text-foreground mb-2">
            Quiz Time! 📝
          </h2>
          <p className="font-serif text-muted-foreground italic">
            Test your knowledge on {topic}
          </p>
        </div>

        {submitted && (
          <div className="text-center mb-8 p-6 rounded-2xl bg-secondary animate-float-in">
            <Trophy className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-5xl font-handwritten text-foreground mb-1">{score}/{questions.length}</p>
            <p className="font-serif text-muted-foreground">
              {score === questions.length ? "Perfect score! Amazing! 🎉" :
               score >= 7 ? "Great job! Well done! 🌟" :
               score >= 5 ? "Good effort! Keep learning! 💪" :
               "Keep studying, you'll get there! 📚"}
            </p>
          </div>
        )}

        <div className="space-y-8">
          {questions.map((q, qIndex) => {
            const userAnswer = answers[qIndex];
            const isCorrect = submitted && userAnswer === q.correctIndex;
            const isWrong = submitted && userAnswer !== undefined && userAnswer !== q.correctIndex;

            return (
              <div
                key={qIndex}
                className="animate-float-in"
                style={{ animationDelay: `${qIndex * 0.05}s` }}
              >
                <p className="font-serif text-lg text-foreground mb-3">
                  <span className="font-handwritten text-2xl text-primary mr-2">{qIndex + 1}.</span>
                  {q.question}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.options.map((option, oIndex) => {
                    const isSelected = userAnswer === oIndex;
                    const isCorrectOption = submitted && oIndex === q.correctIndex;
                    const isWrongSelection = submitted && isSelected && oIndex !== q.correctIndex;

                    let optionClasses = "w-full text-left px-4 py-3 rounded-xl border-2 font-body text-sm transition-all duration-200 ";
                    if (isCorrectOption) {
                      optionClasses += "border-correct bg-correct/10 text-foreground";
                    } else if (isWrongSelection) {
                      optionClasses += "border-wrong bg-wrong/10 text-foreground";
                    } else if (isSelected && !submitted) {
                      optionClasses += "border-primary bg-primary/10 text-foreground";
                    } else {
                      optionClasses += "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5";
                    }

                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleSelect(qIndex, oIndex)}
                        disabled={submitted}
                        className={optionClasses}
                      >
                        <span className="flex items-center gap-2">
                          {isCorrectOption && <CheckCircle2 className="w-4 h-4 text-correct flex-shrink-0" />}
                          {isWrongSelection && <XCircle className="w-4 h-4 text-wrong flex-shrink-0" />}
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {submitted && isWrong && (
                  <p className="mt-2 text-sm font-serif text-muted-foreground">
                    Correct answer: <span className="text-correct font-semibold">{q.options[q.correctIndex]}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-3">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-handwritten text-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-soft disabled:opacity-40"
            >
              Submit Answers
            </button>
          ) : (
            <button
              onClick={onRestart}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-handwritten text-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-soft"
            >
              <RotateCcw className="w-5 h-5" />
              Learn Something New
            </button>
          )}
          {!submitted && !allAnswered && (
            <p className="text-sm font-serif text-muted-foreground italic">
              Answer all {questions.length} questions to submit
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default QuizSection;
