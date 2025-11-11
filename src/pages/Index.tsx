import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Clock, Bell, Calendar, Users, CheckCircle2, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-4 bg-primary rounded-2xl shadow-glow">
              <Activity className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Skip the Physical Queue,<br />
            <span className="gradient-primary bg-clip-text text-transparent">Track in Real-Time</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            SmartQueue eliminates hospital waiting rooms. Book appointments, monitor your token status, 
            and arrive exactly when needed - all from your device.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="h-14 px-8 text-lg shadow-lg" onClick={() => window.location.href = "/login"}>
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg" onClick={() => window.location.href = "/"}>
              View Demo Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 animate-slide-up">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose SmartQueue?</h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-Time Tracking</h3>
            <p className="text-muted-foreground">
              Monitor your queue position live. Know exactly when to arrive at the hospital with estimated wait times.
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bell className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Notifications</h3>
            <p className="text-muted-foreground">
              Receive instant alerts when your turn approaches. Never miss your appointment again.
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-bold mb-3">Easy Rescheduling</h3>
            <p className="text-muted-foreground">
              Change or cancel appointments with one click. Smart system reallocates slots instantly.
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-warning" />
            </div>
            <h3 className="text-xl font-bold mb-3">Multi-Hospital Support</h3>
            <p className="text-muted-foreground">
              Access multiple hospitals and departments from one platform. Seamless healthcare management.
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-info/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Activity className="h-8 w-8 text-info" />
            </div>
            <h3 className="text-xl font-bold mb-3">Elderly Friendly</h3>
            <p className="text-muted-foreground">
              Large buttons, voice alerts, and simple interface designed for all age groups.
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Offline Mode</h3>
            <p className="text-muted-foreground">
              View your token status even without internet. Perfect for low-connectivity areas.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Create Your Account</h3>
              <p className="text-muted-foreground">Sign up with email, phone, or Google in seconds. Free and secure.</p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xl flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Book Your Appointment</h3>
              <p className="text-muted-foreground">Select hospital, department, doctor, and time slot. Get instant token number.</p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-success text-success-foreground flex items-center justify-center font-bold text-xl flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Track Your Queue Live</h3>
              <p className="text-muted-foreground">Monitor real-time queue status from home, work, or anywhere. Get notified when your turn is near.</p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-warning text-warning-foreground flex items-center justify-center font-bold text-xl flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Arrive Just in Time</h3>
              <p className="text-muted-foreground">Head to the hospital only when your turn approaches. No more waiting room stress!</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center max-w-3xl mx-auto gradient-primary text-white shadow-glow">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Healthcare Experience?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of patients who've eliminated waiting room stress
          </p>
          <Button size="lg" variant="secondary" className="h-14 px-8 text-lg" onClick={() => window.location.href = "/login"}>
            Start Using SmartQueue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 SmartQueue. Revolutionizing healthcare accessibility.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
