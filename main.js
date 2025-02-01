const axios = require('axios');
const fs = require('fs');
const chalk = require('chalk');
const cron = require('node-cron');
const userAgents = require('./skw/userAgents');
const { displayskw } = require('./skw/diskw');

const GRAPHQL_URL = 'https://prod.haha.me/wallet-api/graphql';
const LOGIN_URL = 'https://prod.haha.me/users/login';
const TIMEOUT = 30000;
const RETRIES = 3;
const RETRY_DELAY = 2000;
const ACCOUNTS_FILE = 'data.json';

const {
  delay,
  spinner,
  spinnerCD,
  table,
  updateTable,
  retry,
} = require('./skw/jav.js');

function maskEmail(email) {
    try {
        const [local, domain] = email.split('@');
        return `${local.slice(0, 5)}***`;
    } catch (e) {
        return email;
    }
}

async function loginAndRequest(email, password, index) {
    const HEADERS = {
        'Content-Type': 'application/json',
        'User-Agent': userAgents[index],
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

async function graphqlRequest(token, query, index, variables = {}) {
    const client = axios.create({
        baseURL: GRAPHQL_URL,
        timeout: TIMEOUT,
        headers: {
            Authorization: token,
            'User-Agent': userAgents[index],
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

async function startBot() {
    console.clear();
    displayskw();
  
    await delay(2000);
  
    const accounts = loadAccounts(ACCOUNTS_FILE);
    if (accounts.length === 0) {
        return;
    }

    spinner.start();

    for (let index = 0; index < accounts.length; index++) {
        const { Email, Password } = accounts[index];
        if (Email && Password) {
            try {
                const token = await loginAndRequest(Email, Password, index);
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
                    const data = await graphqlRequest(token, query, index);
                    if (data.getRankInfo) {
                        row.push(data.getRankInfo.karma || 'N/A');
                    } else {
                        row.push('Gagal');
                    }

                    const checkinQuery = `query {
                        getDailyCheckIn
                    }`;
                    const checkinData = await graphqlRequest(token, checkinQuery, index);
                    if (checkinData.getDailyCheckIn !== undefined) {
                        row.push(checkinData.getDailyCheckIn ? 'Dapat Klaim' : 'Sudah Klaim');
                    } else {
                        row.push('Gagal');
                    }

                    const balanceQuery = `{ getKarmaPoints }`;
                    const balanceData = await graphqlRequest(token, balanceQuery, index);
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

    spinner.succeed(chalk.hex('#00FF7F')(' Proses selesai untuk hari ini'));
    console.log(chalk.hex('#9ACD32')('   Autobot Haha Wallet by SKW AIRDROP'));
}

async function main() {
    cron.schedule('0 1 * * *', async () => { 
        await startBot();
        console.log();
        console.log(chalk.hex('#FF00FF')(`Cron AKTIF`));
        console.log(chalk.hex('#FF1493')('Jam 08:00 WIB Autobot Akan Run'));
    });

    await startBot();
    console.log();
    console.log(chalk.hex('#FF00FF')(`Cron AKTIF`));
    console.log(chalk.hex('#FF1493')('Jam 08:00 WIB Autobot Akan Run'));
}

main();
