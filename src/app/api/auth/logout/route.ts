import { NextResponse } from 'next/server';

/**
 * Logout Route
 * Clears GitHub auth cookies
 */
export async function GET() {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const response = NextResponse.redirect(baseUrl);

    // Clear auth cookies
    response.cookies.delete('github_token');
    response.cookies.delete('github_user');

    return response;
}

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear auth cookies
    response.cookies.delete('github_token');
    response.cookies.delete('github_user');

    return response;
}
