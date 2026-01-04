import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from './utils'
import { useTheme } from './theme'
import { useCanvasRoot } from '../canvas/DeviceFrame'

export interface ImageViewerImage {
  src: string
  alt?: string
  thumbnail?: string
  caption?: string
}

export interface ImageViewerProps {
  images: ImageViewerImage[]
  initialIndex?: number
  open: boolean
  onClose: () => void
  /** Show thumbnails at bottom */
  showThumbnails?: boolean
  /** Show image counter */
  showCounter?: boolean
  /** Allow zoom */
  zoomable?: boolean
  /** Close on backdrop click */
  closeOnBackdrop?: boolean
  className?: string
}

export function ImageViewer({
  images,
  initialIndex = 0,
  open,
  onClose,
  showThumbnails = true,
  showCounter = true,
  zoomable = true,
  closeOnBackdrop = true,
  className,
}: ImageViewerProps) {
  const { colors } = useTheme()
  const canvasRoot = useCanvasRoot()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex)
      setZoom(1)
      setPosition({ x: 0, y: 0 })
      if (!canvasRoot) {
        document.body.style.overflow = 'hidden'
      }
    } else if (!canvasRoot) {
      document.body.style.overflow = ''
    }
    return () => {
      if (!canvasRoot) {
        document.body.style.overflow = ''
      }
    }
  }, [open, initialIndex, canvasRoot])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrev()
          break
        case 'ArrowRight':
          goToNext()
          break
        case 'Escape':
          onClose()
          break
        case '+':
        case '=':
          if (zoomable) setZoom((z) => Math.min(z + 0.5, 4))
          break
        case '-':
          if (zoomable) setZoom((z) => Math.max(z - 0.5, 1))
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, currentIndex, images.length, zoomable])

  const goToNext = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
    setCurrentIndex((i) => (i + 1) % images.length)
  }, [images.length])

  const goToPrev = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
    setCurrentIndex((i) => (i - 1 + images.length) % images.length)
  }, [images.length])

  const handleZoom = (e: React.MouseEvent) => {
    if (!zoomable) return
    e.stopPropagation()

    if (zoom === 1) {
      setZoom(2)
    } else {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom === 1) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom === 1) return
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch handling
  const touchStart = useRef({ x: 0, y: 0 })
  const lastTap = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }

    // Double tap to zoom
    const now = Date.now()
    if (now - lastTap.current < 300 && zoomable) {
      if (zoom === 1) {
        setZoom(2)
      } else {
        setZoom(1)
        setPosition({ x: 0, y: 0 })
      }
    }
    lastTap.current = now
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (zoom > 1) {
      const touch = e.touches[0]
      setPosition({
        x: touch.clientX - touchStart.current.x + position.x,
        y: touch.clientY - touchStart.current.y + position.y,
      })
      touchStart.current = { x: touch.clientX, y: touch.clientY }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (zoom === 1 && e.changedTouches[0]) {
      const touch = e.changedTouches[0]
      const diffX = touch.clientX - touchStart.current.x

      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          goToPrev()
        } else {
          goToNext()
        }
      }
    }
  }

  if (!open || images.length === 0) return null

  const currentImage = images[currentIndex]

  // Use absolute positioning when rendering in canvas, fixed when in document.body
  const isInCanvas = canvasRoot !== null
  const positioningClass = isInCanvas ? 'absolute' : 'fixed'

  const content = (
    <div
      ref={containerRef}
      className={cn(
        positioningClass,
        'inset-0 z-50 flex flex-col',
        className
      )}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3">
        <button
          onClick={onClose}
          className="p-2 rounded-full transition-colors hover:bg-white/10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        {showCounter && images.length > 1 && (
          <div className="text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {zoomable && (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setZoom((z) => Math.max(z - 0.5, 1))
              }}
              disabled={zoom <= 1}
              className="p-2 rounded-full transition-colors hover:bg-white/10 disabled:opacity-30"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M19 13H5v-2h14v2z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setZoom((z) => Math.min(z + 0.5, 4))
              }}
              disabled={zoom >= 4}
              className="p-2 rounded-full transition-colors hover:bg-white/10 disabled:opacity-30"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Main image area */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToPrev()
              }}
              className="absolute left-4 z-10 p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              className="absolute right-4 z-10 p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </>
        )}

        {/* Image */}
        <img
          src={currentImage.src}
          alt={currentImage.alt || ''}
          className={cn(
            'max-w-full max-h-full object-contain transition-transform select-none',
            zoom > 1 ? 'cursor-grab' : zoomable ? 'cursor-zoom-in' : ''
          )}
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          }}
          onClick={handleZoom}
          draggable={false}
        />
      </div>

      {/* Caption */}
      {currentImage.caption && (
        <div
          className="shrink-0 text-center py-2 px-4 text-white text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {currentImage.caption}
        </div>
      )}

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div
          className="shrink-0 flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setZoom(1)
                setPosition({ x: 0, y: 0 })
              }}
              className={cn(
                'shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all',
                currentIndex === index
                  ? 'ring-2 ring-white opacity-100'
                  : 'opacity-50 hover:opacity-75'
              )}
            >
              <img
                src={img.thumbnail || img.src}
                alt={img.alt || ''}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return createPortal(content, canvasRoot || document.body)
}

ImageViewer.displayName = 'ImageViewer'

// Gallery component - grid of images that opens lightbox
export interface GalleryProps {
  images: ImageViewerImage[]
  columns?: 2 | 3 | 4
  gap?: number
  aspectRatio?: 'square' | '4/3' | '16/9'
  className?: string
}

export function Gallery({
  images,
  columns = 3,
  gap = 4,
  aspectRatio = 'square',
  className,
}: GalleryProps) {
  const { colors } = useTheme()
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)

  const aspectMap = {
    square: 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
  }

  return (
    <>
      <div
        className={cn(
          'grid',
          columns === 2 && 'grid-cols-2',
          columns === 3 && 'grid-cols-3',
          columns === 4 && 'grid-cols-4',
          className
        )}
        style={{ gap }}
      >
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => {
              setViewerIndex(index)
              setViewerOpen(true)
            }}
            className={cn(
              'overflow-hidden rounded-lg',
              aspectMap[aspectRatio]
            )}
            style={{ backgroundColor: colors.surfaceSecondary }}
          >
            <img
              src={image.thumbnail || image.src}
              alt={image.alt || ''}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </button>
        ))}
      </div>

      <ImageViewer
        images={images}
        initialIndex={viewerIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  )
}

Gallery.displayName = 'Gallery'
