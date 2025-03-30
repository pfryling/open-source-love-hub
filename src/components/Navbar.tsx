import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Github, UserCircle } from "lucide-react";
import { useTheme } from "@/components/ui/use-theme";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname: pathName } = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-background border-b">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link to="/" className="font-bold text-2xl">
          The Love Hub
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            to="/projects"
            className={`${
              pathName === "/projects"
                ? "text-primary font-medium"
                : "text-gray-600 hover:text-primary"
            } flex items-center px-4 py-2 text-sm transition-colors`}
          >
            Projects
          </Link>
          {user && (
            <Link
              to="/my-projects"
              className={`${
                pathName === "/my-projects"
                  ? "text-primary font-medium"
                  : "text-gray-600 hover:text-primary"
              } flex items-center px-4 py-2 text-sm transition-colors`}
            >
              My Projects
            </Link>
          )}
          {/* Add this link right before or after the My Projects link */}
          <Link
            to="/profile"
            className={`${
              pathName === "/profile"
                ? "text-primary font-medium"
                : "text-gray-600 hover:text-primary"
            } flex items-center px-4 py-2 text-sm transition-colors`}
          >
            <UserCircle className="h-4 w-4 mr-2" />
            Profile
          </Link>
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              setTheme(theme === "light" ? "dark" : "light")
            }
          >
            {mounted && (
              <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            )}
            {mounted && (
              <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="https://github.com/joshencoder/lovable-hub">
              <Github className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.display_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
