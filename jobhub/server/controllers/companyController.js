import { dbService } from '../services/dbService';
import { uploadToCloudinary } from '../utils/upload';
export const getCompanies = async (req, res) => {
    try {
        const companies = await dbService.findCompanies();
        res.status(200).json({ success: true, companies });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error fetching companies' });
    }
};
export const getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await dbService.findCompanyById(id);
        if (!company) {
            res.status(404).json({ success: false, message: 'Company not found' });
            return;
        }
        res.status(200).json({ success: true, company });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error fetching company' });
    }
};
export const getMyCompany = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'employer') {
            res.status(403).json({ success: false, message: 'Only employers can access company dashboards' });
            return;
        }
        const company = await dbService.findCompanyByCreatedBy(req.user.id);
        if (!company) {
            res.status(200).json({ success: true, company: null });
            return;
        }
        res.status(200).json({ success: true, company });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error fetching employer company' });
    }
};
export const createOrUpdateCompany = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'employer') {
            res.status(403).json({ success: false, message: 'Only employers can create company profiles' });
            return;
        }
        const { companyName, website, location, description } = req.body;
        if (!companyName || !location || !description) {
            res.status(400).json({ success: false, message: 'Please provide companyName, location, and description' });
            return;
        }
        // Check if company already exists for this user
        let company = await dbService.findCompanyByCreatedBy(req.user.id);
        let logoUrl = company?.logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=150';
        if (req.file) {
            logoUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype, 'company_logos');
        }
        const trimmedWebsite = website ? website.trim() : '';
        const companyPayload = {
            companyName,
            website: trimmedWebsite,
            location,
            description,
            logo: logoUrl,
            createdBy: req.user.id,
        };
        if (company) {
            // Update
            company = await dbService.updateCompany(company.id, companyPayload);
            res.status(200).json({
                success: true,
                message: 'Company profile updated successfully',
                company,
            });
        }
        else {
            // Create
            company = await dbService.createCompany(companyPayload);
            res.status(201).json({
                success: true,
                message: 'Company profile created successfully',
                company,
            });
        }
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error saving company' });
    }
};
