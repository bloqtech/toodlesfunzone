import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { Testimonials } from "@/components/sections/testimonials";
import { CTA } from "@/components/sections/cta";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MetaTags, pageMetaConfigs } from "@/components/seo/meta-tags";
import { trackEvent } from "@/lib/analytics";

export default function LandingSEO() {
  const handleCTAClick = (location: string) => {
    trackEvent('cta_click', 'engagement', location);
  };

  const handleFeatureView = (feature: string) => {
    trackEvent('feature_view', 'engagement', feature);
  };

  return (
    <>
      <MetaTags {...pageMetaConfigs.home} />
      <div className="min-h-screen bg-gradient-to-br from-toodles-pink via-toodles-blue to-toodles-green dark:from-purple-900 dark:via-blue-900 dark:to-teal-900">
        <Header />
        
        {/* Hero Section with Analytics */}
        <section onMouseEnter={() => handleFeatureView('hero_section')}>
          <Hero />
        </section>
        
        {/* Features Section with Analytics */}
        <section onMouseEnter={() => handleFeatureView('features_section')}>
          <Features />
        </section>
        
        {/* Testimonials Section with Analytics */}
        <section onMouseEnter={() => handleFeatureView('testimonials_section')}>
          <Testimonials />
        </section>
        
        {/* Call to Action with Analytics */}
        <section onMouseEnter={() => handleFeatureView('cta_section')}>
          <CTA onCTAClick={handleCTAClick} />
        </section>
        
        <Footer />
      </div>
    </>
  );
}