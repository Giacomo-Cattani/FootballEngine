import { common } from '../lib/common.js'
import { ballMovement } from '../lib/ballMovement.js'
import { setPositions } from '../lib/setPositions.js'
import { actions } from '../lib/actions.js'

/**
 * Decides the movement of players based on the closest player to the ball.
 * @function
 * @param {Object} closestPlayer - The closest player to the ball.
 * @param {Object} team - The team object containing all the players.
 * @param {Object} opp - The opposing team object.
 * @param {Object} matchDetails - The details of the match.
 * @returns {Object} The updated team object.
 */
function decideMovement(closestPlayer, team, opp, matchDetails) {
  const allActions = [`shoot`, `throughBall`, `pass`, `cross`, `tackle`, `intercept`, `slide`]
  Array.prototype.push.apply(allActions, [`run`, `sprint`, `cleared`, `boot`, `penalty`])
  let {
    position, withPlayer, withTeam
  } = matchDetails.ball
  for (const thisPlayer of team.players) {
    //players closer than the closest player stand still near the ball???
    if (thisPlayer.currentPOS[0] != 'NP') {
      let ballToPlayerX = thisPlayer.currentPOS[0] - position[0]
      let ballToPlayerY = thisPlayer.currentPOS[1] - position[1]
      let possibleActions
      possibleActions = actions.findPossActions(thisPlayer, team, opp, ballToPlayerX, ballToPlayerY, matchDetails)
      let action = actions.selectAction(possibleActions)
      action = checkProvidedAction(matchDetails, thisPlayer, action)
      if (withTeam && withTeam !== team.teamID && closestPlayer.name === thisPlayer.name) {
        if (action !== `tackle` && action !== `slide` && action !== `intercept`) action = `sprint`
        ballToPlayerX = closestPlayerActionBallX(ballToPlayerX)
        ballToPlayerY = closestPlayerActionBallY(ballToPlayerY)
      }
      let move = getMovement(thisPlayer, action, opp, ballToPlayerX, ballToPlayerY, matchDetails)
      thisPlayer.currentPOS = completeMovement(matchDetails, thisPlayer.currentPOS, move)
      let xPosition = common.isBetween(thisPlayer.currentPOS[0], position[0] - 3, position[0] + 3)
      let yPosition = common.isBetween(thisPlayer.currentPOS[1], position[1] - 3, position[1] + 3)
      let samePositionAsBall = thisPlayer.currentPOS[0] === position[0] && thisPlayer.currentPOS[1] === position[1]
      let closeWithPlayer = !!((xPosition && yPosition && withPlayer == false))
      if (xPosition && yPosition && withTeam !== team.teamID) {
        if (samePositionAsBall) {
          if (withPlayer === true && thisPlayer.hasBall === false && withTeam !== team.teamID) {
            if (action === `tackle`) matchDetails = completeTackleWhenCloseNoBall(matchDetails, thisPlayer, team, opp)
            if (action === `slide`) matchDetails = completeSlide(matchDetails, thisPlayer, team, opp)
          } else setClosePlayerTakesBall(matchDetails, thisPlayer, team, opp)
        } else if (withPlayer === true && thisPlayer.hasBall === false && withTeam !== team.teamID) {
          if (action === `slide`) matchDetails = completeSlide(matchDetails, thisPlayer, team, opp)
        } else {
          setClosePlayerTakesBall(matchDetails, thisPlayer, team, opp)
        }
      } else if (closeWithPlayer) setClosePlayerTakesBall(matchDetails, thisPlayer, team, opp)
      if (thisPlayer.hasBall === true) handleBallPlayerActions(matchDetails, thisPlayer, team, opp, action)
    }
  }
  return team
}

/**
 * Sets the close player as the one who takes the ball in the match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} thisPlayer - The player who takes the ball.
 * @param {Object} team - The team to which the player belongs.
 * @param {Object} opp - The opposing team.
 */
function setClosePlayerTakesBall(matchDetails, thisPlayer, team, opp) {
  if (thisPlayer.offside) {
    matchDetails.iterationLog.push(`${thisPlayer.name} is offside`)
    if (team.name == matchDetails.kickOffTeam.name) setPositions.setSetpieceKickOffTeam(matchDetails)
    else setPositions.setSetpieceSecondTeam(matchDetails)
  } else {
    thisPlayer.hasBall = true
    matchDetails.ball.lastTouch.playerName = thisPlayer.name
    matchDetails.ball.lastTouch.playerID = thisPlayer.playerID
    matchDetails.ball.lastTouch.teamID = team.teamID
    matchDetails.ball.ballOverIterations = []
    matchDetails.ball.position = thisPlayer.currentPOS.map(x => x)
    matchDetails.ball.Player = thisPlayer.playerID
    matchDetails.ball.withPlayer = true
    matchDetails.ball.withTeam = team.teamID
    team.intent = `attack`
    opp.intent = `defend`
  }
}

