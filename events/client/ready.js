    module.exports = async (client) => {
        const date = new Date();
        const localTime = date.toLocaleTimeString();

        console.info(`[${localTime} | LOGIN] ${client.user.tag} has logged in.`);
    }