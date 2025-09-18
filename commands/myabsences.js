const { SlashCommandBuilder } = require("discord.js");
const db = require("better-sqlite3")("./absences.sqlite");

function formatDate(dateStr, heureStr) {
    const [year, month, day] = dateStr.split("-");
    const [hour, minute] = heureStr.replace("h", ":").split(":");
    const d = new Date(year, month - 1, day, hour, minute);

    return d.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getColor(status) {
    if (status === "validated") return 5763719;
    if (status === "refused") return 15548997;
    return 16705372;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("myabsences")
        .setDescription("Voir vos absences"),

    async execute(interaction) {
        const absences = db.prepare("SELECT * FROM absences WHERE userId = ?").all(interaction.user.id);

        if (!absences.length) {
            return interaction.reply({ content: "❌ Vous n'avez aucune absence enregistrée.", ephemeral: true });
        }

        const components = absences.map(absence => ({
            type: 17,
            color: getColor(absence.status),
            components: [
                { type: 10, content: `📌 **Absence (${absence.status})**` },
                { type: 14, divider: true },
                { type: 10, content: `👤 **Staff :**\n${absence.username}\nID: ${absence.userId}` },
                { type: 10, content: `📌 **Raison :**\n\`\`\`${absence.raison}\`\`\`` },
                { type: 10, content: `📅 **Retour :**\n\`\`\`${formatDate(absence.dateRetour, absence.heureRetour)}\`\`\`` }
            ]
        }));

        return interaction.reply({ flags: 32768, components });
    }
};
