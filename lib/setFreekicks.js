import { common } from '../lib/common.js'

/**
 * Sets the position of the top free kick based on the ball's position on the pitch.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @returns {Object} The updated match details after setting the top free kick position.
 */
function setTopFreekick(matchDetails) {
  common.removeBallFromAllPlayers(matchDetails)
  let { kickOffTeam, secondTeam } = matchDetails
  let [, pitchHeight] = matchDetails.pitchSize
  let [, ballY] = matchDetails.ball.position
  let attack = (kickOffTeam.players[0].originPOS[1] < pitchHeight / 2) ? kickOffTeam : secondTeam
  let defence = (kickOffTeam.players[0].originPOS[1] < pitchHeight / 2) ? secondTeam : kickOffTeam
  let hundredToHalfway = common.isBetween(ballY, 100, (pitchHeight / 2) + 1)
  let halfwayToLastQtr = common.isBetween(ballY, pitchHeight / 2, pitchHeight - (pitchHeight / 4))
  let upperFinalQtr = common.isBetween(ballY, pitchHeight - (pitchHeight / 4), pitchHeight - (pitchHeight / 6) - 5)
  let lowerFinalQtr = common.isBetween(ballY, pitchHeight - (pitchHeight / 6) - 5, pitchHeight)

  if (ballY < 101) return setTopOneHundredYPos(matchDetails, attack, defence)
  if (hundredToHalfway) return setTopOneHundredToHalfwayYPos(matchDetails, attack, defence)
  if (halfwayToLastQtr) return setTopHalfwayToBottomQtrYPos(matchDetails, attack, defence)
  if (upperFinalQtr) return setTopBottomQtrCentreYPos(matchDetails, attack, defence)
  if (lowerFinalQtr) return setTopLowerFinalQtrBylinePos(matchDetails, attack, defence)
}

/**
 * Sets the position of the ball for a bottom free kick based on the given match details.
 * @function
 * @param {Object} matchDetails - The details of the match.
 */
function setBottomFreekick(matchDetails) {
  common.removeBallFromAllPlayers(matchDetails)
  let { kickOffTeam, secondTeam } = matchDetails
  let [, pitchHeight] = matchDetails.pitchSize
  let [, ballY] = matchDetails.ball.position
  let attack = (kickOffTeam.players[0].originPOS[1] > pitchHeight / 2) ? kickOffTeam : secondTeam
  let defence = (kickOffTeam.players[0].originPOS[1] > pitchHeight / 2) ? secondTeam : kickOffTeam
  let hundredToHalfway = common.isBetween(ballY, (pitchHeight / 2) - 1, pitchHeight - 100)
  let halfwayToLastQtr = common.isBetween(ballY, pitchHeight / 4, pitchHeight / 2)
  let upperFinalQtr = common.isBetween(ballY, (pitchHeight / 6) - 5, pitchHeight / 4)
  let lowerFinalQtr = common.isBetween(ballY, 0, (pitchHeight / 6) - 5)

  if (ballY > pitchHeight - 100) return setBottomOneHundredYPos(matchDetails, attack, defence)
  if (hundredToHalfway) return setBottomOneHundredToHalfwayYPos(matchDetails, attack, defence)
  if (halfwayToLastQtr) return setBottomHalfwayToTopQtrYPos(matchDetails, attack, defence)
  if (upperFinalQtr) return setBottomUpperQtrCentreYPos(matchDetails, attack, defence)
  if (lowerFinalQtr) return setBottomLowerFinalQtrBylinePos(matchDetails, attack, defence)
}

/**
 * Sets the position of players and the ball for a free kick scenario.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} attack - The attacking team details.
 * @param {Object} defence - The defending team details.
 * @returns {Object} The updated match details.
 */
