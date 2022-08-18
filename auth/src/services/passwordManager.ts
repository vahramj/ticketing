import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class PasswordManager {
	static async toHash(password: string) {
		// [salt ends up being 24 chars. Somehow hex makes it from 8 to 24, how?]
		const salt = randomBytes(8).toString('hex');

		// 64 is the key length
		const hashBuf = (await scryptAsync(password, salt, 64)) as Buffer;
		// converts hash buffer to a hexodecimal string
		const hashString = hashBuf.toString('hex');

		const record = `${hashString}.${salt}`;
		return record;
	}

	static async compare(storedPassword: string, suppliedPassword: string) {
		const [hashedPassword, salt] = storedPassword.split('.');

		// [Why don't we just use PasswordManager.toHash(suppliedPassword, salt),
		// and make salt an optional param on the .toHash method? Wouldn't it be more dry?]
		const hashBuf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
		const hashString = hashBuf.toString('hex');

		return hashString === hashedPassword;
	}
}
