"use client";
import { useState, useCallback } from 'react';
import CameraPreview from './components/CameraPreview';
import Chatbot from './components/Chatbot';
import ChartDisplay from './components/ChartDisplay';
import GemmaInterface from './components/GemmaInterface';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Mic, Settings, Share2, Shield, Wifi, Search, Brain, Database, Globe, BarChart3 } from 'lucide-react';
import type { AnalysisResult } from './services/detailAnalysisService';

const TABS = [
  { label: "Voice/Camera AI" },
  { label: "Chatbot" },
  { label: "Gemma Model" }
];

// Helper function to create message components
const HumanMessage = ({ text }: { text: string }) => (
  <div className="flex gap-2 md:gap-3 items-start group animate-in slide-in-from-bottom-2">
    <Avatar className="h-7 w-7 md:h-8 md:w-8 ring-2 ring-offset-2 ring-offset-white ring-emerald-500/40">
      <AvatarImage src="/avatars/human.png" alt="Human" />
      <AvatarFallback>H</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-1.5 md:space-y-2">
      <div className="flex items-center gap-1.5 md:gap-2">
        <p className="text-xs md:text-sm font-semibold text-zinc-900">You</p>
        <span className="text-[10px] md:text-xs text-zinc-500">{new Date().toLocaleTimeString()}</span>
      </div>
      <div className="rounded-lg bg-emerald-50 px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm text-zinc-800 shadow-sm">
        {text}
      </div>
    </div>
  </div>
);

const GeminiMessage = ({ text }: { text: string }) => (
  <div className="flex gap-2 md:gap-3 items-start group animate-in slide-in-from-bottom-2">
    <Avatar className="h-7 w-7 md:h-8 md:w-8 bg-blue-600 ring-2 ring-offset-2 ring-offset-white ring-blue-500/40">
      <AvatarImage src="/avatars/gemini.png" alt="Gemini" />
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-1.5 md:space-y-2">
      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
        <p className="text-xs md:text-sm font-semibold text-zinc-900">Gemini</p>
        <Badge variant="secondary" className="h-4 md:h-5 text-[10px] md:text-xs bg-blue-50 text-blue-700 hover:bg-blue-50">AI Assistant</Badge>
        <span className="text-[10px] md:text-xs text-zinc-500">{new Date().toLocaleTimeString()}</span>
      </div>
      <div className="rounded-lg bg-white border border-zinc-200 px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm text-zinc-800 shadow-sm">
        {text}
      </div>
    </div>
  </div>
);