/**
 * Performs a complete slide action by resolving fouls, updating player statistics, and setting setpiece positions.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} thisPlayer - The player performing the slide action.
 * @param {Object} team - The player's team.
 * @param {Object} opp - The opposing team.
 * @returns {Object} The updated match details object.
 */
function completeSlide(matchDetails, thisPlayer, team, opp) {
  let foul = actions.resolveSlide(thisPlayer, team, opp, matchDetails)
  if (!foul) {
    if (opp.name == matchDetails.kickOffTeam.name) return setPositions.setSetpieceKickOffTeam(matchDetails)
    return setPositions.setSetpieceSecondTeam(matchDetails)
  }
  let intensity = actions.foulIntensity()
  if (common.isBetween(intensity, 65, 90)) {
    thisPlayer.stats.cards.yellow++
    if (thisPlayer.stats.cards.yellow == 2) {
      thisPlayer.stats.cards.red++
      Object.defineProperty(thisPlayer, 'currentPOS', {
        value: ['NP', 'NP'],
        writable: false,
        enumerable: true,
        configurable: false
      })
    }
  } else if (common.isBetween(intensity, 85, 100)) {
    thisPlayer.stats.cards.red++
    Object.defineProperty(thisPlayer, 'currentPOS', {
      value: ['NP', 'NP'],
      writable: false,
      enumerable: true,
      configurable: false
    })
  }
  if (opp.name == matchDetails.kickOffTeam.name) return setPositions.setSetpieceKickOffTeam(matchDetails)
  return setPositions.setSetpieceSecondTeam(matchDetails)
}

/**
 * Completes a tackle when the player is close to the opponent but there is no ball.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} thisPlayer - The player performing the tackle.
 * @param {Object} team - The team to which the player belongs.
 * @param {Object} opp - The opponent team.
 * @returns {Object} The updated match details after completing the tackle.
 */
function completeTackleWhenCloseNoBall(matchDetails, thisPlayer, team, opp) {
  let foul = actions.resolveTackle(thisPlayer, team, opp, matchDetails)
  if (foul) {
    let intensity = actions.foulIntensity()
    if (common.isBetween(intensity, 75, 90)) {
      thisPlayer.stats.cards.yellow++
      if (thisPlayer.stats.cards.yellow == 2) {
        thisPlayer.stats.cards.red++
        Object.defineProperty(thisPlayer, 'currentPOS', {
          value: ['NP', 'NP'],
          writable: false,
          enumerable: true,
          configurable: false
        })
      }
    } else if (common.isBetween(intensity, 90, 100)) {
      thisPlayer.stats.cards.red++
      Object.defineProperty(thisPlayer, 'currentPOS', {
        value: ['NP', 'NP'],
        writable: false,
        enumerable: true,
        configurable: false
      })
    }
  }
  if (opp.name == matchDetails.kickOffTeam.name) return setPositions.setSetpieceKickOffTeam(matchDetails)
  return setPositions.setSetpieceSecondTeam(matchDetails)
}

/**
 * Moves the player on the football pitch based on the given movement.
 * @function
 * @param {Object} matchDetails - The details of the football match.
 * @param {Array} currentPOS - The current position of the player on the pitch.
 * @param {Array} move - The movement to be applied to the player's position.
 * @returns {Array} The updated position of the player after the movement.
 */
function completeMovement(matchDetails, currentPOS, move) {
  if (currentPOS[0] != 'NP') {
    let intendedMovementX = currentPOS[0] + move[0]
    let intendedMovementY = currentPOS[1] + move[1]
    if (intendedMovementX < matchDetails.pitchSize[0] + 1 && intendedMovementX > -1) currentPOS[0] += move[0]
    if (intendedMovementY < matchDetails.pitchSize[1] + 1 && intendedMovementY > -1) currentPOS[1] += move[1]
  }
  return currentPOS
}

/**
 * Calculates the closest player action to the ball on the X-axis.
 * @function
 * @param {number} ballToPlayerX - The distance between the ball and the player on the X-axis.
 * @returns {number} The closest player action to the ball on the X-axis.
 */
