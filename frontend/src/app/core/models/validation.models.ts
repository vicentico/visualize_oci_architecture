export type ValidationSeverity = 'Warning' | 'Error';

export interface ValidationMessage {
  ruleId: string;
  message: string;
  severity: ValidationSeverity;
  affectedResourceIds: string[];
}

export interface ValidationResult {
  isValid: boolean;
  messages: ValidationMessage[];
}
