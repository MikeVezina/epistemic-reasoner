# Epistemic Reasoning as a Service

## Epistemic Reasoner API (Node.js)
This is a fork of [hintikkasworld](https://gitlab.inria.fr/fschwarz/hintikkasworld) that provides a simple API for 
creating, updating, and reasoning about Explicit Epistemic models.

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

### 3. Running the tests
```
npm test
```

### 4. Starting the application
```
npm start
```

# API Endpoints
All API endpoints are currently defined in `src/app/ApiRouter.ts`. 
Only the main endpoints will be listed below, please look at ApiRouter.ts for all possible endpoints.

## Creating the Model (POST /api/model)
Creates an initial explicit epistemic model. The only field required is epistemicModel.Worlds. 
The reasoner will create all necessary edges, propositions, and will choose a random pointed world 
(unless any of these fields are specified in the request).
 
### *Request*
The following is the format of the input:

```
{
    name: String?,

    propositions: String[]?,

    epistemicModel : {
      worlds: World[],
      edges: Edge[]?,
      pointedWorld: String?
    },

    actions: Action[]?
}
```
Where:
```
World := {
    name: String,
    props: String[]
}

Edge := {
    agentName: String,
    worldOne: String,
    worldTwo: String
}

Action := {
    description: String,
    formula: String
}
```

### *Response*
There is no response content for this endpoint.
200 OK => Model Created. 

## Evaluate Formula (GET /api/evaluate)
Evaluates a given formula and returns the evaluated result.
### *Request*
The request input is provided as a query parameter: `formula`.
To evaluate the formula `(k a (k a m_1))`, the request looks as follows:
`http://host:port/api/evaluate?formula=(k a (k a m_1))`. You may need to URI encode
the formula before passing it as the query parameter value. 

### *Response*
The endpoint will return the result of the formula 
(true if the formula evaluated to true in the current pointed world, false otherwise).
The following is the format of the response content:
```
{
    result: boolean 
}
```

## Updating Agent Propositions (PUT /api/props)
This endpoint is used by the epistemic agents (linked above). 
They call this endpoint with their current beliefs (translated to their corresponding propositions).
This endpoint obtains the initial model and utilizes the request props to 
update the model edges and pointed world to properly denote which world the agent may currently be in.
   
### *Request*
The input accepts a JSON object containing a mapping of proposition truth values, or an array of true propositions. 
The following are example inputs that are equivalent to each other:
```
{
    "m_1": true,
    "m_2": true
}
```

```["m_1", "m_2"]```

### *Response*
The response contains a success boolean, and a result array.
Result contains an array of propositions that can now be inferred after the proposition update. 
This array does not contain the props explicitly passed in the request object.
The following is the response content:
```
{
    success: boolean,
    result: [props]
}
```
