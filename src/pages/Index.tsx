
import Hero from "@/components/Hero";
import FeaturedProjects from "@/components/FeaturedProjects";
import FAQ from "@/components/FAQ";
import VotesStatus from "@/components/VotesStatus";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <VotesStatus />
      <FeaturedProjects />
      <FAQ />
    </div>
  );
};

export default Index;
