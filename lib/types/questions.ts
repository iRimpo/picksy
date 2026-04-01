// ─── Question Flow Types ────────────────────────────────────────────────────────

export type QuestionType = "binary" | "range" | "multi-select" | "single-select";

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface RangeConfig {
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  stops?: { value: number; label: string }[];
  prefix?: string;
  unit?: string;
}

export interface QuestionDefinition {
  id: string;
  type: QuestionType;
  prompt: string;
  subPrompt?: string;
  options?: QuestionOption[];
  range?: RangeConfig;
  /** Max chips selectable for multi-select (default 3) */
  maxSelections?: number;
  preferenceKey: string;
}

export interface CategoryQuestionSet {
  category: string;
  questions: QuestionDefinition[];
}

export interface QuestionAnswer {
  questionId: string;
  preferenceKey: string;
  selectedOptionIds?: string[];
  rangeValue?: number;
}
