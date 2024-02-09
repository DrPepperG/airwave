export class BaseManager {
    constructor(realmId?: string) {
        this.realmId = realmId;

    }

    public async init() {
        if (!this.realmId) return;
        this.qbo = await useQuickbooks(this.realmId);
    }

    /**
     * Company ID
     */
    public realmId: string;

    /**
     * Instance of quickbooks manager
     */
    public qbo: any;
}