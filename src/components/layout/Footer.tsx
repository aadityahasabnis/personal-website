import React from "react";
import Link from "next/link";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import { SITE_CONFIG, NAV_LINKS, SOCIAL_LINKS } from "@/constants";

const iconMap: Record<string, React.ReactNode> = {
  github: <Github className="size-5" />,
  linkedin: <Linkedin className="size-5" />,
  twitter: <Twitter className="size-5" />,
  email: <Mail className="size-5" />,
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="text-xl font-bold text-foreground">
              {SITE_CONFIG.name}
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              {SITE_CONFIG.description}
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((link) => (
                <Link
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={link.platform}
                >
                  {iconMap[link.platform] ?? <Mail className="size-5" />}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Get in Touch
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href={`mailto:${SITE_CONFIG.email}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {SITE_CONFIG.email}
              </Link>
              <p className="text-sm text-muted-foreground">
                Open for freelance projects and collaboration opportunities.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © {currentYear} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
