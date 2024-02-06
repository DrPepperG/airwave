import Quickbooks from 'node-quickbooks';

export async function useQuickbooks(realmId: string) {
    if (!realmId) { 
        throw new Error('You must supply required parameters!');
    }
    const { clientId, clientSecret } = useRuntimeConfig(useEvent());
    const token = await cachedAccessTokens(realmId);

    const qbo = new Quickbooks(clientId, clientSecret, token.access_token, false, realmId, true, true, null, '2.0', token.refresh_token);

    return qbo;
}