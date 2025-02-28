"use client"

import { Text } from "@mantine/core"
import { useState, useEffect } from "react"

interface TimeLeftTextProps {
  initialTimeLeft: number
  startCount: boolean
  onCountReachZero?: () => void // Optional callback function
}

export default function TimeLeftText({ initialTimeLeft, startCount, onCountReachZero }: TimeLeftTextProps) {
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft)

  useEffect(() => {
    setTimeLeft(initialTimeLeft) // Reset timeLeft when initialTimeLeft changes
  }, [initialTimeLeft])

  useEffect(() => {
    if (!startCount || initialTimeLeft <= 0) return // Do not start if count is false or initial is zero

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1
        }
        clearInterval(interval)
        if (onCountReachZero) {
          onCountReachZero() // Call callback if provided and count reaches zero
        }
        return 0
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [startCount, initialTimeLeft, onCountReachZero])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <Text size="lg">
      <b>{minutes}</b>:<b>{seconds < 10 ? "0" + seconds : seconds}</b>
    </Text>
  )
}
