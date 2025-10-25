"use client"

import { Separator } from "../components/ui/separator"


export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-16 bg-muted/30 dark:bg-muted/10">
      <div className="container mx-auto px-4 py-10">
        {/* Top Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* About */}
          <div>
            <h2 className="text-lg font-semibold mb-3">A++</h2>
            <p className="text-sm text-muted-foreground">
              Empowering students through digital learning. Explore quality educational content for
              Natural, Social, and Common courses.
            </p>
          </div>


          {/* Social Links */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Contact Us</h2>
            <div className="flex gap-4">
              <span className="text-sm text-muted-foreground"> Phone : 0941670553 </span>
              <span className="text-sm text-muted-foreground"> Email:  amanuelasfaw68@gmail.com</span>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {currentYear} A++. All rights reserved.</p>
         
        </div>
      </div>
    </footer>
  )
}
