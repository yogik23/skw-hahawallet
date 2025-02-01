const chalk = require('chalk');

const welcomeskw = chalk.hex('#9370DB')(` 
   ███████╗██╗  ██╗██╗    ██╗
   ██╔════╝██║ ██╔╝██║    ██║
   ███████╗█████╔╝ ██║ █╗ ██║
   ╚════██║██╔═██╗ ██║███╗██║
   ███████║██║  ██╗╚███╔███╔╝
   ╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝ 
`);

function displayskw() {
  console.log(welcomeskw);
  console.log(chalk.hex('#FF00FF')(" ╔══════════════════════════════════════════════════════════════╗"));
  console.log(chalk.hex('#FF00FF')(" ║ ≣  Fitur Autobot by SKW AIRDROP HUNTER                       ║"));
  console.log(chalk.hex('#FF00FF')(" ║══════════════════════════════════════════════════════════════║"));
  console.log(chalk.hex('#8A2BE2')(" ║ ➤ 1️⃣  Auto Claim Daily Karma                                ║"));
  console.log(chalk.hex('#8A2BE2')(" ║ ➤ 2️⃣  Multi Akun                                            ║"));
  console.log(chalk.hex('#8A2BE2')(" ║ ➤ 3️⃣  Jangan Jual Bot ini                                   ║"));
  console.log(chalk.hex('#8A2BE2')(" ║ ➤ 4️⃣  Jangan Dijual                                         ║"));
  console.log(chalk.hex('#8A2BE2')(" ╚══════════════════════════════════════════════════════════════╝"));
  console.log(chalk.hex('#9370DB')("   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"));
}

module.exports = { displayskw };
