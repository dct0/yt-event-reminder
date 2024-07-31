import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { Innertube, UniversalCache } from 'youtubei.js/cf-worker';
import DummyPage from './pages/dummy';
import HomePage from './pages/home';
import { google } from 'worker-auth-providers';
import querystring from 'query-string';

const STATE_KEY = 'lmfao';

const app = new Hono<{ Bindings: Env }>();
const cache = new UniversalCache(true);

app.get(
  '/*',
  jsxRenderer(({ children }) => {
    return (
      <html>
        <head>
          <meta name="google-site-verification" content="TZ2omaIhAWWHxBWyZmKV90vD8vKrM0KoQQ2sht1mB1A" />
        </head>
        <body>{children}</body>
      </html>
    );
  }),
);

app.get('/', async (c) => {
  return c.render(<HomePage />);
});

app.get('/auth/callback', async (c) => {
  const yt = await Innertube.create({ cache });

  yt.session.on('update-credentials', async (_credentials) => {
    console.info('Credentials updated.');
    await yt.session.oauth.cacheCredentials();
  });

  if (await cache.get('youtubei_oauth_credentials')) {
    await yt.session.signIn();
  }

  if (yt.session.logged_in) {
    return c.redirect('/?status=logged_in_already');
  }

  const code = c.req.query('code');
  const state = c.req.query('state');

  if (!code) {
    console.error('No code in request');
    return c.render(<DummyPage />);
  }

  if (state !== STATE_KEY) {
    console.error('State mismatch');
    return c.render(<DummyPage />);
  }

  const tokens = await google.getTokensFromCode(code, {
    clientId: c.env.CLIENT_ID,
    clientSecret: c.env.CLIENT_SECRET,
  });

  await yt.session.signIn({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    client: {
      client_id: c.env.CLIENT_ID,
      client_secret: c.env.CLIENT_SECRET,
    },
  });

  await yt.session.oauth.cacheCredentials();

  console.log('Logged in successfully. Redirecting to home page...');

  return c.redirect('/');
});

app.get('/auth/redirect', async (c) => {
  const params = querystring.stringify({
    client_id: c.env.CLIENT_ID,
    redirect_uri: c.env.REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    prompt: 'select_account',
    include_granted_scopes: 'true',
    state: STATE_KEY,
  });

  const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  return c.redirect(loginUrl);
});

export default {
  fetch: app.fetch,
  // The scheduled handler is invoked at the interval set in our wrangler.toml's
  // [[triggers]] configuration.
  async scheduled(event, env, ctx): Promise<void> {
    // const yt = await Innertube.create({
    //   enable_session_cache: true,
    //   cache: new UniversalCache(true),
    // });
    // const feed = await yt.getSubscriptionsFeed();
    console.log('Hello world');
  },
} satisfies ExportedHandler<Env>;
