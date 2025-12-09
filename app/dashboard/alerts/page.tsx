'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Alert {
  id: number;
  type: string;
  threshold: number;
  enabled: boolean;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 1, type: 'Temperature High', threshold: 30, enabled: true },
    { id: 2, type: 'Temperature Low', threshold: 15, enabled: true },
    { id: 3, type: 'Humidity High', threshold: 80, enabled: true },
    { id: 4, type: 'Humidity Low', threshold: 40, enabled: true },
    { id: 5, type: 'Soil Moisture Low', threshold: 30, enabled: true },
  ]);

  const toggleAlert = (id: number) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };

  const updateThreshold = (id: number, value: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, threshold: parseInt(value) || 0 } : alert
    ));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Alert Settings</h1>

      <div className="grid gap-6">
        {alerts.map(alert => (
          <Card key={alert.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{alert.type}</h3>
                <div className="flex items-center space-x-4">
                  <Label htmlFor={`threshold-${alert.id}`}>Threshold:</Label>
                  <Input
                    id={`threshold-${alert.id}`}
                    type="number"
                    value={alert.threshold}
                    onChange={(e) => updateThreshold(alert.id, e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor={`enabled-${alert.id}`}>
                  {alert.enabled ? 'Enabled' : 'Disabled'}
                </Label>
                <Switch
                  id={`enabled-${alert.id}`}
                  checked={alert.enabled}
                  onCheckedChange={() => toggleAlert(alert.id)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Button variant="outline">
          Test Alerts
        </Button>
      </div>
    </div>
  );
} 