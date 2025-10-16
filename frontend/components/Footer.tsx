"use client"

import { Separator } from "../components/ui/separator"
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-16 bg-muted/30 dark:bg-muted/10">
      <div className="container mx-auto px-4 py-10">
        {/* Top Section */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h2 className="text-lg font-semibold mb-3">EduLearn</h2>
            <p className="text-sm text-muted-foreground">
              Empowering students through digital learning. Explore quality educational content for
              Natural, Social, and Common courses.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-primary transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="hover:text-primary transition-colors">
                  Subscription
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Follow Us</h2>
            <div className="flex gap-4">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
              >
                <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
              >
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
              >
                <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
              >
                <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {currentYear} EduLearn. All rights reserved.</p>
          <div className="flex gap-4 mt-3 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
