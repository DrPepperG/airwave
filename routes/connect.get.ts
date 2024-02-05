import OAuthClient from 'intuit-oauth';

export default eventHandler(async (event) => {
    const client = useOAuth(event);
    
    const authUri = client.authorizeUri({scope:[OAuthClient.scopes.Accounting,OAuthClient.scopes.OpenId]});
    return await sendRedirect(event, authUri);
})