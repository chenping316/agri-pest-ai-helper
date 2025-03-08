
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { Home, Camera, Clock, LogOut, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const Navigation: React.FC = () => {
  const { pathname } = useLocation();
  const { logout, user } = useAppContext();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: "已退出登录",
      description: "您已成功退出系统"
    });
    setOpen(false);
  };

  const navItems = [
    { path: "/", label: "主页", icon: <Home className="h-5 w-5" /> },
    { path: "/analysis", label: "拍照分析", icon: <Camera className="h-5 w-5" /> },
    { path: "/history", label: "历史记录", icon: <Clock className="h-5 w-5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between py-2">
                  <div className="font-semibold text-lg text-primary">农业病虫害AI检测系统</div>
                  <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                        pathname === item.path
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted"
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto pt-4">
                  {user && (
                    <div className="flex flex-col gap-2">
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        已登录为: {user.username}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="justify-start"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        退出登录
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <div className="text-white font-bold text-sm">AI</div>
            </div>
            <span className="font-semibold text-lg hidden sm:inline-block text-primary">
              农业病虫害AI检测系统
            </span>
          </Link>
        </div>
        
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={pathname === item.path ? "secondary" : "ghost"}
                className={pathname === item.path ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Button>
            </Link>
          ))}
        </nav>
        
        <div className="hidden sm:flex items-center gap-2">
          {user && (
            <>
              <span className="text-sm text-muted-foreground pr-2">
                {user.username}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                退出
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
