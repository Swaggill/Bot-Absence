const { SlashCommandBuilder } = require("discord.js");

function generateDateChoices(limit = 25) {
    const choices = [];
    const now = new Date();

    for (let i = 1; i <= limit; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() + i);

        const label = date.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        const value = date.toISOString().split("T")[0];  
        choices.push({ name: label, value });
    }

    return choices;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("absence")
        .setDescription("Faire une demande d'absence")
        .addStringOption(option =>
            option.setName("raison")
                .setDescription("Raison de l'absence")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("date")
                .setDescription("Date de retour (max 25 choix)")
                .setRequired(true)
                .addChoices(...generateDateChoices(25))
        )
        .addStringOption(option =>
            option.setName("heure")
                .setDescription("Heure de retour (format 00h00)")
                .setRequired(true)
        ),

    async execute(interaction) {
        const raison = interaction.options.getString("raison");
        const date = interaction.options.getString("date");
        const heure = interaction.options.getString("heure");

        return interaction.reply({
            flags: 32768,
            components: [
                {
                    type: 17,
                    color: 16705372,
                    components: [
                        { type: 10, content: "⏳ **Confirmez-vous cette demande d’absence ?**" },
                        { type: 14, divider: true },
                        { type: 10, content: `📌 **Raison :**\n\`\`\`${raison}\`\`\`` },
                        { type: 10, content: `📅 **Retour :**\n\`\`\`${date} à ${heure}\`\`\`` },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    style: 3,
                                    label: "✅ Oui",
                                    custom_id: `confirm_absence_yes_${interaction.user.id}_${encodeURIComponent(raison)}_${date}_${heure}`
                                },
                                {
                                    type: 2,
                                    style: 4,
                                    label: "❌ Non",
                                    custom_id: `confirm_absence_no_${interaction.user.id}`
                                }
                            ]
                        }
                    ]
                }
            ]
        });
    }
};
