/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ConvertToPaidRequest = {
    contract_id: string;
    subscription_plan: ConvertToPaidRequest.subscription_plan;
};
export namespace ConvertToPaidRequest {
    export enum subscription_plan {
        STARTER = 'starter',
        PROFESSIONAL = 'professional',
        ENTERPRISE = 'enterprise',
    }
}

