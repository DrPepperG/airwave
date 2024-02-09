import { Customer, CustomerManager } from "../classes/CustomerManager";

export default defineNitroPlugin(() => {
    cdcRequest();
});

async function cdcRequest() {
    const qbo = await useQuickbooks('9130357934593106');

    const queryResponse = await new Promise((resolve, reject) => {
        qbo.changeDataCapture('Customer', "2024-02-08T22:16:44.615Z", (err, data) => {
            if (err) return reject(err);
            return resolve(data.CDCResponse[0].QueryResponse);
        })
    })
    
    const validTypes = ['Customer'];
    for (const response of Object.values(queryResponse)) {
        const type = Object.keys(response)
            .filter((key) => { return validTypes.includes(key) })[0];
        const data = response[type];

        handleResponse(type, data)
    }
}

function handleResponse(type, data) {
    switch(type) {
        case 'Customer':
            handleCustomer(data)
            break;
    }
}

async function handleCustomer(data) {
    for (const key in data) {
        const customer: Customer = data[key];
        const databaseCustomer = await new CustomerManager()
            .getDbCustomer(customer.Id);

        console.log(customer.MetaData.LastUpdatedTime, databaseCustomer.date_updated);
    }
}
