'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
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
import { fetchVitalStats, VitalStatsData } from '@/lib/thingspeak2';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '1y', label: 'Last Year' }
];

export default function VitalStatsPage() {
    const [data, setData] = useState<VitalStatsData[]>([]);
    const [selectedRange, setSelectedRange] = useState('24h');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const result = await fetchVitalStats(selectedRange);
                setData(result);
            } catch (error) {
                console.error('Error fetching vital stats:', error);
                toast.error('Failed to fetch vital stats data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

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

    const renderGraph = (dataKey: keyof VitalStatsData, title: string, color: string) => (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{title}</h2>
            </div>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            name={title}
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                        />
                        <Brush dataKey="time" height={30} stroke={color} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 rounded-xl p-6 text-white shadow-lg flex items-center justify-between min-h-[100px]">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Vital Stats</h1>
                        <p className="opacity-90 mt-1">Real-time plant health indicators</p>
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

                {isLoading && data.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {renderGraph('red', 'Red Band', '#EF4444')}
                        {renderGraph('nir', 'NIR Band', '#8B5CF6')}
                        {renderGraph('ndvi', 'NDVI', '#10B981')}
                        {renderGraph('ratio', 'Ratio', '#F59E0B')}
                        {renderGraph('chlorophyll', 'Chlorophyll', '#059669')}
                        {renderGraph('nitrogen', 'Nitrogen', '#3B82F6')}
                    </div>
                )}
            </div>
        </div>
    );
}
