import { ChatBubbleLeftRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface ConversationStartersProps {
  onStarterClick: (starter: string) => void;
}

export function ConversationStarters({ onStarterClick }: ConversationStartersProps) {
  const starters = [
    {
      category: "Trail Discovery",
      icon: "🔍",
      suggestions: [
        "Find beginner-friendly hikes with waterfalls near San Francisco",
        "I want a challenging 2-day backpacking trip in the Pacific Northwest",
        "Show me family-friendly trails with minimal elevation gain"
      ]
    },
    {
      category: "Trip Planning",
      icon: "📅",
      suggestions: [
        "Plan a 3-day camping trip to Yosemite for next month",
        "I need help planning a solo hike in Joshua Tree",
        "Create an itinerary for hiking the John Muir Trail"
      ]
    },
    {
      category: "Gear & Safety",
      icon: "🎒",
      suggestions: [
        "What gear do I need for winter hiking?",
        "Help me pack for a 5-day backpacking trip",
        "What are the Ten Essentials for day hiking?"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <SparklesIcon className="w-5 h-5 text-white/70" />
          <h3 className="text-white/90 font-medium">Try asking me about...</h3>
          <SparklesIcon className="w-5 h-5 text-white/70" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {starters.map((category, categoryIndex) => (
          <div key={categoryIndex} className="glass-dark rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg">{category.icon}</span>
              <h4 className="text-white font-medium text-sm">{category.category}</h4>
            </div>
            
            <div className="space-y-2">
              {category.suggestions.map((suggestion, suggestionIndex) => (
                <button
                  key={suggestionIndex}
                  onClick={() => onStarterClick(suggestion)}
                  className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/80 hover:text-white text-xs leading-relaxed group"
                >
                  <div className="flex items-start space-x-2">
                    <ChatBubbleLeftRightIcon className="w-3 h-3 mt-0.5 text-white/50 group-hover:text-white/70 flex-shrink-0" />
                    <span>"{suggestion}"</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add default export to ensure compatibility
export default ConversationStarters;
