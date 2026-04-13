// ============================================================
// Email Templates - HTML email templates with premium lavender theme
// ============================================================

import {
    DEFAULT_SENDER,
    EMAIL_COLORS,
    WELCOME_EMAIL_CONTENT,
} from '@/constants/emailConstants';

type BaseLayoutOptions = {
    title: string;
    previewText?: string;
    headerTitle?: string;
};
const EMAIL_FONT_STACK_PRIMARY = "Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const EMAIL_FONT_STACK_SIGNATURE = "'Times New Roman', Georgia,  Times, serif";

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

const renderPreviewText = (previewText?: string): string => {
    if (!previewText) {
        return '';
    }

    return `<div style="display:none;font-size:1px;color:${EMAIL_COLORS.subtleBg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(previewText)}</div>`;
};

const renderPremiumHeader = (title: string): string => `
    <tr>
        <td style="padding:0;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;">
                <tr>
                    <td style="height:2px;line-height:2px;font-size:2px;background-color:${EMAIL_COLORS.primary};background-image:linear-gradient(145deg, ${EMAIL_COLORS.gradientStart} 0%, ${EMAIL_COLORS.gradientMid} 52%, ${EMAIL_COLORS.gradientEnd} 100%);">&nbsp;</td>
                </tr>
                <tr>
                    <td class="header-pad" style="padding:16px 24px;background-color:${EMAIL_COLORS.lightBg};">
                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;">
                            <tr>
                               <td valign="middle" align="center" style="text-align:center;">
                                    <p style="margin:2px 0 0 0;color:${EMAIL_COLORS.textDark};font-family:${EMAIL_FONT_STACK_PRIMARY};font-size:17px;line-height:1.35;font-weight:700;">${escapeHtml(title)}</p>
                                    <p style="margin:-1px 0 0 0;">
                                        <a href="http://${DEFAULT_SENDER.website}" style="color:${EMAIL_COLORS.textSubtle};font-family:${EMAIL_FONT_STACK_PRIMARY};font-size:11px;line-height:1.35;text-decoration:none;">www.${DEFAULT_SENDER.website}</a>
                                    </p>
                                </td>
                                <td width="24" valign="middle" align="right">
                                    <table role="presentation" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="right">
                                                <table role="presentation" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="width:7px;height:7px;border-radius:4px;background-color:#ffffff;border:1px solid ${EMAIL_COLORS.border};line-height:7px;font-size:7px;">&nbsp;</td>
                                                        <td style="width:5px;">&nbsp;</td>
                                                        <td style="width:12px;height:12px;border-radius:6px;background-color:${EMAIL_COLORS.primary};line-height:12px;font-size:12px;">&nbsp;</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="height:5px;line-height:5px;font-size:5px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td align="right">
                                                <table role="presentation" cellpadding="0" cellspacing="0" width="18" style="width:18px;">
                                                    <tr>
                                                        <td style="height:2px;line-height:2px;font-size:2px;background-color:${EMAIL_COLORS.primary};">&nbsp;</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
`;

