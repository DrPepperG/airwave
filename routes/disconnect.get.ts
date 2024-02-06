/**
 * We really don't need to handle disconnections for our use case, it's literally just made for us.
 * If we need to disable it quickbooks will invalidate it and we can remove it from the database from our manager.
 * 
 * To the person seeing this for some reason in the future, yes I am not spending any more time on a function that will see no use.
 * Especially since there is zero documentation on the best method of handling disconnection requests
 */
export default eventHandler(async (event) => {
    const { mainRedirect } = useRuntimeConfig(event);
    return sendRedirect(event, mainRedirect);
})