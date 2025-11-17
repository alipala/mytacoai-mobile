/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserCreate = {
    email: string;
    name: string;
    is_active?: boolean;
    is_verified?: boolean;
    created_at?: string;
    last_login?: (string | null);
    preferred_language?: (string | null);
    preferred_level?: (string | null);
    preferred_voice?: (string | null);
    last_assessment_data?: (Record<string, any> | null);
    password: string;
};

