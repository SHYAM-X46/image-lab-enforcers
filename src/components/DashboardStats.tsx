import { Shield, AlertTriangle, Video, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:8000";

export const DashboardStats = () => {
  const [stats, setStats] = useState({
    total_detections: 0,
    active_cameras: 0,
    uptime_hours: 0,
    threat_level: "Low" as string,
    current_detections: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/stats`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStats({
          total_detections: data.total_detections || 0,
          active_cameras: data.active_cameras || 0,
          uptime_hours: data.uptime_hours || 0,
          threat_level: data.threat_level || "Low",
          current_detections: data.current_detections || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Keep default values on error
      }
    };

    // Fetch immediately
    fetchStats();

    // Update every 2 seconds
    const interval = setInterval(fetchStats, 2000);

    return () => clearInterval(interval);
  }, []);

  const getThreatColor = (level: string) => {
    switch (level) {
      case "High":
        return "text-destructive";
      case "Medium":
        return "text-warning";
      default:
        return "text-success";
    }
  };

  const statCards = [
    {
      label: "Total Detections",
      value: stats.total_detections.toString(),
      change: `${stats.current_detections} active`,
      icon: AlertTriangle,
      color: "text-destructive",
    },
    {
      label: "Active Cameras",
      value: stats.active_cameras.toString(),
      change: stats.active_cameras > 0 ? "Online" : "Offline",
      icon: Video,
      color: "text-primary",
    },
    {
      label: "System Uptime",
      value: `${stats.uptime_hours.toFixed(1)}h`,
      change: "Running",
      icon: Activity,
      color: "text-success",
    },
    {
      label: "Threat Level",
      value: stats.threat_level,
      change: stats.threat_level === "Low" ? "Secure" : "Alert",
      icon: Shield,
      color: getThreatColor(stats.threat_level),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="bg-card border-border p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
                <p className={`text-xs font-medium ${stat.color}`}>{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-surface-elevated ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
