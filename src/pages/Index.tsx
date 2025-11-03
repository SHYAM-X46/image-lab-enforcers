import { useState } from "react";
import { NavigationSidebar } from "@/components/NavigationSidebar";
import { LiveFeedPanel } from "@/components/LiveFeedPanel";
import { DetectedObjectsPanel } from "@/components/DetectedObjectsPanel";
import { LogsPanel } from "@/components/LogsPanel";
import { DashboardStats } from "@/components/DashboardStats";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                AI-Based Harmful Weapon Detection
              </h1>
              <p className="text-muted-foreground">
                Real-time surveillance and threat detection system
              </p>
            </div>
            <DashboardStats />
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LiveFeedPanel />
              </div>
              <div className="space-y-6">
                <DetectedObjectsPanel />
              </div>
            </div>
            <LogsPanel />
          </div>
        );
      case "live-feed":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Live Feed</h1>
              <p className="text-muted-foreground">Monitor all camera feeds in real-time</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <LiveFeedPanel />
              <LiveFeedPanel />
            </div>
          </div>
        );
      case "detected":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Detected Objects</h1>
              <p className="text-muted-foreground">View all detected threats and alerts</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <DetectedObjectsPanel />
              <DetectedObjectsPanel />
            </div>
          </div>
        );
      case "logs":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Detection Logs</h1>
              <p className="text-muted-foreground">Complete history of all detections</p>
            </div>
            <LogsPanel />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <NavigationSidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
