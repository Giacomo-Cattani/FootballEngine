import { common } from '../lib/common.js';
import { setVariables } from '../lib/setVariables.js';
import { setFreekicks } from '../lib/setFreekicks.js';

/**
 * Sets the goalkeeper as the player who has the ball in a football match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} thisGoalie - The goalkeeper object.
 * @returns {Object} The updated match details with the goalkeeper having the ball.
 */
function setGoalieHasBall(matchDetails, thisGoalie) {
  let { kickOffTeam, secondTeam } = matchDetails
  let team = (kickOffTeam.players[0].playerID == thisGoalie.playerID) ? kickOffTeam : secondTeam
  let opposition = (kickOffTeam.players[0].playerID == thisGoalie.playerID) ? secondTeam : kickOffTeam
  thisGoalie.hasBall = true
  matchDetails.ball.lastTouch.playerName = thisGoalie.name
  matchDetails.ball.lastTouch.playerID = thisGoalie.playerID
  matchDetails.ball.lastTouch.teamID = team.teamID
  let tempArray = thisGoalie.currentPOS
  matchDetails.ball.position = tempArray.map(x => x)
  matchDetails.ball.Player = thisGoalie.playerID
  matchDetails.ball.withPlayer = true
  matchDetails.ball.withTeam = team.teamID
  team.intent = 'attack'
  opposition.intent = 'defend'
  matchDetails.ball.ballOverIterations = []
  return matchDetails
}

/**
 * Sets the positions for the top right corner in a football match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @returns {Object} The updated match details with positions set.
 */
function setTopRightCornerPositions(matchDetails) {
  common.removeBallFromAllPlayers(matchDetails)
  let [pitchWidth] = matchDetails.pitchSize
  let kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1]
  let halfPitchSize = (matchDetails.pitchSize[1] / 2)
  let attack = (kickOffTeamKeepYPos > halfPitchSize) ? matchDetails.kickOffTeam : matchDetails.secondTeam
  let defence = (kickOffTeamKeepYPos > halfPitchSize) ? matchDetails.secondTeam : matchDetails.kickOffTeam
  for (let playerNum of [0, 1, 2, 3, 4]) {
    attack.players[playerNum].currentPOS = attack.players[playerNum].originPOS.map(x => x)
    defence.players[playerNum].currentPOS = defence.players[playerNum].originPOS.map(x => x)
  }
  for (let playerNum of [5, 6, 7, 8, 9, 10]) {
    attack.players[playerNum].currentPOS = common.getRandomTopPenaltyPosition(matchDetails)
    defence.players[playerNum].currentPOS = common.getRandomTopPenaltyPosition(matchDetails)
  }
  attack.players[1].currentPOS = [pitchWidth, 0]
  attack.players[4].currentPOS = [pitchWidth - 10, 20]
  defence.players[4].currentPOS = [pitchWidth - 12, 10]
  matchDetails.ball.position = [pitchWidth, 0, 0]
  setBallSpecificCornerValue(matchDetails, attack)
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the positions of players for the top left corner scenario in a football match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @returns {Object} The updated match details with player positions set.
 */
function setTopLeftCornerPositions(matchDetails) {
  common.removeBallFromAllPlayers(matchDetails)
  let kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1]
  let halfPitchSize = matchDetails.pitchSize[1] / 2
  let attack = (kickOffTeamKeepYPos > halfPitchSize) ? matchDetails.kickOffTeam : matchDetails.secondTeam
  let defence = (kickOffTeamKeepYPos > halfPitchSize) ? matchDetails.secondTeam : matchDetails.kickOffTeam
  for (let playerNum of [0, 1, 2, 3, 4]) {
    attack.players[playerNum].currentPOS = attack.players[playerNum].originPOS.map(x => x)
    defence.players[playerNum].currentPOS = defence.players[playerNum].originPOS.map(x => x)
  }
  for (let playerNum of [5, 6, 7, 8, 9, 10]) {
    attack.players[playerNum].currentPOS = common.getRandomTopPenaltyPosition(matchDetails)
    defence.players[playerNum].currentPOS = common.getRandomTopPenaltyPosition(matchDetails)
  }
  attack.players[1].currentPOS = [0, 0]
  attack.players[4].currentPOS = [10, 20]
  defence.players[1].currentPOS = [12, 10]
  matchDetails.ball.position = [0, 0, 0]
  setBallSpecificCornerValue(matchDetails, attack)
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the positions of players for the bottom left corner in a football match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @returns {Object} The updated match details with player positions set.
 */
function setBottomLeftCornerPositions(matchDetails) {
  common.removeBallFromAllPlayers(matchDetails)
  let [, pitchHeight] = matchDetails.pitchSize
  let kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1]
  let halfPitchSize = matchDetails.pitchSize[1] / 2
  let attack = (kickOffTeamKeepYPos < halfPitchSize) ? matchDetails.kickOffTeam : matchDetails.secondTeam
  let defence = (kickOffTeamKeepYPos < halfPitchSize) ? matchDetails.secondTeam : matchDetails.kickOffTeam
  for (let playerNum of [0, 1, 2, 3, 4]) {
    attack.players[playerNum].currentPOS = attack.players[playerNum].originPOS.map(x => x)
    defence.players[playerNum].currentPOS = defence.players[playerNum].originPOS.map(x => x)
  }
  for (let playerNum of [5, 6, 7, 8, 9, 10]) {
    attack.players[playerNum].currentPOS = common.getRandomBottomPenaltyPosition(matchDetails)
    defence.players[playerNum].currentPOS = common.getRandomBottomPenaltyPosition(matchDetails)
  }
  attack.players[1].currentPOS = [0, pitchHeight]
  attack.players[4].currentPOS = [10, pitchHeight - 20]
  defence.players[1].currentPOS = [12, pitchHeight - 10]
  matchDetails.ball.position = [0, pitchHeight, 0]
  setBallSpecificCornerValue(matchDetails, attack)
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the positions of players for the bottom right corner in a football match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @returns {Object} The updated match details with player positions set.
 */
