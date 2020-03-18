# Epistemic Reasoner API (Node.js)
[![Build Status](https://travis-ci.com/MikeVezina/epistemic-reasoner.svg?token=5XuGRvxnd7EFyJcxyBNe&branch=master)](https://travis-ci.com/MikeVezina/epistemic-reasoner)

### Borrowed reasoner code from Hintikkasworld
The Original repository is located [here](https://gitlab.inria.fr/fschwarz/hintikkasworld). Our reasoner currently only supports explicit epistemic models.

# Getting Started
## Prerequisites
Node Version: 13 (Current, found here: https://nodejs.org/en/download/current/)

## Setting up the application
### 1. Clone the repository
```
git clone https://github.com/MikeVezina/epistemic-reasoner.git
cd epistemic-reasoner
```

### 2. Install dependencies
```
npm install
```

### 3. Running the tests
```
npm test
```

### 4. Starting the application
```
npm start
```

# API Endpoints
### POST /api/createWorld
Creates a description/world. All subsequent API requests act on this world.

### GET /api/actions
Gets the current executable actions for all agents.

### POST /api/modelCheck
Checks if a formula is valid in the current model. (i.e. does alice know her cards?)

### POST /api/performAction
Performs an executable action on the current model. 
