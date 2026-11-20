import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

const FALLBACK_PROJECT_ID = 'astroparihar-85e2d';
const FALLBACK_CLIENT_EMAIL = 'firebase-adminsdk-fbsvc@astroparihar-85e2d.iam.gserviceaccount.com';
const FALLBACK_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD5aN2UwBrkrwjX
cdq5F9XKe32xva1NI/O2cYVNG/NmF9ZUFULp6XK3AK+7UbfXOcCeJ4aJJrZnduXx
DJ4Lij/Lr7o4EXMeHPDNpgsGDKgNdrr0xb5xICqPH3Mrf3ZMBT0gG64VjuP67jcA
cxkIsvluwUnk1+OE8lvN1dztGO0jHJywV4AXKuuz0kaUMDamxGUBXeRLDvFe1wPD
ra4OPfNa8uTAhdW5HSLGG0ZJHZC5HdeNKP6vAjyhIxDHDnQpGhstWWAPtqJzytiO
WHgvpO+/dTIQPcl7xmvIZy0jOdxMMaZLXjW347vqPXcLP1BmH2ZGf9kwLYVHhNCT
1rHNAmNfAgMBAAECggEALqa9T54RSbYtxrK+sUFylWG89JqgiF3Rr84TG4W/ZNjP
l8G0VvF6Kh3gQP77jq/4RfzprszFcJvuTcTI6SquXSidAfDNohPSvPyyciq64m3T
cYZtZVaZb1T4I2o/k9+k+9UBnnmwThbxxc1BoP1tJ5jS/BGftpXosxsuLFEtxhOs
+UCLaMnfXsJGV0ZJ91XvHbesjYuHrfBIqtzT1NbhhUWHlYCmYgLupafUz7upuYHl
hzAQUuX+aHfqYv61mvs31m5Xo+NMK2eEtEUrNa1rMmI2Hj4Uzt33U0L6nsfPGME3
RH4ORlrGqwBOMq5L0NHD4OHRe+d18Nrlb9pI3V5kVQKBgQD+ooh0OVRBq0d+iQJx
1BFJKBthqp4a8kFFI4Rc3ZxjZzPJvkO0FIPkzlXsy6qWSMtMv6ZY34NxCYOcVVMS
f+ZXJkSRyl1L2Et8Mc3xh0vXm/akeXwwsMc7/8zHOdusYU2lgXy6TgxIS0o0HjYV
0+Zt8H1IudrdE7b06JTXoMkkcwKBgQD6vylHy49CovY+4/T4oeBNNspyD8Ikh2vE
Qtf+LLixlO88BmC/vOZ/RMTJUdWkoq4tmRyfC4oA2I2iQ7Pp3pArHaRgy4F0Sf7v
hXGs00rNW+xjv/SFJzO5ttMuxhjjUM5OADkn3vnV9z8AaZB1s0eFjq8DKPYSy6Fe
xStDIT52ZQKBgBsfqxNeS/hWy13SMF15roGxcQE9UGwkZAl+WAogXRlFlAGob8PN
76K+y+5WX4x0optBSvHqlTDER62udRPiZeHgpKs2+CstFhVbpMlWlSCZb3NjsXPq
UL62Z9TM9/Zrwv6fRW7/A1XsFzJoCXDXypLpbB8EFSk5gWKjJ7+0U9i7AoGBAMui
CT1EJEECpSZn7F8q30T1tS0yfQE7dRp7CnxiB1A4Wp0NtO6h0zMSPxobunwsnXVs
feDv9xA+za80elz4oW5ScVcmjihJm58baTjokzv5Zh2QG10ze/9baV/4AuhAjHqu
Fby6iXzpgSGtmWLsyK2/NYREdKrI8nFLgJnQ2rA9AoGBAOiFWluA6Viwqwf36m/p
r9XbIwCWjAzo9tv4qWNY2Bw7vmo+wX2I3ckzkLUo9oiukZ6+qzk3q2AWxqdty55j
ed2JuCoD6RcDlpDlb5oeCBBTNoVxEEsDj45gk+otWlgYOvtTXKQ6SadjVc/vlh4L
6ODchjN5S1hye2DwD2RgCBA9
-----END PRIVATE KEY-----`;

function initFirebaseAdmin() {
  if (getApps().length > 0) return true;

  try {
    let privateKey = '';
    if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
      privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('ascii');
    } else if (process.env.FIREBASE_PRIVATE_KEY && !process.env.FIREBASE_PRIVATE_KEY.includes('demo')) {
      privateKey = process.env.FIREBASE_PRIVATE_KEY;
    } else {
      privateKey = FALLBACK_PRIVATE_KEY;
    }

    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      try {
        privateKey = JSON.parse(privateKey);
      } catch (_err) {
        // Ignore JSON parse error and use raw key
      }
    }
    privateKey = privateKey.replace(/\\n/g, '\n').replace(/^["']|["']$/g, '');

    if (!privateKey.includes('BEGIN PRIVATE KEY') && privateKey.length > 100) {
      const rawKey = privateKey.replace(/\s+/g, '');
      const formattedKey = rawKey.match(/.{1,64}/g)?.join('\n') || rawKey;
      privateKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----\n`;
    }

    const cleanProjectId = (process.env.FIREBASE_PROJECT_ID || FALLBACK_PROJECT_ID).trim().replace(/^["']|["']$/g, '');
    const cleanClientEmail = (process.env.FIREBASE_CLIENT_EMAIL || FALLBACK_CLIENT_EMAIL).trim().replace(/^["']|["']$/g, '');

    initializeApp({
      projectId: cleanProjectId,
      credential: cert({
        projectId: cleanProjectId,
        clientEmail: cleanClientEmail,
        privateKey: privateKey,
      }),
    });
    return true;
  } catch (error) {
    console.error('[Firebase Admin] initialization error:', error);
    return false;
  }
}

// Lazy initialization proxies
export const adminAuth = new Proxy({} as any, {
  get: (target, prop) => {
    initFirebaseAdmin();
    const inst = getAuth();
    const val = (inst as any)[prop];
    return typeof val === 'function' ? val.bind(inst) : val;
  },
});

export const adminDb = new Proxy({} as any, {
  get: (target, prop) => {
    initFirebaseAdmin();
    const inst = getFirestore();
    const val = (inst as any)[prop];
    return typeof val === 'function' ? val.bind(inst) : val;
  },
});

export const adminMessaging = new Proxy({} as any, {
  get: (target, prop) => {
    initFirebaseAdmin();
    const inst = getMessaging();
    const val = (inst as any)[prop];
    return typeof val === 'function' ? val.bind(inst) : val;
  },
});
