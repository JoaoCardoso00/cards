
"use client"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@workspace/ui/components/navigation-menu"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@workspace/ui/components/sheet"
import { Button } from "@workspace/ui/components/button"
import { Menu } from "lucide-react"
import Link from "next/link"

const links = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/sync", label: "Sync" },

]

export function Navbar() {
  return (
    <nav className="w-full rounded-2xl px-6 py-4.5 flex items-center justify-between max-w-6xl mx-auto">
      <div className="flex gap-6 items-center ">
        <Link href="/">
          <h1 className="font-serif text-3xl text-neutral-200 mt-1.5">
            Cards
          </h1>
        </Link>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {
              links.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink href={link.href} className="text-md text-neutral-200">
                    {link.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))
            }
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <Button asChild variant="outline">
          <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" fill="currentColor" />
            </svg>
            <span>GitHub</span>
          </Link>
        </Button>

        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </div>

      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="p-4">
          <SheetTitle>Menu</SheetTitle>
          <div className="flex flex-col gap-4 mt-8">
            {
              links.map((link) => (
                <Link key={link.href} href={link.href} className="text-base font-medium hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))
            }
            <div className="flex flex-col gap-2 mt-4">
              <Button asChild variant="outline" className="flex-1">
                <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" fill="currentColor" />
                  </svg>
                  <span>GitHub</span>
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
