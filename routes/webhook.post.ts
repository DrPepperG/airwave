import type { H3Event, EventHandlerRequest } from 'h3';
import { VerifySignature } from "../classes/VerifySignature"
import { CustomerManager } from '../classes/CustomerManager';

// #region Types
export type OperationType = "Create" | "Update" | "Merge" | "Remove";

export type CloudEventNotification = {
    specversion: "1.0",
    id: string,
    source: string,
    type: "qbo.customer.created.v1"
        | "qbo.customer.deleted.v1"
        | "qbo.customer.merged.v1"
        | "qbo.customer.updated.v1"
    datacontenttype: "application/json",
    time: string,
    intuitentityid: string,
    intuitaccountid: string,
    data: {}
}
// #endregion

export default eventHandler(async (event) => {
    const payload: CloudEventNotification[] = await readBody(event);

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
function initWebhook(event: H3Event<EventHandlerRequest>, payload: CloudEventNotification[]) {
    for (const notification of Object.values(payload)) {
        handleWebhook(event, notification);
    }
}

async function handleWebhook(event: H3Event<EventHandlerRequest>, notification: CloudEventNotification) {
    const realmId = notification.intuitaccountid;
    const entityId = notification.intuitentityid;

    switch(notification.type) {
        case 'qbo.customer.created.v1':
            new CustomerManager(realmId)
                .handle(entityId, 'Create');
            break;
        case 'qbo.customer.deleted.v1':
            new CustomerManager(realmId)
                .handle(entityId, 'Remove');
        case 'qbo.customer.merged.v1':
            new CustomerManager(realmId)
                .handle(entityId, 'Merge');
        case 'qbo.customer.updated.v1':
            new CustomerManager(realmId)
                .handle(entityId, 'Update');
        default:
            console.log(`Unhandled webhook event`, event, notification, realmId)
            break;
    }
}