/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Schema for admin login
 */
export type InstitutionLoginRequest = {
    admin_email: string;
    /**
     * Password max 72 characters (bcrypt limit)
     */
    password: string;
};

