import OAuthClient from 'intuit-oauth';
import { deleteItem, readItem, updateItem } from '@directus/sdk';

type Token = {
    isCached: boolean,
    realmId: string,
    token_type: "bearer", // always bearer
    access_token: string,
    refresh_token: string,
    expires_in: number,
    x_refresh_token_expires_in: number,
    latency: number,
    createdAt: number
}

export async function useAuthToken(realmId: string): Promise<Token> {
    if (!realmId) return null;

    const token = await cachedAccessTokens(realmId)
        .then(async (token) => {
            if (!token || !token.createdAt) {
                console.log('no token')
                // If our cached token is not working correctly then get a fresh one
                return await refreshToken(realmId);
            }
            return token
        })
        .catch(console.error);
    if (!token) return;

    const expiry = token.createdAt + (token.expires_in * 1000);
    const isValid = ((expiry - token.latency) > Date.now());

    // Cache should expire before it becomes invalid but just incase
    if (!isValid) {
        const refreshedToken = await refreshToken(realmId);
        return refreshedToken;
    }
    return token;
}

export async function useOAuth(realmId?: string) {
    const { clientId, clientSecret, environment, redirectUri } = useRuntimeConfig();
    const client = new OAuthClient({
        clientId,
        clientSecret,
        environment,
        redirectUri
    });

    if (realmId) {
        const token = await useAuthToken(realmId);
        client.setToken(token);
    }

    return client;
}

export const cachedAccessTokens = defineCachedFunction(async (realmId: string): Promise<Token> => {
    const token = await refreshToken(realmId);

    if (!token) {
        return null;
    }

    console.log(`Refreshed cachedToken for realm ${realmId}`);

    token.isCached = true;
    return token;
}, {
    maxAge: 50 * 60,
    name: 'accessTokens',
    swr: false, // DO NOT RETURN STALE TOKENS!!! (stale-while-revalidate)
    getKey: (realmId) => {
        return realmId
    }
});

/**
 * Grab token that is stored in the database
 * @param realmId The customer id
 * @returns storedToken
 */
async function getStoredToken(realmId: string) {
    const directus = await useDirectus();

    const storedToken = await directus.request(readItem('quickbooks_oauth', realmId))
        .then((token) => {
            token.refresh_token = decrypt(token.refresh_token);
            return token
        });
    if (!storedToken) return null;

    return storedToken;
}

/**
 * Get new access_token and store updated refresh_token in the database
 * @param realmId The customer id
 */
async function refreshToken(realmId: string): Promise<Token> {
    const storedToken = await getStoredToken(realmId);

    const oauth = await useOAuth();

    const directus = await useDirectus();
    const token = await oauth
        .refreshUsingToken(storedToken.refresh_token)
        .then((res) => {
            return res.token;
        })
        .catch(async (err) => {
            if (err.error !== 'invalid_grant') {
                console.error(err);
                return;
            };

            console.log(err, realmId);

            // Delete invalid oauth token from database
            await directus.request(deleteItem('quickbooks_oauth', realmId));
        });

    if (!token) {
        return null;
    }

    const d = new Date();
    directus.request(updateItem('quickbooks_oauth', realmId, {
        refresh_token: encrypt(token.refresh_token),
        expires_at: new Date(d.getTime() + (token.x_refresh_token_expires_in * 1000)).toISOString()
    }));

    token.realmId = realmId; // Make sure we have the correct id, terrible libraries intuit has released
    return {
        isCached: false,
        ...token
    };
}