'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Maximize2,
  Minimize2,
  Download,
  Upload,
  Zap,
  Thermometer,
  Gauge,
  Server,
  Database,
  Globe,
  Users,
  Clock,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ResourceMetric {
  timestamp: string
  value: number
  unit: string
}

interface ProcessInfo {
  pid: number
  name: string
  cpuUsage: number
  memoryUsage: number // em MB
  status: 'running' | 'sleeping' | 'stopped'
  user: string
  startTime: string
}

interface NetworkInterface {
  name: string
  type: 'ethernet' | 'wifi' | 'loopback' | 'other'
  status: 'up' | 'down'
  ipAddress?: string
  macAddress?: string
  bytesReceived: number
  bytesSent: number
  packetsReceived: number
  packetsSent: number
  errors: number
  drops: number
}

interface DiskInfo {
  device: string
  mountPoint: string
  fileSystem: string
  totalSpace: number // em bytes
  usedSpace: number // em bytes
  availableSpace: number // em bytes
  usagePercentage: number
  inodesTotal?: number
  inodesUsed?: number
  readOperations: number
  writeOperations: number
  readBytes: number
  writeBytes: number
}

interface ResourceData {
  cpu: {
    usage: number // porcentagem
    cores: number
    frequency: number // MHz
    temperature?: number // Celsius
    loadAverage: number[]
    processes: ProcessInfo[]
    history: ResourceMetric[]
  }
  memory: {
    total: number // bytes
    used: number // bytes
    available: number // bytes
    cached: number // bytes
    buffers: number // bytes
    swapTotal: number // bytes
    swapUsed: number // bytes
    usagePercentage: number
    history: ResourceMetric[]
  }
  disk: {
    disks: DiskInfo[]
    totalReadBytes: number
    totalWriteBytes: number
    totalOperations: number
    history: ResourceMetric[]
  }
  network: {
    interfaces: NetworkInterface[]
    totalBytesReceived: number
    totalBytesSent: number
    totalPackets: number
    totalErrors: number
    history: {
      timestamp: string
      bytesReceived: number
      bytesSent: number
    }[]
  }
  system: {
    uptime: number // segundos
    bootTime: string
    users: number
    processes: number
    threads: number
    fileDescriptors: number
    loadAverage: number[]
  }
}

interface ResourceUsageProps {
  data: ResourceData
  isLoading: boolean
  isRealTime: boolean
  refreshInterval: number
  onToggleRealTime: (enabled: boolean) => void
  onRefreshIntervalChange: (interval: number) => void
  onRefresh: () => void
  onKillProcess?: (pid: number) => void
  className?: string
}

