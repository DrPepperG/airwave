//https://nitro.unjs.io/config
export default defineNitroConfig({
    runtimeConfig: {
        // OAuth
        clientId: "",
        clientSecret: "",
        environment: "sandbox",
        redirectUri: "",
        // Webhook
        verifyToken: "",
        // Directus
        directusUrl: "",
        directusToken: ""
    },
    experimental: {
        asyncContext: true
    }
});
