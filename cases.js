
import fs from "fs";
import path from "path";
import { exec } from "child_process";


function getMedia(m) {
  if (m.message && m.message[m.type]) {
    return m.message[m.type];
  } else if (m.quoted && m.quoted[m.type]) {
    return m.quoted[m.type];
  } else if (m.msg && m.msg[m.type]) {
    return m.msg[m.type];
  }
}
export default async function command(mb, m) {
  const ownerStatus = m.isOwner ? "Hello my lord" : "Uhh, a mortal?";
  const pesan = `
-------------------------
The Test 1.0
-------------------------
From: ${m.from}
To: The Test 1.0
Type: ${m.type}
Message: ${m.body}

By: ${author}
-------------------------
`;

  if (!m.body.startsWith(global.mb.prefix)) {
        return
  }

  console.log(pesan);

  try {
    switch (m.cmd) {

      case "menu":
        const menu = `Hello ${m.pushName},\n\nsaya The Test 1.0, asisten pribadi kamu.\n\nberikut adalah beberapa perintah yang bisa kamu gunakan:\n\n1. *The Test* - untuk berinteraksi dengan saya.\n\n`;
        m.balasan(menu);
        break;

      default:
        m.balasan(`what r u talkin about?.\n\n> ${copyright}`);
        break;
    }
  } catch (err) {
    m.balasan(`error!\n${err}\n\n contact: ${global.owner.number}`);
    console.error(err);
  }
}