function closestPlayerActionBallX(ballToPlayerX) {
  if (common.isBetween(ballToPlayerX, -30, 30) === false) {
    if (ballToPlayerX > 29) return 29
    return -29
  } return ballToPlayerX
}

/**
 * Calculates the closest player action based on the ball's Y position relative to the player.
 * @function
 * @param {number} ballToPlayerY - The Y position of the ball relative to the player.
 * @returns {number} The closest player action based on the ball's Y position.
 */
function closestPlayerActionBallY(ballToPlayerY) {
  if (common.isBetween(ballToPlayerY, -30, 30) === false) {
    if (ballToPlayerY > 29) return 29
    return -29
  } return ballToPlayerY
}

/**
 * Checks the provided action for a player in a football match.
 * @function
 * @param {Object} matchDetails - The details of the football match.
 * @param {Object} thisPlayer - The player for whom the action is being checked.
 * @param {string} action - The action to be checked.
 * @returns {string} The valid action for the player.
 * @throws {Error} If the player's action is invalid.
 */
function checkProvidedAction(matchDetails, thisPlayer, action) {
  const ballActions = [`shoot`, `throughBall`, `pass`, `cross`, `cleared`, `boot`, `penalty`]
  const allActions = [`shoot`, `throughBall`, `pass`, `cross`, `tackle`, `intercept`, `slide`]
  Array.prototype.push.apply(allActions, [`run`, `sprint`, `cleared`, `boot`, `penalty`])
  let providedAction = (thisPlayer.action) ? thisPlayer.action : `unassigned`
  if (providedAction === `none`) return action
  if (allActions.includes(providedAction)) {
    if (thisPlayer.playerID !== matchDetails.ball.Player) {
      if (ballActions.includes(providedAction)) {
        const notice = `${thisPlayer.name} doesnt have the ball so cannot ${providedAction} -action: run`
        console.error(notice)
        return `run`
      } return providedAction
    } else if (providedAction === `tackle` || providedAction === `slide` || providedAction === `intercept`) {
      action = ballActions[common.getRandomNumber(0, 5)]
      const notice = `${thisPlayer.name} has the ball so cannot ${providedAction} -action: ${action}`
      console.error(notice)
      return action
    } return providedAction
  } else if (thisPlayer.action !== `none`) throw new Error(`Invalid player action for ${thisPlayer.name}`)
}

/**
 * Handles the actions performed by a player on the ball during a football match.
 * @function
 * @param {Object} matchDetails - The details of the current match.
 * @param {Object} thisPlayer - The player performing the action.
 * @param {string} team - The team to which the player belongs.
 * @param {string} opp - The opposing team.
 * @param {string} action - The action performed by the player on the ball.
 */
function handleBallPlayerActions(matchDetails, thisPlayer, team, opp, action) {
  const ballActions = [`shoot`, `throughBall`, `pass`, `cross`, `cleared`, `boot`, `penalty`]
  ballMovement.getBallDirection(matchDetails, thisPlayer.currentPOS)
  let tempArray = thisPlayer.currentPOS
  matchDetails.ball.position = tempArray.map(x => x)
  matchDetails.ball.position[2] = 0
  if (ballActions.includes(action)) {
    ballMoved(matchDetails, thisPlayer, team, opp)
    if (action === `cleared` || action === `boot`) {
      let newPosition = ballMovement.ballKicked(matchDetails, team, thisPlayer)
      updateInformation(matchDetails, newPosition)
    } else if (action === `pass`) {
      let newPosition = ballMovement.ballPassed(matchDetails, team, thisPlayer)
      matchDetails.iterationLog.push(`passed to new position: ${newPosition}`)
      updateInformation(matchDetails, newPosition)
    } else if (action === `cross`) {
      let newPosition = ballMovement.ballCrossed(matchDetails, team, thisPlayer)
      matchDetails.iterationLog.push(`crossed to new position: ${newPosition}`)
      updateInformation(matchDetails, newPosition)
    } else if (action === `throughBall`) {
      let newPosition = ballMovement.throughBall(matchDetails, team, thisPlayer)
      updateInformation(matchDetails, newPosition)
    } else if (action === `shoot`) {
      let newPosition = ballMovement.shotMade(matchDetails, team, thisPlayer)
      updateInformation(matchDetails, newPosition)
    } else if (action === `penalty`) {
      let newPosition = ballMovement.penaltyTaken(matchDetails, team, thisPlayer)
      updateInformation(matchDetails, newPosition)
    }
  }
}

