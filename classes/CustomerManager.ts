import type { OperationType } from '../routes/webhook.post';
import { BaseManager } from "./BaseManager";
import { createItem, updateItem } from '@directus/sdk';

// #region Types
type Customer = {
    Active: boolean,
    AlternatePhone?: {
        FreeFormNumber: string,
    }
    Balance: number,
    BalanceWithJobs: number,
    BillAddr: {
        City: string,
        CountrySubDivisionCode: string,
        Id: string,
        Lat: string,
        Line1: string,
        Line2?: string,
        Long: string,
        PostalCode: string,
    },
    BillWithParent: boolean,
    CompanyName: string,
    DefaultTaxCodeRef: {
        value: string,
    },
    DisplayName: string;
    domain: string,
    FamilyName: string,
    FullyQualifiedName: string,
    GivenName: string,
    Id: string,
    Job: boolean,
    Level?: number,
    MetaData: {
        CreateTime: string,
        LastUpdatedTime: string,
    },
    MiddleName?: string,
    Mobile?: {
        FreeFormNumber: string,
    },
    Notes: string,
    ParentRef: {
        value: string,
    },
    PreferredDeliveryMethod: string,
    PrimaryEmailAddr: {
        Address: string,
    },
    PrimaryPhone: {
        FreeFormNumber: string,
    },
    PrintOnCheckName: string,
    ShipAddr: {
        City: string,
        CountrySubDivisionCode: string,
        Id: string,
        Lat: string,
        Line1: string,
        Line2?: string,
        Long: string,
        PostalCode: string,
    }
    Sparse: boolean,
    SyncToken: string,
    Taxable: boolean,
}

type DatabaseCustomer = {
    active: boolean,
    // ID
    quickbooks_id: string,
    // Name
    display_name: string,
    first_name: string,
    middle_name?: string,
    last_name: string,
    // Sub customer?
    parent_id?: string,
    level: number,
    // Email and phone
    primary_email?: string,
    primary_phone?: string,
    mobile_phone?: string,
    alt_phone?: string,
    // Address
    bill_address_line1: string,
    bill_address_line2?: string,
    bill_city: string,
    bill_zipcode: string,
    bill_state: string,
    // Ship address
    ship_address_line1: string,
    ship_address_line2?: string,
    ship_city: string,
    ship_zipcode: string,
    ship_state: string,
    // Sales tax
    sales_tax_id: string,
}
// #endregion

export class CustomerManager extends BaseManager {
    constructor(realmId: string) {
        super(realmId)
    }

    public async handle(customerId: string, operation: OperationType) {
        await this.init();

        const qbo = this.qbo;

        // We get the customer from quickbooks no matter what, webhook doesn't send anything
        const customer = await new Promise<Customer>((resolve, reject) => {
            qbo.getCustomer(customerId, (err, customer: Customer) => {
                if (err) return reject(err);
                return resolve(customer);
            })
        }).catch(console.error);
        if (!customer) return;

        const databaseCustomer: DatabaseCustomer = {
            active: customer.Active,
            quickbooks_id: customer.Id,
            // Name
            display_name: customer.DisplayName,
            first_name: customer.GivenName,
            middle_name: customer.MiddleName,
            last_name: customer.FamilyName,
            // Sub customer?
            parent_id: customer.ParentRef ? customer.ParentRef.value : null,
            level: customer.Level,
            // Email and phone
            primary_email: customer.PrimaryEmailAddr ? customer.PrimaryEmailAddr.Address : null,
            primary_phone: customer.PrimaryPhone ? customer.PrimaryPhone.FreeFormNumber : null,
            alt_phone: customer.AlternatePhone ? customer.AlternatePhone.FreeFormNumber : null,
            mobile_phone: customer.Mobile ? customer.Mobile.FreeFormNumber : null,
            // Address
            bill_address_line1: customer.BillAddr.Line1,
            bill_address_line2: customer.BillAddr.Line2,
            bill_city: customer.BillAddr.City,
            bill_zipcode: customer.BillAddr.PostalCode,
            bill_state: customer.BillAddr.CountrySubDivisionCode,
            // Shipping address
            ship_address_line1: customer.BillAddr.Line1,
            ship_address_line2: customer.BillAddr.Line2,
            ship_city: customer.BillAddr.City,
            ship_zipcode: customer.BillAddr.PostalCode,
            ship_state: customer.BillAddr.CountrySubDivisionCode,
            // Sales tax,
            sales_tax_id: customer.DefaultTaxCodeRef ? customer.DefaultTaxCodeRef.value : null
        }

        switch(operation) {
            case 'Create':
                await this.create(databaseCustomer);
                break;
            case 'Update':
                await this.update(databaseCustomer);
                break;
        }
    }

    /**
     * Create the customer in our database
     */
    private async create(databaseCustomer: DatabaseCustomer) {
        const directus = await useDirectus();

        await directus.request(createItem('customers', databaseCustomer))
    }

    /**
     * Update the customer in our database
     */
    private async update(databaseCustomer: DatabaseCustomer) {
        const directus = await useDirectus();

        await directus.request(updateItem('customers', databaseCustomer.quickbooks_id, databaseCustomer))
            .catch((reason) => {
                if (reason.response.status !== 403) return; // We get a 403 if the object doesn't exist
                this.create(databaseCustomer);
            })
    }
}