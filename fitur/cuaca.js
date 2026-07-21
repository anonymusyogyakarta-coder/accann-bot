cat > fitur/cuaca.js << 'EOF'
const axios = require("axios");
const config = require("../config");

async function handle(sock, msg, daerah) {
    if (!daerah) return sock.sendMessage(msg.key.remoteJid, { text: "Contoh: .cuaca jakarta" });
    try {
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${daerah}&appid=${config.weatherApi}&lang=id&units=metric`);
        const d = res.data;
        await sock.sendMessage(msg.key.remoteJid, { text: `Cuaca ${d.name}\nSuhu: ${d.main.temp}°C\nKelembaban: ${d.main.humidity}%\nKondisi: ${d.weather[0].description}` });
    } catch(e) {
        await sock.sendMessage(msg.key.remoteJid, { text: "Daerah tidak ditemukan." });
    }
}

module.exports = { handle };
EOF
