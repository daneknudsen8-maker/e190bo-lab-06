const list = document.querySelector("#ideas"); // create variable that references the element with #ideas in the html

//loadIdeas() loads the page and displays everything
async function loadIdeas() { //create an async function
    list.textContent = "Loading ideas..."; // display loading state
    try {
        const response = await fetch("/ideas"); // GET request, wait for response before continuing to run this code
        if (!response.ok) {
            throw new Error("failed to load ideas, pal");
        }
        const ideas = await response.json(); // convert response into javascript
        list.replaceChildren(); // remove loading message

        // empty state
        if (ideas.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No ideas yet. Add the first one!";
            list.append(li);
        }
        for (const idea of ideas) { // basically just display all current ideas
        const li = document.createElement("li");
        li.textContent = `${idea.title} (${idea.vote_count} votes)`;

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
            list.replaceChildren();
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
    } catch (err) {
        list.textContent = "Could not load ideas.";
        const button = document.createElement("button");
        button.textContent = "Retry";
        button.addEventListener("click", async () => {
            await loadIdeas();
    });

    list.append(button);
    }
}
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




