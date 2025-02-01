const ora = require("ora");
const Table = require('cli-table3'); 
const randomUserAgent = require('random-user-agent');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const spinner = ora({
  color: "greenBright",
});

async function spinnerCD(seconds) {
    const spinner = ora().start();

    return new Promise((resolve) => {
        let countdown = seconds;
        const countdownInterval = setInterval(() => {
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                spinner.succeed();
                resolve();
            } else {
                spinner.text = `${countdown} detik...`;
                countdown--;
            }
        }, 1000);
    });
}

const table = new Table({
  head: ['Akun', 'Karma', 'Check-In', 'Karma New'],
  colWidths: [30, 20, 20, 20],
  style: { head: ['green'], border: ['yellow'] }
});

function updateTable() {
    process.stdout.write("\x1b[H\x1b[J");
    console.log(table.toString());
}

function getUserAgent() {
    return randomUserAgent() || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36';
}

async function retry(fn, maxRetries, delay, ...args) {
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            return await fn(...args);
        } catch (e) {
            console.warn(`Percobaan ${attempts + 1} gagal: ${e.message}`);
            if (attempts === maxRetries - 1) {
                throw new Error('Mencapai jumlah retry maksimum');
            }
            attempts++;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

module.exports = {
  delay,
  spinner,
  spinnerCD,
  table,
  updateTable,
  getUserAgent,
  retry,
};