function setBottomRightCornerPositions(matchDetails) {
  common.removeBallFromAllPlayers(matchDetails)
  let [pitchWidth, pitchHeight] = matchDetails.pitchSize
  let kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1]
  let halfPitchSize = matchDetails.pitchSize[1] / 2
  let attack = (kickOffTeamKeepYPos < halfPitchSize) ? matchDetails.kickOffTeam : matchDetails.secondTeam
  let defence = (kickOffTeamKeepYPos < halfPitchSize) ? matchDetails.secondTeam : matchDetails.kickOffTeam
  for (let playerNum of [0, 1, 2, 3, 4]) {
    attack.players[playerNum].currentPOS = attack.players[playerNum].originPOS.map(x => x)
    defence.players[playerNum].currentPOS = defence.players[playerNum].originPOS.map(x => x)
  }
  for (let playerNum of [5, 6, 7, 8, 9, 10]) {
    attack.players[playerNum].currentPOS = common.getRandomBottomPenaltyPosition(matchDetails)
    defence.players[playerNum].currentPOS = common.getRandomBottomPenaltyPosition(matchDetails)
  }
  attack.players[1].currentPOS = [pitchWidth, pitchHeight]
  attack.players[4].currentPOS = [pitchWidth - 10, pitchHeight - 20]
  defence.players[4].currentPOS = [pitchWidth - 12, pitchHeight - 10]
  matchDetails.ball.position = [pitchWidth, pitchHeight, 0]
  setBallSpecificCornerValue(matchDetails, attack)
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the specific corner value for the ball in the match details.
 * @function
 * @param {Object} matchDetails - The match details object.
 * @param {Object} attack - The attack object.
 */
function setBallSpecificCornerValue(matchDetails, attack) {
  attack.players[1].hasBall = true
  matchDetails.ball.lastTouch.playerName = attack.players[1].name
  matchDetails.ball.lastTouch.playerID = attack.players[1].playerID
  matchDetails.ball.lastTouch.teamID = attack.teamID
  matchDetails.ball.ballOverIterations = []
  matchDetails.ball.withPlayer = true
  matchDetails.ball.Player = attack.players[1].playerID
  matchDetails.ball.withTeam = attack.teamID
  matchDetails.iterationLog.push(`Corner to - ${attack.name}`)
}

/**
 * Sets the positions for the left kick-off team during a throw-in event.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Array} ballIntended - The intended position of the ball.
 * @returns {Object} The updated match details.
 */
function setLeftKickOffTeamThrowIn(matchDetails, ballIntended) {
  common.removeBallFromAllPlayers(matchDetails)
  let { kickOffTeam, secondTeam } = matchDetails
  let [, place] = ballIntended
  const [, pitchHeight] = matchDetails.pitchSize
  place = ((place - 30) < 0) ? 30 : place
  place = ((place + 10) > (pitchHeight + 1)) ? (pitchHeight - 10) : place
  let movement = kickOffTeam.players[5].originPOS[1] - place
  let oppMovement = 0 - movement
  ballThrowInPosition(matchDetails, kickOffTeam)
  setPlayerPositions(matchDetails, kickOffTeam, movement)
  setPlayerPositions(matchDetails, secondTeam, oppMovement)
  attackLeftThrowInPlayerPosition(pitchHeight, kickOffTeam, place)
  defenceLeftThrowInPlayerPosition(pitchHeight, secondTeam, place)
  matchDetails.ball.position = [0, place, 0]
  kickOffTeam.players[5].currentPOS = matchDetails.ball.position.map(x => x)
  matchDetails.ball.lastTouch.playerName = kickOffTeam.players[5].name
  matchDetails.ball.lastTouch.playerID = kickOffTeam.players[5].playerID
  matchDetails.ball.lastTouch.teamID = kickOffTeam.teamID
  kickOffTeam.players[5].currentPOS.pop()
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the positions for the right kick-off team during a throw-in.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Array} ballIntended - The intended position of the ball.
 * @returns {Object} The updated match details.
 */
function setRightKickOffTeamThrowIn(matchDetails, ballIntended) {
  common.removeBallFromAllPlayers(matchDetails)
  let { kickOffTeam, secondTeam } = matchDetails
  let [, place] = ballIntended
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize
  place = ((place - 30) < 0) ? 30 : place
  place = ((place + 10) > (pitchHeight + 1)) ? (pitchHeight - 10) : place
  let movement = kickOffTeam.players[5].originPOS[1] - place
  let oppMovement = 0 - movement
  ballThrowInPosition(matchDetails, kickOffTeam)
  setPlayerPositions(matchDetails, kickOffTeam, movement)
  setPlayerPositions(matchDetails, secondTeam, oppMovement)
  attackRightThrowInPlayerPosition(matchDetails.pitchSize, kickOffTeam, place)
  defenceRightThrowInPlayerPosition(matchDetails.pitchSize, secondTeam, place)
  matchDetails.ball.position = [pitchWidth, place, 0]
  kickOffTeam.players[5].currentPOS = matchDetails.ball.position.map(x => x)
  matchDetails.ball.lastTouch.playerName = kickOffTeam.players[5].name
  matchDetails.ball.lastTouch.playerID = kickOffTeam.players[5].playerID
  matchDetails.ball.lastTouch.teamID = kickOffTeam.teamID
  kickOffTeam.players[5].currentPOS.pop()
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the positions for the left second team throw-in in a football match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Array} ballIntended - The intended position of the ball.
 * @returns {Object} The updated match details.
 */
function setLeftSecondTeamThrowIn(matchDetails, ballIntended) {
  common.removeBallFromAllPlayers(matchDetails)
  let { kickOffTeam, secondTeam } = matchDetails
  let [, place] = ballIntended
  const [, pitchHeight] = matchDetails.pitchSize
  place = ((place - 30) < 0) ? 30 : place
  place = ((place + 10) > (pitchHeight + 1)) ? (pitchHeight - 10) : place
  let movement = secondTeam.players[5].originPOS[1] - place
  let oppMovement = 0 - movement
  ballThrowInPosition(matchDetails, secondTeam)
  setPlayerPositions(matchDetails, secondTeam, movement)
  setPlayerPositions(matchDetails, kickOffTeam, oppMovement)
  attackLeftThrowInPlayerPosition(pitchHeight, secondTeam, place)
  defenceLeftThrowInPlayerPosition(pitchHeight, kickOffTeam, place)
  matchDetails.ball.position = [0, place, 0]
  secondTeam.players[5].currentPOS = matchDetails.ball.position.map(x => x)
  matchDetails.ball.lastTouch.playerName = secondTeam.players[5].name
  matchDetails.ball.lastTouch.playerID = secondTeam.players[5].playerID
  matchDetails.ball.lastTouch.teamID = secondTeam.teamID
  secondTeam.players[5].currentPOS.pop()
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the positions for the right second team throw-in in a football match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Array} ballIntended - The intended position of the ball.
 * @returns {Object} The updated match details.
 */
