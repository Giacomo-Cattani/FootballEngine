# Function Documentation

## Function initiateGame()

### Description

This function has the jobs to initialize a match, so you need to pass the two teams details and the pitch

### Parameters

- `team1`: Description of the first parameter.
- `team2`: Description of the second parameter.
- `pitchDetails`: Description of the second parameter.

### Return Value

This function return a JSON of the details of the match likes:

- `matchID`,
- `kickOffTeam`,
- `pitchSize`, ...

### Example Usage

```
let initJSON = await initGame(t1location, t2location, plocation)
```
