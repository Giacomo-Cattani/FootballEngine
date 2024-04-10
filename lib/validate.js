import { common } from '../lib/common.js'

/**
 * Validates a team object.
 * @function
 * @param {Object|string} team - The team object or a JSON string representing the team.
 * @throws {Error} If the team object is invalid or if no team name is given.
 */
function validateTeam(team) {
  if (typeof (team) != `object`) team = JSON.parse(team)
  if (!team.name) throw new Error(`No team name given.`)
  else {
    validateNumberOfPlayers(team.players)
    for (const player of team.players) {
      validatePlayerObjects(player)
    }
  }
}

/**
 * Validates the second half of a team object.
 * @function
 * @param {Object|string} team - The team object or a JSON string representation of the team object.
 * @throws {Error} If the team object is invalid or any required properties are missing.
 */
function validateTeamSecondHalf(team) {
  if (typeof (team) != `object`) team = JSON.parse(team)
  if (!team.name) throw new Error(`No team name given.`)
  else if (!team.intent) throw new Error(`No team intent given.`)
  else if (!team.teamID) throw new Error(`No team ID given.`)
  else {
    validateNumberOfPlayers(team.players)
    for (const player of team.players) {
      validatePlayerObjectsIteration(player)
    }
  }
}

/**
 * Validates the number of players in a team.
 * @function
 * @param {Array} players - The array of players in the team.
 * @throws {Error} If the number of players is not equal to 11.
 */
function validateNumberOfPlayers(players) {
  if (players.length != 11) {
    throw new Error(`There must be 11 players in a team`)
  }
}

/**
 * Validates the player object to ensure it contains the required properties.
 * @function
 * @param {Object} player - The player object to validate.
 * @throws {Error} If the player object is missing any of the required properties.
 */
function validatePlayerObjects(player) {
  let playerObjects = [`name`, `position`, `rating`, `currentPOS`, `injured`, `fitness`]
  for (const obj of playerObjects) {
    if (!Object.prototype.hasOwnProperty.call(player, obj)) {
      throw new Error(`Player must contain JSON variable: ${obj}`)
    }
  }
  validatePlayerSkills(player.skill)
}

/**
 * Validates the player objects iteration.
 * @function
 * @param {Object} player - The player object to validate.
 * @throws {Error} If the player object does not contain the required properties.
 */
function validatePlayerObjectsIteration(player) {
  let playerObjects = [`playerID`, `name`, `position`, `rating`, `currentPOS`, `injured`, `fitness`]
  playerObjects.push(`originPOS`, `intentPOS`, `action`, `offside`, `hasBall`, `stats`)
  for (const obj of playerObjects) {
    if (!Object.prototype.hasOwnProperty.call(player, obj)) {
      throw new Error(`Player must contain JSON variable: ${obj}`)
    }
  }
  validatePlayerSkills(player.skill)
  validateStats(player.stats)
}

/**
 * Validates the stats object for a player.
 * @function
 * @param {Object} stats - The stats object to be validated.
 * @throws {Error} If the stats object is missing any required properties.
 */
function validateStats(stats) {
  let statsObject = [`cards`, `goals`, `tackles`, `passes`, `shots`]
  let badObjects = 0
  for (const type of statsObject) {
    if (!Object.prototype.hasOwnProperty.call(stats, type)) {
      console.error(`Player must have set stats: ${type}`)
      badObjects++
    }
  }
  if (badObjects > 0) {
    throw new Error(`Provide Stats: cards,goals,tackles,passes,shots`)
  }
}

/**
 * Validates the skills of a player.
 * @function
 * @param {Object} skills - The skills object of the player.
 * @throws {Error} If any required skill is missing.
 */
function validatePlayerSkills(skills) {
  let skillType = [`passing`, `shooting`, `tackling`, `saving`, `agility`, `strength`, `penalty_taking`, `jumping`]
  let badObjects = 0
  for (const type of skillType) {
    if (!Object.prototype.hasOwnProperty.call(skills, type)) {
      console.error(`Player must contain skill: ${type}`)
      badObjects++
    }
  }
  if (badObjects > 0) {
    throw new Error(`Provide skills: passing,shooting,tackling,saving,agility,strength,penalty_taking,jumping`)
  }
}

/**
 * Validates the pitch details object.
 * @function
 * @param {Object} pitchDetails - The pitch details object to be validated.
 * @throws {Error} If the pitch details object is missing the required properties.
 */
