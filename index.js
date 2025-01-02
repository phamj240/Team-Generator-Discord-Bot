// Require the necessary discord.js classes\

const fs = require("node:fs"); //fs is used to read the commands directory and identify our command files
const path = require("node:path"); //path helps contruct paths to acess files and directories

const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");

// Create a new client instance
// const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates, // Important for voice state events
    GatewayIntentBits.GuildMembers, // Allows member-related events
  ],
});

//Collections class extends JS's native Map class and includes more useful functionality. Colections is used to store and retrieve commands for execution
client.commands = new Collection();

//Loads commands for the bot to use in a discord server
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Event listener for voiceStateUpdate
client.on("voiceStateUpdate", (oldState, newState) => {
  const oldChannel = oldState.channel; // Channel the user was in before
  const newChannel = newState.channel; // Channel the user is in now

  if (oldChannel) {
    // The user left the channel
    console.log(
      `User left channel ${oldChannel.name}:`,
      oldChannel.members.map((m) => m.user.username)
    );
  }
  if (newChannel) {
    // The user joined a new channel
    console.log(
      `User joined channel ${newChannel.name}:`,
      newChannel.members.map((m) => m.user.username)
    );
  }
});

// Log in to Discord with your client's token
client.login(token);
