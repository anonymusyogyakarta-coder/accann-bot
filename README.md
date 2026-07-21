cat > README.md << 'EOF'
<p align="center">
  <img src="https://i.postimg.cc/Hnb6Y80d/8cdd0e3ce96e0ba2bf73ce9147b587d1.jpg" width="200" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=30&duration=3000&pause=1000&color=F7A41D&center=true&vCenter=true&width=500&lines=%F0%9F%90%B1+Accann+Bot;WhatsApp+Multi+Feature" alt="Accann Bot" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-green?style=flat&logo=node.js" />
  <img src="https://img.shields.io/badge/Baileys-6.6.0-blue?style=flat&logo=whatsapp" />
  <img src="https://img.shields.io/badge/Termux-OK-brightgreen?style=flat&logo=android" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=14&duration=4000&pause=500&color=FF8C00&center=true&vCenter=true&width=500&lines=.ai+.s+.sound+.instadownload+.tikdownload;.neko+.generate+.cuaca+.gombal+.textvoice;View+Once+%3D+Auto+Save+%F0%9F%94%92" />
</p>

---

## Features

| Command | Description |
|---------|-------------|
| `.ai [text]` | Chat with OpenAI GPT |
| `.s` | Sticker from image/video (reply) |
| `.sound` | Extract audio from video (reply) |
| `.instadownload [link]` | Download Instagram |
| `.tikdownload [link]` | Download TikTok |
| `.neko` | Random cute anime neko |
| `.generate [prompt]` | AI image generation |
| `.cuaca [city]` | Weather information |
| `.gombal` | Random pick-up lines |
| `.textvoice` | Text to voice note (reply) |
| `.menu` | Show menu |

**Auto Save:** View Once media auto-saved to internal storage.

---

## Tech Stack

| Language | Usage |
|----------|-------|
| **JavaScript** | 95% — Main bot, features, handlers |
| **JSON** | 5% — Config, package |

| Library | Purpose |
|---------|---------|
| `@whiskeysockets/baileys` | WhatsApp Web API |
| `axios` | HTTP requests |
| `sharp` | Image processing (sticker) |
| `dotenv` | Environment variables |
| `pino` | Logging |

---

## Installation (Termux)

```bash
# Update packages
pkg update && pkg upgrade -y

# Install requirements
pkg install nodejs ffmpeg git -y

# Clone repo
git clone https://github.com/anonymusyogyakarta-coder/accann-bot.git
cd accann-bot

# Install dependencies
npm install

# Edit API keys
nano .env

# Run bot
node index.js
