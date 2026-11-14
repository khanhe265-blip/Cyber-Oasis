import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { getColor } from '../../config/bot.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

const PEOPLE = {
    one: {
        label: process.env.QR1_LABEL || 'Person 1',
        bank: process.env.QR1_BANK || process.env.DONATE_BANK,
        account: process.env.QR1_ACCOUNT_NO || process.env.DONATE_ACCOUNT_NO,
        name: process.env.QR1_ACCOUNT_NAME || process.env.DONATE_ACCOUNT_NAME,
    },
    two: {
        label: process.env.QR2_LABEL || 'Person 2',
        bank: process.env.QR2_BANK,
        account: process.env.QR2_ACCOUNT_NO,
        name: process.env.QR2_ACCOUNT_NAME,
    },
};

export default {
    data: new SlashCommandBuilder()
        .setName('qr')
        .setDescription('Show a bank QR code to support the server')
        .addStringOption(option =>
            option.setName('person')
                .setDescription('Whose QR code to show')
                .setRequired(true)
                .addChoices(
                    { name: PEOPLE.one.label, value: 'one' },
                    { name: PEOPLE.two.label, value: 'two' }
                ))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Optional amount in VND')
                .setMinValue(1000)
                .setRequired(false)),

    async execute(interaction) {
        await InteractionHelper.safeDefer(interaction);

        const person = PEOPLE[interaction.options.getString('person')];

        if (!person?.bank || !person?.account || !person?.name) {
            return await interaction.editReply({ content: 'This QR is not set up yet.' });
        }

        const amount = interaction.options.getInteger('amount');
        let qrUrl = `https://img.vietqr.io/image/${person.bank}-${person.account}-compact2.png?accountName=${encodeURIComponent(person.name)}&addInfo=${encodeURIComponent('Donate server')}`;
        if (amount) qrUrl += `&amount=${amount}`;

        const embed = new EmbedBuilder()
            .setColor(getColor('success'))
            .setTitle(`Support the server - ${person.label}`)
            .setDescription('Scan mã để server có tiền tạo gw với cả duy trì bot nhaaa!')
            .setFooter({ text: 'v3' });

        let file = null;
        let note = 'v3';

        try {
            const response = await fetch(qrUrl);
            note = `v3 - QR fetch status: ${response.status}`;
            if (response.ok) {
                file = new AttachmentBuilder(Buffer.from(await response.arrayBuffer()), { name: 'qr.png' });
                embed.setImage('attachment://qr.png');
            }
        } catch (error) {
            note = `v3 - QR fetch error: ${error.message}`;
        }

        await interaction.editReply({ content: note, embeds: [embed], files: file ? [file] : [] });
    },
};
