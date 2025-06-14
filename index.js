import { spawn } from "child_process";

(function start() {
  const mb = spawn(process.argv0, ["./system/system.js", ...process.argv.slice(2)], {
    stdio: ["inherit", "inherit", "inherit", "ipc"],
  });
  mb.on("message", (msg) => {
    if(msg === "restart") {
      mb.kill();
      mb.once("close", start);
    }
  }).on("exit", (code) => {
    if(code) start();
  }).on("error", console.log);
})();