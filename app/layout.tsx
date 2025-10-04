import type { Metadata } from 'next'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import AppHeader from '@/components/AppHeader'

export const metadata: Metadata = {
  title: 'Profit Tracker',
  description: 'Track your profits and manage transactions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-in" afterSignInUrl="/dashboard">
      <html lang="en" className="dark bg-gray-950">
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const savedDarkMode = localStorage.getItem('profit_tracker_dark_mode');
                    const isDark = savedDarkMode === null ? true : JSON.parse(savedDarkMode);
                    if (isDark) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } catch (e) {
                    document.documentElement.classList.add('dark');
                  }
                })();
              `,
            }}
          />
        </head>
        <body className="font-sans min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
          <AppHeader />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
