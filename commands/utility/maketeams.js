const { SlashCommandBuilder, ChannelType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("maketeams")
    .setDescription("Randomly divides members of a voice channel into teams")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The voice channel to get members from")
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)
    ),
  async execute(interaction) {
    // Get the selected channel from the interaction
    const voiceChannel = interaction.options.getChannel("channel");

    // Retrieve the members in the voice channel
    const members = voiceChannel.members.map((member) => member.user.username);

    // Check if there are enough members to form teams
    if (members.length < 1) {
      return interaction.reply({
        content: "Not enough members in the voice channel to form teams.",
        ephemeral: true,
      });
    }

    // Shuffle the members and divide into two teams
    const shuffled = members.sort(() => Math.random() - 0.5);
    const half = Math.ceil(shuffled.length / 2);
    const team1 = shuffled.slice(0, half);
    const team2 = shuffled.slice(half);

    // Reply with the teams
    await interaction.reply({
      content: `**Team 1:**\n${team1.join("\n")}\n\n**Team 2:**\n${team2.join(
        "\n"
      )}`,
    });
  },
};
