import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MiniCourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    href: string;
    type: string;
  };
}

const getImagePathForCourseType = (type: string): string => {
  // Map different course types to their appropriate images
  const typeToImagePath = {
    'prompt-engineering': '/images/course-thumbnails/prompt-engineering.jpg',
    'project-management': '/images/course-thumbnails/project-management.jpg',
    'tools': '/images/course-thumbnails/digital-tools.jpg',
    'content-creation': '/images/course-thumbnails/content-creation.jpg',
    'business': '/images/course-thumbnails/business-strategy.jpg',
    'terminology': '/images/course-thumbnails/ai-terminology.jpg',
    'deployment': '/images/course-thumbnails/deployment.jpg',
    'strategy': '/images/course-thumbnails/ai-strategy.jpg',
    // Default image for any other case
    'default': '/images/course-thumbnails/artificial-intelligence.jpg'
  };
  
  // Convert type to lowercase and remove spaces for matching
  const normalizedType = type.toLowerCase().replace(/\s+/g, '-');
  
  // Find a matching image or use default
  for (const [key, path] of Object.entries(typeToImagePath)) {
    if (normalizedType.includes(key)) {
      return path;
    }
  }
  
  return typeToImagePath.default;
};

export default function MiniCourseCard({ course }: MiniCourseCardProps) {
  const imagePath = getImagePathForCourseType(course.type);

  return (
    <Link href={course.href}
      className="flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-sg-bright-green/20 transition-all"
    >
      <div className="relative w-full pt-[56.25%]">
        <Image 
          src={imagePath}
          alt={`${course.title} course thumbnail`}
          fill
          className="object-cover"
          priority={false}
        />
      </div>
      <div className="p-5">
        <span className="text-xs font-semibold text-sg-bright-green mb-2 block uppercase tracking-wider">{course.type}</span>
        <h3 className="text-lg font-bold text-sg-dark-teal mb-2">{course.title}</h3>
        <p className="text-sm text-sg-dark-teal/70 line-clamp-2">{course.description}</p>
      </div>
    </Link>
  );
} 