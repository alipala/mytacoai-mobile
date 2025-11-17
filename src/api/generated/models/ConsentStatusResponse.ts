/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Schema for consent status
 */
export type ConsentStatusResponse = {
    has_consent: boolean;
    consent_given_date?: (string | null);
    consent_revoked?: boolean;
    institution_name: string;
    tutor_name: string;
    data_shared: Array<string>;
};

