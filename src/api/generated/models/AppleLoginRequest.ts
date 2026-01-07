/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AppleLoginRequest = {
    /**
     * Apple identity token (JWT)
     */
    token: string;
    /**
     * Apple user ID
     */
    user_identifier: string;
    /**
     * Email (only provided on first sign-in)
     */
    email?: (string | null);
    /**
     * Full name (only provided on first sign-in)
     */
    name?: (string | null);
};

