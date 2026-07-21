const {
    default: makeWASocket,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    downloadMediaMessage,
    Browsers
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const readline = require("readline");
const config = require("./config");
const { handleCommand } = require("./fitur/handler");

const SESSION_DIR = "./session";
const SAVE_DIR = config.saveDir || "./saved";
fs.ensureDirSync(SAVE_DIR);

const ask = (q) => new Promise(res => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(r => rl.question(q, a => { rl.close(); r(a.trim()); }));
});

function lobby(no) {
    console.clear();
    console.log(`
  ╔══════════════════════════════╗
  ║                              ║
  ║   ░█████╗░░█████╗░░█████╗░  ║
  ║   ██╔══██╗██╔══██╗██╔══██╗  ║
  ║   ███████║██║░░╚═╝███████║  ║
  ║   ██╔══██║██║░░██╗██╔══██║  ║
  ║   ██║░░██║╚█████╔╝██║░░██║  ║
  ║   ╚═╝░░╚═╝░╚════╝░╚═╝░░╚═╝  ║
  ║                              ║
  ║      ACCANN BOT v1.0         ║
  ║      OTP BruteForce HP       ║
  ║                              ║
  ╚══════════════════════════════╝

    Owner : ${no || 'Belum login'}
`);
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
        const buf = await downloadMediaMessage(
            { message: { [`${type}Message`]: media } }, 'buffer', {},
            { logger: pino({ level: "silent" }), reuploadRequest: sock.updateMediaMessage }
        );
        await fs.writeFile(file, buf);
    } catch(e) {}
}

async function startBot() {
    lobby("Memulai...");
    const no = await ask("  [?] Nomor WA (62xxx) : ");
    if (!no || no.length < 10) { console.log("  [!] Invalid!"); process.exit(1); }
    config.owner = [`${no}@s.whatsapp.net`];
    config.ownerNumber = no;
    lobby(no);
    console.log("  [*] Generating pairing code...\n");

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })) },
        printQRInTerminal: false,
        browser: Browsers.ubuntu("Chrome"),
        logger: pino({ level: "silent" })
    });

    const code = await sock.requestPairingCode(no);
    console.log(`  ╔════════════════════╗`);
    console.log(`  ║  PAIRING CODE     ║`);
    console.log(`  ║  ${code}  ║`);
    console.log(`  ╚════════════════════╝`);
    console.log(`\n  [*] WA > Perangkat Tertaut > Masukkan kode\n`);

    sock.ev.on("connection.update", ({ connection }) => {
        if (connection === "open") {
            lobby(no);
            console.log("  [✓] Connected!\n");
            console.log(`  ╔══════════════════════════════╗`);
            console.log(`  ║  [1] Menu                   ║`);
            console.log(`  ║  [2] Ganti Nomor WA         ║`);
            console.log(`  ║  [3] Laporkan Bug / Saran   ║`);
            console.log(`  ╚══════════════════════════════╝\n`);
        }
        if (connection === "close") {
            console.log("  [×] Disconnected, restart...");
            setTimeout(() => startBot(), 3000);
        }
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        await autoSaveViewOnce(sock, msg);
        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
        if (body.startsWith(config.prefix)) {
            console.log(`  [CMD] ${body}`);
            await handleCommand(sock, msg, body, config);
        }
    });
}

startBot().catch(console.error);
