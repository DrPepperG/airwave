import { readItems, updateItem } from '@directus/sdk';
import cron from 'node-cron';

// Every day at 12am we will query our database to update any tokens
export default defineNitroPlugin(() => {
    cron.schedule('0 12 * * *', () => {
        refreshTokens();
    }, {
        timezone: 'America/New_York'
    });
});

/**
 * Intuit makes refresh tokens last 100 days before requiring the end user to reauth, we dont want to do that.
 * Run a refresh every day and get a new refresh token, they will send a brand new one every 24 hours.
 * Might as well make use of that new token for security.
 */
async function refreshTokens() {
    const directus = await useDirectus();
    
    const tokens = await directus.request(readItems('quickbooks_oauth'))
        .then((res) => {
            return res;
        })
        .catch(console.error);
    if (!tokens) return;

    const oauth = await useOAuth();

    for (const databaseToken of Object.values(tokens)) {
        const refresh_token = decrypt(databaseToken.refresh_token);

        const newToken = await oauth.refreshUsingToken(refresh_token)
            .then((res) => {
                return res.token;
            })
        
        const d = new Date();
        directus.request(updateItem('quickbooks_oauth', databaseToken.realm_id, {
            refresh_token: encrypt(newToken.refresh_token),
            expires_at: new Date(d.getTime() + (newToken.x_refresh_token_expires_in * 1000)).toISOString()
        }));

        // Clear item from cache
        await useStorage().removeItem(`cache:nitro:functions:accessTokens:${databaseToken.realm_id}.json`);
    }
}