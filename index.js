    const Discord = require('discord.js');
    const client = new Discord.Client({ disableMentions: "everyone" });
    const fs = require('fs');

    // Config
    const config = require('./config.json');
    const token = config.client.token;

    client.commands = new Discord.Collection();
    client.aliases = new Discord.Collection();

    // Command Handler
    fs.readdirSync('./commands/').forEach(dir => {
        // Go through all folders/modules
        fs.readdir(`./commands/${dir}`, (err, files) => {
            if (err) throw err;

            // Filter only JavaScript files
            const jsCheck = files.filter(f => f.split(".").pop() === "js");

            const date = new Date();
            const localTime = date.toLocaleTimeString();
            console.info(`[${localTime} | COMMAND LOAD] Commands loaded: ${jsCheck.length} commands of directory ${dir}: `);
            console.table(jsCheck);

            jsCheck.forEach(file => {
                const command = require(`./commands/${dir}/${file}`);

                try {
                    client.commands.set(command.config.command, command);
                    command.config.aliases.forEach(alias => {
                        client.aliases.set(alias, command.config.command)
                    })
                } catch (err) {
                    return console.log(err);
                }
            });
        });
    });

    // Event Handler
    fs.readdirSync('./events/').forEach(dir => {
        // Go through all folders/modules
        fs.readdir(`./events/${dir}`, (err, files) => {
            if (err) throw err;

            // Filter only JavaScript files
            const jsCheck = files.filter(f => f.split(".").pop() === "js");

            const date = new Date();
            const localTime = date.toLocaleTimeString();
            console.info(`[${localTime} | EVENT LOAD] Events loaded: ${jsCheck.length} events of directory ${dir}: `);
            console.table(jsCheck);

            jsCheck.forEach(file => {
                const event = require(`./events/${dir}/${file}`);
                let eventName = file.split('.')[0];
                client.on(eventName, event.bind(null, client))
            });
        });
    });

    client.login(token);