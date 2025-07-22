import { useEffect } from 'react';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function MetaTags({
  title = "Toodles Funzone - Premier Kids Play Zone in Bangalore",
  description = "Experience the best indoor kids play zone in Bangalore at Toodles Funzone. Safe, fun, and engaging activities for children. Book birthday parties and play sessions today!",
  keywords = "kids play zone Bangalore, indoor playground, children activities, birthday parties, family fun, Sarjapur Road, Kodathi",
  image = "/toodles-social-image.jpg",
  url = window.location.href,
  type = "website"
}: MetaTagsProps) {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };
    
    // Basic SEO meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'Toodles Funzone');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    updateMetaTag('robots', 'index, follow');
    
    // Open Graph meta tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Toodles Funzone', true);
    updateMetaTag('og:locale', 'en_IN', true);
    
    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    
    // Additional SEO tags
    updateMetaTag('theme-color', '#ff6b9d');
    updateMetaTag('msapplication-TileColor', '#ff6b9d');
    
    // Structured data for local business
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Toodles Funzone",
      "description": description,
      "image": image,
      "url": url,
      "telephone": "+91 99012 18980",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Opposite Vishnu Leela Veg, Kodathi",
        "addressLocality": "Bangalore",
        "addressRegion": "Karnataka",
        "postalCode": "560035",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 12.8956,
        "longitude": 77.7214
      },
      "openingHours": [
        "Mo-Fr 10:00-20:00",
        "Sa 09:00-21:00"
      ],
      "priceRange": "₹₹",
      "servesCuisine": "Family Entertainment",
      "amenityFeature": [
        "Safe Play Area",
        "Birthday Party Packages",
        "Indoor Playground",
        "Supervised Activities"
      ]
    };
    
    // Update or create structured data script
    let scriptTag = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);
    
  }, [title, description, keywords, image, url, type]);
  
  return null;
}

// Predefined meta configurations for different pages
export const pageMetaConfigs = {
  home: {
    title: "Toodles Funzone - Premier Kids Play Zone in Bangalore | Safe & Fun",
    description: "Experience the best indoor kids play zone in Bangalore at Toodles Funzone. Safe, supervised activities for children aged 2-12. Book play sessions and birthday parties today!",
    keywords: "kids play zone Bangalore, indoor playground, children activities, family fun, safe play area, Sarjapur Road, Kodathi"
  },
  
  activities: {
    title: "Fun Activities for Kids - Toodles Funzone Bangalore",
    description: "Discover exciting indoor activities for kids at Toodles Funzone. Slides, ball pits, climbing zones, and more in a safe, supervised environment.",
    keywords: "kids activities Bangalore, indoor playground equipment, children slides, ball pit, climbing zone, safe play"
  },
  
  packages: {
    title: "Birthday Party Packages & Pricing - Toodles Funzone",
    description: "Affordable birthday party packages and play session pricing at Toodles Funzone. Walk-in, weekend, and monthly packages available. Book online now!",
    keywords: "birthday party packages Bangalore, kids party venue, play zone pricing, affordable kids entertainment"
  },
  
  birthday: {
    title: "Birthday Party Venue for Kids - Toodles Funzone Bangalore",
    description: "Host unforgettable birthday parties at Toodles Funzone! Complete party packages with decorations, cake, and supervised fun activities for kids.",
    keywords: "birthday party venue Bangalore, kids birthday parties, party packages, children party venue, Sarjapur Road"
  },
  
  gallery: {
    title: "Photo Gallery - Toodles Funzone Kids Play Zone",
    description: "See the fun in action! Browse our photo gallery showcasing kids enjoying activities, birthday parties, and play sessions at Toodles Funzone.",
    keywords: "kids play zone photos, birthday party pictures, children activities gallery, fun zone images"
  },
  
  contact: {
    title: "Contact Us - Toodles Funzone | Location, Hours, Booking",
    description: "Contact Toodles Funzone for bookings and inquiries. Located opposite Vishnu Leela Veg, Kodathi, Sarjapur Road. Call +91 99012 18980 to book now!",
    keywords: "Toodles Funzone contact, kids play zone Kodathi, Sarjapur Road, booking inquiry, phone number"
  }
};