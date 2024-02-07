import type { H3Event, EventHandlerRequest } from 'h3';
import type { WebhookEntity } from '../routes/webhook.post';

export class BaseManager {
    constructor(event: H3Event<EventHandlerRequest>, entity: WebhookEntity, realmId: string) {
        this.event = event;
        this.entity = entity;
        this.realmId = realmId;
    }

    /**
     * Webhook http event
     */
    public event: H3Event<EventHandlerRequest>;

    /**
     * Entity sent from webhook
     */
    public entity: WebhookEntity;

    /**
     * Company ID
     */
    public realmId: string;
}