/**
 * Updates the game state when the ball is moved.
 * @function
 * @param {Object} matchDetails - The details of the current match.
 * @param {Object} thisPlayer - The player who moved the ball.
 * @param {Object} team - The team of the player who moved the ball.
 * @param {Object} opp - The opposing team.
 */
function ballMoved(matchDetails, thisPlayer, team, opp) {
  thisPlayer.hasBall = false
  matchDetails.ball.withPlayer = false
  team.intent = `attack`
  opp.intent = `attack`
  matchDetails.ball.Player = ``
  matchDetails.ball.withTeam = ``
}

/**
 * Updates the information of the match details with the new position.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {number[]} newPosition - The new position of the ball.
 */
function updateInformation(matchDetails, newPosition) {
  if (matchDetails.endIteration == true) return
  let tempPosition = newPosition.map(x => x)
  matchDetails.ball.position = tempPosition
  matchDetails.ball.position[2] = 0
}

/**
 * Calculates the movement of a player based on the given action and game details.
 * @function
 * @param {Object} player - The player object.
 * @param {string} action - The action performed by the player.
 * @param {Object} opposition - The opposition team object.
 * @param {number} ballX - The x-coordinate of the ball.
 * @param {number} ballY - The y-coordinate of the ball.
 * @param {Object} matchDetails - The details of the current match.
 * @returns {Array} An array representing the movement of the player in the x and y directions.
 */
function getMovement(player, action, opposition, ballX, ballY, matchDetails) {
  const { position } = matchDetails.ball
  const ballActions = [`shoot`, `throughBall`, `pass`, `cross`, `cleared`, `boot`, `penalty`]
  if (action === `wait` || ballActions.includes(action)) return [0, 0]
  else if (action === `tackle` || action === `slide`) {
    return getTackleMovement(ballX, ballY)
  } else if (action === `intercept`) {
    return getInterceptMovement(player, opposition, position, matchDetails.pitchSize)
  } else if (action === `run`) {
    return getRunMovement(matchDetails, player, ballX, ballY)
  } else if (action === `sprint`) {
    return getSprintMovement(matchDetails, player, ballX, ballY)
  }
}

/**
 * Calculates the movement direction for a player attempting to tackle the ball.
 * @function
 * @param {number} ballX - The x-coordinate of the ball.
 * @param {number} ballY - The y-coordinate of the ball.
 * @returns {Array<number>} An array representing the movement direction for the player. The first element represents the x-axis movement (-1 for left, 0 for no movement, 1 for right), and the second element represents the y-axis movement (-1 for up, 0 for no movement, 1 for down).
 */
function getTackleMovement(ballX, ballY) {
  let move = [0, 0]
  if (ballX > 0) move[0] = -1
  else if (ballX === 0) move[0] = 0
  else if (ballX < 0) move[0] = 1
  if (ballY > 0) move[1] = -1
  else if (ballY === 0) move[1] = 0
  else if (ballY < 0) move[1] = 1
  return move
}

/**
 * Calculates the movement vector for a player to intercept the ball from the opposition.
 * @function
 * @param {Object} player - The player object.
 * @param {Array} opposition - An array of opposition player objects.
 * @param {Array} ballPosition - The current position of the ball.
 * @param {Array} pitchSize - The size of the pitch.
 * @returns {Array} The movement vector for the player to intercept the ball.
 */
function getInterceptMovement(player, opposition, ballPosition, pitchSize) {
  let move = [0, 0]
  let intcptPos = getInterceptPosition(player.currentPOS, opposition, ballPosition, pitchSize)
  let intcptPosX = player.currentPOS[0] - intcptPos[0]
  let intcptPosY = player.currentPOS[1] - intcptPos[1]
  if (intcptPosX === 0) {
    if (intcptPosY === 0) move = [0, 0]
    else if (intcptPosY < 0) move = [0, 1]
    else if (intcptPosY > 0) move = [0, -1]
  } else if (intcptPosY === 0) {
    if (intcptPosX < 0) move = [1, 0]
    else if (intcptPosX > 0) move = [-1, 0]
  } else if (intcptPosX < 0 && intcptPosY < 0) move = [1, 1]
  else if (intcptPosX > 0 && intcptPosY > 0) move = [-1, -1]
  else if (intcptPosX > 0 && intcptPosY < 0) move = [-1, 1]
  else if (intcptPosX < 0 && intcptPosY > 0) move = [1, -1]
  return move
}

