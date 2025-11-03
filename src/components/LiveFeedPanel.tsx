import { Video, Maximize2, Play, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "http://localhost:8000";

export const LiveFeedPanel = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Auto-start stream when component mounts
    startStream();
    
    return () => {
      // Cleanup: stop stream when component unmounts
      stopStream();
    };
  }, []);

  const startStream = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/start_stream`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setIsStreaming(true);
        toast({
          title: "Stream Started",
          description: "Webcam feed is now active",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to start stream",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error starting stream:", error);
      toast({
        title: "Connection Error",
        description: "Make sure the backend server is running on port 8000",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/stop_stream`, {
        method: 'POST',
      });
      setIsStreaming(false);
      toast({
        title: "Stream Stopped",
        description: "Webcam feed has been stopped",
      });
    } catch (error) {
      console.error("Error stopping stream:", error);
    }
  };

  const toggleStream = () => {
    if (isStreaming) {
      stopStream();
    } else {
      startStream();
    }
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Live Feed</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleStream}
            disabled={isLoading}
          >
            {isStreaming ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative aspect-video bg-surface-base">
        {isStreaming ? (
          <img
            ref={imgRef}
            src={`${API_BASE_URL}/api/video_feed`}
            alt="Live webcam feed"
            className="w-full h-full object-contain"
            onError={() => {
              console.error("Error loading video stream");
              toast({
                title: "Stream Error",
                description: "Failed to load video feed",
                variant: "destructive",
              });
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Video className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Connecting to webcam..." : "Click Start to begin streaming"}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className={`inline-block h-2 w-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}`} />
                <span>{isLoading ? "Initializing..." : "Ready"}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* CCTV Label */}
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-surface-elevated/90 backdrop-blur-sm rounded-md border border-border">
          <span className="text-xs font-medium text-foreground">CCTV-1</span>
        </div>

        {/* Live Indicator */}
        {isStreaming && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-destructive/90 backdrop-blur-sm rounded-md">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
            <span className="text-xs font-medium text-destructive-foreground">LIVE</span>
          </div>
        )}

        {/* Detection Overlay */}
        {isStreaming && (
          <div className="absolute bottom-4 left-4 right-4 p-3 bg-surface-elevated/90 backdrop-blur-sm rounded-md border border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Detection Active</span>
              <span className="text-primary font-medium">AI Processing</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
