import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, User, Menu, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export default function Header() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-brand-600">OlaLearn</span>
        </Link>

        {user && (
          <>
            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.username}</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                  {user.role}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile hamburger button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Mobile menu dropdown */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{user.username}</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full capitalize">
              {user.role}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout()
              setMobileMenuOpen(false)
            }}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      )}
    </header>
  )
}
