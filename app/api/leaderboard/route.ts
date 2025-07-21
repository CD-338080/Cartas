import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { validateTelegramWebAppData } from '@/utils/server-checks';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const initData = searchParams.get('initData');
    let currentUserId = null;
    if (initData) {
      const { user } = validateTelegramWebAppData(initData);
      if (user && user.id) currentUserId = user.id.toString();
    }

    // Get top 100 users by pointsBalance
    const users = await prisma.user.findMany({
      orderBy: [
        { pointsBalance: 'desc' },
        { referralPointsEarned: 'desc' },
      ],
      take: 100,
      select: {
        id: true,
        telegramId: true,
        name: true,
        pointsBalance: true,
        referralPointsEarned: true,
        referrals: true,
      },
    });

    const leaderboard = users.map((user: any, idx: number) => ({
      rank: idx + 1,
      name: user.name || `User ${user.telegramId}`,
      points: user.pointsBalance,
      referrals: user.referrals.length,
      isCurrentUser: currentUserId && user.telegramId === currentUserId,
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
