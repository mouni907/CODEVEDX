import nodemailer from 'nodemailer';
const mailConfigured = !!(process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS);
export const sendEmail = async (options) => {
    if (mailConfigured) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            const mailOptions = {
                from: `"${process.env.SMTP_FROM_NAME || 'JobHub'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@jobhub.com'}>`,
                to: options.email,
                subject: options.subject,
                text: options.message,
                html: options.html || `<p>${options.message}</p>`,
            };
            await transporter.sendMail(mailOptions);
            return true;
        }
        catch (err) {
            console.error('Nodemailer error sending email:', err);
            return false;
        }
    }
    else {
        // Elegant fallback logger for container preview
        console.log('\x1b[36m%s\x1b[0m', '📧  ================= SMTP EMAIL SIMULATION =================');
        console.log(`To:      ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        console.log('\x1b[36m%s\x1b[0m', '==========================================================');
        return true;
    }
};
