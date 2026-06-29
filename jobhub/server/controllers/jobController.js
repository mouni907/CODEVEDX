import { dbService } from '../services/dbService';
export const getJobs = async (req, res) => {
    try {
        const { search, location, category, employmentType } = req.query;
        const jobs = await dbService.findJobs({
            search: search,
            location: location,
            category: category,
            employmentType: employmentType,
        });
        res.status(200).json({ success: true, count: jobs.length, jobs });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error fetching jobs' });
    }
};
export const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await dbService.findJobById(id);
        if (!job) {
            res.status(404).json({ success: false, message: 'Job posting not found' });
            return;
        }
        res.status(200).json({ success: true, job });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error fetching job details' });
    }
};
export const getMyJobs = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'employer') {
            res.status(403).json({ success: false, message: 'Only employers can view their posted jobs' });
            return;
        }
        // Get all jobs and filter by createdBy
        const allJobs = await dbService.findJobs({});
        const myJobs = allJobs.filter((j) => j.createdBy === req.user.id);
        res.status(200).json({ success: true, jobs: myJobs });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error fetching your posted jobs' });
    }
};
export const createJob = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'employer') {
            res.status(403).json({ success: false, message: 'Only employers can post jobs' });
            return;
        }
        const { title, location, category, experience, salary, employmentType, description, requirements } = req.body;
        if (!title || !location || !category || !experience || !salary || !employmentType || !description || !requirements) {
            res.status(400).json({ success: false, message: 'Please provide all required fields' });
            return;
        }
        // Must have a company set up first!
        const company = await dbService.findCompanyByCreatedBy(req.user.id);
        if (!company) {
            res.status(400).json({
                success: false,
                message: 'You must set up your Company Profile first before you can post a job.',
            });
            return;
        }
        const newJob = await dbService.createJob({
            title,
            company: company.companyName,
            companyId: company.id,
            location,
            category,
            experience,
            salary,
            employmentType,
            description,
            requirements,
            createdBy: req.user.id,
        });
        res.status(201).json({
            success: true,
            message: 'Job posted successfully!',
            job: newJob,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error creating job posting' });
    }
};
export const updateJob = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'employer') {
            res.status(403).json({ success: false, message: 'Only employers can update job postings' });
            return;
        }
        const { id } = req.params;
        const job = await dbService.findJobById(id);
        if (!job) {
            res.status(404).json({ success: false, message: 'Job posting not found' });
            return;
        }
        // Verify ownership
        if (job.createdBy !== req.user.id) {
            res.status(403).json({ success: false, message: 'You are not authorized to update this job posting' });
            return;
        }
        const updatedJob = await dbService.updateJob(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Job posting updated successfully',
            job: updatedJob,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error updating job posting' });
    }
};
export const deleteJob = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'employer') {
            res.status(403).json({ success: false, message: 'Only employers can delete job postings' });
            return;
        }
        const { id } = req.params;
        const job = await dbService.findJobById(id);
        if (!job) {
            res.status(404).json({ success: false, message: 'Job posting not found' });
            return;
        }
        // Verify ownership
        if (job.createdBy !== req.user.id) {
            res.status(403).json({ success: false, message: 'You are not authorized to delete this job posting' });
            return;
        }
        await dbService.deleteJob(id);
        res.status(200).json({ success: true, message: 'Job posting deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error deleting job posting' });
    }
};
