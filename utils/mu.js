import { getContentType, isJidGroup, isJidNewsletter, isJidStatusBroadcast, isJidUser, jidDecode, jidNormalizedUser, downloadMediaMessage } from '@whiskeysockets/baileys'
import cases from '../cases.js';


export default async function munch(mb, m) {
    if (!m.message) return;

    m.id = m.key.id;
    m.from = m.key.remoteJid;
    m.isGroup = isJidGroup(m.from);
    m.private = isJidUser(m.from);
    m.channel = isJidNewsletter(m.from);
    m.story = isJidStatusBroadcast(m.from);
    m.name = m.pushName || m.senderName || m.name || m.from;
    m.quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
    if (m.quoted) {
        m.quoted.id = m.message.extendedTextMessage.contextInfo.stanzaId;
        m.quoted.sender = m.message.extendedTextMessage.contextInfo.participant;
        m.quoted.fromMe = m.quoted.sender === mb.user?.id;
        m.quoted.type = getContentType(m.quoted);
        m.quoted.body = m.quoted.type === "conversation"
            ? m.quoted.conversation
            : m.quoted[m.quoted.type]?.caption
            || m.quoted[m.quoted.type]?.text
            || "";
    }
    m.groupCreate = m.isGroup && m.key.fromMe && m.message?.groupCreateMessage;
    m.senderId = m.isNewsletter 
    ? "" 
    : m.isGroup || m.isStory
    ? m.key.participant
    : m.key.remoteJid 
    || jidNormalizedUser;
    m.fromMe = m.key.fromMe;

    if (m.fromMe) return;

    if (m.isGroup && !m.participants) {
        const groupMetadata = await mb.groupMetadata(m.from);
        m.participants = groupMetadata.participants;
    }

    m.isAdmin = m.isGroup && m.participant?.admin === "admin";
    m.isSuperAdmin = m.isGroup && m.participant?.admin === "superadmin";
    m.isBotAdmin = m.isGroup && Array.isArray(m.participants) &&
    m.participants.some(p => p.id === mb.user?.id && (p.admin === "admin" || p.admin === "superadmin"));

    m.isOwner = global.owner.some(owner => jidDecode(m.senderId).user === owner.nusser);
    m.isAuthor = jidDecode(m.senderId).user === global.authorthisbot.nusser;
    m.type = getContentType(m.message);
    m.body = m.type === "conversation" 
  ? m.message.conversation 
  : m.message[m.type]?.caption 
  || m.message[m.type]?.text 
  || m.message[m.type]?.singleSelectReply?.selectedRowId 
  || m.message[m.type]?.nativeFlowResponseMessage?.paramsJson
  || "";

    m.getMedia = async (type) => {
        if (!m.message || !m.message[type]) return null;

        try {
            const media = await downloadMediaMessage(m, "buffer");
            return media;
        } catch (err) {
            console.error("Failed to download media:", err.message);
            return null;
        }
    }
    m.reactMessage = async (emoji, key = m.key) => {
        try {
            await mb.sendMessage(m.senderId, { react: { text: emoji, key } });
        } catch (err) {
            console.error("Failed to send reaction:", err.message);
        }
    };
    m.sendPhoto = async (buffer, caption = "") => {
        try {
            await mb.sendMessage(m.from, {
                image: buffer,
                caption: caption,
            });
        } catch (err) {
            console.error("Failed to send photo:", err.message);
        }
    };
    m.sendAudio = async (buffer, ptt = false, caption = "") => {
        try {
            await mb.sendMessage(m.from, {
                audio: buffer,
                ptt: ptt, 
                caption: caption, 
            });
        } catch (err) {
            console.error("Failed to send audio:", err.message);
        }
    };
    m.sendVideo = async (buffer, caption = "") => {
        try {
            await mb.sendMessage(m.from, {
                video: buffer,
                caption: caption, 
            });
        } catch (err) {
            console.error("Failed to send video:", err.message);
        }
    };
    m.sendSticker = async (buffer, isAnimated = false) => {
        try {
            const sticker = await createSticker(buffer, {
                type: isAnimated ? "full" : "crop", 
                pack: global.mb.packname || "Kamui 1.0", 
                author: global.mb.author || "Munchy", 
            });
            await mb.sendMessage(m.from, {
                sticker: sticker,
            });
        } catch (err) {
            console.error("Failed to send sticker:", err.message);
        }
    };
    m.desc = m.type === "conversation" 
    ? m.message.conversation 
    : m.message[m.type].caption 
    || m.message[m.type].text
    || m.message[m.type].description
    || m.message[m.type].title 
    || m.message[m.type].contentText 
    || m.message[m.type].selectedDisplayText
    || "";
    
    
    m.isCommandM = m.body.trim().startsWith(global.mb.prefix);
    m.isCmd = m.body.trim().startsWith(global.mb.prefix);
    m.cmd = m.body.trim().normalize("NFKC").replace(global.mb.prefix, "").split(" ")[0].toLowerCase();
    m.args = m.body.trim().replace(/^\S*\b/g, "").split(global.mb.splitar).map(arg => arg.trim()).filter(arg => arg);

    m.balasan = (text) => mb.sendMessage(m.from, 
    {
        text,
    }, 
    {
        quoted: {
            key: {
                id: m.id,
                fromMe: false,
                remoteJid: "status@broadcast",
                participant: "0@whatsapp.net"
            },
            message: {
                conversation: ` ${m.text}`
            }
        }
    });
    m.toAuthor = (text) => mb.sendMessage(m.from, 
        {
            text,
        }, 
        {
            quoted: {
                key: {
                    id: m.id,
                    fromMe: false,
                    remoteJid: "status@broadcast",
                    participant: "0@whatsapp.net"
                },
                message: {
                    conversation: ` ${m.text}`
                }
            }
        });
    m.balasanButtons = async (text, footer, buttons) => {
        return await mb.sendMessage(m.from, {
            text: text,
            footer: footer,
            buttons: buttons,
            headerType: 1
        }, {
            quoted: {
                key: {
                    id: m.id,
                    fromMe: false,
                    remoteJid: "status@broadcast",
                    participant: "0@whatsapp.net"
                },
                message: {
                    conversation: ` ${m.text}`
                }
            }
        });
    }

    return cases(mb, m);
}
