
import { Bell, Search, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import LoginButton from '../auth/Login';
import { useSelector } from 'react-redux';
import Logout from '../auth/Logout';

export function Header() {

  const { user } = useSelector((state: any) => state.user) || {};



  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container flex h-16 items-center px-4">
        <div className="hidden md:flex md:flex-1">
          <form className="w-full max-w-sm">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-8 rounded-full bg-background"
              />
            </div>
          </form>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">


          <div className="flex items-center gap-2">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-auto">
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">EMI Payment Due</p>
                      <p className="text-xs text-muted-foreground">Your EMI payment of ₹12,500 is due tomorrow</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">KYC Verified</p>
                      <p className="text-xs text-muted-foreground">Your KYC documents have been verified</p>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {
              user ? (
                <Logout />
              )
                : (
                  <LoginButton />
                )
            }



          </div>
        </div>
      </div>
    </header>
  );
}
