import { common } from '../lib/common.js'
import { setPositions } from '../lib/setPositions.js'

/**
 * Selects an action from a list of possible actions based on their points.
 * @function
 * @param {Array<Object>} possibleActions - The list of possible actions.
 * @returns {string} The selected action name or 'wait' if no actions are available.
 */
function selectAction(possibleActions) {
  let goodActions = []
  for (const thisAction of possibleActions) {
    let tempArray = Array(thisAction.points).fill(thisAction.name)
    goodActions = goodActions.concat(tempArray)
  }
  if (goodActions[0] == null) return 'wait'
  return goodActions[common.getRandomNumber(0, goodActions.length - 1)]
}

/**
 * Finds the possible actions for a player in a football match.
 * @function
 * @param {Object} player - The player object.
 * @param {Object} team - The team object.
 * @param {Object} opposition - The opposition team object.
 * @param {number} ballX - The x-coordinate of the ball.
 * @param {number} ballY - The y-coordinate of the ball.
 * @param {Object} matchDetails - The details of the match.
 * @returns {Array} An array of possible actions for the player.
 */
function findPossActions(player, team, opposition, ballX, ballY, matchDetails) {
  let possibleActions = populateActionsJSON()
  const [, pitchHeight] = matchDetails.pitchSize
  let params = []
  let {
    hasBall, originPOS
  } = player
  if (hasBall === false) params = playerDoesNotHaveBall(player, ballX, ballY, matchDetails)
  else if (originPOS[1] > (pitchHeight / 2)) params = bottomTeamPlayerHasBall(matchDetails, player, team, opposition)
  else params = topTeamPlayerHasBall(matchDetails, player, team, opposition)
  return populatePossibleActions(possibleActions, ...params)
}

/**
 * Determines the position values for the top team player when they have the ball.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} player - The player object.
 * @param {Object} team - The team object.
 * @param {Object} opposition - The opposition team object.
 * @returns {number[]} An array of position values.
 */
function topTeamPlayerHasBall(matchDetails, player, team, opposition) {
  let playerInformation = setPositions.closestPlayerToPosition(player, opposition, player.currentPOS)
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize
  let {
    position, currentPOS, skill
  } = player
  if (position === 'GK' && oppositionNearPlayer(playerInformation, 10, 25)) return [0, 0, 10, 0, 0, 0, 0, 10, 0, 40, 40]
  else if (position === 'GK') return [0, 0, 50, 0, 0, 0, 0, 10, 0, 20, 20]
  else if (onBottomCornerBoundary(currentPOS, pitchWidth, pitchHeight)) return [0, 0, 20, 80, 0, 0, 0, 0, 0, 0, 0]
  else if (checkPositionInBottomPenaltyBox(currentPOS, pitchWidth, pitchHeight)) {
    return topTeamPlayerHasBallInBottomPenaltyBox(matchDetails, player, team, opposition)
  } else if (common.isBetween(currentPOS[1], pitchHeight - (pitchHeight / 3), (pitchHeight - (pitchHeight / 6) + 5))) {
    if (oppositionNearPlayer(playerInformation, 10, 10)) return [30, 20, 20, 10, 0, 0, 0, 20, 0, 0, 0]
    return [70, 10, 10, 0, 0, 0, 0, 10, 0, 0, 0]
  } else if (common.isBetween(currentPOS[1], (pitchHeight / 3), (pitchHeight - (pitchHeight / 3)))) {
    if (oppositionNearPlayer(playerInformation, 10, 10)) return [0, 20, 30, 20, 0, 0, 20, 0, 0, 0, 10]
    else if (skill.shooting > 85) return [10, 10, 30, 0, 0, 0, 50, 0, 0, 0, 0]
    else if (position === 'LM' || position === 'CM' || position === 'RM') return [0, 10, 10, 10, 0, 0, 0, 30, 40, 0, 0]
    else if (position === 'ST') return [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0]
    return [0, 0, 10, 0, 0, 0, 0, 60, 20, 0, 10]
  } else if (oppositionNearPlayer(playerInformation, 10, 10)) return [0, 0, 0, 0, 0, 0, 0, 10, 0, 70, 20]
  else if (position === 'LM' || position === 'CM' || position === 'RM') return [0, 0, 30, 0, 0, 0, 0, 30, 40, 0, 0]
  else if (position === 'ST') return [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0]
  return [0, 0, 40, 0, 0, 0, 0, 30, 0, 20, 10]
}

/**
 * Determines the action to be taken by the top team player when they have the ball in the bottom penalty box.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} player - The current player.
 * @param {Object} team - The team object.
 * @param {Object} opposition - The opposition team object.
 * @returns {number[]} An array representing the action to be taken by the player.
 */
