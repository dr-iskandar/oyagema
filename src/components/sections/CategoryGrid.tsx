'use client';

import { motion } from 'framer-motion';
import CategoryCard from '../cards/CategoryCard';

type Category = {
  id: string;
  title: string;
  description?: string;
  coverUrl: string;
  href: string;
};

type CategoryGridProps = {
  title: string;
  categories: Category[];
};

const CategoryGrid = ({ title, categories }: CategoryGridProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="mb-6 sm:mb-8 md:mb-10">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">{title}</h2>
        <button className="text-accent hover:text-accent-light transition-colors text-xs sm:text-sm font-medium">
          See All
        </button>
      </div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {categories.map((category) => (
          <motion.div key={category.id} variants={item}>
            <CategoryCard 
              id={category.id}
              title={category.title}
              description={category.description}
              coverUrl={category.coverUrl}
              href={category.href}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default CategoryGrid;