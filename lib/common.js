import fs from 'fs';
//---------------
//Maths Functions
//---------------
/**
 * Generates a random number between the specified minimum and maximum values.
 * @function
 * @param {number} min - The minimum value of the range (inclusive).
 * @param {number} max - The maximum value of the range (inclusive).
 * @returns {number} The randomly generated number.
 */
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Rounds a number to the specified number of decimal places.
 * @function
 * @param {number} value - The number to round.
 * @param {number} decimals - The number of decimal places to round to.
 * @returns {number} The rounded number.
 */
function round(value, decimals) {
  return Number(`${Math.round(`${value}e${decimals}`)}e-${decimals}`)
}

/**
 * Checks if a number is between two other numbers.
 * @function
 * @param {number} num - The number to check.
 * @param {number} low - The lower bound.
 * @param {number} high - The upper bound.
 * @returns {boolean} Returns `true` if the number is between the lower and upper bounds, `false` otherwise.
 */
function isBetween(num, low, high) {
  return num > low && num < high;
}

/**
 * Returns the smaller of two numbers, up to a maximum value.
 * @function
 * @param {number} num - The number to compare.
 * @param {number} max - The maximum value to limit the number to.
 * @returns {number} The smaller of the two numbers, up to the maximum value.
 */
function upToMax(num, max) {
  if (num > max) return max
  return num
}

/**
 * Returns the given number if it is greater than or equal to the minimum value,
 * otherwise returns the minimum value.
 * @function
 * @param {number} num - The number to check.
 * @param {number} min - The minimum value.
 * @returns {number} The number itself if it is greater than or equal to the minimum value, otherwise the minimum value.
 */
function upToMin(num, min) {
  if (num < min) return min
  return num
}

/**
 * Calculates the trajectory of a ball given the initial position, final position, and power.
 * @function
 * @param {number[]} thisPOS - The initial position of the ball as an array [x, y].
 * @param {number[]} newPOS - The final position of the ball as an array [x, y].
 * @param {number} power - The power of the ball.
 * @returns {number[][]} The trajectory of the ball as an array of arrays [x, y, h].
 */
function getBallTrajectory(thisPOS, newPOS, power) {
  const xMovement = (thisPOS[0] - newPOS[0]) ** 2
  const yMovement = (parseInt(thisPOS[1], 10) - parseInt(newPOS[1], 10)) ** 2
  const movementDistance = Math.round(Math.sqrt(xMovement + yMovement), 0)

  let arraySize = Math.round(thisPOS[1] - newPOS[1])

  if (movementDistance >= power) {
    power = parseInt(power, 10) + parseInt(movementDistance, 10)
  }
  const height = Math.sqrt(Math.abs((movementDistance / 2) ** 2 - (power / 2) ** 2))

  if (arraySize < 1) arraySize = 1

  const yPlaces = Array(...Array(Math.abs(arraySize))).map((x, i) => i)

  const trajectory = [
    [thisPOS[0], thisPOS[1], 0]
  ]

  const changeInX = (newPOS[0] - thisPOS[0]) / Math.abs(thisPOS[1] - newPOS[1])
  const changeInY = (thisPOS[1] - newPOS[1]) / (newPOS[1] - thisPOS[1])
  const changeInH = height / (yPlaces.length / 2)
  let elevation = 1

  yPlaces.forEach(() => {
    const lastX = trajectory[trajectory.length - 1][0]
    const lastY = trajectory[trajectory.length - 1][1]
    const lastH = trajectory[trajectory.length - 1][2]
    const xPos = round(lastX + changeInX, 5)
    let yPos = 0
    if (newPOS[1] > thisPOS[1]) yPos = parseInt(lastY, 10) - parseInt(changeInY, 10)
    else yPos = parseInt(lastY, 10) + parseInt(changeInY, 10)
    let hPos
    if (elevation === 1) {
      hPos = round(lastH + changeInH, 5)
      if (hPos >= height) {
        elevation = 0
        hPos = height
      }
    } else hPos = round(lastH - changeInH, 5)
    trajectory.push([xPos, yPos, hPos])
  })
  return trajectory
}

