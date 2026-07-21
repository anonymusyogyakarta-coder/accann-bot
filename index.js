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
const rl = require("readline");
const { exec } = require("child_process");
const config = require("./config");
const { handleCommand } = require("./fitur/handler");

const SESSION_DIR = "./session";
const SAVE_DIR = config.saveDir || "./saved";

fs.ensureDirSync(SAVE_DIR);
fs.ensureDirSync(SESSION_DIR);

const ask = (q) => new Promise(res => {
    const r = rl.createInterface({ input: process.stdin, output: process.stdout });
    r.question(q, a => { r.close(); res(a.trim()); });
});

function showBanner(no) {
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

    Owner : ${no}
`);
}

function mainMenu() {
    console.log(`
  ╔══════════════════════════════╗
  ║          ACCANN BOT         ║
  ╠══════════════════════════════╣
  ║  [1]  Menu                  ║
  ║  [2]  Masukkan Nomor WA     ║
  ║  [3]  Laporkan Bug / Saran  ║
  ╚══════════════════════════════╝
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
            { message: { [`${type}Message`]: media } },
            'buffer', {},
            { logger: pino({ level: "silent" }), reuploadRequest: sock.updateMediaMessage }
        );
        await fs.writeFile(file, buf);
        console.log(`  [✓] View Once saved: ${file}`);
    } catch(e) {}
}

async function startBot() {
    console.clear();
    const no = await ask("  [?] Nomor WA (62xxx) : ");
    if (!no || no.length < 10) { console.log("  [!] Invalid!"); process.exit(1); }
    config.owner = [`${no}@s.whatsapp.net`]; config.ownerNumber = no;
    showBanner(no);

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();

    console.log("  [*] Generating pairing code...\n");

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
        printQRInTerminal: false,
        browser: Browsers.ubuntu("Chrome"),
        logger: pino({ level: "silent" })
    });

    if (!sock.authState.creds.registered) {
        const code = await sock.requestPairingCode(no);
        console.log(`  ╔════════════════════╗`);
        console.log(`  ║  PAIRING CODE     ║`);
        console.log(`  ║  ${code}  ║`);
        console.log(`  ╚════════════════════╝`);
        console.log(`\n  [*] WA > Perangkat Tertaut > Masukkan kode\n`);
    }

    sock.ev.on("connection.update", ({ connection }) => {
        if (connection === "open") {
            console.log("  [✓] Connected!\n");
            showBanner(no);
            mainMenu();
            handleMainMenu(sock, no);
        }
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
        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
        if (body.startsWith(config.prefix)) {
            console.log(`  [CMD] ${body}`);
            await handleCommand(sock, msg, body, config);
        }
    });
}

async function handleMainMenu(sock, no) {
    const p = await ask("\n  ⟩⟩⟩ Pilih opsi (1/2/3) : ");
    if (p === "1") {
        console.log("\n  [*] Bot siap digunakan. Kirim .menu di WhatsApp.\n");
    } else if (p === "2") {
        console.clear();
        const newNo = await ask("  [?] Masukkan nomor WA baru (62xxx) : ");
        if (newNo && newNo.length >= 10) {
            config.owner = [`${newNo}@s.whatsapp.net`];
            config.ownerNumber = newNo;
            showBanner(newNo);
            const code = await sock.requestPairingCode(newNo);
            console.log(`  ╔════════════════════╗`);
            console.log(`  ║  PAIRING CODE     ║`);
            console.log(`  ║  ${code}  ║`);
            console.log(`  ╚════════════════════╝`);
            console.log(`\n  [*] WA > Perangkat Tertaut > Masukkan kode\n`);
        }
    } else if (p === "3") {
        console.log("\n  [*] Membuka Instagram...\n");
        exec("termux-open-url https://www.instagram.com/hznxwick?igsh=MWRlOXF2d3c0Znhuaw==");
        console.log("  [✓] Terima kasih!\n");
    } else {
        console.log("  [!] Pilihan gak valid.");
    }
}

startBot().catch(console.error);
