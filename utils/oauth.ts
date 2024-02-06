import OAuthClient from 'intuit-oauth';
import { deleteItem, readItems, updateItem } from '@directus/sdk';

export async function useOAuth(realmId?: string) {
    const { clientId, clientSecret, environment, redirectUri } = useRuntimeConfig(useEvent());
    const client = new OAuthClient({
        clientId,
        clientSecret,
        environment,
        redirectUri
    });

    if (realmId) {
        const token = await cachedAccessTokens(realmId);
        client.setToken(token);
    }

    return client;
}

export const cachedAccessTokens = defineCachedFunction(async (realmId: string) => {
    const token = await refreshToken(realmId);

    if (!token) {
        return null;
    }

    return token;
}, {
    maxAge: 50 * 60,
    name: 'accessTokens',
    swr: false, // DO NOT RETURN STALE TOKENS!!! (stale-while-revalidate)
});

/**
 * Grab token that is stored in the database
 * @param realmId The customer id
 * @returns storedToken
 */
async function getStoredToken(realmId: string) {
    const directus = await useDirectus();
    const storedToken = await directus.request(readItems('quickbooks_oauth',{ 
        'filter': {
            'realm_id': {
                '_eq': realmId
            }
        },
        'limit': 1
    })).then((res) => {
        const token = res[0];
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
async function refreshToken(realmId: string) {
    const storedToken = await getStoredToken(realmId);

    const directus = await useDirectus();

    const oauth = await useOAuth()
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

            // Delete invalid oauth token from database
            await directus.request(deleteItem('quickbooks_oauth', storedToken.id));
        });

    if (!token) {
        return null;
    }

    const d = new Date();
    directus.request(updateItem('quickbooks_oauth', storedToken.id, {
        refresh_token: encrypt(token.refresh_token),
        expires_at: new Date(d.getTime() + (token.x_refresh_token_expires_in * 1000)).toISOString()
    }));

    return token;
}