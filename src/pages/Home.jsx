import Hero from '../components/home/Hero.jsx'
import {
  CategorySection,
  Developments,
  FeaturedProperties,
  LatestProperties,
  LuxuryShowcase,
} from '../components/home/HomeCollections.jsx'
import { Faq, HowItWorks, Testimonials, WhyUs } from '../components/home/HomeTrust.jsx'
import { FinalCta, Locations } from '../components/home/HomeClosing.jsx'
import { useAppData } from '../lib/appData.jsx'
import { useI18n } from '../lib/i18n.jsx'
import usePageMeta from '../lib/useMeta.js'

export default function Home() {
  const { settings } = useAppData()
  const { pick } = useI18n()
  const sections = settings.sections || {}
  const enabled = (key) => sections[key] !== false

  usePageMeta({
    title: settings.seo?.title || 'EstatePro — Find Your Dream Property',
    description: settings.seo?.description || settings.heroDescription,
    image: settings.heroImage,
  })

  return (
    <>
      <Hero />
      {enabled('categories') && <CategorySection />}
      {enabled('whyUs') && <WhyUs />}
      {enabled('featured') && <FeaturedProperties />}
      {enabled('luxury') && <LuxuryShowcase />}
      {enabled('developments') && <Developments />}
      {enabled('locations') && <Locations />}
      {enabled('howItWorks') && <HowItWorks />}
      {enabled('latest') && <LatestProperties />}
      {enabled('testimonials') && <Testimonials />}
      {enabled('faq') && <Faq />}
      {enabled('cta') && <FinalCta />}
      <span className="sr-only">{pick('EstatePro property marketplace', 'بازار املاک استیت‌پرو')}</span>
    </>
  )
}
