import mongoose from 'mongoose';

import { PasswordManager } from '../services/passwordManager';

// todo - when done w the whole course,
// try doing this using https://mongoosejs.com/docs/typescript.html
const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
	},
	{
		// this defines how our model gets serialized
		toJSON: {
			// if defined, transform receives the doc and default serialized returnedObj.
			// We can mutate returnedObj in place to apply desired changes.
			// This kind of transformation usually happens in the view, not the model.
			// [how? if we don't want to send password,
			// any point after this might be too late, no?]
			transform(doc, returnedObj) {
				returnedObj.id = returnedObj._id;
				delete returnedObj._id;
				delete returnedObj.password;
				delete returnedObj.__v;
			},
		},
	},
);

// TS doesn't pick up types from mongoose schema,
// so we add this wrapper method to the Model to type check the attributes it gets.
// We skip specifying the return value type, as it would have been implied.
userSchema.statics.build = function (attrs: UserAttrs) {
	return new User(attrs);
};
userSchema.pre('save', async function _hashPasswordIfNew(done) {
	if (this.isModified('password')) {
		const hashedPassword = await PasswordManager.toHash(this.get('password'));
		this.set('password', hashedPassword);
	}
	// this will let the .pre middleware know that our async function is done.
	// this is old school, before async/await was a thing.
	done();
});

// An interface that describes the attributes
// that are required to create a new user
interface UserAttrs {
	email: string;
	password: string;
}

// An interface that describes the properties a UserModel instance has
interface UserModel extends mongoose.Model<UserDoc> {
	build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the props of a User document, i.e. UserModel instance
interface UserDoc extends mongoose.Document {
	email: string;
	password: string;
}

// this <Thing, OtherThing> syntax is called the generic sytax inside TS
// It allows us to customize types inside a function, a class, or an interface.
// i.e. they serve as functions for types.
// i.t.c .model method takes UserDoc and UserModel types
// and uses them to specify it's contents,
// e.g. the second param is a schema of type UserDoc
// and it returns a value of UserModel type.
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

// With this setup, we will end up doing User.build({email, password}),
// rather than new User({email, password}), like
const user = User.build({ email: 'hello', password: '123' });

export { User };
