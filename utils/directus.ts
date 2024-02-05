import type { H3Event } from 'h3';
import { createDirectus, rest, staticToken } from '@directus/sdk';

export async function useDirectus(event: H3Event) {
    const { directusUrl, directusToken } = useRuntimeConfig(event);
    const client = createDirectus(directusUrl).with(rest()).with(staticToken(directusToken));

    return client;
}