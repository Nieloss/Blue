    const Discord = require('discord.js');

    // Config
    const config = require('../../config.json');
    const prefix = config.client.prefix;
    const embedColor = config.messageEmbed.color;

    const cooldowns = new Discord.Collection();

    module.exports = async (client, message) => {
        // Return if message doesn't start with prefix or if the author is a bot
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        // Define the used command
        const args = message.content.slice(prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName))

        // Return if the command doesn't exist or can't be found
        if (!command) return;

        // Add command to the cooldowns set if it wasn't added yet
        if (!cooldowns.has(command.command)) {
            cooldowns.set(command.command, new Discord.Collection());
        }

        // Variables for cooldown
        const now = Date.now();
        const timestamps = cooldowns.get(command.command);
        const cooldownAmount = (command.config.cooldown) * 1000;

        // Cooldown check
        if (timestamps.has(message.author.id)) {
            if (timestamps.has(message.author.id)) {
                const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

                // Check cooldown remaining
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    let reply = new Discord.MessageEmbed()
                        .setColor(embedColor)
                        .setDescription(`<@${message.author.id}>, please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.config.command}\` command!`);

                    return message.channel.send(reply);
                }
            }
        }

        // Set author ID in the set and delete it after the cooldown has expired
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        try {
            command.run(client, message, args);
        } catch (error) {
            console.error(error)
        }
    }