/**
 * State Types — Options interfaces for state operations
 */

export interface StateMetricOptions {
  phase?: string;
  plan?: string;
  duration?: string;
  tasks?: string;
  files?: string;
}

export interface StateDecisionOptions {
  phase?: string;
  summary?: string;
  summary_file?: string;
  rationale?: string;
  rationale_file?: string;
}

export interface StateBlockerOptions {
  text?: string;
  text_file?: string;
}

export interface StateSessionOptions {
  stopped_at?: string;
  resume_file?: string;
}
