cat > fitur/tikdl.js << 'EOF'
const axios = require("axios");

async function handle(sock, msg, url) {
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: "Masukkan link TikTok!" });
    try {
        const res = await axios.get(`https://api.tikmate.app/api/download?url=${url}`);
        const d = res.data;
        await sock.sendMessage(msg.key.remoteJid, {
            video: { url: `https://tikmate.app/download/${d.token}/${d.id}.mp4` },
            caption: "Done"
        });
    } catch(e) {
        await sock.sendMessage(msg.key.remoteJid, { text: "Gagal download." });
    }
}

module.exports = { handle };
EOF
