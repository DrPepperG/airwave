import { createItem } from "@directus/sdk";

export default eventHandler(async (event) => {
    const { companyId, mainRedirect } = useRuntimeConfig(event);
    const client = await useOAuth();

    // Smart guys at intuit made us send the unparsed url string instead of an object
    const query = getRequestURL(event).search;
    const realmId = getQuery(event).realmId as string

    // If we have a companyId defined deny any other companies from connecting to our app
    if (companyId && (realmId != companyId)) {
        return setResponseStatus(event, 403, `This application is limited to defined companies.`)
    }

    return client.createToken(query)
        .then((res) => {
            storeToken(realmId, res.json)
            return sendRedirect(event, mainRedirect);
        })
        .catch((err) => {
            console.error(err);
            return setResponseStatus(event, 409)
        });
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