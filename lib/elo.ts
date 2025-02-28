type gameResult = "win" | "lose" | "draw"

interface PlayerData {
  elo: number
  wins: number
  losses: number
  draws: number
}

interface ELOChanges {
  win: number
  lose: number
  draw: number
}

export const winProbability = (playerELO: number, opponentELO: number): number => {
  return 1 / (1 + Math.pow(10, (opponentELO - playerELO) / 400))
}

export const getELOChange = (player: PlayerData, opponent: PlayerData, result: gameResult): number => {
  const scoreFactor = result === "win" ? 1 : result === "lose" ? 0 : 0.5

  let WDL = 0.5
  if (player.wins + player.draws + player.losses > 0) {
    WDL = (player.wins + player.draws) / (player.wins + player.draws + player.losses)
  }
  const change = 40 * ((scoreFactor - winProbability(player.elo, opponent.elo)) * (1 + 0.5 * (0.5 - WDL)))
  return Math.ceil(change)
}

export const getNewELO = (player: PlayerData, opponent: PlayerData, result: gameResult): number => {
  const change = getELOChange(player, opponent, result)
  return player.elo + change
}

export const getELOChanges = (player: PlayerData, opponent: PlayerData): ELOChanges => {
  return {
    win: getELOChange(player, opponent, "win"),
    lose: getELOChange(player, opponent, "lose"),
    draw: getELOChange(player, opponent, "draw"),
  }
}
