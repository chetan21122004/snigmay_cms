"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronDown } from "lucide-react"

interface PaginationLoaderProps {
  onLoadMore: () => Promise<void>
  hasMore: boolean
  loading: boolean
  itemName: string
}

export default function PaginationLoader({ 
  onLoadMore, 
  hasMore, 
  loading, 
  itemName 
}: PaginationLoaderProps) {
  const [localLoading, setLocalLoading] = useState(false)

  const handleLoadMore = async () => {
    setLocalLoading(true)
    try {
      await onLoadMore()
    } catch (error) {
      console.error(`Error loading more ${itemName}:`, error)
    } finally {
      setLocalLoading(false)
    }
  }

  if (!hasMore) {
    return (
      <div className="text-center py-4 text-sm text-gray-500">
        All {itemName} loaded
      </div>
    )
  }

  return (
    <div className="flex justify-center py-4">
      <Button
        variant="outline"
        onClick={handleLoadMore}
        disabled={loading || localLoading}
        className="flex items-center gap-2"
      >
        {(loading || localLoading) ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading more {itemName}...
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            Load more {itemName}
          </>
        )}
      </Button>
    </div>
  )
}
