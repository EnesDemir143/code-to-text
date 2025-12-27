import { NextResponse } from 'next/server';

/**
 * GitHub OAuth Login Route
 * Redirects user to GitHub for authorization
 */
export async function GET() {
    const clientId = process.env.GITHUB_CLIENT_ID;

    if (!clientId) {
        return NextResponse.json(
            { error: 'GitHub OAuth not configured' },
            { status: 500 }
        );
    }

    // Build the callback URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/callback`;
    const scope = 'repo'; // Access to public and private repos

    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scope);

    return NextResponse.redirect(authUrl.toString());
}
