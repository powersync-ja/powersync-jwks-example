# PowerSync Custom Authentication Example

This demonstrates creating custom JWTs for PowerSync authentication.

The examples here are for hosting on Supabase, but the same approach could be adapted
for any other environment.

# Architecture

A key-pair (public and private key) is generated. The public key is served on a public [JWKS](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets) URI. The private key is then used to generate JWTs for authenticated Supabase users and/or anonymous users. The PowerSync instance then validates these JWTs against the public key from the JWKS URI.

# Usage

[Deno](https://deno.com/) and [Supabase CLI](https://github.com/supabase/cli) are required.

## 0. Clone this repo
```sh
git clone https://github.com/journeyapps/powersync-jwks-example.git
cd powersync-jwks-example
```

## 1. Generate a key-pair

```sh
deno run generate-keys.ts
```

Run the first two `supabase secrets set` commands in the output to configure the keys on Supabase.

## 2. Deploy the functions

```sh
supabase functions deploy --no-verify-jwt powersync-jwks
# Deploy one or both of these, depending on whether signed-in and/or anonymous users should be allowed.
supabase functions deploy powersync-auth
supabase functions deploy powersync-auth-anonymous
```

## 3. Configure PowerSync

Configure PowerSync to use the `powersync-jwks` auth function by setting the "JWKS URI" field to
`https://<supabase-project-ref>.supabase.co/functions/v1/powersync-jwks`.

This config field can be found under "Edit Instance" -> "Credentials" : 

<img src="https://github.com/journeyapps/powersync-jwks-example/assets/277659/a37421fe-6f97-4bc7-a73f-d166a07c6b1e" width="500">

## 4. Configure POWERSYNC_URL

Once the PowerSync instance is configured, configure POWERSYNC_URL for the functions:

```sh
supabase secrets set POWERSYNC_URL=https://<powersync-instance-id>.powersync.journeyapps.com
```

The PowerSync Instance URL can be found under "Edit Instance" -> "General"

## 5. Update the client application

Update the client application to use the `powersync-auth` or `powersync-auth-anonymous` function to generate the JWT.

* Example usage of `powersync-auth`: https://github.com/powersync-ja/powersync.dart/tree/master/demos/supabase-edge-function-auth
* Example usage of `powersync-auth-anonymous`: https://github.com/powersync-ja/powersync.dart/tree/master/demos/supabase-anonymous-auth
* Note that it's possible to use a mix of both methods. This would be done with a token parameter query. In the context of the above examples, this would be done using `token_parameters.user_id != 'anonymous'`. In the future we'll ideally change this to use a separate parameter for authenticated / anonymous queries.

# Rotating keys

Repeat step 1 to generate a new key and update the secrets on Supabase. PowerSync will automatically pick up the new key and verify the new tokens.

There may be some authentication failures while clients still use old JWTs. The clients should automatically retrieve new keys and retry. To completely prevent those errors, the `powersync-jwks` function could be adapted to serve both the old and the new public keys at the same time.
