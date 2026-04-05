// ─── Refine Canvas Types ───────────────────────────────────────────────────────

export interface QueryParameter {
  key: string;
  label: string;
  minLabel: string;
  maxLabel: string;
  axis: "x" | "y" | "color" | "size";
  resolve: (value: number) => string;
}

export interface DecodedQuery {
  original: string;
  category: string;
  parameters: QueryParameter[];
  suggestedSubreddits: string[];
}

export interface OrbState {
  /** Normalized 0–1, left=0 right=1 */
  x: number;
  /** Normalized 0–1, top=0 bottom=1 */
  y: number;
  /** Index into the ColorRing segments */
  colorIndex: number;
  /** 0=small, 1=medium, 2=large */
  sizeIndex: number;
}

export interface PreferenceValue {
  parameter: string;
  label: string;
  rawValue: number;
}

export interface ResolvedPreferences {
  values: PreferenceValue[];
  /** Short summary injected into the LLM prompt */
  summary: string;
  /** Structured key-value pairs for future use */
  answers?: Record<string, string | string[] | number>;
  /** Numeric budget if set via refine flow */
  budget?: number;
  /** Whether the budget is a hard limit (true) or a guideline (false) */
  budgetStrict?: boolean;
}
