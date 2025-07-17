'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

type CategoryCardProps = {
  id: string;
  title: string;
  description?: string;
  coverUrl: string;
  href: string;
};

const CategoryCard = ({ id, title, description, coverUrl, href }: CategoryCardProps) => {
  return (
    <Link href={href}>
      <motion.div 
        className="relative h-32 sm:h-36 md:h-40 rounded-lg sm:rounded-xl overflow-hidden card-hover-effect"
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Image 
          src={coverUrl} 
          alt={title} 
          fill 
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent">
          <div className="absolute bottom-0 left-0 p-3 sm:p-4 w-full">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary">{title}</h3>
            {description && (
              <p className="text-xs sm:text-sm text-text-secondary line-clamp-2">{description}</p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default CategoryCard;