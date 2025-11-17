/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UrlRedirectService {
    /**
     * Redirect Shortened Url
     * Redirect shortened URLs to their original destinations
     * @returns any Successful Response
     * @throws ApiError
     */
    public static redirectShortenedUrlSUrlHashGet({
        urlHash,
    }: {
        urlHash: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/s/{url_hash}',
            path: {
                'url_hash': urlHash,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
