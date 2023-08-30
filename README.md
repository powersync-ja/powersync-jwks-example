# PowerSync Custom Authentication Example

This demonstrates creating custom JWTs for PowerSync authentication.

The examples here are for hosting on Supabase, but the same approach could be adapted
for any other environment.

# Architecture

A key-pair (public and private key) is generated. The public key is served on a public [JWKS](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets) URI. The private key is then used to generate JWTs for authenticated Supabase users and/or anonymous users. The PowerSync instance then validates these JWTs against the public key from the JWKS URI.

# Usage

Deno and supabase CLI is required.

## 1. Generate a key-pair

```sh
deno run generate-keys.ts
```

Run the `supabase secrets set` commands in the output to configure the keys on Supabase.

## 2. Deploy the functions

```sh
supabase functions deploy --no-verify-jwt powersync-jwks
# Deploy one or both of these, depending on whether signed-in or anonymous users should be allowed.
supabase functions deploy powersync-auth
supabase functions deploy powersync-auth-anonymous
```

## 3. Configure PowerSync

Configure PowerSync to use the powersync-jwks auth function by setting the "JWKS URI" to
`https://<project-ref>.supabase.co/functions/v1/powersync-jwks`.

## 4. Configure POWERSYNC_URL

Once the PowerSync instance is configured, configure POWERSYNC_URL for the functions:

```sh
supabase secrets set POWERSYNC_URL=https://<instance-id>.powersync.journeyapps.com
```

## 5. Update the client application

Update the client application to use the `powersync-auth` or `powersync-auth-anonymous` function to generate the JWT.

# Rotating keys

Repeat step 1 to generate a new key and update the secrets on Supabase. PowerSync will automatically pick up the new key and verify the new tokens.

There may be some authentication failures while clients still use old JWTs. The clients should automatically retrieve new keys and retry. To completely prevent those errors, the `powersync-jwks` function could be adapted to serve both the old and the new public keys at the same time.
