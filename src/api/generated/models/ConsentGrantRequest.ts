/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Schema for granting consent
 */
export type ConsentGrantRequest = {
    learner_id: string;
    institution_id: string;
    tutor_id: string;
    ip_address?: (string | null);
    user_agent?: (string | null);
};

