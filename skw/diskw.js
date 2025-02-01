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
  console.log(chalk.hex('#FF4500')(" ╔══════════════════════════════════════════════════════════════╗"));
  console.log(chalk.hex('#FF8C00')(" ║ ≣  Fitur Autobot by SKW AIRDROP HUNTER                       ║"));
  console.log(chalk.hex('#FF4500')(" ║══════════════════════════════════════════════════════════════║"));
  console.log(chalk.hex('#FFD700')(" ║ ➤ 1️⃣  Auto Claim Daily Karma                                ║"));
  console.log(chalk.hex('#00CED1')(" ║ ➤ 2️⃣  Multi Akun                                            ║"));
  console.log(chalk.hex('#32CD32')(" ║ ➤ 3️⃣  Jangan Jual Bot ini                                   ║"));
  console.log(chalk.hex('#1E90FF')(" ║ ➤ 4️⃣  Jangan Dijual                                         ║"));
  console.log(chalk.hex('#FF4500')(" ╚══════════════════════════════════════════════════════════════╝"));
  console.log(chalk.hex('#FF6347')("   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"));
}

module.exports = { displayskw };
