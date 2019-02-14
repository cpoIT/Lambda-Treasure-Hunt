Store to local storage seed {0: [coord], exits }

# INIT
this.state
  roomID = 0
  coord
  exit availability
  cooldown 1 sec = 1000ms setinterval uses ms
  errors

for each available exit add '?'

prevRoom = roomID
0        = 0

# MOVEMENT
take next available exit (random, first, last)
N

this.state
  roomID = 1

seed[prevRoom][N] = roomID (1)
seed[roomID][S] = prevRoom (0)