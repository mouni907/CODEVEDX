import { isMongoConnected } from '../config/db';
import { UserModel, CompanyModel, JobModel, ApplicationModel } from '../models/mongooseModels';
import { getDb, saveDb } from '../utils/mockDb';
import mongoose from 'mongoose';
// Helper to convert mongoose objects to plain JSON and stringify IDs
const cleanMongoId = (doc) => {
    if (!doc)
        return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    return obj;
};
export const dbService = {
    // =========================================================================
    // USER OPERATIONS
    // =========================================================================
    async findUserByEmail(email) {
        if (isMongoConnected()) {
            const user = await UserModel.findOne({ email });
            return cleanMongoId(user);
        }
        else {
            const db = getDb();
            const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
            return user ? { ...user } : null;
        }
    },
    async findUserById(id) {
        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            const user = await UserModel.findById(id);
            return cleanMongoId(user);
        }
        else {
            const db = getDb();
            const user = db.users.find((u) => u.id === id);
            return user ? { ...user } : null;
        }
    },
    async createUser(userData) {
        if (isMongoConnected()) {
            const user = new UserModel({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                role: userData.role,
                phone: userData.phone || '',
                resume: userData.resume || '',
                profileImage: userData.profileImage || '',
            });
            await user.save();
            return cleanMongoId(user);
        }
        else {
            const db = getDb();
            const newUser = {
                id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                name: userData.name || '',
                email: userData.email || '',
                password: userData.password || '',
                role: userData.role,
                phone: userData.phone || '',
                resume: userData.resume || '',
                profileImage: userData.profileImage || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150`,
            };
            db.users.push(newUser);
            saveDb(db);
            return { ...newUser };
        }
    },
    async updateUser(id, updateData) {
        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            const user = await UserModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
            return cleanMongoId(user);
        }
        else {
            const db = getDb();
            const index = db.users.findIndex((u) => u.id === id);
            if (index === -1)
                return null;
            db.users[index] = { ...db.users[index], ...updateData };
            saveDb(db);
            return { ...db.users[index] };
        }
    },
    // =========================================================================
    // COMPANY OPERATIONS
    // =========================================================================
    async findCompanies() {
        if (isMongoConnected()) {
            const companies = await CompanyModel.find().populate('createdBy', 'name email');
            return companies.map(cleanMongoId);
        }
        else {
            const db = getDb();
            return [...db.companies];
        }
    },
    async findCompanyById(id) {
        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            const company = await CompanyModel.findById(id);
            return cleanMongoId(company);
        }
        else {
            const db = getDb();
            const company = db.companies.find((c) => c.id === id);
            return company ? { ...company } : null;
        }
    },
    async findCompanyByCreatedBy(userId) {
        if (isMongoConnected()) {
            const company = await CompanyModel.findOne({ createdBy: userId });
            return cleanMongoId(company);
        }
        else {
            const db = getDb();
            const company = db.companies.find((c) => c.createdBy === userId);
            return company ? { ...company } : null;
        }
    },
    async createCompany(companyData) {
        if (isMongoConnected()) {
            const company = new CompanyModel({
                companyName: companyData.companyName,
                logo: companyData.logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=150',
                website: companyData.website || '',
                location: companyData.location,
                description: companyData.description,
                createdBy: new mongoose.Types.ObjectId(companyData.createdBy),
            });
            await company.save();
            return cleanMongoId(company);
        }
        else {
            const db = getDb();
            const newCompany = {
                id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                companyName: companyData.companyName || '',
                logo: companyData.logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=150',
                website: companyData.website || '',
                location: companyData.location || '',
                description: companyData.description || '',
                createdBy: companyData.createdBy || '',
            };
            db.companies.push(newCompany);
            saveDb(db);
            return { ...newCompany };
        }
    },
    async updateCompany(id, updateData) {
        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            const company = await CompanyModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
            return cleanMongoId(company);
        }
        else {
            const db = getDb();
            const index = db.companies.findIndex((c) => c.id === id);
            if (index === -1)
                return null;
            db.companies[index] = { ...db.companies[index], ...updateData };
            saveDb(db);
            return { ...db.companies[index] };
        }
    },
    // =========================================================================
    // JOB OPERATIONS
    // =========================================================================
    async findJobs(filters) {
        if (isMongoConnected()) {
            const query = {};
            if (filters.category && filters.category !== 'All') {
                query.category = filters.category;
            }
            if (filters.employmentType && filters.employmentType !== 'All') {
                query.employmentType = filters.employmentType;
            }
            if (filters.location && filters.location !== 'All') {
                query.location = { $regex: filters.location, $options: 'i' };
            }
            if (filters.search) {
                query.$or = [
                    { title: { $regex: filters.search, $options: 'i' } },
                    { company: { $regex: filters.search, $options: 'i' } },
                    { description: { $regex: filters.search, $options: 'i' } },
                ];
            }
            const jobs = await JobModel.find(query).sort({ createdAt: -1 });
            return jobs.map(cleanMongoId);
        }
        else {
            const db = getDb();
            let filteredJobs = [...db.jobs];
            if (filters.category && filters.category !== 'All') {
                filteredJobs = filteredJobs.filter((j) => j.category === filters.category);
            }
            if (filters.employmentType && filters.employmentType !== 'All') {
                filteredJobs = filteredJobs.filter((j) => j.employmentType === filters.employmentType);
            }
            if (filters.location && filters.location !== 'All') {
                filteredJobs = filteredJobs.filter((j) => j.location.toLowerCase().includes(filters.location.toLowerCase()));
            }
            if (filters.search) {
                const s = filters.search.toLowerCase();
                filteredJobs = filteredJobs.filter((j) => j.title.toLowerCase().includes(s) ||
                    j.company.toLowerCase().includes(s) ||
                    j.description.toLowerCase().includes(s));
            }
            // Sort by descending date
            return filteredJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    },
    async findJobById(id) {
        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            const job = await JobModel.findById(id);
            return cleanMongoId(job);
        }
        else {
            const db = getDb();
            const job = db.jobs.find((j) => j.id === id);
            return job ? { ...job } : null;
        }
    },
    async createJob(jobData) {
        if (isMongoConnected()) {
            const job = new JobModel({
                title: jobData.title,
                company: jobData.company,
                companyId: new mongoose.Types.ObjectId(jobData.companyId),
                location: jobData.location,
                category: jobData.category,
                experience: jobData.experience,
                salary: jobData.salary,
                employmentType: jobData.employmentType,
                description: jobData.description,
                requirements: jobData.requirements,
                createdBy: new mongoose.Types.ObjectId(jobData.createdBy),
            });
            await job.save();
            return cleanMongoId(job);
        }
        else {
            const db = getDb();
            const newJob = {
                id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                title: jobData.title || '',
                company: jobData.company || '',
                companyId: jobData.companyId || '',
                location: jobData.location || '',
                category: jobData.category || '',
                experience: jobData.experience || '',
                salary: jobData.salary || '',
                employmentType: jobData.employmentType || '',
                description: jobData.description || '',
                requirements: jobData.requirements || '',
                createdBy: jobData.createdBy || '',
                createdAt: new Date().toISOString(),
            };
            db.jobs.push(newJob);
            saveDb(db);
            return { ...newJob };
        }
    },
    async updateJob(id, updateData) {
        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            const job = await JobModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
            return cleanMongoId(job);
        }
        else {
            const db = getDb();
            const index = db.jobs.findIndex((j) => j.id === id);
            if (index === -1)
                return null;
            db.jobs[index] = { ...db.jobs[index], ...updateData };
            saveDb(db);
            return { ...db.jobs[index] };
        }
    },
    async deleteJob(id) {
        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            const result = await JobModel.findByIdAndDelete(id);
            return !!result;
        }
        else {
            const db = getDb();
            const initialLength = db.jobs.length;
            db.jobs = db.jobs.filter((j) => j.id !== id);
            // Also delete any associated applications
            db.applications = db.applications.filter((a) => a.job !== id);
            saveDb(db);
            return db.jobs.length < initialLength;
        }
    },
    // =========================================================================
    // APPLICATION OPERATIONS
    // =========================================================================
    async findApplications(query) {
        if (isMongoConnected()) {
            const mongooseQuery = {};
            if (query.candidate && mongoose.Types.ObjectId.isValid(query.candidate)) {
                mongooseQuery.candidate = query.candidate;
            }
            if (query.job && mongoose.Types.ObjectId.isValid(query.job)) {
                mongooseQuery.job = query.job;
            }
            const applications = await ApplicationModel.find(mongooseQuery)
                .populate('candidate', 'name email phone profileImage resume')
                .populate('job')
                .sort({ createdAt: -1 });
            return applications.map(cleanMongoId);
        }
        else {
            const db = getDb();
            let results = [...db.applications];
            if (query.candidate) {
                results = results.filter((a) => a.candidate === query.candidate);
            }
            if (query.job) {
                results = results.filter((a) => a.job === query.job);
            }
            // Populate manually
            const populated = results.map((app) => {
                const candidateInfo = db.users.find((u) => u.id === app.candidate);
                const jobInfo = db.jobs.find((j) => j.id === app.job);
                return {
                    ...app,
                    candidate: candidateInfo
                        ? {
                            id: candidateInfo.id,
                            name: candidateInfo.name,
                            email: candidateInfo.email,
                            phone: candidateInfo.phone,
                            profileImage: candidateInfo.profileImage,
                            resume: candidateInfo.resume,
                        }
                        : app.candidate,
                    job: jobInfo ? { ...jobInfo } : app.job,
                };
            });
            return populated.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
        }
    },
    async findApplicationById(id) {
        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            const application = await ApplicationModel.findById(id).populate('candidate').populate('job');
            return cleanMongoId(application);
        }
        else {
            const db = getDb();
            const app = db.applications.find((a) => a.id === id);
            if (!app)
                return null;
            const candidateInfo = db.users.find((u) => u.id === app.candidate);
            const jobInfo = db.jobs.find((j) => j.id === app.job);
            return {
                ...app,
                candidate: candidateInfo ? { ...candidateInfo } : app.candidate,
                job: jobInfo ? { ...jobInfo } : app.job,
            };
        }
    },
    async createApplication(appData) {
        if (isMongoConnected()) {
            const app = new ApplicationModel({
                candidate: new mongoose.Types.ObjectId(appData.candidate),
                job: new mongoose.Types.ObjectId(appData.job),
                resume: appData.resume || '',
                status: appData.status || 'pending',
            });
            await app.save();
            return cleanMongoId(app);
        }
        else {
            const db = getDb();
            // Check for duplicates
            const exists = db.applications.some((a) => a.candidate === appData.candidate && a.job === appData.job);
            if (exists) {
                throw new Error('You have already applied for this job');
            }
            const newApp = {
                id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                candidate: appData.candidate || '',
                job: appData.job || '',
                resume: appData.resume || '',
                status: 'pending',
                appliedAt: new Date().toISOString(),
            };
            db.applications.push(newApp);
            saveDb(db);
            return { ...newApp };
        }
    },
    async updateApplication(id, updateData) {
        if (isMongoConnected() && mongoose.Types.ObjectId.isValid(id)) {
            const app = await ApplicationModel.findByIdAndUpdate(id, { $set: updateData }, { new: true })
                .populate('candidate')
                .populate('job');
            return cleanMongoId(app);
        }
        else {
            const db = getDb();
            const index = db.applications.findIndex((a) => a.id === id);
            if (index === -1)
                return null;
            db.applications[index] = { ...db.applications[index], ...updateData };
            saveDb(db);
            // Return populated version
            const app = db.applications[index];
            const candidateInfo = db.users.find((u) => u.id === app.candidate);
            const jobInfo = db.jobs.find((j) => j.id === app.job);
            return {
                ...app,
                candidate: candidateInfo ? { ...candidateInfo } : app.candidate,
                job: jobInfo ? { ...jobInfo } : app.job,
            };
        }
    },
};
