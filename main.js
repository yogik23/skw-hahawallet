const axios = require('axios');
const Table = require('cli-table3'); 
const randomUserAgent = require('random-user-agent');
const fs = require('fs');
const ora = require("ora");

const GRAPHQL_URL = 'https://prod.haha.me/wallet-api/graphql';
const LOGIN_URL = 'https://prod.haha.me/users/login';
const TIMEOUT = 30000;
const RETRIES = 3;
const RETRY_DELAY = 2000;
const ACCOUNTS_FILE = 'accounts.json';

const spinner = ora({
  color: "cyan",
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

async function loginAndRequest(email, password) {
    const HEADERS = {
        'Content-Type': 'application/json',
        'User-Agent': getUserAgent(),
        'Origin': 'chrome-extension://andhndehpcjpmneneealacgnmealilal'
    };

    const client = axios.create({
        baseURL: GRAPHQL_URL,
        timeout: TIMEOUT,
        headers: HEADERS
    });

    const payload = { email, password };

    try {
        const response = await retry(() => client.post(LOGIN_URL, payload), RETRIES, RETRY_DELAY);
        const token = response.data.id_token;

        if (token) {
            return token;
        } else {
            console.error(`[${email}] Login berhasil tetapi tidak mendapatkan token.`);
            return null;
        }
    } catch (e) {
        console.error(`[${email}] Login gagal: ${e.message}`);
        return null;
    }
}

function maskEmail(email) {
    try {
        const [local, domain] = email.split('@');
        return `${local.slice(0, 5)}***`;
    } catch (e) {
        return email;
    }
}

function loadAccounts(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`File '${filePath}' tidak ditemukan.`);
        return [];
    }

    try {
        const accounts = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (Array.isArray(accounts)) {
            return accounts;
        }
        console.error(`Format file '${filePath}' tidak valid.`);
        return [];
    } catch (e) {
        console.error(`Gagal memuat '${filePath}': ${e.message}`);
        return [];
    }
}

async function graphqlRequest(token, query, variables = {}) {
    const client = axios.create({
        baseURL: GRAPHQL_URL,
        timeout: TIMEOUT,
        headers: {
            Authorization: token,
            'User-Agent': getUserAgent(),
        }
    });

    const payload = { query, variables };

    try {
        const response = await retry(() => client.post('', payload), RETRIES, RETRY_DELAY);
        return response.data.data || {};
    } catch (e) {
        console.error(`GraphQL request gagal: ${e.message}`);
        return {};
    }
}

function updateTable() {
    process.stdout.write("\x1b[H\x1b[J");
    console.log(table.toString());
}

async function main() {
    const accounts = loadAccounts(ACCOUNTS_FILE);
    if (accounts.length === 0) {
        console.log('Tidak ada akun untuk diproses.');
        return;
    }

    spinner.start('Memproses akun...');

    for (let index = 0; index < accounts.length; index++) {
        const { Email, Password } = accounts[index];
        if (Email && Password) {
            try {
                const token = await loginAndRequest(Email, Password);
                if (token) {
                    let row = [maskEmail(Email)];

                    const query = `{
                        getRankInfo {
                            rank
                            karma
                            karmaToNextRank
                            rankName
                            rankImage
                        }
                    }`;
                    const data = await graphqlRequest(token, query);
                    if (data.getRankInfo) {
                        row.push(data.getRankInfo.karma || 'N/A');
                    } else {
                        row.push('Gagal');
                    }

                    const checkinQuery = `query {
                        getDailyCheckIn
                    }`;
                    const checkinData = await graphqlRequest(token, checkinQuery);
                    if (checkinData.getDailyCheckIn !== undefined) {
                        row.push(checkinData.getDailyCheckIn ? 'Dapat Klaim' : 'Sudah Klaim');
                    } else {
                        row.push('Gagal');
                    }

                    const balanceQuery = `{ getKarmaPoints }`;
                    const balanceData = await graphqlRequest(token, balanceQuery);
                    if (balanceData.getKarmaPoints) {
                        row.push(balanceData.getKarmaPoints || 'N/A');
                    } else {
                        row.push('Gagal');
                    }

                    table.push(row);
                    updateTable();
                }
            } catch (e) {
                console.error(`[${maskEmail(Email)}] Error: ${e.message}`);
            }
        }
    }

    spinner.succeed('Proses selesai!');
}

main().catch(e => console.error(`Program gagal: ${e.message}`));
