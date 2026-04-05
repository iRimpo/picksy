"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { DecodedQuery } from "@/lib/types/refine";
import type { QuestionAnswer } from "@/lib/types/questions";
import { getQuestionsForCategory, answersToPreferences, getPrefilledAnswers } from "@/lib/question-resolver";
import StepIndicator from "./StepIndicator";
import AnswerSummary from "./AnswerSummary";
import BinaryChoice from "./inputs/BinaryChoice";
import SingleSelect from "./inputs/SingleSelect";
import MultiSelect from "./inputs/MultiSelect";
import RangeSlider from "./inputs/RangeSlider";

interface QuestionFlowProps {
  decoded: DecodedQuery;
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export default function QuestionFlow({ decoded }: QuestionFlowProps) {
  const router = useRouter();
  const questionSet = getQuestionsForCategory(decoded);
  const questions = questionSet.questions;

  // Seed answers with pre-fills detected from the query
  const [answers, setAnswers] = useState<QuestionAnswer[]>(() =>
    getPrefilledAnswers(decoded, questions)
  );
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  // Skip steps that were pre-filled (first render only)
  useEffect(() => {
    const prefilledIds = getPrefilledAnswers(decoded, questions).map((a) => a.questionId);
    if (prefilledIds.includes(questions[0]?.id) && questions.length > 1) {
      // Don't auto-skip on mount — let user confirm pre-fill
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQuestion = questions[step];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id) ?? null;

  function getSelectedIds(): string[] {
    return currentAnswer?.selectedOptionIds ?? [];
  }

  function getSelectedId(): string | null {
    return currentAnswer?.selectedOptionIds?.[0] ?? null;
  }

  function getRangeValue(): number {
    if (currentAnswer?.rangeValue !== undefined) return currentAnswer.rangeValue;
    if (currentQuestion?.range) {
      const { min, max } = currentQuestion.range;
      return Math.round((min + max) / 2);
    }
    return 0;
  }

  function setAnswer(answer: QuestionAnswer) {
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === answer.questionId);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = answer;
        return next;
      }
      return [...prev, answer];
    });
  }

  function advance() {
    if (step < questions.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }

  const handleSingleOrBinarySelect = useCallback(
    (optionId: string) => {
      setAnswer({
        questionId: currentQuestion.id,
        preferenceKey: currentQuestion.preferenceKey,
        selectedOptionIds: [optionId],
      });
      // Auto-advance after brief visual feedback
      setTimeout(() => advance(), 320);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentQuestion, step]
  );

  function handleMultiToggle(optionId: string) {
    const prev = getSelectedIds();
    const max = currentQuestion.maxSelections ?? 3;
    let next: string[];
    if (prev.includes(optionId)) {
      next = prev.filter((id) => id !== optionId);
    } else if (prev.length < max) {
      next = [...prev, optionId];
    } else {
      return; // at max, ignore
    }
    setAnswer({
      questionId: currentQuestion.id,
      preferenceKey: currentQuestion.preferenceKey,
      selectedOptionIds: next,
    });
  }

  function handleRangeChange(value: number) {
    setAnswer({
      questionId: currentQuestion.id,
      preferenceKey: currentQuestion.preferenceKey,
      rangeValue: value,
    });
  }

  function handleConfirm() {
    // Ensure range questions have a value even if not touched
    const finalAnswers = [...answers];
    questions.forEach((q) => {
      if (q.type === "range" && !finalAnswers.find((a) => a.questionId === q.id)) {
        const mid = Math.round((q.range!.min + q.range!.max) / 2);
        finalAnswers.push({ questionId: q.id, preferenceKey: q.preferenceKey, rangeValue: mid });
      }
    });

    const prefs = answersToPreferences(finalAnswers, questions, decoded.original);
    const encoded = encodeURIComponent(JSON.stringify(prefs));
    router.push(`/results?q=${encodeURIComponent(decoded.original)}&preferences=${encoded}`);
  }

  function handleSkip() {
    router.push(`/results?q=${encodeURIComponent(decoded.original)}`);
  }

  const needsNextButton =
    currentQuestion?.type === "multi-select" || currentQuestion?.type === "range";

  const canProceed =
    currentQuestion?.type === "range"
      ? true // range always has a value
      : getSelectedIds().length > 0;

  if (!currentQuestion) return null;

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        background: "#1c1917",
        boxShadow: "0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(46,204,113,0.1), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Header: back button + step indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 16px 0",
          gap: 8,
        }}
      >
        <motion.button
          onClick={goBack}
          animate={{ opacity: step > 0 ? 1 : 0 }}
          whileHover={step > 0 ? { scale: 1.1, color: "rgba(255,255,255,0.9)" } : {}}
          whileTap={step > 0 ? { scale: 0.9 } : {}}
          transition={{ opacity: { duration: 0.2 }, scale: { type: "spring", stiffness: 400, damping: 24 } }}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            cursor: step > 0 ? "pointer" : "default",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            pointerEvents: step > 0 ? "auto" : "none",
          }}
          aria-label="Previous question"
        >
          <ArrowLeft size={16} />
        </motion.button>
        <div style={{ flex: 1 }}>
          <StepIndicator currentStep={step} totalSteps={questions.length} />
        </div>
        <div style={{ width: 24 }} />
      </div>

      {/* Question area */}
      <div style={{ padding: "12px 16px 0", minHeight: 340, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Category label */}
            <p
              className="font-heading"
              style={{
                fontSize: 10,
                fontWeight: 900,
                color: "rgba(46,204,113,0.8)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              {decoded.category} · Question {step + 1} of {questions.length}
            </p>

            {/* Prompt */}
            <h3
              className="font-heading"
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "white",
                marginBottom: currentQuestion.subPrompt ? 4 : 16,
                lineHeight: 1.25,
              }}
            >
              {currentQuestion.prompt}
            </h3>
            {currentQuestion.subPrompt && (
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 14,
                  fontWeight: 500,
                }}
              >
                {currentQuestion.subPrompt}
              </p>
            )}

            {/* Input */}
            {currentQuestion.type === "binary" && (
              <BinaryChoice
                question={currentQuestion}
                selected={getSelectedId()}
                onSelect={handleSingleOrBinarySelect}
              />
            )}
            {currentQuestion.type === "single-select" && (
              <SingleSelect
                question={currentQuestion}
                selected={getSelectedId()}
                onSelect={handleSingleOrBinarySelect}
              />
            )}
            {currentQuestion.type === "multi-select" && (
              <MultiSelect
                question={currentQuestion}
                selected={getSelectedIds()}
                onToggle={handleMultiToggle}
              />
            )}
            {currentQuestion.type === "range" && (
              <RangeSlider
                question={currentQuestion}
                value={getRangeValue()}
                onChange={handleRangeChange}
              />
            )}

            {/* Next button for multi-select and range */}
            {needsNextButton && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4, marginBottom: 16 }}>
                <motion.button
                  className="font-heading"
                  onClick={step < questions.length - 1 ? advance : handleConfirm}
                  whileTap={{ scale: 0.97 }}
                  whileHover={canProceed ? { scale: 1.04, boxShadow: "0 6px 24px rgba(255,107,138,0.45)" } : {}}
                  animate={{ opacity: canProceed ? 1 : 0.45 }}
                  disabled={!canProceed}
                  style={{
                    background: "linear-gradient(135deg, #FF6B8A, #2ECC71)",
                    border: "none",
                    color: "white",
                    borderRadius: 100,
                    padding: "10px 22px",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: canProceed ? "pointer" : "not-allowed",
                    letterSpacing: "0.02em",
                    boxShadow: "0 4px 16px rgba(255,107,138,0.3)",
                  }}
                >
                  {step < questions.length - 1 ? "Next →" : "See results →"}
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 16px" }} />

      {/* Answer summary + confirm */}
      <div style={{ background: "#fafaf9", padding: "0 16px" }}>
        <AnswerSummary
          answers={answers}
          questions={questions}
          query={decoded.original}
          currentStep={step}
          totalSteps={questions.length}
          onConfirm={handleConfirm}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
}
