/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BackgroundAnalysisResponse = {
    analysis_id: string;
    recognized_text: string;
    grammatical_score: number;
    vocabulary_score: number;
    complexity_score: number;
    appropriateness_score: number;
    overall_score: number;
    grammar_issues: Array<Record<string, any>>;
    improvement_suggestions: Array<string>;
    corrected_text?: (string | null);
    level_appropriate_alternatives?: (Array<string> | null);
    timestamp: string;
};

