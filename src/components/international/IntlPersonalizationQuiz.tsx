import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, Brain, Heart, Zap, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const questions = [
  {
    id: 'goal',
    question: 'What brings you here?',
    options: [
      { value: 'stress', label: 'Stress Relief', icon: Brain, desc: 'I need a mental reset' },
      { value: 'spiritual', label: 'Spiritual Growth', icon: Heart, desc: 'Deeper connection with self' },
      { value: 'health', label: 'Physical Wellness', icon: Zap, desc: 'Yoga, detox, vitality' },
      { value: 'curious', label: 'Curious Explorer', icon: Sun, desc: 'Open to anything new' },
    ],
  },
  {
    id: 'duration',
    question: 'How long can you stay?',
    options: [
      { value: '3days', label: '3–5 Days', icon: Sun, desc: 'Weekend getaway' },
      { value: '1week', label: '1 Week', icon: Moon, desc: 'Deep immersion' },
      { value: '2weeks', label: '2+ Weeks', icon: Sparkles, desc: 'Full transformation' },
      { value: 'flexible', label: 'Flexible', icon: Heart, desc: 'Let the journey decide' },
    ],
  },
  {
    id: 'experience',
    question: 'Your meditation experience?',
    options: [
      { value: 'none', label: 'Complete Beginner', icon: Sparkles, desc: 'Never tried before' },
      { value: 'some', label: 'Some Experience', icon: Brain, desc: 'Used apps or classes' },
      { value: 'regular', label: 'Regular Practice', icon: Heart, desc: 'Daily meditator' },
      { value: 'advanced', label: 'Advanced', icon: Zap, desc: 'Looking to go deeper' },
    ],
  },
  {
    id: 'comfort',
    question: 'Your comfort preference?',
    options: [
      { value: 'premium', label: 'Premium Comfort', icon: Sun, desc: 'Private room, AC, modern' },
      { value: 'standard', label: 'Standard', icon: Heart, desc: 'Clean, comfortable, shared' },
      { value: 'simple', label: 'Simple Living', icon: Moon, desc: 'Basic is perfect for me' },
      { value: 'nopreference', label: 'No Preference', icon: Sparkles, desc: 'Whatever works' },
    ],
  },
];

const recommendations: Record<string, { title: string; duration: string; price: string; desc: string }> = {
  stress: { title: 'Happiness Program', duration: '3 Days', price: '$200', desc: 'Learn Sudarshan Kriya, the powerful breathwork that melts stress away' },
  spiritual: { title: 'Silence Retreat', duration: '3–5 Days', price: '$350', desc: 'Deep guided meditation in sacred silence for inner exploration' },
  health: { title: 'Sri Sri Yoga Retreat', duration: '5 Days', price: '$300', desc: 'Traditional yoga with pranayama and Ayurvedic wellness' },
  curious: { title: 'Ashram Experience Package', duration: '3 Days', price: '$150', desc: 'Perfect first-time immersion into ashram life' },
};

export function IntlPersonalizationQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (value: string) => {
    const q = questions[step];
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      setTimeout(() => setShowResult(true), 300);
    }
  };

  const rec = recommendations[answers.goal] || recommendations.curious;

  return (
    <section id="personalization-quiz" className="py-20 bg-card">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Find Your <span className="text-primary">Perfect Journey</span>
          </h2>
          <p className="text-muted-foreground text-lg">Answer 4 quick questions and we'll recommend the ideal experience for you</p>
        </motion.div>

        {/* Progress */}
        {!showResult && (
          <div className="flex gap-2 mb-8 max-w-md mx-auto">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  i <= step ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-display font-semibold text-center">{questions[step].question}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {questions[step].options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`group p-6 rounded-xl border-2 text-left transition-all duration-200 hover:border-primary hover:shadow-glow ${
                      answers[questions[step].id] === opt.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background'
                    }`}
                  >
                    <opt.icon className="h-6 w-6 text-primary mb-3" />
                    <p className="font-semibold mb-1">{opt.label}</p>
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
              {step > 0 && (
                <div className="flex justify-center">
                  <Button variant="ghost" onClick={() => setStep(step - 1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto"
            >
              <Card className="overflow-hidden border-primary/20 shadow-glow">
                <div className="bg-gradient-to-r from-primary to-primary-glow p-6 text-primary-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-sm font-medium">Recommended for You</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold">{rec.title}</h3>
                </div>
                <CardContent className="p-6 space-y-4">
                  <p className="text-muted-foreground">{rec.desc}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">⏱ {rec.duration}</span>
                    <span className="font-medium">💰 From {rec.price}</span>
                  </div>
                  <div className="flex gap-3">
                    <Button className="flex-1" onClick={() => window.open('https://programs.vvmvp.org/', '_blank')}>
                      Book Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => { setShowResult(false); setStep(0); setAnswers({}); }}>
                      Retake Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
