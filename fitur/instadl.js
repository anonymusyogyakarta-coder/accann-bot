cat > fitur/instadl.js << 'EOF'
const axios = require("axios");

async function handle(sock, msg, url) {
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: "Masukkan link IG!" });
    try {
        const res = await axios.get(`https://api.ddownr.com/instagram?url=${url}`);
        const d = res.data;
        if (d.type === "mp4") {
            await sock.sendMessage(msg.key.remoteJid, { video: { url: d.url }, caption: "Done" });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { image: { url: d.url }, caption: "Done" });
        }
    } catch(e) {
        await sock.sendMessage(msg.key.remoteJid, { text: "Gagal download." });
    }
}

module.exports = { handle };
EOF
