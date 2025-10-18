'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { favoritesService } from '@/lib/favoritesService';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  propertyId: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FavoriteButton({ propertyId, size = 'md' }: FavoriteButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavorite();
    }
  }, [user, propertyId]);

  const checkFavorite = async () => {
    if (!user) return;
    try {
      const favorite = await favoritesService.isFavorite(user.id, propertyId);
      setIsFavorite(favorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await favoritesService.removeFavorite(user.id, propertyId);
        setIsFavorite(false);
      } else {
        await favoritesService.addFavorite(user.id, propertyId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`${sizeClasses[size]} rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {loading ? (
        <div className={`${iconSizes[size]} border-2 border-red-500 border-t-transparent rounded-full animate-spin`}></div>
      ) : (
        <svg
          className={`${iconSizes[size]} ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
          fill={isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  );
}
