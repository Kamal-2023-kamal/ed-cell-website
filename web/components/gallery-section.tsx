"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { X } from "lucide-react"

type GalleryItem = {
  id?: string
  src: string
  alt: string
  caption: string
  tags?: string
  visible?: boolean
}

export function GallerySection() {
  const [images, setImages] = useState<GalleryItem[]>([])
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch("/api/gallery")
        if (!res.ok) throw new Error("Failed to fetch gallery")
        const json = await res.json()
        const data = Array.isArray(json.data) ? json.data : []
        
        const visibleItems = data
          .map((i: any) => ({
            id: i.id,
            src: i.src ?? "",
            alt: i.alt ?? "",
            caption: i.caption ?? "",
            tags: i.tags ?? "",
            visible: i.visible !== false,
          }))
          .filter((i) => i.visible)
          
        setImages(visibleItems)
      } catch (err) {
        console.error("Error loading gallery:", err)
        setImages([])
      }
    }

    fetchGallery()
  }, [])

  return (
    <section id="gallery" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Gallery
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Moments that Matter
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
            A glimpse into our events, workshops, and the vibrant community
            we{"'"}re building.
          </p>
        </div>

        {images.length === 0 ? (
          <p className="mt-16 text-center text-sm text-muted-foreground">
            No gallery images yet. Add images from the admin dashboard.
          </p>
        ) : (
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <button
                key={image.src}
                onClick={() => setSelectedImage(index)}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-foreground/0 transition-all group-hover:bg-foreground/40" />
                <div className="absolute bottom-0 left-0 right-0 translate-y-full p-4 transition-transform group-hover:translate-y-0">
                  <p className="text-sm font-medium text-background">
                    {image.caption}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && images[selectedImage] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 rounded-full bg-background/20 p-2 text-background hover:bg-background/40 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-h-[80vh] max-w-4xl w-full aspect-[4/3]">
            <Image
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              fill
              className="rounded-xl object-contain"
              sizes="(max-width: 1024px) 100vw, 80vw"
            />
          </div>
        </div>
      )}
    </section>
  )
}