function topTeamPlayerHasBallInBottomPenaltyBox(matchDetails, player, team, opposition) {
  let playerInformation = setPositions.closestPlayerToPosition(player, opposition, player.currentPOS)
  let ownPlayerInformation = setPositions.closestPlayerToPosition(player, team, player.currentPOS)
  let tmateProximity = [Math.abs(ownPlayerInformation.proxPOS[0]), Math.abs(ownPlayerInformation.proxPOS[1])]
  let closePlayerPosition = playerInformation.thePlayer.currentPOS
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize
  let {
    currentPOS, skill
  } = player
  let halfRange = pitchHeight - (skill.shooting / 2)
  let shotRange = pitchHeight - skill.shooting
  if (checkPositionInBottomPenaltyBoxClose(currentPOS, pitchWidth, pitchHeight)) {
    if (oppositionNearPlayer(playerInformation, 6, 6)) {
      if (checkOppositionBelow(closePlayerPosition, currentPOS)) {
        if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -10, 10)) return [20, 0, 70, 0, 0, 0, 0, 10, 0, 0, 0]
        else if (common.isBetween(currentPOS[1], halfRange, pitchHeight)) return [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        else if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) return [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0]
        return [20, 0, 0, 0, 0, 0, 0, 40, 20, 0, 0]
      } else if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -4, 10)) {
        if (common.isBetween(currentPOS[1], halfRange, pitchHeight)) return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0]
        else if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0]
        return [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0]
      } else if (common.isBetween(currentPOS[1], halfRange, pitchHeight)) return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0]
      else if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) return [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0]
      return [20, 0, 0, 0, 0, 0, 0, 50, 30, 0, 0]
    } else if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -4, 10)) {
      if (common.isBetween(currentPOS[1], halfRange, pitchHeight)) return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0]
      else if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0]
      return [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0]
    } else if (common.isBetween(currentPOS[1], halfRange, pitchHeight)) return [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    else if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) return [60, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0]
    return [30, 0, 0, 0, 0, 0, 0, 40, 30, 0, 0]
  } else if (common.isBetween(currentPOS[1], shotRange, pitchHeight)) return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0]
  else if (oppositionNearPlayer(playerInformation, 6, 6)) return [10, 0, 70, 0, 0, 0, 0, 20, 0, 0, 0]
  return [70, 0, 20, 0, 0, 0, 0, 10, 0, 0, 0]
}

/**
 * Determines the position values for a player from the bottom team who has the ball.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} player - The player object.
 * @param {Object} team - The team object.
 * @param {Object} opposition - The opposition team object.
 * @returns {number[]} An array of position values.
 */
function bottomTeamPlayerHasBall(matchDetails, player, team, opposition) {
  let playerInformation = setPositions.closestPlayerToPosition(player, opposition, player.currentPOS)
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize
  let {
    position, currentPOS, skill
  } = player
  if (position === 'GK' && oppositionNearPlayer(playerInformation, 10, 25)) return [0, 0, 10, 0, 0, 0, 0, 10, 0, 40, 40]
  else if (position === 'GK') return [0, 0, 50, 0, 0, 0, 0, 10, 0, 20, 20]
  else if (onTopCornerBoundary(currentPOS, pitchWidth)) return [0, 0, 20, 80, 0, 0, 0, 0, 0, 0, 0]
  else if (checkPositionInTopPenaltyBox(currentPOS, pitchWidth, pitchHeight)) {
    return bottomTeamPlayerHasBallInTopPenaltyBox(matchDetails, player, team, opposition)
  } else if (common.isBetween(currentPOS[1], (pitchHeight / 6) - 5, pitchHeight / 3)) {
    if (oppositionNearPlayer(playerInformation, 10, 10)) return [30, 20, 20, 10, 0, 0, 0, 20, 0, 0, 0]
    return [70, 10, 10, 0, 0, 0, 0, 10, 0, 0, 0]
  } else if (common.isBetween(currentPOS[1], (pitchHeight / 3), (2 * (pitchHeight / 3)))) {
    return bottomTeamPlayerHasBallInMiddle(playerInformation, position, skill)
  } else if (oppositionNearPlayer(playerInformation, 10, 10)) return [0, 0, 0, 0, 0, 0, 0, 10, 0, 70, 20]
  else if (position === 'LM' || position === 'CM' || position === 'RM') return [0, 0, 30, 0, 0, 0, 0, 30, 40, 0, 0]
  else if (position === 'ST') return [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0]
  return [0, 0, 30, 0, 0, 0, 0, 50, 0, 10, 10]
}

/**
 * Calculates the player's action based on their position, skill, and the proximity of the opposition.
 * @function
 * @param {Object} playerInformation - The information about the player.
 * @param {string} position - The position of the player.
 * @param {Object} skill - The skill level of the player.
 * @returns {number[]} An array representing the player's action.
 */
function bottomTeamPlayerHasBallInMiddle(playerInformation, position, skill) {
  if (oppositionNearPlayer(playerInformation, 10, 10)) return [0, 20, 30, 20, 0, 0, 0, 20, 0, 0, 10]
  else if (skill.shooting > 85) return [10, 10, 30, 0, 0, 0, 0, 50, 0, 0, 0]
  else if (position === 'LM' || position === 'CM' || position === 'RM') return [0, 10, 10, 10, 0, 0, 0, 30, 40, 0, 0]
  else if (position === 'ST') return [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0]
  return [0, 0, 10, 0, 0, 0, 0, 60, 20, 0, 10]
}

/**
 * Determines the actions to be taken by the bottom team player when they have the ball in the top penalty box.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} player - The player object.
 * @param {Object} team - The team object.
 * @param {Object} opposition - The opposition team object.
 * @returns {number[]} An array representing the actions to be taken by the player.
 */
