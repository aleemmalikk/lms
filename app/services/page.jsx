import { Suspense } from 'react'
import ServicesContent from './ServicesContent'

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
      </div>
    }>
      <ServicesContent />
    </Suspense>
  )
}