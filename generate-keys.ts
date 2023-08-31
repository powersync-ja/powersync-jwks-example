import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';
import * as base64 from 'https://deno.land/std@0.196.0/encoding/base64.ts';
import { cryptoRandomString } from 'https://deno.land/x/crypto_random_string@1.0.0/mod.ts';

const alg = 'RS256';
const kid = `powersync-${cryptoRandomString({ length: 10, type: 'hex' })}`;

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

console.log(`Public Key:
${JSON.stringify(publicJwk, null, 2)}

---

Update secrets on Supabase by running the following:

supabase secrets set POWERSYNC_PUBLIC_KEY=${publicBase64}

supabase secrets set POWERSYNC_PRIVATE_KEY=${privateBase64}

# Get the PowerSync instance URL from the PowerSync dashboard
supabase secrets set POWERSYNC_URL=...
`);
