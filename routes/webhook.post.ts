import { H3Event, EventHandlerRequest } from 'h3';
import { VerifySignature } from "../classes/VerifySignature"

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

type OperationType = "Create" | "Update" | "Merge" | "Remove";

type WebhookEntity = {
    name: WebhookType,
    id: string,
    operation: OperationType,
    lastUpdated: string,
    deletedID?: string
}

export type WebhookResponse = {
    eventNotifications: {
        realmId: string,
        dataChangeEvent: {
            entities: WebhookEntity[]
        }
    }[]
}
// #endregion

export default eventHandler(async (event) => {
    const payload: WebhookResponse = await readBody(event);

    const { verifyToken } = useRuntimeConfig(event);
    const validSignature = new VerifySignature()
        .isRequestValid(getHeaders(event), payload, verifyToken);
    if (!validSignature) {
        return setResponseStatus(event, 401);
    }

    // Do not wait for this to finish, we need to respond to the intuit server
    handleWebhook(event, payload);

    return setResponseStatus(event, 200);
})

async function handleWebhook(event: H3Event<EventHandlerRequest>, payload: WebhookResponse) {
    console.log(event, payload.eventNotifications);
}