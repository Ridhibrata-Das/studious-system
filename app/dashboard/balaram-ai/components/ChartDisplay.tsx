"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';
import type { ChartData } from '../services/detailAnalysisService';

interface ChartDisplayProps {
  chartData: ChartData;
  className?: string;
  isFromSearch?: boolean;
}

export default function ChartDisplay({ chartData, className, isFromSearch = false }: ChartDisplayProps) {
  // Transform data for Recharts
  const data = chartData.labels.map((label, index) => ({
    name: label,
    value: chartData.values[index]
  }));

  const getChartIcon = () => {
    switch (chartData.chart_type) {
      case 'bar': return <BarChart3 className="h-5 w-5" />;
      case 'area': return <Activity className="h-5 w-5" />;
      default: return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getChartColor = () => {
    if (chartData.data_label.toLowerCase().includes('moisture')) return '#3B82F6'; // Blue
    if (chartData.data_label.toLowerCase().includes('temperature')) return '#EF4444'; // Red
    if (chartData.data_label.toLowerCase().includes('humidity')) return '#10B981'; // Green
    if (chartData.data_label.toLowerCase().includes('npk')) return '#8B5CF6'; // Purple
    return '#6366F1'; // Default indigo
  };

  const renderChart = () => {
    const color = getChartColor();
    
    switch (chartData.chart_type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} ${chartData.y_label}`, chartData.data_label]}
              labelStyle={{ color: '#374151' }}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
        
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} ${chartData.y_label}`, chartData.data_label]}
              labelStyle={{ color: '#374151' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              fill={color} 
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        );
        
      default: // line
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} ${chartData.y_label}`, chartData.data_label]}
              labelStyle={{ color: '#374151' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <Card className={`border-l-4 border-l-blue-500 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getChartIcon()}
            <CardTitle className="text-lg">{chartData.title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              Auto-Generated
            </Badge>
            {isFromSearch && (
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                📊 Search Data
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">{chartData.summary}</p>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Chart */}
        <div className="h-64 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        
        {/* Insights */}
        {chartData.insights && chartData.insights.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Key Insights
            </h4>
            <ul className="space-y-1">
              {chartData.insights.map((insight, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}