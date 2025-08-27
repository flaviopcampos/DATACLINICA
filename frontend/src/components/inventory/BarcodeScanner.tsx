'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Camera, 
  CameraOff, 
  Scan, 
  Search, 
  Package, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  RotateCcw,
  Settings,
  Flashlight,
  FlashlightOff,
  Volume2,
  VolumeX,
  History,
  Download,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ScanMode = 'camera' | 'manual' | 'file'
type BarcodeFormat = 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC' | 'QR' | 'DATAMATRIX'

interface ScannedItem {
  id: string
  barcode: string
  name: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  unit: string
  location: string
  lastUpdated: Date
  status: 'found' | 'not_found' | 'low_stock' | 'out_of_stock'
}

interface ScanResult {
  barcode: string
  format: BarcodeFormat
  timestamp: Date
  confidence: number
  item?: ScannedItem
}

interface ScanHistory {
  id: string
  barcode: string
  timestamp: Date
  result: 'success' | 'not_found' | 'error'
  itemName?: string
  action?: 'lookup' | 'entry' | 'exit' | 'adjustment'
}

interface BarcodeScannerProps {
  onScan?: (result: ScanResult) => void
  onItemFound?: (item: ScannedItem) => void
  onItemNotFound?: (barcode: string) => void
  mode?: ScanMode
  autoStart?: boolean
  showHistory?: boolean
  allowManualEntry?: boolean
  allowFileUpload?: boolean
  enableSound?: boolean
  enableFlash?: boolean
  className?: string
}

// Mock data
const mockItems: Record<string, ScannedItem> = {
  '7891234567890': {
    id: '1',
    barcode: '7891234567890',
    name: 'Dipirona 500mg',
    category: 'Analgésicos',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    unit: 'comprimido',
    location: 'A1-B2-C3',
    lastUpdated: new Date(),
    status: 'found'
  },
  '7891234567891': {
    id: '2',
    barcode: '7891234567891',
    name: 'Paracetamol 750mg',
    category: 'Analgésicos',
    currentStock: 25,
    minStock: 50,
    maxStock: 300,
    unit: 'comprimido',
    location: 'A1-B2-C4',
    lastUpdated: new Date(),
    status: 'low_stock'
  },
  '7891234567892': {
    id: '3',
    barcode: '7891234567892',
    name: 'Amoxicilina 500mg',
    category: 'Antibióticos',
    currentStock: 0,
    minStock: 30,
    maxStock: 200,
    unit: 'cápsula',
    location: 'A2-B1-C2',
    lastUpdated: new Date(),
    status: 'out_of_stock'
  }
}

const mockScanHistory: ScanHistory[] = [
  {
    id: '1',
    barcode: '7891234567890',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    result: 'success',
    itemName: 'Dipirona 500mg',
    action: 'lookup'
  },
  {
    id: '2',
    barcode: '7891234567891',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    result: 'success',
    itemName: 'Paracetamol 750mg',
    action: 'entry'
  },
  {
    id: '3',
    barcode: '1234567890123',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    result: 'not_found',
    action: 'lookup'
  }
]