/**
 * Calculates the intercept position for a player based on their current position, opposition players, ball position, and pitch size.
 * @function
 * @param {Object} currentPOS - The current position of the player.
 * @param {Array<Object>} opposition - An array of opposition players.
 * @param {Object} ballPosition - The position of the ball.
 * @param {Object} pitchSize - The size of the pitch.
 * @returns {Object} The intercept position for the player.
 */
function getInterceptPosition(currentPOS, opposition, ballPosition, pitchSize) {
  let BallPlyTraj = getInterceptTrajectory(opposition, ballPosition, pitchSize)
  let intcptPos = getClosestTrajPosition(currentPOS, BallPlyTraj, false)
  if (JSON.stringify(intcptPos) === JSON.stringify(currentPOS)) {
    let index = getClosestTrajPosition(currentPOS, BallPlyTraj, true)
    if (index > 0) return BallPlyTraj[getClosestTrajPosition(currentPOS, BallPlyTraj, true) - 1]
  }
  return intcptPos
}

/**
 * Finds the closest position in a given trajectory to a player's position.
 * @function
 * @param {Array<number>} playerPos - The position of the player as an array of two numbers [x, y].
 * @param {Array<Array<number>>} BallPlyTraj - The trajectory of the ball player as an array of positions.
 * @param {boolean} [getIndex=false] - Optional parameter to indicate whether to return the index of the closest position.
 * @returns {Array<number>|number} The closest position in the trajectory to the player's position. If `getIndex` is `true`, returns the index of the closest position.
 */
function getClosestTrajPosition(playerPos, BallPlyTraj, getIndex) {
  let intcptPos = []
  let theDiff = 10000000
  let index = 0
  for (let thisPos of BallPlyTraj) {
    let xDiff = Math.abs(playerPos[0] - thisPos[0])
    let yDiff = Math.abs(playerPos[1] - thisPos[1])
    let totalDiff = xDiff + yDiff
    if (totalDiff < theDiff) {
      theDiff = totalDiff
      intcptPos = thisPos
    }
    if (JSON.stringify(thisPos) == JSON.stringify(playerPos) && getIndex) return index
    index++
  }
  return intcptPos
}

/**
 * Calculates the trajectory for intercepting the ball by a player.
 * @function
 * @param {Array} opposition - The array of opposition players.
 * @param {Array} ballPosition - The current position of the ball.
 * @param {Array} pitchSize - The size of the pitch [width, height].
 * @returns {Array} The array of points representing the trajectory for intercepting the ball.
 */
function getInterceptTrajectory(opposition, ballPosition, pitchSize) {
  let [pitchWidth, pitchHeight] = pitchSize
  let playerInformation = setPositions.closestPlayerToPosition(`name`, opposition, ballPosition)
  let interceptPlayer = playerInformation.thePlayer
  let targetX = pitchWidth / 2
  let targetY = (interceptPlayer.originPOS[1] < pitchHeight / 2) ? pitchHeight : 0
  let moveX = targetX - interceptPlayer.currentPOS[0]
  let moveY = targetY - interceptPlayer.currentPOS[1]
  let highNum = (Math.abs(moveX) <= Math.abs(moveY)) ? Math.abs(moveY) : Math.abs(moveX)
  let xDiff = moveX / highNum
  let yDiff = moveY / highNum
  let POI = []
  POI.push(interceptPlayer.currentPOS)
  for (let i of new Array(Math.round(highNum))) {
    let lastArrayPOS = POI.length - 1
    let lastXPOS = POI[lastArrayPOS][0]
    let lastYPOS = POI[lastArrayPOS][1]
    POI.push([common.round(lastXPOS + xDiff, 0), common.round(lastYPOS + yDiff, 0)])
  }
  return POI
}

/**
 * Calculates the movement for a player during a run in a football match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} player - The player object.
 * @param {number} ballX - The x-coordinate of the ball.
 * @param {number} ballY - The y-coordinate of the ball.
 * @returns {Array} An array representing the movement of the player in the x and y directions.
 */
