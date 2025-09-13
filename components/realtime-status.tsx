import { useMemo } from 'react'
import { useRealtimeUpdates } from '@/hooks/use-realtime-updates'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function RealtimeStatus() {
  const { 
    isWebSocketConnected, 
    isWebSocketConnecting, 
    isWebSocketOffline, 
    reconnectAttempts,
    refreshData 
  } = useRealtimeUpdates()

  const statusInfo = useMemo(() => {
    if (isWebSocketConnected) {
      return {
        variant: 'default' as const,
        icon: <CheckCircle className="w-3 h-3" />,
        text: 'Real-time',
        tooltip: 'Connected to real-time updates via WebSocket'
      }
    } else if (isWebSocketConnecting) {
      return {
        variant: 'secondary' as const,
        icon: <RefreshCw className="w-3 h-3 animate-spin" />,
        text: 'Connecting...',
        tooltip: `Establishing WebSocket connection... ${reconnectAttempts > 0 ? `(Attempt ${reconnectAttempts})` : ''}`
      }
    } else {
      return {
        variant: 'destructive' as const,
        icon: <AlertCircle className="w-3 h-3" />,
        text: 'Offline',
        tooltip: 'WebSocket connection failed. Click to refresh data manually.'
      }
    }
  }, [isWebSocketConnected, isWebSocketConnecting, reconnectAttempts])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge variant={statusInfo.variant} className="flex items-center gap-1">
              {statusInfo.icon}
              {statusInfo.text}
            </Badge>
            {isWebSocketOffline && (
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshData}
                className="h-6 px-2 text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{statusInfo.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
