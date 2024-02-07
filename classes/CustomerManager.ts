import type { H3Event, EventHandlerRequest } from 'h3';
import type { WebhookEntity } from '../routes/webhook.post';
import { BaseManager } from "./BaseManager";


export class CustomerManager extends BaseManager {
    constructor(event: H3Event<EventHandlerRequest>, entity: WebhookEntity, realmId: string) {
        super(event, entity, realmId)
    }

    public async handle() {
        await this.init();

        switch(this.entity.operation) {
            case 'Update':
                this.update();
                break;
        }
    }

    private async update() {
        const qbo = this.qbo;
        const entity = this.entity;

        qbo.getCustomer(entity.id, (err, customer) => {
            console.log(customer);
        })
    }
}