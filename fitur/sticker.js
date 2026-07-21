const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const sharp = require("sharp");

async function handle(sock, msg) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return sock.sendMessage(msg.key.remoteJid, { text: "Reply foto/video dengan .s" });
    
    let media;
    if (quoted.imageMessage) media = quoted.imageMessage;
    else if (quoted.videoMessage) media = quoted.videoMessage;
    else return sock.sendMessage(msg.key.remoteJid, { text: "Reply foto/video!" });
    
    const stream = await downloadContentFromMessage(media, "media");
    let buffer = Buffer.alloc(0);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    
    const webp = await sharp(buffer).resize(512, 512, { fit: "inside" }).webp({ quality: 80 }).toBuffer();
    await sock.sendMessage(msg.key.remoteJid, { sticker: webp });
}

module.exports = { handle };