function bottomTeamPlayerHasBallInTopPenaltyBox(matchDetails, player, team, opposition) {
  let playerInformation = setPositions.closestPlayerToPosition(player, opposition, player.currentPOS)
  let ownPlayerInformation = setPositions.closestPlayerToPosition(player, team, player.currentPOS)
  let tmateProximity = [Math.abs(ownPlayerInformation.proxPOS[0]), Math.abs(ownPlayerInformation.proxPOS[1])]
  let closePlayerPosition = playerInformation.thePlayer.currentPOS
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize
  let {
    currentPOS, skill
  } = player
  if (checkPositionInTopPenaltyBoxClose(currentPOS, pitchWidth, pitchHeight)) {
    if (oppositionNearPlayer(playerInformation, 20, 20)) {
      if (checkOppositionAhead(closePlayerPosition, currentPOS)) {
        if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -10, 10)) return [20, 0, 70, 0, 0, 0, 0, 10, 0, 0, 0]
        else if (common.isBetween(currentPOS[1], 0, (skill.shooting / 2))) return [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        else if (common.isBetween(currentPOS[1], 0, skill.shooting)) return [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0]
        return [20, 0, 0, 0, 0, 0, 0, 40, 20, 0, 0]
      } else if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -4, 10)) {
        if (common.isBetween(currentPOS[1], 0, (skill.shooting / 2))) return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0]
        else if (common.isBetween(currentPOS[1], 0, skill.shooting)) return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0]
        return [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0]
      } else if (common.isBetween(currentPOS[1], 0, (skill.shooting / 2))) return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0]
      else if (common.isBetween(currentPOS[1], 0, skill.shooting)) return [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0]
      return [20, 0, 0, 0, 0, 0, 0, 50, 30, 0, 0]
    } else if (checkTeamMateSpaceClose(tmateProximity, -10, 10, -4, 10)) {
      if (common.isBetween(currentPOS[1], 0, (skill.shooting / 2))) return [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0]
      else if (common.isBetween(currentPOS[1], 0, skill.shooting)) return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0]
      return [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0]
    } else if (common.isBetween(currentPOS[1], 0, (skill.shooting / 2))) return [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    else if (common.isBetween(currentPOS[1], 0, skill.shooting)) return [60, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0]
    return [30, 0, 0, 0, 0, 0, 0, 40, 30, 0, 0]
  } else if (common.isBetween(currentPOS[1], 0, skill.shooting)) return [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0]
  else if (checkOppositionAhead(closePlayerPosition, currentPOS)) return [20, 0, 0, 0, 0, 0, 0, 80, 0, 0, 0]
  return [50, 0, 20, 20, 0, 0, 0, 10, 0, 0, 0]
}

/**
 * Checks if an opposition player is near a given space.
 * @function
 * @param {Object} oppositionPlayer - The opposition player object.
 * @param {number} spaceX - The maximum distance in the X-axis.
 * @param {number} spaceY - The maximum distance in the Y-axis.
 * @returns {boolean} Returns true if the opposition player is near the space, otherwise false.
 */
function oppositionNearPlayer(oppositionPlayer, spaceX, spaceY) {
  let oppositionProximity = [Math.abs(oppositionPlayer.proxPOS[0]), Math.abs(oppositionPlayer.proxPOS[1])]
  if (oppositionProximity[0] < spaceX && oppositionProximity[1] < spaceY) return true
  return false
}

/**
 * Checks if a teammate is within a specified proximity range.
 * @function
 * @param {number[]} tmateProximity - The proximity coordinates of the teammate.
 * @param {number} lowX - The lower bound of the X-axis range.
 * @param {number} highX - The upper bound of the X-axis range.
 * @param {number} lowY - The lower bound of the Y-axis range.
 * @param {number} highY - The upper bound of the Y-axis range.
 * @returns {boolean} Returns true if the teammate is within the specified range, otherwise false.
 */
function checkTeamMateSpaceClose(tmateProximity, lowX, highX, lowY, highY) {
  if (common.isBetween(tmateProximity[0], lowX, highX) && common.isBetween(tmateProximity[1], lowY, highY)) return true
  return false
}

/**
 * Checks if there is opposition ahead of the current player.
 * @function
 * @param {number[]} closePlayerPosition - The position of the close player as an array of two numbers [x, y].
 * @param {number[]} currentPOS - The position of the current player as an array of two numbers [x, y].
 * @returns {boolean} Returns true if there is opposition ahead, false otherwise.
 */
function checkOppositionAhead(closePlayerPosition, currentPOS) {
  let closePlyX = common.isBetween(closePlayerPosition[0], currentPOS[0] - 4, currentPOS[0] + 4)
  if (closePlyX && closePlayerPosition[1] < currentPOS[1]) return true
  return false
}

/**
 * Checks if the opposition player is below the current player position.
 * @function
 * @param {Array<number>} closePlayerPosition - The position of the close player as an array of two numbers [x, y].
 * @param {Array<number>} currentPOS - The current player position as an array of two numbers [x, y].
 * @returns {boolean} Returns true if the close player is below the current player position, otherwise returns false.
 */
function checkOppositionBelow(closePlayerPosition, currentPOS) {
  let closePlyX = common.isBetween(closePlayerPosition[0], currentPOS[0] - 4, currentPOS[0] + 4)
  if (closePlyX && closePlayerPosition[1] > currentPOS[1]) return true
  return false
}

/**
 * Determines the behavior of a player when they do not have the ball.
 * @function
 * @param {Object} player - The player object.
 * @param {number} ballX - The x-coordinate of the ball.
 * @param {number} ballY - The y-coordinate of the ball.
 * @param {Object} matchDetails - The details of the match.
 * @returns {number[]} An array representing the behavior of the player.
 */
