import { dbService } from '../services/dbService';
import { uploadToCloudinary } from '../utils/upload';
import { sendEmail } from '../utils/mail';
export const applyForJob = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'candidate') {
            res.status(403).json({ success: false, message: 'Only candidates can apply for jobs' });
            return;
        }
        const { jobId } = req.body;
        if (!jobId) {
            res.status(400).json({ success: false, message: 'Please provide a jobId' });
            return;
        }
        // Verify job exists
        const job = await dbService.findJobById(jobId);
        if (!job) {
            res.status(404).json({ success: false, message: 'Job posting not found' });
            return;
        }
        // Fetch candidate
        const candidate = await dbService.findUserById(req.user.id);
        if (!candidate) {
            res.status(404).json({ success: false, message: 'Candidate user not found' });
            return;
        }
        // Determine resume URL
        let resumeUrl = candidate.resume || '';
        if (req.file) {
            resumeUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype, 'resumes');
            // Update candidate profile with new default resume
            await dbService.updateUser(req.user.id, { resume: resumeUrl });
        }
        if (!resumeUrl) {
            res.status(400).json({
                success: false,
                message: 'Please upload a resume file or update your profile with a default resume to apply.',
            });
            return;
        }
        // Create Application
        const application = await dbService.createApplication({
            candidate: req.user.id,
            job: jobId,
            resume: resumeUrl,
        });
        // Notify Candidate via Nodemailer
        await sendEmail({
            email: candidate.email,
            subject: `Application Submitted: ${job.title} at ${job.company}`,
            message: `Hi ${candidate.name},\n\nYour application for "${job.title}" at "${job.company}" has been successfully submitted via JobHub!\n\nThe employer will review your profile and contact you directly.\n\nBest of luck,\nThe JobHub Team`,
            html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">JobHub Application Received</h2>
          <p>Hi <strong>${candidate.name}</strong>,</p>
          <p>Your application for the position of <strong>${job.title}</strong> at <strong>${job.company}</strong> has been successfully submitted!</p>
          <p>The employer will review your resume and experience, and we will notify you instantly of any status changes.</p>
          <br />
          <p style="font-size: 12px; color: #666;">This is an automated message from JobHub. Please do not reply directly.</p>
        </div>
      `,
        });
        // Also send an email to the employer if possible
        const employer = await dbService.findUserById(job.createdBy);
        if (employer) {
            await sendEmail({
                email: employer.email,
                subject: `New Applicant for ${job.title}: ${candidate.name}`,
                message: `Hi ${employer.name},\n\nYou have received a new application for "${job.title}" from ${candidate.name}.\n\nLog in to your Employer Dashboard on JobHub to review their resume and update their status.\n\nBest,\nJobHub Admin`,
                html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4F46E5;">New Application Alert</h2>
            <p>Hi <strong>${employer.name}</strong>,</p>
            <p>You have a new application for your posting: <strong>${job.title}</strong>.</p>
            <p><strong>Candidate:</strong> ${candidate.name} (${candidate.email})</p>
            <p>Please log in to your **JobHub Employer Dashboard** to view their complete profile, download their resume, and make a decision.</p>
            <br />
            <p style="font-size: 12px; color: #666;">JobHub Notifications</p>
          </div>
        `,
            });
        }
        res.status(201).json({
            success: true,
            message: 'Successfully applied for this job!',
            application,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error applying for job' });
    }
};
export const getMyApplications = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'candidate') {
            res.status(403).json({ success: false, message: 'Only candidates can view their applications' });
            return;
        }
        const applications = await dbService.findApplications({ candidate: req.user.id });
        res.status(200).json({ success: true, count: applications.length, applications });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error fetching applications' });
    }
};
export const getApplicantsForJob = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'employer') {
            res.status(403).json({ success: false, message: 'Only employers can view job applicants' });
            return;
        }
        const { jobId } = req.params;
        const job = await dbService.findJobById(jobId);
        if (!job) {
            res.status(404).json({ success: false, message: 'Job posting not found' });
            return;
        }
        // Verify ownership of the job listing
        if (job.createdBy !== req.user.id) {
            res.status(403).json({ success: false, message: 'You are not authorized to view applicants for this job' });
            return;
        }
        const applications = await dbService.findApplications({ job: jobId });
        res.status(200).json({ success: true, count: applications.length, applications });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error fetching job applicants' });
    }
};
export const updateApplicationStatus = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'employer') {
            res.status(403).json({ success: false, message: 'Only employers can update application statuses' });
            return;
        }
        const { id } = req.params;
        const { status } = req.body; // 'accepted' or 'rejected'
        if (!status || (status !== 'accepted' && status !== 'rejected')) {
            res.status(400).json({ success: false, message: "Status must be either 'accepted' or 'rejected'" });
            return;
        }
        // Fetch application details first
        const application = await dbService.findApplicationById(id);
        if (!application) {
            res.status(404).json({ success: false, message: 'Application not found' });
            return;
        }
        const job = typeof application.job === 'object' ? application.job : await dbService.findJobById(application.job);
        const candidate = typeof application.candidate === 'object' ? application.candidate : await dbService.findUserById(application.candidate);
        if (!job) {
            res.status(404).json({ success: false, message: 'Associated job not found' });
            return;
        }
        // Verify the employer owns the job
        const jobCreatedBy = job.createdBy;
        if (jobCreatedBy !== req.user.id) {
            res.status(403).json({ success: false, message: 'You are not authorized to update this application' });
            return;
        }
        const updatedApp = await dbService.updateApplication(id, { status });
        // Send Status Change Notification via Email
        if (candidate) {
            const subject = `Job Application Status Updated: ${job.title} at ${job.company}`;
            const statusColor = status === 'accepted' ? '#10B981' : '#EF4444';
            const statusText = status === 'accepted' ? 'Accepted' : 'Rejected';
            const emailMessage = `Hi ${candidate.name},\n\nThe status of your application for "${job.title}" at "${job.company}" has been updated to: ${statusText}.\n\nPlease log in to your Candidate Dashboard to review details.\n\nBest regards,\nThe JobHub Team`;
            const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">JobHub Application Update</h2>
          <p>Hi <strong>${candidate.name}</strong>,</p>
          <p>The status of your application for <strong>${job.title}</strong> at <strong>${job.company}</strong> has been updated:</p>
          <div style="margin: 20px 0; padding: 15px; border-left: 5px solid ${statusColor}; background-color: #F9FAFB; font-size: 18px; font-weight: bold; color: ${statusColor};">
            Status: ${statusText.toUpperCase()}
          </div>
          ${status === 'accepted'
                ? '<p>Congratulations! The employer would like to move forward with your application. They will be in touch with you shortly to schedule an interview or discuss the next steps.</p>'
                : '<p>Thank you for your interest and the time you invested in applying. Unfortunately, the employer has decided not to move forward with your application at this time. We encourage you to keep applying to other listings on JobHub!</p>'}
          <br />
          <p style="font-size: 12px; color: #666;">This is an automated notification from JobHub.</p>
        </div>
      `;
            await sendEmail({
                email: candidate.email,
                subject,
                message: emailMessage,
                html: emailHtml,
            });
        }
        res.status(200).json({
            success: true,
            message: `Application status updated to '${status}'`,
            application: updatedApp,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Server error updating application status' });
    }
};
