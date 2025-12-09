"use client";
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Wifi,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      alerts: true,
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      locationTracking: true,
    },
    system: {
      autoBackup: true,
      dataRetention: "1 year",
      language: "English",
      timezone: "UTC+5:30",
    },
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-600 via-gray-700 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
              <p className="text-gray-100 mt-1">
                Manage your account preferences and system configuration
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">Profile Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="farm-name">Farm Name</Label>
                <Input id="farm-name" defaultValue="Green Valley Farm" />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" defaultValue="California, USA" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    defaultValue="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bell className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">Notification Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-600">Receive updates via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.notifications.email}
                onCheckedChange={(value) => handleNotificationChange("email", value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-gray-600">Receive urgent alerts via SMS</p>
              </div>
              <Switch
                id="sms-notifications"
                checked={settings.notifications.sms}
                onCheckedChange={(value) => handleNotificationChange("sms", value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-gray-600">Receive browser notifications</p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.notifications.push}
                onCheckedChange={(value) => handleNotificationChange("push", value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="alert-notifications">Alert Notifications</Label>
                <p className="text-sm text-gray-600">Receive farm alert notifications</p>
              </div>
              <Switch
                id="alert-notifications"
                checked={settings.notifications.alerts}
                onCheckedChange={(value) => handleNotificationChange("alerts", value)}
              />
            </div>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold">Privacy & Security</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="data-sharing">Data Sharing</Label>
                <p className="text-sm text-gray-600">Allow sharing of anonymized data for research</p>
              </div>
              <Switch
                id="data-sharing"
                checked={settings.privacy.dataSharing}
                onCheckedChange={(value) => handlePrivacyChange("dataSharing", value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics">Analytics</Label>
                <p className="text-sm text-gray-600">Help improve the platform with usage analytics</p>
              </div>
              <Switch
                id="analytics"
                checked={settings.privacy.analytics}
                onCheckedChange={(value) => handlePrivacyChange("analytics", value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="location-tracking">Location Tracking</Label>
                <p className="text-sm text-gray-600">Allow location-based weather and recommendations</p>
              </div>
              <Switch
                id="location-tracking"
                checked={settings.privacy.locationTracking}
                onCheckedChange={(value) => handlePrivacyChange("locationTracking", value)}
              />
            </div>
          </div>
        </Card>

        {/* System Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold">System Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="English"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="UTC+5:30"
                >
                  <option value="UTC+5:30">UTC+5:30 (IST)</option>
                  <option value="UTC+0:00">UTC+0:00 (GMT)</option>
                  <option value="UTC-5:00">UTC-5:00 (EST)</option>
                  <option value="UTC-8:00">UTC-8:00 (PST)</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-backup">Auto Backup</Label>
                  <p className="text-sm text-gray-600">Automatically backup data daily</p>
                </div>
                <Switch
                  id="auto-backup"
                  checked={settings.system.autoBackup}
                  onCheckedChange={(value) => setSettings(prev => ({
                    ...prev,
                    system: { ...prev.system, autoBackup: value }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="data-retention">Data Retention</Label>
                <select
                  id="data-retention"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="1 year"
                >
                  <option value="6 months">6 months</option>
                  <option value="1 year">1 year</option>
                  <option value="2 years">2 years</option>
                  <option value="5 years">5 years</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Connected Devices */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Wifi className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold">Connected Devices</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">iPhone 13 Pro</p>
                  <p className="text-sm text-gray-600">Last seen 2 hours ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Disconnect
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">Soil Sensor #001</p>
                  <p className="text-sm text-gray-600">Connected • Battery: 85%</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">Weather Station</p>
                  <p className="text-sm text-gray-600">Connected • Signal: Strong</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
