// ─── Question Resolver ─────────────────────────────────────────────────────────

import type { DecodedQuery, ResolvedPreferences } from "./types/refine";
import type { CategoryQuestionSet, QuestionAnswer, QuestionDefinition } from "./types/questions";
import { QUESTION_SCHEMAS, FALLBACK_QUESTIONS } from "./data/question-schemas";

// Free-text "anything else?" appended to every question set
const FREE_TEXT_QUESTION: QuestionDefinition = {
  id: "free-text-notes",
  type: "free-text",
  prompt: "Anything else to know?",
  subPrompt: "Brand preferences, must-have features, deal-breakers — anything goes.",
  preferenceKey: "freeNotes",
};

export function getQuestionsForCategory(decoded: DecodedQuery): CategoryQuestionSet {
  const cat = decoded.category.toLowerCase();
  const found = QUESTION_SCHEMAS.find((s) => s.category.toLowerCase() === cat);
  const base = found ?? FALLBACK_QUESTIONS;
  return {
    ...base,
    questions: [...base.questions, FREE_TEXT_QUESTION],
  };
}

export function answersToPreferences(
  answers: QuestionAnswer[],
  questions: QuestionDefinition[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _originalQuery: string
): ResolvedPreferences {
  let budget: number | undefined;
  let budgetStrict: boolean | undefined;

  const parts: string[] = [];

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) continue;

    // Free-text note
    if (answer.freeText?.trim()) {
      parts.push(`User notes: ${answer.freeText.trim()}`);
      continue;
    }

    // Budget range
    if (answer.rangeValue !== undefined && question.range) {
      const { prefix = "", unit = "", max } = question.range;
      const val = answer.rangeValue;
      const formatted = val.toLocaleString();
      const label = val >= max ? `${prefix}${formatted}${unit}+` : `${prefix}${formatted}${unit}`;

      if (question.preferenceKey === "budget") {
        budget = val;
        budgetStrict = answer.budgetStrict ?? true;
        if (budgetStrict) {
          parts.push(`Budget: ${label} (strict — must not recommend anything above this price)`);
        } else {
          parts.push(`Budget: around ${label} (flexible — can suggest slightly higher if significantly better)`);
        }
      } else {
        parts.push(label);
      }
      continue;
    }

    // Option selections
    if (answer.selectedOptionIds && answer.selectedOptionIds.length > 0) {
      const selected =
        question.options?.filter((o) => answer.selectedOptionIds!.includes(o.id)) ?? [];
      const label = selected.map((o) => o.label).join(", ");
      if (label) parts.push(label);
    }
  }

  const summary = parts.join(", ");

  const values = answers
    .map((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) return null;
      let label = "";
      if (answer.freeText?.trim()) label = answer.freeText.trim();
      else if (answer.rangeValue !== undefined && question.range) {
        const { prefix = "", unit = "", max } = question.range;
        const val = answer.rangeValue;
        label = val >= max ? `${prefix}${val.toLocaleString()}${unit}+` : `${prefix}${val.toLocaleString()}${unit}`;
      } else if (answer.selectedOptionIds?.length) {
        label = question.options?.filter((o) => answer.selectedOptionIds!.includes(o.id)).map((o) => o.label).join(", ") ?? "";
      }
      return label ? { parameter: answer.preferenceKey, label, rawValue: answer.rangeValue ?? 0.5 } : null;
    })
    .filter((v): v is { parameter: string; label: string; rawValue: number } => v !== null);

  return { values, summary, budget, budgetStrict };
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
      answers.push({ questionId: q.id, preferenceKey: q.preferenceKey, rangeValue: clamped, budgetStrict: true });
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