const renderPremiumFooter = (): string => {
    const year = new Date().getFullYear();

    return `
    <tr>
        <td style="padding:0;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;">
                <tr>
                    <td style="height:2px;line-height:2px;font-size:2px;background-color:${EMAIL_COLORS.primary};background-image:linear-gradient(90deg, ${EMAIL_COLORS.gradientStart} 0%, ${EMAIL_COLORS.gradientMid} 50%, ${EMAIL_COLORS.gradientEnd} 100%);">&nbsp;</td>
                </tr>
                <tr>
                    <td class="footer-pad" style="padding:16px 24px;background-color:${EMAIL_COLORS.lightBg};">
                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;">
                            <tr>
                                <td align="left" style="vertical-align:middle;">
                                    <a href="https://${DEFAULT_SENDER.website}/articles" style="color:${EMAIL_COLORS.textSubtle};font-family:${EMAIL_FONT_STACK_PRIMARY};font-size:12px;line-height:1.4;text-decoration:none;">Articles</a>
                                    <span style="color:${EMAIL_COLORS.textMuted};">&nbsp;|&nbsp;</span>
                                    <a href="https://${DEFAULT_SENDER.website}/blogs" style="color:${EMAIL_COLORS.textSubtle};font-family:${EMAIL_FONT_STACK_PRIMARY};font-size:12px;line-height:1.4;text-decoration:none;">Blogs</a>
                                    <span style="color:${EMAIL_COLORS.textMuted};">&nbsp;|&nbsp;</span>
                                    <a href="https://${DEFAULT_SENDER.website}/projects" style="color:${EMAIL_COLORS.textSubtle};font-family:${EMAIL_FONT_STACK_PRIMARY};font-size:12px;line-height:1.4;text-decoration:none;">Projects</a>
                                </td>
                                <td align="right" style="vertical-align:middle;">
                                    <span style="font-family:${EMAIL_FONT_STACK_PRIMARY};font-size:12px;">
                                        <a href="https://github.com/aadityahasabnis" style="color:${EMAIL_COLORS.textSubtle};text-decoration:none;">GitHub</a>
                                        <span style="color:${EMAIL_COLORS.textMuted};">&nbsp;|&nbsp;</span>
                                        <a href="https://www.linkedin.com/in/aadityahasabnis" style="color:${EMAIL_COLORS.textSubtle};text-decoration:none;">LinkedIn</a>
                                        <span style="color:${EMAIL_COLORS.textMuted};">&nbsp;|&nbsp;</span>
                                        <a href="https://www.instagram.com/creative_northstar" style="color:${EMAIL_COLORS.textSubtle};text-decoration:none;">Instagram</a>
                                        <span style="color:${EMAIL_COLORS.textMuted};">&nbsp;|&nbsp;</span>
                                        <a href="https://x.com/aadityahasabnis" style="color:${EMAIL_COLORS.textSubtle};text-decoration:none;">X</a>
                                    </span>
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;margin-top:8px;">
                            <tr>
                                <td style="height:1px;line-height:1px;font-size:1px;background-color:${EMAIL_COLORS.border};">&nbsp;</td>
                            </tr>
                        </table>

                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;margin-top:8px;">
                            <tr>
                                <td align="left" style="color:${EMAIL_COLORS.textDark};font-family:${EMAIL_FONT_STACK_SIGNATURE};font-size:14px;line-height:1.3;">Built and written by Aaditya.</td>
                                <td align="right" style="color:${EMAIL_COLORS.textSubtle};font-family:${EMAIL_FONT_STACK_PRIMARY};font-size:12px;line-height:1.3;">© ${year} ${DEFAULT_SENDER.name}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    `;
};

// ============================================================
// Base Layout - Common wrapper for all emails
// ============================================================

