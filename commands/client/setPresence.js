    const Discord = require('discord.js');

    // Config
    const config = require('../../config.json');
    const administrators = config.administrators;
    const prefix = config.client.prefix;
    const messageEmbedColor = config.messageEmbed.color;
    const noArgumentsProvided = config.messageEmbed.error.noArgumentsProvided;
    const notAValidPresenceType = config.messageEmbed.error.notAValidPresenceType;

    module.exports.run = async (client, message, args) => {
        if (!administrators.includes(message.author.id)) return;

        // If args are not provided, return with a MessageEmbed that there were no args provided
        if (!args.length) {
            const replyEmbed = new Discord.MessageEmbed()
                .setColor(messageEmbedColor)
                .setAuthor('No arguments provided', message.author.displayAvatarURL())
                .setDescription(`Please check the correct usage of this command below and try again!`)
                .addField('Usage', this.config.usage)
                .addField('Example', this.config.example)
                .addField('Presence type list', 'Playing \n Listening \n Watching')
                .setImage(noArgumentsProvided)
                .setFooter('Error', client.user.displayAvatarURL())

            return message.channel.send(replyEmbed);
        }

        const types = ['playing', 'listening', 'watching']
        let type = args[0];
        const presence = args.slice(1).join(" ");

        if (!types.includes(type.toLowerCase())) {
            const replyEmbed = new Discord.MessageEmbed()
                .setColor(messageEmbedColor)
                .setAuthor('Not a valid presence type', message.author.displayAvatarURL())
                .setDescription(`Please check the correct usage of this command below and try again!`)
                .addField('Usage', this.config.usage)
                .addField('Example', this.config.example)
                .addField('Presence type list', 'Playing \n Listening \n Watching')
                .setImage(notAValidPresenceType)
                .setFooter('Error', client.user.displayAvatarURL())

            return message.channel.send(replyEmbed);
        }

        await client.user.setActivity(`${presence}`, {type: `${type.toUpperCase()}`});

        switch (type){
            case 'playing':
                type = 'Playing';
                break;
            case 'listening':
                type = 'Listening to';
                break;
            case 'watching':
                type = 'Watching';
                break;
        }

        const embedConfirm = new Discord.MessageEmbed()
            .setColor(messageEmbedColor)
            .setAuthor('New presence set!', message.author.displayAvatarURL())
            .setFooter(`${type} ${presence}`, client.user.displayAvatarURL());

        await message.channel.send(embedConfirm);
    }

    module.exports.config = {
        command: 'presence',
        aliases: [
            'activity',
            'status'
        ],
        description: 'Sets the activity of the bot',
        usage: `${prefix}presence` + ' `Presence type` `Presence`',
        example: `${prefix}presence` + ' `Playing` `kinda sus`',
        cooldown: 0,
        guildOnly: false
    }
