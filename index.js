const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
  Browsers
} = require('@whiskeysockets/baileys');
const pino   = require('pino');
const fs     = require('fs-extra');
const path   = require('path');
const rl     = require('readline');

// ══════════════════════════════════════
// BANNER
// ══════════════════════════════════════
function showBanner(no) {
  console.clear();
  console.log(`
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

  Owner : ${no || 'Belum login'}
`);
}

// ══════════════════════════════════════
// CONFIG
// ══════════════════════════════════════
const SESSION_DIR = './session';
const SAVE_DIR = './saved';
let sock = null;
fs.ensureDirSync(SAVE_DIR);
fs.ensureDirSync(SESSION_DIR);

const ask = (q) => new Promise(res => {
  const r = rl.createInterface({ input: process.stdin, output: process.stdout });
  r.question(q, a => { r.close(); res(a.trim()); });
});

// ══════════════════════════════════════
// AUTO SAVE VIEW ONCE (tanpa command)
// ══════════════════════════════════════
async function autoSaveViewOnce(msg) {
  const m = msg.message;
  if (!m) return;
  let media = null, type = "";
  if (m.imageMessage?.viewOnce) { media = m.imageMessage; type = "image"; }
  else if (m.videoMessage?.viewOnce) { media = m.videoMessage; type = "video"; }
  if (!media) return;

  const ts = Date.now();
  const sender = msg.key.remoteJid || "unknown";
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

// ══════════════════════════════════════
// MAIN
// ══════════════════════════════════════
async function startBot() {
  showBanner("Starting...");
  const no = await ask("  [?] Nomor WA (62xxx) : ");
  if (!no || no.length < 10) { console.log("  [!] Invalid!"); process.exit(1); }
  showBanner(no);
  console.log("  [*] Generating pairing code...\n");

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })) },
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
      showBanner(no);
      console.log("  [✓] Connected!\n");
      console.log("  ╔══════════════════════════════╗");
      console.log("  ║  [1] Menu                   ║");
      console.log("  ║  [2] Ganti Nomor WA         ║");
      console.log("  ║  [3] Laporkan Bug / Saran   ║");
      console.log("  ╚══════════════════════════════╝\n");
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
    
    // Auto save view once
    await autoSaveViewOnce(msg);
    
    // Command handler
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    if (body.startsWith(".")) {
      console.log(`  [CMD] ${body}`);
      const { handleCommand } = require("./fitur/handler");
      await handleCommand(sock, msg, body, { prefix: ".", owner: [`${no}@s.whatsapp.net`] });
    }
  });
}

startBot().catch(console.error);
