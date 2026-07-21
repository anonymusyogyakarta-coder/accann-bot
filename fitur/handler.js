const ai = require("./ai");
const sticker = require("./sticker");
const sound = require("./sound");
const instadl = require("./instadl");
const tikdl = require("./tikdl");
const neko = require("./neko");
const generate = require("./generate");
const cuaca = require("./cuaca");
const gombal = require("./gombal");
const textvoice = require("./textvoice");

const menuText = `┌─────────────────────┐
│     ACCANN BOT      │
├─────────────────────┤
│ .ai [teks]          │
│ .s [reply media]    │
│ .sound [reply video]│
│ .instadownload [link│
│ .tikdownload [link] │
│ .neko               │
│ .generate [prompt]  │
│ .cuaca [daerah]     │
│ .gombal             │
│ .textvoice [reply]  │
│ .menu               │
├─────────────────────┤
│ ViewOnce = AutoSave │
└─────────────────────┘`;

async function handleCommand(sock, msg, text, config) {
    const args = text.slice(1).trim().split(" ");
    const cmd = args[0].toLowerCase();
    const content = args.slice(1).join(" ");
    
    switch(cmd) {
        case "menu":
            await sock.sendMessage(msg.key.remoteJid, { text: menuText });
            break;
        case "ai":
            await ai.handle(sock, msg, content);
            break;
        case "s":
            await sticker.handle(sock, msg);
            break;
        case "sound":
            await sound.handle(sock, msg);
            break;
        case "instadownload":
            await instadl.handle(sock, msg, content);
            break;
        case "tikdownload":
            await tikdl.handle(sock, msg, content);
            break;
        case "neko":
            await neko.handle(sock, msg);
            break;
        case "generate":
            await generate.handle(sock, msg, content);
            break;
        case "cuaca":
            await cuaca.handle(sock, msg, content);
            break;
        case "gombal":
            await gombal.handle(sock, msg);
            break;
        case "textvoice":
            await textvoice.handle(sock, msg);
            break;
        default:
            await sock.sendMessage(msg.key.remoteJid, { text: "Gak ada. Ketik .menu" });
    }
}

module.exports = { handleCommand };
