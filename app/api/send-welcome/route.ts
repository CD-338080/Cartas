import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { telegramId, telegramName } = await req.json();
    
    if (!telegramId) {
      return NextResponse.json({ error: 'Missing telegramId' }, { status: 400 });
    }
    
    // Get the bot token from environment variables
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'BOT_TOKEN not configured' }, { status: 500 });
    }
    
    // Create an engaging welcome message for Blackjack 21
    const welcomeMessage = `🎰 *Welcome to USDT BLACKJACK 21, ${telegramName}!* 🃏\n\n` +
      `🃏 *Beat the Dealer & Win USDT!* 💰\n\n` +
      `🎯 *How to Play:*\n` +
      `• 🎲 Get as close to 21 as possible\n` +
      `• 👑 Beat the dealer to win 1 USDT\n` +
      `• ⚡ Fast-paced, exciting gameplay\n` +
      `• 💎 Real USDT rewards on every win\n\n` +
      `🎁 *Bonus Features:*\n` +
      `• 🎰 Daily bonuses & rewards\n` +
      `• 👥 Refer friends for 25 USDT commission\n` +
      `• 💳 Instant withdrawals to TRC-20 wallet\n` +
      `• 🏆 Leaderboards & competitions\n\n` +
      `🚀 *Ready to play? Let's hit 21!* 🚀\n` +
      `*Click below to start winning USDT!* 💰`;
    
    // Send the message using Telegram Bot API
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramId,
        text: welcomeMessage,
        parse_mode: 'Markdown'
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending welcome message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 