export default function BalaramAI() {
  const [tab, setTab] = useState(0);
  const [messages, setMessages] = useState<{ type: 'human' | 'gemini', text: string }[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [lastSearchQuery, setLastSearchQuery] = useState<string>('');
  const [chartData, setChartData] = useState<AnalysisResult | null>(null);

  const handleTranscription = useCallback((transcription: string) => {
    setMessages(prev => [...prev, { type: 'gemini', text: transcription }]);

    // Check if this might trigger a search
    const searchTriggers = ['search', 'find', 'lookup', 'what is', 'current price', 'latest', 'recent'];
    const hasSearchTrigger = searchTriggers.some(trigger =>
      transcription.toLowerCase().includes(trigger)
    );

    if (hasSearchTrigger) {
      setLastSearchQuery(transcription);
    }
  }, []);

  const handleSearchResults = useCallback((results: any) => {
    setSearchResults(results);
    console.log("Search results received:", results);
  }, []);

  const handleChartData = useCallback((data: AnalysisResult) => {
    setChartData(data);
    console.log("Chart data received:", data);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-2 md:px-4 py-2 md:py-4 flex flex-col gap-2 md:gap-4 flex-1">
        {/* Slider/Tab UI */}
        <div className="flex gap-2 mb-4">
          {TABS.map((t, idx) => (
            <Button
              key={t.label}
              variant={tab === idx ? "default" : "outline"}
              className={`rounded-full px-6 py-2 text-sm font-semibold ${tab === idx ? 'bg-blue-600 text-white' : ''}`}
              onClick={() => setTab(idx)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        {/* Enhanced Features Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Google Search</h3>
              </div>
              <p className="text-sm text-green-700">
                Say "search for..." or "find latest..." to get real-time web information
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Agricultural Knowledge</h3>
              </div>
              <p className="text-sm text-blue-700">
                Access curated farming knowledge and best practices from our database
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Auto Visuals</h3>
              </div>
              <p className="text-sm text-purple-700">
                Automatically generates charts when discussing data trends
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Results Display */}
        {searchResults && (
          <Card className="mb-4 border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-orange-800">
                <Globe className="h-4 w-4" />
                Google Search Results for: "{lastSearchQuery}"
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-orange-700">
                {searchResults.searchQueries && (
                  <p><strong>Search Queries:</strong> {searchResults.searchQueries.join(', ')}</p>
                )}
                {searchResults.groundingSupports && (
                  <p><strong>Sources:</strong> {searchResults.groundingSupports.length} web sources found</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Content */}
        {tab === 0 && (
          <div className="flex-1 flex flex-col">
            {/* Camera Section */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-full" style={{ height: 'min(90vh, 480px)' }}>
                <CameraPreview
                  onTranscription={handleTranscription}
                  onSearchResults={handleSearchResults}
                  onChartData={handleChartData}
                  className="h-full w-full"
                />
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-zinc-600 mt-2">
                <Mic className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <p>Voice recognition is active • Enhanced with Google Search & Auto Visuals</p>
              </div>
            </div>

            {/* Dedicated Visual Section */}
            <div className="w-full max-w-6xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Auto-Generated Visuals</h2>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  AI-Powered
                </Badge>
              </div>

              {/* Chart Display Area */}
              {chartData && chartData.chart_data ? (
                <ChartDisplay
                  chartData={chartData.chart_data}
                  className="mb-4"
                  isFromSearch={!!searchResults}
                />
              ) : (
                <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
                  <CardContent className="p-8 text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Visuals Yet</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      Ask questions about data trends, sensor readings, or market information to automatically generate charts and graphs.
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <Badge variant="outline" className="text-xs">Try: "Show soil moisture trends"</Badge>
                      <Badge variant="outline" className="text-xs">Try: "Search wheat prices"</Badge>
                      <Badge variant="outline" className="text-xs">Try: "NPK levels over time"</Badge>
                    </div>

                    {/* Debug Button for Testing */}
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          // Test chart generation
                          const testChart = {
                            skip: false,
                            needs_visual: true,
                            chart_data: {
                              title: "Test Soil Moisture Trend",
                              summary: "7-day soil moisture readings from sensors",
                              labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                              values: [45, 52, 48, 55, 60, 58, 62],
                              data_label: "Soil Moisture",
                              y_label: "%",
                              chart_title: "Weekly Soil Moisture Trend",
                              insights: [
                                "Moisture levels are gradually increasing",
                                "Current levels are optimal for crop growth"
                              ],
                              chart_type: "line" as const
                            }
                          };
                          handleChartData(testChart);
                        }}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        🧪 Test Chart Generation
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Example Queries */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg max-w-2xl">
              <h4 className="font-semibold text-sm mb-2">Try these enhanced queries:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="font-medium text-green-600">🔍 Search Queries:</p>
                  <ul className="text-gray-600 space-y-1">
                    <li>"Search for current wheat prices in Punjab"</li>
                    <li>"Find latest pest control methods"</li>
                    <li>"What's the weather forecast for next week?"</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-purple-600">📊 Visual Queries:</p>
                  <ul className="text-gray-600 space-y-1">
                    <li>"Show me soil moisture trends"</li>
                    <li>"NPK levels over time"</li>
                    <li>"Temperature patterns this week"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Chatbot />
          </div>
        )}

        {tab === 2 && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full" style={{ height: 'min(90vh, 480px)' }}>
              <GemmaInterface className="h-full w-full" />
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-zinc-600 mt-2">
              <Brain className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <p>Powered by Gemma 3 Multimodal Model</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}