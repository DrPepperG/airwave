import type { RequestHeaders } from 'h3';
import * as crypto from 'node:crypto';

export class VerifySignature {
    private static readonly SIGNATURE = 'intuit-signature';
    private static readonly ALGORITHM = 'sha256';

    public isRequestValid(headers: RequestHeaders, payload: string, verifier: string): boolean {
        const signature = headers[VerifySignature.SIGNATURE];
        if (!signature) {
            return false;
        }

        try {
            const secretKey = crypto.createHmac(VerifySignature.ALGORITHM, verifier);
            secretKey.update(JSON.stringify(payload), 'utf-8');
            const hash = secretKey.digest('base64');

            return hash === signature;
        } catch (error) {
            return false;
        }
    }
}