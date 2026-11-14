import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from 'discord.js';
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
let qrUrl = `https://img.vietqr.io/image/${bank}-${account}-compact2.png?accountName=${encodeURIComponent(name)}&addInfo=${encodeURIComponent('Donate server')}`;
if (amount) qrUrl += `&amount=${amount}`;

        const response = await fetch(qrUrl);
        if (!response.ok) {
            return await InteractionHelper.safeEditReply(interaction, {
                content: 'Could not generate the QR code right now. Please try again later.'
            });
        }
        const file = new AttachmentBuilder(Buffer.from(await response.arrayBuffer()), { name: 'donate-qr.png' });

        const embed = new EmbedBuilder()
            .setColor(getColor('success'))
            .setTitle('Support the server')
            .setDescription('Scan mã để server có tiền tạo gw với cả duy trì bot nhaaa!')
            .setImage('attachment://donate-qr.png');

        await InteractionHelper.safeEditReply(interaction, { embeds: [embed], files: [file] });
    },
};
