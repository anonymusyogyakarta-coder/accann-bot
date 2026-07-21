cat > config.js << 'EOF'
require('dotenv').config();

module.exports = {
    name: "Accann",
    prefix: ".",
    owner: [],
    ownerNumber: "",
    openai: process.env.OPENAI_KEY || "",
    weatherApi: process.env.WEATHER_KEY || "",
    ttsKey: process.env.TTS_KEY || "",
    saveDir: "/storage/emulated/0/AccannBot"
};
EOF
