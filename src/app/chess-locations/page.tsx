'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Mail, ExternalLink } from 'lucide-react';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function ChessLocationsPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            Chess Locations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover public places and chess clubs where you can enjoy playing chess with others
          </p>
        </motion.div>

        {/* Map Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-10"
        >
          <Card className="border-slate-200 shadow-md overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Chess Locations Map</CardTitle>
                  <CardDescription>
                    Public places and clubs where you can play chess
                  </CardDescription>
                </div>
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                  <MapPin className="h-3 w-3 mr-1" /> Global
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-[4/3] w-full h-[600px]">
                <iframe 
                  src="https://www.google.com/maps/d/embed?mid=1kPMYdo6QPZ8T1vIyjOP5Q6mjG94jVE0&ehbc=2E312F" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  title="Chess Locations Map"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="col-span-1"
          >
            <Card className="h-full border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">How to Use This Map</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                      <span className="text-green-700 font-bold text-sm">1</span>
                    </div>
                    <span>Zoom in on your area of interest to find chess locations near you</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                      <span className="text-green-700 font-bold text-sm">2</span>
                    </div>
                    <span>Click on markers to see details about each location</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                      <span className="text-green-700 font-bold text-sm">3</span>
                    </div>
                    <span>Use the map layers to filter by type of location (clubs, public spaces, cafés)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="col-span-1"
          >
            <Card className="h-full border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Submit New Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Know of a chess location that isn't on our map? We're continuously expanding our database of chess locations around the world.
                </p>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-amber-800 mb-2 font-medium">
                    The submission feature is coming soon!
                  </p>
                  <p className="text-gray-700">
                    In the meantime, please send location details to:
                  </p>
                  <div className="flex items-center mt-3">
                    <Mail className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="font-medium">echeclover@gmail.com</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <ExternalLink className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="font-medium">TikTok: chessmeme3090</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Featured Locations Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Featured Chess Destinations</h2>
            <p className="text-gray-600">Some of the world's most iconic chess locations</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Chess destination 1 - Washington Square Park */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="relative h-48 w-full">
                <Image 
                  src="/images/washington-square-park.png" 
                  alt="Chess in Washington Square Park" 
                  fill 
                  className="object-cover" 
                />
              </div>
              <CardContent className="pt-4">
                <h3 className="font-bold text-lg mb-1">Washington Square Park</h3>
                <p className="text-gray-600 text-sm mb-2">New York City, USA</p>
                <p className="text-gray-700 text-sm">
                  Famous public park where chess hustlers and enthusiasts gather daily. A cultural icon featured in movies and TV shows, with a vibrant chess community.
                </p>
              </CardContent>
            </Card>
            
            {/* Chess destination 2 - Jardin du Luxembourg */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="relative h-48 w-full">
                <Image 
                  src="/images/luxembourg-garden.png" 
                  alt="Jardin du Luxembourg" 
                  fill 
                  className="object-cover" 
                />
              </div>
              <CardContent className="pt-4">
                <h3 className="font-bold text-lg mb-1">Jardin du Luxembourg</h3>
                <p className="text-gray-600 text-sm mb-2">Paris, France</p>
                <p className="text-gray-700 text-sm">
                  Historic Parisian garden with dedicated chess areas where players of all levels gather. A serene setting with permanent stone chess tables under the shade of trees.
                </p>
              </CardContent>
            </Card>
            
            {/* Chess destination 3 - Blitz Society */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="relative h-48 w-full">
                <Image 
                  src="/images/blitz-society.png" 
                  alt="Blitz Society" 
                  fill 
                  className="object-cover" 
                />
              </div>
              <CardContent className="pt-4">
                <h3 className="font-bold text-lg mb-1">Blitz Society</h3>
                <p className="text-gray-600 text-sm mb-2">Paris, France</p>
                <p className="text-gray-700 text-sm">
                  Modern chess club and café designed specifically for rapid chess games. Features tournaments, coaching, and a vibrant community of chess enthusiasts.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Information about submitting locations */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Help Us Grow the Chess Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Our mission is to connect chess players and make it easier to find places to play. This map is a community resource that depends on contributions from players like you.
              </p>
              <p className="text-gray-700 mb-4">
                When submitting a new location, please include:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-4">
                <li>Name of the location</li>
                <li>Complete address</li>
                <li>Type of venue (club, café, public park, etc.)</li>
                <li>Opening hours (if applicable)</li>
                <li>Website or social media (if available)</li>
                <li>A brief description of the location</li>
              </ul>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <p className="text-purple-800 font-medium">
                  The feature to submit new chess locations will be available soon. Until then, please send your submissions to echeclover@gmail.com or contact us on TikTok @chessmeme3090.
                </p>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Last map update: April 10, 2025
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}