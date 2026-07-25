import Image from 'next/image';

interface SocietyImageProps {
  src: string;
  alt: string;
  /** Extra classes (e.g. object-cover, opacity). Applied to the rendered image. */
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Renders a society photo that fills its (position:relative) parent.
 *
 * Admin-uploaded photos are stored as `data:` URLs, which next/image cannot
 * optimize — so those fall back to a plain <img>. Bundled/remote paths keep
 * using next/image with `fill`.
 */
export function SocietyImage({ src, alt, className = '', sizes, priority }: SocietyImageProps) {
  if (src.startsWith('data:')) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full ${className}`}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
