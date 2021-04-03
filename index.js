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
     mc.chat("Logged in")
});

mc.on("message", (chatMsg) => {
    const msg = chatMsg.toString();
    console.log("Minecraft: ".brightGreen + msg);
    if (msg.endsWith(" joined the lobby!") && msg.includes("[MVP+")) {
        console.log("Sending to limbo.");
        mc.chat("/achat \u00a7ca");
        return;
    }

    if (msg.startsWith("Guild >")) {
        let msgParts = msg.split(" ");
        if (msgParts[2].includes(mc.username) || msgParts[3].includes(mc.username)) return;
        if (msgParts.length == 4 && !msg.includes(":")) {
            client.guilds.get(config["discord-guild"]).channels.get(config["chat-channel"]).sendMessage(msgParts[2] + " " + msgParts[3]);
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
    }}
        // Join/Leave Messages
    if (msg.endsWith("the guild!")) {
            let msgParts = msg.split(" ");
            var i;
            if (msg.includes(":")) return;
            if (msg.startsWith("[")) {
                i = 1;
            } else {
                i = 0;
            }
    
            if (msgParts[i + 1] == "joined") {
                console.log(msgParts[i])
                client.guilds.get(config["discord-guild"]).channels.get(config["log-channel"]).sendMessage(msgParts[i] + " joined the guild.");
                mc.chat("Welcome " + msgParts[i] + "!");
            } else {
                console.log(msgParts[i])
                client.guilds.get(config["discord-guild"]).channels.get(config["log-channel"]).sendMessage(msgParts[i] + " left the guild.");
                mc.chat("F")
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