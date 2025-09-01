'use client'

import React from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  priority?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  priority = false,
  onClick,
  style
}: OptimizedImageProps) {
  // Check if the src is a PNG file that might have a WebP version
  const isPng = src.endsWith('.png')
  const webpSrc = isPng ? src.replace('.png', '.webp') : null

  // If it's a PNG with potential WebP version, use picture element
  if (isPng && webpSrc) {
    return (
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={src}
          alt={alt}
          className={className}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          onClick={onClick}
          style={style}
        />
      </picture>
    )
  }

  // For non-PNG images, just return a regular img
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading}
      onClick={onClick}
      style={style}
    />
  )
}