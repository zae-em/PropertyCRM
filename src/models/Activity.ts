import mongoose, { Schema } from 'mongoose'

const ActivitySchema = new Schema({
  lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  action: { type: String, required: true }, // 'created', 'assigned', 'status_updated', 'notes_updated', 'reassigned'
  description: { type: String, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  performedByName: { type: String }
}, { timestamps: true })

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema)
