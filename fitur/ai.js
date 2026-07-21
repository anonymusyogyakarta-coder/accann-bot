const axios = require("axios");
const config = require("../config");

async function handle(sock, msg, prompt) {
    if (!prompt) return sock.sendMessage(msg.key.remoteJid, { text: "Contoh: .ai halo" });
    try {
        const res = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }]
        }, {
            headers: { Authorization: `Bearer ${config.openai}` }
        });
        await sock.sendMessage(msg.key.remoteJid, { text: res.data.choices[0].message.content });
    } catch(e) {
        await sock.sendMessage(msg.key.remoteJid, { text: "AI error." });
    }
}

module.exports = { handle };
