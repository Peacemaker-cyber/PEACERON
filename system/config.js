import { time } from "console";
import fs from "fs";
import path from "path";

const pkg = JSON.parse(fs.readFileSync( "package.json"), "utf-8")

global.mb = {
    name: "The Test 1.0",
    version: pkg["version"],
    prefix: ".",
    splitar: "|",
    timezone: "Asia/Kolkata",
    packname: "The Test 1.0",
    author: "Munchy",
    locale: "en",
    urlMed: "",
    newsletter: "",
    commands: (() => {
        return []
    })(),
    setting: JSON.parse(fs.readFileSync("./system/idk.json"), "utf-8"),
    saveTing: async function() {
        await fs.promises.writeFile("./system/idk.json", JSON.stringify(global.mb.setting), "utf-8");
        return global.mb.setting;
    }
}

global.apikey = {
    "https://api.munchyxsa.xyz": "munchyxsa",
    "https://api.munchybot.xyz": "munchybot"
}

global.owner = [{
    name: "Demon King",
    number: "6281931488608",
    email: "munchynes@abyss.com",
    location: "Abyss kingdom, Sky Abyss"
}]



























































































































global.authorthisbot = {
    namanya: "Munchy the Demon King",
    number: "6281931488608",
}