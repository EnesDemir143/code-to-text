import { NextRequest, NextResponse } from 'next/server';

/**
 * GitHub OAuth Callback Route
 * Exchanges code for access token and redirects to homepage with token
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Handle OAuth errors
    if (error) {
        return NextResponse.redirect(`${baseUrl}?auth_error=${error}`);
    }

    if (!code) {
        return NextResponse.redirect(`${baseUrl}?auth_error=no_code`);
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return NextResponse.redirect(`${baseUrl}?auth_error=${tokenData.error}`);
        }

        const accessToken = tokenData.access_token;

        // Fetch user info
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        const userData = await userResponse.json();

        // Create response with redirect
        const response = NextResponse.redirect(baseUrl);

        // Set token and user info in cookies (will be read by client and stored in localStorage)
        response.cookies.set('github_token', accessToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        response.cookies.set('github_user', JSON.stringify({
            id: userData.id,
            login: userData.login,
            avatar_url: userData.avatar_url,
            name: userData.name,
        }), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return response;
    } catch (err) {
        console.error('OAuth callback error:', err);
        return NextResponse.redirect(`${baseUrl}?auth_error=exchange_failed`);
    }
}