function getRunMovement(matchDetails, player, ballX, ballY) {
  let move = [0, 0]
  if (player.fitness > 20) player.fitness = common.round(player.fitness - 0.005, 6)
  let side = (player.originPOS[1] > matchDetails.pitchSize[1] / 2) ? `bottom` : `top`
  if (player.hasBall && side == `bottom`) return [common.getRandomNumber(0, 2), common.getRandomNumber(0, 2)]
  if (player.hasBall && side == `top`) return [common.getRandomNumber(-2, 0), common.getRandomNumber(-2, 0)]
  let movementRun = [-1, 0, 1]
  if (common.isBetween(ballX, -60, 60) && common.isBetween(ballY, -60, 60)) {
    if (common.isBetween(ballX, -60, 0)) move[0] = movementRun[common.getRandomNumber(2, 2)]
    else if (common.isBetween(ballX, 0, 60)) move[0] = movementRun[common.getRandomNumber(0, 0)]
    else move[0] = movementRun[common.getRandomNumber(1, 1)]
    if (common.isBetween(ballY, -60, 0)) move[1] = movementRun[common.getRandomNumber(2, 2)]
    else if (common.isBetween(ballY, 0, 60)) move[1] = movementRun[common.getRandomNumber(0, 0)]
    else move[1] = movementRun[common.getRandomNumber(1, 1)]
    return move
  }
  let formationDirection = setPositions.formationCheck(player.intentPOS, player.currentPOS)
  if (formationDirection[0] === 0) move[0] = movementRun[common.getRandomNumber(1, 1)]
  else if (formationDirection[0] < 0) move[0] = movementRun[common.getRandomNumber(0, 1)]
  else if (formationDirection[0] > 0) move[0] = movementRun[common.getRandomNumber(1, 2)]
  if (formationDirection[1] === 0) move[1] = movementRun[common.getRandomNumber(1, 1)]
  else if (formationDirection[1] < 0) move[1] = movementRun[common.getRandomNumber(0, 1)]
  else if (formationDirection[1] > 0) move[1] = movementRun[common.getRandomNumber(1, 2)]
  return move
}

/**
 * Calculates the movement for a player during a sprint.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} player - The player object.
 * @param {number} ballX - The x-coordinate of the ball.
 * @param {number} ballY - The y-coordinate of the ball.
 * @returns {Array} The movement vector for the player during the sprint.
 */
function getSprintMovement(matchDetails, player, ballX, ballY) {
  let move = [0, 0]
  if (player.fitness > 30) player.fitness = common.round(player.fitness - 0.01, 6)
  let side = (player.originPOS[1] > matchDetails.pitchSize[1] / 2) ? `bottom` : `top`
  if (player.hasBall && side == `bottom`) return [common.getRandomNumber(-4, 4), common.getRandomNumber(-4, -2)]
  if (player.hasBall && side == `top`) return [common.getRandomNumber(-4, 4), common.getRandomNumber(2, 4)]
  let movementSprint = [-2, -1, 0, 1, 2]
  if (common.isBetween(ballX, -60, 60) && common.isBetween(ballY, -60, 60)) {
    if (common.isBetween(ballX, -60, 0)) move[0] = movementSprint[common.getRandomNumber(3, 4)]
    else if (common.isBetween(ballX, 0, 60)) move[0] = movementSprint[common.getRandomNumber(0, 1)]
    else move[0] = movementSprint[common.getRandomNumber(2, 2)]
    if (common.isBetween(ballY, -60, 0)) move[1] = movementSprint[common.getRandomNumber(3, 4)]
    else if (common.isBetween(ballY, 0, 60)) move[1] = movementSprint[common.getRandomNumber(0, 1)]
    else move[1] = movementSprint[common.getRandomNumber(2, 2)]
    return move
  }
  let formationDirection = setPositions.formationCheck(player.intentPOS, player.currentPOS)
  if (formationDirection[0] === 0) move[0] = movementSprint[common.getRandomNumber(2, 2)]
  else if (formationDirection[0] < 0) move[0] = movementSprint[common.getRandomNumber(0, 2)]
  else if (formationDirection[0] > 0) move[0] = movementSprint[common.getRandomNumber(2, 4)]
  if (formationDirection[1] === 0) move[1] = movementSprint[common.getRandomNumber(2, 2)]
  else if (formationDirection[1] < 0) move[1] = movementSprint[common.getRandomNumber(0, 2)]
  else if (formationDirection[1] > 0) move[1] = movementSprint[common.getRandomNumber(2, 4)]
  return move
}

/**
 * Finds the closest player to the ball and updates the closestPlayer object with the player's details.
 * Also sets the intent position for the matchDetails and logs the closest player's name in the iteration log.
 * @function
 * @param {Object} closestPlayer - The object that holds the details of the closest player.
 * @param {Object} team - The team object containing the players.
 * @param {Object} matchDetails - The details of the match, including the ball position.
 */
