import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getColor } from '../../config/bot.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName('donate')
        .setDescription('Show the QR code to support the server')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Optional amount in VND')
                .setMinValue(1000)
                .setRequired(false)),

    async execute(interaction) {
        await InteractionHelper.safeDefer(interaction);

        const bank = process.env.DONATE_BANK;
        const account = process.env.DONATE_ACCOUNT_NO;
        const name = process.env.DONATE_ACCOUNT_NAME;

        if (!bank || !account || !name) {
            return await InteractionHelper.safeEditReply(interaction, {
                content: 'Donations are not set up yet.'
            });
        }

        const amount = interaction.options.getInteger('amount');
        const params = new URLSearchParams({
            addInfo: `Donate ${interaction.user.username}`,
            accountName: name
        });
        if (amount) params.set('amount', String(amount));

        const qrUrl = `https://img.vietqr.io/image/${bank}-${account}-compact2.png?${params}`;

        const embed = new EmbedBuilder()
            .setColor(getColor('success'))
            .setTitle('Support the server')
            .setDescription('Scan this QR with your banking app to donate. Thank you!')
            .setImage(qrUrl);

        await InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
    },
};
