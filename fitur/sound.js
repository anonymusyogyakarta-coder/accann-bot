cat > fitur/sound.js << 'EOF'
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { execSync } = require("child_process");
const fs = require("fs");

async function handle(sock, msg) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.videoMessage) return sock.sendMessage(msg.key.remoteJid, { text: "Reply video dengan .sound" });
    
    const stream = await downloadContentFromMessage(quoted.videoMessage, "media");
    let buffer = Buffer.alloc(0);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    
    const input = `./temp/vid_${Date.now()}.mp4`;
    const output = input.replace(".mp4", ".mp3");
    fs.writeFileSync(input, buffer);
    execSync(`ffmpeg -i ${input} -q:a 0 -map a ${output} -y 2>/dev/null`);
    
    await sock.sendMessage(msg.key.remoteJid, { audio: fs.readFileSync(output), mimetype: "audio/mp4" });
    fs.unlinkSync(input);
    fs.unlinkSync(output);
}

module.exports = { handle };
EOF
