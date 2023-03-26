# Epistemic Reasoning as a Service
Deployed at (there is no front-end): https://epistemic-reasoner.herokuapp.com/

## Epistemic Reasoner API (Express/Node.js Server)
This is a fork of [hintikkasworld](https://gitlab.inria.fr/fschwarz/hintikkasworld) that has been stripped of anything other than the explicit models and barebones reasoner, and exposes the functionality via a REST API. This server provides a simple API for creating, updating, and reasoning about Explicit Epistemic models. 

## Epistemic Agents
The agents using this reasoner can be found at: https://github.com/MikeVezina/epistemic-agents

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

### 3. Starting the application
```
npm start
```