function playerDoesNotHaveBall(player, ballX, ballY, matchDetails) {
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize
  let {
    position, currentPOS, originPOS
  } = player
  if (position === 'GK') return [0, 0, 0, 0, 0, 0, 0, 60, 40, 0, 0]
  else if (common.isBetween(ballX, -20, 20) && common.isBetween(ballY, -20, 20)) {
    return noBallNotGK2CloseBall(matchDetails, currentPOS, originPOS, pitchWidth, pitchHeight)
  } else if (common.isBetween(ballX, -40, 40) && common.isBetween(ballY, -40, 40)) {
    return noBallNotGK4CloseBall(matchDetails, currentPOS, originPOS, pitchWidth, pitchHeight)
  } else if (common.isBetween(ballX, -80, 80) && common.isBetween(ballY, -80, 80)) {
    if (matchDetails.ball.withPlayer === false) return [0, 0, 0, 0, 0, 0, 0, 60, 40, 0, 0]
    return [0, 0, 0, 0, 0, 40, 0, 30, 30, 0, 0]
  }
  return [0, 0, 0, 0, 0, 10, 0, 50, 30, 0, 0]
}

/**
 * Calculates the position values based on the given match details, current position, origin position, pitch width, and pitch height
 * when there is no ball and the player is not a goalkeeper and is close to the ball.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Array} currentPOS - The current position of the player.
 * @param {Array} originPOS - The origin position of the player.
 * @param {number} pitchWidth - The width of the pitch.
 * @param {number} pitchHeight - The height of the pitch.
 * @returns {Array} The calculated position values.
 */
function noBallNotGK4CloseBall(matchDetails, currentPOS, originPOS, pitchWidth, pitchHeight) {
  if (originPOS[1] > (pitchHeight / 2)) {
    return noBallNotGK4CloseBallBottomTeam(matchDetails, currentPOS, pitchWidth, pitchHeight)
  }
  if (checkPositionInTopPenaltyBox(currentPOS, pitchWidth, pitchHeight)) {
    if (matchDetails.ball.withPlayer === false) return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]
    return [0, 0, 0, 0, 40, 0, 20, 10, 30, 0, 0]
  } else if (matchDetails.ball.withPlayer === false) return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]
  return [0, 0, 0, 0, 50, 0, 50, 0, 0, 0, 0]
}

/**
 * Calculates the action values for the scenario when there is no ball, the player is not a goalkeeper, and the ball is close to the bottom team.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} currentPOS - The current position of the player.
 * @param {number} pitchWidth - The width of the pitch.
 * @param {number} pitchHeight - The height of the pitch.
 * @returns {number[]} An array of action values.
 */
function noBallNotGK4CloseBallBottomTeam(matchDetails, currentPOS, pitchWidth, pitchHeight) {
  if (checkPositionInBottomPenaltyBox(currentPOS, pitchWidth, pitchHeight)) {
    if (matchDetails.ball.withPlayer === false) return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]
    return [0, 0, 0, 0, 40, 0, 20, 10, 30, 0, 0]
  } else if (matchDetails.ball.withPlayer === false) return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]
  return [0, 0, 0, 0, 50, 0, 50, 0, 0, 0, 0]
}

/**
 * Calculates the position values based on the given match details, current position, origin position, pitch width, and pitch height
 * when there is no ball and the player is not a goalkeeper and is close to the ball.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Array} currentPOS - The current position of the player.
 * @param {Array} originPOS - The origin position of the player.
 * @param {number} pitchWidth - The width of the pitch.
 * @param {number} pitchHeight - The height of the pitch.
 * @returns {Array} The calculated position values.
 */
function noBallNotGK2CloseBall(matchDetails, currentPOS, originPOS, pitchWidth, pitchHeight) {
  if (originPOS[1] > (pitchHeight / 2)) {
    return noBallNotGK2CloseBallBottomTeam(matchDetails, currentPOS, pitchWidth, pitchHeight)
  }
  if (checkPositionInTopPenaltyBox(currentPOS, pitchWidth, pitchHeight)) {
    if (matchDetails.ball.withPlayer === false) return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]
    return [0, 0, 0, 0, 40, 0, 20, 10, 30, 0, 0]
  } else if (matchDetails.ball.withPlayer === false) return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]
  return [0, 0, 0, 0, 70, 10, 20, 0, 0, 0, 0]
}

/**
 * Calculates the action values for the scenario when there is no ball, the player is not a goalkeeper, and the ball is close to the bottom team.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} currentPOS - The current position of the player.
 * @param {number} pitchWidth - The width of the pitch.
 * @param {number} pitchHeight - The height of the pitch.
 * @returns {number[]} An array of action values.
 */
function noBallNotGK2CloseBallBottomTeam(matchDetails, currentPOS, pitchWidth, pitchHeight) {
  if (checkPositionInBottomPenaltyBox(currentPOS, pitchWidth, pitchHeight)) {
    if (matchDetails.ball.withPlayer === false) return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]
    return [0, 0, 0, 0, 50, 0, 10, 20, 20, 0, 0]
  }
  if (matchDetails.ball.withPlayer === false) return [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0]
  return [0, 0, 0, 0, 70, 10, 20, 0, 0, 0, 0]
}

/**
 * Checks if a given position is within the bottom penalty box area on a football pitch.
 * @function
 * @param {Array<number>} position - The position to check, represented as an array of two numbers [x, y].
 * @param {number} pitchWidth - The width of the football pitch.
 * @param {number} pitchHeight - The height of the football pitch.
 * @returns {boolean} Returns true if the position is within the bottom penalty box, otherwise returns false.
 */
