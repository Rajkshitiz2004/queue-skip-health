import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Search, Navigation, Hospital } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface Hospital {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

const Landing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    fetchHospitals();
    requestLocation();
  }, []);

  useEffect(() => {
    filterHospitals();
  }, [searchQuery, hospitals]);

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationPermission('granted');
          toast.success('Location detected successfully');
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationPermission('denied');
          if (error.code === error.PERMISSION_DENIED) {
            toast.error('Location access denied. Please enable location to find nearby hospitals.');
          }
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    // Haversine formula
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;

      const hospitalsWithDistance = (data || []).map(hospital => ({
        ...hospital,
        distance: userLocation
          ? calculateDistance(userLocation.lat, userLocation.lng, hospital.latitude, hospital.longitude)
          : undefined,
      }));

      // Sort by distance if location is available
      if (userLocation) {
        hospitalsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      setHospitals(hospitalsWithDistance);
      setFilteredHospitals(hospitalsWithDistance);
    } catch (error: any) {
      console.error('Error fetching hospitals:', error);
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const filterHospitals = () => {
    if (!searchQuery.trim()) {
      setFilteredHospitals(hospitals);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = hospitals.filter(hospital =>
      hospital.name.toLowerCase().includes(query) ||
      hospital.location.toLowerCase().includes(query) ||
      (hospital.address && hospital.address.toLowerCase().includes(query))
    );
    setFilteredHospitals(filtered);
  };

  // Re-calculate distances when user location changes
  useEffect(() => {
    if (userLocation && hospitals.length > 0) {
      const updated = hospitals.map(hospital => ({
        ...hospital,
        distance: calculateDistance(userLocation.lat, userLocation.lng, hospital.latitude, hospital.longitude),
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      setHospitals(updated);
      setFilteredHospitals(updated);
    }
  }, [userLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Hospital className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">SmartQueue</h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button onClick={() => navigate('/login')} variant="outline">
              {t('common.login')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-5xl font-bold mb-4 text-foreground">
          {t('landing.title')}
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          {t('landing.subtitle')}
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('landing.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Location Button */}
        {locationPermission !== 'granted' && (
          <Button
            onClick={requestLocation}
            size="lg"
            className="gap-2"
          >
            <Navigation className="h-5 w-5" />
            {t('landing.enableLocation')}
          </Button>
        )}

        {locationPermission === 'granted' && userLocation && (
          <Badge variant="secondary" className="text-sm py-2 px-4">
            <MapPin className="h-4 w-4 mr-2" />
            Location detected: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </Badge>
        )}
      </section>

      {/* Hospitals Grid */}
      <section className="container mx-auto px-4 pb-12">
        <h3 className="text-2xl font-bold mb-6 text-foreground">
          {userLocation ? t('landing.findNearby') : 'All Hospitals'}
        </h3>

        {filteredHospitals.length === 0 ? (
          <Card className="p-12 text-center">
            <Hospital className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">{t('landing.noHospitals')}</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => (
              <Card key={hospital.id} className="p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Hospital className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{hospital.name}</h4>
                      <p className="text-sm text-muted-foreground">{hospital.location}</p>
                    </div>
                  </div>
                </div>

                {hospital.distance && (
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {t('landing.distance', { distance: hospital.distance.toFixed(1) })}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {t('landing.currentWait', { minutes: Math.floor(Math.random() * 30) + 10 })}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => navigate('/login')}
                  >
                    {t('landing.getToken')}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/login')}
                  >
                    {t('landing.bookAppt')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Landing;
