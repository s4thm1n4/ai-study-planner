// Get references to our HTML elements
const goalInput = document.getElementById('goal-input');
const generateBtn = document.getElementById('generate-btn');
const resultsDiv = document.getElementById('results');

// Add an event listener to the button
generateBtn.addEventListener('click', async () => {
    const goal = goalInput.value;

    // Check if the input is empty
    if (!goal) {
        alert("Please enter a study goal.");
        return;
    }

    // Show a loading message
    resultsDiv.innerHTML = "🧠 Generating your plan, please wait...";

    try {
        // This is the API call to your Python backend
        const response = await fetch('http://127.0.0.1:8000/api/generate-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ goal: goal }),
        });

        // Get the JSON data from the response
        const data = await response.json();

        // Format the output into nice HTML
        let outputHTML = `
            <h2>Your 3-Day Plan:</h2>
            <ul>
                ${data.schedule.map(topic => `<li>${topic}</li>`).join('')}
            </ul>
            <h3>First Resource:</h3>
            <p>
                <strong>Topic:</strong> ${data.first_resource.topic}<br>
                <strong>Link:</strong> <a href="${data.first_resource.link}" target="_blank">${data.first_resource.link}</a>
            </p>
        `;

        // Display the results on the page
        resultsDiv.innerHTML = outputHTML;

    } catch (error) {
        console.error("Error fetching plan:", error);
        resultsDiv.innerHTML = "An error occurred. Please check the console and make sure your backend server is running.";
    }
});