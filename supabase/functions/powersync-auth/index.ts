import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';
import * as base64 from 'https://deno.land/std@0.196.0/encoding/base64.ts';

const powerSyncPrivateKey = JSON.parse(
  new TextDecoder().decode(
    base64.decode(Deno.env.get('POWERSYNC_PRIVATE_KEY')!)
  )
) as jose.JWK;

const powerSyncKey = (await jose.importJWK(
  powerSyncPrivateKey
)) as jose.KeyLike;

const powerSyncUrl = Deno.env.get('POWERSYNC_URL')!;
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;

serve(async (req: Request) => {
  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Now we can get the session or user object
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (user == null) {
      return new Response(JSON.stringify({}), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      });
    } else {
      const token = await new jose.SignJWT({})
        .setProtectedHeader({
          alg: powerSyncPrivateKey.alg!,
          kid: powerSyncPrivateKey.kid,
        })
        .setSubject(user.id)
        .setIssuedAt()
        .setIssuer(supabaseUrl)
        .setAudience(powerSyncUrl)
        .setExpirationTime('5m')
        .sign(powerSyncKey);
      return new Response(
        JSON.stringify({
          token: token,
          powersync_url: powerSyncUrl,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
