cat > fitur/gombal.js << 'EOF'
const gombalan = [
    "Kamu suka nge-charge HP? Soalnya kamu nge-charge hati aku.",
    "Aku gak butuh Google, cukup kamu yang selalu punya jawabannya.",
    "Kamu itu kayak hujan, datang tiba-tiba bikin adem.",
    "Kalau aku WiFi, kamu password-nya."
];

async function handle(sock, msg) {
    const random = gombalan[Math.floor(Math.random() * gombalan.length)];
    await sock.sendMessage(msg.key.remoteJid, { text: random });
}

module.exports = { handle };
EOF
