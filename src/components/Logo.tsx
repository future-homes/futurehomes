import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  variant?: 'default' | 'white';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ variant = 'default', size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 48, height: 48 },
  };

  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      {/* Your uploaded logo */}
      <Image
        src="/logo.svg"  // or /logo.png
        alt="Future Homes"
        width={sizes[size].width}
        height={sizes[size].height}
        className="object-contain"
        priority
      />
      
      <div className="flex flex-col">
        <span className={`text-xl font-black ${variant === 'white' ? 'text-white' : 'text-gray-900'}`}>
          Future Homes
        </span>
        <span className={`text-xs font-semibold ${variant === 'white' ? 'text-gray-300' : 'text-gray-500'}`}>
          Find Your Dream Home
        </span>
      </div>
    </Link>
  );
}
