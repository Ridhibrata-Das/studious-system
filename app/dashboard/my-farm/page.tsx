"use client";
import {
  Sprout,
  MapPin,
  Calendar,
  Thermometer,
  Droplets,
  Sun,
} from "lucide-react";

const fields = [
  {
    id: 1,
    name: "Field A - Wheat",
    area: "12.5 acres",
    crop: "Wheat",
    planted: "March 15, 2025",
    health: 92,
    moisture: 68,
    temperature: 28,
    status: "Excellent",
  },
  {
    id: 2,
    name: "Field B - Rice",
    area: "15.2 acres",
    crop: "Rice",
    planted: "April 2, 2025",
    health: 87,
    moisture: 72,
    temperature: 26,
    status: "Good",
  },
  {
    id: 3,
    name: "Field C - Corn",
    area: "10.8 acres",
    crop: "Corn",
    planted: "March 28, 2025",
    health: 78,
    moisture: 55,
    temperature: 30,
    status: "Needs Attention",
  },
  {
    id: 4,
    name: "Field D - Vegetables",
    area: "6.7 acres",
    crop: "Mixed Vegetables",
    planted: "April 10, 2025",
    health: 85,
    moisture: 65,
    temperature: 27,
    status: "Good",
  },
];

export default function MyFarmPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold">My Farm Fields</h1>
          <p className="text-green-100 mt-1">
            Manage and monitor all your farm fields
          </p>
        </div>

        {/* Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div
              key={field.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Sprout className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {field.name}
                    </h3>
                    <p className="text-sm text-gray-500">{field.area}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    field.status === "Excellent"
                      ? "bg-green-100 text-green-800"
                      : field.status === "Good"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {field.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{field.crop}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{field.planted}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {field.health}%
                  </div>
                  <div className="text-xs text-gray-600">Health</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {field.moisture}%
                  </div>
                  <div className="text-xs text-gray-600">Moisture</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">
                    {field.temperature}°C
                  </div>
                  <div className="text-xs text-gray-600">Temp</div>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700">
                  View Details
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-200">
                  Schedule Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