function setRightSecondTeamThrowIn(matchDetails, ballIntended) {
  common.removeBallFromAllPlayers(matchDetails)
  let { kickOffTeam, secondTeam } = matchDetails
  let [, place] = ballIntended
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize
  place = ((place - 30) < 0) ? 30 : place
  place = ((place + 10) > (pitchHeight + 1)) ? (pitchHeight - 10) : place
  let movement = secondTeam.players[5].originPOS[1] - place
  let oppMovement = 0 - movement
  ballThrowInPosition(matchDetails, secondTeam)
  setPlayerPositions(matchDetails, secondTeam, movement)
  setPlayerPositions(matchDetails, kickOffTeam, oppMovement)
  attackRightThrowInPlayerPosition(matchDetails.pitchSize, secondTeam, place)
  defenceRightThrowInPlayerPosition(matchDetails.pitchSize, kickOffTeam, place)
  matchDetails.ball.position = [pitchWidth, place, 0]
  secondTeam.players[5].currentPOS = matchDetails.ball.position.map(x => x)
  matchDetails.ball.lastTouch.playerName = secondTeam.players[5].name
  matchDetails.ball.lastTouch.playerID = secondTeam.players[5].playerID
  matchDetails.ball.lastTouch.teamID = secondTeam.teamID
  secondTeam.players[5].currentPOS.pop()
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the position of the ball during a throw-in in a football match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} attack - The attacking team details.
 */
function ballThrowInPosition(matchDetails, attack) {
  matchDetails.ball.ballOverIterations = []
  matchDetails.ball.withPlayer = true
  matchDetails.ball.Player = attack.players[5].playerID
  matchDetails.ball.withTeam = attack.teamID
  matchDetails.iterationLog.push(`Throw in to - ${attack.name}`)
}

/**
 * Sets the positions of players during a left throw-in attack.
 * @function
 * @param {number} pitchHeight - The height of the pitch.
 * @param {object} attack - The attack object containing player positions.
 * @param {number} place - The initial position of the throw-in.
 */
function attackLeftThrowInPlayerPosition(pitchHeight, attack, place) {
  attack.players[8].currentPOS = [15, place]
  attack.players[7].currentPOS = [10, common.upToMax(place + 10, pitchHeight)]
  attack.players[9].currentPOS = [10, common.upToMin(place - 10, 0)]
  attack.players[5].hasBall = true
}

/**
 * Sets the positions of the players in the defence team for a left throw-in.
 * @function
 * @param {number} pitchHeight - The height of the pitch.
 * @param {object} defence - The defence team object.
 * @param {number} place - The position of the throw-in.
 */
function defenceLeftThrowInPlayerPosition(pitchHeight, defence, place) {
  defence.players[5].currentPOS = [20, place]
  defence.players[7].currentPOS = [30, common.upToMax(place + 5, pitchHeight)]
  defence.players[8].currentPOS = [25, common.upToMin(place - 15, 0)]
  defence.players[9].currentPOS = [10, common.upToMin(place - 30, 0)]
}

/**
 * Sets the positions of players for a right throw-in attack.
 * @function
 * @param {Array<number>} pitchSize - The size of the pitch (width and height).
 * @param {Object} attack - The attack object containing player positions.
 * @param {number} place - The initial position of the throw-in.
 */
function attackRightThrowInPlayerPosition(pitchSize, attack, place) {
  const [pitchWidth, pitchHeight] = pitchSize
  attack.players[8].currentPOS = [pitchWidth - 15, place]
  attack.players[7].currentPOS = [pitchWidth - 10, common.upToMax(place + 10, pitchHeight)]
  attack.players[9].currentPOS = [pitchWidth - 10, common.upToMin(place - 10, 0)]
  attack.players[5].hasBall = true
}

/**
 * Sets the positions of players in the defence team for a right throw-in.
 * @function
 * @param {Array<number>} pitchSize - The size of the pitch as an array of two numbers [pitchWidth, pitchHeight].
 * @param {Object} defence - The defence team object.
 * @param {number} place - The position of the throw-in.
 */
function defenceRightThrowInPlayerPosition(pitchSize, defence, place) {
  const [pitchWidth, pitchHeight] = pitchSize
  defence.players[5].currentPOS = [pitchWidth - 20, place]
  defence.players[7].currentPOS = [pitchWidth - 30, common.upToMax(place + 5, pitchHeight)]
  defence.players[8].currentPOS = [pitchWidth - 25, common.upToMin(place - 15, 0)]
  defence.players[9].currentPOS = [pitchWidth - 10, common.upToMin(place - 30, 0)]
}

/**
 * Sets the positions for a bottom goal kick in a football match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @returns {Object} The updated match details with the positions set for the bottom goal kick.
 */
function setBottomGoalKick(matchDetails) {
  let kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1]
  let halfPitchSize = matchDetails.pitchSize[1] / 2
  let attack = (kickOffTeamKeepYPos > halfPitchSize) ? matchDetails.kickOffTeam : matchDetails.secondTeam
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize
  common.removeBallFromAllPlayers(matchDetails)
  setVariables.resetPlayerPositions(matchDetails)
  setPlayerPositions(matchDetails, attack, -80)
  matchDetails.ball.position = [pitchWidth / 2, pitchHeight - 20, 0]
  setBallSpecificGoalKickValue(matchDetails, attack)
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the positions and other details for a top goal kick in a football match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @returns {Object} The updated match details after setting the positions and other details.
 */
function setTopGoalKick(matchDetails) {
  let kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1]
  let halfPitchSize = matchDetails.pitchSize[1] / 2
  let attack = (kickOffTeamKeepYPos > halfPitchSize) ? matchDetails.secondTeam : matchDetails.kickOffTeam
  const [pitchWidth] = matchDetails.pitchSize
  common.removeBallFromAllPlayers(matchDetails)
  setVariables.resetPlayerPositions(matchDetails)
  setPlayerPositions(matchDetails, attack, 80)
  matchDetails.ball.position = [pitchWidth / 2, 20, 0]
  setBallSpecificGoalKickValue(matchDetails, attack)
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the specific goal kick value for the ball in the match details.
 * @function
 * @param {Object} matchDetails - The match details object.
 * @param {Object} attack - The attack object.
 */
