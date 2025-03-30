
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
import { Heart, UserCircle } from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname: pathName } = useLocation();

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
          <Button variant="ghost" size="icon" className="text-pink-500">
            <Heart className="h-5 w-5 fill-pink-500" />
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user.user_metadata?.display_name?.charAt(0).toUpperCase() || 'U'}
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
