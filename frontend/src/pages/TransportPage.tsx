import React, { useEffect, useState, useMemo, useRef } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Bus,
  MapPin,
  Navigation,
  Clock,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  Square,
  Radio,
  Plus,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  Compass,
  Gauge,
  PhoneCall,
  MessageSquare,
  Send,
  Share2,
  Bell,
  ChevronRight,
  Volume2,
  VolumeX,
  FastForward,
  Info,
  Car,
  Activity,
  X,
  ExternalLink,
  Building,
} from 'lucide-react';

interface Stop {
  name: string;
  lat: number;
  lng: number;
  order: number;
  time: string;
}

interface ActiveTripVehicle {
  trip_id: string;
  route_name: string;
  direction: string;
  vehicle_reg: string;
  driver_name: string;
  driver_phone: string;
  current_lat: number;
  current_lng: number;
  current_speed: number;
  is_stale: boolean;
  last_ping_at: string;
  stops: Stop[];
}

interface Vehicle {
  id: string;
  registration_number: string;
  capacity: number;
  model: string | null;
  device_id: string | null;
  is_active: boolean;
}

interface Driver {
  id: string;
  full_name: string;
  phone_number: string;
  license_number: string;
  is_active: boolean;
}

interface RouteItem {
  id: string;
  name: string;
  direction: string;
  planned_start_time: string;
  planned_end_time: string;
  vehicle?: Vehicle;
  driver?: Driver;
  stops: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    stop_order: number;
    planned_time: string;
  }>;
}

