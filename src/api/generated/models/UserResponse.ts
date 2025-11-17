/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserResponse = {
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
    _id: string;
    stripe_customer_id?: (string | null);
    subscription_status?: (string | null);
    subscription_plan?: (string | null);
    subscription_period?: (string | null);
    subscription_price_id?: (string | null);
};

