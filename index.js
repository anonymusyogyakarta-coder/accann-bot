cat > index.js << 'EOF'
const {
    default: makeWASocket,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    downloadContentFromMessage,
    Browsers
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const config = require("./config");
const { handleCommand } = require("./fitur/handler");

const SESSION_DIR = "./session";
const SAVE_DIR = config.saveDir || "/storage/emulated/0/AccannBot";

if (!fs.existsSync(SAVE_DIR)) {
    fs.mkdirSync(SAVE_DIR, { recursive: true });
}

function showLobby(ownerNumber) {
    console.clear();
    console.log(`
⢀⣴⣿⣿⡷⣄
⢀⣴⣿⡿⠋⠈⠻⣮⣳⡀
⢀⣠⣴⣾⡿⠋⠀⠀⠙⣿⣿⣤⣀⡀
⢀⣤⣶⣿⡿⠟⠛⠉⠀⠀⠀⠈⠛⠛⠿⠿⣿⣷⣶⣤⣄⣀
⣠⣴⣾⡿⠟⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠛⠻⠿⣿⣶⣦⣄⡀
⣀⣠⣤⣤⣀⡀⠀⠀⣀⣴⣿⡿⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠿⣿⣷⣦⣄⡀⠀⢀⣀⣤⣄
⣤⣾⡿⠟⠛⠛⢿⣿⣶⣾⣿⠟⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠿⣿⣷⣦⣀⣀⣤⣶⣿⡿⠿⢿⣿⡀
⣿⠏⠀⢰⡆⠀⠉⢿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⢿⡿⠟⠋⠁⠀⢸⣿⠇
⡟⠀⣀⠈⣀⡀⠒⠃⠀⠙⣿⡆⠀⠀⠀⠀⠀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠇
⡇⠀⠛⢠⡋⢙⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⣿⣿⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿
⣧⠀⠀⠀⠓⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠛⠋⠀⠀⢸⣧⣤⣤⣶⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⡿
⣿⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠻⣷⣶⣶⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⣿⠁
⠛⠻⠿⢿⣿⣷⣶⣦⣤⣄⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⣷⠀⠀⠀⠀⣾⣿⡏
⠀⠀⠉⠙⠛⠻⠿⢿⣿⣷⣶⣦⣤⣄⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠿⠛⠀⠀⠀⠀⠘⢿⣿⡄
⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠙⠛⠻⠿⢿⣿⣷⣶⣦⣤⣄⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⡄
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠛⠛⠿⠿⣿⣷⣶⣶⣤⣤⣀⡀⠀⠀⠀⢀⣴⡆⠀⠀⠀⠀⠀⠀⠈⢿⡿⣄
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠛⠛⠿⠿⣿⣷⣶⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⣹
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⠃⠀⠀⠀⠀⠀⠀⢀⣀⣀⠀⠀⢸⣧
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣆⠀⠀⢀⣀⣠⣤⣶⣾⣿⣿⣿⣿⣤⣄⣀⡀⠀⣿
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⢿⣻⣷⣶⣾⣿⣿⡿⢯⣛⣛⡋⠁⠉⠙⠛⠛⠿⣿⣿⡷⣶⣿

░█████╗░░█████╗░░█████╗░░█████╗░███╗░░██╗███╗░░██╗
██╔══██╗██╔══██╗██╔══██╗██╔══██╗████╗░██║████╗░██║
███████║██║░░╚═╝██║░░╚═╝███████║██╔██╗██║██╔██╗██║
██╔══██║██║░░██╗██║░░██╗██╔══██║██║╚████║██║╚████║
██║░░██║╚█████╔╝╚█████╔╝██║░░██║██║░╚███║██║░╚███║
╚═╝░░╚═╝░╚════╝░░╚════╝░╚═╝░░╚═╝╚═╝░░╚══╝╚═╝░░╚══╝

██████╗░░█████╗░████████╗
██╔══██╗██╔══██╗╚══██╔══╝
██████╦╝██║░░██║░░░██║░░░
██╔══██╗██║░░██║░░░██║░░░
██████╦╝╚█████╔╝░░░██║░░░
╚═════╝░░╚════╝░░░░╚═╝░░░

    Owner : ${ownerNumber}
    Save  : ${SAVE_DIR}
`);
}

async function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function autoSaveViewOnce(sock, msg) {
    const msgTypes = msg.message;
    if (!msgTypes) return;
    
    let media = null;
    let type = "";
    let isViewOnce = false;
    
    if (msgTypes.imageMessage) {
        media = msgTypes.imageMessage;
        type = "image";
        isViewOnce = media.viewOnce || false;
    } else if (msgTypes.videoMessage) {
        media = msgTypes.videoMessage;
        type = "video";
        isViewOnce = media.viewOnce || false;
    }
    
    if (!media || !isViewOnce) return;
    
    const timestamp = Date.now();
    const sender = msg.key.remoteJid || "unknown";
    const ext = type === "image" ? "jpg" : "mp4";
    const filename = path.join(SAVE_DIR, `viewonce_${sender.split('@')[0]}_${timestamp}.${ext}`);
    
    try {
        const stream = await downloadContentFromMessage(media, type);
        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        fs.writeFileSync(filename, buffer);
        console.log(`  [✓] Saved: ${filename}`);
    } catch(e) {
        console.log(`  [×] Gagal: ${e.message}`);
    }
}

async function startBot() {
    console.clear();
    
    const ownerNumber = await askQuestion("  [?] Nomor WA bot (62xxx) : ");
    if (!ownerNumber || ownerNumber.length < 10) {
        console.log("  [!] Nomor gak valid!");
        process.exit(1);
    }
    
    config.owner = [`${ownerNumber}@s.whatsapp.net`];
    config.ownerNumber = ownerNumber;
    
    showLobby(ownerNumber);
    
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();
    
    console.log("  [*] Generating pairing code...\n");
    
    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
        },
        printQRInTerminal: false,
        browser: Browsers.ubuntu("Chrome"),
        logger: pino({ level: "fatal" })
    });
    
    const code = await sock.requestPairingCode(ownerNumber);
    console.log(`  ╔════════════════════╗`);
    console.log(`  ║  PAIRING CODE     ║`);
    console.log(`  ║  ${code}  ║`);
    console.log(`  ╚════════════════════╝`);
    console.log(`\n  [*] WA > Linked Devices > Enter code\n`);
    
    sock.ev.on("connection.update", ({ connection }) => {
        if (connection === "open") console.log("  [✓] Connected!\n");
        if (connection === "close") {
            console.log("  [×] Disconnected, restarting...");
            setTimeout(() => startBot(), 3000);
        }
    });
    
    sock.ev.on("creds.update", saveCreds);
    
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        
        await autoSaveViewOnce(sock, msg);
        
        const body = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || "";
        
        if (body.startsWith(config.prefix)) {
            console.log(`  [CMD] ${body}`);
            await handleCommand(sock, msg, body, config);
        }
    });
}

startBot().catch(console.error);
EOF
