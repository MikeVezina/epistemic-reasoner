
function generateWorld(name) {

    let description = {
        name,
        propositions: getProps(),
        actions: getActions(),
        epistemicModel: generateModel()


    };
    return description;
}

function getAgents() {
    return ['a', 'b', 'c'];
}

function shouldAddWorld(agent, world1Props, world2Props) {
    let other_agent_props = Object.values(world1Props).filter(prop => !prop.startsWith(agent));
    return other_agent_props.every(other_agent_prop => (world1Props.indexOf(other_agent_prop) !== -1) === (world2Props.indexOf(other_agent_prop) !== -1));
}

function generateModel() {
    let modelObj = {
        worlds: [],
        edges: []
    };

    const create_combinations = (inputArr) => {

        let result = [];

        for (let i = 0; i < inputArr.length; i++) {
            for (let j = 0; j < inputArr.length; j++) {
                for (let k = 0; k < inputArr.length; k++) {
                    result.push([inputArr[i], inputArr[j], inputArr[k]]);
                }
            }
        }

        return result;

    };
    let combinations = create_combinations(['AA', 'AE', 'EE']);

    // These are all the invalid permutations (there are a maximum of four Aces and four Eights)
    let invalid_permutations = [
        ['AA', 'AA', 'AA'],
        ['AE', 'AA', 'AA'],
        ['AA', 'AE', 'AA'],
        ['AA', 'AA', 'AE'],

        ['EE', 'EE', 'EE'],
        ['AE', 'EE', 'EE'],
        ['EE', 'AE', 'EE'],
        ['EE', 'EE', 'AE'],
    ];

    combinations = combinations.filter((f) => !invalid_permutations.some(r => JSON.stringify(r) === JSON.stringify(f)));

    for (let combination of combinations) {
        let name = getWorldName(combination);
        let props = getCombinationProps(combination);
        modelObj.worlds.push({name, props});
    }

    let agents = getAgents();
    for(let agent in agents) {

        agent = parseInt(agent);
        let agentName = agents[agent];
        let agentNum = agent + 1;

        for (let world1Com of combinations) {
            for (let world2Com of combinations) {
                let world1Props = getCombinationProps(world1Com);
                let world2Props = getCombinationProps(world2Com);

                let worldOne = getWorldName(world1Com);
                let worldTwo = getWorldName(world2Com);

                if (shouldAddWorld(agentNum, world1Props, world2Props))
                    modelObj.edges.push({agentName, worldOne, worldTwo});
            }
        }
    }

    let selected = Math.floor(Math.random() * combinations.length);
    let selected_cards = combinations[selected];

    this.agent1 = selected_cards[0];
    this.agent2 = selected_cards[1];
    this.agent3 = selected_cards[2];

    modelObj.pointedWorld = 'w1' + this.agent1 + '_2' + this.agent2 + '_3' + this.agent3;

    return modelObj;
}

function getCombinationProps(combination)
{
    return ['1' + combination[0], '2' + combination[1], '3' + combination[2]];
}

function getWorldName(props)
{
    return 'w1' + props[0] + '_2' + props[1] + '_3' + props[2];
}

function getProps() {
    return [
        "1AA",
        "1AE",
        "1EE",
        "2AA",
        "2AE",
        "2EE",
        "3AA",
        "3AE",
        "3EE"
    ];
}


function getActions() {
    return [
        {
            "description": "Alice does not know",
            "formula": "(not((K a 1AA) or (K a 1AE) or (K a 1EE)))"
        },
        {
            "description": "Alice knows",
            "formula": "((K a 1AA) or (K a 1AE) or (K a 1EE))"
        },
        {
            "description": "Bob does not know",
            "formula": "(not((K b 2AA) or (K b 2AE) or (K b 2EE)))"
        },
        {
            "description": "Bob knows",
            "formula": "((K b 2AA) or (K b 2AE) or (K b 2EE))"
        },
        {
            "description": "Carl does not know",
            "formula": "(not((K c 3AA) or (K c 3AE) or (K c 3EE)))"
        },
        {
            "description": "Carl knows",
            "formula": "((K c 3AA) or (K c 3AE) or (K c 3EE))"
        }
    ];
}


console.log(JSON.stringify(generateWorld("Aces and Eights"), null, '\t'));
