import mongoose, { Schema } from 'mongoose'

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'agent'], default: 'agent' },
  phone: { type: String }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
export default User as mongoose.Model<any>
