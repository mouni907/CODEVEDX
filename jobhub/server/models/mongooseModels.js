import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['candidate', 'employer'], required: true },
    phone: { type: String },
    resume: { type: String },
    profileImage: { type: String },
}, { timestamps: true });
export const UserModel = (mongoose.models.User || mongoose.model('User', UserSchema));
const CompanySchema = new Schema({
    companyName: { type: String, required: true, unique: true },
    logo: { type: String },
    website: { type: String },
    location: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
export const CompanyModel = (mongoose.models.Company || mongoose.model('Company', CompanySchema));
const JobSchema = new Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    experience: { type: String, required: true },
    salary: { type: String, required: true },
    employmentType: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
export const JobModel = (mongoose.models.Job || mongoose.model('Job', JobSchema));
const ApplicationSchema = new Schema({
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    resume: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });
export const ApplicationModel = (mongoose.models.Application || mongoose.model('Application', ApplicationSchema));
