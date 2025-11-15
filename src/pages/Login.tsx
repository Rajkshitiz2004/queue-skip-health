import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Activity, Mail, Lock, User, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.session) {
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("signup-email") as string;
    const password = formData.get("signup-password") as string;
    const fullName = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.session) {
        toast.success("Account created successfully!");
        navigate("/dashboard");
      } else {
        toast.success("Please check your email to verify your account");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden md:block animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary rounded-xl shadow-glow">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">SmartQueue</h1>
              <p className="text-muted-foreground">Digital Healthcare Management</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Skip the Wait,<br />
            Track in Real-Time
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            Book appointments, monitor queues, and manage your healthcare visits seamlessly from anywhere.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg shadow-sm">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Live Queue Tracking</h3>
                <p className="text-sm text-muted-foreground">Monitor your position in real-time</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg shadow-sm">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">Smart Notifications</h3>
                <p className="text-sm text-muted-foreground">Get notified when your turn approaches</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg shadow-sm">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">Easy Rescheduling</h3>
                <p className="text-sm text-muted-foreground">Change appointments with one click</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <Card className="p-8 shadow-xl animate-slide-up">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                  <p className="text-muted-foreground">Enter your credentials to continue</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="text-center">
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Create Account</h2>
                  <p className="text-muted-foreground">Join SmartQueue today</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        name="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative mt-2">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        name="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-12"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;
