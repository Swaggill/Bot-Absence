const { Events } = require("discord.js");
const db = require("better-sqlite3")("./absences.sqlite");
const config = require("../config.json");

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
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand() && !interaction.isButton()) return;


        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ content: "❌ Une erreur est survenue." });
                } else {
                    await interaction.reply({ content: "❌ Une erreur est survenue.", ephemeral: true });
                }
            }
        }


        if (interaction.isButton()) {
            const parts = interaction.customId.split("_");


            if (interaction.customId.startsWith("confirm_absence_yes")) {
                const targetUserId = parts[3];
                const raison = decodeURIComponent(parts[4]);
                const dateRetour = parts[5];
                const heureRetour = parts[6];

                if (interaction.user.id !== targetUserId) {
                    return interaction.reply({ content: "❌ Tu ne peux pas confirmer pour un autre utilisateur.", ephemeral: true });
                }

                db.prepare("INSERT INTO absences (userId, username, raison, dateRetour, heureRetour, status) VALUES (?, ?, ?, ?, ?, ?)")
                    .run(interaction.user.id, interaction.user.username, raison, dateRetour, heureRetour, "pending");

                return interaction.update({
                    components: [
                        {
                            type: 17,
                            color: getColor("pending"),
                            components: [
                                { type: 10, content: "⏳ **Demande envoyée en attente de validation**" },
                                { type: 14, divider: true },
                                { type: 10, content: `👤 **Staff :**\n${interaction.user.username}\nID: ${interaction.user.id}` },
                                { type: 10, content: `📌 **Raison :**\n\`\`\`${raison}\`\`\`` },
                                { type: 10, content: `📅 **Retour :**\n\`\`\`${formatDate(dateRetour, heureRetour)}\`\`\`` }
                            ]
                        }
                    ]
                });
            }


            if (interaction.customId.startsWith("confirm_absence_no")) {
                return interaction.update({
                    components: [
                        {
                            type: 17,
                            color: getColor("refused"),
                            components: [
                                { type: 10, content: "❌ **Demande d'absence annulée**" },
                                { type: 14, divider: true },
                                { type: 10, content: `👤 **Utilisateur :**\n${interaction.user.username}\nID: ${interaction.user.id}` }
                            ]
                        }
                    ]
                });
            }


            if (interaction.customId.startsWith("validate_absence")) {
                const absenceId = parts[2];
                const absence = db.prepare("SELECT * FROM absences WHERE id = ?").get(absenceId);

                if (!absence) {
                    return interaction.reply({ content: "❌ Absence introuvable.", ephemeral: true });
                }

                db.prepare("UPDATE absences SET status = ? WHERE id = ?").run("validated", absenceId);


                const guild = interaction.guild;
                const member = await guild.members.fetch(absence.userId).catch(() => null);
                if (member) {
                    await member.roles.add(config.absenceRole).catch(() => {});
                }

                return interaction.update({
                    components: [
                        {
                            type: 17,
                            color: getColor("validated"),
                            components: [
                                { type: 10, content: `✅ **Absence validée par ${interaction.user.username}**` },
                                { type: 14, divider: true },
                                { type: 10, content: `👤 **Staff :**\n${absence.username}\nID: ${absence.userId}` },
                                { type: 10, content: `📌 **Raison :**\n\`\`\`${absence.raison}\`\`\`` },
                                { type: 10, content: `📅 **Retour :**\n\`\`\`${formatDate(absence.dateRetour, absence.heureRetour)}\`\`\`` }
                            ]
                        }
                    ]
                });
            }


            if (interaction.customId.startsWith("refuse_absence")) {
                const absenceId = parts[2];
                const absence = db.prepare("SELECT * FROM absences WHERE id = ?").get(absenceId);

                if (!absence) {
                    return interaction.reply({ content: "❌ Absence introuvable.", ephemeral: true });
                }

                db.prepare("UPDATE absences SET status = ? WHERE id = ?").run("refused", absenceId);


                const guild = interaction.guild;
                const member = await guild.members.fetch(absence.userId).catch(() => null);
                if (member) {
                    await member.roles.remove(config.absenceRole).catch(() => {});
                }

                return interaction.update({
                    components: [
                        {
                            type: 17,
                            color: getColor("refused"),
                            components: [
                                { type: 10, content: `❌ **Absence refusée par ${interaction.user.username}**` },
                                { type: 14, divider: true },
                                { type: 10, content: `👤 **Staff :**\n${absence.username}\nID: ${absence.userId}` },
                                { type: 10, content: `📌 **Raison :**\n\`\`\`${absence.raison}\`\`\`` },
                                { type: 10, content: `📅 **Retour :**\n\`\`\`${formatDate(absence.dateRetour, absence.heureRetour)}\`\`\`` }
                            ]
                        }
                    ]
                });
            }
        }
    }
};
