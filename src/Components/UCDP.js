import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import './UCDPModern.css';

const UCDP = () => {

    // State to store the number of generators selected by the user
    const [numGenerators, setNumGenerators] = useState(0);

    // State to store the list of generator objects with their parameters (min, max, a, b, d)
    const [generators, setGenerators] = useState([]);

    // State to store the required system load (input by the user)
    const [load, setLoad] = useState('');

    // State to store the result of the DP calculation (generation plan)
    const [result, setResult] = useState([]);

    // State to store the total minimum generation cost calculated by DP
    const [totalCost, setTotalCost] = useState(null);

    // State to store error messages for validations or DP calculation issues
    const [error, setError] = useState('');



    // Handles the selection of the number of generators
    const handleGeneratorCount = (e) => {
        const n = parseInt(e.target.value); // Convert selected value to integer
        setNumGenerators(n); // Update the number of generators in state

        // Initialize the generators array with default values for each field as strings
        setGenerators(Array(n).fill().map(() => ({
            min: '0',   // Minimum power generation (as string for input compatibility)
            max: '0',   // Maximum power generation
            a: '0',     // Coefficient for p^2 in cost function
            b: '0',     // Coefficient for p in cost function
            d: '0'      // Constant term in cost function
        })));

        setResult([]);        // Clear any previous result
        setTotalCost(null);   // Reset total cost display
        setError('');         // Clear any previous error messages
    };

    // Handles changes in individual input fields for each generator
    const handleGenChange = (i, field, value) => {
        const updated = [...generators];    // Create a copy of current generator data
        updated[i][field] = value;          // Update the specific field with the new value
        setGenerators(updated);             // Update the generator state with the modified data
    };

    const costFn = (a, b, d, p) => {
        if (p === 0) return 0;
        return 0.5 * a * p * p + b * p + d;
    };

    const solveDP = () => {
        setError('');
        if (!load || isNaN(Number(load))) {
            setError('Please enter a valid load value.');
            return;
        }
        const L = parseInt(load);
        if (L <= 0) {
            setError('Load must be greater than 0.');
            return;
        }

        // Validate and convert generator inputs to numbers
        const validGenerators = generators.map((g, index) => {

            // Convert input strings to floating-point numbers
            const min = parseFloat(g.min);
            const max = parseFloat(g.max);
            const a = parseFloat(g.a);
            const b = parseFloat(g.b);
            const d = parseFloat(g.d);

            // Check if any of the inputs are not valid numbers
            if (isNaN(min) || isNaN(max) || isNaN(a) || isNaN(b) || isNaN(d)) {
                // Set an error message to inform the user about invalid input for this generator
                setError(`Please enter valid numbers for generator ${index + 1}.`);

                // Stop further execution by throwing an error
                throw new Error('Invalid input');
            }

            // If all inputs are valid, return the cleaned generator object
            return { min, max, a, b, d };
        });

        // Check if there are any valid generators; if not, exit the function
        if (validGenerators.length === 0) return;
        // Calculate the total maximum generation capacity by summing up max values of all generators
        const totalMax = validGenerators.reduce((sum, g) => sum + g.max, 0);
        // Calculate the total minimum generation requirement by summing up min values of all generators
        const totalMin = validGenerators.reduce((sum, g) => sum + g.min, 0);
        // Validation: If the required load (L) is greater than the total maximum capacity
        if (L > totalMax) {
            // Set an error message indicating the load is too high to be met
            setError('Load is higher than total maximum generation capacity.');
            return; // Stop further execution
        }
        // Validation: If the required load (L) is less than the total minimum generation requirement
        if (L < totalMin) {
            // Set an error message indicating the load is too low to be dispatched
            setError('Load is less than total minimum generation requirement.');
            return; // Stop further execution
        }


        // Number of generators (rows in the DP table)
        const rows = validGenerators.length;

        // Initialize the DP table:
        // dp[i][j] will store the minimum cost to generate 'j' MW using the first (i + 1) generators
        const dp = Array.from({ length: rows }, () =>
            Array(L + 1).fill(Number.MAX_SAFE_INTEGER) // Initialize with a large value (infinity concept)
        );

        // Initialize the path table:
        // path[i][j] will store the generation output of the i-th generator that contributes to generating 'j' MW
        const path = Array.from({ length: rows }, () =>
            Array(L + 1).fill(null) // Initialize with null to later store the chosen power output
        );

        // Fill the first generator's DP row (base case)
        for (let p = validGenerators[0].min; p <= Math.min(validGenerators[0].max, L); p++) {
            // Calculate the cost for producing 'p' MW using the first generator
            const cost = costFn(validGenerators[0].a, validGenerators[0].b, validGenerators[0].d, p);
            // Store the cost in the DP table
            dp[0][p] = cost;
            // Store the power output in the path table to trace back later
            path[0][p] = p;
        }


// Iterate over each generator starting from the second one (index 1)
// 'rows' is the total number of generators
for (let i = 1; i < rows; i++) {
    // Iterate over all possible load values from 0 to the required load 'L'
    for (let j = 0; j <= L; j++) {
        // Iterate over all possible power outputs (p) that the current generator can produce
        // It must be within the generator's min and max limits and cannot exceed the current load 'j'
        for (let p = validGenerators[i].min; p <= Math.min(validGenerators[i].max, j); p++) {
            // Check if the subproblem with (remaining load = j - p) using previous generators has a valid cost (it has been reached)
            if (dp[i - 1][j - p] !== Number.MAX_SAFE_INTEGER) {
                // Calculate the total cost if we select 'p' MW from the current generator
                const cost = dp[i - 1][j - p] + costFn(
                    validGenerators[i].a,
                    validGenerators[i].b,
                    validGenerators[i].d,
                    p
                );
                // If this newly calculated cost is less than the current stored cost at dp[i][j], update it
                if (cost < dp[i][j]) {
                    dp[i][j] = cost;       // Update the DP table with the minimum cost
                    path[i][j] = p;        // Record the chosen power output at this step for backtracking later
                }
            }
        }
    }
}


        if (dp[rows - 1][L] === Number.MAX_SAFE_INTEGER) {
            setError('No valid generation plan found for given load.');
            return;
        }
        
// Initialize an empty array to store the final generation plan
const generationPlan = [];
// Set the remaining load to the total load 'L'
let remaining = L;
// Backtrack from the last generator to the first
for (let i = rows - 1; i >= 0; i--) {
    // Get the power output 'p' from the path table for the current generator and remaining load
    const p = path[i][remaining];
    // Add the current generator's details to the beginning of the generation plan
    generationPlan.unshift({
        generator: i + 1, // Generator index (using 1-based indexing for display)
        output: p,        // Power output by this generator
        cost: costFn(     // Calculate the generation cost using the cost function
            validGenerators[i].a,
            validGenerators[i].b,
            validGenerators[i].d,
            p
        ).toFixed(2)      // Round the cost to 2 decimal places
    });
    // Subtract the power produced by this generator from the remaining load
    remaining -= p;
}

// Update the final generation plan in React state
setResult(generationPlan);
// Update the total minimum generation cost in React state
setTotalCost(dp[rows - 1][L].toFixed(2)); // Round the total cost to 2 decimal places
    };

    return (
        <div className="ucdp-container">
            <div className="ucdp-header">UCDP (DP-Based Economic Dispatch)</div>
            <div style={{ marginBottom: 18 }}>
                <label className="ucdp-label" htmlFor="generator-select">Number of Generators</label>
                <select
                    id="generator-select"
                    className="ucdp-input"
                    onChange={handleGeneratorCount}
                    value={numGenerators || ''}
                >
                    <option disabled value="">Select Number of Generators</option>
                    {[...Array(8)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                </select>
            </div>
            {error && <div className="ucdp-error">{error}</div>}
            {numGenerators > 0 && (
                <>
                    <Table bordered className="ucdp-table">
                        <thead>
                            <tr>
                                <th>Generator</th>
                                <th>Min</th>
                                <th>Max</th>
                                <th>a</th>
                                <th>b</th>
                                <th>d</th>
                            </tr>
                        </thead>
                        <tbody>
                            {generators.map((g, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    {['min', 'max', 'a', 'b', 'd'].map(field => (
                                        <td key={field}>
                                            <input
                                                className="ucdp-input"
                                                type="number"
                                                step="any"
                                                value={g[field]}
                                                onChange={(e) => handleGenChange(i, field, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <div style={{ margin: '18px 0' }}>
                        <label className="ucdp-label" htmlFor="load-input">Required Load (MW)</label>
                        <input
                            id="load-input"
                            className="ucdp-input"
                            type="number"
                            value={load}
                            onChange={(e) => setLoad(e.target.value)}
                        />
                    </div>
                    <button
                        className="ucdp-btn"
                        onClick={solveDP}
                        disabled={generators.some(g => Object.values(g).some(val => val === '')) || load === ''}
                    >
                        Solve using DP
                    </button>
                </>
            )}
            {result.length > 0 && !error && (
                <div className="ucdp-result-card">
                    <h4>Generation Plan</h4>
                    <Table bordered className="ucdp-table">
                        <thead>
                            <tr>
                                <th>Generator</th>
                                <th>Output (MW)</th>
                                <th>Cost (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.map((r, i) => (
                                <tr key={i}>
                                    <td>{r.generator}</td>
                                    <td>{r.output}</td>
                                    <td>{r.cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <h5>Total Cost: ₹{totalCost}</h5>
                </div>
            )}
        </div>
    );
};

export default UCDP;