export default function BarcodeScanner({
  onScan,
  onItemFound,
  onItemNotFound,
  mode = 'camera',
  autoStart = false,
  showHistory = true,
  allowManualEntry = true,
  allowFileUpload = true,
  enableSound = true,
  enableFlash = false,
  className
}: BarcodeScannerProps) {
  const [currentMode, setCurrentMode] = useState<ScanMode>(mode)
  const [isScanning, setIsScanning] = useState(false)
  const [isFlashOn, setIsFlashOn] = useState(enableFlash)
  const [isSoundOn, setIsSoundOn] = useState(enableSound)
  const [manualBarcode, setManualBarcode] = useState('')
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null)
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>(mockScanHistory)
  const [error, setError] = useState<string | null>(null)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Initialize camera on component mount if autoStart is true
  useEffect(() => {
    if (autoStart && currentMode === 'camera') {
      startCamera()
    }
    
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setError(null)
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      streamRef.current = stream
      setCameraPermission('granted')
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsScanning(true)
      }
      
    } catch (err) {
      console.error('Error accessing camera:', err)
      setCameraPermission('denied')
      setError('Não foi possível acessar a câmera. Verifique as permissões.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsScanning(false)
  }

  const toggleFlash = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0]
      if (track && 'torch' in track.getCapabilities()) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !isFlashOn } as any]
          })
          setIsFlashOn(!isFlashOn)
        } catch (err) {
          console.error('Error toggling flash:', err)
        }
      }
    }
  }

  const playBeepSound = () => {
    if (isSoundOn) {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'square'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    }
  }

  const processBarcode = (barcode: string, format: BarcodeFormat = 'CODE128') => {
    const result: ScanResult = {
      barcode,
      format,
      timestamp: new Date(),
      confidence: 0.95
    }

    // Look up item in mock data
    const item = mockItems[barcode]
    if (item) {
      result.item = item
      onItemFound?.(item)
      playBeepSound()
      
      // Add to history
      const historyEntry: ScanHistory = {
        id: Date.now().toString(),
        barcode,
        timestamp: new Date(),
        result: 'success',
        itemName: item.name,
        action: 'lookup'
      }
      setScanHistory(prev => [historyEntry, ...prev.slice(0, 9)])
      
    } else {
      onItemNotFound?.(barcode)
      
      // Add to history
      const historyEntry: ScanHistory = {
        id: Date.now().toString(),
        barcode,
        timestamp: new Date(),
        result: 'not_found',
        action: 'lookup'
      }
      setScanHistory(prev => [historyEntry, ...prev.slice(0, 9)])
    }

    setLastScanResult(result)
    onScan?.(result)
  }

  const handleManualScan = () => {
    if (manualBarcode.trim()) {
      processBarcode(manualBarcode.trim())
      setManualBarcode('')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real implementation, you would use a barcode reading library
      // to process the image file. For now, we'll simulate it.
      const reader = new FileReader()
      reader.onload = () => {
        // Simulate barcode detection from image
        const simulatedBarcode = '7891234567890' // This would come from image processing
        processBarcode(simulatedBarcode)
      }
      reader.readAsDataURL(file)
    }
  }

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        // In a real implementation, you would use a barcode reading library
        // like QuaggaJS or ZXing to process the canvas image data
        // For now, we'll simulate detection
        
        // Simulate random barcode detection
        if (Math.random() > 0.7) {
          const barcodes = Object.keys(mockItems)
          const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)]
          processBarcode(randomBarcode)
        }
      }
    }
  }

  // Simulate continuous scanning when camera is active
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isScanning && currentMode === 'camera') {
      interval = setInterval(captureFrame, 1000) // Check every second
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isScanning, currentMode])

  const getStatusColor = (status: ScannedItem['status']) => {
    switch (status) {
      case 'found':
        return 'text-green-600'
      case 'low_stock':
        return 'text-yellow-600'
      case 'out_of_stock':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: ScannedItem['status']) => {
    switch (status) {
      case 'found':
        return <Badge variant="default">Em Estoque</Badge>
      case 'low_stock':
        return <Badge variant="secondary">Estoque Baixo</Badge>
      case 'out_of_stock':
        return <Badge variant="destructive">Sem Estoque</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Scanner de Código de Barras</h3>
          <p className="text-sm text-muted-foreground">
            Escaneie códigos de barras para consultar itens do inventário
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mode Selection */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={currentMode === 'camera' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentMode('camera')}
            >
              <Camera className="h-4 w-4" />
            </Button>
            {allowManualEntry && (
              <Button
                variant={currentMode === 'manual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentMode('manual')}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
            {allowFileUpload && (
              <Button
                variant={currentMode === 'file' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentMode('file')}
              >
                <Upload className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Settings */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSoundOn(!isSoundOn)}
            >
              {isSoundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            
            {currentMode === 'camera' && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFlash}
                disabled={!isScanning}
              >
                {isFlashOn ? <FlashlightOff className="h-4 w-4" /> : <Flashlight className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner Interface */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                {currentMode === 'camera' && 'Scanner de Câmera'}
                {currentMode === 'manual' && 'Entrada Manual'}
                {currentMode === 'file' && 'Upload de Arquivo'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Camera Mode */}
              {currentMode === 'camera' && (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <canvas
                      ref={canvasRef}
                      className="hidden"
                    />
                    
                    {/* Scanning overlay */}
                    {isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="border-2 border-green-500 w-64 h-32 rounded-lg">
                          <div className="w-full h-0.5 bg-red-500 animate-pulse" />
                        </div>
                      </div>
                    )}
                    
                    {/* Status overlay */}
                    <div className="absolute top-4 left-4">
                      {isScanning ? (
                        <Badge variant="default" className="bg-green-600">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                          Escaneando...
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <CameraOff className="w-3 h-3 mr-1" />
                          Câmera Desligada
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    {!isScanning ? (
                      <Button onClick={startCamera} className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Iniciar Câmera
                      </Button>
                    ) : (
                      <Button onClick={stopCamera} variant="outline" className="flex items-center gap-2">
                        <CameraOff className="h-4 w-4" />
                        Parar Câmera
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Manual Mode */}
              {currentMode === 'manual' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite o código de barras..."
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                    />
                    <Button onClick={handleManualScan} disabled={!manualBarcode.trim()}>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                  
                  <div className="text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Digite o código de barras manualmente</p>
                  </div>
                </div>
              )}
              
              {/* File Mode */}
              {currentMode === 'file' && (
                <div className="space-y-4">
                  <div 
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">Clique para selecionar uma imagem</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG até 10MB</p>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results and History */}
        <div className="space-y-6">
          {/* Last Scan Result */}
          {lastScanResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Último Resultado</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLastScanResult(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lastScanResult.item ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      {getStatusBadge(lastScanResult.item.status)}
                    </div>
                    
                    <div>
                      <h4 className="font-medium">{lastScanResult.item.name}</h4>
                      <p className="text-sm text-muted-foreground">{lastScanResult.item.category}</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Código:</span>
                        <span className="font-mono">{lastScanResult.barcode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estoque:</span>
                        <span className={getStatusColor(lastScanResult.item.status)}>
                          {lastScanResult.item.currentStock} {lastScanResult.item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Localização:</span>
                        <span>{lastScanResult.item.location}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <Badge variant="destructive">Não Encontrado</Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm">Código: <span className="font-mono">{lastScanResult.barcode}</span></p>
                      <p className="text-sm text-muted-foreground">Item não encontrado no inventário</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Scan History */}
          {showHistory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scanHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum scan realizado ainda
                    </p>
                  ) : (
                    scanHistory.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {entry.result === 'success' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm font-medium">
                              {entry.itemName || 'Item não encontrado'}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {entry.barcode} • {entry.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}