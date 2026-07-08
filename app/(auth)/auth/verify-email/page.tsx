import { Suspense } from 'react'
import Loading from '@/app/loading'
import VerifyEmailContent from './VerifyEmailContent'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
