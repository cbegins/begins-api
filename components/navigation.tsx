"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/docs", label: "Documentation" },
    { href: "/playground", label: "Playground" },
    { href: "/pricing", label: "Pricing" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <nav className="w-full px-6 py-6 md:px-12 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Begins
        </Link>
        <div className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-opacity ${
                pathname === item.href ? "text-black font-medium" : "text-gray-600 hover:text-black"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        {/* Mobile menu button - simplified for now */}
        <div className="md:hidden">
          <select
            className="bg-white border border-gray-300 rounded px-3 py-1 text-sm"
            value={pathname}
            onChange={(e) => (window.location.href = e.target.value)}
          >
            {navItems.map((item) => (
              <option key={item.href} value={item.href}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  )
}
