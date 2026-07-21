const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
  Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');

const SESSION_DIR = './session';
const SAVE_DIR = './saved';
let sock = null;
fs.ensureDirSync(SAVE_DIR);
fs.ensureDirSync(SESSION_DIR);

function banner() {
  console.clear();
  console.log(`
░█████╗░░█████╗░░█████╗░░█████╗░███╗░░██╗███╗░░██╗
██╔══██╗██╔══██╗██╔══██╗██╔══██╗████╗░██║████╗░██║
███████║██║░░╚═╝██║░░╚═╝███████║██╔██╗██║██╔██╗██║
██╔══██║██║░░██╗██║░░██╗██╔══██║██║╚████║██║╚████║
██║░░██║╚█████╔╝╚█████╔╝██║░░██║██║░╚███║██║░╚███║
╚═╝░░╚═╝░╚════╝░░╚════╝░╚═╝░░╚═╝╚═╝░░╚══╝╚═╝░░╚══╝

  [*] Scan QR di WhatsApp
  WA > Perangkat Tertaut > Scan QR
`);
}

async function autoSaveViewOnce(msg) {
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
  banner();
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })) },
    printQRInTerminal: true,
    browser: Browsers.ubuntu("Chrome"),
    logger: pino({ level: "silent" })
  });

  sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") console.log("\n  [✓] Connected!\n");
    if (connection === "close") {
      console.log("  [×] Disconnected, restart...");
      setTimeout(() => startBot(), 3000);
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    await autoSaveViewOnce(msg);
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    if (body.startsWith(".")) {
      console.log(`  [CMD] ${body}`);
      const { handleCommand } = require("./fitur/handler");
      await handleCommand(sock, msg, body, { prefix: "." });
    }
  });
}

startBot().catch(console.error);
