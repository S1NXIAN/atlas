# OAuth2 Patterns

## Authorization Code + PKCE Flow (SPA)

```typescript
const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)))
const challenge = base64url(await crypto.subtle.digest('SHA-256', verifier))

const CLIENT_ID = process.env.OAUTH_CLIENT_ID!
const REDIRECT_URI = process.env.OAUTH_REDIRECT_URI!

const authUrl = new URL('https://provider.com/oauth/authorize')
authUrl.searchParams.set('response_type', 'code')
authUrl.searchParams.set('client_id', CLIENT_ID)
authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
authUrl.searchParams.set('code_challenge', challenge)
authUrl.searchParams.set('code_challenge_method', 'S256')
authUrl.searchParams.set('state', crypto.randomUUID())

// Exchange code for tokens
const tokenResponse = await fetch('https://provider.com/oauth/token', {
  method: 'POST',
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: verifier,
  }),
})
```

## Provider Setup

### Google
Authorized redirect URIs: https://app.example.com/auth/callback/google

### GitHub
Authorization callback URL: https://app.example.com/auth/callback/github

### Auth0
Allowed Callback URLs: https://app.example.com/auth/callback
Allowed Logout URLs: https://app.example.com

## State Parameter

```typescript
const state = crypto.randomUUID()
sessionStorage.setItem('oauth_state', state)
if (callbackState !== sessionStorage.getItem('oauth_state')) {
  throw new Error('State mismatch — possible CSRF attack')
}
```

## M2M Flow (Client Credentials)

```typescript
const CLIENT_ID = process.env.OAUTH_CLIENT_ID!
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET!

const response = await fetch('https://provider.com/oauth/token', {
  method: 'POST',
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  }),
})
```

## Provider Quirks

| Provider | Quirk | Mitigation |
|---|---|---|
| Google | Same redirect URI must match exactly | Register both with/without trailing `/` |
| GitHub | No id_token, only access token | Call /user endpoint for profile |
| Apple | Requires client_id as service ID | Register both service and bundle ID |
