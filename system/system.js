import "./config.js";
import { makeWASocket, useMultiFileAuthState, isJidNewsletter, downloadMediaMessage } from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import question from "../utils/pair.js";
import munch from "../utils/mu.js";

(async function start(usePairingCode = true) {
    const session = await useMultiFileAuthState("Session");
    const mb = makeWASocket({
        printQRInTerminal: !usePairingCode,
        auth: session.state,
        logger: pino({ level: "silent" }).child({ level: "silent" }), shouldIgnoreJid: (jid) => isJidNewsletter(jid)
    });
    if (usePairingCode && !mb.user && !mb.authState.creds.registered) {
        const waNumber = await question(`enter ur number: \n`);
        const code = await mb.requestPairingCode(waNumber.replace(/\D/g, ""));
        console.log(`\x1b[32;1m\x20PAIRING CODE\x20\x1b[0m>`, code, '<');
    }
    mb.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            console.log("Error, reload...");
            const { statusCode, error } = lastDisconnect.error.output.payload;
            if (statusCode === 401 && error === "Unauthorized") {
                await fs.promises.rm("session", {
                    recursive: true,
                    force: true
                });
            }
            return start();
        }
        if (connection === "open") {
            const startTime = Date.now();

            // Update profile name, status, and photo when bot is active
            try {
            await mb.updateProfileName("Vyrn Bot");
            await mb.updateProfileStatus(`Active for 00:00:00`);
            const photoPath = "../lib/media/profile.png"; // Path to your photo
            if (fs.existsSync(photoPath)) {
                const photoBuffer = fs.readFileSync(photoPath);
                // Use a buffer, not a file path, for updateProfilePicture
                await mb.updateProfilePicture(mb.user.id, photoBuffer);
            }
            } catch (e) {
            console.error("Failed to update profile:", e);
            }

            setInterval(async () => {
            const uptime = Date.now() - startTime;
            const time = new Date(uptime).toISOString().slice(11, 19);
            try {
                await mb.updateProfileStatus(`Active for ${time}`);
            } catch (e) {
                // ignore errors
            }
            }, 15000);

            const text = `Vyrn active \nSc Created by ${author} `;
            let index = 0;
            let display = "";

            const typingInterval = setInterval(() => {
            if (index < text.length) {
                display += text[index];
                console.clear();
                console.log("\x1b[32;1m" + display + "\x1b[0m");
                index++;
            } else {
                clearInterval(typingInterval);
            }
            }, 100);
        }
    });
    
    mb.ev.on("creds.update", session.saveCreds);
    mb.ev.on("messages.upsert", ({ messages }) => munch(mb, messages[0]));
})();