function setBallSpecificGoalKickValue(matchDetails, attack) {
  attack.players[0].currentPOS = matchDetails.ball.position.map(x => x)
  attack.players[0].currentPOS.pop()
  attack.players[0].hasBall = true
  matchDetails.ball.lastTouch.playerName = attack.players[0].name
  matchDetails.ball.lastTouch.playerID = attack.players[0].playerID
  matchDetails.ball.lastTouch.teamID = attack.teamID
  matchDetails.ball.ballOverIterations = []
  matchDetails.ball.withPlayer = true
  matchDetails.ball.Player = attack.players[0].playerID
  matchDetails.ball.withTeam = attack.teamID
  matchDetails.iterationLog.push(`Goal Kick to - ${attack.name}`)
}

/**
 * Finds the closest player to a given position on a team.
 * @function
 * @param {Object} player - The player object.
 * @param {Object} team - The team object.
 * @param {Array} position - The position to find the closest player to.
 * @returns {Object} An object containing information about the closest player.
 */
function closestPlayerToPosition(player, team, position) {
  let currentDifference = 1000000
  let playerInformation = {
    'thePlayer': ``,
    'proxPOS': [``, ``],
    'proxToBall': ''
  }
  for (const thisPlayer of team.players) {
    if (player.playerID !== thisPlayer.playerID) {
      let ballToPlayerX = thisPlayer.currentPOS[0] - position[0]
      let ballToPlayerY = thisPlayer.currentPOS[1] - position[1]
      let proximityToBall = Math.abs(ballToPlayerX) + Math.abs(ballToPlayerY)
      if (proximityToBall < currentDifference) {
        playerInformation.thePlayer = thisPlayer
        playerInformation.proxPOS = [ballToPlayerX, ballToPlayerY]
        playerInformation.proxToBall = proximityToBall
        currentDifference = proximityToBall
      }
    }
  }
  return playerInformation
}

/**
 * Sets the setpiece kick-off team based on the given match details.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @returns {Object} The updated match details after setting the setpiece kick-off team.
 */
function setSetpieceKickOffTeam(matchDetails) {
  const [, pitchHeight] = matchDetails.pitchSize
  let ballPosition = matchDetails.ball.position.map(x => x)
  let attackingTowardsTop = (matchDetails.kickOffTeam.players[0].currentPOS[1] > pitchHeight / 2)
  if (attackingTowardsTop && common.inTopPenalty(matchDetails, ballPosition)) {
    matchDetails.kickOffTeamStatistics.penalties++
    matchDetails.iterationLog.push(`penalty to: ${matchDetails.kickOffTeam.name}`)
    return setTopPenalty(matchDetails)
  } else if (attackingTowardsTop == false && common.inBottomPenalty(matchDetails, ballPosition)) {
    matchDetails.kickOffTeamStatistics.penalties++
    matchDetails.iterationLog.push(`penalty to: ${matchDetails.kickOffTeam.name}`)
    return setBottomPenalty(matchDetails)
  } else if (attackingTowardsTop) {
    matchDetails.kickOffTeamStatistics.freekicks++
    matchDetails.iterationLog.push(`freekick to: ${matchDetails.kickOffTeam.name} [${matchDetails.ball.position}]`)
    return setFreekicks.setBottomFreekick(matchDetails, ballPosition)
  }
  matchDetails.kickOffTeamStatistics.freekicks++
  matchDetails.iterationLog.push(`freekick to: ${matchDetails.kickOffTeam.name} [${matchDetails.ball.position}]`)
  return setFreekicks.setTopFreekick(matchDetails, ballPosition)
}

/**
 * Sets the setpiece for the second team based on the match details.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @returns {Object} The updated match details after setting the setpiece.
 */
function setSetpieceSecondTeam(matchDetails) {
  const [, pitchHeight] = matchDetails.pitchSize
  let ballPosition = matchDetails.ball.position.map(x => x)
  let attackingTowardsTop = (matchDetails.secondTeam.players[0].currentPOS[1] > pitchHeight / 2)
  if (attackingTowardsTop && common.inTopPenalty(matchDetails, ballPosition)) {
    matchDetails.secondTeamStatistics.penalties++
    matchDetails.iterationLog.push(`penalty to: ${matchDetails.secondTeam.name}`)
    return setTopPenalty(matchDetails)
  } else if (attackingTowardsTop == false && common.inBottomPenalty(matchDetails, ballPosition)) {
    matchDetails.secondTeamStatistics.penalties++
    matchDetails.iterationLog.push(`penalty to: ${matchDetails.secondTeam.name}`)
    return setBottomPenalty(matchDetails)
  } else if (attackingTowardsTop) {
    matchDetails.secondTeamStatistics.freekicks++
    matchDetails.iterationLog.push(`freekick to: ${matchDetails.secondTeam.name} [${matchDetails.ball.position}]`)
    return setFreekicks.setBottomFreekick(matchDetails, ballPosition)
  }
  matchDetails.secondTeamStatistics.freekicks++
  matchDetails.iterationLog.push(`freekick to: ${matchDetails.secondTeam.name} [${matchDetails.ball.position}]`)
  return setFreekicks.setTopFreekick(matchDetails, ballPosition)
}

/**
 * Sets the positions for a top penalty kick in a football match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @returns {Object} The updated match details with the positions set for the top penalty kick.
 */
function setTopPenalty(matchDetails) {
  common.removeBallFromAllPlayers(matchDetails)
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize
  let kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1]
  let halfPitchSize = (matchDetails.pitchSize[1] / 2)
  let attack = (kickOffTeamKeepYPos > halfPitchSize) ? matchDetails.kickOffTeam : matchDetails.secondTeam
  let defence = (kickOffTeamKeepYPos > halfPitchSize) ? matchDetails.secondTeam : matchDetails.kickOffTeam
  let tempArray = [pitchWidth / 2, pitchHeight / 6]
  let shootArray = [pitchWidth / 2, common.round(pitchHeight / 17.5, 0)]
  defence.players[0].currentPOS = defence.players[0].originPOS.map(x => x)
  setPlayerPenaltyPositions(tempArray, attack, defence)
  setBallSpecificPenaltyValue(matchDetails, shootArray, attack)
  matchDetails.ball.direction = `north`
  attack.intent = `attack`
  defence.intent = `defend`
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the positions for a bottom penalty in a football match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @returns {Object} The updated match details.
 */
