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

type WebhookResponse = {
    eventNotifications: {
        realmId: string,
        dataChangeEvent: {
            entities: WebhookEntity[]
        }
    }[]
}
// #endregion

export default eventHandler(async (event) => {
    const body = await readBody(event);

    const validSignature = new VerifySignature()
        .isRequestValid(getHeaders(event), body, useRuntimeConfig(event).verifyToken);
    if (!validSignature) {
        return setResponseStatus(event, 401);
    }

    // Do not wait for this to finish, we need to respond to the intuit server
    handleWebhook(event);

    return setResponseStatus(event, 200);
})

function handleWebhook(event: H3Event<EventHandlerRequest>) {
    // start
}