import OAuthClient from 'intuit-oauth';

export default eventHandler(async (event) => {
    const { clientId, clientSecret, environment, redirectUri } = useRuntimeConfig(event)
    const client = new OAuthClient({
        clientId,
        clientSecret,
        environment,
        redirectUri
    })

    // Smart guys at intuit made us send the unparsed url string instead of an object
    const query = getRequestURL(event).search;
    client.createToken(query)
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err)
        });


    return 'ok';
})