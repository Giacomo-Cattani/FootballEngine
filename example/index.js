//example implementation application
import { engine } from '../engine.js'
import fs from 'fs'

let nextIteration
gameOfTenIterations().then(function () {
}).catch(function (error) {
  throw new Error(error)
})

async function gameOfTenIterations() {
  try {
    let t1location = './team1.json'
    let t2location = './team2.json'
    let plocation = './pitch.json'
    let initJSON = await initGame(t1location, t2location, plocation)
    nextIteration = await playIteration(initJSON)
    nextIteration = await playIteration(nextIteration)
    nextIteration = await playIteration(nextIteration)
    nextIteration = await playIteration(nextIteration)
    nextIteration = await playIteration(nextIteration)
    let halftimeIteration = await setupSecondHalf(nextIteration)
    nextIteration = await playIteration(halftimeIteration)
    nextIteration = await playIteration(nextIteration)
    nextIteration = await playIteration(nextIteration)
    nextIteration = await playIteration(nextIteration)
    nextIteration = await playIteration(nextIteration)
    await writeFile(nextIteration)
    return nextIteration
  } catch (error) {
    throw new Error(error)
  }
}

async function initGame(t1, t2, p) {
  try {
    let team1 = await readFile(t1)
    let team2 = await readFile(t2)
    let pitch = await readFile(p)
    let matchSetup = engine.initiateGame(team1, team2, pitch)
    return matchSetup
  } catch (error) {
    throw new Error(error)
  }
}

async function playIteration(inputIteration) {
  try {
    let outputIteration = await engine.playIteration(inputIteration)
    return outputIteration
  } catch (error) {
    throw new Error(error)
  }
}

async function setupSecondHalf(inputIteration) {
  try {
    let outputJSON = await engine.startSecondHalf(inputIteration)
    return outputJSON
  } catch (error) {
    throw new Error(error)
  }
}

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

async function writeFile(data) {
  return new Promise(function (resolve, reject) {
    fs.writeFile("matchDetails.json", JSON.stringify(data), 'utf8', function (err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
