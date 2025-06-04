import { Customer, CustomerManager } from "../classes/CustomerManager";
import { readItems } from '@directus/sdk';
import cron from 'node-cron';

export default defineNitroPlugin(() => {
    const { environment } = useRuntimeConfig();

    if (environment === 'production') {
        console.log('Service started, asking for any data changes within last 31 days.')
        cdcRequest(31);
    }

    cron.schedule('0 0 * * *', () => {
        cdcRequest();
    }, {
        timezone: 'America/New_York'
    });
});

async function cdcRequest(daysTo = 1) {
    // Get all the realms we have active (future proofing)
    const directus = await useDirectus();
    const realms = await directus.request(readItems('quickbooks_oauth', {
            fields: ['realm_id']
        }))
        .then((res) => {
            return res;
        })
        .catch(console.error);
    if (!realms) return;

    for (const realm of Object.values(realms)) {
        const qbo = await useQuickbooks(realm.realm_id);

        const currentDate = new Date()
        const daysBack = new Date(currentDate.getTime() - ((daysTo * 24) * 60 * 60 * 1000));
        console.log(`Running request with ${daysTo} day(s)`);

        // Contact quickbooks for recent updates
        const types = ['Customer'];
        const queryResponse = await new Promise((resolve, reject) => {
            qbo.changeDataCapture(types, daysBack, (err, data) => {
                if (err) return reject(err);
                return resolve(data.CDCResponse[0].QueryResponse);
            })
        })
        if (!queryResponse) return;
        
        for (const response of Object.values(queryResponse)) {
            const type = Object.keys(response)
                .filter((key) => { return types.includes(key) })[0];
            const data = response[type];
            if (!type || !data) return;

            handleResponse(type, data, realm.realm_id)
        }
    }
}

function handleResponse(type, data, realmId: string) {
    console.log(`Running CDC on ${type} entries`);

    // Create a chunk so we don't spam the intuit API on large change requests
    const chunks = [];
    const chunkSize = 10;
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        chunks.push(chunk);
    }

    chunks.forEach((chunk, index) => {
        console.log(`Setup chunk on index ${index}`);
        setTimeout(() => {
            console.log(`Running chunk on index ${index}`);

            switch(type) {
                case 'Customer':
                    handleCustomer(chunk, realmId)
                    break;
            }
        }, index * 10000);
    });
}

async function handleCustomer(data, realmId: string) {
    for (const key in data) {
        const customer: Customer = data[key];
        const databaseCustomer = await new CustomerManager()
            .getDbCustomer(customer.Id);
        
        if (!databaseCustomer) {
            new CustomerManager(realmId)
                .handle(customer.Id, 'Create');
            console.log(`Database does not have customer, creating Customer ${customer.Id}`);
            continue;
        } 

        if (customer.SyncToken == databaseCustomer.sync_token) {
            console.log(`Database has up to date version of Customer id ${customer.Id}`);
            continue;
        }

        console.log(`Database does not have recent version of Customer id ${customer.Id}, updating now`);
        new CustomerManager(realmId)
            .handle(customer.Id, 'Update');
    }
}
