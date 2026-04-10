// ============================================================
// Email Templates - HTML email templates with lavender theme
// ============================================================

import {
    DEFAULT_SENDER,
    EMAIL_COLORS,
    WELCOME_EMAIL_CONTENT,
} from '@/constants/emailConstants';

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const htmlToTextContent = (htmlContent: string): string =>
    htmlContent
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li>/gi, '• ')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();

// ============================================================
// Base Layout - Common wrapper for all emails
// ============================================================

const baseLayout = (content: string, title: string, previewText?: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${title}</title>
    ${previewText ? `<meta name="description" content="${previewText}">` : ''}
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        /* Base styles */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: ${EMAIL_COLORS.textDark};
            margin: 0;
            padding: 0;
            background-color: ${EMAIL_COLORS.subtleBg};
            width: 100% !important;
            height: 100% !important;
        }
        
        /* Container */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
        }
        
        /* Header with gradient */
        .email-header {
            background: linear-gradient(135deg, ${EMAIL_COLORS.gradientStart} 0%, ${EMAIL_COLORS.gradientMid} 50%, ${EMAIL_COLORS.gradientEnd} 100%);
            padding: 40px 30px;
            text-align: center;
        }
        
        .email-header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        
        .email-header .tagline {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            margin-top: 8px;
            font-weight: 400;
        }
        
        /* Content area */
        .email-content {
            padding: 40px 30px;
        }
        
        /* Footer */
        .email-footer {
            background-color: ${EMAIL_COLORS.lightBg};
            padding: 24px 30px;
            text-align: center;
            font-size: 13px;
            color: ${EMAIL_COLORS.textMuted};
            border-top: 1px solid ${EMAIL_COLORS.border};
        }
        
        .email-footer a {
            color: ${EMAIL_COLORS.primary};
            text-decoration: none;
        }
        
        .email-footer a:hover {
            text-decoration: underline;
        }
        
        /* Button styles */
        .btn-primary {
            display: inline-block;
            background: linear-gradient(135deg, ${EMAIL_COLORS.gradientStart} 0%, ${EMAIL_COLORS.gradientEnd} 100%);
            color: #ffffff !important;
            padding: 16px 36px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            box-shadow: 0 4px 14px -3px ${EMAIL_COLORS.primary}66;
            transition: transform 0.2s ease;
        }
        
        /* OTP box */
        .otp-box {
            background-color: ${EMAIL_COLORS.lightBg};
            border: 2px dashed ${EMAIL_COLORS.primary};
            padding: 24px;
            text-align: center;
            margin: 24px 0;
            border-radius: 12px;
        }
        
        .otp-code {
            font-size: 36px;
            font-weight: 700;
            color: ${EMAIL_COLORS.primary};
            letter-spacing: 10px;
            margin: 0;
            font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
        }
        
        /* Typography */
        .text-muted {
            color: ${EMAIL_COLORS.textMuted};
            font-size: 14px;
        }
        
        .text-subtle {
            color: ${EMAIL_COLORS.textSubtle};
            font-size: 12px;
        }
        
        p {
            margin: 0 0 16px 0;
            color: ${EMAIL_COLORS.textDark};
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 20px;
        }
        
        /* Divider */
        .divider {
            height: 1px;
            background-color: ${EMAIL_COLORS.border};
            margin: 24px 0;
        }
        
        /* Link styles */
        a {
            color: ${EMAIL_COLORS.primary};
        }
        
        /* Mobile responsive */
        @media only screen and (max-width: 620px) {
            .email-container {
                margin: 0 !important;
                border-radius: 0 !important;
            }
            .email-header, .email-content, .email-footer {
                padding-left: 20px !important;
                padding-right: 20px !important;
            }
            .otp-code {
                font-size: 28px;
                letter-spacing: 6px;
            }
        }
    </style>
