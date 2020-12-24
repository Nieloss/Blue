    const Discord = require('discord.js');
    const fs = require('fs');

    // Config
    const config = require('../../config.json');
    const prefix = config.client.prefix;
    const messageEmbedColor = config.messageEmbed.color;
    const cantExecuteCommandInDMs = config.messageEmbed.error.cantExecuteCommandInDMs;
    const youRanOutOfTime = config.messageEmbed.error.youRanOutOfTime;
    const notAllowedToSetGameCodes = config.messageEmbed.error.notAllowedToSetGameCodes;
    const notAllowedToResetGameCodes = config.messageEmbed.error.notAllowedToResetGameCodes;

    // Date
    const d = new Date();
    const hhmmss = d.toLocaleTimeString();

    module.exports.run = async (client, message, args) => {
        // If command is sent in a DM, return with a MessageEmbed that the bot can't execute the command in DMs
        if (this.config.guildOnly === true && message.channel.type !== 'text') {
            const replyEmbed = new Discord.MessageEmbed()
                .setColor(messageEmbedColor)
                .setAuthor('Command cannot be executed in DMs', message.author.displayAvatarURL())
                .setDescription(`Please execute this command in the **${client.guilds.cache.get('760239559728037948').name}** server.`)
                .setImage(cantExecuteCommandInDMs)
                .setFooter('Error', client.user.displayAvatarURL())

            return message.channel.send(replyEmbed);
        }

        if (!args[0]) {
            fs.readFile('./commands/games/gamecode.json', 'utf-8', function (err, data) {
                const gamecodeJSON = JSON.parse(data);
                const gamecode = gamecodeJSON[0];

                const replyEmbed = new Discord.MessageEmbed()
                    .setColor(messageEmbedColor)
                    .setAuthor('Game code', message.author.displayAvatarURL())
                    .setDescription(`The game code for the current game is displayed below! \n\n **${gamecode}**`)

                return message.channel.send(replyEmbed);
            });
        }

        if (args[0] === 'set') {
            // Return if the author doesn't have the required role
            if (!message.member.roles.cache.has('788103338067624007')) {
                const replyEmbed = new Discord.MessageEmbed()
                    .setColor(messageEmbedColor)
                    .setAuthor(`Required role missing`, message.author.displayAvatarURL())
                    .setDescription(`You need the **<@&788103338067624007>** role in order to set game codes.`)
                    .setImage(notAllowedToSetGameCodes)
                    .setFooter('Error', client.user.displayAvatarURL())

                return message.channel.send(replyEmbed);
            }

            // Embed to ask for user input
            const dateEmbed = new Discord.MessageEmbed()
                .setColor(messageEmbedColor)
                .setAuthor(`Game code`, message.author.displayAvatarURL())
                .setDescription(`Please enter the game code you'd like to set.`)
                .addField('Example', `JEOCJQ`)
                .setFooter('You have 20 seconds to reply to this message.', client.user.displayAvatarURL());

            await message.channel.send(dateEmbed);

            message.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1, time: 20000})
                .then(collected => {
                    const messageContent = collected.first().content;

                    fs.readFile('./commands/games/gamecode.json', 'utf-8', function (err, data) {
                        const gamecodeJSON = JSON.parse(data);

                        gamecodeJSON[0] = messageContent.toUpperCase();

                        // Write to JSON file
                        fs.writeFile('./commands/games/gamecode.json', JSON.stringify(gamecodeJSON), 'utf-8', function (err) {
                            if (err) throw err;

                            const confirmEmbed = new Discord.MessageEmbed()
                                .setColor(messageEmbedColor)
                                .setAuthor(`New game code set!`, message.author.displayAvatarURL())
                                .setDescription(`The new game code has been set to ${gamecodeJSON[0]}`)
                                .setFooter('Use "!gamecode" to retrieve the current game code', client.user.displayAvatarURL())

                            message.channel.send(confirmEmbed);

                            console.info(`[${hhmmss} | SCHEDULE] New game code set: ${gamecodeJSON[0]}`);
                        });
                    });

                })
                // Return if the user ran out of reply time
                .catch(() => {
                    const replyEmbed = new Discord.MessageEmbed()
                        .setColor(messageEmbedColor)
                        .setAuthor(`You ran out of time`, message.author.displayAvatarURL())
                        .setDescription(`Keep in mind you only have **20** seconds to reply to my message!`)
                        .setImage(youRanOutOfTime)
                        .setFooter('Error', client.user.displayAvatarURL())

                    return message.channel.send(replyEmbed);
                });
        }

        if (args[0] === 'reset') {
            // Return if the author doesn't have the required role
            if (!message.member.roles.cache.has('788103338067624007')) {
                const replyEmbed = new Discord.MessageEmbed()
                    .setColor(messageEmbedColor)
                    .setAuthor(`Required role missing`, message.author.displayAvatarURL())
                    .setDescription(`You need the **<@&788103338067624007>** role in order to reset game codes.`)
                    .setImage(notAllowedToResetGameCodes)
                    .setFooter('Error', client.user.displayAvatarURL())

                return message.channel.send(replyEmbed);
            }

            fs.readFile('./commands/games/gamecode.json', 'utf-8', function (err, data) {
                const gamecodeJSON = JSON.parse(data);

                gamecodeJSON[0] = "None";

                // Write to JSON file
                fs.writeFile('./commands/games/gamecode.json', JSON.stringify(gamecodeJSON), 'utf-8', function (err) {
                    if (err) throw err;

                    const confirmEmbed = new Discord.MessageEmbed()
                        .setColor(messageEmbedColor)
                        .setAuthor(`Game code reset!`, message.author.displayAvatarURL())
                        .setDescription(`The new game code has been set to **${gamecodeJSON[0]}**`)
                        .setFooter('Use "!gamecode" to retrieve the current game code', client.user.displayAvatarURL())

                    message.channel.send(confirmEmbed);

                    console.info(`[${hhmmss} | SCHEDULE] Game code reset.`);
                });
            });
        }
    }

    module.exports.config = {
        command: 'gamecode',
        aliases: ['gc', 'invitecode', 'ic'],
        description: 'Displays the current game code',
        usage: null,
        example: null,
        cooldown: 0,
        guildOnly: true
    }
