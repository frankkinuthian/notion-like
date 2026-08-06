import { tryCatch } from '@/lib/helpers/tryCatch';
import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const { data: serviceKey, error } = await tryCatch(import('@/service_key.json'));

if (error) {
	throw new Error(`Failed to load service_key.json: ${error.message}`);
}

let app: App;

if (getApps().length === 0) {
	app = initializeApp({
		credential: cert({
			projectId: serviceKey.default.project_id,
			clientEmail: serviceKey.default.client_email,
			privateKey: serviceKey.default.private_key,
		}),
	});
} else {
	app = getApp();
}

const adminDb = getFirestore(app);
export { app as adminApp, adminDb };
