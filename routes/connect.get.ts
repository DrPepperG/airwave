import OAuthClient from 'intuit-oauth';

export default eventHandler(async (event) => {
    const { clientId, clientSecret, environment, redirectUri } = useRuntimeConfig(event)
    const client = new OAuthClient({
        clientId,
        clientSecret,
        environment,
        redirectUri
    })
    
    const authUri = client.authorizeUri({scope:[OAuthClient.scopes.Accounting,OAuthClient.scopes.OpenId]});
    return await sendRedirect(event, authUri);
})