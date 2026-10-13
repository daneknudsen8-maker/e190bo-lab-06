const list = document.querySelector("#ideas"); // create variable that references the element with #ideas in the html

// Get the search and sort elements from HTML
const search = document.querySelector("#search");
const sort = document.querySelector("#sort");
const resultsCount = document.querySelector("#results-count");

// Store ideas so we can search and sort without additional GET requests
let allIdeas = [];

//loadIdeas() loads the page and displays everything
async function loadIdeas() { //create an async function
    list.textContent = "Loading ideas..."; // display loading state

    try {
        const response = await fetch("/ideas"); // GET request, wait for response before continuing to run this code

        if (!response.ok) {
            throw new Error("failed to load ideas, pal");
        }

        allIdeas = await response.json(); // convert response into javascript
        displayIdeas();

    } catch (err) {
        list.replaceChildren();
        resultsCount.textContent = "";
        const li = document.createElement("li");
        li.textContent = "Could not load ideas.";

        const button = document.createElement("button");
        button.textContent = "Retry";

        button.addEventListener("click", async () => {
            await loadIdeas();
        });

        li.append(button);
        list.append(li);
    }
}

// Display ideas based on search and sort selections
function displayIdeas() {
    const query = search.value.toLowerCase();

    // Filter ideas by title or description
    const filteredIdeas = allIdeas.filter((idea) => {
        return idea.title.toLowerCase().includes(query) ||
               (idea.body || "").toLowerCase().includes(query);
    });

    // Sort ideas based on dropdown selection
    if (sort.value === "votes") {
        filteredIdeas.sort((a, b) => b.vote_count - a.vote_count);
    } else if (sort.value === "newest") {
        filteredIdeas.sort((a, b) => b.id - a.id);
    } else if (sort.value === "alphabetical") {
        filteredIdeas.sort((a, b) => a.title.localeCompare(b.title));
    }

    list.replaceChildren(); // remove loading message

    resultsCount.textContent = `${filteredIdeas.length} ideas shown`;

    // empty state
    if (allIdeas.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No ideas yet. Add the first one!";
        list.append(li);
        return;
    }

    // Show message when search finds no matches
    if (filteredIdeas.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No ideas match your search.";
        list.append(li);
        return;
    }

        // Find the highest-voted idea from ALL ideas, not just search results
    let topIdea = null;

    for (const idea of allIdeas) {
        if (idea.vote_count > 0) {
            if (topIdea === null ||
                idea.vote_count > topIdea.vote_count ||
                (idea.vote_count === topIdea.vote_count && idea.id < topIdea.id)) {
                topIdea = idea;
            }
        }
    }

    for (const idea of filteredIdeas) { // basically just display all current ideas
        const li = document.createElement("li");
        li.textContent = `${idea.title} (${idea.vote_count} votes)`;

        // Highlight the top idea
        if (topIdea !== null && idea.id === topIdea.id) {
            li.classList.add("top-idea");
            li.textContent = `⭐ Top Idea: ${idea.title} (${idea.vote_count} votes)`;
        }

        // create vote button
        const button = document.createElement("button");
        button.textContent = "Vote";

        // listen for clicks on button
        button.addEventListener("click", async () => {
            const voter = document.querySelector("#voter").value;
            const voteStatus = document.querySelector("#vote-status");

            if (voter) {
                button.disabled = true; // button is disabled if it is pressed
                button.textContent = "Voting...";
                voteStatus.textContent = "";

                try {
                    // send POST request to record vote
                    const response = await fetch(`/ideas/${idea.id}/vote`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ voter: voter })
                    });

                    if (!response.ok) {
                        throw new Error("Failed to record vote");
                    }

                    // reload the list
                    await loadIdeas();

                } catch (err) {
                    button.disabled = false;
                    button.textContent = "Vote";
                    voteStatus.textContent = "Could not record vote. Please try again.";
                }

            } else {
                voteStatus.textContent = "Please enter your name before voting.";
            }
        });

        li.append(button); // Add vote button to list item
        list.append(li); // Display list item on webpage
    }
}

// Search immediately when the user types
search.addEventListener("input", () => {
    displayIdeas();
});

// Reorder ideas when the user changes the dropdown
sort.addEventListener("change", () => {
    displayIdeas();
});

loadIdeas();

const form = document.querySelector("#idea-form"); // find idea form from html

// supporting adding a new idea to the DB when someone submits the html form
form.addEventListener("submit", async (event) => { // react to form
    event.preventDefault(); // stop normal submission behavior

    const title = document.querySelector("#title").value; // read input and put it in variable 'title'
    const status = document.querySelector("#add-status");

    status.textContent = "Adding idea...";

    try {
        const response = await fetch("/ideas", { // send POST request to the backend
            method: "POST", // HTTP method
            headers: { "Content-Type": "application/json" }, // denoting that data submitted is in JSON
            body: JSON.stringify({ title: title }) // the actual text getting put into the db
        });

        if (!response.ok) {
            throw new Error("Failed to add idea");
        }

        document.querySelector("#title").value = ""; // clear the input box
        status.textContent = "Idea added successfully!";
        list.replaceChildren(); // clear everything first because we are about to reload
        await loadIdeas(); // display new list of all ideas

    } catch (err) {
        status.textContent = "Could not add idea. Please try again.";
    }
});