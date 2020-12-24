    const Discord = require('discord.js');
    const fs = require('fs');

    // Config
    const config = require('../../config.json');
    const prefix = config.client.prefix;
    const messageEmbedColor = config.messageEmbed.color;
    const noArgumentsProvided = config.messageEmbed.error.noArgumentsProvided;
    const cantExecuteCommandInDMs = config.messageEmbed.error.cantExecuteCommandInDMs;
    const notAllowedToCreateScheduledGames = config.messageEmbed.error.notAllowedToCreateScheduledGames;
    const notAllowedToRemoveScheduledGames = config.messageEmbed.error.notAllowedToRemoveScheduledGames;
    const notAllowedToEditScheduledGames = config.messageEmbed.error.notAllowedToEditScheduledGames;
    const scheduleListEmpty = config.messageEmbed.error.scheduleListEmpty;
    const youRanOutOfTime = config.messageEmbed.error.youRanOutOfTime;
    const didntReplyWithValidNumber = config.messageEmbed.error.didntReplyWithValidNumber;

    // Date
    const d = new Date();
    function addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

    const hours = addZero(d.getHours());
    const minutes = addZero(d.getMinutes());

    const ddmmyyyy = `${d.getDate()}-${d.getMonth()}-${d.getFullYear()}`;
    const hhmm = `${hours}:${minutes}`;
    const hhmmss = d.toLocaleTimeString();

    module.exports.run = async (client, message, args) => {
        // If args are not provided, return with a MessageEmbed that there were no args provided
        if (!args.length) {
            const replyEmbed = new Discord.MessageEmbed()
                .setColor(messageEmbedColor)
                .setAuthor('No arguments provided', message.author.displayAvatarURL())
                .setDescription(`Please check the correct usage of this command below and try again!`)
                .addField('!schedule new', 'Create a new scheduled game.')
                .addField('!schedule list', 'Retrieve a list of scheduled games.')
                .setImage(noArgumentsProvided)
                .setFooter('Error', client.user.displayAvatarURL())

            return message.channel.send(replyEmbed);
        }

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

        if (args[0] === 'new') {
            // Return if the author doesn't have the required role
            if (!message.member.roles.cache.has('788103338067624007')) {
                const replyEmbed = new Discord.MessageEmbed()
                    .setColor(messageEmbedColor)
                    .setAuthor(`Required role missing`, message.author.displayAvatarURL())
                    .setDescription(`You need the **<@&788103338067624007>** role in order to create scheduled games.`)
                    .setImage(notAllowedToCreateScheduledGames)
                    .setFooter('Error', client.user.displayAvatarURL())

                return message.channel.send(replyEmbed);
            }

            // Embed to ask for user input
            const dateEmbed = new Discord.MessageEmbed()
                .setColor(messageEmbedColor)
                .setAuthor(`Date`, message.author.displayAvatarURL())
                .setDescription(`Please type the date you want to schedule a game for.`)
                .addField('Example', `December 24th 2PM <TIMEZONE>`)
                .setFooter('You have 20 seconds to reply to this message.', client.user.displayAvatarURL());

            await message.channel.send(dateEmbed);

            // Ask for user input
            await message.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1, time: 20000})
                .then(collected => {
                    const messageContent = collected.first().content;

                    if (messageContent) {
                        // Read JSON file
                        fs.readFile('./commands/games/schedules.json', 'utf-8', function (err, data) {

                            let schedulesJSON = JSON.parse(data);

                            const newData = { "schedule": messageContent, "scheduledBy": message.author.id }
                            schedulesJSON.push(newData);

                            // Write to JSON file
                            fs.writeFile('./commands/games/schedules.json', JSON.stringify(schedulesJSON), 'utf-8', function (err) {
                                if (err) throw err;

                                const confirmEmbed = new Discord.MessageEmbed()
                                    .setColor(messageEmbedColor)
                                    .setAuthor(`New scheduled game set!`, message.author.displayAvatarURL())
                                    .addField('Date and time', messageContent, true)
                                    .addField('Scheduled by', `<@${message.author.id}>`, true)
                                    .setFooter('Use "!schedule list" to retrieve a list of all scheduled games.', client.user.displayAvatarURL())

                                message.channel.send(confirmEmbed);

                                console.info(`[${hhmmss} | SCHEDULE] New scheduled game added: ${JSON.stringify(newData)}`);
                            });
                        });
                    }
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

        if (args[0] === 'list') {
            fs.readFile('./commands/games/schedules.json', 'utf-8', function (err, data) {
                if (err) throw err;

                let schedulesArray = JSON.parse(data);

                let schedulesEmbed = ''

                schedulesArray.forEach(schedule => {
                    let index = schedulesArray.indexOf(schedule);
                    schedulesEmbed += `\n ID: ${index} - **${schedule.schedule}**, *scheduled by <@${schedule.scheduledBy}>*`;
                });

                const listEmbed = new Discord.MessageEmbed()
                    .setColor(messageEmbedColor)
                    .setAuthor(`List of scheduled games`, message.author.displayAvatarURL())
                    .setDescription(`A list of all scheduled games is displayed below, including the person who scheduled the game! \n ${schedulesEmbed}`)
                    .setFooter(`Use "!schedule remove" to remove a scheduled game by it's ID. Use "!schedule edit" to edit a scheduled game by it's ID.`, client.user.displayAvatarURL());

                return message.channel.send(listEmbed);
            });
        }

        if (args[0] === 'remove') {
            // Return if the author doesn't have the required role
            if (!message.member.roles.cache.has('788103338067624007')) {
                const replyEmbed = new Discord.MessageEmbed()
                    .setColor(messageEmbedColor)
                    .setAuthor(`Required role missing`, message.author.displayAvatarURL())
                    .setDescription(`You need the **<@&788103338067624007>** role in order to remove scheduled games.`)
                    .setImage(notAllowedToRemoveScheduledGames)
                    .setFooter('Error', client.user.displayAvatarURL())

                return message.channel.send(replyEmbed);
            }

            fs.readFile('./commands/games/schedules.json', 'utf-8', function (err, data) {
                let schedulesJSON = JSON.parse(data);

                if (schedulesJSON.length === 0) {
                    const replyEmbed = new Discord.MessageEmbed()
                        .setColor(messageEmbedColor)
                        .setAuthor(`No schedules`, message.author.displayAvatarURL())
                        .setDescription(`You can't remove schedules since the schedule list is empty!`)
                        .setImage(scheduleListEmpty)
                        .setFooter('Error', client.user.displayAvatarURL())

                    return message.channel.send(replyEmbed);
                }

                // Embed to ask for user input
                const indexEmbed = new Discord.MessageEmbed()
                    .setColor(messageEmbedColor)
                    .setAuthor(`Scheduled game ID`, message.author.displayAvatarURL())
                    .setDescription(`Please type the ID of the scheduled game you want to remove.`)
                    .addField('Example', `1`)
                    .setFooter('You have 20 seconds to reply to this message.', client.user.displayAvatarURL());

                message.channel.send(indexEmbed);

                // Ask for user input
                message.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1, time: 20000})
                    .then(collected => {
                        const messageContent = collected.first().content;

                        if (messageContent) {
                            const index = parseInt(messageContent);

                            const replyEmbed = new Discord.MessageEmbed()
                                .setColor(messageEmbedColor)
                                .setAuthor(`Not a valid number given`, message.author.displayAvatarURL())
                                .setDescription(`You didn't reply with a valid number! Please enter a valid number when executing this command.`)
                                .addField('Example', `1`)
                                .setImage(didntReplyWithValidNumber)
                                .setFooter('Error', client.user.displayAvatarURL());

                            // Return if user didn't reply with a valid number
                            if (!Number.isInteger(index)) return message.channel.send(replyEmbed);

                            // Read JSON file
                            fs.readFile('./commands/games/schedules.json', 'utf-8', function (err, data) {
                                let schedulesJSON = JSON.parse(data);

                                if (index < 0 || index > schedulesJSON.length) {
                                    const replyEmbed = new Discord.MessageEmbed()
                                        .setColor(messageEmbedColor)
                                        .setAuthor(`Not a valid number given`, message.author.displayAvatarURL())
                                        .setDescription(`You didn't reply with a valid scheduled game ID! Please enter a valid scheduled game ID when executing this command.`)
                                        .setImage(didntReplyWithValidNumber)
                                        .setFooter('Error', client.user.displayAvatarURL());

                                    return message.channel.send(replyEmbed);
                                }

                                let elementToBeRemoved = schedulesJSON[index];

                                const confirmEmbed = new Discord.MessageEmbed()
                                    .setColor(messageEmbedColor)
                                    .setAuthor(`Confirm`, message.author.displayAvatarURL())
                                    .setDescription('Are you sure you want to remove this scheduled game?')
                                    .addField('Scheduled game', elementToBeRemoved.schedule, true)
                                    .addField('Scheduled by', `<@${elementToBeRemoved.scheduledBy}>`, true)
                                    .setFooter('Reply with "yes" to remove this scheduled game. Reply with "no" to cancel.', client.user.displayAvatarURL());

                                message.channel.send(confirmEmbed);

                                message.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1, time: 20000})
                                    .then(collected => {
                                        const messageContent = collected.first().content;

                                        if (messageContent.toLowerCase() !== 'yes' && messageContent.toLowerCase() !== 'no') {
                                            const replyEmbed = new Discord.MessageEmbed()
                                                .setColor(messageEmbedColor)
                                                .setAuthor(`Invalid reply`, message.author.displayAvatarURL())
                                                .setDescription(`Please try again and reply with **yes** to remove this scheduled game or reply with **no** to cancel.`)
                                                .setFooter('Error', client.user.displayAvatarURL());

                                            return message.channel.send(replyEmbed);
                                        }

                                        if (messageContent.toLowerCase() === 'yes') {
                                            const newSchedulesJSON = schedulesJSON.slice(0, index).concat(schedulesJSON.slice(index + 1, schedulesJSON.length))

                                            // Write to JSON file
                                            fs.writeFile('./commands/games/schedules.json', JSON.stringify(newSchedulesJSON), 'utf-8', function (err) {
                                                if (err) throw err;

                                                const confirmEmbed = new Discord.MessageEmbed()
                                                    .setColor(messageEmbedColor)
                                                    .setAuthor(`Scheduled game removed!`, message.author.displayAvatarURL())
                                                    .addField('Scheduled game', elementToBeRemoved.schedule, true)
                                                    .addField('Scheduled by', `<@${elementToBeRemoved.scheduledBy}>`, true)
                                                    .setFooter('Use "!schedule list" to retrieve a list of all scheduled games.', client.user.displayAvatarURL())

                                                message.channel.send(confirmEmbed);

                                                console.info(`[${hhmmss} | SCHEDULE] Schedule removed: ${JSON.stringify(elementToBeRemoved)}`);
                                            });
                                        }

                                        if (messageContent.toLowerCase() === 'no') {
                                            const cancelEmbed = new Discord.MessageEmbed()
                                                .setColor(messageEmbedColor)
                                                .setAuthor(`Canceled`, message.author.displayAvatarURL())
                                                .setDescription('You canceled the process to remove this scheduled game.')
                                                .addField('Scheduled game', elementToBeRemoved.schedule, true)
                                                .addField('Scheduled by', `<@${elementToBeRemoved.scheduledBy}>`, true)
                                                .setFooter('Use "!schedule list" to retrieve a list of all scheduled games.', client.user.displayAvatarURL())

                                            return message.channel.send(cancelEmbed);
                                        }
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
                            });
                        }
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
            });
        }

        if (args[0] === 'edit') {
            // Return if the author doesn't have the required role
            if (!message.member.roles.cache.has('788103338067624007')) {
                const replyEmbed = new Discord.MessageEmbed()
                    .setColor(messageEmbedColor)
                    .setAuthor(`Required role missing`, message.author.displayAvatarURL())
                    .setDescription(`You need the **<@&788103338067624007>** role in order to edit scheduled games.`)
                    .setImage(notAllowedToEditScheduledGames)
                    .setFooter('Error', client.user.displayAvatarURL())

                return message.channel.send(replyEmbed);
            }

            fs.readFile('./commands/games/schedules.json', 'utf-8', function (err, data) {
                let schedulesJSON = JSON.parse(data);

                if (schedulesJSON.length === 0) {
                    const replyEmbed = new Discord.MessageEmbed()
                        .setColor(messageEmbedColor)
                        .setAuthor(`No schedules`, message.author.displayAvatarURL())
                        .setDescription(`You can't edit schedules since the schedule list is empty!`)
                        .setImage(scheduleListEmpty)
                        .setFooter('Error', client.user.displayAvatarURL())

                    return message.channel.send(replyEmbed);
                }

                // Embed to ask for user input
                const indexEmbed = new Discord.MessageEmbed()
                    .setColor(messageEmbedColor)
                    .setAuthor(`Scheduled game ID`, message.author.displayAvatarURL())
                    .setDescription(`Please type the ID of the scheduled game you want to edit.`)
                    .addField('Example', `1`)
                    .setFooter('You have 20 seconds to reply to this message.', client.user.displayAvatarURL());

                message.channel.send(indexEmbed);

                // Ask for user input
                message.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1, time: 20000})
                    .then(collected => {
                        const messageContent = collected.first().content;

                        if (messageContent) {
                            const index = parseInt(messageContent);

                            const replyEmbed = new Discord.MessageEmbed()
                                .setColor(messageEmbedColor)
                                .setAuthor(`Not a valid number given`, message.author.displayAvatarURL())
                                .setDescription(`You didn't reply with a valid number! Please enter a valid number when executing this command.`)
                                .addField('Example', `1`)
                                .setImage(didntReplyWithValidNumber)
                                .setFooter('Error', client.user.displayAvatarURL());

                            // Return if user didn't reply with a valid number
                            if (!Number.isInteger(index)) return message.channel.send(replyEmbed);

                            // Read JSON file
                            fs.readFile('./commands/games/schedules.json', 'utf-8', function (err, data) {
                                let schedulesJSON = JSON.parse(data);

                                if (index < 0 || index > schedulesJSON.length) {
                                    const replyEmbed = new Discord.MessageEmbed()
                                        .setColor(messageEmbedColor)
                                        .setAuthor(`Not a valid number given`, message.author.displayAvatarURL())
                                        .setDescription(`You didn't reply with a valid scheduled game ID! Please enter a valid scheduled game ID when executing this command.`)
                                        .setImage(didntReplyWithValidNumber)
                                        .setFooter('Error', client.user.displayAvatarURL());

                                    return message.channel.send(replyEmbed);
                                }

                                let elementToBeEdited = schedulesJSON[index];

                                const confirmEmbed = new Discord.MessageEmbed()
                                    .setColor(messageEmbedColor)
                                    .setAuthor(`Confirm`, message.author.displayAvatarURL())
                                    .setDescription('Are you sure you want to edit this scheduled game?')
                                    .addField('Scheduled game', elementToBeEdited.schedule, true)
                                    .addField('Scheduled by', `<@${elementToBeEdited.scheduledBy}>`, true)
                                    .setFooter('Reply with "yes" to edit this scheduled game. Reply with "no" to cancel.', client.user.displayAvatarURL());

                                message.channel.send(confirmEmbed);

                                message.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1, time: 20000})
                                    .then(collected => {
                                        const messageContent = collected.first().content;

                                        if (messageContent.toLowerCase() !== 'yes' && messageContent.toLowerCase() !== 'no') {
                                            const replyEmbed = new Discord.MessageEmbed()
                                                .setColor(messageEmbedColor)
                                                .setAuthor(`Invalid reply`, message.author.displayAvatarURL())
                                                .setDescription(`Please try again and reply with **yes** to remove this scheduled game or reply with **no** to cancel.`)
                                                .setFooter('Error', client.user.displayAvatarURL());

                                            return message.channel.send(replyEmbed);
                                        }

                                        if (messageContent.toLowerCase() === 'yes') {
                                            const dataEmbed = new Discord.MessageEmbed()
                                                .setColor(messageEmbedColor)
                                                .setAuthor(`Enter new value`, message.author.displayAvatarURL())
                                                .setDescription('Please enter the new date and time for this scheduled game.')
                                                .addField('Scheduled game', elementToBeEdited.schedule, true)
                                                .addField('Scheduled by', `<@${elementToBeEdited.scheduledBy}>`, true)
                                                .setFooter('You have 20 seconds to reply to this message.', client.user.displayAvatarURL());

                                            message.channel.send(dataEmbed)

                                            message.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1, time: 20000})
                                                .then(collected => {
                                                    const messageContent = collected.first().content;

                                                    const newDate = messageContent;

                                                    if (messageContent) {
                                                        // Read JSON file
                                                        fs.readFile('./commands/games/schedules.json', 'utf-8', function (err, data) {

                                                            let schedulesJSON = JSON.parse(data);

                                                            const newData = { "schedule": messageContent, "scheduledBy": message.author.id }

                                                            const confirmEmbed = new Discord.MessageEmbed()
                                                                .setColor(messageEmbedColor)
                                                                .setAuthor(`Confirm`, message.author.displayAvatarURL())
                                                                .setDescription(`Are you sure you want to overwrite the scheduled game with ID ${index}`)
                                                                .addField('\u200B', 'From')
                                                                .addField('Scheduled game', elementToBeEdited.schedule, true)
                                                                .addField('Scheduled by', `<@${elementToBeEdited.scheduledBy}>`, true)
                                                                .addField('\u200B', 'To')
                                                                .addField('Scheduled game', newDate, true)
                                                                .addField('Scheduled by', `<@${message.author.id}>`, true)
                                                                .setFooter('Reply with "yes" to edit this scheduled game. Reply with "no" to cancel.', client.user.displayAvatarURL());

                                                            message.channel.send(confirmEmbed)

                                                            message.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1, time: 20000})
                                                                .then(collected => {
                                                                    const messageContent = collected.first().content;

                                                                    if (messageContent.toLowerCase() !== 'yes' && messageContent.toLowerCase() !== 'no') {
                                                                        const replyEmbed = new Discord.MessageEmbed()
                                                                            .setColor(messageEmbedColor)
                                                                            .setAuthor(`Invalid reply`, message.author.displayAvatarURL())
                                                                            .setDescription(`Please try again and reply with **yes** to remove this scheduled game or reply with **no** to cancel.`)
                                                                            .setFooter('Error', client.user.displayAvatarURL());

                                                                        return message.channel.send(replyEmbed);
                                                                    }

                                                                    if (messageContent.toLowerCase() === 'yes') {
                                                                        const oldSchedule = schedulesJSON[index];
                                                                        schedulesJSON[index] = newData;

                                                                        // Write to JSON file
                                                                        fs.writeFile('./commands/games/schedules.json', JSON.stringify(schedulesJSON), 'utf-8', function (err) {
                                                                            if (err) throw err;

                                                                            const confirmEmbed = new Discord.MessageEmbed()
                                                                                .setColor(messageEmbedColor)
                                                                                .setAuthor(`Schedule edited`, message.author.displayAvatarURL())
                                                                                .setDescription(`You edited the scheduled game with ID ${index}`)
                                                                                .addField('\u200B', 'From')
                                                                                .addField('Scheduled game', oldSchedule.schedule, true)
                                                                                .addField('Scheduled by', `<@${oldSchedule.scheduledBy}>`, true)
                                                                                .addField('\u200B', 'To')
                                                                                .addField('Scheduled game', newDate, true)
                                                                                .addField('Scheduled by', `<@${message.author.id}>`, true)
                                                                                .setFooter('Use "!schedule list" to retrieve a list of all scheduled games.', client.user.displayAvatarURL());

                                                                            message.channel.send(confirmEmbed);

                                                                            console.info(`[${hhmmss} | SCHEDULE] Schedule edited: from ${JSON.stringify(oldSchedule)} to ${JSON.stringify(newData)}`);
                                                                        });
                                                                    }

                                                                    if (messageContent.toLowerCase() === 'no') {
                                                                        const cancelEmbed = new Discord.MessageEmbed()
                                                                            .setColor(messageEmbedColor)
                                                                            .setAuthor(`Canceled`, message.author.displayAvatarURL())
                                                                            .setDescription('You canceled the process to edit this scheduled game.')
                                                                            .addField('Scheduled game', elementToBeEdited.schedule, true)
                                                                            .addField('Scheduled by', `<@${elementToBeEdited.scheduledBy}>`, true)
                                                                            .setFooter('Use "!schedule list" to retrieve a list of all scheduled games.', client.user.displayAvatarURL())

                                                                        return message.channel.send(cancelEmbed);
                                                                    }
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
                                                        });
                                                    }
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

                                        if (messageContent.toLowerCase() === 'no') {
                                            const cancelEmbed = new Discord.MessageEmbed()
                                                .setColor(messageEmbedColor)
                                                .setAuthor(`Canceled`, message.author.displayAvatarURL())
                                                .setDescription('You canceled the process to edit this scheduled game.')
                                                .addField('Scheduled game', elementToBeRemoved.schedule, true)
                                                .addField('Scheduled by', `<@${elementToBeRemoved.scheduledBy}>`, true)
                                                .setFooter('Use "!schedule list" to retrieve a list of all scheduled games.', client.user.displayAvatarURL())

                                            return message.channel.send(cancelEmbed);
                                        }
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
                            });
                        }
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
            });
        }
    }

    module.exports.config = {
        command: 'schedule',
        aliases: ['s'],
        description: 'Schedules for Among Us games.',
        usage: null,
        example: null,
        cooldown: 10,
        guildOnly: true
    }
