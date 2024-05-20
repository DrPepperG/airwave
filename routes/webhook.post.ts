import type { H3Event, EventHandlerRequest } from 'h3';
import { VerifySignature } from "../classes/VerifySignature"
import { CustomerManager } from '../classes/CustomerManager';

// #region Types
type WebhookType =
  | "Account"
  | "BillPayment"
  | "Class"
  | "Customer"
  | "Employee"
  | "Estimate"
  | "Invoice"
  | "Item"
  | "Payment"
  | "Purchase"
  | "SalesReciept"
  | "Vendor"
  | "Bill"
  | "CreditMemo"
  | "RefundReceipt"
  | "VendorCredit"
  | "TimeActivity"
  | "Department"
  | "Deposit"
  | "JournalEntry"
  | "PaymentMethod"
  | "Preferences"
  | "PurchaseOrder"
  | "TaxAgency"
  | "Term"
  | "Transfer"
  | "Budget"
  | "Currency"
  | "JournalCode";

export type OperationType = "Create" | "Update" | "Merge" | "Remove";

export type WebhookEntity = {
    name: WebhookType,
    id: string,
    operation: OperationType,
    lastUpdated: string,
    deletedId?: string
}

export type EventNotification = {
    realmId: string,
    dataChangeEvent: {
        entities: WebhookEntity[]
    }
}

export type WebhookResponse = {
    eventNotifications: EventNotification[]
}
// #endregion

export default eventHandler(async (event) => {
    const payload: WebhookResponse = await readBody(event);

    // Make sure this data is coming from intuit
    const { verifyToken } = useRuntimeConfig(event);
    const validSignature = new VerifySignature()
        .isRequestValid(getHeaders(event), payload, verifyToken);
    if (!validSignature) {
        return setResponseStatus(event, 401);
    }

    // Do not wait for this to finish, we need to respond to the intuit server
    initWebhook(event, payload);

    return setResponseStatus(event, 200);
})

/**
 * We can recieve multiple companies from the webhook,
 * handle that here instead of in the main func
 */
function initWebhook(event: H3Event<EventHandlerRequest>, payload: WebhookResponse) {
    for (const notification of Object.values(payload.eventNotifications)) {
        handleWebhook(event, notification);
    }
}

async function handleWebhook(event: H3Event<EventHandlerRequest>, notification: EventNotification) {
    const realmId = notification.realmId
    const entities = notification.dataChangeEvent.entities

    // Need to sort ents based on date

    for (const entity of Object.values(entities)) {
        switch(entity.name) {
            case 'Customer':
                console.log(`Received webhook for customerId ${entity.id}`)
                // Also update the deleted customer if we merge
                if (entity.operation === 'Merge') {
                    new CustomerManager(realmId)
                        .handle(entity.deletedId, entity.operation)
                }
                new CustomerManager(realmId)
                    .handle(entity.id, entity.operation)
                break;
            default:
                console.log(`Unhandled webhook event`, event, notification, realmId)
                break;
        }
    }
}