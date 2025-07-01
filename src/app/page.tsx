import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import ServiceCards from '@/components/ServiceCards'
import PricingSection from '@/components/PricingSection'
import EventBanners from '@/components/EventBanners'
import CustomerReviews from '@/components/CustomerReviews'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <ServiceCards />
      <PricingSection />
      <EventBanners />
      <CustomerReviews />
      <Footer />
    </main>
  )
} 