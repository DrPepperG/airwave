import { Customer, CustomerManager } from "../classes/CustomerManager";
import { readItems } from '@directus/sdk';
import cron from 'node-cron';

export default defineNitroPlugin(() => {
    const { environment } = useRuntimeConfig();

    if (environment === 'production') {
        console.log('Service started, asking for any data changes within last 24 hours.')
        cdcRequest(true);
    }

    cron.schedule('0 0 * * *', () => {
        cdcRequest();
    }, {
        timezone: 'America/New_York'
    });
});

async function cdcRequest(forceUpdate = false) {
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
        const yesterdayDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000));

        // Contact quickbooks for recent updates
        const types = ['Customer'];
        const queryResponse = await new Promise((resolve, reject) => {
            qbo.changeDataCapture(types, yesterdayDate, (err, data) => {
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

            handleResponse(type, data, realm.realm_id, forceUpdate)
        }
    }
}

function handleResponse(type, data, realmId: string, forceUpdate: boolean) {
    console.log(`Running CDC on ${type} entries`);

    switch(type) {
        case 'Customer':
            handleCustomer(data, realmId, forceUpdate)
            break;
    }
}

async function handleCustomer(data, realmId: string, forceUpdate: boolean) {
    for (const key in data) {
        const customer: Customer = data[key];
        const databaseCustomer = await new CustomerManager()
            .getDbCustomer(customer.Id);

        const qboLastUpdated = new Date(customer.MetaData.LastUpdatedTime);
        const databaseLastUpdated = new Date(databaseCustomer.date_updated);
        if (!forceUpdate && (qboLastUpdated <= databaseLastUpdated)) {
            console.log(`Database has up to date version of Customer id ${customer.Id}`);
            continue;
        }

        console.log(`Database does not have recent version of Customer id ${customer.Id}, updating now`);
        new CustomerManager(realmId)
            .handle(customer.Id, 'Update');
    }
}
