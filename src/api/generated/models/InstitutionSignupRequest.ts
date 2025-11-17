/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Schema for institution signup
 */
export type InstitutionSignupRequest = {
    name: string;
    institution_type?: string;
    admin_email: string;
    /**
     * Password must be between 8-72 characters (bcrypt limit)
     */
    admin_password: string;
    admin_name: string;
    /**
     * Activation code received via email
     */
    activation_code: string;
    subscription_plan?: (string | null);
};