function checkPositionInBottomPenaltyBox(position, pitchWidth, pitchHeight) {
  let yPos = common.isBetween(position[0], (pitchWidth / 4) - 5, pitchWidth - (pitchWidth / 4) + 5)
  let xPos = common.isBetween(position[1], pitchHeight - (pitchHeight / 6) + 5, pitchHeight)
  if (yPos && xPos) return true
  return false
}

/**
 * Checks if a given position is in the bottom penalty box area on a football pitch.
 * @function
 * @param {Array<number>} position - The position to check, represented as an array of two numbers [x, y].
 * @param {number} pitchWidth - The width of the football pitch.
 * @param {number} pitchHeight - The height of the football pitch.
 * @returns {boolean} Returns true if the position is in the bottom penalty box area, otherwise returns false.
 */
function checkPositionInBottomPenaltyBoxClose(position, pitchWidth, pitchHeight) {
  let yPos = common.isBetween(position[0], (pitchWidth / 3) - 5, pitchWidth - (pitchWidth / 3) + 5)
  let xPos = common.isBetween(position[1], (pitchHeight - (pitchHeight / 12) + 5), pitchHeight)
  if (yPos && xPos) return true
  return false
}

/**
 * Checks if a given position is within the top penalty box area on a football pitch.
 * @function
 * @param {Array<number>} position - The position to check, represented as an array of two numbers [x, y].
 * @param {number} pitchWidth - The width of the football pitch.
 * @param {number} pitchHeight - The height of the football pitch.
 * @returns {boolean} Returns true if the position is within the top penalty box area, otherwise returns false.
 */
function checkPositionInTopPenaltyBox(position, pitchWidth, pitchHeight) {
  let xPos = common.isBetween(position[0], (pitchWidth / 4) - 5, pitchWidth - (pitchWidth / 4) + 5)
  let yPos = common.isBetween(position[1], 0, (pitchHeight / 6) - 5)
  if (yPos && xPos) return true
  return false
}

/**
 * Checks if a given position is in the top penalty box close area of a football pitch.
 * @function
 * @param {Array<number>} position - The position to check, represented as an array of two numbers [x, y].
 * @param {number} pitchWidth - The width of the football pitch.
 * @param {number} pitchHeight - The height of the football pitch.
 * @returns {boolean} Returns true if the position is in the top penalty box close area, otherwise returns false.
 */
function checkPositionInTopPenaltyBoxClose(position, pitchWidth, pitchHeight) {
  let xPos = common.isBetween(position[0], (pitchWidth / 3) - 5, pitchWidth - (pitchWidth / 3) + 5)
  let yPos = common.isBetween(position[1], 0, (pitchHeight / 12) - 5)
  if (yPos && xPos) return true
  return false
}

function onBottomCornerBoundary(position, pitchWidth, pitchHeight) {
  if (position[1] == pitchHeight && (position[0] == 0 || position[0] == pitchWidth)) return true
  return false
}

/**
 * Checks if the given position is on the top corner boundary of the pitch.
 * @function
 * @param {Array<number>} position - The position coordinates [x, y].
 * @param {number} pitchWidth - The width of the pitch.
 * @returns {boolean} Returns true if the position is on the top corner boundary, false otherwise.
 */
function onTopCornerBoundary(position, pitchWidth) {
  if (position[1] == 0 && (position[0] == 0 || position[0] == pitchWidth)) return true
  return false
}

/**
 * Populates the points property of each object in the possibleActions array.
 * @function
 * @param {Array} possibleActions - An array of objects representing possible actions.
 * @param {number} a - The points for the 'shoot' action.
 * @param {number} b - The points for the 'throughBall' action.
 * @param {number} c - The points for the 'pass' action.
 * @param {number} d - The points for the 'cross' action.
 * @param {number} e - The points for the 'tackle' action.
 * @param {number} f - The points for the 'intercept' action.
 * @param {number} g - The points for the 'slide' action.
 * @param {number} h - The points for the 'run' action.
 * @param {number} i - The points for the 'sprint' action.
 * @param {number} j - The points for the 'cleared' action.
 * @param {number} k - The points for the 'boot' action.
 * @returns {Array} The modified possibleActions array with the points property populated.
 */
function populatePossibleActions(possibleActions, a, b, c, d, e, f, g, h, i, j, k) {
  possibleActions[0].points = a
  possibleActions[1].points = b
  possibleActions[2].points = c
  possibleActions[3].points = d
  possibleActions[4].points = e
  possibleActions[5].points = f
  possibleActions[6].points = g
  possibleActions[7].points = h
  possibleActions[8].points = i
  possibleActions[9].points = j
  possibleActions[10].points = k
  return possibleActions
}

/**
 * Populates an array of actions with their names and points.
 * @returns {Array} An array of actions with their names and points.
 */
function populateActionsJSON() {
  return [{
    'name': 'shoot',
    'points': 0
  }, {
    'name': 'throughBall',
    'points': 0
  }, {
    'name': 'pass',
    'points': 0
  }, {
    'name': 'cross',
    'points': 0
  }, {
    'name': 'tackle',
    'points': 0
  }, {
    'name': 'intercept',
    'points': 0
  }, {
    'name': 'slide',
    'points': 0
  }, {
    'name': 'run',
    'points': 0
  }, {
    'name': 'sprint',
    'points': 0
  }, {
    'name': 'cleared',
    'points': 0
  }, {
    'name': 'boot',
    'points': 0
  }]
}

/**
 * Resolves a tackle attempt by a player.
 * @function
 * @param {Object} player - The player attempting the tackle.
 * @param {Object} team - The team to which the player belongs.
 * @param {Object} opposition - The opposing team.
 * @param {Object} matchDetails - The details of the match.
 * @returns {boolean} Returns `true` if a foul was committed, `false` otherwise.
 */
