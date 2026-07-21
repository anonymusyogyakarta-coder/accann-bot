cat > fitur/generate.js << 'EOF'
const axios = require("axios");

async function handle(sock, msg, prompt) {
    if (!prompt) return sock.sendMessage(msg.key.remoteJid, { text: "Contoh: .generate kucing" });
    await sock.sendMessage(msg.key.remoteJid, { text: "Generating..." });
    try {
        const res = await axios.post("https://api.deepai.org/api/text2img", { text: prompt }, {
            headers: { "api-key": "quickstart-QUdJIGlzIGNvbWluZy4uLi4K" }
        });
        await sock.sendMessage(msg.key.remoteJid, { image: { url: res.data.output_url }, caption: prompt });
    } catch(e) {
        await sock.sendMessage(msg.key.remoteJid, { text: "Gagal." });
    }
}

module.exports = { handle };
EOF