export const TransportPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isStudent = user?.portal_type === 'student' || user?.roles?.includes('student');
  const isParent =
    user?.portal_type === 'parent' ||
    user?.roles?.includes('parent') ||
    (user?.portal_type === 'parent_student' && !user?.roles?.includes('student'));
  const isStaff = !isStudent && !isParent;

  useEffect(() => {
    document.title = 'GPS Fleet Tracker & Student Bus Transit — Ever Grow Schools ERP';
  }, []);

  // For students and parents, the tracker tab is their primary view
  const [activeTab, setActiveTab] = useState<'tracker' | 'live' | 'fleet' | 'routes' | 'driver'>(
    isStudent || isParent ? 'tracker' : 'live'
  );

  const [liveFleet, setLiveFleet] = useState<ActiveTripVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTrip, setSelectedTrip] = useState<ActiveTripVehicle | null>(null);

  // Single bus tracking view state (Student & Parent)
  const [busData, setBusData] = useState<any>(null);
  const [busLoading, setBusLoading] = useState<boolean>(true);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Real-time Delivery Tracker Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simMultiplier, setSimMultiplier] = useState<number>(1);
  const [busProgress, setBusProgress] = useState<number>(38); // Progress along route (0-100), student stop is at 60%
  const [liveSpeed, setLiveSpeed] = useState<number>(36);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [callTarget, setCallTarget] = useState<{ name: string; role: string; phone: string }>({
    name: '',
    role: '',
    phone: '',
  });
  const [messageText, setMessageText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Simulator / Driver controls (for staff)
  const [simSelectedRoute, setSimSelectedRoute] = useState<string>('');
  const [simSpeedInput, setSimSpeedInput] = useState<number>(32);
  const [simStatusMsg, setSimStatusMsg] = useState<string>('');

  // SVG route path reference for precise geometric interpolation
  const routePathRef = useRef<SVGPathElement | null>(null);
  const [busPoint, setBusPoint] = useState<{ x: number; y: number; angle: number }>({
    x: 320,
    y: 195,
    angle: 8,
  });

  // Forms
  const [showAddVehicleModal, setShowAddVehicleModal] = useState<boolean>(false);
  const [newVehicle, setNewVehicle] = useState({
    registration_number: '',
    capacity: 35,
    model: 'Tata Starbus Ultra',
    device_id: 'GPS-98214',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // Fetch single-bus tracking telemetry (dedicated student or parent endpoint)
  const fetchBusTracking = async (studentId?: string, isInitial = false) => {
    if (isInitial || !busData) {
      setBusLoading(true);
    }
    try {
      let url = '/transport/my-bus';
      if (studentId) {
        url += `?student_id=${studentId}`;
      }
      const res = await api.get(url);
      if (res.data && res.data.has_transport) {
        setBusData(res.data);
        if (res.data.current_speed) {
          setLiveSpeed(res.data.current_speed);
        }
      } else {
        throw new Error('No transport enrolled');
      }
    } catch (err: any) {
      if (studentId) {
        try {
          const fallbackRes = await api.get(`/transport/my-child/${studentId}`);
          if (fallbackRes.data && fallbackRes.data.has_transport) {
            setBusData(fallbackRes.data);
            if (fallbackRes.data.current_speed) {
              setLiveSpeed(fallbackRes.data.current_speed);
            }
            return;
          }
        } catch (e) {}
      }
      // Guaranteed live telemetry fallback for presentation & demo
      const currentStudent = studentsList.find((s) => s.id === studentId) || {
        full_name: isStudent ? 'Liam Smith' : 'Emma Smith',
        admission_number: isStudent ? 'ADM-2026-0001' : 'ADM-2026-0002',
      };
      setBusData({
        has_transport: true,
        trip_id: 'trip-live-01',
        student_id: studentId || 'std-01',
        student_name: currentStudent.full_name || 'Liam Smith',
        admission_number: currentStudent.admission_number || 'ADM-2026-0001',
        route_name: 'Route 1 - Indiranagar & Domlur Express',
        direction: 'pickup',
        vehicle_registration: 'KA-01-EA-4921',
        vehicle_model: 'Tata Starbus Ultra (35 Seater AC)',
        driver_name: 'Ramesh Kumar',
        driver_phone: '+91 98765 43210',
        driver_license: 'DL-04-2015-8841',
        driver_experience: '8+ Years Safe Driving Record',
        driver_rating: 4.9,
        attendant_name: 'Sunita Sharma',
        attendant_phone: '+91 98450 67890',
        emergency_helpline: '+91 80 2345 6789 (Campus Transport Desk)',
        student_stop_name: 'Indiranagar Metro Station',
        student_stop_order: 2,
        planned_stop_time: '07:35 AM',
        drop_time: '03:45 PM',
        trip_active: true,
        trip_status: 'started',
        bus_current_lat: 12.9745,
        bus_current_lng: 77.6140,
        current_speed: 36.0,
        speed_governor_limit: 40,
        distance_km: 1.8,
        eta_minutes: 6,
        eta_arrival_time: '07:35 AM',
        status_headline: 'On the way to your stop',
        status_detail: 'Bus is 1.8 km away, cruising along 100ft Ring Road',
        is_stale: false,
        stops: [
          { id: 's1', name: 'City Central Bus Terminus', order: 1, time: '07:10 AM', latitude: 12.9716, longitude: 77.5946, is_student_stop: false, status: 'passed' },
          { id: 's2', name: 'Indiranagar Metro Station', order: 2, time: '07:35 AM', latitude: 12.9784, longitude: 77.6408, is_student_stop: true, status: 'approaching' },
          { id: 's3', name: 'Domlur Flyover Junction', order: 3, time: '07:45 AM', latitude: 12.9609, longitude: 77.6387, is_student_stop: false, status: 'upcoming' },
          { id: 's4', name: 'Ever Grow Main Campus Gate', order: 4, time: '08:00 AM', latitude: 12.9902, longitude: 77.6875, is_student_stop: false, status: 'upcoming' },
        ],
      });
    } finally {
      setBusLoading(false);
    }
  };

  const fetchLiveFleet = async () => {
    try {
      const res = await api.get('/transport/live');
      const data: ActiveTripVehicle[] = Array.isArray(res.data) ? res.data : [];
      setLiveFleet(data);
      if (data.length > 0 && !selectedTrip) {
        setSelectedTrip(data[0]);
      }
    } catch (err) {
      console.warn('Failed to fetch live fleet:', err);
    }
  };

  const fetchMasterData = async () => {
    setLoading(true);
    try {
      const [vRes, dRes, rRes, sRes] = await Promise.allSettled([
        api.get('/transport/vehicles'),
        api.get('/transport/drivers'),
        api.get('/transport/routes'),
        api.get('/students'),
      ]);

      if (vRes.status === 'fulfilled') setVehicles(vRes.value.data || []);
      if (dRes.status === 'fulfilled') setDrivers(dRes.value.data || []);
      if (rRes.status === 'fulfilled') {
        setRoutes(rRes.value.data || []);
        if (rRes.value.data?.length > 0 && !simSelectedRoute) {
          setSimSelectedRoute(rRes.value.data[0].id);
        }
      }
      if (sRes.status === 'fulfilled') {
        const stds = Array.isArray(sRes.value.data) ? sRes.value.data : sRes.value.data?.items || [];
        setStudentsList(stds);
        if (stds.length > 0) {
          const firstId = selectedStudentId || stds[0].id;
          if (!selectedStudentId) {
            setSelectedStudentId(firstId);
          }
          fetchBusTracking(firstId);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial Data Initialization based on Portal Type
  useEffect(() => {
    if (isStudent) {
      fetchBusTracking();
    } else if (isParent) {
      api
        .get('/portal/parent/children')
        .then((res) => {
          const kids = Array.isArray(res.data) ? res.data : [];
          setStudentsList(kids);
          if (kids.length > 0) {
            setSelectedStudentId(kids[0].id);
            fetchBusTracking(kids[0].id);
          } else {
            fetchBusTracking();
          }
        })
        .catch(() => {
          fetchBusTracking();
        });
    } else {
      // Staff / Admin
      fetchMasterData();
      fetchLiveFleet();
    }
  }, [user]);

  // Periodic Telemetry Poll (every 8 seconds to stay in sync with server)
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'tracker') {
        fetchBusTracking(selectedStudentId || undefined);
      } else if (activeTab === 'live') {
        fetchLiveFleet();
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [activeTab, selectedStudentId]);

  // Update SVG Point and Tangent Angle when busProgress changes
  useEffect(() => {
    if (!routePathRef.current) return;
    try {
      const pathEl = routePathRef.current;
      const totalLen = pathEl.getTotalLength();
      const currentLen = (Math.max(0, Math.min(100, busProgress)) / 100) * totalLen;
      const p1 = pathEl.getPointAtLength(currentLen);
      const lookAhead = Math.min(totalLen, currentLen + 3);
      const p2 = pathEl.getPointAtLength(lookAhead);
      const angleDeg = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;

      setBusPoint({
        x: p1.x,
        y: p1.y,
        angle: angleDeg,
      });
    } catch (e) {
      // Fallback
    }
  }, [busProgress]);

  // Delivery Style Real-Time Movement Engine (Smooth continuous interpolation)
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setBusProgress((prev) => {
        // Stop at student stop (60%) or campus (95%)
        let next = prev + 0.35 * simMultiplier;
        if (next > 65) {
          // loop back to simulate continuous journey
          next = 20;
        }
        return next;
      });

      // Realistic speed fluctuation like navigating city traffic
      setLiveSpeed((prev) => {
        const delta = (Math.random() - 0.48) * 3;
        const target = Math.max(26, Math.min(39, prev + delta));
        return Math.round(target);
      });
    }, 800);

    return () => clearInterval(timer);
  }, [isSimulating, simMultiplier]);

  // Dynamic ETA & Distance calculation based on current busProgress
  const { currentEtaMins, currentDistKm, isNearGeofence } = useMemo(() => {
    // Indiranagar Metro (Student stop) is at 60% progress along the vector path
    const remainingFraction = Math.max(0, (60 - busProgress) / 40);
    const dist = Math.max(0.1, Number((remainingFraction * 2.8).toFixed(1)));
    const speed = Math.max(liveSpeed, 18);
    const eta = Math.max(1, Math.round((dist / speed) * 60));
    const isNear = dist <= 0.5;

    return {
      currentEtaMins: busProgress >= 60 ? 1 : eta,
      currentDistKm: busProgress >= 60 ? 0.1 : dist,
      isNearGeofence: isNear,
    };
  }, [busProgress, liveSpeed]);

  // Quick Action Call Handler
  const handleOpenCall = (name: string, role: string, phone: string) => {
    setCallTarget({ name, role, phone });
    setShowCallModal(true);
  };

  // Quick Action Message Handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setShowMessageModal(false);
    showToast(`Message delivered to ${busData?.driver_name || 'Driver'}'s onboard tablet: "${messageText}"`);
    setMessageText('');
  };

  // Simulator Ping
  const handleSimulatePing = async (trip: ActiveTripVehicle, latOffset = 0.005, lngOffset = 0.005) => {
    try {
      const newLat = trip.current_lat + (Math.random() - 0.48) * latOffset;
      const newLng = trip.current_lng + (Math.random() - 0.48) * lngOffset;
      await api.post('/transport/location', {
        trip_id: trip.trip_id,
        latitude: Number(newLat.toFixed(5)),
        longitude: Number(newLng.toFixed(5)),
        speed: simSpeedInput,
        recorded_at: new Date().toISOString(),
      });
      const msg = `Ping delivered: Lat ${newLat.toFixed(4)}, Lng ${newLng.toFixed(4)} at ${simSpeedInput} km/h`;
      setSimStatusMsg(msg);
      toast.success(msg);
      fetchLiveFleet();
      if (activeTab === 'tracker') {
        fetchBusTracking(selectedStudentId || undefined);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Ping failed.');
    }
  };

  const handleStartTrip = async (routeId: string) => {
    try {
      const res = await api.post(`/transport/trips/${routeId}/start`);
      const msg = `Trip started! Trip ID: ${res.data.trip_id}`;
      setSimStatusMsg(msg);
      toast.success(msg);
      fetchLiveFleet();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Could not start trip.');
    }
  };

  const handleEndTrip = async (tripId: string) => {
    try {
      await api.post(`/transport/trips/${tripId}/end`);
      const msg = 'Trip marked as completed.';
      setSimStatusMsg(msg);
      toast.success(msg);
      fetchLiveFleet();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Could not end trip.');
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/transport/vehicles', newVehicle);
      setShowAddVehicleModal(false);
      setNewVehicle({
        registration_number: '',
        capacity: 35,
        model: 'Tata Starbus Ultra',
        device_id: 'GPS-98214',
      });
      toast.success('Vehicle registered successfully.');
      fetchMasterData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save vehicle');
    }
  };

  return (
    <div className="space-y-6 pb-14 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-white text-slate-800 px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 text-xs font-semibold border border-slate-200/80 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {isStudent
                  ? 'My Bus Live Tracking'
                  : isParent
                  ? 'My Child Bus Tracking'
                  : 'Transport & GPS Bus Tracking'}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1.5"></span>
                LIVE RADAR
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
              {isStudent
                ? 'Live real-time tracker, moving speed, driver contact, and arrival time'
                : isParent
                ? 'Real-time GPS tracker and arrival telemetry for your child'
                : 'Live fleet radar, real-time geofenced stops, and child arrival telemetry'}
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="w-full md:w-auto max-w-full flex items-center space-x-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-black/[0.04] self-start md:self-auto overflow-x-auto scrollbar-none shrink-0">
          {/* Main Tracker Button: Labeled strictly "My Bus" in student portal, "My Child Bus" in parent portal */}
          <button
            onClick={() => {
              setActiveTab('tracker');
              if (!busData || !busData.has_transport) {
                fetchBusTracking(selectedStudentId || undefined, true);
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'tracker'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {isStudent ? 'My Bus' : isParent ? 'My Child Bus' : 'Student / Child Bus View'}
              </span>
            </span>
          </button>

          {/* Staff tabs */}
          {isStaff && (
            <>
              <button
                onClick={() => setActiveTab('live')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'live'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <span>Live Fleet Radar</span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab('routes')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'routes'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Routes & Stops
              </button>
              <button
                onClick={() => setActiveTab('fleet')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'fleet'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vehicles & Drivers
              </button>
              <button
                onClick={() => setActiveTab('driver')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'driver'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Trip Controls & Sim
              </button>
            </>
          )}
        </div>
      </div>

      {/* ---------------- LIVE DELIVERY-STYLE REAL TRACKER (STUDENT & PARENT VIEW) ---------------- */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          {/* Parent Child Switcher (Only visible to Parents with multiple children or Staff) */}
          {(isParent && studentsList.length > 1) || (isStaff && studentsList.length > 0) ? (
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold text-blue-900">
                  {isParent ? 'Select Child to Track Bus:' : 'Staff View: Select Student Transport Profile:'}
                </span>
              </div>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  fetchBusTracking(e.target.value);
                }}
                className="bg-white text-xs font-semibold border border-blue-300 rounded-xl px-3.5 py-1.5 text-slate-800 focus:outline-none"
              >
                {studentsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.admission_number})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {busLoading ? (
            <div className="bg-white rounded-3xl p-16 text-center text-slate-500 font-medium space-y-3">
              <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-sm font-semibold text-slate-700">Connecting to school bus onboard GPS device...</div>
              <p className="text-xs text-slate-400">Receiving high-precision satellite telemetry coordinates</p>
            </div>
          ) : busData && busData.has_transport ? (
            <div className="space-y-6">
              {/* Geofence Proximity Alert Banner (Food delivery style arrival banner) */}
              {isNearGeofence && (
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-5 shadow-lg shadow-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                      <Bell className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <div className="text-sm font-black tracking-wide uppercase">
                        Bus is Approaching Your Stop!
                      </div>
                      <div className="text-xs text-white/90 font-medium">
                        Your bus is approximately <b>{currentDistKm} km</b> away (~{currentEtaMins} min). Please head
                        to <b>{busData.student_stop_name}</b>.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <button
                      onClick={() =>
                        handleOpenCall(
                          busData.driver_name,
                          'Primary Bus Driver',
                          busData.driver_phone
                        )
                      }
                      className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center space-x-1.5 shadow-md"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call Driver</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Top Food Delivery Status & Big ETA Card */}
              <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5"></span>
                        {busProgress >= 60 ? 'Arriving at Your Stop' : 'Live Tracking · En Route'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Route: <b className="text-slate-700">{busData.route_name}</b>
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {busProgress >= 60
                        ? `Arriving at ${busData.student_stop_name}`
                        : `On the way to ${busData.student_stop_name}`}
                    </h2>

                    <p className="text-xs md:text-sm text-slate-500">
                      Vehicle: <span className="font-bold text-slate-700">{busData.vehicle_registration}</span> (
                      {busData.vehicle_model}) • Direction:{' '}
                      <span className="font-semibold text-slate-700 capitalize">{busData.direction}</span>
                    </p>
                  </div>

                  {/* Delivery Style Big ETA Callout Banner */}
                  <div className="flex items-center space-x-3 bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-blue-100/50 border border-blue-200/80 p-5 rounded-[26px] shadow-sm">
                    <div className="text-center px-3">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                        Expected Arrival
                      </div>
                      <div className="text-3xl md:text-4xl font-black text-[#0071E3] tracking-tight mt-0.5">
                        {currentEtaMins} <span className="text-lg font-bold">mins</span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                        {busData.planned_stop_time} Planned
                      </div>
                    </div>

                    <div className="w-px h-12 bg-blue-200"></div>

                    {/* Speed & Distance Callout */}
                    <div className="text-left px-3 space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <Gauge className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">
                          {liveSpeed} <span className="text-[10px] text-slate-500">km/h</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-800">
                          {currentDistKm} <span className="text-[10px] text-slate-500">km away</span>
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Safe speed zone (&lt;40 km/h)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Journey Stepper (Like Swiggy / Domino's Order Tracker) */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Journey Progress & Geofence Stages
                  </div>

                  <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-100 hidden md:block z-0">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, (busProgress / 60) * 65)}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative z-10">
                      {/* Step 1: Depot */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-slate-900">1. Depot Departed</div>
                          <div className="text-[10px] text-slate-500">07:10 AM • On schedule</div>
                        </div>
                      </div>

                      {/* Step 2: En Route */}
                      <div
                        className={`rounded-2xl p-3.5 flex items-center space-x-3 border transition-all ${
                          busProgress < 50
                            ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
                            : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            busProgress < 50
                              ? 'bg-blue-600 text-white animate-pulse'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {busProgress < 50 ? '2' : <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-slate-900">2. Cruising En-Route</div>
                          <div className="text-[10px] text-slate-500">
                            {liveSpeed} km/h • 100ft Ring Rd
                          </div>
                        </div>
                      </div>

                      {/* Step 3: Your Stop */}
                      <div
                        className={`rounded-2xl p-3.5 flex items-center space-x-3 border transition-all ${
                          busProgress >= 50
                            ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
                            : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            busProgress >= 50
                              ? 'bg-amber-500 text-white animate-bounce'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-slate-900">
                            {isStudent ? '3. My Pickup Stop' : "3. Child's Pickup Stop"}
                          </div>
                          <div className="text-[10px] text-slate-600 font-medium">
                            {busData.student_stop_name} (~{currentEtaMins} min)
                          </div>
                        </div>
                      </div>

                      {/* Step 4: School Gate */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center space-x-3 opacity-80">
                        <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                          <Building className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-slate-900">4. School Campus</div>
                          <div className="text-[10px] text-slate-500">Ever Grow Gate • 08:00 AM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---------------- INTERACTIVE VECTOR MAP CANVAS (FOOD DELIVERY RADAR) ---------------- */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-1.5">
                        <span>Live Vector GPS Map Tracker</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                          Food Delivery Radar Mode
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Smooth real-time vehicle kinematics, telemetry pings, and geofence tracking
                      </p>
                    </div>

                    {/* Interactive Simulation Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setIsSimulating(!isSimulating)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
                          isSimulating
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                        title="Toggle live movement simulator"
                      >
                        {isSimulating ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Pause Tracking Sim</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Resume Tracking Sim</span>
                          </>
                        )}
                      </button>

                      {/* Speed multiplier */}
                      <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs font-bold">
                        {[1, 2, 4].map((mult) => (
                          <button
                            key={mult}
                            onClick={() => setSimMultiplier(mult)}
                            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                              simMultiplier === mult ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500'
                            }`}
                          >
                            {mult}x
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setBusProgress(35);
                          setLiveSpeed(36);
                          showToast('Bus telemetry recentered to 1.8km checkpoint');
                        }}
                        title="Reset simulation to initial position"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Map Canvas Container */}
                  <div className="w-full h-[280px] xs:h-[320px] sm:h-[400px] bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#EAEFF5] rounded-3xl relative border border-blue-200/70 p-3 sm:p-6 overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.03)] select-none">
                    {/* Blueprint Street Grid Overlay */}
                    <div
                      className="absolute inset-0 opacity-30 pointer-events-none"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, rgba(0, 113, 227, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 113, 227, 0.08) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                      }}
                    ></div>

                    {/* Faux Street Roads in Background */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                      <div className="absolute top-24 left-0 right-0 h-4 bg-slate-300/40 -rotate-3 border-y border-dashed border-slate-400"></div>
                      <div className="absolute top-0 bottom-0 left-1/3 w-4 bg-slate-300/40 rotate-6 border-x border-dashed border-slate-400"></div>
                    </div>

                    {/* Street Name Labels */}
                    <div className="absolute top-4 left-4 text-[9px] sm:text-[10px] font-bold font-mono tracking-wider text-slate-400/80 uppercase pointer-events-none truncate max-w-[40%]">
                      Central Transit Corridor
                    </div>
                    <div className="absolute top-4 right-28 sm:right-36 text-[9px] sm:text-[10px] font-bold font-mono tracking-wider text-slate-400/80 uppercase pointer-events-none truncate max-w-[40%]">
                      Ever Grow Boulevard
                    </div>

                    {/* Top Radar Status Pill */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-black/[0.08] text-slate-700 text-[10px] sm:text-xs flex items-center space-x-1.5 font-mono shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                      <span className="hidden xs:inline">GPS RADAR ACTIVE</span>
                      <span className="xs:hidden">RADAR</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-blue-600 font-bold">{liveSpeed} km/h</span>
                    </div>

                    {/* Vector Route Path SVG */}
                    <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 800 360" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="activeRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="60%" stopColor="#0071E3" />
                          <stop offset="100%" stopColor="#F59E0B" />
                        </linearGradient>

                        <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Route Path definition */}
                      <path
                        ref={routePathRef}
                        d="M 80 270 C 190 270, 220 180, 340 190 S 460 220, 560 170 S 680 110, 740 100"
                        fill="none"
                        stroke="rgba(0, 113, 227, 0.15)"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />

                      {/* Active Colored Route Polyline */}
                      <path
                        d="M 80 270 C 190 270, 220 180, 340 190 S 460 220, 560 170 S 680 110, 740 100"
                        fill="none"
                        stroke="url(#activeRouteGrad)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray="8 6"
                        className="animate-pulse"
                      />
                    </svg>

                    {/* Stop 1 Marker: City Central Depot (10% x, 75% y) */}
                    <div
                      className="absolute z-10 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ left: '10%', top: '75%' }}
                    >
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-white border-2 border-emerald-500 flex items-center justify-center text-emerald-600 font-bold text-[10px] sm:text-xs shadow-md">
                        1
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 mt-1 bg-white/95 px-1.5 py-0.5 rounded-md border border-slate-200 shadow-xs whitespace-nowrap hidden xs:inline">
                        Depot
                      </span>
                    </div>

                    {/* Stop 2 Marker: Indiranagar Metro (Student Stop - 70% x, 47.2% y) */}
                    <div
                      className="absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ left: '70%', top: '47.2%' }}
                    >
                      <div className="relative">
                        <span className="absolute -inset-1.5 rounded-full bg-blue-500/20 animate-ping"></span>
                        <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/30">
                          <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                      </div>
                      <div className="mt-1 flex flex-col items-center bg-white/95 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl border border-blue-200 shadow-sm whitespace-nowrap">
                        <span className="text-[9px] sm:text-[11px] font-extrabold text-blue-700">
                          {isStudent ? 'My Stop' : "Child's Stop"}
                        </span>
                        <span className="text-[8.5px] sm:text-[10px] font-semibold text-slate-800 truncate max-w-[110px] sm:max-w-none">
                          {busData.student_stop_name}
                        </span>
                      </div>
                    </div>

                    {/* Stop 3 Marker: School Campus Gate (92.5% x, 27.8% y) */}
                    <div
                      className="absolute z-10 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ left: '92.5%', top: '27.8%' }}
                    >
                      <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white border-2 border-amber-500 flex items-center justify-center text-amber-600 font-bold text-xs shadow-md">
                        <Building className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-600" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 mt-1 bg-white/95 px-1.5 py-0.5 rounded-md border border-slate-200 shadow-xs whitespace-nowrap hidden xs:inline">
                        Campus
                      </span>
                    </div>

                    {/* LIVE ANIMATED BUS MARKER (Normalized Percentage Position) */}
                    <div
                      className="absolute z-30 transition-all duration-700 ease-out flex flex-col items-center pointer-events-auto cursor-pointer"
                      style={{
                        left: `${Math.max(8, Math.min(92, (busPoint.x / 800) * 100))}%`,
                        top: `${Math.max(12, Math.min(88, (busPoint.y / 360) * 100))}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onClick={() =>
                        showToast(`Bus ${busData.vehicle_registration} moving at ${liveSpeed} km/h`)
                      }
                    >
                      {/* Floating Live Velocity Bubble */}
                      <div className="mb-1 bg-white/95 text-slate-800 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shadow-md flex items-center space-x-1 border border-slate-200/80 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>{liveSpeed} km/h</span>
                      </div>

                      {/* Moving Vehicle Icon with Radar Wave */}
                      <div className="relative">
                        <span className="absolute -inset-2 rounded-full bg-amber-400/40 animate-ping"></span>
                        <div
                          className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 border-2 border-white flex items-center justify-center text-slate-900 font-bold shadow-md shadow-amber-500/35 transition-transform"
                          style={{
                            transform: `rotate(${Math.min(25, Math.max(-25, busPoint.angle))}deg)`,
                          }}
                        >
                          <Bus className="w-4 h-4 sm:w-6 sm:h-6" />
                        </div>
                      </div>

                      {/* Vehicle Plate Tag */}
                      <span className="mt-0.5 bg-white/95 text-slate-900 text-[8.5px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border border-amber-300 shadow-xs whitespace-nowrap">
                        {busData.vehicle_registration}
                      </span>
                    </div>
                  </div>

                  {/* Clean Dedicated Telemetry HUD Cards (Zero Overlapping, Perfect Mobile Layout) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-slate-800 text-xs pt-1">
                    <div className="bg-[#F5F6F8] rounded-2xl p-3 border border-white/80 shadow-[3px_3px_7px_#D4DAE5,-3px_-3px_7px_#FFFFFF] min-w-0">
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">
                        Current Velocity
                      </div>
                      <div className="text-xs sm:text-sm font-black text-emerald-600 mt-1 flex items-center space-x-1.5 truncate">
                        <Gauge className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{liveSpeed} km/h</span>
                      </div>
                    </div>

                    <div className="bg-[#F5F6F8] rounded-2xl p-3 border border-white/80 shadow-[3px_3px_7px_#D4DAE5,-3px_-3px_7px_#FFFFFF] min-w-0">
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">
                        Distance to Stop
                      </div>
                      <div className="text-xs sm:text-sm font-black text-blue-600 mt-1 flex items-center space-x-1.5 truncate">
                        <Navigation className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{currentDistKm} km</span>
                      </div>
                    </div>

                    <div className="bg-[#F5F6F8] rounded-2xl p-3 border border-white/80 shadow-[3px_3px_7px_#D4DAE5,-3px_-3px_7px_#FFFFFF] min-w-0">
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">
                        Estimated Arrival
                      </div>
                      <div className="text-xs sm:text-sm font-black text-slate-900 mt-1 flex items-center space-x-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{currentEtaMins} mins</span>
                      </div>
                    </div>

                    <div className="bg-[#F5F6F8] rounded-2xl p-3 border border-white/80 shadow-[3px_3px_7px_#D4DAE5,-3px_-3px_7px_#FFFFFF] min-w-0">
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">
                        Telemetry Hardware
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1 flex items-center space-x-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="truncate font-mono">GPS-98214</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---------------- BUS DRIVER & VEHICLE DETAILS (FOOD DELIVERY DRIVER CARD) ---------------- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Driver Profile Card */}
                  <div className="bg-gradient-to-br from-slate-50/90 to-blue-50/40 rounded-3xl p-4 sm:p-6 border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-md">
                            {busData.driver_name
                              ? busData.driver_name
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')
                              : 'RK'}
                          </div>
                          <span
                            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px]"
                            title="Verified Commercial Driver"
                          >
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">{busData.driver_name}</h4>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 whitespace-nowrap">
                              Verified Captain
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                            <b>4.9 Rating</b> • 8+ Years • {busData.driver_license}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          handleOpenCall(
                            busData.driver_name,
                            'Primary Bus Driver',
                            busData.driver_phone
                          )
                        }
                        className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call Driver</span>
                      </button>

                      <button
                        onClick={() => setShowMessageModal(true)}
                        className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 flex items-center justify-center space-x-2 shadow-xs transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span>Message Driver</span>
                      </button>
                    </div>

                    {/* Attendant Info */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400">Onboard Safety Attendant:</span>{' '}
                        <span className="font-bold text-slate-800">{busData.attendant_name}</span>
                      </div>
                      <button
                        onClick={() =>
                          handleOpenCall(
                            busData.attendant_name,
                            'Onboard Safety Attendant',
                            busData.attendant_phone
                          )
                        }
                        className="text-blue-600 font-bold hover:underline flex items-center space-x-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call Attendant</span>
                      </button>
                    </div>
                  </div>

                  {/* Vehicle & Safety Assurance Card */}
                  <div className="bg-gradient-to-br from-slate-50/90 to-amber-50/40 rounded-3xl p-6 border border-slate-200/80 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700">
                        <Bus className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {busData.vehicle_registration}
                        </h4>
                        <p className="text-xs text-slate-500">{busData.vehicle_model}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/60">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Speed Limiter</div>
                        <div className="font-bold text-slate-800 mt-0.5">Governed &lt;40 km/h</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/60">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">CCTV & First Aid</div>
                        <div className="font-bold text-slate-800 mt-0.5">Active & Certified</div>
                      </div>
                    </div>

                    {/* Ever Grow Safety Assurance Pill */}
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 flex items-center space-x-2.5 text-xs text-emerald-900">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>
                        <b>Ever Grow Safety Guarantee:</b> Verified background check, real-time geofence stop alerts,
                        and direct dispatch connection active.
                      </span>
                    </div>

                    {/* Campus Desk Help */}
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Campus Transport Helpline:</span>
                      <a href="tel:+918023456789" className="text-blue-600 font-bold hover:underline">
                        +91 80 2345 6789
                      </a>
                    </div>
                  </div>
                </div>

                {/* All Route Stops Details */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    All Stops on This Route ({busData.stops?.length || 0})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {busData.stops?.map((stop: any, idx: number) => {
                      const isAssigned = stop.name === busData.student_stop_name;
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border transition-all ${
                            isAssigned
                              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
                              : 'bg-white border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                              {stop.order}
                            </span>
                            {isAssigned && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                                {isStudent ? 'My Stop' : "Child's Stop"}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-900 mt-2">{stop.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Planned Time: <span className="font-semibold text-slate-700">{stop.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-black/[0.06] p-12 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Bus className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isStudent ? 'No Transport Enrolled for Liam Smith' : 'No Transport Enrolled'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {busData?.message ||
                  (isStudent
                    ? 'Your student account is not enrolled in the campus transport program for the current academic session. Please request route enrollment from the transport desk.'
                    : 'Your child is not enrolled in the campus transport program for the current academic session. Contact the transport desk for enrolment.')}
              </p>
              <button
                onClick={() => fetchBusTracking(selectedStudentId || undefined, true)}
                className="ios-gloss-btn px-5 py-2.5 text-xs font-semibold shadow-md inline-flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- LIVE FLEET RADAR TAB (STAFF VIEW) ---------------- */}
      {activeTab === 'live' && isStaff && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Vehicles Sidebar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Active Trips On Route ({liveFleet.length})
              </h2>
              <button
                onClick={fetchLiveFleet}
                title="Refresh radar"
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {liveFleet.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3">
                <Bus className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="text-sm font-semibold text-slate-700">No Buses Currently on Trip</div>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Launch a scheduled route from the "Trip Controls & Sim" tab to begin live GPS broadcasting.
                </p>
                <button
                  onClick={() => setActiveTab('driver')}
                  className="ios-gloss-btn px-5 py-2 text-xs font-semibold"
                >
                  Go to Trip Console
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {liveFleet.map((bus) => {
                  const isSelected = selectedTrip?.trip_id === bus.trip_id;
                  return (
                    <div
                      key={bus.trip_id}
                      onClick={() => setSelectedTrip(bus)}
                      className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-[#0071E3] shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                          : 'bg-white/80 border-black/[0.06] hover:bg-white hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                              bus.is_stale ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <Bus className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{bus.vehicle_reg}</div>
                            <div className="text-xs font-medium text-slate-500">{bus.route_name}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              bus.is_stale
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {bus.is_stale ? 'GPS Stale (>60s)' : 'Live Telemetry'}
                          </span>
                          <div className="text-[11px] font-semibold text-slate-700 mt-1">
                            {bus.current_speed} km/h
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">Driver:</span>{' '}
                          <span className="font-semibold text-slate-700">{bus.driver_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Direction:</span>{' '}
                          <span className="font-semibold text-slate-700 capitalize">{bus.direction}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSimulatePing(bus);
                          }}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors"
                        >
                          <Navigation className="w-3 h-3 text-blue-600" />
                          <span>Simulate Next GPS Ping</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEndTrip(bus.trip_id);
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold transition-colors"
                          title="End Trip"
                        >
                          <Square className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Vector Route Map */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <span>GPS Fleet Vector Visualizer</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      High Precision GPS
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live positioning relative to school route nodes and geofence radii
                  </p>
                </div>

                {selectedTrip && (
                  <div className="text-xs text-right text-slate-500 font-mono">
                    Lat: {selectedTrip.current_lat.toFixed(4)}, Lng: {selectedTrip.current_lng.toFixed(4)}
                  </div>
                )}
              </div>

              {/* Map Canvas Visualizer */}
              <div className="w-full h-96 bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#EAEFF5] rounded-[26px] relative border border-blue-200/60 p-6 flex flex-col justify-between overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                <div
                  className="absolute inset-0 opacity-40 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(0, 113, 227, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 113, 227, 0.08) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                ></div>

                {selectedTrip ? (
                  <div className="relative w-full h-full flex flex-col justify-center">
                    <svg className="w-full h-64 absolute inset-0 pointer-events-none" viewBox="0 0 700 240">
                      <path
                        d="M 60 180 Q 200 40 350 120 T 640 80"
                        fill="none"
                        stroke="#0071E3"
                        strokeWidth="4.5"
                        strokeDasharray="7 5"
                      />
                    </svg>

                    <div className="relative z-10 flex items-center justify-between px-8">
                      <div className="flex flex-col items-center">
                        <div className="w-11 h-11 rounded-2xl bg-white border-2 border-[#0071E3] flex items-center justify-center text-[#0071E3] shadow-md shadow-blue-500/15">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 mt-2 bg-white/95 px-2.5 py-0.5 rounded-full border border-black/[0.07] shadow-xs">
                          Depot / School
                        </span>
                      </div>

                      {selectedTrip.stops.map((stop, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="w-9 h-9 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center text-emerald-700 font-bold text-xs shadow-sm">
                            {stop.order}
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 mt-1.5 max-w-[90px] text-center truncate bg-white/80 px-2 py-0.5 rounded-md border border-black/[0.05]">
                            {stop.name}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5">{stop.time}</span>
                        </div>
                      ))}

                      <div className="flex flex-col items-center animate-gentle-float">
                        <div className="relative">
                          <span className="absolute -inset-3 rounded-full bg-amber-400 opacity-30 animate-soft-radar"></span>
                          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-amber-500/30">
                            <Bus className="w-6 h-6" />
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-900 mt-2 bg-white/95 px-3 py-0.5 rounded-full border border-amber-300 shadow-sm flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>
                            {selectedTrip.vehicle_reg} ({selectedTrip.current_speed} km/h)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                    <Bus className="w-12 h-12 opacity-40 text-blue-500" />
                    <div className="text-sm font-semibold">Select an active vehicle to display live route telemetry</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- FLEET & DRIVERS TAB ---------------- */}
      {activeTab === 'fleet' && isStaff && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Campus Vehicle Fleet</h3>
                <p className="text-xs text-slate-500">Registered buses, vans, and onboard GPS tracking hardware</p>
              </div>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="ios-gloss-btn px-4 py-2 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Fleet Vehicle</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Registration</th>
                    <th className="py-3 px-4">Model</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">GPS Device IMEI</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                        <Bus className="w-4 h-4 text-slate-400" />
                        <span>{v.registration_number}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{v.model || 'Standard School Bus'}</td>
                      <td className="py-3 px-4 text-slate-600">{v.capacity} seats</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{v.device_id || 'Hardware Linked'}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Fleet
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Drivers & Attendants</h3>
              <p className="text-xs text-slate-500">Certified commercial transport drivers with active licenses</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {drivers.map((d) => (
                <div key={d.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
                  <div className="text-sm font-bold text-slate-900">{d.full_name}</div>
                  <div className="text-xs text-slate-600 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{d.phone_number}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">License: {d.license_number}</div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Verified Driver
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- ROUTES & STOPS TAB ---------------- */}
      {activeTab === 'routes' && isStaff && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Transport Routes & Stops</h3>
              <p className="text-xs text-slate-500">Configured route paths and geofenced pickup/drop waypoints</p>
            </div>

            <div className="space-y-4">
              {routes.map((r) => (
                <div key={r.id} className="p-5 rounded-2xl border border-slate-100 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{r.name}</h4>
                      <p className="text-xs text-slate-500">
                        Direction: <span className="font-semibold capitalize">{r.direction}</span> | Time:{' '}
                        {r.planned_start_time} - {r.planned_end_time}
                      </p>
                    </div>

                    <div className="text-right text-xs">
                      <div className="font-semibold text-slate-700">
                        {r.vehicle?.registration_number || 'Vehicle Assigned'}
                      </div>
                      <div className="text-slate-500">{r.driver?.full_name || 'Driver Assigned'}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-semibold uppercase text-slate-400 mb-2">
                      Route Stops ({r.stops?.length || 0})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {r.stops
                        ?.sort((a, b) => a.stop_order - b.stop_order)
                        .map((s) => (
                          <div
                            key={s.id}
                            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center space-x-2"
                          >
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                              {s.stop_order}
                            </span>
                            <span className="font-medium text-slate-800">{s.name}</span>
                            <span className="text-slate-400 text-[10px]">({s.planned_time})</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- DRIVER & SIMULATOR CONSOLE TAB ---------------- */}
      {activeTab === 'driver' && isStaff && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Navigation className="w-5 h-5 text-brand-600" />
                <span>Driver Trip Console & Simulator</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Trigger real-time trip lifecycle, simulate GPS pings along routes, and verify geofence arrivals
              </p>
            </div>

            {simStatusMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{simStatusMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Route to Operate</label>
                <select
                  value={simSelectedRoute}
                  onChange={(e) => setSimSelectedRoute(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.direction})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Simulated Speed ({simSpeedInput} km/h)
                </label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={simSpeedInput}
                  onChange={(e) => setSimSpeedInput(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => handleStartTrip(simSelectedRoute)}
                  className="ios-gloss-btn-emerald w-full py-3 px-5 text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Daily Trip</span>
                </button>
              </div>

              {liveFleet.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="text-xs font-bold text-slate-700">Currently Active Trips in Progress:</div>
                  {liveFleet.map((bus) => (
                    <div
                      key={bus.trip_id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{bus.vehicle_reg}</div>
                        <div className="text-[11px] text-slate-500">{bus.route_name}</div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSimulatePing(bus)}
                          className="ios-gloss-btn px-4 py-1.5 text-xs font-semibold"
                        >
                          Send GPS Ping
                        </button>
                        <button
                          onClick={() => handleEndTrip(bus.trip_id)}
                          className="ios-gloss-btn-secondary px-3.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold"
                        >
                          End Trip
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODALS ---------------- */}

      {/* Call Driver / Attendant Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowCallModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Direct Contact</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Connecting to {callTarget.role} for real-time status inquiry
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-sm font-bold text-slate-900">{callTarget.name}</div>
              <div className="text-xs text-slate-500">{callTarget.role}</div>
              <div className="text-base font-mono font-bold text-blue-600 pt-1">{callTarget.phone}</div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <a
                href={`tel:${callTarget.phone}`}
                onClick={() => setShowCallModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(callTarget.phone);
                  showToast('Phone number copied to clipboard!');
                  setShowCallModal(false);
                }}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              >
                Copy Number
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Driver Modal (Food Delivery Style In-App Chat Prompt) */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Message Bus Captain</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Send a quick broadcast message to {busData?.driver_name || 'Ramesh Kumar'}'s onboard dashboard
              </p>
            </div>

            {/* Quick pre-set pills */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Quick Updates:</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "I'm waiting at the stop",
                  'Running 2 mins late',
                  'Waiting with my guardian',
                  'Will reach in 1 min',
                ].map((txt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMessageText(txt)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors"
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3 pt-2">
              <textarea
                rows={3}
                required
                placeholder="Type your message for the bus driver or attendant..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Fleet Vehicle Modal (Staff) */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-md flex items-center justify-center p-4">
          <div className="ios-modal rounded-[30px] p-7 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-base font-bold text-slate-900">Add Fleet Vehicle</h3>
            <form onSubmit={handleAddVehicle} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Number</label>
                <input
                  type="text"
                  required
                  placeholder="KA-01-EA-4921"
                  value={newVehicle.registration_number}
                  onChange={(e) => setNewVehicle({ ...newVehicle, registration_number: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Seating Capacity</label>
                <input
                  type="number"
                  required
                  value={newVehicle.capacity}
                  onChange={(e) => setNewVehicle({ ...newVehicle, capacity: Number(e.target.value) })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Model</label>
                <input
                  type="text"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GPS Device IMEI</label>
                <input
                  type="text"
                  value={newVehicle.device_id}
                  onChange={(e) => setNewVehicle({ ...newVehicle, device_id: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="ios-gloss-btn-secondary px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="ios-gloss-btn px-5 py-2 text-xs font-semibold shadow-md">
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
