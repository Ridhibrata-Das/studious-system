'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Brush
} from 'recharts';
import { fetchThingSpeakHistory, fetchNPKData, type ThingSpeakData, type NPKData } from '@/lib/thingspeak';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Thermometer, Droplets, Gauge, Sun } from 'lucide-react';

const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '1y', label: 'Last Year' }
];

export default function SensorsPage() {
    const [sensorHistory, setSensorHistory] = useState<ThingSpeakData[]>([]);
    const [npkHistory, setNpkHistory] = useState<NPKData[]>([]);
    const [selectedRange, setSelectedRange] = useState('24h');
    const [isLoading, setIsLoading] = useState(true);
    const [modeAutomatic, setModeAutomatic] = useState(false); // false => Manual, true => Automatic
    const [pumpState, setPumpState] = useState<'on' | 'off' | 'unknown'>('unknown');
    const [isToggling, setIsToggling] = useState(false);

    const latestSoilMoisture = sensorHistory.length > 0 ? sensorHistory[sensorHistory.length - 1].soilMoisture : undefined;
    const latestTemperature = sensorHistory.length > 0 ? sensorHistory[sensorHistory.length - 1].temperature : undefined;
    const latestHumidity = sensorHistory.length > 0 ? sensorHistory[sensorHistory.length - 1].humidity : undefined;
    const latestNpkAvg = npkHistory.length > 0
        ? ((npkHistory[npkHistory.length - 1].nitrogen + npkHistory[npkHistory.length - 1].phosphorus + npkHistory[npkHistory.length - 1].potassium) / 3)
        : undefined;

    const readPumpState = async () => {
        try {
            const res = await fetch('/api/pump', { cache: 'no-store' });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setPumpState(data?.state === 'on' ? 'on' : 'off');
        } catch (e) {
            console.error('Failed to read pump state', e);
        }
    };

    const setPump = async (state: 'on' | 'off') => {
        try {
            setIsToggling(true);
            const res = await fetch('/api/pump', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state: state.toUpperCase() })
            });
            if (!res.ok) throw new Error(await res.text());
            setPumpState(state);
        } catch (e) {
            console.error('Failed to set pump state', e);
            toast.error('Failed to toggle pump.');
        } finally {
            setIsToggling(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [historyData, npkData] = await Promise.all([
                    fetchThingSpeakHistory(selectedRange),
                    fetchNPKData(selectedRange)
                ]);
                setSensorHistory(historyData);
                setNpkHistory(npkData);
            } catch (error) {
                console.error('Error fetching sensor data:', error);
                toast.error('Failed to fetch sensor data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        readPumpState();

        const interval = {
            '1h': 15000,
            '24h': 60000,
            '7d': 300000,
            '30d': 900000,
            '1y': 3600000
        }[selectedRange] || 60000;

        const pollInterval = setInterval(fetchData, interval);

        return () => clearInterval(pollInterval);
    }, [selectedRange]);

    // Automatic mode control
    useEffect(() => {
        const id = setInterval(() => {
            if (modeAutomatic && typeof latestSoilMoisture === 'number') {
                if (latestSoilMoisture <= 10 && pumpState !== 'on') {
                    setPump('on');
                }
                if (latestSoilMoisture >= 80 && pumpState !== 'off') {
                    setPump('off');
                }
            }
        }, 15000);
        return () => clearInterval(id);
    }, [modeAutomatic, latestSoilMoisture, pumpState]);

    // Manual autocut: if pump is ON in manual and soil moisture >=80 -> OFF
    useEffect(() => {
        if (!modeAutomatic && pumpState === 'on' && typeof latestSoilMoisture === 'number' && latestSoilMoisture >= 80) {
            setPump('off');
        }
    }, [modeAutomatic, pumpState, latestSoilMoisture]);

    // Check for alerts
    useEffect(() => {
        const checkAlerts = async () => {
            if (!latestSoilMoisture && !latestTemperature && !latestHumidity && !latestNpkAvg) return;

            const now = Date.now();
            const lastAlertTime = parseInt(localStorage.getItem('lastAlertTime') || '0');
            const COOLDOWN = 60 * 60 * 1000; // 1 hour cooldown

            if (now - lastAlertTime < COOLDOWN) return;

            let needsAlert = false;
            if (latestSoilMoisture && (latestSoilMoisture > 80 || latestSoilMoisture < 20)) needsAlert = true;
            if (latestTemperature && (latestTemperature > 35 || latestTemperature < 10)) needsAlert = true;
            if (latestHumidity && (latestHumidity > 90 || latestHumidity < 30)) needsAlert = true;

            const latestNPK = npkHistory.length > 0 ? npkHistory[npkHistory.length - 1] : null;
            if (latestNPK) {
                if (latestNPK.nitrogen < 20 || latestNPK.phosphorus < 20 || latestNPK.potassium < 20) needsAlert = true;
            }

            if (needsAlert) {
                try {
                    await fetch('/api/alerts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            soilMoisture: latestSoilMoisture,
                            temperature: latestTemperature,
                            humidity: latestHumidity,
                            nitrogen: latestNPK?.nitrogen,
                            phosphorus: latestNPK?.phosphorus,
                            potassium: latestNPK?.potassium
                        })
                    });
                    localStorage.setItem('lastAlertTime', now.toString());
                    toast.success("Alert sent to farmer via SMS");
                } catch (error) {
                    console.error("Failed to send alert", error);
                }
            }
        };

        checkAlerts();
    }, [latestSoilMoisture, latestTemperature, latestHumidity, npkHistory]);

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 rounded-xl p-6 text-white shadow-lg flex items-center justify-between min-h-[100px]">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Sensor Analytics</h1>
                        <p className="opacity-90 mt-1">Explore historical trends and real-time readings</p>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <Select value={selectedRange} onValueChange={setSelectedRange}>
                            <SelectTrigger className="w-[180px] bg-white/10 text-white border-white/30">
                                <SelectValue placeholder="Select time range" />
                            </SelectTrigger>
                            <SelectContent>
                                {timeRanges.map((range) => (
                                    <SelectItem key={range.value} value={range.value}>
                                        {range.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Temperature', value: latestTemperature !== undefined ? `${latestTemperature.toFixed(1)}°C` : '—', icon: Thermometer, color: 'blue' },
                        { label: 'Humidity', value: latestHumidity !== undefined ? `${latestHumidity.toFixed(1)}%` : '—', icon: Droplets, color: 'green' },
                        { label: 'Soil Moisture', value: latestSoilMoisture !== undefined ? `${latestSoilMoisture.toFixed(1)}%` : '—', icon: Gauge, color: 'purple' },
                        { label: 'Avg NPK', value: latestNpkAvg !== undefined ? `${latestNpkAvg.toFixed(0)} ppm` : '—', icon: Sun, color: 'yellow' },
                    ].map((m) => (
                        <div key={m.label} className={`bg-white p-5 rounded-xl shadow-sm border-l-4 border-${m.color}-500`}>
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm opacity-70">{m.label}</p>
                                    <div className="text-2xl font-bold">{m.value}</div>
                                </div>
                                <m.icon className={`h-8 w-8 text-${m.color}-500`} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Pump Control */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Water Pump</h2>
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-600">Manual</span>
                                <Switch checked={modeAutomatic} onCheckedChange={(v) => setModeAutomatic(!!v)} />
                                <span className="text-sm text-gray-600">Automatic</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <button
                                disabled={modeAutomatic || isToggling}
                                onClick={() => setPump(pumpState === 'on' ? 'off' : 'on')}
                                className="rounded-full"
                                aria-label="Toggle pump"
                            >
                                <div
                                    className="w-56 h-56 rounded-full shadow-inner"
                                    style={{
                                        background: pumpState === 'on'
                                            ? 'radial-gradient(circle at 50% 30%, #b7ffb7, #00ff00 60%, #06c406)'
                                            : 'radial-gradient(circle at 50% 30%, #ffd1d1, #ff2b2b 60%, #c40606)'
                                    }}
                                />
                            </button>
                            <div className="mt-4 text-sm text-gray-700">
                                {modeAutomatic ? 'Automatic mode active' : 'Manual mode'} · Pump is <span className={`font-semibold ${pumpState === 'on' ? 'text-green-700' : 'text-red-700'}`}>{pumpState}</span>
                            </div>
                            {typeof latestSoilMoisture === 'number' && (
                                <div className="mt-1 text-xs text-gray-500">Soil moisture: {latestSoilMoisture}%</div>
                            )}
                        </div>
                    </Card>
                    {/* Temperature Chart */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Temperature History</h2>
                            <Select value={selectedRange} onValueChange={setSelectedRange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select time range" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeRanges.map((range) => (
                                        <SelectItem key={range.value} value={range.value}>
                                            {range.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sensorHistory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="temperature"
                                        name="Temperature (°C)"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Brush dataKey="time" height={30} stroke="#2563eb" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Humidity Chart */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Humidity History</h2>
                            <Select value={selectedRange} onValueChange={setSelectedRange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select time range" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeRanges.map((range) => (
                                        <SelectItem key={range.value} value={range.value}>
                                            {range.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sensorHistory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="humidity"
                                        name="Humidity (%)"
                                        stroke="#16a34a"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Brush dataKey="time" height={30} stroke="#16a34a" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Soil Moisture Chart */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Soil Moisture History</h2>
                            <Select value={selectedRange} onValueChange={setSelectedRange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select time range" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeRanges.map((range) => (
                                        <SelectItem key={range.value} value={range.value}>
                                            {range.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sensorHistory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="soilMoisture"
                                        name="Soil Moisture (%)"
                                        stroke="#ea580c"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Brush dataKey="time" height={30} stroke="#ea580c" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* NPK Chart */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">NPK Sensor Data</h2>
                            <Select value={selectedRange} onValueChange={setSelectedRange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select time range" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeRanges.map((range) => (
                                        <SelectItem key={range.value} value={range.value}>
                                            {range.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={npkHistory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="nitrogen"
                                        name="Nitrogen (N)"
                                        stroke="#2563EB"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="phosphorus"
                                        name="Phosphorus (P)"
                                        stroke="#DC2626"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="potassium"
                                        name="Potassium (K)"
                                        stroke="#9333EA"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Brush dataKey="time" height={30} stroke="#6B7280" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