function closestPlayerToBall(closestPlayer, team, matchDetails) {
  let closestPlayerDetails
  let { position } = matchDetails.ball
  for (let thisPlayer of team.players) {
    let ballToPlayerX = Math.abs(thisPlayer.currentPOS[0] - position[0])
    let ballToPlayerY = Math.abs(thisPlayer.currentPOS[1] - position[1])
    let proximityToBall = ballToPlayerX + ballToPlayerY
    if (proximityToBall < closestPlayer.position) {
      closestPlayer.name = thisPlayer.name
      closestPlayer.position = proximityToBall
      closestPlayerDetails = thisPlayer
    }
  }

  setPositions.setIntentPosition(matchDetails, closestPlayerDetails)
  matchDetails.iterationLog.push(`Closest Player to ball: ${closestPlayerDetails.name}`)
}

/**
 * Checks if there is an offside violation in a football match.
 * @function
 * @param {Object} team1 - The first team object.
 * @param {Object} team2 - The second team object.
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} matchDetails.ball - The ball object.
 * @param {number[]} matchDetails.pitchSize - The size of the pitch.
 * @returns {Object} The updated match details.
 */
function checkOffside(team1, team2, matchDetails) {
  const { ball } = matchDetails
  const { pitchSize } = matchDetails
  const team1side = (team1.players[0].originPOS[1] < (pitchSize[1] / 2)) ? `top` : `bottom`
  if (ball.withTeam == false) return matchDetails
  if (team1side == `bottom`) {
    team1atBottom(team1, team2, pitchSize[1])
  } else {
    team1atTop(team1, team2, pitchSize[1])
  }
}

/**
 * Returns the topmost player from the given team based on their current position on the pitch.
 * @function
 * @param {Object} team - The team object containing the players.
 * @param {number} pitchHeight - The height of the pitch.
 * @returns {Object} The topmost player from the team.
 */
function getTopMostPlayer(team, pitchHeight) {
  let player
  for (let thisPlayer of team.players) {
    let topMostPosition = pitchHeight
    let [, plyrX] = thisPlayer.currentPOS
    if (thisPlayer.currentPOS[1] < topMostPosition) {
      topMostPosition = plyrX
      player = thisPlayer
    }
  }
  return player
}

/**
 * Returns the bottom-most player from the given team.
 * @function
 * @param {Object} team - The team object containing players.
 * @returns {Object} The bottom-most player from the team.
 */
function getBottomMostPlayer(team) {
  let player
  for (let thisPlayer of team.players) {
    let topMostPosition = 0
    let [, plyrX] = thisPlayer.currentPOS
    if (thisPlayer.currentPOS[1] > topMostPosition) {
      topMostPosition = plyrX
      player = thisPlayer
    }
  }
  return player
}

/**
 * Determines if team1 is at the bottom of the pitch and checks for offside positions.
 * @function
 * @param {Object} team1 - The first team object.
 * @param {Object} team2 - The second team object.
 * @param {number} pitchHeight - The height of the pitch.
 */
function team1atBottom(team1, team2, pitchHeight) {
  let offT1Ypos = offsideYPOS(team2, `top`, pitchHeight)
  let topPlayer = getTopMostPlayer(team1, pitchHeight)
  let topPlayerOffsidePosition = common.isBetween(topPlayer.currentPOS[1], offT1Ypos.pos1, offT1Ypos.pos2)
  if (topPlayerOffsidePosition && topPlayer.hasBall) return
  for (let thisPlayer of team1.players) {
    thisPlayer.offside = false
    if (common.isBetween(thisPlayer.currentPOS[1], offT1Ypos.pos1, offT1Ypos.pos2)) {
      if (!thisPlayer.hasBall) thisPlayer.offside = true
    }
  }
  let offT2Ypos = offsideYPOS(team1, `bottom`, pitchHeight)
  let btmPlayer = getBottomMostPlayer(team2)
  let btmPlayerOffsidePosition = common.isBetween(btmPlayer.currentPOS[1], offT2Ypos.pos2, offT2Ypos.pos1)
  if (btmPlayerOffsidePosition && btmPlayer.hasBall) return
  for (let thisPlayer of team2.players) {
    thisPlayer.offside = false
    if (common.isBetween(thisPlayer.currentPOS[1], offT2Ypos.pos2, offT2Ypos.pos1)) {
      if (!thisPlayer.hasBall) thisPlayer.offside = true
    }
  }
}

/**
 * Determines if team 1 is at the top of the pitch and checks for offside positions.
 * @function
 * @param {Array} team1 - The array of players in team 1.
 * @param {Array} team2 - The array of players in team 2.
 * @param {number} pitchHeight - The height of the pitch.
 */
