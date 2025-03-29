
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, LogOut, Mail, User, FolderPlus } from "lucide-react";
import { useWaitlist } from "@/contexts/WaitlistContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import WaitlistDialog from "./WaitlistDialog";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { email, isVerified, setEmail } = useWaitlist();
  const { toast } = useToast();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = () => {
    localStorage.removeItem("waitlist-email");
    setEmail(null);
    toast({
      title: "Signed out successfully",
    });
  };

  return (
    <nav className="border-b shadow-sm py-4 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Open Source Love Hub</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/projects" className="text-gray-700 hover:text-primary transition-colors">
              Projects
            </Link>
            
            {email && isVerified ? (
              <>
                <Link to="/my-projects" className="text-gray-700 hover:text-primary transition-colors">
                  My Projects
                </Link>
                <Link to="/add-project">
                  <Button variant="default" size="sm">
                    Add Project
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = "/my-projects"}>
                      <FolderPlus className="mr-2 h-4 w-4" />
                      <span>My Projects</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Join Waitlist
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t space-y-4 fade-in">
            <Link 
              to="/" 
              className="block text-gray-700 hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/projects" 
              className="block text-gray-700 hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Projects
            </Link>
            
            {email && isVerified ? (
              <>
                <Link 
                  to="/my-projects" 
                  className="block text-gray-700 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Projects
                </Link>
                <Link 
                  to="/add-project" 
                  className="block py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="default" size="sm">
                    Add Project
                  </Button>
                </Link>
                <div className="block py-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out ({email})
                  </Button>
                </div>
              </>
            ) : (
              <div className="block py-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => {
                    setIsDialogOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Join Waitlist
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <WaitlistDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </nav>
  );
};

export default Navbar;
