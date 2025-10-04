import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <SignIn
        afterSignInUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: '#6366f1',
            colorText: 'white',
            colorInputBackground: 'rgb(17, 24, 39)', // gray-900
            colorInputText: 'white',
            borderRadius: '12px',
            spacingUnit: '10px'
          },
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl',
            headerTitle: 'text-white',
            headerSubtitle: 'text-gray-300',
            socialButtonsBlockButton: 'border-gray-700/60 hover:bg-gray-800/60 text-white',
            formFieldLabel: 'text-gray-200',
            formFieldInput: 'bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-400',
            footerActionText: 'text-gray-300',
            formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
            dividerLine: 'bg-white/10',
            dividerText: 'text-gray-400'
          }
        }}
      />
    </div>
  )
}