const baseLayout = (content: string, options: BaseLayoutOptions): string => {
    const safeTitle = escapeHtml(options.title);
    const safePreviewText = options.previewText
        ? escapeHtml(options.previewText)
        : undefined;
    const headerTitle = options.headerTitle || options.title;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${safeTitle}</title>
    ${safePreviewText ? `<meta name="description" content="${safePreviewText}">` : ''}
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

        body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            height: 100% !important;
            background-color: ${EMAIL_COLORS.subtleBg};
            font-family: ${EMAIL_FONT_STACK_PRIMARY};
        }

        a {
            color: ${EMAIL_COLORS.primary};
            text-decoration: none;
        }

        .shell {
            width: 100%;
            max-width: 600px;
            border: 1px solid ${EMAIL_COLORS.border};
            border-radius: 18px;
            overflow: hidden;
            background-color: #ffffff;
        }

        .content-cell {
            padding: 20px 24px 22px 24px;
            background-color: #ffffff;
            text-align: left;
        }

        p {
            margin: 0 0 14px 0;
            color: ${EMAIL_COLORS.textDark};
            font-size: 15px;
            line-height: 1.68;
            text-align: left;
        }

        .greeting {
            margin: 0 0 16px 0;
            font-size: 18px;
            line-height: 1.5;
            font-weight: 600;
        }

        .small-copy {
            margin: 0;
            color: ${EMAIL_COLORS.textSubtle};
            font-size: 12px;
            line-height: 1.6;
        }

        .muted-copy {
            margin: 0;
            color: ${EMAIL_COLORS.textMuted};
            font-size: 13px;
            line-height: 1.6;
        }

        .divider {
            height: 1px;
            line-height: 1px;
            font-size: 1px;
            background-color: ${EMAIL_COLORS.border};
        }

        .card-panel {
            border: 1px solid ${EMAIL_COLORS.border};
            border-radius: 12px;
            background-color: ${EMAIL_COLORS.lightBg};
        }

        .card-cell {
            padding: 18px 20px;
        }

        .panel-title {
            margin: 0 0 8px 0;
            color: ${EMAIL_COLORS.textMuted};
            font-size: 11px;
            line-height: 1.2;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            font-weight: 700;
        }

        .cta-link {
            display: inline-block;
            padding: 12px 22px;
            border: 1px solid ${EMAIL_COLORS.primaryHover};
            border-radius: 10px;
            background-color: ${EMAIL_COLORS.primary};
            color: #ffffff !important;
            font-size: 14px;
            line-height: 1.2;
            font-weight: 600;
            text-decoration: none;
        }

        .footer-nav-link {
            color: ${EMAIL_COLORS.textSubtle} !important;
            text-decoration: none;
        }

        .footer-nav-link:hover {
            color: ${EMAIL_COLORS.primaryHover} !important;
            text-decoration: underline !important;
        }

        .otp-box {
            margin: 14px 0 0 0;
            border: 2px dashed ${EMAIL_COLORS.primary};
            border-radius: 10px;
            background-color: ${EMAIL_COLORS.lightBg};
            padding: 18px;
            text-align: center;
        }

        .otp-code {
            margin: 0;
            color: ${EMAIL_COLORS.primary};
            font-family: 'Courier New', Courier, monospace;
            font-size: 34px;
            line-height: 1.25;
            letter-spacing: 8px;
            font-weight: 700;
            text-align: center;
        }

        .response-panel {
            border: 1px solid ${EMAIL_COLORS.border};
            border-left: 5px solid ${EMAIL_COLORS.primary};
            border-radius: 12px;
            background-color: ${EMAIL_COLORS.lightBg};
        }

        .original-panel {
            border: 1px solid ${EMAIL_COLORS.borderLight};
            border-radius: 12px;
            background-color: #fcfbff;
        }

        .newsletter-content p {
            margin: 0 0 14px 0;
            color: ${EMAIL_COLORS.textDark};
            font-size: 15px;
            line-height: 1.68;
        }

        .newsletter-content ul,
        .newsletter-content ol {
            margin: 0 0 14px 20px;
            padding: 0;
        }

        .newsletter-content li {
            margin: 0 0 8px 0;
            color: ${EMAIL_COLORS.textDark};
        }

        @media only screen and (max-width: 620px) {
            .outer-pad {
                padding: 16px 8px !important;
            }

            .shell {
                border-radius: 0 !important;
            }

            .header-pad {
                padding: 12px 16px !important;
            }

            .content-cell {
                padding: 18px 16px 20px 16px !important;
            }

            .footer-pad {
                padding: 12px 16px !important;
            }

            .otp-code {
                font-size: 28px !important;
                letter-spacing: 6px !important;
            }

            .footer-nav-cell {
                font-size: 11px !important;
            }
        }
    </style>
</head>
<body>
    ${renderPreviewText(options.previewText)}
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;background-color:${EMAIL_COLORS.subtleBg};">
        <tr>
            <td class="outer-pad" align="center" style="padding:32px 12px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="shell" style="width:100%;max-width:600px;border-collapse:separate;">
                    ${renderPremiumHeader(headerTitle)}
                    <tr>
                        <td class="content-cell">
                            ${content}
                        </td>
                    </tr>
                    ${renderPremiumFooter()}
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
};

const getGreeting = (
    recipientName: string | null | undefined
): { html: string; text: string } => {
    const normalizedName = recipientName?.trim();

    if (!normalizedName) {
        return {
            html: 'Hello',
            text: 'Hello',
        };
    }

    return {
        html: `Hello ${escapeHtml(normalizedName)}`,
        text: `Hello ${normalizedName}`,
    };
};

// ============================================================
// OTP Verification Email Template
// ============================================================