/**
 * Calculates the power based on the given strength.
 * @function
 * @param {number} strength - The strength value used to calculate the power.
 * @returns {number} The calculated power.
 */
function calculatePower(strength) {
  let hit = getRandomNumber(1, 5)
  return parseInt(strength, 10) * hit
}

/**
 * Calculates the result of multiplying `a` by the quotient of `b` divided by the sum of numbers from 1 to `c`.
 * @function
 * @param {number} a - The first number to multiply.
 * @param {number} b - The second number to divide.
 * @param {number} c - The number up to which the sum is calculated.
 * @returns {number} The result of the calculation.
 */
function aTimesbDividedByC(a, b, c) {
  return (a * (b / sumFrom1toX(c)))
}

/**
 * Calculates the sum of numbers from 1 to the given number.
 * @function
 * @param {number} x - The number up to which the sum needs to be calculated.
 * @returns {number} The sum of numbers from 1 to the given number.
 */
function sumFrom1toX(x) {
  return (x * (x + 1)) / 2
}

/**
 * Reads a file from the specified file path and returns a promise that resolves with the file data.
 * @function
 * @param {string} filePath - The path of the file to read.
 * @returns {Promise<any>} A promise that resolves with the file data.
 * @throws {Error} If there is an error reading the file.
 */
function readFile(filePath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err) {
        reject(err)
      } else {
        data = JSON.parse(data)
        resolve(data)
      }
    })
  })
}

/**
 * Checks if the given item is in the top penalty box of the match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Array} item - The coordinates of the item to check.
 * @returns {boolean} Returns true if the item is in the top penalty box, otherwise false.
 */
function inTopPenalty(matchDetails, item) {
  const [matchWidth, matchHeight] = matchDetails.pitchSize
  let ballInPenalyBoxX = isBetween(item[0], (matchWidth / 4) + 5, matchWidth - (matchWidth / 4) - 5)
  let ballInTopPenalyBoxY = isBetween(item[1], -1, (matchHeight / 6) + 7)
  if (ballInPenalyBoxX && ballInTopPenalyBoxY) return true
  return false
}

/**
 * Checks if the given item is in the bottom penalty box of the match.
 * @function
 * @param {Array} matchDetails - The details of the match, including the pitch size.
 * @param {Array} item - The coordinates of the item to check.
 * @returns {boolean} Returns true if the item is in the bottom penalty box, otherwise false.
 */
function inBottomPenalty(matchDetails, item) {
  const [matchWidth, matchHeight] = matchDetails.pitchSize
  let ballInPenalyBoxX = isBetween(item[0], (matchWidth / 4) + 5, matchWidth - (matchWidth / 4) - 5)
  let ballInBottomPenalyBoxY = isBetween(item[1], matchHeight - (matchHeight / 6) - 7, matchHeight + 1)
  if (ballInPenalyBoxX && ballInBottomPenalyBoxY) return true
  return false
}

/**
 * Generates a random position within the top penalty area of a football pitch.
 * @function
 * @param {Object} matchDetails - The details of the match, including the pitch size.
 * @returns {Array} An array containing the randomly generated X and Y coordinates.
 */
function getRandomTopPenaltyPosition(matchDetails) {
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize
  let boundaryX = [(pitchWidth / 4) + 6, (pitchWidth - (pitchWidth / 4) - 6)]
  let boundaryY = [0, (pitchHeight / 6) + 6]
  return [getRandomNumber(boundaryX[0], boundaryX[1]), getRandomNumber(boundaryY[0], boundaryY[1])]
}

/**
 * Generates a random position within the bottom penalty area of a football pitch.
 * @function
 * @param {Object} matchDetails - The details of the match, including the pitch size.
 * @returns {Array} An array containing the randomly generated X and Y coordinates.
 */
