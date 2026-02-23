interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const suggestedQuestions = [
  "What programs does BBUC offer?",
  "How do I apply for Trinity intake?",
  "Where is the ICT lab located?",
  "What are the admission requirements?",
];

export const SuggestedQuestions = ({ onSelect }: SuggestedQuestionsProps) => {
  return (
    <div className="py-3 border-t border-border">
      <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
      <div className="flex flex-wrap gap-2">
        {suggestedQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};
