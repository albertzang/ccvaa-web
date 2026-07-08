import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MissionSection } from "@/components/MissionSection";
import { PurposesSection } from "@/components/PurposesSection";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <AboutSection />
        <PurposesSection />
        <MissionSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
