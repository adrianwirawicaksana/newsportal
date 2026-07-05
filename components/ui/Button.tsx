type AuthButtonProps = {
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  disabled?: boolean
}

export default function AuthButton({ children, type = 'button', onClick, disabled = false }: AuthButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-md bg-linear-to-t from-blue-600 to-blue-500 px-4 py-3 sm:py-3.5 font-semibold text-white transition duration-200 ease-in-out ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-blue-600'}`}
    >
      {children}
    </button>
  )
}
