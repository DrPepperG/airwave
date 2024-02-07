import type { H3Event, EventHandlerRequest } from 'h3';
import type { WebhookEntity } from '../routes/webhook.post';
import { BaseManager } from "./BaseManager";
import { createItem, updateItem } from '@directus/sdk';

// #region Types
type Customer = {
    PrimaryEmailAddr: {
        Address: string,
    },
    SyncToken: string,
    domain: string,
    GivenName: string,
    DisplayName: string;
    BillWithParent: boolean,
    FullyQualifiedName: string,
    CompanyName: string,
    FamilyName: string,
    sparse: boolean,
    PrimaryPhone: {
        FreeFormNumber: string,
    },
    Active: boolean,
    Job: boolean,
    BalanceWithJobs: number,
    BillAddr: {
        City: string,
        Line1: string,
        PostalCode: string,
        Lat: string,
        Long: string,
        CountrySubDivisionCode: string,
        Id: string,
    },
    PreferredDeliveryMethod: string,
    Taxable: boolean,
    PrintOnCheckName: string,
    Balance: number,
    Id: string,
    MetaData: {
        CreateTime: string,
        LastUpdatedTime: string,
    },
    Notes: string
}
// #endregion

export class CustomerManager extends BaseManager {
    constructor(event: H3Event<EventHandlerRequest>, entity: WebhookEntity, realmId: string) {
        super(event, entity, realmId)
    }

    public async handle() {
        await this.init();

        const qbo = this.qbo;
        const entity = this.entity;
        const realmId = this.realmId;

        // We get the customer from quickbooks no matter what, webhook doesn't send anything
        const customer = await new Promise<Customer>((resolve, reject) => {
            qbo.getCustomer(entity.id, (err, customer: Customer) => {
                if (err) return reject(err);
                return resolve(customer);
            })
        }).catch(console.error);
        if (!customer) return;

        switch(this.entity.operation) {
            case 'Create':
                await this.create(customer, realmId);
                break;
            case 'Update':
                await this.update(customer, realmId);
                break;
        }
    }

    /**
     * Create the customer in our database
     */
    private async create(customer: Customer, realmId: string) {
        const directus = await useDirectus();

        await directus.request(createItem('customers', {
            quickbooks_id: customer.Id
        }))
    }

    /**
     * Update the customer in our database
     */
    private async update(customer: Customer, realmId: string) {
        const directus = await useDirectus();

        await directus.request(updateItem('customers', customer.Id, {
            //
        })).catch((reason) => {
            if (reason.response.status !== 403) return; // We get a 403 if the object doesn't exist
            this.create(customer, realmId);
        })
    }
}