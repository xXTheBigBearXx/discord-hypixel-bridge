const mineflayer = require("mineflayer");
const discord = require("discord.js");
const config = require("./config.json");
const colours = require("colors");

const options = {
    host: 'mc.hypixel.net',
    port: 25565,
    version: '1.8.9',
    username: config["minecraft-username"],
    password: config["minecraft-password"],
};
let mc;
(function init() {
    console.log("Logging in.");
    mc = mineflayer.createBot(options);
    mc._client.once("session", session => options.session = session);
    mc.once("end", () => {
        setTimeout(() => {
            console.log("Connection failed. Retrying..");
            init();
        }, 60000);
    });
}());

let uuid;
let name;
mc.on("login", () => {
    uuid = mc._client.session.selectedProfile.id;
    name = mc._client.session.selectedProfile.name;
    setTimeout(() => {
        console.log("Sending to limbo.");
        mc.chat("/achat \u00a7c<3");
    }, 1000);
    mc.chat("/gc Logged in")
});

mc.on("message", (chatMsg) => {
    const msg = chatMsg.text;
    console.log("Minecraft: ".brightGreen + msg);
    if (msg.endsWith(" joined the lobby!")) {
        console.log("Sending to limbo.");
        mc.chat("/achat \u00a7ca");
        return;
    }
});