</head>
<body>
    ${previewText ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${previewText}</div>` : ''}
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: ${EMAIL_COLORS.subtleBg}; padding: 40px 20px;">
        <tr>
            <td align="center">
                <div class="email-container">
                    <div class="email-header">
                        <h1>${DEFAULT_SENDER.name}</h1>
                        <div class="tagline">${DEFAULT_SENDER.website}</div>
                    </div>
                    <div class="email-content">
                        ${content}
                    </div>
                    <div class="email-footer">
                        <p style="margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} ${DEFAULT_SENDER.name}. All rights reserved.</p>
                        <p class="text-subtle" style="margin: 0;">
                            <a href="https://${DEFAULT_SENDER.website}">${DEFAULT_SENDER.website}</a>
                        </p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// ============================================================
// OTP Verification Email Template
// ============================================================

export const otpEmailTemplate = (
    recipientName: string,
    otp: string,
    expiresIn = '10 minutes'
): { html: string; text: string } => {
    const greeting = recipientName ? `Hello ${recipientName}` : 'Hello';
    
    const html = baseLayout(
        `
        <p class="greeting">${greeting},</p>
        <p>Your verification code is:</p>
        <div class="otp-box">
            <p class="otp-code">${otp}</p>
        </div>
        <p class="text-muted">This code will expire in <strong>${expiresIn}</strong>.</p>
        <div class="divider"></div>
        <p class="text-subtle">If you didn't request this code, please ignore this email or contact us if you have concerns.</p>
        `,
        'Verification Code',
        `Your verification code is ${otp}`
    );

    const text = `${greeting},

Your verification code is: ${otp}

This code will expire in ${expiresIn}.

If you didn't request this code, please ignore this email.

${DEFAULT_SENDER.name}
${DEFAULT_SENDER.website}`;

    return { html, text };
};

// ============================================================
// Password Reset Email Template
// ============================================================

export const passwordResetEmailTemplate = (
    recipientName: string,
    resetLink: string,
    expiresIn = '1 hour'
): { html: string; text: string } => {
    const greeting = recipientName ? `Hello ${recipientName}` : 'Hello';

    const html = baseLayout(
        `
        <p class="greeting">${greeting},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <p style="text-align: center;">
            <a href="${resetLink}" class="btn-primary">Reset Password</a>
        </p>
        <p class="text-muted">This link will expire in <strong>${expiresIn}</strong>.</p>
        <div class="divider"></div>
        <p class="text-subtle">If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        <p class="text-subtle" style="margin-top: 16px; word-break: break-all;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetLink}" style="font-size: 11px;">${resetLink}</a>
        </p>
        `,
        'Reset Your Password',
        'Password reset requested. Click to reset your password.'
    );

    const text = `${greeting},

We received a request to reset your password.

Click here to reset: ${resetLink}

This link will expire in ${expiresIn}.

If you didn't request this, you can safely ignore this email. Your password will remain unchanged.

${DEFAULT_SENDER.name}
${DEFAULT_SENDER.website}`;

    return { html, text };
};

// ============================================================
// Test Email Template
// ============================================================

export const testEmailTemplate = (
    subject: string,
    body: string
): { html: string; text: string } => {
    const html = baseLayout(
        `
        <p>${body.replace(/\n/g, '<br>')}</p>
        <div class="divider"></div>
        <p class="text-subtle" style="margin-top: 24px;">
            This is a test email sent from the administrator panel at ${DEFAULT_SENDER.website}.
        </p>
        `,
        subject,
        'Test email from administrator panel'
    );

    const text = `${body}

---
This is a test email sent from the administrator panel.

${DEFAULT_SENDER.name}
${DEFAULT_SENDER.website}`;

    return { html, text };
};

// ============================================================
// Newsletter Email Template
// ============================================================

export const newsletterEmailTemplate = (
    recipientName: string | null,
    subject: string,
    htmlContent: string,
    previewText?: string
): { html: string; text: string } => {
    const greeting = recipientName ? `Hello ${recipientName}` : 'Hello';

    // Strip HTML for text version
    const textContent = htmlToTextContent(htmlContent);

    const html = baseLayout(
        `
        <p class="greeting">${greeting},</p>
        <div class="newsletter-content">
            ${htmlContent}
        </div>
        <div class="divider"></div>
        <p class="text-subtle" style="text-align: center;">
            You received this email because you're subscribed to updates from ${DEFAULT_SENDER.name}.<br>
            <a href="https://${DEFAULT_SENDER.website}/unsubscribe" style="color: ${EMAIL_COLORS.textSubtle};">Unsubscribe</a>
        </p>
        `,
        subject,
        previewText || `Newsletter from ${DEFAULT_SENDER.name}`
    );

    const text = `${greeting},

${textContent}

---
You received this email because you're subscribed to updates from ${DEFAULT_SENDER.name}.
To unsubscribe, visit: https://${DEFAULT_SENDER.website}/unsubscribe

${DEFAULT_SENDER.name}
${DEFAULT_SENDER.website}`;

    return { html, text };
};

// ============================================================
// Contact Response Email Template
// ============================================================

export const contactResponseEmailTemplate = (
    recipientName: string | null,
    subject: string,
    htmlContent: string,
    originalSubject: string,
    originalMessage: string,
): { html: string; text: string } => {
    const greeting = recipientName ? `Hello ${escapeHtml(recipientName)}` : 'Hello';
    const safeOriginalSubject = escapeHtml(originalSubject);
    const safeOriginalMessage = escapeHtml(originalMessage).replace(/\n/g, '<br>');
    const textContent = htmlToTextContent(htmlContent);

    const html = baseLayout(
        `
        <p class="greeting">${greeting},</p>
        <p>Thank you for reaching out. Here is my response to your message:</p>
        <div class="newsletter-content">
            ${htmlContent}
        </div>
        <div class="divider"></div>
        <p class="text-muted" style="margin-bottom: 8px;">Original subject: <strong>${safeOriginalSubject}</strong></p>
        <div style="margin-top: 12px; border: 1px solid ${EMAIL_COLORS.border}; border-left: 4px solid ${EMAIL_COLORS.primary}; border-radius: 10px; background: ${EMAIL_COLORS.lightBg}; padding: 14px;">
            <p class="text-muted" style="margin-bottom: 8px; font-weight: 600;">Your message</p>
            <p style="margin: 0;">${safeOriginalMessage}</p>
        </div>
        <p class="text-subtle" style="margin-top: 20px;">If you have more questions, feel free to reply to this email.</p>
        `,
        subject,
        `Response from ${DEFAULT_SENDER.name}`,
    );

    const text = `${greeting},

Thank you for reaching out. Here is my response to your message:

${textContent}

---
Original subject: ${originalSubject}

Your message:
${originalMessage}

If you have more questions, feel free to reply to this email.

${DEFAULT_SENDER.name}
${DEFAULT_SENDER.website}`;

    return { html, text };
};

// ============================================================
// Welcome Email Template (for new subscribers)
// ============================================================

export const welcomeEmailTemplate = (
    recipientName: string | null
): { html: string; text: string } => {
    const greeting = recipientName ? `Hello ${recipientName}` : 'Hello';
    const updatesHtml = WELCOME_EMAIL_CONTENT.updates
        .map((item) => `<li style="margin-bottom: 8px;">${item}</li>`)
        .join('');
    const updatesText = WELCOME_EMAIL_CONTENT.updates
        .map((item) => `• ${item}`)
        .join('\n');

    const html = baseLayout(
        `
        <p class="greeting">${greeting},</p>
        <p>${WELCOME_EMAIL_CONTENT.intro}</p>
        <p>${WELCOME_EMAIL_CONTENT.updatesHeading}</p>
        <ul style="color: ${EMAIL_COLORS.textDark}; padding-left: 20px;">
            ${updatesHtml}
        </ul>
        <p style="text-align: center; margin-top: 32px;">
            <a href="https://${DEFAULT_SENDER.website}" class="btn-primary">${WELCOME_EMAIL_CONTENT.ctaLabel}</a>
        </p>
        <div class="divider"></div>
        <p class="text-subtle">
            ${WELCOME_EMAIL_CONTENT.replyHint}
        </p>
        `,
        WELCOME_EMAIL_CONTENT.subject,
        WELCOME_EMAIL_CONTENT.previewText,
    );

    const text = `${greeting},

${WELCOME_EMAIL_CONTENT.intro}

${WELCOME_EMAIL_CONTENT.updatesHeading}
${updatesText}

Visit my website: https://${DEFAULT_SENDER.website}

${WELCOME_EMAIL_CONTENT.replyHint}

${DEFAULT_SENDER.name}
${DEFAULT_SENDER.website}`;

    return { html, text };
};