function resolveTackle(player, team, opposition, matchDetails) {
  matchDetails.iterationLog.push(`Tackle attempted by: ${player.name}`)
  let tackleDetails = {
    'injuryHigh': 1500,
    'injuryLow': 1400,
    'increment': 1
  }
  let index = opposition.players.findIndex(function (thisPlayer) {
    return thisPlayer.playerID === matchDetails.ball.Player
  })
  let thatPlayer
  if (index) thatPlayer = opposition.players[index]
  else return false
  player.stats.tackles.total++
  if (wasFoul(10, 18)) {
    setFoul(matchDetails, team, player, thatPlayer)
    return true
  }
  if (calcTackleScore(player.skill.tackling, 5) > calcRetentionScore(thatPlayer.skill.tackling, 5)) {
    setSuccessTackle(matchDetails, team, opposition, player, thatPlayer, tackleDetails)
    return false
  }
  setFailedTackle(matchDetails, player, thatPlayer, tackleDetails)
  return false
}

/**
 * Resolves a slide tackle attempt by a player.
 * @function
 * @param {Object} player - The player attempting the slide tackle.
 * @param {Object} team - The team to which the player belongs.
 * @param {Object} opposition - The opposing team.
 * @param {Object} matchDetails - The details of the current match.
 * @returns {boolean} Returns `true` if a foul was committed, `false` otherwise.
 */
function resolveSlide(player, team, opposition, matchDetails) {
  matchDetails.iterationLog.push(`Slide tackle attempted by: ${player.name}`)
  let tackleDetails = {
    'injuryHigh': 1500,
    'injuryLow': 1400,
    'increment': 3
  }
  let index = opposition.players.findIndex(function (thisPlayer) {
    return thisPlayer.playerID === matchDetails.ball.Player
  })
  let thatPlayer
  if (index) thatPlayer = opposition.players[index]
  else return false
  player.stats.tackles.total++
  if (wasFoul(11, 20)) {
    setFoul(matchDetails, team, player, thatPlayer)
    return true
  }
  if (calcTackleScore(player.skill.tackling, 5) > calcRetentionScore(thatPlayer.skill.tackling, 5)) {
    setSuccessTackle(matchDetails, team, opposition, player, thatPlayer, tackleDetails)
    return false
  }
  setFailedTackle(matchDetails, player, thatPlayer, tackleDetails)
  return false
}

/**
 * Sets the details for a failed tackle in a football match.
 * @function
 * @param {Object} matchDetails - The details of the football match.
 * @param {Object} player - The player who attempted the tackle.
 * @param {Object} thatPlayer - The player who was tackled.
 * @param {Object} tackleDetails - The details of the tackle.
 */
function setFailedTackle(matchDetails, player, thatPlayer, tackleDetails) {
  matchDetails.iterationLog.push(`Failed tackle by: ${player.name}`)
  player.stats.tackles.off++
  setInjury(matchDetails, player, thatPlayer, tackleDetails.injuryHigh, tackleDetails.injuryLow)
  setPostTacklePosition(matchDetails, thatPlayer, player, tackleDetails.increment)
}

/**
 * Sets the details of a successful tackle in a football match.
 * @function
 * @param {Object} matchDetails - The details of the football match.
 * @param {string} team - The team performing the tackle.
 * @param {string} opposition - The opposing team.
 * @param {Object} player - The player performing the tackle.
 * @param {Object} thatPlayer - The player being tackled.
 * @param {Object} tackleDetails - The details of the tackle.
 */
function setSuccessTackle(matchDetails, team, opposition, player, thatPlayer, tackleDetails) {
  setPostTackleBall(matchDetails, team, opposition, player)
  matchDetails.iterationLog.push(`Successful tackle by: ${player.name}`)
  player.stats.tackles.on++
  setInjury(matchDetails, thatPlayer, player, tackleDetails.injuryLow, tackleDetails.injuryHigh)
  setPostTacklePosition(matchDetails, player, thatPlayer, tackleDetails.increment)
}

/**
 * Calculates the tackle score based on the skill and difficulty level.
 * @function
 * @param {Object} skill - The skill object containing the tackling and strength attributes.
 * @param {number} diff - The difficulty level.
 * @returns {number} The calculated tackle score.
 */
function calcTackleScore(skill, diff) {
  return ((parseInt(skill.tackling, 10) + parseInt(skill.strength, 10)) / 2) + common.getRandomNumber(-diff, diff)
}

/**
 * Calculates the retention score based on the given skill and difficulty.
 * @function
 * @param {Object} skill - The skill object containing agility and strength properties.
 * @param {number} diff - The difficulty level.
 * @returns {number} The calculated retention score.
 */
function calcRetentionScore(skill, diff) {
  return ((parseInt(skill.agility, 10) + parseInt(skill.strength, 10)) / 2) + common.getRandomNumber(-diff, diff)
}

/**
 * Sets the ball possession and updates match details after a tackle.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} team - The team that made the tackle.
 * @param {Object} opposition - The opposing team.
 * @param {Object} player - The player who made the tackle.
 */
function setPostTackleBall(matchDetails, team, opposition, player) {
  player.hasBall = true
  matchDetails.ball.lastTouch.playerName = player.name
  matchDetails.ball.lastTouch.playerID = player.playerID
  matchDetails.ball.lastTouch.teamID = team.teamID
  let tempArray = player.currentPOS
  matchDetails.ball.position = tempArray.map(x => x)
  matchDetails.ball.Player = player.playerID
  matchDetails.ball.withPlayer = true
  matchDetails.ball.withTeam = team.teamID
  team.intent = 'attack'
  opposition.intent = 'defend'
}