function team1atTop(team1, team2, pitchHeight) {
  let offT1Ypos = offsideYPOS(team2, `bottom`, pitchHeight)
  let btmPlayer = getBottomMostPlayer(team1)
  let btmPlayerOffsidePosition = common.isBetween(btmPlayer.currentPOS[1], offT1Ypos.pos2, offT1Ypos.pos1)
  if (btmPlayerOffsidePosition && btmPlayer.hasBall) return
  for (let thisPlayer of team1.players) {
    thisPlayer.offside = false
    if (common.isBetween(thisPlayer.currentPOS[1], offT1Ypos.pos2, offT1Ypos.pos1)) {
      if (!thisPlayer.hasBall) thisPlayer.offside = true
    }
  }
  let offT2Ypos = offsideYPOS(team1, `top`, pitchHeight)
  let topPlayer = getTopMostPlayer(team2, pitchHeight)
  let topPlayerOffsidePosition = common.isBetween(topPlayer.currentPOS[1], offT2Ypos.pos1, offT2Ypos.pos2)
  if (topPlayerOffsidePosition && topPlayer.hasBall) return
  for (let thisPlayer of team2.players) {
    thisPlayer.offside = false
    if (common.isBetween(thisPlayer.currentPOS[1], offT2Ypos.pos1, offT2Ypos.pos2)) {
      if (!thisPlayer.hasBall) thisPlayer.offside = true
    }
  }
}

/**
 * Calculates the offside Y positions for a given team and side on the pitch.
 * @function
 * @param {Object} team - The team object containing player information.
 * @param {string} side - The side of the pitch ('top' or 'bottom').
 * @param {number} pitchHeight - The height of the pitch.
 * @returns {Object} The offside Y positions object with 'pos1' and 'pos2' properties.
 */
function offsideYPOS(team, side, pitchHeight) {
  let offsideYPOS = {
    'pos1': 0,
    'pos2': pitchHeight / 2
  }
  for (let thisPlayer of team.players) {
    if (thisPlayer.position == `GK`) {
      let [, position1] = thisPlayer.currentPOS
      offsideYPOS.pos1 = position1
      if (thisPlayer.hasBall) {
        offsideYPOS.pos2 = position1
        return offsideYPOS
      }
    } else if (side == `top`) {
      if (thisPlayer.currentPOS[1] < offsideYPOS.pos2) {
        let [, position2] = thisPlayer.currentPOS
        offsideYPOS.pos2 = position2
      }
    } else if (thisPlayer.currentPOS[1] > offsideYPOS.pos2) {
      let [, position2] = thisPlayer.currentPOS
      offsideYPOS.pos2 = position2
    }
  }
  return offsideYPOS
}

/**
 * @module `playerMovement` - This module contains functions related to player movement and actions in a football match.
 * 
 * @requires `common`
 * @requires `ballMovement`
 * @requires `setPositions`
 * @requires `actions`
 * 
 * @function `decideMovement` - Determines the movement of a player.
 * @function `getMovement` - Retrieves the movement of a player.
 * @function `closestPlayerToBall` - Finds the closest player to the ball.
 * @function `closestPlayerActionBallX` - Determines the action of the closest player to the ball on the X-axis.
 * @function `closestPlayerActionBallY` - Determines the action of the closest player to the ball on the Y-axis.
 * @function `setClosePlayerTakesBall` - Sets the closest player to take the ball.
 * @function `team1atBottom` - Checks if team 1 is at the bottom of the field.
 * @function `team1atTop` - Checks if team 1 is at the top of the field.
 * @function `handleBallPlayerActions` - Handles the actions of the player with the ball.
 * @function `updateInformation` - Updates the game information.
 * @function `ballMoved` - Handles the movement of the ball.
 * @function `getSprintMovement` - Retrieves the sprint movement of a player.
 * @function `getRunMovement` - Retrieves the run movement of a player.
 * @function `checkProvidedAction` - Checks if the provided action is valid.
 * @function `checkOffside` - Checks if there is an offside violation.
 * @function `completeSlide` - Completes the sliding action of a player.
 */
export const playerMovement = {
  decideMovement,
  getMovement,
  closestPlayerToBall,
  closestPlayerActionBallX,
  closestPlayerActionBallY,
  setClosePlayerTakesBall,
  team1atBottom,
  team1atTop,
  handleBallPlayerActions,
  updateInformation,
  ballMoved,
  getSprintMovement,
  getRunMovement,
  checkProvidedAction,
  checkOffside,
  completeSlide
}
