import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';
import * as base64 from 'https://deno.land/std@0.196.0/encoding/base64.ts';

const alg = 'RS256';
const kid = 'p1';

const { publicKey, privateKey } = await jose.generateKeyPair(alg, {
  extractable: true,
});

const privateJwk = {
  ...(await jose.exportJWK(privateKey)),
  alg,
  kid,
};
const publicJwk = {
  ...(await jose.exportJWK(publicKey)),
  alg,
  kid,
};

const privateBase64 = base64.encode(JSON.stringify(privateJwk));
const publicBase64 = base64.encode(JSON.stringify(publicJwk));

console.log(`Update secrets on Supabase by running the following:

supabase secrets set POWERSYNC_PRIVATE_KEY=${privateBase64}

supabase secrets set POWERSYNC_PUBLIC_KEY=${publicBase64}

# Get the PowerSync instance URL from the PowerSync dashboard
supabase secrets set POWERSYNC_URL=...
`);
