import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Users, Activity, Bell } from "lucide-react";

const Dashboard = () => {
  const [currentToken] = useState(45);
  const [yourToken] = useState(52);
  const [estimatedWait] = useState(21);

  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      department: "Cardiology",
      date: "Today",
      time: "2:30 PM",
      token: 52,
      status: "active"
    },
    {
      id: 2,
      doctor: "Dr. Michael Chen",
      department: "Orthopedics",
      date: "Tomorrow",
      time: "10:00 AM",
      token: 15,
      status: "scheduled"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back, John</h1>
          <p className="text-muted-foreground">Track your appointments and queue status in real-time</p>
        </div>

        {/* Live Queue Status - Featured Card */}
        <Card className="mb-8 overflow-hidden border-2 border-primary/20 shadow-glow animate-slide-up">
          <div className="gradient-primary p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5" />
              <span className="font-semibold">LIVE QUEUE STATUS</span>
            </div>
            <h2 className="text-3xl font-bold mb-1">Dr. Sarah Johnson - Cardiology</h2>
            <p className="text-white/90">City General Hospital</p>
          </div>
          
          <div className="p-6 bg-card">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-accent rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Currently Serving</div>
                <div className="text-5xl font-bold text-primary mb-1">{currentToken}</div>
                <div className="text-xs text-muted-foreground">Token Number</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Your Token</div>
                <div className="text-5xl font-bold text-foreground mb-1">{yourToken}</div>
                <Badge variant="outline" className="mt-2">
                  {yourToken - currentToken} people ahead
                </Badge>
              </div>
              
              <div className="text-center p-4 bg-accent rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Estimated Wait</div>
                <div className="flex items-baseline justify-center gap-2 mb-1">
                  <Clock className="h-6 w-6 text-primary" />
                  <span className="text-5xl font-bold text-foreground">{estimatedWait}</span>
                  <span className="text-xl text-muted-foreground">min</span>
                </div>
                <div className="text-xs text-muted-foreground">Approx. 3 min/patient</div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button className="flex-1" variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
              <Button className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Cancel Appointment
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">2</div>
                <div className="text-sm text-muted-foreground">Active Appointments</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">Total Visits</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Activity className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">Hospitals</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">21</div>
                <div className="text-sm text-muted-foreground">Avg Wait (min)</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
          <div className="space-y-4">
            {upcomingAppointments.map((apt) => (
              <Card key={apt.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg h-fit">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{apt.doctor}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{apt.department}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {apt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {apt.time}
                        </span>
                        <span className="flex items-center gap-1">
                          Token: <span className="font-semibold">#{apt.token}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={apt.status === "active" ? "default" : "secondary"}>
                      {apt.status}
                    </Badge>
                    <Button size="sm" variant="outline">Reschedule</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
