import Quickbooks from 'node-quickbooks';

export async function useQuickbooks(realmId: string) {
    if (!realmId) { 
        throw new Error('You must supply required parameters!');
    }
    const { clientId, clientSecret, debug, environment } = useRuntimeConfig(useEvent());
    const token = await useAuthToken(realmId);

    const isSandbox = (environment === 'sandbox');
    const qbo = new Quickbooks(
        clientId, // consumerKey
        clientSecret, // consumerSecret
        token.access_token, // Access Token
        false, // no secret OAuth 2
        realmId, // Company ID
        isSandbox, // use sandbox api?
        debug, // debug?
        null, // null = latest api version
        '2.0', // oAuth version
        token.refresh_token // Refresh token
    );

    return qbo;
}