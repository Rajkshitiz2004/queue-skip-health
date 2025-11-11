import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { CalendarIcon, MapPin, User, Stethoscope, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface Hospital {
  id: string;
  name: string;
  location: string;
}

interface Department {
  id: string;
  name: string;
  hospital_id: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department_id: string;
}

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [hospital, setHospital] = useState("");
  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [step, setStep] = useState(1);
  const [tokenNumber, setTokenNumber] = useState<number>(0);
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
  ];

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (hospital) {
      fetchDepartments(hospital);
    }
  }, [hospital]);

  useEffect(() => {
    if (department) {
      fetchDoctors(department);
    }
  }, [department]);

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setHospitals(data || []);
    } catch (error: any) {
      toast.error('Failed to load hospitals');
    }
  };

  const fetchDepartments = async (hospitalId: string) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('hospital_id', hospitalId)
        .order('name');
      
      if (error) throw error;
      setDepartments(data || []);
    } catch (error: any) {
      toast.error('Failed to load departments');
    }
  };

  const fetchDoctors = async (departmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('department_id', departmentId)
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      setDoctors(data || []);
    } catch (error: any) {
      toast.error('Failed to load doctors');
    }
  };

  const generateTokenNumber = async (doctorId: string, appointmentDate: string) => {
    // Get count of appointments for the same doctor on the same date
    const { count, error } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', doctorId)
      .eq('appointment_date', appointmentDate);

    if (error) {
      console.error('Error generating token:', error);
      return Math.floor(Math.random() * 100) + 1;
    }

    return (count || 0) + 1;
  };

  const handleBooking = async () => {
    if (!hospital || !department || !doctor || !date || !timeSlot || !user) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const appointmentDate = format(date, "yyyy-MM-dd");
      const token = await generateTokenNumber(doctor, appointmentDate);
      
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          doctor_id: doctor,
          hospital_id: hospital,
          department_id: department,
          appointment_date: appointmentDate,
          appointment_time: timeSlot,
          token_number: token,
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) throw error;

      setTokenNumber(token);
      toast.success("Appointment booked successfully!", {
        description: `Token #${token} assigned for ${format(date, "PPP")} at ${timeSlot}`,
      });
      
      setStep(5);
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const isStepComplete = (stepNum: number) => {
    switch (stepNum) {
      case 1: return !!hospital;
      case 2: return !!department;
      case 3: return !!doctor;
      case 4: return !!date && !!timeSlot;
      default: return false;
    }
  };

  const selectedHospital = hospitals.find(h => h.id === hospital);
  const selectedDepartment = departments.find(d => d.id === department);
  const selectedDoctor = doctors.find(d => d.id === doctor);

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">Book an Appointment</h1>
          <p className="text-muted-foreground">Schedule your visit in just a few steps</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-border -z-10">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
            
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  transition-all duration-300
                  ${step >= s 
                    ? 'bg-primary text-primary-foreground shadow-glow' 
                    : 'bg-muted text-muted-foreground'
                  }
                  ${isStepComplete(s) && step !== s ? 'bg-success' : ''}
                `}>
                  {isStepComplete(s) && step !== s ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    s
                  )}
                </div>
                <span className="text-xs mt-2 text-muted-foreground hidden sm:block">
                  {s === 1 && "Hospital"}
                  {s === 2 && "Department"}
                  {s === 3 && "Doctor"}
                  {s === 4 && "Schedule"}
                  {s === 5 && "Confirm"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="p-8 shadow-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Select Hospital</h2>
              </div>
              <div className="space-y-4">
                {hospitals.map((h) => (
                  <Card
                    key={h.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      hospital === h.id ? 'border-2 border-primary bg-accent' : ''
                    }`}
                    onClick={() => setHospital(h.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{h.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {h.location}
                        </p>
                      </div>
                      {hospital === h.id && (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Stethoscope className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Select Department</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {departments.map((dept) => (
                  <Card
                    key={dept.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      department === dept.id ? 'border-2 border-primary bg-accent' : ''
                    }`}
                    onClick={() => setDepartment(dept.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{dept.name}</span>
                      {department === dept.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <User className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Select Doctor</h2>
              </div>
              <div className="space-y-4">
                {doctors.map((doc) => (
                  <Card
                    key={doc.id}
                    className={`p-5 cursor-pointer transition-all hover:shadow-md ${
                      doctor === doc.id ? 'border-2 border-primary bg-accent' : ''
                    }`}
                    onClick={() => setDoctor(doc.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{doc.name}</h3>
                          <p className="text-sm text-muted-foreground">{doc.specialization}</p>
                        </div>
                      </div>
                      {doctor === doc.id && (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Pick Date & Time</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar 
                        mode="single" 
                        selected={date} 
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {date && (
                  <div>
                    <Label className="mb-2 block">Select Time Slot</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={timeSlot === slot ? "default" : "outline"}
                          onClick={() => setTimeSlot(slot)}
                          className="h-12"
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-12 w-12 text-success" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-success">Booking Confirmed!</h2>
              <p className="text-muted-foreground mb-8">Your appointment has been successfully scheduled</p>
              
              <Card className="p-6 bg-accent mb-6 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token Number:</span>
                    <span className="font-bold text-primary text-xl">#{tokenNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hospital:</span>
                    <span className="font-semibold">{selectedHospital?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-semibold">{selectedDepartment?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Doctor:</span>
                    <span className="font-semibold">{selectedDoctor?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time:</span>
                    <span className="font-semibold">
                      {date && format(date, "PPP")} at {timeSlot}
                    </span>
                  </div>
                </div>
              </Card>

              <Button className="w-full" onClick={() => navigate("/")}>
                Go to Dashboard
              </Button>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 5 && (
            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
              >
                Previous
              </Button>
              <Button
                className="flex-1"
                onClick={() => step === 4 ? handleBooking() : setStep(step + 1)}
                disabled={!isStepComplete(step) || loading}
              >
                {step === 4 ? (loading ? "Booking..." : "Confirm Booking") : "Next"}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BookAppointment;
