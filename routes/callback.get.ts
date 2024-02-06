export default eventHandler(async (event) => {
    const client = useOAuth();

    // Smart guys at intuit made us send the unparsed url string instead of an object
    const query = getRequestURL(event).search;
    client.createToken(query)
        .then((res) => {
            console.log('The Token is  ' + JSON.stringify(res.getJson()));
        })
        .catch((err) => {
            console.log(err)
        });

    return 'ok';
})