//------------------------
//    NPM Modules
//------------------------
import { common } from './lib/common.js';
import { setPositions } from './lib/setPositions.js';
import { setVariables } from './lib/setVariables.js';
import { playerMovement } from './lib/playerMovement.js';
import { ballMovement } from './lib/ballMovement.js';
import { validate } from './lib/validate.js';

//------------------------
//    Functions
//------------------------
/**
 * Functions for initialize a football match
 * @function
 * @param {string} team1 - Path of the file which contain details of team1
 * @param {string} team2 - Path of the file which contain details of team2
 * @param {string} pitchDetails - Path of the file which contain details of pitch
 * @returns {JSON} - Returns JSON object which contain details of the match
 */
async function initiateGame(team1, team2, pitchDetails) {
  validate.validateArguments(team1, team2, pitchDetails)
  validate.validateTeam(team1)
  validate.validateTeam(team2)
  validate.validatePitch(pitchDetails)
  let matchDetails = setVariables.populateMatchDetails(team1, team2, pitchDetails)
  let kickOffTeam = setVariables.setGameVariables(matchDetails.kickOffTeam)
  let secondTeam = setVariables.setGameVariables(matchDetails.secondTeam)
  kickOffTeam = setVariables.koDecider(kickOffTeam, matchDetails)
  matchDetails.iterationLog.push(`Team to kick off - ${kickOffTeam.name}`)
  matchDetails.iterationLog.push(`Second team - ${secondTeam.name}`)
  setPositions.switchSide(matchDetails, secondTeam)
  matchDetails.kickOffTeam = kickOffTeam
  matchDetails.secondTeam = secondTeam
  return matchDetails
}

/**
 * Functions for do an iteration of a football match
 * @function
 * @param {string} matchDetails - JSON object which contain details of the match
 * @returns {JSON} - Returns JSON object which contain details of the match
 */
async function playIteration(matchDetails) {
  let closestPlayerA = {
    'name': '',
    'position': 100000
  }
  let closestPlayerB = {
    'name': '',
    'position': 100000
  }
  validate.validateMatchDetails(matchDetails)
  validate.validateTeamSecondHalf(matchDetails.kickOffTeam)
  validate.validateTeamSecondHalf(matchDetails.secondTeam)
  validate.validatePlayerPositions(matchDetails)
  matchDetails.iterationLog = []
  let { kickOffTeam, secondTeam } = matchDetails
  common.matchInjury(matchDetails, kickOffTeam)
  common.matchInjury(matchDetails, secondTeam)
  matchDetails = ballMovement.moveBall(matchDetails)
  if (matchDetails.endIteration == true) {
    delete matchDetails.endIteration
    return matchDetails
  }
  playerMovement.closestPlayerToBall(closestPlayerA, kickOffTeam, matchDetails)
  playerMovement.closestPlayerToBall(closestPlayerB, secondTeam, matchDetails)
  kickOffTeam = playerMovement.decideMovement(closestPlayerA, kickOffTeam, secondTeam, matchDetails)
  secondTeam = playerMovement.decideMovement(closestPlayerB, secondTeam, kickOffTeam, matchDetails)
  matchDetails.kickOffTeam = kickOffTeam
  matchDetails.secondTeam = secondTeam
  if (matchDetails.ball.ballOverIterations.length == 0 || matchDetails.ball.withTeam != '') {
    playerMovement.checkOffside(kickOffTeam, secondTeam, matchDetails)
  }
  return matchDetails
}

/**
 * Functions for initialize second time of a football match
 * @function
 * @param {string} matchDetails - JSON object which contain details of the match
 * @returns {JSON} - Returns JSON object which contain details of the match
 */
async function startSecondHalf(matchDetails) {
  validate.validateMatchDetails(matchDetails)
  validate.validateTeamSecondHalf(matchDetails.kickOffTeam)
  validate.validateTeamSecondHalf(matchDetails.secondTeam)
  validate.validatePlayerPositions(matchDetails)
  let { kickOffTeam, secondTeam } = matchDetails
  setPositions.switchSide(matchDetails, kickOffTeam)
  setPositions.switchSide(matchDetails, secondTeam)
  common.removeBallFromAllPlayers(matchDetails)
  setVariables.resetPlayerPositions(matchDetails)
  setPositions.setBallSpecificGoalScoreValue(matchDetails, matchDetails.secondTeam)
  matchDetails.iterationLog = [`Second Half Started: ${matchDetails.secondTeam.name} to kick offs`]
  matchDetails.kickOffTeam.intent = `defend`
  matchDetails.secondTeam.intent = `attack`
  matchDetails.half++
  return matchDetails
}

export const engine = {
  initiateGame,
  playIteration,
  startSecondHalf
}