function setBottomPenalty(matchDetails) {
  common.removeBallFromAllPlayers(matchDetails)
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize
  let kickOffTeamKeepYPos = matchDetails.kickOffTeam.players[0].originPOS[1]
  let halfPitchSize = (matchDetails.pitchSize[1] / 2)
  let attack = (kickOffTeamKeepYPos > halfPitchSize) ? matchDetails.secondTeam : matchDetails.kickOffTeam
  let defence = (kickOffTeamKeepYPos > halfPitchSize) ? matchDetails.kickOffTeam : matchDetails.secondTeam
  let tempArray = [pitchWidth / 2, pitchHeight - (pitchHeight / 6)]
  let shootArray = [pitchWidth / 2, pitchHeight - common.round(pitchHeight / 17.5, 0)]
  defence.players[0].currentPOS = defence.players[0].originPOS.map(x => x)
  setPlayerPenaltyPositions(tempArray, attack, defence)
  setBallSpecificPenaltyValue(matchDetails, shootArray, attack)
  matchDetails.ball.direction = `south`
  attack.intent = `attack`
  defence.intent = `defend`
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the penalty positions for the players.
 * @function
 * @param {Array} tempArray - The temporary array used for position calculation.
 * @param {Object} attack - The attacking team object.
 * @param {Object} defence - The defending team object.
 */
function setPlayerPenaltyPositions(tempArray, attack, defence) {
  let oppxpos = -10
  let teamxpos = -9
  for (const num of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    if (num != 10) {
      if (attack.players[num].currentPOS[0] != 'NP') {
        attack.players[num].currentPOS = tempArray.map(x => x)
        attack.players[num].currentPOS[0] += teamxpos
      }
    }
    if (defence.players[num].currentPOS[0] != 'NP') {
      defence.players[num].currentPOS = tempArray.map(x => x)
      defence.players[num].currentPOS[0] += oppxpos
    }
    oppxpos += 2
    teamxpos += 2
  }
}

/**
 * Sets the specific penalty value for the ball in the match details.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Array} shootArray - The array containing the shoot positions.
 * @param {Object} attack - The attacking team details.
 */
function setBallSpecificPenaltyValue(matchDetails, shootArray, attack) {
  attack.players[0].currentPOS = attack.players[0].originPOS.map(x => x)
  attack.players[10].currentPOS = shootArray.map(x => x)
  attack.players[10].hasBall = true
  attack.players[10].action = `penalty`
  matchDetails.ball.lastTouch.playerName = attack.players[10].name
  matchDetails.ball.lastTouch.playerID = attack.players[10].playerID
  matchDetails.ball.lastTouch.teamID = attack.teamID
  matchDetails.ball.position = shootArray.map(x => x)
  matchDetails.ball.ballOverIterations = []
  matchDetails.ball.Player = attack.players[10].playerID
  matchDetails.ball.withPlayer = true
  matchDetails.ball.withTeam = attack.teamID
}

/**
 * Sets the goal scored by the player from the kick-off team in the match details.
 * @function
 * @param {Object} matchDetails - The match details object.
 * @returns {Object} The updated match details object.
 */
function setKickOffTeamGoalScored(matchDetails) {
  let scorer = matchDetails.ball.lastTouch.playerName
  matchDetails.iterationLog.push(`Goal Scored by - ${scorer} - (${matchDetails.kickOffTeam.name})`)
  let thisIndex = matchDetails.kickOffTeam.players.findIndex(thisPlayer => thisPlayer.name == scorer)
  if (thisIndex > -1) matchDetails.kickOffTeam.players[thisIndex].stats.goals++
  matchDetails.ball.lastTouch.playerName = ``
  matchDetails.ball.lastTouch.playerID = ``
  matchDetails.ball.lastTouch.teamID = ``
  common.removeBallFromAllPlayers(matchDetails)
  setVariables.resetPlayerPositions(matchDetails)
  setBallSpecificGoalScoreValue(matchDetails, matchDetails.secondTeam)
  matchDetails.secondTeam.intent = `attack`
  matchDetails.kickOffTeam.intent = `defend`
  matchDetails.kickOffTeamStatistics.goals++
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the goal scored by a player from the second team in the match details.
 * @function
 * @param {Object} matchDetails - The match details object.
 * @returns {Object} The updated match details object.
 */
function setSecondTeamGoalScored(matchDetails) {
  let scorer = matchDetails.ball.lastTouch.playerName
  matchDetails.iterationLog.push(`Goal Scored by - ${scorer} - (${matchDetails.secondTeam.name})`)
  let thisIndex = matchDetails.secondTeam.players.findIndex(thisPlayer => thisPlayer.name == scorer)
  if (thisIndex > -1) matchDetails.secondTeam.players[thisIndex].stats.goals++
  matchDetails.ball.lastTouch.playerName = ''
  matchDetails.ball.lastTouch.playerID = ``
  matchDetails.ball.lastTouch.teamID = ``
  common.removeBallFromAllPlayers(matchDetails)
  setVariables.resetPlayerPositions(matchDetails)
  setBallSpecificGoalScoreValue(matchDetails, matchDetails.kickOffTeam)
  matchDetails.kickOffTeam.intent = `attack`
  matchDetails.secondTeam.intent = `defend`
  matchDetails.secondTeamStatistics.goals++
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the specific goal score value for the ball in the match details.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} conceedingTeam - The team that concedes the goal.
 */
function setBallSpecificGoalScoreValue(matchDetails, conceedingTeam) {
  matchDetails.ball.position = [matchDetails.pitchSize[0] / 2, matchDetails.pitchSize[1] / 2, 0]
  matchDetails.ball.ballOverIterations = []
  matchDetails.ball.withPlayer = true
  matchDetails.ball.withTeam = conceedingTeam.teamID
  let playerWithBall = common.getRandomNumber(9, 10)
  let waitingPlayer = (playerWithBall === 9) ? 10 : 9
  conceedingTeam.players[playerWithBall].currentPOS = matchDetails.ball.position.map(x => x)
  conceedingTeam.players[playerWithBall].currentPOS.pop()
  conceedingTeam.players[playerWithBall].hasBall = true
  matchDetails.ball.lastTouch.playerName = conceedingTeam.players[playerWithBall].name
  matchDetails.ball.lastTouch.playerID = conceedingTeam.players[playerWithBall].playerID
  matchDetails.ball.lastTouch.teamID = conceedingTeam.teamID
  matchDetails.ball.Player = conceedingTeam.players[playerWithBall].playerID
  let tempPosition = [matchDetails.ball.position[0] + 20, matchDetails.ball.position[1]]
  conceedingTeam.players[waitingPlayer].currentPOS = tempPosition.map(x => x)
}

/**
 * Keeps the ball within the boundaries of the pitch and handles various scenarios based on the ball's position.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {number} kickteamID - The ID of the team that kicked the ball.
 * @param {Array} ballIntended - The intended position of the ball.
 * @returns {Object} The updated match details after handling the ball's position.
 */
function keepInBoundaries(matchDetails, kickteamID, ballIntended) {
  let { kickOffTeam } = matchDetails
  let KOTid = kickOffTeam.teamID
  const [pitchWidth, pitchHeight, goalWidth] = matchDetails.pitchSize
  let halfMWidth = parseInt(pitchWidth / 2, 10)
  let leftPost = parseInt(halfMWidth, 10) - parseInt(goalWidth / 2, 10)
  let rightPost = parseInt(halfMWidth, 10) + parseInt(goalWidth / 2, 10)
  const [bXPOS, bYPOS] = ballIntended
  let kickOffTeamSide = (kickOffTeam.players[0].originPOS[1] < (pitchHeight / 2)) ? 'top' : 'bottom'
  if (bXPOS < 0 && kickteamID == KOTid) return setLeftSecondTeamThrowIn(matchDetails, ballIntended)
  if (bXPOS < 0 && kickteamID != KOTid) return setLeftKickOffTeamThrowIn(matchDetails, ballIntended)
  if (bXPOS > pitchWidth && kickteamID == KOTid) return setRightSecondTeamThrowIn(matchDetails, ballIntended)
  if (bXPOS > pitchWidth && kickteamID != KOTid) return setRightKickOffTeamThrowIn(matchDetails, ballIntended)
  if (bYPOS < 0) {
    if (common.isBetween(bXPOS, leftPost, rightPost)) {
      if (kickOffTeamSide == 'top') return setSecondTeamGoalScored(matchDetails)
      if (kickOffTeamSide == 'bottom') return setKickOffTeamGoalScored(matchDetails)
    } else {
      if (bXPOS < halfMWidth && kickteamID == KOTid) {
        if (kickOffTeamSide == 'top') return setTopLeftCornerPositions(matchDetails)
        if (kickOffTeamSide == 'bottom') return setTopGoalKick(matchDetails)
      }
      if (bXPOS > halfMWidth && kickteamID == KOTid) {
        if (kickOffTeamSide == 'top') return setTopRightCornerPositions(matchDetails)
        if (kickOffTeamSide == 'bottom') return setTopGoalKick(matchDetails)
      }
      if (bXPOS < halfMWidth && kickteamID != KOTid) {
        if (kickOffTeamSide == 'top') return setTopGoalKick(matchDetails)
        if (kickOffTeamSide == 'bottom') return setTopLeftCornerPositions(matchDetails)
      }
      if (bXPOS > halfMWidth && kickteamID != KOTid) {
        if (kickOffTeamSide == 'top') return setTopGoalKick(matchDetails)
        if (kickOffTeamSide == 'bottom') return setTopRightCornerPositions(matchDetails)
      }
    }
  }

  if (bYPOS > pitchHeight) {
    if (common.isBetween(bXPOS, leftPost, rightPost)) {
      if (kickOffTeamSide == 'top') return setKickOffTeamGoalScored(matchDetails)
      if (kickOffTeamSide == 'bottom') return setSecondTeamGoalScored(matchDetails)
    } else {
      if (bXPOS < halfMWidth && kickteamID == KOTid) {
        if (kickOffTeamSide == 'top') return setBottomGoalKick(matchDetails)
        if (kickOffTeamSide == 'bottom') return setBottomLeftCornerPositions(matchDetails)
      }
      if (bXPOS > halfMWidth && kickteamID == KOTid) {
        if (kickOffTeamSide == 'top') return setBottomGoalKick(matchDetails)
        if (kickOffTeamSide == 'bottom') return setBottomRightCornerPositions(matchDetails)
      }
      if (bXPOS < halfMWidth && kickteamID != KOTid) {
        if (kickOffTeamSide == 'top') return setBottomLeftCornerPositions(matchDetails)
        if (kickOffTeamSide == 'bottom') return setBottomGoalKick(matchDetails)
      }
      if (bXPOS > halfMWidth && kickteamID != KOTid) {
        if (kickOffTeamSide == 'top') return setBottomRightCornerPositions(matchDetails)
        if (kickOffTeamSide == 'bottom') return setBottomGoalKick(matchDetails)
      }
    }
  }
  // if (bYPOS < pitchHeight + 1 && bYPOS > 0){
  matchDetails.ballIntended = ballIntended
  return matchDetails
  // }
}

/**
 * Sets the player positions for a given team in a football match.
 * @function
 * @param {object} matchDetails - The details of the match.
 * @param {object} team - The team for which player positions need to be set.
 * @param {number} extra - The extra value to be added to the player's position.
 */
function setPlayerPositions(matchDetails, team, extra) {
  for (const thisPlayer of team.players) {
    if (thisPlayer.position == `GK`) thisPlayer.currentPOS = thisPlayer.originPOS.map(x => x)
    else {
      thisPlayer.currentPOS = thisPlayer.originPOS.map(x => x)
      const playerPos = parseInt(thisPlayer.currentPOS[1], 10) + extra
      if (common.isBetween(playerPos, -1, (matchDetails.pitchSize[1] + 1))) thisPlayer.currentPOS[1] = playerPos
      thisPlayer.intentPOS = [thisPlayer.originPOS[0], playerPos]
    }
  }
}

/**
 * Calculates the difference in positions between the origin and current positions.
 * @function
 * @param {number[]} origin - The origin position as an array of two numbers [x, y].
 * @param {number[]} current - The current position as an array of two numbers [x, y].
 * @returns {number[]} The difference in positions as an array of two numbers [x, y].
 */
function formationCheck(origin, current) {
  let xPos = origin[0] - current[0]
  let yPos = origin[1] - current[1]
  let moveToFormation = []
  moveToFormation.push(xPos)
  moveToFormation.push(yPos)
  return moveToFormation
}

/**
 * Switches the side of each player in a team by updating their position and fitness.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} team - The team object containing players.
 * @throws {Error} Throws an error if any player does not have an origin position set.
 * @returns {Object} The updated match details object.
 */
function switchSide(matchDetails, team) {
  for (const thisPlayer of team.players) {
    if (!thisPlayer.originPOS) throw new Error(`Each player must have an origin position set`)
    thisPlayer.originPOS[1] = matchDetails.pitchSize[1] - thisPlayer.originPOS[1]
    thisPlayer.currentPOS = thisPlayer.originPOS.map(x => x)
    thisPlayer.intentPOS = thisPlayer.originPOS.map(x => x)
    thisPlayer.fitness = (thisPlayer.fitness < 51) ? common.round((thisPlayer.fitness + 50), 2) : 100
  }
  return matchDetails
}

/**
 * Sets the intent position based on the match details and the closest player.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} closestPlayer - The closest player to the ball.
 */
function setIntentPosition(matchDetails, closestPlayer) {
  let { ball, kickOffTeam, secondTeam } = matchDetails
  let kickOffTeamCheck = kickOffTeam.players.find(thisPlayer => thisPlayer.playerID == ball.Player)
  let secondTeamCheck = secondTeam.players.find(thisPlayer => thisPlayer.playerID == ball.Player)
  let kickTeam = (kickOffTeamCheck) ? kickOffTeam : (secondTeamCheck) ? secondTeam : 'none'
  let defendingTeam = (kickTeam == 'none') ? 'none' : (kickTeam.teamID == kickOffTeam.teamID) ? secondTeam : kickOffTeam
  if (defendingTeam != 'none') setDefenceRelativePos(matchDetails, defendingTeam, closestPlayer)
  if (kickTeam != 'none') setAttackRelativePos(matchDetails, kickTeam)
  if (kickTeam == 'none' && defendingTeam == 'none') {
    setLooseintentPOS(matchDetails, kickOffTeam, closestPlayer)
    setLooseintentPOS(matchDetails, secondTeam, closestPlayer)
  }
}

/**
 * Sets the intent position for each player in the team based on the match details and closest player.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} thisTeam - The team object.
 * @param {Object} closestPlayer - The closest player object.
 */
function setLooseintentPOS(matchDetails, thisTeam, closestPlayer) {
  /* eslint-disable prefer-destructuring*/
  const [, pitchHeight] = matchDetails.pitchSize
  let { ball } = matchDetails
  let side = (thisTeam.players[0].originPOS[1] < pitchHeight / 2) ? 'top' : 'bottom'
  for (let player of thisTeam.players) {
    let diffXPOSplayerandball = ball.position[0] - player.currentPOS[0]
    let diffYPOSplayerandball = ball.position[1] - player.currentPOS[1]
    if (player.playerID == closestPlayer.playerID) player.intentPOS = [ball.position[0], ball.position[1]]
    else if (common.isBetween(diffXPOSplayerandball, -16, 16) && common.isBetween(diffYPOSplayerandball, -16, 16)) {
      player.intentPOS = [ball.position[0], ball.position[1]]
    } else {
      let southwards = ['south', 'southwest', 'southeast'].includes(ball.direction)
      let northwards = ['north', 'northwest', 'northeast'].includes(ball.direction)
      let newYPOS
      if (side == 'top' && northwards) newYPOS = player.originPOS[1]
      else if (side == 'top' && southwards) newYPOS = setNewRelativeTopYPOS(pitchHeight, player, 20)
      else if (side == 'bottom' && northwards) newYPOS = setNewRelativeBottomYPOS(pitchHeight, player, -20)
      else if (side == 'bottom' && southwards) {
        if (common.isBetween(diffYPOSplayerandball, -100, 100)) newYPOS = player.originPOS[1]
        else newYPOS = moveTowardsBall(player, pitchHeight, diffYPOSplayerandball)
      } else if (ball.direction == 'wait') {
        newYPOS = moveTowardsBall(player, pitchHeight, diffYPOSplayerandball)
      }
      if (!newYPOS) newYPOS = player.originPOS[1]
      player.intentPOS = [player.originPOS[0], newYPOS]
    }
  }
}

/**
 * Moves the player towards the ball based on the player's position and the difference in Y position between the player and the ball.
 * @function
 * @param {Object} player - The player object.
 * @param {number} pitchHeight - The height of the pitch.
 * @param {number} diffYPOSplayerandball - The difference in Y position between the player and the ball.
 * @returns {number} The new Y position of the player.
 */
function moveTowardsBall(player, pitchHeight, diffYPOSplayerandball) {
  let side = (player.originPOS[1] < pitchHeight / 2) ? 'top' : 'bottom'
  if (side == 'top' && diffYPOSplayerandball > 0) return setNewRelativeTopYPOS(pitchHeight, player, 20)
  if (side == 'top' && diffYPOSplayerandball < 0) return setNewRelativeTopYPOS(pitchHeight, player, -20)
  if (side == 'bottom' && diffYPOSplayerandball > 0) return setNewRelativeBottomYPOS(pitchHeight, player, 20)
  if (side == 'bottom' && diffYPOSplayerandball < 0) return setNewRelativeBottomYPOS(pitchHeight, player, -20)
}

/**
 * Sets the relative positions of the defending team's players based on the match details and closest player.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} defendingTeam - The defending team object.
 * @param {Object} closestPlayer - The closest player object.
 */
function setDefenceRelativePos(matchDetails, defendingTeam, closestPlayer) {
  const [, pitchHeight] = matchDetails.pitchSize
  let { ball } = matchDetails
  let side = (defendingTeam.players[0].originPOS[1] < pitchHeight / 2) ? 'top' : 'bottom'
  for (let player of defendingTeam.players) {
    let diffXPOSplayerandball = ball.position[0] - player.currentPOS[0]
    let diffYPOSplayerandball = ball.position[1] - player.currentPOS[1]
    if (common.isBetween(diffXPOSplayerandball, -40, 40) && common.isBetween(diffYPOSplayerandball, -40, 40)) {
      player.intentPOS = [ball.position[0], ball.position[1]]
    } else {
      let ballOnOppositeSide = false
      if (side == 'top' && ball.position[1] > pitchHeight / 2) ballOnOppositeSide = true
      if (side == 'bottom' && ball.position[1] < pitchHeight / 2) ballOnOppositeSide = true
      if (player.playerID == closestPlayer.playerID) {
        player.intentPOS = [ball.position[0], ball.position[1]]
      } else if (ballOnOppositeSide) {
        let newYPOS
        if (side == 'top') newYPOS = setNewRelativeTopYPOS(pitchHeight, player, 20)
        if (side == 'bottom') newYPOS = setNewRelativeBottomYPOS(pitchHeight, player, -20)
        player.intentPOS = [player.originPOS[0], parseInt(newYPOS, 10)]
      } else {
        player.intentPOS = player.originPOS.map(x => x)
      }
    }
  }
}

/**
 * Sets the attack relative positions for the players of the kicking team.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} kickingTeam - The kicking team object.
 */
function setAttackRelativePos(matchDetails, kickingTeam) {
  const [, pitchHeight] = matchDetails.pitchSize
  let side = (kickingTeam.players[0].originPOS[1] < pitchHeight / 2) ? 'top' : 'bottom'
  for (let player of kickingTeam.players) {
    let newYPOS
    if (side == 'top') newYPOS = setNewRelativeTopYPOS(pitchHeight, player, 20)
    if (side == 'bottom') newYPOS = setNewRelativeBottomYPOS(pitchHeight, player, -20)
    player.intentPOS = [player.originPOS[0], parseInt(newYPOS, 10)]
  }
}

/**
 * Calculates the new relative top Y position for a player based on their current position and a given difference.
 * @function
 * @param {number} pitchHeight - The height of the pitch.
 * @param {object} player - The player object.
 * @param {number} diff - The difference to be added to the player's current position.
 * @returns {number} The new relative top Y position for the player.
 */
function setNewRelativeTopYPOS(pitchHeight, player, diff) {
  let { position } = player
  if (position == 'GK') return common.upToMax(player.currentPOS[1] + diff, pitchHeight * 0.15)
  if (position == 'CB') return common.upToMax(player.currentPOS[1] + diff, pitchHeight * 0.25)
  if (['LB', 'RB'].includes(position)) return common.upToMax(player.currentPOS[1] + diff, pitchHeight * 0.66)
  if (position == 'CM') return common.upToMax(player.currentPOS[1] + diff, pitchHeight * 0.75)
  return common.upToMax(player.currentPOS[1] + diff, pitchHeight)
}

/**
 * Calculates the new relative bottom Y position for a player based on their current position and a given difference.
 * @function
 * @param {number} pitchHeight - The height of the pitch.
 * @param {object} player - The player object containing the current position.
 * @param {number} diff - The difference to be added to the current position.
 * @returns {number} The new relative bottom Y position for the player.
 */
function setNewRelativeBottomYPOS(pitchHeight, player, diff) {
  let { position } = player
  if (position == 'GK') return common.upToMin(player.currentPOS[1] + diff, pitchHeight * 0.85)
  if (position == 'CB') return common.upToMin(player.currentPOS[1] + diff, pitchHeight * 0.75)
  if (['LB', 'RB'].includes(position)) return common.upToMin(player.currentPOS[1] + diff, pitchHeight * 0.33)
  if (position == 'CM') return common.upToMin(player.currentPOS[1] + diff, pitchHeight * 0.25)
  return common.upToMin(player.currentPOS[1] + diff, 0)
}


/**
 * @module `setPositions` - This module exports an object containing various functions for setting positions in a football game.
 * 
 * @requires `common`
 * @requires `setVariables`
 * @requires `setFreekicks`
 * 
 * 
 * @function `setGoalieHasBall` - Sets the position of the goalie when they have the ball.
 * @function `setTopRightCornerPositions` - Sets the positions for the top right corner kick.
 * @function `setTopLeftCornerPositions` - Sets the positions for the top left corner kick.
 * @function `setBottomLeftCornerPositions` - Sets the positions for the bottom left corner kick.
 * @function `setBottomRightCornerPositions` - Sets the positions for the bottom right corner kick.
 * @function `setPlayerPositions` - Sets the positions for all the players on the field.
 * @function `keepInBoundaries` - Keeps the ball within the boundaries of the field.
 * @function `setTopGoalKick` - Sets the positions for the top goal kick.
 * @function `setBottomGoalKick` - Sets the positions for the bottom goal kick.
 * @function `closestPlayerToPosition` - Finds the closest player to a given position.
 * @function `setSetpieceKickOffTeam` - Sets the positions for the set piece of the kick-off team.
 * @function `setSetpieceSecondTeam` - Sets the positions for the set piece of the second team.
 * @function `setTopPenalty` - Sets the positions for the top penalty kick.
 * @function `setBottomPenalty` - Sets the positions for the bottom penalty kick.
 * @function `setKickOffTeamGoalScored` - Sets the positions when the kick-off team scores a goal.
 * @function `setSecondTeamGoalScored` - Sets the positions when the second team scores a goal.
 * @function `setBallSpecificGoalScoreValue` - Sets the goal score value based on the ball's specific position.
 * @function `formationCheck` - Checks if the formation is valid.
 * @function `switchSide` - Switches the positions of the teams.
 * @function `setIntentPosition` - Sets the position based on the player's intent.
 * @function `setLeftKickOffTeamThrowIn` - Sets the positions for the left throw-in of the kick-off team.
 * @function `setLeftSecondTeamThrowIn` - Sets the positions for the left throw-in of the second team.
 * @function `setRightKickOffTeamThrowIn` - Sets the positions for the right throw-in of the kick-off team.
 * @function `setRightSecondTeamThrowIn` - Sets the positions for the right throw-in of the second team.
 */
export const setPositions = {
  setGoalieHasBall,
  setTopRightCornerPositions,
  setTopLeftCornerPositions,
  setBottomLeftCornerPositions,
  setBottomRightCornerPositions,
  setPlayerPositions,
  keepInBoundaries,
  setTopGoalKick,
  setBottomGoalKick,
  closestPlayerToPosition,
  setSetpieceKickOffTeam,
  setSetpieceSecondTeam,
  setTopPenalty,
  setBottomPenalty,
  setKickOffTeamGoalScored,
  setSecondTeamGoalScored,
  setBallSpecificGoalScoreValue,
  formationCheck,
  switchSide,
  setIntentPosition,
  setLeftKickOffTeamThrowIn,
  setLeftSecondTeamThrowIn,
  setRightKickOffTeamThrowIn,
  setRightSecondTeamThrowIn
}
