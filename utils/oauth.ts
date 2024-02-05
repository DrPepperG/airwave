import type { H3Event } from 'h3';
import OAuthClient from 'intuit-oauth';

export function useOAuth(event: H3Event) {
    const { clientId, clientSecret, environment, redirectUri } = useRuntimeConfig(event);
    const client = new OAuthClient({
        clientId,
        clientSecret,
        environment,
        redirectUri
    });

    return client;
}