function CPUUsageCard({ cpu, isExpanded, onToggleExpand }: { 
  cpu: ResourceData['cpu']
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'text-red-600'
    if (usage >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUsageStatus = (usage: number) => {
    if (usage >= 90) return 'critical'
    if (usage >= 70) return 'warning'
    return 'normal'
  }

  const formatFrequency = (mhz: number) => {
    if (mhz >= 1000) {
      return `${(mhz / 1000).toFixed(1)} GHz`
    }
    return `${mhz} MHz`
  }

  const topProcesses = cpu.processes
    .sort((a, b) => b.cpuUsage - a.cpuUsage)
    .slice(0, 5)

  return (
    <Card className={cn(
      'transition-all duration-200',
      getUsageStatus(cpu.usage) === 'critical' && 'border-red-300 bg-red-50/50',
      getUsageStatus(cpu.usage) === 'warning' && 'border-yellow-300 bg-yellow-50/50'
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold">CPU</CardTitle>
            <Badge className={cn('text-xs font-medium', getUsageColor(cpu.usage))}>
              {cpu.usage.toFixed(1)}%
            </Badge>
          </div>
          
          <Button variant="outline" size="sm" onClick={onToggleExpand}>
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
        
        <CardDescription>
          {cpu.cores} cores • {formatFrequency(cpu.frequency)}
          {cpu.temperature && ` • ${cpu.temperature}°C`}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Barra de progresso */}
        <div className="space-y-2">
          <Progress 
            value={cpu.usage} 
            className={cn(
              'h-3',
              getUsageStatus(cpu.usage) === 'critical' && '[&>div]:bg-red-500',
              getUsageStatus(cpu.usage) === 'warning' && '[&>div]:bg-yellow-500',
              getUsageStatus(cpu.usage) === 'normal' && '[&>div]:bg-green-500'
            )}
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span className="text-yellow-600">⚠ 70%</span>
            <span className="text-red-600">🚨 90%</span>
            <span>100%</span>
          </div>
        </div>
        
        {/* Load Average */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium">{cpu.loadAverage[0]?.toFixed(2) || '0.00'}</div>
            <div className="text-gray-600">1min</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium">{cpu.loadAverage[1]?.toFixed(2) || '0.00'}</div>
            <div className="text-gray-600">5min</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium">{cpu.loadAverage[2]?.toFixed(2) || '0.00'}</div>
            <div className="text-gray-600">15min</div>
          </div>
        </div>
        
        {isExpanded && (
          <>
            {/* Gráfico de histórico */}
            {cpu.history.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Histórico de Uso</Label>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cpu.history}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="timestamp"
                        tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                        className="text-xs"
                      />
                      <YAxis 
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                        className="text-xs"
                      />
                      <Tooltip 
                        labelFormatter={(value) => format(new Date(value), 'dd/MM HH:mm:ss')}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'CPU']}
                      />
                      <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="5 5" />
                      <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="5 5" />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {/* Top processos */}
            {topProcesses.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Top Processos</Label>
                <div className="space-y-1">
                  {topProcesses.map(process => (
                    <div key={process.pid} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div className="flex-1">
                        <div className="font-medium truncate">{process.name}</div>
                        <div className="text-gray-600 text-xs">
                          PID: {process.pid} • {process.user} • {process.status}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{process.cpuUsage.toFixed(1)}%</div>
                        <div className="text-gray-600 text-xs">
                          {(process.memoryUsage / 1024).toFixed(1)} MB
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function MemoryUsageCard({ memory, isExpanded, onToggleExpand }: { 
  memory: ResourceData['memory']
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'text-red-600'
    if (usage >= 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUsageStatus = (usage: number) => {
    if (usage >= 90) return 'critical'
    if (usage >= 80) return 'warning'
    return 'normal'
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const swapUsagePercentage = memory.swapTotal > 0 ? (memory.swapUsed / memory.swapTotal) * 100 : 0

  const memoryBreakdown = [
    { name: 'Usado', value: memory.used, color: '#ef4444' },
    { name: 'Cache', value: memory.cached, color: '#f59e0b' },
    { name: 'Buffers', value: memory.buffers, color: '#10b981' },
    { name: 'Livre', value: memory.available, color: '#6b7280' }
  ]

  return (
    <Card className={cn(
      'transition-all duration-200',
      getUsageStatus(memory.usagePercentage) === 'critical' && 'border-red-300 bg-red-50/50',
      getUsageStatus(memory.usagePercentage) === 'warning' && 'border-yellow-300 bg-yellow-50/50'
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MemoryStick className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg font-semibold">Memória</CardTitle>
            <Badge className={cn('text-xs font-medium', getUsageColor(memory.usagePercentage))}>
              {memory.usagePercentage.toFixed(1)}%
            </Badge>
          </div>
          
          <Button variant="outline" size="sm" onClick={onToggleExpand}>
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
        
        <CardDescription>
          {formatBytes(memory.used)} / {formatBytes(memory.total)} usado
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Barra de progresso */}
        <div className="space-y-2">
          <Progress 
            value={memory.usagePercentage} 
            className={cn(
              'h-3',
              getUsageStatus(memory.usagePercentage) === 'critical' && '[&>div]:bg-red-500',
              getUsageStatus(memory.usagePercentage) === 'warning' && '[&>div]:bg-yellow-500',
              getUsageStatus(memory.usagePercentage) === 'normal' && '[&>div]:bg-green-500'
            )}
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span className="text-yellow-600">⚠ 80%</span>
            <span className="text-red-600">🚨 90%</span>
            <span>100%</span>
          </div>
        </div>
        
        {/* Estatísticas básicas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Disponível</div>
            <div className="font-medium">{formatBytes(memory.available)}</div>
          </div>
          <div>
            <div className="text-gray-600">Cache</div>
            <div className="font-medium">{formatBytes(memory.cached)}</div>
          </div>
        </div>
        
        {/* Swap */}
        {memory.swapTotal > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Swap</Label>
              <span className="text-sm font-medium">
                {formatBytes(memory.swapUsed)} / {formatBytes(memory.swapTotal)}
              </span>
            </div>
            <Progress value={swapUsagePercentage} className="h-2" />
          </div>
        )}
        
        {isExpanded && (
          <>
            {/* Gráfico de histórico */}
            {memory.history.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Histórico de Uso</Label>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={memory.history}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="timestamp"
                        tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                        className="text-xs"
                      />
                      <YAxis 
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                        className="text-xs"
                      />
                      <Tooltip 
                        labelFormatter={(value) => format(new Date(value), 'dd/MM HH:mm:ss')}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Memória']}
                      />
                      <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="5 5" />
                      <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="5 5" />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {/* Breakdown da memória */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Distribuição da Memória</Label>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={memoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {memoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatBytes(value)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                {memoryBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}: {formatBytes(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function DiskUsageCard({ disk, isExpanded, onToggleExpand }: { 
  disk: ResourceData['disk']
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const totalSpace = disk.disks.reduce((sum, d) => sum + d.totalSpace, 0)
  const totalUsed = disk.disks.reduce((sum, d) => sum + d.usedSpace, 0)
  const totalUsagePercentage = totalSpace > 0 ? (totalUsed / totalSpace) * 100 : 0

  const getUsageColor = (usage: number) => {
    if (usage >= 95) return 'text-red-600'
    if (usage >= 85) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUsageStatus = (usage: number) => {
    if (usage >= 95) return 'critical'
    if (usage >= 85) return 'warning'
    return 'normal'
  }

  return (
    <Card className={cn(
      'transition-all duration-200',
      getUsageStatus(totalUsagePercentage) === 'critical' && 'border-red-300 bg-red-50/50',
      getUsageStatus(totalUsagePercentage) === 'warning' && 'border-yellow-300 bg-yellow-50/50'
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg font-semibold">Armazenamento</CardTitle>
            <Badge className={cn('text-xs font-medium', getUsageColor(totalUsagePercentage))}>
              {totalUsagePercentage.toFixed(1)}%
            </Badge>
          </div>
          
          <Button variant="outline" size="sm" onClick={onToggleExpand}>
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
        
        <CardDescription>
          {formatBytes(totalUsed)} / {formatBytes(totalSpace)} usado • {disk.disks.length} discos
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Barra de progresso geral */}
        <div className="space-y-2">
          <Progress 
            value={totalUsagePercentage} 
            className={cn(
              'h-3',
              getUsageStatus(totalUsagePercentage) === 'critical' && '[&>div]:bg-red-500',
              getUsageStatus(totalUsagePercentage) === 'warning' && '[&>div]:bg-yellow-500',
              getUsageStatus(totalUsagePercentage) === 'normal' && '[&>div]:bg-green-500'
            )}
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span className="text-yellow-600">⚠ 85%</span>
            <span className="text-red-600">🚨 95%</span>
            <span>100%</span>
          </div>
        </div>
        
        {/* Estatísticas de I/O */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium">{formatBytes(disk.totalReadBytes)}</div>
            <div className="text-gray-600">Lido</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium">{formatBytes(disk.totalWriteBytes)}</div>
            <div className="text-gray-600">Escrito</div>
          </div>
        </div>
        
        {isExpanded && (
          <>
            {/* Lista de discos */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Discos ({disk.disks.length})</Label>
              <div className="space-y-2">
                {disk.disks.map((diskInfo, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{diskInfo.device}</div>
                        <div className="text-sm text-gray-600">
                          {diskInfo.mountPoint} • {diskInfo.fileSystem}
                        </div>
                      </div>
                      <Badge className={cn(
                        'text-xs',
                        getUsageColor(diskInfo.usagePercentage)
                      )}>
                        {diskInfo.usagePercentage.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <Progress 
                      value={diskInfo.usagePercentage} 
                      className={cn(
                        'h-2',
                        getUsageStatus(diskInfo.usagePercentage) === 'critical' && '[&>div]:bg-red-500',
                        getUsageStatus(diskInfo.usagePercentage) === 'warning' && '[&>div]:bg-yellow-500',
                        getUsageStatus(diskInfo.usagePercentage) === 'normal' && '[&>div]:bg-green-500'
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>
                        <span>Total: </span>
                        <span className="font-medium">{formatBytes(diskInfo.totalSpace)}</span>
                      </div>
                      <div>
                        <span>Usado: </span>
                        <span className="font-medium">{formatBytes(diskInfo.usedSpace)}</span>
                      </div>
                      <div>
                        <span>Livre: </span>
                        <span className="font-medium">{formatBytes(diskInfo.availableSpace)}</span>
                      </div>
                    </div>
                    
                    {/* I/O do disco */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <Download className="h-3 w-3" />
                        <span>{formatBytes(diskInfo.readBytes)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Upload className="h-3 w-3" />
                        <span>{formatBytes(diskInfo.writeBytes)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Gráfico de histórico de I/O */}
            {disk.history.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Histórico de I/O</Label>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={disk.history}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="timestamp"
                        tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                        className="text-xs"
                      />
                      <YAxis 
                        tickFormatter={(value) => formatBytes(value)}
                        className="text-xs"
                      />
                      <Tooltip 
                        labelFormatter={(value) => format(new Date(value), 'dd/MM HH:mm:ss')}
                        formatter={(value: number) => [formatBytes(value), 'I/O']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function NetworkUsageCard({ network, isExpanded, onToggleExpand }: { 
  network: ResourceData['network']
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const activeInterfaces = network.interfaces.filter(iface => iface.status === 'up')
  const totalBandwidth = network.totalBytesReceived + network.totalBytesSent

  const getInterfaceIcon = (type: string) => {
    switch (type) {
      case 'wifi': return Globe
      case 'ethernet': return Network
      default: return Activity
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Network className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold">Rede</CardTitle>
            <Badge variant="outline" className="text-xs">
              {activeInterfaces.length} ativas
            </Badge>
          </div>
          
          <Button variant="outline" size="sm" onClick={onToggleExpand}>
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
        
        <CardDescription>
          {formatBytes(totalBandwidth)} transferidos • {network.totalErrors} erros
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estatísticas gerais */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium flex items-center justify-center space-x-1">
              <Download className="h-4 w-4" />
              <span>{formatBytes(network.totalBytesReceived)}</span>
            </div>
            <div className="text-gray-600">Recebido</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium flex items-center justify-center space-x-1">
              <Upload className="h-4 w-4" />
              <span>{formatBytes(network.totalBytesSent)}</span>
            </div>
            <div className="text-gray-600">Enviado</div>
          </div>
        </div>
        
        {isExpanded && (
          <>
            {/* Lista de interfaces */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Interfaces ({network.interfaces.length})</Label>
              <div className="space-y-2">
                {network.interfaces.map((iface, index) => {
                  const InterfaceIcon = getInterfaceIcon(iface.type)
                  
                  return (
                    <div key={index} className="p-3 bg-gray-50 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <InterfaceIcon className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">{iface.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {iface.type}
                          </Badge>
                        </div>
                        
                        <Badge className={cn(
                          'text-xs',
                          iface.status === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        )}>
                          {iface.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      {iface.ipAddress && (
                        <div className="text-sm text-gray-600">
                          IP: {iface.ipAddress}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="text-gray-600">Recebido</div>
                          <div className="font-medium">
                            {formatBytes(iface.bytesReceived)} ({iface.packetsReceived.toLocaleString()} pacotes)
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Enviado</div>
                          <div className="font-medium">
                            {formatBytes(iface.bytesSent)} ({iface.packetsSent.toLocaleString()} pacotes)
                          </div>
                        </div>
                      </div>
                      
                      {(iface.errors > 0 || iface.drops > 0) && (
                        <div className="flex items-center space-x-4 text-xs text-red-600">
                          {iface.errors > 0 && <span>Erros: {iface.errors}</span>}
                          {iface.drops > 0 && <span>Drops: {iface.drops}</span>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Gráfico de tráfego */}
            {network.history.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tráfego de Rede</Label>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={network.history}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="timestamp"
                        tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                        className="text-xs"
                      />
                      <YAxis 
                        tickFormatter={(value) => formatBytes(value)}
                        className="text-xs"
                      />
                      <Tooltip 
                        labelFormatter={(value) => format(new Date(value), 'dd/MM HH:mm:ss')}
                        formatter={(value: number, name: string) => [
                          formatBytes(value), 
                          name === 'bytesReceived' ? 'Recebido' : 'Enviado'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bytesReceived" 
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        name="bytesReceived"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bytesSent" 
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        name="bytesSent"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function ResourceUsage({
  data,
  isLoading,
  isRealTime,
  refreshInterval,
  onToggleRealTime,
  onRefreshIntervalChange,
  onRefresh,
  onKillProcess,
  className
}: ResourceUsageProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header com controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center space-x-2">
                <Activity className="h-6 w-6" />
                <span>Uso de Recursos</span>
              </CardTitle>
              
              <CardDescription>
                Uptime: {formatUptime(data.system.uptime)} • 
                {data.system.users} usuários • 
                {data.system.processes} processos
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Tempo real */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isRealTime}
                  onCheckedChange={onToggleRealTime}
                />
                <Label className="text-sm">Tempo Real</Label>
                
                {isRealTime && (
                  <select
                    value={refreshInterval}
                    onChange={(e) => onRefreshIntervalChange(parseInt(e.target.value))}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value={1}>1s</option>
                    <option value={5}>5s</option>
                    <option value={10}>10s</option>
                    <option value={30}>30s</option>
                  </select>
                )}
              </div>
              
              {/* Refresh manual */}
              <Button onClick={onRefresh} disabled={isLoading}>
                <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
                Atualizar
              </Button>
            </div>
          </div>
          
          {/* Estatísticas do sistema */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{data.system.processes}</div>
              <div className="text-sm text-gray-600">Processos</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{data.system.threads}</div>
              <div className="text-sm text-gray-600">Threads</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{data.system.users}</div>
              <div className="text-sm text-gray-600">Usuários</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{data.system.fileDescriptors}</div>
              <div className="text-sm text-gray-600">File Descriptors</div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Cards de recursos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CPUUsageCard 
          cpu={data.cpu}
          isExpanded={expandedCards.has('cpu')}
          onToggleExpand={() => toggleCardExpansion('cpu')}
        />
        
        <MemoryUsageCard 
          memory={data.memory}
          isExpanded={expandedCards.has('memory')}
          onToggleExpand={() => toggleCardExpansion('memory')}
        />
        
        <DiskUsageCard 
          disk={data.disk}
          isExpanded={expandedCards.has('disk')}
          onToggleExpand={() => toggleCardExpansion('disk')}
        />
        
        <NetworkUsageCard 
          network={data.network}
          isExpanded={expandedCards.has('network')}
          onToggleExpand={() => toggleCardExpansion('network')}
        />
      </div>
    </div>
  )
}

export default ResourceUsage