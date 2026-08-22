import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * The subset of a Firebase service account JSON that `cert()` needs.
 */
type ServiceAccountKey = {
	project_id: string;
	client_email: string;
	private_key: string;
};

/**
 * Reads the service account out of the environment.
 *
 * This used to `import('@/service_key.json')`. That file is gitignored (it
 * holds a private key), so it does not exist in a CI checkout and the build
 * failed on Vercel with MODULE_NOT_FOUND. A bundled import has to resolve at
 * build time, which left only two bad options: commit the secret, or break the
 * build. Reading it at runtime avoids both.
 *
 * The value is base64-encoded so the PEM newlines in `private_key` survive
 * being passed through env var storage without escaping games.
 */
const loadServiceAccountKey = (): ServiceAccountKey => {
	const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

	if (!encoded) {
		throw new Error(
			'Missing FIREBASE_SERVICE_ACCOUNT_KEY. Set it to the base64-encoded contents of your Firebase service account JSON.',
		);
	}

	let parsed: unknown;

	try {
		parsed = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
	} catch (cause) {
		throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not valid base64-encoded JSON.', { cause });
	}

	const key = parsed as Partial<ServiceAccountKey>;

	if (!key.project_id || !key.client_email || !key.private_key) {
		throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is missing project_id, client_email or private_key.');
	}

	return key as ServiceAccountKey;
};

let app: App;

if (getApps().length === 0) {
	const serviceKey = loadServiceAccountKey();

	app = initializeApp({
		credential: cert({
			projectId: serviceKey.project_id,
			clientEmail: serviceKey.client_email,
			privateKey: serviceKey.private_key,
		}),
	});
} else {
	app = getApp();
}

const adminDb = getFirestore(app);

export { app as adminApp, adminDb };
