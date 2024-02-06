import { createItem } from "@directus/sdk";

export default eventHandler(async (event) => {
    const { mainRedirect } = useRuntimeConfig(event);
    const client = await useOAuth();

    // Smart guys at intuit made us send the unparsed url string instead of an object
    const query = getRequestURL(event).search;
    const realmId = getQuery(event).realmId as string
    client.createToken(query)
        .then((res) => {
            storeToken(realmId, res.getJson())
        })
        .catch((err) => {
            console.log(err);
        });

    return sendRedirect(event, mainRedirect);
})

async function storeToken(realmId: string, token: {
    access_token: string,
    token_type: string,
    x_refresh_token_expires_in: number,
    id_token: string,
    refresh_token: string,
    expires_in: number 
}) {
    const directus = await useDirectus();

    const d = new Date();
    await directus.request(createItem('quickbooks_oauth', {
        realm_id: realmId,
        refresh_token: encrypt(token.refresh_token),
        expires_at: new Date(d.getTime() + (token.x_refresh_token_expires_in * 1000)).toISOString()
    }))
}