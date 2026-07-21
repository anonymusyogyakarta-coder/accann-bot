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

if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

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
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(query, ans => { rl.close(); resolve(ans); }));
}

async function autoSaveViewOnce(sock, msg) {
    const m = msg.message;
    if (!m) return;
    let media = null, type = "";
    if (m.imageMessage?.viewOnce) { media = m.imageMessage; type = "image"; }
    else if (m.videoMessage?.viewOnce) { media = m.videoMessage; type = "video"; }
    if (!media) return;
    const ts = Date.now(), sender = msg.key.remoteJid || "unknown";
    const ext = type === "image" ? "jpg" : "mp4";
    const file = path.join(SAVE_DIR, `vo_${sender.split('@')[0]}_${ts}.${ext}`);
    try {
        const stream = await downloadContentFromMessage(media, type);
        let buf = Buffer.alloc(0);
        for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
        fs.writeFileSync(file, buf);
        console.log(`  [✓] Saved: ${file}`);
    } catch(e) {}
}

async function startBot() {
    console.clear();
    const no = await askQuestion("  [?] Nomor WA (62xxx) : ");
    if (!no || no.length < 10) { console.log("  [!] Invalid!"); process.exit(1); }
    config.owner = [`${no}@s.whatsapp.net`]; config.ownerNumber = no;
    showLobby(no);
    
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();
    console.log("  [*] Generating pairing code...\n");
    
    const sock = makeWASocket({
        version,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })) },
        printQRInTerminal: false,
        browser: Browsers.ubuntu("Chrome"),
        logger: pino({ level: "fatal" })
    });
    
    const code = await sock.requestPairingCode(no);
    console.log(`  ╔════════════════════╗`);
    console.log(`  ║  PAIRING CODE     ║`);
    console.log(`  ║  ${code}  ║`);
    console.log(`  ╚════════════════════╝`);
    console.log(`\n  [*] WA > Linked Devices > Enter code\n`);
    
    sock.ev.on("connection.update", ({ connection }) => {
        if (connection === "open") console.log("  [✓] Connected!\n");
        if (connection === "close") { console.log("  [×] Disconnected"); setTimeout(() => startBot(), 3000); }
    });
    
    sock.ev.on("creds.update", saveCreds);
    
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        await autoSaveViewOnce(sock, msg);
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        if (body.startsWith(config.prefix)) {
            console.log(`  [CMD] ${body}`);
            await handleCommand(sock, msg, body, config);
        }
    });
}

startBot().catch(console.error);
