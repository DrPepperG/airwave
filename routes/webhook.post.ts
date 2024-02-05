import { VerifySignature } from "../classes/VerifySignature"

export default eventHandler(async (event) => {
    const body = await readBody(event);

    const validSignature = new VerifySignature()
        .isRequestValid(getHeaders(event), body, useRuntimeConfig(event).verifyToken);
    if (!validSignature) {
        return setResponseStatus(event, 401);
    }

    console.log(JSON.stringify(body));

    return 'hi';
})