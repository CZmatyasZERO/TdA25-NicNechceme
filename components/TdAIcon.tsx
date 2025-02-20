import { rem } from "@mantine/core"
import Image from "next/image"

interface TdAIconProps extends React.ComponentPropsWithoutRef<"img"> {
  size?: number
  color: "blue" | "red" | "white" | "black"
  type:
    | "beginner"
    | "duck"
    | "easy"
    | "hard"
    | "medium"
    | "idea"
    | "extreme"
    | "O"
    | "X"
    | "playing"
    | "thinking"
    | "Beginner"
    | "Duck"
    | "Easy"
    | "Hard"
    | "Medium"
    | "Idea"
    | "Extreme"
    | "O"
    | "X"
    | "Playing"
    | "Thinking"
}

export default function TdAIcon({ size, style, type, color = "black", ...props }: TdAIconProps) {
  return (
    <Image
      src={"/icons/" + capitalizeFirstLetter(type) + "/" + color + ".svg"}
      alt="X"
      width={size}
      height={size}
      sizes={rem(size)}
      draggable={false}
    ></Image>
  )
}

function capitalizeFirstLetter(string: string) {
  if (!string) return ""
  return string.charAt(0).toUpperCase() + string.slice(1)
}
