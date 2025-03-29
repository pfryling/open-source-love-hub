
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="bg-gradient-to-b from-secondary/50 to-background py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-700">
            Open Source Love Hub
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Connect with passionate developers and contribute to amazing Lovable projects
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/projects">
              <Button size="lg" className="w-full sm:w-auto">
                Explore Projects
              </Button>
            </Link>
            <Link to="/add-project">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Add Your Project
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
