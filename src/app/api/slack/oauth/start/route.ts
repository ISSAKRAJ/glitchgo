import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const redirectUri = proto + '://' + host + '/api/slack/oauth';
  const clientId = process.env.SLACK_CLIENT_ID || '11352040316962.11349992784470';
  const slackUrl = 'https://slack.com/oauth/v2/authorize?client_id=' + clientId + '&scope=app_mentions:read,chat:write&redirect_uri=' + encodeURIComponent(redirectUri);
  return NextResponse.redirect(slackUrl);
}
