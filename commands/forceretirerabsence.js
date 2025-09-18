const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("better-sqlite3")("./absences.sqlite");
const config = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("forceretirerabsence")
        .setDescription("Retirer une absence spécifique d’un utilisateur (staff)")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addIntegerOption(option =>
            option.setName("id")
                .setDescription("ID de l’absence à retirer")
                .setRequired(true)
        ),

    async execute(interaction) {
        const id = interaction.options.getInteger("id");
        const absence = db.prepare("SELECT * FROM absences WHERE id = ?").get(id);

        if (!absence) {
            return interaction.reply({ content: "❌ Aucune absence trouvée avec cet ID.", ephemeral: true });
        }

        db.prepare("DELETE FROM absences WHERE id = ?").run(id);

        const member = await interaction.guild.members.fetch(absence.userId).catch(() => null);
        if (member) {
            await member.roles.remove(config.absenceRole).catch(() => {});
        }

        return interaction.reply({
            content: `✅ Absence ID **${id}** retirée avec succès pour ${absence.username}.`,
            ephemeral: true
        });
    }
};