export const otpEmailTemplate = (
    recipientName: string,
    otp: string,
    expiresIn = '10 minutes'
): { html: string; text: string } => {
    const greeting = getGreeting(recipientName);
    const safeOtp = escapeHtml(otp);
    const safeExpiresIn = escapeHtml(expiresIn);

    const html = baseLayout(
        `
        <p class="greeting">${greeting.html},</p>
        <p>Your verification code is:</p>

        <div class="otp-box">
            <p class="otp-code">${safeOtp}</p>
        </div>

        <p class="muted-copy" style="margin-top:10px;">This code expires in <strong>${safeExpiresIn}</strong>.</p>

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="original-panel" style="width:100%;margin-top:14px;">
            <tr>
                <td class="card-cell">
                    <p class="panel-title">Security Note</p>
                    <p class="small-copy">Never share this code with anyone. If you did not request it, you can safely ignore this email.</p>
                </td>
            </tr>
        </table>
        `,
        {
            title: 'Verification Code',
            previewText: `Your verification code is ${otp}`,
            headerTitle: 'Verification Code',
        }
    );

    const text = `${greeting.text},

Use the secure verification code below to continue your request:

${otp}

This code expires in ${expiresIn}.

Never share this code with anyone. If you did not request it, you can safely ignore this email.

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
    const greeting = getGreeting(recipientName);
    const safeResetLink = escapeHtml(resetLink);
    const safeExpiresIn = escapeHtml(expiresIn);

    const html = baseLayout(
        `
        <p class="greeting">${greeting.html},</p>
        <p>We received a request to reset your account password.</p>

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="card-panel" style="width:100%;margin:14px 0 0 0;">
            <tr>
                <td class="card-cell">
                    <p class="panel-title">Action Required</p>
                    <p>For security, use the button below to create a new password. This reset link expires in <strong>${safeExpiresIn}</strong>.</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0 0 0;">
                        <tr>
                            <td>
                                <a href="${safeResetLink}" class="cta-link">Reset Password</a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="original-panel" style="width:100%;margin-top:14px;">
            <tr>
                <td class="card-cell">
                    <p class="panel-title">Fallback Link</p>
                    <p class="small-copy" style="word-break:break-all;"><a href="${safeResetLink}" style="color:${EMAIL_COLORS.textMuted};text-decoration:underline;">${safeResetLink}</a></p>
                </td>
            </tr>
        </table>

        <p class="small-copy" style="margin-top:14px;">If you did not request this reset, no action is required and your current password remains unchanged.</p>
        `,
        {
            title: 'Reset Your Password',
            previewText:
                'Password reset requested. Use the secure link to continue.',
            headerTitle: 'Reset Password',
        }
    );

    const text = `${greeting.text},

We received a request to reset your account password.

Use this link to reset your password:
${resetLink}

This link expires in ${expiresIn}.

If you did not request this reset, no action is required and your current password remains unchanged.

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
    const safeBody = escapeHtml(body).replace(/\n/g, '<br>');

    const html = baseLayout(
        `
        <p class="greeting">Hello Aaditya,</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="card-panel" style="width:100%;margin:14px 0 0 0;">
            <tr>
                <td class="card-cell">
                    <p class="panel-title">Test Message</p>
                    <p>${safeBody}</p>
                </td>
            </tr>
        </table>
        <p class="small-copy" style="margin-top:14px;">This is a controlled test message from the administrator panel.</p>
        `,
        {
            title: subject,
            previewText: 'Test email from administrator panel',
            headerTitle: 'Test Email',
        }
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
    const greeting = getGreeting(recipientName);
    const textContent = htmlToTextContent(htmlContent);

    const html = baseLayout(
        `
        <p class="greeting">${greeting.html},</p>
        <p>Here is your latest update from my writing and building desk.</p>

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="card-panel" style="width:100%;margin:14px 0 0 0;">
            <tr>
                <td class="card-cell">
                    <div class="newsletter-content cbr-content">
                        ${htmlContent}
                    </div>
                </td>
            </tr>
        </table>

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;margin-top:14px;">
            <tr>
                <td class="divider">&nbsp;</td>
            </tr>
        </table>

        <p class="small-copy" style="margin-top:12px;font-size:11px;line-height:1.5;">
            You are receiving this because you subscribed to updates from ${escapeHtml(DEFAULT_SENDER.name)}.
            <a href="https://${DEFAULT_SENDER.website}/unsubscribe" style="color:${EMAIL_COLORS.textSubtle};text-decoration:underline;">Unsubscribe</a>
        </p>
        `,
        {
            title: subject,
            previewText: previewText || `Newsletter from ${DEFAULT_SENDER.name}`,
            headerTitle: 'Newsletter',
        }
    );

    const text = `${greeting.text},

${textContent}

---
You received this because you subscribed to updates from ${DEFAULT_SENDER.name}.
Unsubscribe: https://${DEFAULT_SENDER.website}/unsubscribe

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
    const greeting = getGreeting(recipientName);
    const safeOriginalSubject = escapeHtml(originalSubject);
    const safeOriginalMessage = escapeHtml(originalMessage).replace(/\n/g, '<br>');
    const textContent = htmlToTextContent(htmlContent);

    const html = baseLayout(
        `
        <p class="greeting">${greeting.html},</p>
        <p>Thank you for your message. I reviewed your note and shared my response below.</p>

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="response-panel" style="width:100%;margin:14px 0 0 0;">
            <tr>
                <td class="card-cell">
                    <p class="panel-title" style="color:${EMAIL_COLORS.primary};">My Response</p>
                    <div class="newsletter-content cbr-content">
                        ${htmlContent}
                    </div>
                </td>
            </tr>
        </table>

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="original-panel" style="width:100%;margin-top:14px;">
            <tr>
                <td class="card-cell">
                    <p class="panel-title">Your Original Message</p>
                    <p class="small-copy" style="margin:0 0 8px 0;">Subject: <strong>${safeOriginalSubject}</strong></p>
                    <p class="muted-copy" style="margin:0;">${safeOriginalMessage}</p>
                </td>
            </tr>
        </table>

        <p class="small-copy" style="margin-top:14px;">If you need clarification, reply to this email and I will continue from here.</p>
        `,
        {
            title: subject,
            previewText: `Response from ${DEFAULT_SENDER.name}`,
            headerTitle: 'Response from Aaditya',
        }
    );

    const text = `${greeting.text},

Thank you for your message. I reviewed your note and shared my response below:

${textContent}

---
Your original subject: ${originalSubject}

Your original message:
${originalMessage}

If you need clarification, reply to this email and I will continue from here.

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
    const firstName = recipientName?.trim().split(' ')[0] || '';
    const personalGreeting = firstName ? `Hey ${escapeHtml(firstName)}` : 'Hey there';
    
    const updatesHtml = WELCOME_EMAIL_CONTENT.updates
        .map((item) => `<li style="margin-bottom:6px;">${escapeHtml(item)}</li>`)
        .join('');
    const updatesText = WELCOME_EMAIL_CONTENT.updates
        .map((item) => `• ${item}`)
        .join('\n');

    const html = baseLayout(
        `
        <p class="greeting" style="margin:0 0 12px 0;">${personalGreeting},</p>
        
        <p style="margin:0 0 16px 0;">${escapeHtml(WELCOME_EMAIL_CONTENT.intro)}</p>

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="card-panel" style="width:100%;margin:16px 0 0 0;">
            <tr>
                <td class="card-cell">
                    <p style="margin:0 0 8px 0;">${escapeHtml(WELCOME_EMAIL_CONTENT.updatesHeading)}</p>
                    <ul style="margin:0;padding:0 0 0 20px;color:${EMAIL_COLORS.textDark};">
                        ${updatesHtml}
                    </ul>
                </td>
            </tr>
        </table>

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;margin-top:18px;">
            <tr>
                <td align="center">
                    <a href="https://${DEFAULT_SENDER.website}" class="cta-link">${escapeHtml(WELCOME_EMAIL_CONTENT.ctaLabel)}</a>
                </td>
            </tr>
        </table>

        <p class="small-copy" style="margin-top:16px;text-align:center;">${escapeHtml(WELCOME_EMAIL_CONTENT.replyHint)}</p>
        `,
        {
            title: WELCOME_EMAIL_CONTENT.subject,
            previewText: WELCOME_EMAIL_CONTENT.previewText,
            headerTitle: 'Welcome',
        }
    );

    const text = `${personalGreeting},

${WELCOME_EMAIL_CONTENT.intro}

What to expect:
${WELCOME_EMAIL_CONTENT.updatesHeading}
${updatesText}

Visit the site: https://${DEFAULT_SENDER.website}

${WELCOME_EMAIL_CONTENT.replyHint}

— Aaditya`;

    return { html, text };
};
