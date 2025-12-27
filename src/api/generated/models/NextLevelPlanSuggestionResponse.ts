/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type NextLevelPlanSuggestionResponse = {
    suggested: boolean;
    based_on_plan: string;
    language: string;
    proficiency_level: string;
    previous_level: string;
    goals: Array<string>;
    duration_months: number;
    focus_areas: Array<string>;
    customizable: boolean;
    message: string;
};

