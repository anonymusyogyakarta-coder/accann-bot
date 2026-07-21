cat > fitur/neko.js << 'EOF'
const axios = require("axios");

async function handle(sock, msg) {
    try {
        const res = await axios.get("https://api.waifu.pics/sfw/neko");
        await sock.sendMessage(msg.key.remoteJid, { image: { url: res.data.url }, caption: "Nyaa~" });
    } catch(e) {
        await sock.sendMessage(msg.key.remoteJid, { text: "Gagal." });
    }
}

module.exports = { handle };
EOF
