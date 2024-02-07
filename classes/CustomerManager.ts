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

        const customer = await new Promise((resolve, reject) => {
            qbo.getCustomer(entity.id, (err, customer) => {
                if (err) return reject(err);
                return resolve(customer);
            })
        }).catch(console.error);
        if (!customer) return;

        console.log(customer, 'ddd')
    }
}