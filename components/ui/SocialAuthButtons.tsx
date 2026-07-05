'use client'

const providers = [
  {
    name: 'Google',
    src: '/icons/Google.svg',
    bg: 'bg-linear-to-t from-gray-200 to-white hover:bg-slate-50',
    text: 'text-slate-700',
    border: 'border border-slate-300',
  },
  {
    name: 'TikTok',
    src: '/icons/TikTok.svg',
    bg: 'bg-linear-to-t from-gray-200 to-white hover:bg-slate-50',
    text: 'text-slate-700',
    border: 'border border-slate-300',
  },
  {
    name: 'Discord',
    src: '/icons/Discord.svg',
    bg: 'bg-linear-to-t from-gray-200 to-white hover:bg-slate-50',
    text: 'text-slate-700',
    border: 'border border-slate-300',
  },
]

type SocialAuthButtonsProps = {}

export default function SocialAuthButtons({}: SocialAuthButtonsProps) {
  const handleProviderClick = (providerName: string) => {
    if (providerName === 'Google') {
      window.location.href = '/api/auth/google/login'
      return
    }

    window.alert('Login dengan ' + providerName + ' belum tersedia saat ini.')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
          atau lanjutkan dengan
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {providers.map((provider) => (
          <button
            key={provider.name}
            type="button"
            onClick={() => handleProviderClick(provider.name)}
            className={`flex min-h-12 items-center justify-center gap-2.5 rounded-md px-3 py-3 text-sm font-semibold transition cursor-pointer ${provider.bg} ${provider.text} ${provider.border}`}
          >
            <img
              src={provider.src}
              alt={`${provider.name} logo`}
              width={28}
              height={28}
              className={"shrink-0 object-contain"}
            />
            <span className="leading-none">{provider.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
