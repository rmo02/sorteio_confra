import { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SpinningWheel } from '../components/spinning-wheel'
import { ThemeToggle } from '../components/theme-toggle'
import { ThemeProvider, useTheme } from '../contexts/theme-context'
import { motion, AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logo from "../assets/grupoMiBranco.png"
import logo2 from "../assets/grupoMiPreto.png"

interface Participant {
  name: string
  registration: string
}

function Sidebar({ participants, position }: { participants: Participant[], position: 'left' | 'right' }) {
  const { theme } = useTheme()

  return (
    <aside className={`fixed ${position}-4 top-4 bottom-4 w-64 overflow-y-auto p-4 rounded-xl ${
      theme === 'dark' ? 'bg-gray-800 text-white shadow-gray-700' : 'bg-white text-black shadow-lg'
    }`}>
      <h2 className="text-xl font-bold mb-4">Sorteados {position === 'left' ? '1-16' : '17-32'}</h2>
      <ul className="space-y-2">
        {participants.map((participant, index) => (
          <li key={index} className={`border-b pb-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className="font-semibold">{participant.name}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {participant.registration}
            </p>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function LotteryContent() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [drawnParticipants, setDrawnParticipants] = useState<Participant[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [showDrawnCard, setShowDrawnCard] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const fetchParticipants = async () => {
      // This would be replaced with an actual API call
      const mockParticipants = Array.from({ length: 50 }, (_, i) => ({
        name: `Participant ${i + 1}`,
        registration: `REG${(i + 1).toString().padStart(5, '0')}`
      }))
      setParticipants(mockParticipants)
    }

    fetchParticipants()
  }, [])

  const drawParticipant = useCallback(() => {
    if (participants.length > 0 && !isSpinning && drawnParticipants.length < 32) {
      setIsSpinning(true)
    }
  }, [participants, isSpinning, drawnParticipants])

  const handleSpinComplete = useCallback(() => {
    setIsSpinning(false)
    const availableParticipants = participants.filter(
      p => !drawnParticipants.some(dp => dp.registration === p.registration)
    )
    if (availableParticipants.length > 0 && drawnParticipants.length < 32) {
      const randomIndex = Math.floor(Math.random() * availableParticipants.length)
      const drawn = availableParticipants[randomIndex]
      setDrawnParticipants(prev => [...prev, drawn])
      setShowDrawnCard(true)
    }
  }, [participants, drawnParticipants])

  const generatePDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Sorteados - Mirante 2024', 20, 20)

    autoTable(doc, {
      startY: 30,
      head: [['Nome', 'Matrícula']],
      body: drawnParticipants.map(participant => [participant.name, participant.registration]),
    })

    doc.save('sorteados.pdf')
  }

  return (
    <div className={`flex min-h-screen pl-4 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'} transition-colors duration-200`}>
      <Sidebar participants={drawnParticipants.slice(0, 16)} position="left" />
      <main className="flex-1 p-8 flex flex-col items-center justify-center relative mx-64">
        <div className="absolute top-4 right-4 mr-5">
          <ThemeToggle />
        </div>
        <AnimatePresence mode="wait">
          {!isSpinning ? (
            <motion.div
              key="image-and-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-8"
            >
              <h1 className="text-2xl font-bold">Sorteio Mirante 2024</h1>
              <img
                src={theme === 'dark' ? logo : logo2}
                alt="Logo"
                width={400}
                height={400}
                className={`rounded-lg opacity-40`}
              />
              <Button 
                onClick={drawParticipant} 
                className="w-64" 
                size="lg"
                disabled={drawnParticipants.length >= 32}
                aria-label="Iniciar sorteio"
              >
                {drawnParticipants.length >= 32 ? 'Sorteio Completo' : 'Sortear'}
              </Button>
              {drawnParticipants.length === 32 && (
                <Button 
                  onClick={generatePDF} 
                  className="w-64 mt-4"
                  size="lg"
                  aria-label="Gerar PDF"
                >
                  Gerar PDF
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="spinning-wheel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SpinningWheel isSpinning={isSpinning} onSpinComplete={handleSpinComplete} />
            </motion.div>
          )}
        </AnimatePresence>
        <p className="mt-4 text-lg font-semibold">
          Sorteados: {drawnParticipants.length} / 32
        </p>
      </main>
      <Sidebar participants={drawnParticipants.slice(16, 32)} position="right" />
    </div>
  )
}

export default function LotteryScreen() {
  return (
    <ThemeProvider>
      <LotteryContent />
    </ThemeProvider>
  )
}
