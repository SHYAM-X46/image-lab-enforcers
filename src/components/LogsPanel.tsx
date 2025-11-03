import { FileText, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface LogEntry {
  id: string;
  timestamp: string;
  object: string;
  confidence: number;
  location: string;
  status: "high" | "medium" | "low";
}

const API_BASE_URL = "http://localhost:8000";

const getStatusColor = (status: string) => {
  switch (status) {
    case "high":
      return "text-destructive";
    case "medium":
      return "text-warning";
    case "low":
      return "text-success";
    default:
      return "text-muted-foreground";
  }
};

export const LogsPanel = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { toast } = useToast();
  const emailedToastIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/logs`);
        const data = await response.json();
        const incomingLogs: LogEntry[] = data.logs || [];
        setLogs(incomingLogs);

        // Find logs that indicate an email was sent and haven't been toasted yet
        const toToast = incomingLogs.filter(
          (l) => (l as any).email_sent && !emailedToastIdsRef.current.has(l.id)
        );
        for (const entry of toToast) {
          emailedToastIdsRef.current.add(entry.id);
          const pct = Math.round(entry.confidence * 100);
          toast({
            title: "Email Sent",
            description: `${entry.object} detected at ${entry.location} (${pct}%) - Notification dispatched`,
          });
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    // Fetch immediately
    fetchLogs();

    // Update every 2 seconds
    const interval = setInterval(fetchLogs, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const handleExport = () => {
    const csvContent = [
      ["Timestamp", "Object", "Confidence", "Location", "Status"],
      ...logs.map(log => [
        formatTimestamp(log.timestamp),
        log.object,
        `${(log.confidence * 100).toFixed(0)}%`,
        log.location,
        log.status.toUpperCase()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `detection_logs_${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Detection logs have been exported to CSV",
    });
  };

  return (
    <Card className="bg-card border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Detection Logs</h2>
          <span className="text-xs text-muted-foreground">({logs.length} entries)</span>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Timestamp</TableHead>
              <TableHead className="text-muted-foreground">Object</TableHead>
              <TableHead className="text-muted-foreground">Confidence</TableHead>
              <TableHead className="text-muted-foreground">Location</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length > 0 ? (
              logs.slice().reverse().map((log) => (
                <TableRow key={log.id} className="border-border hover:bg-surface-elevated/50">
                  <TableCell className="font-mono text-xs text-foreground">
                    {formatTimestamp(log.timestamp)}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{log.object}</TableCell>
                  <TableCell>
                    <span className="text-foreground">
                      {(log.confidence * 100).toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.location}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${getStatusColor(log.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        log.status === "high" ? "bg-destructive" :
                        log.status === "medium" ? "bg-warning" :
                        "bg-success"
                      }`} />
                      {log.status.toUpperCase()}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No detection logs available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
