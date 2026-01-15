'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { LazyImage } from '@/components/performance/LazyImage';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package, CircleDot, Activity, ShoppingBag, LucideIcon } from 'lucide-react';
import { useSpeechOnView, useSpeechOnInteraction } from '@/hooks/useSpeech';
import { ProductDetails } from './ProductDetails';
import productDetailsData from '@/data/product-details.json';

// Product card component with speech
function ProductCard({
  product,
  variants,
  onLearnMore,
}: {
  product: {
    id: number;
    name: string;
    category: string;
    description: string;
    image: string;
    fallbackColor: string;
  };
  variants: any;
  onLearnMore: () => void;
}) {
  const productSpeech = useSpeechOnInteraction(
    `${product.name}. ${product.description}. Click to learn more.`,
    { onFocus: true }
  );

  return (
    <motion.div
      variants={variants}
      layout
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
      tabIndex={0}
      {...productSpeech}
    >
      <div className={`aspect-square ${product.fallbackColor} flex items-center justify-center overflow-hidden relative`}>
        <LazyImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          }
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{product.description}</p>
        <Button
          variant="outline"
          className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all"
          onClick={onLearnMore}
        >
          Learn More
        </Button>
      </div>
    </motion.div>
  );
}

function CategoryButton({
  category,
  isActive,
  onClick,
}: {
  category: { id: string; label: string; icon: LucideIcon };
  isActive: boolean;
  onClick: () => void;
}) {
  const categorySpeech = useSpeechOnInteraction(
    `${category.label} filter${isActive ? ', currently selected' : ''}. Click to ${isActive ? 'keep' : 'show'} ${category.label}.`,
    { onFocus: true }
  );

  const { onClick: speechOnClick, ...restSpeechProps } = categorySpeech;

  return (
    <button
      onClick={() => {
        if (speechOnClick) {
          speechOnClick();
        }
        onClick();
      }}
      className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg scale-105'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      aria-pressed={isActive}
      {...restSpeechProps}
    >
      <category.icon className="h-5 w-5" aria-hidden="true" />
      {category.label}
    </button>
  );
}

// CTA button component with speech
function RegisterCTAButton({ locale }: { locale: string }) {
  const ctaSpeech = useSpeechOnInteraction(
    'Register to Access Full Catalog. Click to create an account and access our complete product catalog.',
    { onFocus: true }
  );

  return (
    <Link href={`/${locale}/auth/register`}>
      <Button
        size="lg"
        className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all shadow-xl"
        {...ctaSpeech}
      >
        Register to Access Full Catalog
      </Button>
    </Link>
  );
}

interface ProductsSectionProps {
  locale: string;
}

export function ProductsSection({ locale }: ProductsSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Speech announcements
  const sectionIntro =
    'Mobility Devices Catalog. Browse our comprehensive range of mobility devices and assistive equipment designed to enhance independence and quality of life.';
  useSpeechOnView(sectionIntro, isInView, { enabled: true });

  const categories = [
    { id: 'all', label: 'All Products', icon: Package },
    { id: 'wheelchairs', label: 'Wheelchairs', icon: CircleDot },
    { id: 'mobility', label: 'Mobility Aids', icon: Activity },
    { id: 'accessories', label: 'Accessories', icon: ShoppingBag },
  ];

  const products = [
    {
      id: 1,
      name: 'Manual Wheelchair',
      category: 'wheelchairs',
      description: 'Durable and lightweight manual wheelchair for daily use',
      image: '/images/products/wheelchair-manual.jpg',
      fallbackColor: 'bg-blue-100',
    },
    {
      id: 2,
      name: 'Electric Wheelchair',
      category: 'wheelchairs',
      description: 'Powered wheelchair with joystick control',
      image: '/images/products/wheelchair-electric.jpg',
      fallbackColor: 'bg-purple-100',
    },
    {
      id: 3,
      name: 'Walking Crutches',
      category: 'mobility',
      description: 'Adjustable aluminum crutches with ergonomic grips',
      image: '/images/products/crutches.jpg',
      fallbackColor: 'bg-green-100',
    },
    {
      id: 4,
      name: 'Walker Frame',
      category: 'mobility',
      description: 'Stable walker frame with wheels',
      image: '/images/products/walker.jpg',
      fallbackColor: 'bg-orange-100',
    },
    {
      id: 5,
      name: 'Wheelchair Cushion',
      category: 'accessories',
      description: 'Pressure relief cushion for enhanced comfort',
      image: '/images/products/cushion.jpg',
      fallbackColor: 'bg-pink-100',
    },
    {
      id: 6,
      name: 'Prosthetic Limb',
      category: 'mobility',
      description: 'Custom-fitted prosthetic limb',
      image: '/images/products/prosthetic.jpg',
      fallbackColor: 'bg-indigo-100',
    },
    {
      id: 7,
      name: 'Orthotic Brace',
      category: 'accessories',
      description: 'Supportive orthotic brace for joints',
      image: '/images/products/brace.jpg',
      fallbackColor: 'bg-yellow-100',
    },
    {
      id: 8,
      name: 'Mobility Scooter',
      category: 'wheelchairs',
      description: 'Compact electric mobility scooter',
      image: '/images/products/scooter.jpg',
      fallbackColor: 'bg-red-100',
    },
  ];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleLearnMore = (productId: number) => {
    setSelectedProductId(productId);
    setIsDialogOpen(true);
  };

  const selectedProduct = selectedProductId 
    ? (productDetailsData as Record<string, any>)[selectedProductId.toString()] 
    : null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="products" className="py-20 md:py-32 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Mobility Devices Catalog
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Browse our comprehensive range of mobility devices and assistive equipment
            designed to enhance independence and quality of life.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <CategoryButton
              key={category.id}
              category={category}
              isActive={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variants={itemVariants}
              onLearnMore={() => handleLearnMore(product.id)}
            />
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <RegisterCTAButton locale={locale} />
        </motion.div>
      </div>

      {/* Product Details Dialog */}
      <ProductDetails
        product={selectedProduct}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </section>
  );
}

