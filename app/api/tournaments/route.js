import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const gameType = searchParams.get('gameType');
    const organizerId = searchParams.get('organizerId');

    const skip = (page - 1) * limit;

    const where = {};
    if (gameType) where.gameType = gameType;
    if (organizerId) where.organizerId = organizerId;

    try {
        console.log('Fetching tournaments with params:', { page, limit, gameType, organizerId });
        const [tournaments, total] = await Promise.all([
            prisma.tournament.findMany({
                where,
                include: {
                    game: true,
                    organizer: true,
                },
                skip,
                take: limit,
            }),
            prisma.tournament.count({ where }),
        ]);

        console.log(`Found ${tournaments.length} tournaments out of ${total} total`);

        return NextResponse.json({
            tournaments,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}