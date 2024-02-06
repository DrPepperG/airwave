import Quickbooks from 'node-quickbooks';

export function useQuickbooks(access_token: string, realmId: string) {
    if (!access_token || !realmId) { 
        throw new Error('You must supply required parameters!');
    }
}