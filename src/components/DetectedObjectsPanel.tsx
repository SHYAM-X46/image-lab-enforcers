import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface Detection {
  class: string;
  confidence: number;
  bbox: number[];
}

const API_BASE_URL = "http://localhost:8000";

export const DetectedObjectsPanel = () => {
  const [detections, setDetections] = useState<Detection[]>([]);

  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/detections`);
        const data = await response.json();
        setDetections(data.detections || []);
      } catch (error) {
        console.error("Error fetching detections:", error);
      }
    };

    // Fetch immediately
    fetchDetections();

    // Update every second
    const interval = setInterval(fetchDetections, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <Card className="bg-card border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold text-foreground">Detected Objects</h2>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {detections.length > 0 ? (
          detections.map((detection, index) => (
            <div
              key={index}
              className="p-4 bg-surface-elevated rounded-lg border border-border hover:border-destructive/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {detection.class}
                </Badge>
                <span className="text-xs text-muted-foreground">{formatTime()}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="text-foreground font-medium">
                    {(detection.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-alert transition-all duration-300"
                    style={{ width: `${detection.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">No threats detected</p>
          </div>
        )}
      </div>
    </Card>
  );
};
