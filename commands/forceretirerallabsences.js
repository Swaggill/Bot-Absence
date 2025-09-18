const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("better-sqlite3")("./absences.sqlite");
const config = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("forceretirerallabsences")
        .setDescription("Retirer toutes les absences d’un utilisateur (staff)")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addUserOption(option =>
            option.setName("utilisateur")
                .setDescription("Utilisateur dont on retire toutes les absences")
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("utilisateur");

        const count = db.prepare("DELETE FROM absences WHERE userId = ?").run(user.id).changes;

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (member) {
            await member.roles.remove(config.absenceRole).catch(() => {});
        }

        return interaction.reply({
            content: `✅ ${count} absence(s) retirée(s) pour ${user.username}.`,
            ephemeral: true
        });
    }
};
