import mongoose, { Schema } from 'mongoose'

const LeadSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  propertyInterest: { type: String, required: true },
  budget: { type: Number, required: true }, // in Millions PKR
  status: { type: String, enum: ['New', 'Contacted', 'In Progress', 'Closed', 'Lost'], default: 'New' },
  notes: { type: String },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  score: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Low' },
  source: { type: String, enum: ['Facebook Ads', 'Walk-in', 'Website', 'Referral'], default: 'Website' },
  followUpDate: { type: Date },
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true })

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema)
