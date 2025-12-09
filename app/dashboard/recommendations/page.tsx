'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { getAgricultureRecommendation, getAgricultureStatistics, getActionColor, getActionIcon, getActionUrgency, getUrgencyColor, getUrgencyIcon } from '@/lib/agricultureService';
import { fetchLatestSensorData } from '@/lib/thingspeak';
import type { AgricultureRecommendation } from '@/lib/agricultureService';
import { toast } from 'sonner';

interface RecommendationHistory {
  id: string;
  recommendation: AgricultureRecommendation;
  timestamp: string;
  sensorData: {
    n: number;
    p: number;
    k: number;
    temperature: number;
    humidity: number;
    soil_moisture: number;
  };
}

export default function RecommendationsPage() {
  const [currentRecommendation, setCurrentRecommendation] = useState<AgricultureRecommendation | null>(null);
  const [recommendationHistory, setRecommendationHistory] = useState<RecommendationHistory[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchRecommendation = async () => {
    try {
      setLoading(true);
      
      // Get current sensor data
      const sensorData = await fetchLatestSensorData();
      if (!sensorData) {
        toast.error('No sensor data available');
        return;
      }

      // Get recommendation
      const recommendation = await getAgricultureRecommendation();
      if (recommendation) {
        setCurrentRecommendation(recommendation);
        
        // Add to history
        const newEntry: RecommendationHistory = {
          id: Date.now().toString(),
          recommendation,
          timestamp: new Date().toLocaleString(),
          sensorData: {
            n: parseFloat(sensorData.field5) || 0,
            p: parseFloat(sensorData.field6) || 0,
            k: parseFloat(sensorData.field7) || 0,
            temperature: parseFloat(sensorData.field1) || 0,
            humidity: parseFloat(sensorData.field2) || 0,
            soil_moisture: parseFloat(sensorData.field3) || 0,
          }
        };
        
        setRecommendationHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Keep last 10
        setLastUpdated(new Date().toLocaleString());
        toast.success('Recommendations updated');
      }
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      toast.error('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await getAgricultureStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchRecommendation();
    fetchStatistics();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchRecommendation, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getPriorityFromConfidence = (confidence: number) => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">AI Recommendations</h1>
              <p className="text-green-100 mt-1">Intelligent farming suggestions based on live sensor data</p>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-sm text-green-100">
                  Last updated: {lastUpdated}
                </span>
              )}
              <Button 
                onClick={fetchRecommendation} 
                disabled={loading}
                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Current Recommendation */}
        {currentRecommendation && (
          <Card className={`p-6 border-2 ${getUrgencyColor(getActionUrgency(currentRecommendation.action))}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getUrgencyIcon(getActionUrgency(currentRecommendation.action))}</span>
                <div>
                  <h2 className="text-2xl font-bold">Current Recommendation</h2>
                  <p className="text-sm opacity-75">Latest AI analysis based on sensor data</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${getActionColor(currentRecommendation.action)}`}>
                  {getActionIcon(currentRecommendation.action)} {currentRecommendation.action}
                </div>
                <p className="text-sm mt-2">
                  Confidence: {Math.round(currentRecommendation.confidence * 100)}%
                </p>
              </div>
      </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Analysis</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{currentRecommendation.semantic_tag}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      NDI: {currentRecommendation.ndi_label}
                    </Badge>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      PDI: {currentRecommendation.pdi_label}
                  </Badge>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Recommended Action</h3>
                <div className={`p-4 rounded-lg border-2 ${getActionColor(currentRecommendation.action)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getActionIcon(currentRecommendation.action)}</span>
                    <span className="font-semibold text-lg">{currentRecommendation.action}</span>
                  </div>
                  <p className="text-sm opacity-75">
                    Based on current NPK levels and environmental conditions
                  </p>
                  <div className="mt-3 text-xs text-gray-600">
                    Match Score: {currentRecommendation.score.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Statistics */}
        {statistics && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Dataset Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Total Records</h3>
                <p className="text-2xl font-bold text-blue-900">{statistics.total_records?.toLocaleString() || 0}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Action Types</h3>
                <p className="text-2xl font-bold text-green-900">{Object.keys(statistics.actions || {}).length}</p>
                </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">Semantic Tags</h3>
                <p className="text-2xl font-bold text-purple-900">{Object.keys(statistics.semantic_tags || {}).length}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Recommendation History */}
        {recommendationHistory.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Recommendations</h2>
            <div className="space-y-4">
              {recommendationHistory.map((entry) => (
                <div key={entry.id} className={`p-4 border-2 rounded-lg ${getUrgencyColor(getActionUrgency(entry.recommendation.action))}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getUrgencyIcon(getActionUrgency(entry.recommendation.action))}</span>
                      <Badge variant="outline" className={getActionColor(entry.recommendation.action)}>
                        {getActionIcon(entry.recommendation.action)} {entry.recommendation.action}
                      </Badge>
                      <span className="text-sm text-gray-500">{entry.timestamp}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(entry.recommendation.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{entry.recommendation.semantic_tag}</p>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="font-medium">N: {entry.sensorData.n.toFixed(1)}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="font-medium">P: {entry.sensorData.p.toFixed(1)}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="font-medium">K: {entry.sensorData.k.toFixed(1)}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="font-medium">Temp: {entry.sensorData.temperature.toFixed(1)}°C</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="font-medium">Humidity: {entry.sensorData.humidity.toFixed(1)}%</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="font-medium">Soil: {entry.sensorData.soil_moisture.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {loading && !currentRecommendation && (
          <Card className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Analyzing sensor data for recommendations...</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 