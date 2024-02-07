import type { H3Event, EventHandlerRequest } from 'h3';
import type { WebhookEntity } from '../routes/webhook.post';
import { BaseManager } from "./BaseManager";


export class CustomerManager extends BaseManager {
    constructor(event: H3Event<EventHandlerRequest>, entity: WebhookEntity, realmId: string) {
        super(event, entity, realmId)
    }

    public handle() {
    }
}