/**
 * Sets the post-tackle position of players and the ball in a football match.
 * @function
 * @param {Object} matchDetails - The details of the football match.
 * @param {Object} winningPlyr - The player who won the tackle.
 * @param {Object} losePlayer - The player who lost the tackle.
 * @param {number} increment - The amount by which to increment the positions.
 */
function setPostTacklePosition(matchDetails, winningPlyr, losePlayer, increment) {
  const [, pitchHeight] = matchDetails.pitchSize
  if (losePlayer.originPOS[1] > pitchHeight / 2) {
    losePlayer.currentPOS[1] = common.upToMin(losePlayer.currentPOS[1] - increment, 0)
    matchDetails.ball.position[1] = common.upToMin(matchDetails.ball.position[1] - increment, 0)
    winningPlyr.currentPOS[1] = common.upToMax(winningPlyr.currentPOS[1] + increment, pitchHeight)
  } else {
    losePlayer.currentPOS[1] = common.upToMax(losePlayer.currentPOS[1] + increment, pitchHeight)
    matchDetails.ball.position[1] = common.upToMax(matchDetails.ball.position[1] + increment, pitchHeight)
    winningPlyr.currentPOS[1] = common.upToMin(winningPlyr.currentPOS[1] - increment, 0)
  }
}

/**
 * Sets the injury status for the players involved in a match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} thatPlayer - The player who was tackled.
 * @param {Object} player - The player who made the tackle.
 * @param {boolean} tackledInjury - The injury status of the tackled player.
 * @param {boolean} tacklerInjury - The injury status of the tackler player.
 */
function setInjury(matchDetails, thatPlayer, player, tackledInjury, tacklerInjury) {
  if (common.isInjured(tackledInjury)) {
    thatPlayer.injured = true
    matchDetails.iterationLog.push(`Player Injured - ${thatPlayer.name}`)
  }
  if (common.isInjured(tacklerInjury)) {
    player.injured = true
    matchDetails.iterationLog.push(`Player Injured - ${player.name}`)
  }
}

/**
 * Sets a foul in the match details and updates player and team statistics.
 * @function
 * @param {Object} matchDetails - The match details object.
 * @param {Object} team - The team object.
 * @param {Object} player - The player object who committed the foul.
 * @param {Object} thatPlayer - The player object who was fouled.
 */
function setFoul(matchDetails, team, player, thatPlayer) {
  matchDetails.iterationLog.push(`Foul against: ${thatPlayer.name}`)
  player.stats.tackles.fouls++
  if (team.teamID === matchDetails.kickOffTeam.teamID) matchDetails.kickOffTeamStatistics.fouls++
  else matchDetails.secondTeamStatistics.fouls++
}

/**
 * Determines if a foul was committed based on the given parameters.
 * @function
 * @param {number} x - The maximum value for generating a random number.
 * @param {number} y - The value used to calculate the upper limit for a foul.
 * @returns {boolean} Returns `true` if a foul was committed, `false` otherwise.
 */
function wasFoul(x, y) {
  let foul = common.getRandomNumber(0, x)
  if (common.isBetween(foul, 0, (y / 2) - 1)) return true
  return false
}

/**
 * Generates a random number representing the intensity of a foul.
 * @function
 * @returns {number} A random number between 1 and 99.
 */
function foulIntensity() {
  return common.getRandomNumber(1, 99)
}

/**
 * Substitutes a player in a team during a match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} team - The team object.
 * @param {Object} player - The player object to be substituted.
 */
function substitutePlayer(matchDetails, team, player) {
  let selectTeam;
  team.name === matchDetails.kickOffTeam.name ? selectTeam = matchDetails.substitutions.kickOffTeam : selectTeam = matchDetails.substitutions.secondTeam
  if (selectTeam.subs < 5 && selectTeam.slots < 3) {
    let subIndex = matchDetails.team.subs.findIndex(function (thisPlayer) {
      return thisPlayer.playerID === player.playerID
    })
    let playerIndex = matchDetails.team.players.findIndex(function (thisPlayer) {
      return thisPlayer.playerID === player.playerID
    })
    if (subIndex !== -1) {
      matchDetails.team.players.push(matchDetails.team.subs[subIndex])
      matchDetails.team.subs.push(matchDetails.team.players[playerIndex])
      matchDetails.iterationLog.push(`Substitution: ${player.name} replaced by ${matchDetails.team.subs[subIndex].name}`)
      matchDetails.team.players.splice(playerIndex, 1)
      matchDetails.team.subs.splice(subIndex, 1)
      selectTeam.subs++
      selectTeam.slots++
    }
  } else {
    console.log("Maximum substitutions/slots reached")
  }
}

/**
 * Substitutes a player during the half-time break.
 *
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} team - The team making the substitution.
 * @param {Object} player - The player being substituted.
 */
