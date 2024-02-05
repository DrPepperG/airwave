export default eventHandler((event) => {
    const { mainRedirect } = useRuntimeConfig(event);
    return sendRedirect(event, mainRedirect);
})
