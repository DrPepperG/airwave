import OAuthClient from 'intuit-oauth';

export function useOAuth() {
    const { clientId, clientSecret, environment, redirectUri } = useRuntimeConfig(useEvent());
    const client = new OAuthClient({
        clientId,
        clientSecret,
        environment,
        redirectUri
    });

    return client;
}