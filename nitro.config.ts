//https://nitro.unjs.io/config
export default defineNitroConfig({
    runtimeConfig: {
        // App
        appKey: "",
        debug: false,
        // Main Redirect
        mainRedirect: "https://google.com",
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
