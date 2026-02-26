import { Suspense } from 'react'
import FormsContent from './formscontent'

export default function FormsPage() {
  return (
    <Suspense fallback={
      <div className=" bg-gray-50  flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-2 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    }>
      <FormsContent />
    </Suspense>
  )
}