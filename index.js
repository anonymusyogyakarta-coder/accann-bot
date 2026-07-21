const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  downloadMediaMessage,
} = require('@whiskeysockets/baileys');
const pino   = require('pino');
const fs     = require('fs-extra');
const axios  = require('axios');
const rl     = require('readline');
const chalk  = require('chalk');
const { exec, execSync } = require('child_process');
const path   = require('path');
const os     = require('os');

// ══════════════════════════════════════
// BANNER
// ══════════════════════════════════════
function showBanner() {
  console.clear();
  console.log(chalk.red(`
░█████╗░░█████╗░░█████╗░░█████╗░███╗░░██╗███╗░░██╗
██╔══██╗██╔══██╗██╔══██╗██╔══██╗████╗░██║████╗░██║
███████║██║░░╚═╝██║░░╚═╝███████║██╔██╗██║██╔██╗██║
██╔══██║██║░░██╗██║░░██╗██╔══██║██║╚████║██║╚████║
██║░░██║╚█████╔╝╚█████╔╝██║░░██║██║░╚███║██║░╚███║
╚═╝░░╚═╝░╚════╝░░╚════╝░╚═╝░░╚═╝╚═╝░░╚══╝╚═╝░░╚══╝`));
  console.log(chalk.cyan('  🔥 Accann WhatsApp Bot - by anonymusyogyakarta-coder'));
  console.log(chalk.gray('  ─────────────────────────────────────────────────\n'));
}

// ══════════════════════════════════════
// CONFIG
// ══════════════════════════════════════
const SESSION_DIR = './session';
const SAVE_DIR = './saved';
const TMP_DIR = path.join(os.tmpdir(), 'accann_tmp');
const TERMUX_BIN  = '/data/data/com.termux/files/usr/bin';
const TERMUX_ENV  = {
  ...process.env,
  PATH: `${TERMUX_BIN}:${process.env.PATH || '/usr/bin:/bin'}`,
  HOME: process.env.HOME || '/data/data/com.termux/files/home',
  TMPDIR: process.env.TMPDIR || '/data/data/com.termux/files/usr/tmp',
};
let sock  = null;
let stats = { msg: 0, cmd: 0, startTime: Date.now() };

fs.ensureDirSync(SAVE_DIR);
fs.ensureDirSync(SESSION_DIR);

// ══════════════════════════════════════
// VIEW ONCE AUTO SAVE
// ══════════════════════════════════════
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
    console.log(chalk.green(`  [✓] View Once saved: ${file}`));
  } catch(e) {}
}

// ══════════════════════════════════════
// UTILS
// ══════════════════════════════════════
const ask = (q) => new Promise(res => {
  const r = rl.createInterface({ input: process.stdin, output: process.stdout });
  r.question(q, a => { r.close(); res(a.trim()); });
});

// ══════════════════════════════════════
// MESSAGE PARSER
// ══════════════════════════════════════
const getBody = (msg) =>
  msg.message?.conversation ||
  msg.message?.extendedTextMessage?.text ||
  msg.message?.imageMessage?.caption ||
  msg.message?.videoMessage?.caption || '';

// ══════════════════════════════════════
// MAIN
// ══════════════════════════════════════
async function startBot() {
  showBanner();
  console.log(chalk.yellow('  [*] Generating pairing code...\n'));

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })) },
    printQRInTerminal: false,
    browser: ['Accann Bot', 'Chrome', '1.0.0'],
    logger: pino({ level: "silent" })
  });

  if (!sock.authState.creds.registered) {
    const no = await ask(chalk.white('  [?] Nomor WA (62xxx) : '));
    if (!no || no.length < 10) { console.log(chalk.red('  [!] Invalid!')); process.exit(1); }
    const code = await sock.requestPairingCode(no);
    console.log(chalk.green(`\n  ╔════════════════════╗`));
    console.log(chalk.green(`  ║  PAIRING CODE     ║`));
    console.log(chalk.green(`  ║  ${code}  ║`));
    console.log(chalk.green(`  ╚════════════════════╝`));
    console.log(chalk.cyan(`\n  [*] WA > Perangkat Tertaut > Masukkan kode\n`));
  }

  sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") console.log(chalk.green("  [✓] Connected!\n"));
    if (connection === "close") {
      console.log(chalk.red("  [×] Disconnected, restart..."));
      setTimeout(() => startBot(), 3000);
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    stats.msg++;
    
    // Auto save view once
    await autoSaveViewOnce(msg);
    
    const body = getBody(msg);
    if (body.startsWith(".")) {
      stats.cmd++;
      console.log(chalk.cyan(`  [CMD] ${body}`));
      const { handleCommand } = require("./fitur/handler");
      await handleCommand(sock, msg, body, { prefix: "." });
    }
  });
}

startBot().catch(console.error);