function substitutePlayerHalf(matchDetails, team, player) {
  let selectTeam;
  team.name === matchDetails.kickOffTeam.name ? selectTeam = matchDetails.substitutions.kickOffTeam : selectTeam = matchDetails.substitutions.secondTeam
  if (selectTeam.subs < 5 && selectTeam.slots < 3) {
    let subIndex = matchDetails.team.subs.findIndex(function (thisPlayer) {
      return thisPlayer.playerID === player.playerID
    })
    let playerIndex = matchDetails.team.players.findIndex(function (thisPlayer) {
      return thisPlayer.playerID === player.playerID
    })
    if (subIndex !== -1) {
      matchDetails.team.players.push(matchDetails.team.subs[subIndex])
      matchDetails.team.subs.push(matchDetails.team.players[playerIndex])
      matchDetails.iterationLog.push(`Substitution: ${player.name} replaced by ${matchDetails.team.subs[subIndex].name}`)
      matchDetails.team.players.splice(playerIndex, 1)
      matchDetails.team.subs.splice(subIndex, 1)
      selectTeam.subs++
    }
  } else {
    console.log("Maximum substitutions/slots reached")
  }
}

/**
 * @module `actions` - This file contains a collection of action functions used in the FootballEngine application. These functions represent various actions that can be performed by players in a football game.
 * 
 * @requires `common`
 * @requires `setPositions`
 * 
 * @function `selectAction` - Selects an action based on the current game state and player position.
 * @function `findPossActions` - Finds all possible actions that can be performed by the current player.
 * @function `playerDoesNotHaveBall` - Checks if the player does not have the ball.
 * @function `topTeamPlayerHasBall` - Checks if the top team player has the ball.
 * @function `topTeamPlayerHasBallInBottomPenaltyBox` - Checks if the top team player has the ball in the bottom penalty box.
 * @function `bottomTeamPlayerHasBall` - Checks if the bottom team player has the ball.
 * @function `bottomTeamPlayerHasBallInMiddle` - Checks if the bottom team player has the ball in the middle.
 * @function `bottomTeamPlayerHasBallInTopPenaltyBox` - Checks if the bottom team player has the ball in the top penalty box.
 * @function `noBallNotGK2CloseBall` - Checks if there is no ball and the closest player is not the goalkeeper.
 * @function `noBallNotGK2CloseBallBottomTeam` - Checks if there is no ball and the closest player is not the goalkeeper in the bottom team.
 * @function `noBallNotGK4CloseBall` - Checks if there is no ball and the closest player is not the goalkeeper.
 * @function `noBallNotGK4CloseBallBottomTeam` - Checks if there is no ball and the closest player is not the goalkeeper in the bottom team.
 * @function `oppositionNearPlayer` - Checks if there is an opposition player near the current player.
 * @function `checkTeamMateSpaceClose` - Checks if there is enough space for a teammate close to the current player.
 * @function `checkOppositionAhead` - Checks if there is an opposition player ahead of the current player.
 * @function `checkOppositionBelow` - Checks if there is an opposition player below the current player.
 * @function `checkPositionInTopPenaltyBox` - Checks if the current player is in the top penalty box.
 * @function `checkPositionInTopPenaltyBoxClose` - Checks if the current player is close to the top penalty box.
 * @function `onBottomCornerBoundary` - Checks if the current player is on the bottom corner boundary.
 * @function `onTopCornerBoundary` - Checks if the current player is on the top corner boundary.
 * @function `checkPositionInBottomPenaltyBox` - Checks if the current player is in the bottom penalty box.
 * @function `checkPositionInBottomPenaltyBoxClose` - Checks if the current player is close to the bottom penalty box.
 * @function `populatePossibleActions` - Populates the list of possible actions for the current player.
 * @function `resolveTackle` - Resolves a tackle action performed by the current player.
 * @function `resolveSlide` - Resolves a slide action performed by the current player.
 * @function `calcTackleScore` - Calculates the score for a tackle action performed by the current player.
 * @function `calcRetentionScore` - Calculates the score for retaining the ball after a tackle action performed by the current player.
 * @function `setPostTackleBall` - Sets the ball position after a tackle action performed by the current player.
 * @function `setPostTacklePosition` - Sets the player position after a tackle action performed by the current player.
 * @function `setFoul` - Sets a foul action performed by the current player.
 * @function `setInjury` - Sets an injury action performed by the current player.
 * @function `wasFoul` - Checks if a foul action was performed by the current player.
 * @function `foulIntensity` - Calculates the intensity of a foul action performed by the current player.
 * @function `substitutePlayer` - Substitutes a player in the current team.
 * @function `substitutePlayerHalf` - Substitutes a player in the current team during half-time.
 */
export const actions = {
  selectAction,
  findPossActions,
  playerDoesNotHaveBall,
  topTeamPlayerHasBall,
  topTeamPlayerHasBallInBottomPenaltyBox,
  bottomTeamPlayerHasBall,
  bottomTeamPlayerHasBallInMiddle,
  bottomTeamPlayerHasBallInTopPenaltyBox,
  noBallNotGK2CloseBall,
  noBallNotGK2CloseBallBottomTeam,
  noBallNotGK4CloseBall,
  noBallNotGK4CloseBallBottomTeam,
  oppositionNearPlayer,
  checkTeamMateSpaceClose,
  checkOppositionAhead,
  checkOppositionBelow,
  checkPositionInTopPenaltyBox,
  checkPositionInTopPenaltyBoxClose,
  onBottomCornerBoundary,
  onTopCornerBoundary,
  checkPositionInBottomPenaltyBox,
  checkPositionInBottomPenaltyBoxClose,
  populatePossibleActions,
  resolveTackle,
  resolveSlide,
  calcTackleScore,
  calcRetentionScore,
  setPostTackleBall,
  setPostTacklePosition,
  setFoul,
  setInjury,
  wasFoul,
  foulIntensity,
  substitutePlayer,
  substitutePlayerHalf
}
