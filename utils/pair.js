import readline from "readline";

export default function question(text = "question") {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(`\x1b[35;1mTM\x1b[0m\x20\x1b[37m${text}\x1b[0m`, answer => {
            rl.close();
            resolve(answer);
        });
    });
}