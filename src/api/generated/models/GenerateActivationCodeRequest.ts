/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GenerateActivationCodeRequest = {
    institution_name: string;
    institution_email: string;
    institution_type: GenerateActivationCodeRequest.institution_type;
    is_trial?: boolean;
    trial_duration_days?: (number | null);
    target_plan?: GenerateActivationCodeRequest.target_plan;
    max_tutors: number;
    max_learners: number;
    contract_id?: (string | null);
    notes?: (string | null);
};
export namespace GenerateActivationCodeRequest {
    export enum institution_type {
        SCHOOL = 'School',
        UNIVERSITY = 'University',
        LANGUAGE_CENTER = 'Language Center',
        CORPORATE = 'Corporate',
    }
    export enum target_plan {
        STARTER = 'starter',
        PROFESSIONAL = 'professional',
        ENTERPRISE = 'enterprise',
    }
}