function setTopOneHundredYPos(matchDetails, attack, defence) {
  attack.players[0].hasBall = true
  let { ball } = matchDetails
  ball.lastTouch.playerName = attack.players[0].name
  ball.Player = attack.players[0].playerID
  ball.withTeam = attack.teamID
  ball.direction = 'south'
  for (let player of attack.players) {
    if (player.position == 'GK') player.currentPOS = matchDetails.ball.position.map(x => x)
    if (player.position != 'GK') player.currentPOS = player.originPOS.map(x => x)
  }
  for (let player of defence.players) {
    if (player.position == 'GK') player.currentPOS = player.originPOS.map(x => x)
    if (player.position != 'GK') player.currentPOS = [player.originPOS[0], common.upToMin(player.originPOS[1] - 100, 0)]
  }
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the position of players and the ball for a free kick scenario where the ball is moved to the bottom of the pitch.
 * @function
 * @param {Object} matchDetails - The details of the match, including the ball and pitch size.
 * @param {Object} attack - The attacking team details, including the players.
 * @param {Object} defence - The defending team details, including the players.
 * @returns {Object} The updated match details with the new player and ball positions.
 */
function setBottomOneHundredYPos(matchDetails, attack, defence) {
  attack.players[0].hasBall = true
  let { ball, pitchSize } = matchDetails
  let [, pitchHeight] = pitchSize
  ball.lastTouch.playerName = attack.players[0].name
  ball.Player = attack.players[0].playerID
  ball.withTeam = attack.teamID
  ball.direction = 'north'
  for (let player of attack.players) {
    if (player.position == 'GK') player.currentPOS = matchDetails.ball.position.map(x => x)
    if (player.position != 'GK') player.currentPOS = player.originPOS.map(x => x)
  }
  for (let player of defence.players) {
    if (player.position == 'GK') player.currentPOS = player.originPOS.map(x => x)
    if (player.position != 'GK') {
      player.currentPOS = [player.originPOS[0], common.upToMax(player.originPOS[1] + 100, pitchHeight)]
    }
  }
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the position of players and the ball for a free kick scenario.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} attack - The attacking team details.
 * @param {Object} defence - The defending team details.
 * @returns {Object} The updated match details.
 */
function setTopOneHundredToHalfwayYPos(matchDetails, attack, defence) {
  let { ball } = matchDetails
  let [, pitchHeight] = matchDetails.pitchSize
  let goalieToKick = common.isBetween(ball.position[1], 0, (pitchHeight * 0.25) + 1)
  let kickPlayer = (goalieToKick) ? attack.players[0] : attack.players[3]
  kickPlayer.hasBall = true
  ball.lastTouch.playerName = kickPlayer.name
  ball.Player = kickPlayer.playerID
  ball.withTeam = attack.teamID
  ball.direction = 'south'
  for (let player of attack.players) {
    if (kickPlayer.position == 'GK') {
      if (player.position == 'GK') player.currentPOS = ball.position.map(x => x)
      if (player.name != kickPlayer.name) {
        let newYPOS = common.upToMax(player.originPOS[1] + 300, pitchHeight * 0.9)
        player.currentPOS = [player.originPOS[0], parseInt(newYPOS, 10)]
      }
    } else {
      let newYPOS = player.originPOS[1] + (ball.position[1] - player.originPOS[1]) + 300
      if (player.name == kickPlayer.name) player.currentPOS = ball.position.map(x => x)
      else if (player.position == 'GK') {
        let maxYPOSCheck = parseInt(common.upToMax(newYPOS, pitchHeight * 0.25), 10)
        player.currentPOS = [player.originPOS[0], maxYPOSCheck]
      } else if (['CB', 'LB', 'RB'].includes(player.position)) {
        let maxYPOSCheck = parseInt(common.upToMax(newYPOS, pitchHeight * 0.5), 10)
        player.currentPOS = [player.originPOS[0], maxYPOSCheck]
      } else if (['CM', 'LM', 'RM'].includes(player.position)) {
        let maxYPOSCheck = parseInt(common.upToMax(newYPOS, pitchHeight * 0.75), 10)
        player.currentPOS = [player.originPOS[0], maxYPOSCheck]
      } else {
        let maxYPOSCheck = parseInt(common.upToMax(newYPOS, pitchHeight * 0.9), 10)
        player.currentPOS = [player.originPOS[0], maxYPOSCheck]
      }
    }
  }
  for (let player of defence.players) {
    if (kickPlayer.position == 'GK') {
      if (player.position == 'GK') player.currentPOS = player.originPOS.map(x => x)
      if (player.position != 'GK') {
        player.currentPOS = [player.originPOS[0], common.upToMin(player.originPOS[1] - 100, 0)]
      }
    } else if (['GK', 'CB', 'LB', 'RB'].includes(player.position)) player.currentPOS = player.originPOS.map(x => x)
    else if (['CM', 'LM', 'RM'].includes(player.position)) {
      player.currentPOS = [player.originPOS[0], parseInt((pitchHeight * 0.75) + 5, 10)]
    } else {
      player.currentPOS = [player.originPOS[0], parseInt(pitchHeight * 0.5, 10)]
    }
  }
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the position of players and the ball for a free kick scenario, where the ball is at the bottom 100 units and needs to be moved to the halfway Y position.
 * @function
 * @param {Object} matchDetails - The details of the match, including the ball and player information.
 * @param {Object} attack - The attacking team details, including player information.
 * @param {Object} defence - The defending team details, including player information.
 * @returns {Object} The updated match details with the new player and ball positions.
 */
function setBottomOneHundredToHalfwayYPos(matchDetails, attack, defence) {
  let { ball } = matchDetails
  let [, pitchHeight] = matchDetails.pitchSize
  let goalieToKick = common.isBetween(ball.position[1], (pitchHeight * 0.75) + 1, pitchHeight)
  let kickPlayer = (goalieToKick) ? attack.players[0] : attack.players[3]
  kickPlayer.hasBall = true
  ball.lastTouch.playerName = kickPlayer.name
  ball.Player = kickPlayer.playerID
  ball.withTeam = attack.teamID
  ball.direction = 'north'
  for (let player of attack.players) {
    if (kickPlayer.position == 'GK') {
      if (player.position == 'GK') player.currentPOS = ball.position.map(x => x)
      if (player.name != kickPlayer.name) {
        let newYPOS = common.upToMin(player.originPOS[1] - 300, pitchHeight * 0.1)
        player.currentPOS = [player.originPOS[0], parseInt(newYPOS, 10)]
      }
    } else {
      let newYPOS = player.originPOS[1] + (ball.position[1] - player.originPOS[1]) - 300
      if (player.name == kickPlayer.name) player.currentPOS = ball.position.map(x => x)
      else if (player.position == 'GK') {
        let maxYPOSCheck = parseInt(common.upToMin(newYPOS, pitchHeight * 0.75), 10)
        player.currentPOS = [player.originPOS[0], maxYPOSCheck]
      } else if (['CB', 'LB', 'RB'].includes(player.position)) {
        let maxYPOSCheck = parseInt(common.upToMin(newYPOS, pitchHeight * 0.5), 10)
        player.currentPOS = [player.originPOS[0], maxYPOSCheck]
      } else if (['CM', 'LM', 'RM'].includes(player.position)) {
        let maxYPOSCheck = parseInt(common.upToMin(newYPOS, pitchHeight * 0.25), 10)
        player.currentPOS = [player.originPOS[0], maxYPOSCheck]
      } else {
        let maxYPOSCheck = parseInt(common.upToMin(newYPOS, pitchHeight * 0.1), 10)
        player.currentPOS = [player.originPOS[0], maxYPOSCheck]
      }
    }
  }
  for (let player of defence.players) {
    if (kickPlayer.position == 'GK') {
      if (player.position == 'GK') player.currentPOS = player.originPOS.map(x => x)
      if (player.position != 'GK') {
        let newYPOS = common.upToMax(player.originPOS[1] + 100, pitchHeight)
        player.currentPOS = [player.originPOS[0], parseInt(newYPOS, 10)]
      }
    } else if (['GK', 'CB', 'LB', 'RB'].includes(player.position)) player.currentPOS = player.originPOS.map(x => x)
    else if (['CM', 'LM', 'RM'].includes(player.position)) {
      player.currentPOS = [player.originPOS[0], parseInt((pitchHeight * 0.25) - 5, 10)]
    } else {
      player.currentPOS = [player.originPOS[0], parseInt(pitchHeight * 0.5, 10)]
    }
  }
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the positions of players and the ball for a free kick scenario, where the ball is positioned in the top half of the pitch and towards the bottom quarter of the Y-axis.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} attack - The attacking team details.
 * @param {Object} defence - The defending team details.
 * @returns {Object} The updated match details with player and ball positions set.
 */
function setTopHalfwayToBottomQtrYPos(matchDetails, attack, defence) {
  let { ball } = matchDetails
  let [pitchWidth, pitchHeight] = matchDetails.pitchSize
  let kickPlayer = attack.players[5]
  kickPlayer.hasBall = true
  ball.lastTouch.playerName = kickPlayer.name
  ball.Player = kickPlayer.playerID
  ball.withTeam = attack.teamID
  let ballInCentre = common.isBetween(ball.position[0], (pitchWidth / 4) + 5, (pitchWidth - (pitchWidth / 4) - 5))
  let ballLeft = common.isBetween(ball.position[0], 0, (pitchWidth / 4) + 4)
  ball.direction = (ballInCentre) ? 'south' : (ballLeft) ? 'southeast' : 'southwest'
  kickPlayer.currentPOS = ball.position.map(x => x)
  for (let player of attack.players) {
    if (player.position == 'GK') player.currentPOS = [player.originPOS[0], parseInt(pitchHeight * 0.25, 10)]
    else if (['CB', 'LB', 'RB'].includes(player.position)) {
      let maxYPOSCheck = parseInt(common.upToMax(ball.position[1] - 100, pitchHeight * 0.5), 10)
      player.currentPOS = [player.originPOS[0], maxYPOSCheck]
    } else if (['CM', 'LM', 'RM'].includes(player.position)) {
      let maxYPOSCheck = common.upToMax(ball.position[1] + common.getRandomNumber(150, 300), pitchHeight * 0.75)
      if (player.name != kickPlayer.name) player.currentPOS = [player.originPOS[0], parseInt(maxYPOSCheck, 10)]
    } else {
      let maxYPOSCheck = common.upToMax(ball.position[1] + common.getRandomNumber(300, 400), pitchHeight * 0.9)
      player.currentPOS = [player.originPOS[0], parseInt(maxYPOSCheck, 10)]
    }
  }
  for (let player of defence.players) {
    if (['GK', 'CB', 'LB', 'RB'].includes(player.position)) {
      player.currentPOS = player.originPOS.map(x => x)
    } else if (['CM', 'LM', 'RM'].includes(player.position)) {
      player.currentPOS = [player.originPOS[0], parseInt(pitchHeight * 0.75, 10)]
    } else {
      player.currentPOS = [player.originPOS[0], parseInt(pitchHeight * 0.5, 10)]
    }
  }
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the positions of players and the ball for a free kick scenario, where the ball is in the bottom half of the pitch and needs to be kicked towards the top quarter of the pitch.
 * @function
 * @param {Object} matchDetails - The details of the match, including the ball and player information.
 * @param {Object} attack - The attacking team details, including the players.
 * @param {Object} defence - The defending team details, including the players.
 * @returns {Object} The updated match details with the new player and ball positions.
 */
function setBottomHalfwayToTopQtrYPos(matchDetails, attack, defence) {
  let { ball } = matchDetails
  let [pitchWidth, pitchHeight] = matchDetails.pitchSize
  let kickPlayer = attack.players[5]
  kickPlayer.hasBall = true
  ball.lastTouch.playerName = kickPlayer.name
  ball.Player = kickPlayer.playerID
  ball.withTeam = attack.teamID
  let ballInCentre = common.isBetween(ball.position[0], (pitchWidth / 4) + 5, (pitchWidth - (pitchWidth / 4) - 5))
  let ballLeft = common.isBetween(ball.position[0], 0, (pitchWidth / 4) + 4)
  ball.direction = (ballInCentre) ? 'north' : (ballLeft) ? 'northeast' : 'northwest'
  kickPlayer.currentPOS = ball.position.map(x => x)
  for (let player of attack.players) {
    if (player.position == 'GK') player.currentPOS = [player.originPOS[0], parseInt(pitchHeight * 0.75, 10)]
    else if (['CB', 'LB', 'RB'].includes(player.position)) {
      let maxYPOSCheck = parseInt(common.upToMin(ball.position[1] + 100, pitchHeight * 0.5), 10)
      player.currentPOS = [player.originPOS[0], maxYPOSCheck]
    } else if (['CM', 'LM', 'RM'].includes(player.position)) {
      let maxYPOSCheck = common.upToMin(ball.position[1] - common.getRandomNumber(150, 300), pitchHeight * 0.25)
      if (player.name != kickPlayer.name) player.currentPOS = [player.originPOS[0], parseInt(maxYPOSCheck, 10)]
    } else {
      let maxYPOSCheck = common.upToMin(ball.position[1] - common.getRandomNumber(300, 400), pitchHeight * 0.1)
      player.currentPOS = [player.originPOS[0], parseInt(maxYPOSCheck, 10)]
    }
  }
  for (let player of defence.players) {
    if (['GK', 'CB', 'LB', 'RB'].includes(player.position)) {
      player.currentPOS = player.originPOS.map(x => x)
    } else if (['CM', 'LM', 'RM'].includes(player.position)) {
      player.currentPOS = [player.originPOS[0], parseInt(pitchHeight * 0.25, 10)]
    } else {
      player.currentPOS = [player.originPOS[0], parseInt(pitchHeight * 0.5, 10)]
    }
  }
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the positions of players and the ball for a free kick scenario in a football match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} attack - The attacking team details.
 * @param {Object} defence - The defending team details.
 * @returns {Object} The updated match details with player and ball positions set.
 */
function setTopBottomQtrCentreYPos(matchDetails, attack, defence) {
  let { ball } = matchDetails
  let [pitchWidth, pitchHeight] = matchDetails.pitchSize
  let kickPlayer = attack.players[5]
  kickPlayer.hasBall = true
  ball.lastTouch.playerName = kickPlayer.name
  ball.Player = kickPlayer.playerID
  ball.withTeam = attack.teamID
  let ballInCentre = common.isBetween(ball.position[0], (pitchWidth / 4) + 5, (pitchWidth - (pitchWidth / 4) - 5))
  let ballLeft = common.isBetween(ball.position[0], 0, (pitchWidth / 4) + 4)
  ball.direction = (ballInCentre) ? 'south' : (ballLeft) ? 'southeast' : 'southwest'
  kickPlayer.currentPOS = ball.position.map(x => x)
  for (let player of attack.players) {
    if (player.position == 'GK') player.currentPOS = [player.originPOS[0], parseInt(pitchHeight * 0.25, 10)]
    else if (['CB', 'LB', 'RB'].includes(player.position)) {
      if (player.position == 'CB') {
        player.currentPOS = [player.originPOS[0], parseInt(pitchHeight * 0.5, 10)]
      } else if (player.position == 'LB' || player.position == 'RB') {
        player.currentPOS = [player.originPOS[0], parseInt(pitchHeight * 0.66, 10)]
      }
    } else if (player.name != kickPlayer.name) {
      player.currentPOS = common.getRandomBottomPenaltyPosition(matchDetails)
    }
  }
  let playerSpace = -3
  for (let player of defence.players) {
    let ballDistanceFromGoalX = ball.position[0] - (pitchWidth / 2)
    let midWayFromBalltoGoalX = parseInt((ball.position[0] - ballDistanceFromGoalX) / 2, 10)
    let ballDistanceFromGoalY = (pitchHeight - ball.position[1])
    let midWayFromBalltoGoalY = parseInt((ball.position[1] - ballDistanceFromGoalY) / 2, 10)
    if (player.position == 'GK') player.currentPOS = player.currentPOS = player.originPOS.map(x => x)
    else if (['CB', 'LB', 'RB'].includes(player.position)) {
      player.currentPOS = [midWayFromBalltoGoalX + playerSpace, midWayFromBalltoGoalY]
      playerSpace += 2
    } else {
      player.currentPOS = common.getRandomBottomPenaltyPosition(matchDetails)
    }
  }
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the positions of players and the ball for a free kick scenario in the bottom upper quarter center of the pitch.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} attack - The attacking team details.
 * @param {Object} defence - The defending team details.
 * @returns {Object} The updated match details with player and ball positions set.
 */
function setBottomUpperQtrCentreYPos(matchDetails, attack, defence) {
  let { ball } = matchDetails
  let [pitchWidth, pitchHeight] = matchDetails.pitchSize
  let kickPlayer = attack.players[5]
  kickPlayer.hasBall = true
  ball.lastTouch.playerName = kickPlayer.name
  ball.Player = kickPlayer.playerID
  ball.withTeam = attack.teamID
  let ballInCentre = common.isBetween(ball.position[0], (pitchWidth / 4) + 5, (pitchWidth - (pitchWidth / 4) - 5))
  let ballLeft = common.isBetween(ball.position[0], 0, (pitchWidth / 4) + 4)
  ball.direction = (ballInCentre) ? 'north' : (ballLeft) ? 'northeast' : 'northwest'
  kickPlayer.currentPOS = ball.position.map(x => x)
  for (let player of attack.players) {
    if (player.position == 'GK') player.currentPOS = [player.originPOS[0], parseInt(pitchHeight * 0.75, 10)]
    else if (['CB', 'LB', 'RB'].includes(player.position)) {
      if (player.position == 'CB') {
        player.currentPOS = [player.originPOS[0], parseInt(pitchHeight * 0.5, 10)]
      } else if (player.position == 'LB' || player.position == 'RB') {
        player.currentPOS = [player.originPOS[0], parseInt(pitchHeight * 0.33, 10)]
      }
    } else if (player.name != kickPlayer.name) {
      player.currentPOS = common.getRandomTopPenaltyPosition(matchDetails)
    }
  }
  let playerSpace = -3
  for (let player of defence.players) {
    let ballDistanceFromGoalX = ball.position[0] - (pitchWidth / 2)
    let midWayFromBalltoGoalX = parseInt((ball.position[0] - ballDistanceFromGoalX) / 2, 10)
    let midWayFromBalltoGoalY = parseInt(ball.position[1] / 2, 10)
    if (player.position == 'GK') player.currentPOS = player.currentPOS = player.originPOS.map(x => x)
    else if (['CB', 'LB', 'RB'].includes(player.position)) {
      player.currentPOS = [midWayFromBalltoGoalX + playerSpace, midWayFromBalltoGoalY]
      playerSpace += 2
    } else {
      player.currentPOS = common.getRandomTopPenaltyPosition(matchDetails)
    }
  }
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the positions of players and the ball for a specific scenario in a football match.
 * This function is used to set the positions of players and the ball when a free kick is taken from the top lower quarter byline.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} attack - The attacking team details.
 * @param {Object} defence - The defending team details.
 * @returns {Object} The updated match details with the new positions of players and the ball.
 */
function setTopLowerFinalQtrBylinePos(matchDetails, attack, defence) {
  let { ball } = matchDetails
  let [pitchWidth, pitchHeight] = matchDetails.pitchSize
  let kickPlayer = attack.players[5]
  kickPlayer.hasBall = true
  ball.lastTouch.playerName = kickPlayer.name
  ball.Player = kickPlayer.playerID
  ball.withTeam = attack.teamID
  let ballLeft = common.isBetween(ball.position[0], 0, (pitchWidth / 4) + 4)
  ball.direction = (ballLeft) ? 'east' : 'west'
  kickPlayer.currentPOS = ball.position.map(x => x)
  for (let player of attack.players) {
    let { playerID, position, originPOS } = player
    if (position == 'GK') player.currentPOS = [originPOS[0], parseInt(pitchHeight * 0.25, 10)]
    else if (['CB', 'LB', 'RB'].includes(position)) {
      if (position == 'CB') player.currentPOS = [originPOS[0], parseInt(pitchHeight * 0.5, 10)]
      else if (['LB', 'RB'].includes(position)) player.currentPOS = [originPOS[0], parseInt(pitchHeight * 0.66, 10)]
    } else if (playerID != kickPlayer.playerID) player.currentPOS = common.getRandomBottomPenaltyPosition(matchDetails)
  }
  let playerSpace = common.upToMax(ball.position[1] + 3, pitchHeight)
  for (let player of defence.players) {
    let { position, originPOS } = player
    let ballDistanceFromGoalX = ball.position[0] - (pitchWidth / 2)
    let midWayFromBalltoGoalX = parseInt((ball.position[0] - ballDistanceFromGoalX) / 2, 10)
    if (position == 'GK') player.currentPOS = player.currentPOS = originPOS.map(x => x)
    else if (['CB', 'LB', 'RB'].includes(position)) {
      player.currentPOS = [midWayFromBalltoGoalX, playerSpace]
      playerSpace -= 2
    } else player.currentPOS = common.getRandomBottomPenaltyPosition(matchDetails)
  }
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * Sets the positions of players and the ball for a specific scenario in a football match.
 * This function is used to set the positions for the bottom lower quarter byline scenario.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} attack - The attacking team details.
 * @param {Object} defence - The defending team details.
 * @returns {Object} The updated match details with the new positions.
 */
function setBottomLowerFinalQtrBylinePos(matchDetails, attack, defence) {
  let { ball } = matchDetails
  let [pitchWidth, pitchHeight] = matchDetails.pitchSize
  let kickPlayer = attack.players[5]
  kickPlayer.hasBall = true
  ball.lastTouch.playerName = kickPlayer.name
  ball.Player = kickPlayer.playerID
  ball.withTeam = attack.teamID
  let ballLeft = common.isBetween(ball.position[0], 0, (pitchWidth / 4) + 4)
  ball.direction = (ballLeft) ? 'east' : 'west'
  kickPlayer.currentPOS = ball.position.map(x => x)
  for (let player of attack.players) {
    let { playerID, position, originPOS } = player
    if (position == 'GK') player.currentPOS = [originPOS[0], parseInt(pitchHeight * 0.75, 10)]
    else if (['CB', 'LB', 'RB'].includes(position)) {
      if (position == 'CB') player.currentPOS = [originPOS[0], parseInt(pitchHeight * 0.5, 10)]
      else if (['LB', 'RB'].includes(position)) player.currentPOS = [originPOS[0], parseInt(pitchHeight * 0.33, 10)]
    } else if (playerID != kickPlayer.playerID) player.currentPOS = common.getRandomTopPenaltyPosition(matchDetails)
  }
  let playerSpace = common.upToMin(ball.position[1] - 3, 0)
  for (let player of defence.players) {
    let { position, originPOS } = player
    let ballDistanceFromGoalX = ball.position[0] - (pitchWidth / 2)
    let midWayFromBalltoGoalX = parseInt((ball.position[0] - ballDistanceFromGoalX) / 2, 10)
    if (position == 'GK') player.currentPOS = player.currentPOS = originPOS.map(x => x)
    else if (['CB', 'LB', 'RB'].includes(position)) {
      player.currentPOS = [midWayFromBalltoGoalX, playerSpace]
      playerSpace += 2
    } else player.currentPOS = common.getRandomTopPenaltyPosition(matchDetails)
  }
  matchDetails.endIteration = true
  return matchDetails
}

/**
 * @module `setFreekicks` - Provides functions for setting the position of free kicks in a football match.
 * 
 * @requires `common`
 * 
 * @function `setTopFreekick` - Sets the position of the top free kick.
 * @function `setBottomFreekick` - Sets the position of the bottom free kick.
 */
export const setFreekicks = {
  setTopFreekick,
  setBottomFreekick
}
