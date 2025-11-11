import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Users, Activity, Bell, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Appointment {
  id: string;
  doctor_id: string;
  hospital_id: string;
  department_id: string;
  appointment_date: string;
  appointment_time: string;
  token_number: number;
  status: string;
  estimated_wait_time: number | null;
  doctors: {
    name: string;
    specialization: string;
  };
  hospitals: {
    name: string;
  };
  departments: {
    name: string;
  };
}

interface QueueStatus {
  id: string;
  doctor_id: string;
  current_token: number;
  last_updated: string;
  is_active: boolean;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  // Subscribe to real-time queue updates
  useEffect(() => {
    if (!activeAppointment) return;

    const channel = supabase
      .channel('queue-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'queue_status',
          filter: `doctor_id=eq.${activeAppointment.doctor_id}`,
        },
        (payload) => {
          console.log('Queue updated:', payload);
          setQueueStatus(payload.new as QueueStatus);
          
          const tokensAhead = activeAppointment.token_number - (payload.new as QueueStatus).current_token;
          if (tokensAhead <= 3 && tokensAhead > 0) {
            toast.info(`Your turn is approaching! ${tokensAhead} tokens ahead.`);
          }
        }
      )
      .subscribe();

    // Initial fetch
    fetchQueueStatus(activeAppointment.doctor_id);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeAppointment]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctors (name, specialization),
          hospitals (name),
          departments (name)
        `)
        .eq('patient_id', user?.id)
        .order('appointment_date', { ascending: true })
        .limit(5);

      if (error) throw error;

      setAppointments(data || []);
      
      // Set the first scheduled appointment as active
      const scheduled = data?.find(apt => apt.status === 'scheduled');
      if (scheduled) {
        setActiveAppointment(scheduled);
      }
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchQueueStatus = async (doctorId: string) => {
    try {
      const { data, error } = await supabase
        .from('queue_status')
        .select('*')
        .eq('doctor_id', doctorId)
        .single();

      if (error) throw error;
      setQueueStatus(data);
    } catch (error: any) {
      console.error('Error fetching queue status:', error);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;
      
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error: any) {
      toast.error('Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  const tokensAhead = activeAppointment && queueStatus 
    ? activeAppointment.token_number - queueStatus.current_token 
    : 0;
  
  const estimatedWait = tokensAhead > 0 ? tokensAhead * 3 : 0; // 3 min per patient

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome back, {user?.user_metadata?.full_name || 'Patient'}
            </h1>
            <p className="text-muted-foreground">Track your appointments and queue status in real-time</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Live Queue Status - Featured Card */}
        {activeAppointment && queueStatus ? (
          <Card className="mb-8 overflow-hidden border-2 border-primary/20 shadow-glow animate-slide-up">
            <div className="gradient-primary p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5" />
                <span className="font-semibold">LIVE QUEUE STATUS</span>
              </div>
              <h2 className="text-3xl font-bold mb-1">
                {activeAppointment.doctors.name} - {activeAppointment.departments.name}
              </h2>
              <p className="text-white/90">{activeAppointment.hospitals.name}</p>
            </div>
            
            <div className="p-6 bg-card">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-accent rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Currently Serving</div>
                  <div className="text-5xl font-bold text-primary mb-1">{queueStatus.current_token}</div>
                  <div className="text-xs text-muted-foreground">Token Number</div>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Your Token</div>
                  <div className="text-5xl font-bold text-foreground mb-1">{activeAppointment.token_number}</div>
                  <Badge variant="outline" className="mt-2">
                    {tokensAhead > 0 ? `${tokensAhead} people ahead` : 'Your turn!'}
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
                <Button className="flex-1" variant="outline" onClick={() => navigate('/book')}>
                  <Bell className="h-4 w-4 mr-2" />
                  Book Another Appointment
                </Button>
                <Button 
                  className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => handleCancelAppointment(activeAppointment.id)}
                >
                  Cancel Appointment
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="mb-8 p-8 text-center animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">No Active Appointments</h2>
            <p className="text-muted-foreground mb-6">Book an appointment to start tracking your queue status</p>
            <Button onClick={() => navigate('/book')}>
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'scheduled').length}
                </div>
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
                <div className="text-2xl font-bold">{appointments.length}</div>
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
                <div className="text-2xl font-bold">
                  {new Set(appointments.map(a => a.hospital_id)).size}
                </div>
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
                <div className="text-2xl font-bold">{estimatedWait || '--'}</div>
                <div className="text-sm text-muted-foreground">Avg Wait (min)</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        {appointments.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-2xl font-bold mb-4">Your Appointments</h2>
            <div className="space-y-4">
              {appointments.map((apt) => (
                <Card key={apt.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg h-fit">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{apt.doctors.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {apt.departments.name} • {apt.hospitals.name}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(apt.appointment_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {apt.appointment_time}
                          </span>
                          <span className="flex items-center gap-1">
                            Token: <span className="font-semibold">#{apt.token_number}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge 
                        variant={apt.status === "scheduled" ? "default" : 
                                apt.status === "completed" ? "secondary" : 
                                "destructive"}
                      >
                        {apt.status}
                      </Badge>
                      {apt.status === 'scheduled' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCancelAppointment(apt.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
