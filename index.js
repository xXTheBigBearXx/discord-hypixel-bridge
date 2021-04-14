const mineflayer = require("mineflayer");
const discord = require("discord.js");
const config = require("./config.json");
require("colors");

const client = new discord.Client({
    autoReconnect: true
});
const options = {
    host: config["server-ip"],
    port: config["server-port"],
    auth: config["auth-type"],
    version: config["minecraft-version"],
    username: config["minecraft-username"],
    password: config["minecraft-password"],
};

// Minecraft Bot
let mc;
var currentPlayers = 0;
var onlineMembers = 0;

mc = mineflayer.createBot(options);
mc._client.once("session", session => options.session = session);
mc.once("end", () => {
    console.log("Connection failed.");
    process.exit(0);
});

mc.on("login", () => {
    setTimeout(() => {
        console.log("Sending to limbo.");
        mc.chat("/achat \u00a7c<3");
    }, 1000);
    setTimeout(() => {
        console.log("Switching to guild chat. (If not already.)");
        mc.chat("/chat g");
    }, 2000);
    setTimeout(() => {
        mc.chat("Logged in");
    }, 3000);
    setTimeout(() => {
        mc.chat("/g online");
    }, 4000);
});



mc.on("message", (chatMsg) => {
    const msg = chatMsg.toString();
    console.log("Minecraft: ".brightGreen + msg);

    let msgParts = msg.split(" ");

    if (msg.startsWith("Guild >")) {
        if (msgParts[2].includes(mc.username) || msgParts[3].includes(mc.username)) return;
        if (msgParts.length == 4 && !msg.includes(":")) {
            client.guilds.get(config["discord-guild"]).channels.get(config["chat-channel"]).sendMessage(msgParts[2] + " " + msgParts[3]);
            switch (msgParts[3]) {
                case "joined.":
                    onlineMembers++
                    break;
                case "left.":
                    --onlineMembers
                    break;
            }
        } else {
            let i = msg.indexOf(":");
            let sentMsg = [msg.slice(0, i), msg.slice(i + 1)];
            let sender;
            if (msgParts[2].includes("[")) {
                sender = msgParts[3].replace(":", "");
            } else {
                sender = msgParts[2].replace(":", "");
            }

            let embed = new discord.RichEmbed()
                .setAuthor(sender + ": " + sentMsg[1], "https://www.mc-heads.net/avatar/" + sender)
                .setColor("GREEN");

            client.guilds.get(config["discord-guild"]).channels.get(config["chat-channel"]).send(embed);
        }
    }

    if (msg.startsWith("Online Members")) {
        onlineMembers = msgParts[2];
    }

    if (onlineMembers !== currentPlayers) {
        client.user.setPresence({
            status: "online", //You can show online, idle....
            game: {
                name: onlineMembers + " guild members", //The message shown
                type: "WATCHING" //PLAYING: WATCHING: LISTENING: STREAMING:
            }
        });
        currentPlayers = onlineMembers
    }

    // Join/Leave Messages
    if (msg.includes("the guild") && !msg.includes(":")) {
        var i;
        if (msg.startsWith("[")) {
            i = 1;
        } else {
            i = 0;
        }

        switch (msgParts[i + 1]) {
            case "joined":
                client.guilds.get(config["discord-guild"]).channels.get(config["log-channel"]).sendMessage(msgParts[i] + " joined the guild.");
                mc.chat("Welcome " + msgParts[i] + "!");
                break;
            case "left":
                client.guilds.get(config["discord-guild"]).channels.get(config["log-channel"]).sendMessage(msgParts[i] + " left the guild.");
                mc.chat("F");
                break;
            case "was": // [Rank] Name was kicked from the guild by [Rank] Name!
                client.guilds.get(config["discord-guild"]).channels.get(config["log-channel"]).sendMessage(msgParts[i] + " was kicked from the guild.");
                mc.chat("L");
                break;
        }
    }
});

// Discord Bot
client.on("ready", () => {
    console.log("Discord: Logged in.".bgBlue);
    client.guilds.get(config["discord-guild"]).channels.get(config["chat-channel"]).sendMessage("Logged In.");
});

client.on("message", (message) => {
    if (message.channel.id !== config["chat-channel"] || message.author.bot || message.content.startsWith(config["discord-bot-prefix"])) return;
    console.log("Discord: ".blue + message.author.username + ": " + message.content);
    mc.chat(client.guilds.get(config["discord-guild"]).member(message.author).displayName + ": " + message.content);
});

client.login(config["discord-token"]);