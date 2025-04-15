'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/SearchBar';
import { motion, useInView, useScroll, useTransform, LazyMotion, domAnimation } from 'framer-motion';
import ClientOnly from '@/components/ClientOnly';
import dynamic from 'next/dynamic';

// Dynamic import for Chessboard component
const ChessboardComponent = dynamic(() => import('react-chessboard').then((mod) => mod.Chessboard), { ssr: false });

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, type: "spring", stiffness: 100 }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, type: "spring", stiffness: 100 }
  }
};

export default function Home() {
  const heroRef = useRef(null);
  const feature1Ref = useRef(null);
  const feature2Ref = useRef(null);
  const feature3Ref = useRef(null);
  const ctaRef = useRef(null);
  
  return (
    <div className="flex flex-col overflow-hidden">
      {/* Content with animations rendered only client-side */}
      <ClientOnly>
        <LazyMotion features={domAnimation}>
          {/* Render AnimatedContent directly */}
          <AnimatedContent 
            heroRef={heroRef}
            feature1Ref={feature1Ref}
            feature2Ref={feature2Ref}
            feature3Ref={feature3Ref}
            ctaRef={ctaRef}
          />
        </LazyMotion>
      </ClientOnly>
    </div>
  );
}

// Component with all animations, loaded only client-side
function AnimatedContent({ heroRef, feature1Ref, feature2Ref, feature3Ref, ctaRef }) {
  const { scrollY } = useScroll();
  const feature1InView = useInView(feature1Ref, { once: true, amount: 0.3 });
  const feature2InView = useInView(feature2Ref, { once: true, amount: 0.3 });
  const feature3InView = useInView(feature3Ref, { once: true, amount: 0.3 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 });

  // Parallax effect for hero section
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  return (
    <>
      {/* Hero Section with brief intro */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
        style={{ opacity: heroOpacity }}
        initial="hidden"
        animate="visible"
      >
        {/* Background pattern with parallax effect */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y: heroY }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 opacity-70" />
          <div className="absolute inset-0 bg-[url('/chess-pattern.svg')] opacity-5" />
        </motion.div>

        {/* Hero content */}
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-5xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
          >
            <motion.h1 
              variants={fadeIn}
              className="text-5xl md:text-7xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-800 via-violet-700 to-indigo-800 leading-tight"
            >
              Chess Analytics Evolved
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto"
            >
              Discover our three powerful tools to elevate your chess game
            </motion.p>
            
            <motion.div 
              variants={fadeIn}
              className="flex flex-col sm:flex-row justify-center gap-4 mt-4"
            >
              <Button 
                size="lg" 
                className="bg-purple-700 hover:bg-purple-800 text-white font-medium px-8 py-6 rounded-xl text-lg shadow-lg shadow-purple-300/30 transition-all hover:shadow-purple-400/40 hover:scale-[1.03]"
                onClick={() => {
                  document.getElementById('feature1')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Features
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <span className="text-sm text-gray-500 mb-2">Scroll to Discover</span>
          <div className="w-6 h-10 rounded-full border-2 border-purple-300 flex justify-center p-1">
            <motion.div 
              className="w-2 h-2 bg-purple-500 rounded-full"
              animate={{ 
                y: [0, 15, 0],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>
      </motion.section>
      
      {/* Feature 1: Player Search */}
      <section 
        id="feature1"
        ref={feature1Ref}
        className="py-32 bg-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/40 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              animate={feature1InView ? "visible" : "hidden"}
              variants={slideInLeft}
              className="order-2 lg:order-1"
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                <span className="text-purple-700">01.</span> Player Search
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Access our extensive database of <span className="font-semibold">1.5 million FIDE players</span> to find comprehensive profiles and statistics.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-700" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">Find any FIDE-registered chess player</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-700" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">Discover their Chess.com and Lichess.org accounts</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-700" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">View complete rating history and tournament performance</span>
                </li>
              </ul>
              
              <div className="mb-8">
                <SearchBar />
              </div>
              
              <div className="mt-10 flex flex-wrap gap-4 items-center">
                <Link href="/player-search">
                  <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                    Search Players
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  {/* Logos encore plus grands */}
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center p-1">
                    <Image src="/chesscom.png" alt="Chess.com" width={36} height={36} />
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center p-1">
                    <Image src="/lichessorg.png" alt="Lichess.org" width={36} height={36} />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Integrated platforms</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              animate={feature1InView ? "visible" : "hidden"}
              variants={slideInRight}
              className="order-1 lg:order-2 shadow-2xl rounded-2xl overflow-hidden bg-white border border-gray-100"
            >
              <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="ml-4 text-sm font-medium text-gray-500">Player Search</div>
              </div>
              <div className="p-8">
                <div className="w-full bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    {/* Ajout de la photo de profil de Magnus Carlsen */}
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-200">
                      <Image 
                        src="/images/magnus_carlsen_fide.jpg" 
                        alt="Magnus Carlsen" 
                        width={64} 
                        height={64} 
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-lg">Magnus Carlsen</div>
                      <div className="text-sm text-gray-500">FIDE ID: 1503014</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Classical</div>
                      <div className="font-bold text-gray-800">2830</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Rapid</div>
                      <div className="font-bold text-gray-800 flex items-center gap-2">
                        2820
                        <div className="flex items-center text-green-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-medium">+6</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Blitz</div>
                      <div className="font-bold text-gray-800 flex items-center gap-2">
                        2886
                        <div className="flex items-center text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-medium">-5</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Country</div>
                      <div className="font-bold text-gray-800 flex items-center gap-2">
                        {/* Ajout du drapeau norvégien */}
                        <Image 
                          src="https://ratings.fide.com/images/flags/no.svg" 
                          alt="Norway Flag" 
                          width={20} 
                          height={14} 
                        />
                        Norway
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Online Accounts</div>
                    <div className="flex items-center gap-3 mb-2">
                      <Image src="/chesscom.png" alt="Chess.com" width={16} height={16} />
                      <span className="text-sm text-gray-800">MagnusCarlsen</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Image src="/lichessorg.png" alt="Lichess.org" width={16} height={16} />
                      <span className="text-sm text-gray-800">DrNykterstein</span>
                    </div>
                  </div>
                </div>
                {/* SearchBar supprimée d'ici */}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Feature 2: Opening Explorer */}
      <section 
        id="feature2"
        ref={feature2Ref}
        className="py-32 bg-gray-50 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-50/40 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              animate={feature2InView ? "visible" : "hidden"}
              variants={slideInRight}
              className="order-1"
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                <span className="text-blue-700">02.</span> Opening Explorer
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Analyze any player's opening repertoire from Chess.com or Lichess.org with our <span className="font-semibold">Stockfish-powered</span> explorer.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">Study a player's favorite openings and variations</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">Identify strengths and weaknesses in their repertoire</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">Get powerful Stockfish analysis of key positions</span>
                </li>
              </ul>
              
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/repertoire">
                  <Button className="bg-blue-700 hover:bg-blue-800 text-white">
                    Explore Openings
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </Link>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-2">Powered by</span>
                  <div className="h-8 px-3 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                    Stockfish
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              animate={feature2InView ? "visible" : "hidden"}
              variants={slideInLeft}
              className="order-2 shadow-2xl rounded-2xl overflow-hidden bg-white border border-gray-100"
            >
              <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="ml-4 text-sm font-medium text-gray-500">Opening Explorer</div>
              </div>
              <div className="p-6">
                {/* Filters similaires à la page repertoire avec les données préchargées */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="text-xs text-blue-700 font-medium mb-1">Player</div>
                    <div className="flex items-center gap-2">
                      <Image 
                        src="/chesscom.png" 
                        alt="Chess.com" 
                        width={14} 
                        height={14}
                        className="rounded-full" 
                      />
                      <span className="text-sm font-medium text-gray-800">MagnusCarlsen</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="text-xs text-blue-700 font-medium mb-1">Side</div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-white border border-gray-200"></div>
                      <span className="text-sm font-medium text-gray-800">White</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="text-xs text-blue-700 font-medium mb-1">Games</div>
                    <div className="text-sm font-medium text-gray-800">325 analyzed</div>
                  </div>
                </div>
                
                {/* Chessboard remplacée par le composant de react-chessboard */}
                <div className="mb-5 relative overflow-hidden rounded-lg border border-gray-200">
                  <div className="aspect-square w-full">
                    {/* Importation dynamique du composant Chessboard */}
                    <ChessboardComponent />
                  </div>
                </div>
                
                {/* Analyse des mouvements avec statistiques */}
                <div className="space-y-2 mb-5">
                  <div className="text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                    <span>Magnus' Top Moves as White</span>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">White to play</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2.5 rounded-md hover:bg-blue-50 transition-colors cursor-pointer border border-gray-200">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex items-center justify-center bg-white rounded-full border border-gray-200 font-medium text-gray-800 mr-3">e4</div>
                      <span className="text-sm">King's Pawn Opening</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded">71%</div>
                      <div className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">152 games</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2.5 rounded-md hover:bg-blue-50 transition-colors cursor-pointer border border-gray-200">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex items-center justify-center bg-white rounded-full border border-gray-200 font-medium text-gray-800 mr-3">d4</div>
                      <span className="text-sm">Queen's Pawn Opening</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded">67%</div>
                      <div className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">86 games</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2.5 rounded-md hover:bg-blue-50 transition-colors cursor-pointer border border-gray-200">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex items-center justify-center bg-white rounded-full border border-gray-200 font-medium text-gray-800 mr-3">c4</div>
                      <span className="text-sm">English Opening</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded">58%</div>
                      <div className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">43 games</div>
                    </div>
                  </div>
                </div>
                
                {/* Analyse Stockfish simplifiée */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs font-medium text-gray-700">Stockfish Analysis</div>
                    <div className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-medium">Depth 22</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 flex items-center justify-center bg-white rounded-full border border-gray-200 font-medium text-xs text-gray-800">e4</div>
                        <span className="text-sm">+0.35</span>
                      </div>
                      <div className="text-xs text-gray-500">Best move</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 flex items-center justify-center bg-white rounded-full border border-gray-200 font-medium text-xs text-gray-800">d4</div>
                        <span className="text-sm">+0.23</span>
                      </div>
                      <div className="text-xs text-gray-500">Second best</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 flex items-center justify-center bg-white rounded-full border border-gray-200 font-medium text-xs text-gray-800">c4</div>
                        <span className="text-sm">+0.15</span>
                      </div>
                      <div className="text-xs text-gray-500">Third best</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Feature 3: Game Analysis */}
      <section 
        id="feature3"
        ref={feature3Ref}
        className="py-32 bg-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              animate={feature3InView ? "visible" : "hidden"}
              variants={slideInLeft}
              className="order-2 lg:order-1"
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                <span className="text-green-700">03.</span> Game Analysis
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Get detailed insights into your chess games with our <span className="font-semibold">comprehensive analysis</span> that highlights improvements and provides statistics.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-700" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">Identify critical moments and missed opportunities</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-700" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">Get personalized recommendations for improvement</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-700" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-700">View detailed statistics about your playing style</span>
                </li>
              </ul>
              
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/game-analysis">
                  <Button className="bg-green-700 hover:bg-green-800 text-white">
                    Analyze Your Games
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </Link>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-2">Powered by</span>
                  <div className="h-8 px-3 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
                    Stockfish
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              animate={feature3InView ? "visible" : "hidden"}
              variants={slideInRight}
              className="order-1 lg:order-2 shadow-2xl rounded-2xl overflow-hidden bg-white border border-gray-100"
            >
              <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="ml-4 text-sm font-medium text-gray-500">Game Analysis</div>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-gray-700">Game Overview</div>
                    <div className="text-xs text-gray-500">April 10, 2025</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-2">W</div>
                      <div className="text-sm">YourUsername</div>
                    </div>
                    <div className="text-sm font-medium">1-0</div>
                    <div className="flex items-center">
                      <div className="text-sm">Opponent</div>
                      <div className="h-8 w-8 rounded-full bg-gray-800 text-white border border-gray-200 flex items-center justify-center ml-2">B</div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6 space-y-3">
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-green-500"></div>
                    <div className="text-sm font-medium text-green-800 mb-1">Good move!</div>
                    <p className="text-sm text-green-700">Your queen sacrifice on move 24 was excellent, leading to a forced checkmate sequence.</p>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-yellow-500"></div>
                    <div className="text-sm font-medium text-yellow-800 mb-1">Inaccuracy</div>
                    <p className="text-sm text-yellow-700">On move 18, Nd5 would have been stronger than Bf4, maintaining your advantage.</p>
                  </div>
                  
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                    <div className="text-sm font-medium text-red-800 mb-1">Missed opportunity</div>
                    <p className="text-sm text-red-700">You missed a tactical shot on move 12 that would have won material.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500 mb-1">Accuracy</div>
                    <div className="text-lg font-bold text-gray-800">86.7%</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500 mb-1">Best Moves</div>
                    <div className="text-lg font-bold text-gray-800">24/32</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500 mb-1">Mistakes</div>
                    <div className="text-lg font-bold text-gray-800">2</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-500 mb-1">Blunders</div>
                    <div className="text-lg font-bold text-gray-800">0</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Game Progress</div>
                  <div className="h-8 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-green-600 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <div>Opening</div>
                    <div>Middlegame</div>
                    <div>Endgame</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section 
        ref={ctaRef}
        className="py-24 bg-gradient-to-br from-purple-700 to-indigo-800 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/chess-pattern.svg')] opacity-5" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to elevate your chess game?</h2>
            <p className="text-xl text-purple-200 mb-10 max-w-3xl mx-auto">
              Start analyzing your games, exploring openings, and finding players today with our powerful chess platform.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <Link href="/player-search">
                <Button size="lg" className="bg-white hover:bg-gray-100 text-purple-800 font-medium px-8 py-6 rounded-xl text-lg shadow-lg transition-all hover:shadow-purple-900/20">
                  Search Players
                </Button>
              </Link>
              <Link href="/repertoire">
                <Button size="lg" className="bg-white hover:bg-gray-100 text-purple-800 font-medium px-8 py-6 rounded-xl text-lg shadow-lg transition-all hover:shadow-purple-900/20">
                  Explore Openings
                </Button>
              </Link>
              <Link href="/game-analysis">
                <Button size="lg" className="bg-white hover:bg-gray-100 text-purple-800 font-medium px-8 py-6 rounded-xl text-lg shadow-lg transition-all hover:shadow-purple-900/20">
                  Analyze Games
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-12">
              <Image src="/chesscom.png" alt="Chess.com" width={120} height={30} className="opacity-70 hover:opacity-100 transition-opacity" />
              <Image src="/lichessorg.png" alt="Lichess.org" width={120} height={30} className="opacity-70 hover:opacity-100 transition-opacity" />
              <div className="text-2xl font-bold text-white opacity-70 hover:opacity-100 transition-opacity">FIDE</div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
