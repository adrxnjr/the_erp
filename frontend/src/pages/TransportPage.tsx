import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Bus,
  MapPin,
  Navigation,
  Clock,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Play,
  Square,
  Radio,
  Plus,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  Compass,
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
  const isParentOrStudent = user?.portal_type === 'parent' || user?.portal_type === 'student';

  const [activeTab, setActiveTab] = useState<'live' | 'parent' | 'fleet' | 'routes' | 'driver'>(
    isParentOrStudent ? 'parent' : 'live'
  );

  const [liveFleet, setLiveFleet] = useState<ActiveTripVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTrip, setSelectedTrip] = useState<ActiveTripVehicle | null>(null);

  // Parent view state
  const [parentChildData, setParentChildData] = useState<any>(null);
  const [parentChildLoading, setParentChildLoading] = useState<boolean>(false);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Simulator / Driver controls
  const [simSelectedRoute, setSimSelectedRoute] = useState<string>('');
  const [simSpeed, setSimSpeed] = useState<number>(32);
  const [simStatusMsg, setSimStatusMsg] = useState<string>('');

  // Forms
  const [showAddVehicleModal, setShowAddVehicleModal] = useState<boolean>(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState<boolean>(false);
  const [newVehicle, setNewVehicle] = useState({
    registration_number: '',
    capacity: 35,
    model: 'Tata Starbus Ultra',
    device_id: 'GPS-98214',
  });

  const [newRoute, setNewRoute] = useState({
    name: '',
    direction: 'pickup',
    planned_start_time: '07:00:00',
    planned_end_time: '08:15:00',
    stops: [
      { name: 'City Central Bus Terminus', latitude: 12.9716, longitude: 77.5946, stop_order: 1, planned_time: '07:10:00' },
      { name: 'Indiranagar Metro Station', latitude: 12.9784, longitude: 77.6408, stop_order: 2, planned_time: '07:35:00' },
      { name: 'Ever Grow Main Campus Gate', latitude: 12.9902, longitude: 77.6875, stop_order: 3, planned_time: '08:00:00' },
    ],
  });

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
        if (stds.length > 0 && !selectedStudentId) {
          setSelectedStudentId(stds[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
    fetchLiveFleet();

    const interval = setInterval(() => {
      fetchLiveFleet();
    }, 15000); // Polling telemetry every 15s

    return () => clearInterval(interval);
  }, []);

  // Fetch parent child tracking data
  const fetchChildTransport = async (studentId: string) => {
    if (!studentId) return;
    setParentChildLoading(true);
    try {
      const res = await api.get(`/transport/my-child/${studentId}`);
      setParentChildData(res.data);
    } catch (err: any) {
      setParentChildData({
        has_transport: false,
        message: err.response?.data?.detail || 'Unable to retrieve linked bus status.',
      });
    } finally {
      setParentChildLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      fetchChildTransport(selectedStudentId);
    }
  }, [selectedStudentId]);

  // Start Trip
  const handleStartTrip = async (routeId: string) => {
    try {
      const res = await api.post(`/transport/trips/${routeId}/start`);
      setSimStatusMsg(`Trip started! Trip ID: ${res.data.trip_id}`);
      fetchLiveFleet();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Could not start trip.');
    }
  };

  // End Trip
  const handleEndTrip = async (tripId: string) => {
    try {
      await api.post(`/transport/trips/${tripId}/end`);
      setSimStatusMsg('Trip marked as completed.');
      fetchLiveFleet();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Could not end trip.');
    }
  };

  // Simulate GPS location ping
  const handleSimulatePing = async (trip: ActiveTripVehicle, latOffset = 0.005, lngOffset = 0.005) => {
    try {
      const newLat = trip.current_lat + (Math.random() - 0.48) * latOffset;
      const newLng = trip.current_lng + (Math.random() - 0.48) * lngOffset;
      await api.post('/transport/location', {
        trip_id: trip.trip_id,
        latitude: Number(newLat.toFixed(5)),
        longitude: Number(newLng.toFixed(5)),
        speed: simSpeed,
        recorded_at: new Date().toISOString(),
      });
      setSimStatusMsg(`Ping delivered: Lat ${newLat.toFixed(4)}, Lng ${newLng.toFixed(4)} at ${simSpeed} km/h`);
      fetchLiveFleet();
      if (selectedStudentId) {
        fetchChildTransport(selectedStudentId);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ping failed.');
    }
  };

  // Handle Add Vehicle
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
      fetchMasterData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save vehicle');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Transport & GPS Bus Tracking
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Live fleet radar, real-time geofenced stops, and child arrival telemetry
              </p>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center space-x-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-black/[0.04] self-start md:self-auto overflow-x-auto">
          {!isParentOrStudent && (
            <button
              onClick={() => setActiveTab('live')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
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
          )}

          <button
            onClick={() => setActiveTab('parent')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'parent'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-500" />
              <span>{isParentOrStudent ? 'My Child Bus' : 'Parent Child View'}</span>
            </span>
          </button>

          {!isParentOrStudent && (
            <>
              <button
                onClick={() => setActiveTab('routes')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'routes'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Routes & Stops
              </button>
              <button
                onClick={() => setActiveTab('fleet')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'fleet'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vehicles & Drivers
              </button>
              <button
                onClick={() => setActiveTab('driver')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
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

      {/* ---------------- LIVE FLEET RADAR TAB ---------------- */}
      {activeTab === 'live' && (
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
                              bus.is_stale
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
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

                      {/* Quick simulate movement button */}
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

              {/* Map Canvas Visualizer - Apple Maps Light Vector Mode */}
              <div className="w-full h-96 bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#EAEFF5] rounded-[26px] relative border border-blue-200/60 p-6 flex flex-col justify-between overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                {/* Visual Blueprint Grid Lines */}
                <div
                  className="absolute inset-0 opacity-40 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(0, 113, 227, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 113, 227, 0.08) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                ></div>

                {/* Map Compass Pill */}
                <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-black/[0.07] text-slate-700 text-xs flex items-center space-x-1.5 font-mono shadow-xs">
                  <Compass className="w-4 h-4 text-blue-600 animate-spin" style={{ animationDuration: '24s' }} />
                  <span>CAMPUS MAP RADAR</span>
                </div>

                {/* Vector Route Path & Pins */}
                {selectedTrip ? (
                  <div className="relative w-full h-full flex flex-col justify-center">
                    {/* SVG Route Polyline with Soft Glow */}
                    <svg className="w-full h-64 absolute inset-0 pointer-events-none" viewBox="0 0 700 240">
                      <defs>
                        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#0071E3" stopOpacity="0.75" />
                          <stop offset="50%" stopColor="#34C759" stopOpacity="0.85" />
                          <stop offset="100%" stopColor="#FF9500" stopOpacity="0.85" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 60 180 Q 200 40 350 120 T 640 80"
                        fill="none"
                        stroke="url(#routeGradient)"
                        strokeWidth="4.5"
                        strokeDasharray="7 5"
                      />
                    </svg>

                    {/* Nodes along the route */}
                    <div className="relative z-10 flex items-center justify-between px-8">
                      {/* School Campus Depot */}
                      <div className="flex flex-col items-center">
                        <div className="w-11 h-11 rounded-2xl bg-white border-2 border-[#0071E3] flex items-center justify-center text-[#0071E3] shadow-md shadow-blue-500/15">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 mt-2 bg-white/95 px-2.5 py-0.5 rounded-full border border-black/[0.07] shadow-xs">
                          Depot / School
                        </span>
                      </div>

                      {/* Intermediate Stops */}
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

                      {/* Active Bus Marker (Soft Elegant Pulse) */}
                      <div className="flex flex-col items-center animate-gentle-float">
                        <div className="relative">
                          <span className="absolute -inset-3 rounded-full bg-amber-400 opacity-30 animate-soft-radar"></span>
                          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-amber-500/30">
                            <Bus className="w-6 h-6" />
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-900 mt-2 bg-white/95 px-3 py-0.5 rounded-full border border-amber-300 shadow-sm flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>{selectedTrip.vehicle_reg} ({selectedTrip.current_speed} km/h)</span>
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

                {/* Bottom Telemetry HUD - Apple Frost Glass */}
                {selectedTrip && (
                  <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-[22px] border border-black/[0.06] p-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-800">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Driver</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">{selectedTrip.driver_name}</div>
                      <div className="text-[11px] text-blue-600 font-medium">{selectedTrip.driver_phone}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Current Velocity</div>
                      <div className="text-xs font-bold text-emerald-600 mt-0.5">{selectedTrip.current_speed} km/h</div>
                      <div className="text-[11px] text-slate-500">Cruising speed</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Route Stops</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">{selectedTrip.stops.length} Geofenced stops</div>
                      <div className="text-[11px] text-slate-500">Auto radius: 500m</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Telemetry Status</div>
                      <div className="text-xs font-bold flex items-center space-x-1 mt-0.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            selectedTrip.is_stale ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        ></span>
                        <span className={selectedTrip.is_stale ? 'text-amber-700' : 'text-emerald-700'}>
                          {selectedTrip.is_stale ? 'Signal Delay (>60s)' : 'Real-time Linked'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {new Date(selectedTrip.last_ping_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- PARENT / CHILD VIEW TAB ---------------- */}
      {activeTab === 'parent' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Linked student selector */}
          {!isParentOrStudent && (
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-semibold text-blue-900">
                  Staff Testing Mode: Switch linked student to verify strict boundary & ETA calculation:
                </span>
              </div>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-white text-xs font-semibold border border-blue-300 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none"
              >
                {studentsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.admission_number})
                  </option>
                ))}
              </select>
            </div>
          )}

          {parentChildLoading ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-500 font-medium">
              Loading child transport tracking status...
            </div>
          ) : parentChildData && parentChildData.has_transport ? (
            <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              {/* Header card with status pill */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                    Transport Enrolled & Active
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900">{parentChildData.route_name}</h2>
                  <p className="text-sm text-slate-500">
                    Direction: <span className="font-semibold capitalize">{parentChildData.direction}</span> | Vehicle:{' '}
                    <span className="font-semibold">{parentChildData.vehicle_registration}</span>
                  </p>
                </div>

                {/* Big ETA Callout - Apple iOS Light Card */}
                <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/90 border border-blue-200/80 text-slate-900 rounded-[24px] p-4 md:p-5 shadow-sm text-center md:min-w-[180px]">
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">Stop Arrival ETA</div>
                  <div className="text-3xl font-black mt-1 text-[#0071E3]">
                    {parentChildData.trip_active && parentChildData.eta_minutes !== null
                      ? `${parentChildData.eta_minutes} min`
                      : 'Scheduled'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {parentChildData.trip_active ? 'Bus is currently en-route' : 'Departs on scheduled time'}
                  </div>
                </div>
              </div>

              {/* Stale warning if needed */}
              {parentChildData.is_stale && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center space-x-3 text-amber-800 text-xs font-semibold">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    GPS signal has not updated in over 60 seconds due to intermittent cell network. Telemetry will
                    auto-refresh once connection resumes.
                  </span>
                </div>
              )}

              {/* Stop & Driver Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Your Child Assigned Pickup Stop</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">{parentChildData.student_stop_name}</div>
                  <div className="text-xs text-slate-600 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Planned Time: {parentChildData.planned_stop_time}</span>
                  </div>
                </div>

                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>Bus Driver & Attendant Contact</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">{parentChildData.driver_name}</div>
                  <div className="text-xs text-blue-600 font-semibold flex items-center space-x-2">
                    <a href={`tel:${parentChildData.driver_phone}`} className="hover:underline">
                      {parentChildData.driver_phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Safety & Protocol Badge */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center space-x-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs text-emerald-900">
                  <span className="font-bold">Ever Grow Safety Assured:</span> Verified driver background checked,
                  speed limiter compliant (&lt;40 km/h in school zone), and automated geofence entry/exit logging
                  active.
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-black/[0.06] p-10 text-center space-y-3">
              <Bus className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Transport Subscription Enrolled</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {parentChildData?.message ||
                  'Your student is not enrolled in the campus transport program for the current academic session. Contact the transport desk for enrolment.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ---------------- FLEET & DRIVERS TAB ---------------- */}
      {activeTab === 'fleet' && !isParentOrStudent && (
        <div className="space-y-6">
          {/* Vehicles List */}
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

          {/* Drivers List */}
          <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Drivers & Attendants</h3>
                <p className="text-xs text-slate-500">Certified commercial transport drivers with active licenses</p>
              </div>
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
      {activeTab === 'routes' && !isParentOrStudent && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Transport Routes & Stops</h3>
                <p className="text-xs text-slate-500">Configured route paths and geofenced pickup/drop waypoints</p>
              </div>
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
      {activeTab === 'driver' && !isParentOrStudent && (
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
                  Simulated Speed ({simSpeed} km/h)
                </label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={simSpeed}
                  onChange={(e) => setSimSpeed(Number(e.target.value))}
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

      {/* Add Vehicle Modal - Apple iOS Modal with Curved 30px Corners */}
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
                <button
                  type="submit"
                  className="ios-gloss-btn px-5 py-2 text-xs font-semibold shadow-md"
                >
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
