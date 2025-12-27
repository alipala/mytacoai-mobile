/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FinalAssessmentResultResponse = {
    passed: boolean;
    current_level: string;
    next_level: string;
    overall_score: number;
    current_level_mastery: Record<string, any>;
    next_level_readiness: Record<string, any>;
    skills: Record<string, number>;
    recommendation: string;
    message: string;
    strengths: Array<string>;
    areas_for_improvement: Array<string>;
    next_steps: Array<string>;
    attempt_number: number;
};

