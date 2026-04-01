// ─── Question Resolver ─────────────────────────────────────────────────────────
// Maps a decoded query → question set, and maps answers → ResolvedPreferences

import type { DecodedQuery, ResolvedPreferences } from "./types/refine";
import type { CategoryQuestionSet, QuestionAnswer, QuestionDefinition } from "./types/questions";
import { QUESTION_SCHEMAS, FALLBACK_QUESTIONS } from "./data/question-schemas";

export function getQuestionsForCategory(decoded: DecodedQuery): CategoryQuestionSet {
  const cat = decoded.category.toLowerCase();
  const found = QUESTION_SCHEMAS.find((s) => s.category.toLowerCase() === cat);
  return found ?? FALLBACK_QUESTIONS;
}

export function answersToPreferences(
  answers: QuestionAnswer[],
  questions: QuestionDefinition[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _originalQuery: string
): ResolvedPreferences {
  const values = answers
    .map((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) return null;

      let label = "";

      if (answer.rangeValue !== undefined && question.range) {
        const { prefix = "", unit = "", max } = question.range;
        const val = answer.rangeValue;
        const formatted = val.toLocaleString();
        label = val >= max ? `${prefix}${formatted}${unit}+` : `${prefix}${formatted}${unit}`;
      } else if (answer.selectedOptionIds && answer.selectedOptionIds.length > 0) {
        const selected =
          question.options?.filter((o) => answer.selectedOptionIds!.includes(o.id)) ?? [];
        label = selected.map((o) => o.label).join(", ");
      }

      if (!label) return null;

      return {
        parameter: answer.preferenceKey,
        label,
        rawValue: answer.rangeValue ?? 0.5,
      };
    })
    .filter((v): v is { parameter: string; label: string; rawValue: number } => v !== null);

  // Build a concise natural-language summary for the LLM prompt
  const summary = values.map((v) => v.label).join(", ");

  return { values, summary };
}

// ─── Pre-fill detected from the raw query string ───────────────────────────────

export function getPrefilledAnswers(
  decoded: DecodedQuery,
  questions: QuestionDefinition[]
): QuestionAnswer[] {
  const lower = decoded.original.toLowerCase();
  const answers: QuestionAnswer[] = [];

  // Budget from "under $X" or "$X" patterns
  const budgetMatch = lower.match(/under\s*\$?(\d+)/i) ?? lower.match(/\$(\d+)/i);
  if (budgetMatch) {
    const budget = parseInt(budgetMatch[1]);
    const q = questions.find((q) => q.preferenceKey === "budget" && q.type === "range");
    if (q?.range) {
      const clamped = Math.max(q.range.min, Math.min(q.range.max, budget));
      answers.push({ questionId: q.id, preferenceKey: q.preferenceKey, rangeValue: clamped });
    }
  }

  // Connectivity
  if (/\bwireless\b|\bbluetooth\b/i.test(decoded.original)) {
    const q = questions.find((q) => q.preferenceKey === "connectivity");
    if (q?.options?.some((o) => o.id === "wireless")) {
      answers.push({ questionId: q.id, preferenceKey: q.preferenceKey, selectedOptionIds: ["wireless"] });
    }
  } else if (/\bwired\b/i.test(decoded.original)) {
    const q = questions.find((q) => q.preferenceKey === "connectivity");
    if (q?.options?.some((o) => o.id === "wired")) {
      answers.push({ questionId: q.id, preferenceKey: q.preferenceKey, selectedOptionIds: ["wired"] });
    }
  }

  // iOS / iPhone ecosystem
  if (/\biphone\b|\bios\b/i.test(decoded.original)) {
    const q = questions.find((q) => q.preferenceKey === "ecosystem");
    if (q?.options?.some((o) => o.id === "ios" || o.id === "iphone")) {
      const id = q.options!.find((o) => o.id === "ios" || o.id === "iphone")!.id;
      answers.push({ questionId: q.id, preferenceKey: q.preferenceKey, selectedOptionIds: [id] });
    }
  }

  // Android ecosystem
  if (/\bandroid\b|\bgalaxy\b|\bpixel\b/i.test(decoded.original)) {
    const q = questions.find((q) => q.preferenceKey === "ecosystem");
    if (q?.options?.some((o) => o.id === "android")) {
      answers.push({ questionId: q.id, preferenceKey: q.preferenceKey, selectedOptionIds: ["android"] });
    }
  }

  // Gaming use case
  if (/\bgaming\b/i.test(decoded.original)) {
    const q = questions.find((q) => q.preferenceKey === "useCase");
    const opt = q?.options?.find((o) => o.id === "gaming" || o.label.toLowerCase().includes("gaming"));
    if (q && opt) {
      answers.push({ questionId: q.id, preferenceKey: q.preferenceKey, selectedOptionIds: [opt.id] });
    }
  }

  // NVIDIA GPU brand
  if (/\bnvidia\b|\brtx\b|\bgtx\b/i.test(decoded.original)) {
    const q = questions.find((q) => q.preferenceKey === "brand");
    if (q?.options?.some((o) => o.id === "nvidia")) {
      answers.push({ questionId: q.id, preferenceKey: q.preferenceKey, selectedOptionIds: ["nvidia"] });
    }
  }

  // AMD GPU/CPU brand
  if (/\bamd\b|\bradeon\b|\bryzen\b/i.test(decoded.original)) {
    const q = questions.find((q) => q.preferenceKey === "brand");
    if (q?.options?.some((o) => o.id === "amd")) {
      answers.push({ questionId: q.id, preferenceKey: q.preferenceKey, selectedOptionIds: ["amd"] });
    }
  }

  // Deduplicate by questionId (first match wins)
  const seen = new Set<string>();
  return answers.filter((a) => {
    if (seen.has(a.questionId)) return false;
    seen.add(a.questionId);
    return true;
  });
}
