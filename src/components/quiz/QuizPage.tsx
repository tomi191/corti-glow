"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { QuizIntro } from "./QuizIntro";
import { QuizProgress } from "./QuizProgress";
import { QuizQuestion } from "./QuizQuestion";
import { QuizResults } from "./QuizResults";
import { QUIZ_QUESTIONS } from "@/data/glow-guide";

type Phase = "intro" | "questions" | "loading" | "results";

interface QuizResult {
  score: number;
  level: string;
  recommendation: string;
  variant: { id: string; name: string; price: number; tagline: string };
  categoryScores: Record<string, number>;
}

export function QuizPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState("");

  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentQuestion = QUIZ_QUESTIONS[currentStep];

  const handleStart = () => setPhase("questions");

  const handleSelect = useCallback(
    (questionId: string, value: number) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));

      // Auto-advance after short delay
      setTimeout(() => {
        if (currentStep < totalQuestions - 1) {
          setDirection(1);
          setCurrentStep((s) => s + 1);
        } else {
          // Last question — submit
          submitQuiz({ ...answers, [questionId]: value });
        }
      }, 300);
    },
    [currentStep, totalQuestions, answers]
  );

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    } else {
      setPhase("intro");
    }
  };

  const submitQuiz = async (finalAnswers: Record<string, number>) => {
    setPhase("loading");
    setError("");

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });

      if (!res.ok) {
        throw new Error("Грешка при обработка на теста");
      }

      const data = await res.json();
      setResult({
        score: data.score,
        level: data.level,
        recommendation: data.recommendation,
        variant: data.variant,
        categoryScores: data.categoryScores,
      });
      setPhase("results");
    } catch {
      setError("Нещо се обърка. Моля, опитай отново.");
      setPhase("questions");
      setCurrentStep(totalQuestions - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-20">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#B2D8C6]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFC1CC]/15 rounded-full blur-[120px]" />
      </div>

      {/* Back button during questions */}
      {phase === "questions" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-4 left-4 z-20 sm:top-6 sm:left-6"
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#2D4A3E] transition-colors bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-stone-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* Intro */}
        {phase === "intro" && (
          <motion.div
            key="intro"
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QuizIntro onStart={handleStart} />
          </motion.div>
        )}

        {/* Questions */}
        {phase === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md mx-auto space-y-8"
          >
            <QuizProgress current={currentStep} total={totalQuestions} />
            <QuizQuestion
              question={currentQuestion}
              selectedValue={answers[currentQuestion.id]}
              onSelect={handleSelect}
              direction={direction}
            />
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </motion.div>
        )}

        {/* Loading */}
        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-4"
          >
            <Loader2 className="w-10 h-10 text-[#2D4A3E] animate-spin mx-auto" />
            <p className="text-sm text-stone-500">
              Анализирам резултатите ти...
            </p>
          </motion.div>
        )}

        {/* Results */}
        {phase === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <QuizResults
              score={result.score}
              level={result.level}
              recommendation={result.recommendation}
              variant={result.variant}
              categoryScores={result.categoryScores}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
