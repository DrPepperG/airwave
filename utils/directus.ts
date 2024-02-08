import { createDirectus, rest, staticToken } from '@directus/sdk';

export async function useDirectus() {
    const { directusUrl, directusToken } = useRuntimeConfig();
    const client = createDirectus(directusUrl).with(rest()).with(staticToken(directusToken));

    return client;
}