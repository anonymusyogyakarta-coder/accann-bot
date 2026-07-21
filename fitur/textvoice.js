const axios = require("axios");
const config = require("../config");

async function handle(sock, msg) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const text = quoted?.conversation || quoted?.extendedTextMessage?.text;
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: "Reply text dengan .textvoice" });
    try {
        const res = await axios.post("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
            text: text, model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.5 }
        }, {
            headers: { "xi-api-key": config.ttsKey, "Content-Type": "application/json" },
            responseType: "arraybuffer"
        });
        await sock.sendMessage(msg.key.remoteJid, { audio: Buffer.from(res.data), mimetype: "audio/mp4", ptt: true });
    } catch(e) {
        await sock.sendMessage(msg.key.remoteJid, { text: "Gagal." });
    }
}

module.exports = { handle };