function getRandomBottomPenaltyPosition(matchDetails) {
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize
  let boundaryX = [(pitchWidth / 4) + 6, (pitchWidth - (pitchWidth / 4) - 6)]
  let boundaryY = [pitchHeight - (pitchHeight / 6) + 6, pitchHeight]
  return [getRandomNumber(boundaryX[0], boundaryX[1]), getRandomNumber(boundaryY[0], boundaryY[1])]
}

/**
 * Removes the ball from all players in the match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 */
function removeBallFromAllPlayers(matchDetails) {
  for (let player of matchDetails.kickOffTeam.players) {
    player.hasBall = false
  }
  for (let player of matchDetails.secondTeam.players) {
    player.hasBall = false
  }
}

//---------------
//Injury Functions
//---------------
/**
 * Checks if a player is injured.
 * @function
 * @param {number} x - The player's number.
 * @returns {boolean} Returns true if the player is injured, false otherwise.
 */
function isInjured(x) {
  if (x == 23) return true
  return getRandomNumber(0, x) == 23
}

/**
 * Simulates a player getting injured during a match.
 * @function
 * @param {Object} matchDetails - The details of the match.
 * @param {Object} team - The team object containing the players.
 */
function matchInjury(matchDetails, team) {
  const player = team.players[getRandomNumber(0, 10)]

  if (isInjured(40000)) {
    player.injured = true
    matchDetails.iterationLog.push(`Player Injured - ${player.name}`)
  }
}

/**
 * Checks if a number is even.
 * @function
 * @param {number} n - The number to check.
 * @returns {boolean} Returns `true` if the number is even, `false` otherwise.
 */
function isEven(n) {
  return n % 2 == 0
}

/**
 * Checks if a number is odd.
 * @function
 * @param {number} n - The number to check.
 * @returns {boolean} Returns `true` if the number is odd, `false` otherwise.
 */
function isOdd(n) {
  return Math.abs(n % 2) == 1
}


/**
 * @module `common` - This module contains common utility functions for mathematical calculations, ball trajectory, power calculation, file reading, and match-related operations.
 * 
 * @function `getRandomNumber` - Generates a random number within a specified range.
 * @function `round` - Rounds a number to the nearest integer.
 * @function `isInjured` - Checks if a player is injured.
 * @function `matchInjury` - Matches a player's injury status.
 * @function `getBallTrajectory` - Calculates the trajectory of the ball.
 * @function `isBetween` - Checks if a number is between two other numbers.
 * @function `calculatePower` - Calculates the power of a player's shot.
 * @function `isEven` - Checks if a number is even.
 * @function `isOdd` - Checks if a number is odd.
 * @function `sumFrom1toX` - Calculates the sum of numbers from 1 to a given number.
 * @function `aTimesbDividedByC` - Calculates the result of (a * b) / c.
 * @function `readFile` - Reads a file and returns its contents.
 * @function `upToMax` - Checks if a number is up to the maximum value.
 * @function `upToMin` - Checks if a number is up to the minimum value.
 * @function `inTopPenalty` - Checks if a player is in the top penalty area.
 * @function `inBottomPenalty` - Checks if a player is in the bottom penalty area.
 * @function `getRandomTopPenaltyPosition` - Generates a random position in the top penalty area.
 * @function `getRandomBottomPenaltyPosition` - Generates a random position in the bottom penalty area.
 * @function `removeBallFromAllPlayers` - Removes the ball from all players.
 */
export const common = {
  getRandomNumber,
  round,
  isInjured,
  matchInjury,
  getBallTrajectory,
  isBetween,
  calculatePower,
  isEven,
  isOdd,
  sumFrom1toX,
  aTimesbDividedByC,
  readFile,
  upToMax,
  upToMin,
  inTopPenalty,
  inBottomPenalty,
  getRandomTopPenaltyPosition,
  getRandomBottomPenaltyPosition,
  removeBallFromAllPlayers
}
