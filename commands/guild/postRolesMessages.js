    const Discord = require('discord.js');

    // Config
    const config = require('../../config.json');
    const prefix = config.client.prefix;
    const messageEmbedColor = config.messageEmbed.color;
    const noArgumentsProvided = config.messageEmbed.error.noArgumentsProvided;

    module.exports.run = async (client, message, args) => {
        if (message.author.id !== '291647743930269696') return;

        // If args are not provided, return with a MessageEmbed that there were no args provided
        if (!args.length) {
            const replyEmbed = new Discord.MessageEmbed()
                .setColor(messageEmbedColor)
                .setAuthor('No arguments provided', message.author.displayAvatarURL())
                .setDescription(`Please check the correct usage of this command below and try again!`)
                .addField('Usage', this.config.usage)
                .addField('Example', this.config.example)
                .setImage(noArgumentsProvided)
                .setFooter('Error', client.user.displayAvatarURL())

            return message.channel.send(replyEmbed);
        }

        const generalEmbed = new Discord.MessageEmbed()
            .setColor(messageEmbedColor)
            .setAuthor('ROLES')
            .setDescription('Please assign yourself some roles by clicking on the emojis.')

        const countryEmbed = new Discord.MessageEmbed()
            .setColor(messageEmbedColor)
            .setAuthor('COUNTRY')
            .setDescription(
                ':flag_gb: : :flag_gb:┃United Kingdom' +
                '\n:flag_um: : :flag_um:┃United States' +
                '\n:flag_nl: : :flag_nl:┃The Netherlands' +
                '\n:flag_ca: : :flag_ca:┃Canada' +
                '\n:flag_white: : :flag_white:┃Other'
            )
            .setFooter(`Country roles don't give extra features to a user.`, client.user.displayAvatarURL());

        const pronounsEmbed = new Discord.MessageEmbed()
            .setColor(messageEmbedColor)
            .setAuthor('PRONOUNS')
            .setDescription(
                '❤ : 👤┃He/Him' +
                '\n🧡 : 👤┃She/Her' +
                '\n💛 : 👤┃They/Them')
            .setFooter(`Pronouns roles don't give extra features to a user.`, client.user.displayAvatarURL());

        const ageEmbed = new Discord.MessageEmbed()
            .setColor(messageEmbedColor)
            .setAuthor('AGE')
            .setDescription(
                '❤ : 👤┃15' +
                '\n🧡 : 👤┃16' +
                '\n💛 : 👤┃17' +
                '\n💚 : 👤┃18+'
            )
            .setFooter(`Age roles don't give extra features to a user.`, client.user.displayAvatarURL());

        const colorsEmbed = new Discord.MessageEmbed()
            .setColor(messageEmbedColor)
            .setAuthor('IN-GAME COLORS')
            .setDescription(
                ':wine_glass: : :wine_glass:┃Red' +
                '\n:fallen_leaf: : :fallen_leaf:┃Brown' +
                '\n:peach: : :peach:┃Orange' +
                '\n:sunflower: : :sunflower:┃Yellow' +
                '\n:pig2: : :pig2:┃Pink' +
                '\n:smiling_imp: : :smiling_imp:┃Purple' +
                '\n:butterfly: : :butterfly:┃Blue' +
                '\n:dolphin: : :dolphin:┃Cyan' +
                '\n:frog: : :frog:┃Green' +
                '\n:seedling: : :seedling:┃Lime' +
                '\n:panda_face: : :panda_face:┃White' +
                '\n:ant: : :ant:┃Black' +
                '\n:rainbow: : :rainbow:┃Random'
            )
            .setFooter(`In-game color roles don't give extra features to a user.`, client.user.displayAvatarURL());

        const nsfwEmbed = new Discord.MessageEmbed()
            .setColor(messageEmbedColor)
            .setAuthor('SFW / NSFW')
            .setDescription(
                ':green_square: : :green_square:┃SFW' +
                '\n:red_square: : :red_square:┃NSFW'
            )
            .setFooter(`SFW / NSFW roles don't give extra features to a user.`, client.user.displayAvatarURL());

        const gamementionEmbed = new Discord.MessageEmbed()
            .setColor(messageEmbedColor)
            .setAuthor('GAME MENTION')
            .setDescription(
                ':video_game: : :video_game:┃Game mention'
            )
            .setFooter(`You will be tagged when there is a game and we need spaces to be filled. This is optional and can be turned off and on at any time`, client.user.displayAvatarURL());

        const embeds = [generalEmbed, countryEmbed, pronounsEmbed, ageEmbed, colorsEmbed, nsfwEmbed, gamementionEmbed];

        if (args[0] === 'all') return embeds.forEach(embed => message.channel.send(embed));
        if (args[0] === 'general') return message.channel.send(generalEmbed);
        if (args[0] === 'country') return message.channel.send(countryEmbed);
        if (args[0] === 'pronouns') return message.channel.send(pronounsEmbed);
        if (args[0] === 'age') return message.channel.send(ageEmbed);
        if (args[0] === 'colors') return message.channel.send(colorsEmbed);
        if (args[0] === 'nsfw') return message.channel.send(nsfwEmbed);
        if (args[0] === 'gamemention') return message.channel.send(gamementionEmbed);
    }

    module.exports.config = {
        command: 'rolesmessage',
        aliases: ['rolesmsg'],
        description: 'Sends the roles messages.',
        usage: `${prefix}rolesmessage`,
        example: `${prefix}rolesmessage`,
        cooldown: 0,
        guildOnly: false
    }