function validatePitch(pitchDetails) {
  let pitchObjects = [`pitchWidth`, `pitchHeight`]
  let badObjects = 0
  for (const obj of pitchObjects) {
    if (!Object.prototype.hasOwnProperty.call(pitchDetails, obj)) {
      console.error(`Pitch Must contain: ${obj}`)
      badObjects++
    }
  }
  if (badObjects > 0) {
    throw new Error(`Please provide pitchWidth and pitchHeight`)
  }
}

/**
 * Validates the arguments passed to the function.
 * @function
 * @param {*} a - The first argument.
 * @param {*} b - The second argument.
 * @param {*} c - The third argument.
 * @throws {Error} Throws an error if any of the arguments is undefined.
 */
function validateArguments(a, b, c) {
  if (a === undefined || b === undefined || c === undefined) throw new Error(`Please provide two teams and a pitch`)
}

/**
 * Validates the match details object.
 * @function
 * @param {Object} matchDetails - The match details object to be validated.
 * @throws {Error} If the match details object is invalid.
 */
function validateMatchDetails(matchDetails) {
  let matchObjects = [`matchID`, `kickOffTeam`, `secondTeam`, `pitchSize`, `ball`, `half`]
  Array.prototype.push.apply(matchObjects, [`kickOffTeamStatistics`, `secondTeamStatistics`, `iterationLog`])
  let badObjects = 0
  for (const obj of matchObjects) {
    if (matchDetails) {
      if (!Object.prototype.hasOwnProperty.call(matchDetails, obj)) {
        console.error(`Match Details must contain: ${obj}`)
        badObjects++
      }
    }
    if (badObjects > 0) throw new Error(`Please provide valid match details JSON`)
  }
  validateBall(matchDetails.ball)
}

/**
 * Validates the properties of a ball object.
 * @function
 * @param {object} ball - The ball object to be validated.
 * @throws {Error} If any required property is missing in the ball object.
 */
function validateBall(ball) {
  let ballProps = [`position`, `withPlayer`, `Player`, `withTeam`, `direction`, `ballOverIterations`]
  let badObjects = 0
  for (const prop of ballProps) {
    if (!Object.prototype.hasOwnProperty.call(ball, prop)) {
      console.error(`Ball JSON must have property: ${prop}`)
      badObjects++
    }
  }
  if (badObjects > 0) throw new Error(`Provide: position,withPlayer,Player,withTeam,direction,ballOverIterations`)
}

/**
 * Validates the positions of players on the pitch.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @throws {Error} If a player is not on the pitch.
 */
function validatePlayerPositions(matchDetails) {
  let { kickOffTeam, secondTeam } = matchDetails
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize
  for (const player of kickOffTeam.players) {
    if (player.currentPOS[0] != 'NP') {
      let onPitchX = (common.isBetween(player.currentPOS[0], -1, pitchWidth + 1))
      let onPitchY = (common.isBetween(player.currentPOS[1], -1, pitchHeight + 1))
      if (onPitchX == false) throw new Error(`Player ${player.name} not on the pitch X: ${player.currentPOS[0]}`)
      if (onPitchY == false) throw new Error(`Player ${player.name} not on the pitch Y: ${player.currentPOS[1]}`)
    }
  }
  for (const player of secondTeam.players) {
    if (player.currentPOS[0] != 'NP') {
      let onPitchX = (common.isBetween(player.currentPOS[0], -1, pitchWidth + 1))
      let onPitchY = (common.isBetween(player.currentPOS[1], -1, pitchHeight + 1))
      if (onPitchX == false) throw new Error(`Player ${player.name} not on the pitch X: ${player.currentPOS[0]}`)
      if (onPitchY == false) throw new Error(`Player ${player.name} not on the pitch Y: ${player.currentPOS[1]}`)
    }
  }
}

/**
 * @module `validate` - A collection of functions for validating various aspects of a football match.
 * 
 * @requires `common`
 * 
 * @function `validateTeam` - Validates a team.
 * @function `validateTeamSecondHalf` - Validates the second half of a team.
 * @function `validatePlayerObjectsIteration` - Validates the iteration of player objects.
 * @function `validatePitch` - Validates the pitch.
 * @function `validateArguments` - Validates the arguments.
 * @function `validateMatchDetails` - Validates the match details.
 * @function `validatePlayerPositions` - Validates the player positions.
 */
export const validate = {
  validateTeam,
  validateTeamSecondHalf,
  validatePlayerObjectsIteration,
  validatePitch,
  validateArguments,
  validateMatchDetails,
  validatePlayerPositions
}
