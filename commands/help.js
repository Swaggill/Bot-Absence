const { SlashCommandBuilder } = require("discord.js");
const config = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Liste toutes les commandes disponibles"),

    async execute(interaction) {
        const isVerifier = interaction.member.roles.cache.has(config.verificateurRole);

        const components = [
            {
                type: 17,
                color: 16705372,
                components: [
                    { type: 10, content: "📖 **Commandes Utilisateur**" },
                    { type: 14, divider: true },
                    { type: 10, content: "`/absence` → Faire une demande d'absence" },
                    { type: 10, content: "`/myabsences` → Voir vos absences" },
                    { type: 10, content: "`/help` → Afficher cette aide" }
                ]
            }
        ];

        if (isVerifier) {
            components.push({
                type: 17,
                color: 5763719,
                components: [
                    { type: 10, content: "🛠 **Commandes Vérificateur**" },
                    { type: 14, divider: true },
                    { type: 10, content: "`/absencelist` → Voir toutes les absences" },
                    { type: 10, content: "`/deleteabsence` → Supprimer une absence" },
                    { type: 10, content: "`/forceretirerabsence` → Retirer une absence par ID" },
                    { type: 10, content: "`/forceretirerallabsences` → Retirer toutes les absences d’un utilisateur" }
                ]
            });
        }

        return interaction.reply({ flags: 32768, components });
    }
};
