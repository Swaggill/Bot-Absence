const { REST, Routes } = require("discord.js");
const config = require("../config.json");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log(`✅ Connecté en tant que ${client.user.tag}`);

        const commands = [];
        client.commands.forEach(cmd => commands.push(cmd.data.toJSON()));

        const rest = new REST({ version: "10" }).setToken(config.token);

        try {
            console.log("🔄 Mise à jour des commandes slash...");
            await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: commands }
            );
            console.log("✅ Commandes mises à jour !");
        } catch (err) {
            console.error(err);
        }
    }
};
