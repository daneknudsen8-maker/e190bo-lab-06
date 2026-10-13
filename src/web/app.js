const list = document.querySelector("#ideas"); // create variable that references the element with #ideas in the html
async function loadIdeas() { //create an async function
 const response = await fetch("/ideas"); // GET request, wait for response before continuing to run this code
 const ideas = await response.json(); // convert response into javascript
 for (const idea of ideas) { // basically just display all current ideas
 const li = document.createElement("li");
 li.textContent = `${idea.title} (${idea.vote_count} votes)`;

 // create vote button
 const button = document.createElement("button");
 button.textContent = "Vote";

 // listen for clicks on button
 button.addEventListener("click", async () => {
    const voter = document.querySelector("#voter").value;

    if (voter ){
        button.disabled = true; // button is disabled if it is pressed
        // send POST request to record vote
        const response = await fetch(`/ideas/${idea.id}/votes`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ voter: voter })
                });

                if (response.ok) {
                    list.replaceChildren();
                    await loadIdeas();
                } else {
                    button.disabled = false;
                }
            }
        });

        li.append(button); // Add vote button to list item
        list.append(li); // Display list item on webpage
    }
}

loadIdeas();

const form = document.querySelector("#idea-form"); // find idea form from html


// supporting adding a new idea to the DB when someone submits the html form
form.addEventListener("submit", async (event) => { // react to form
    event.preventDefault(); // stop normal submission behavior

    const title = document.querySelector("#title").value; // read input and put it in variable 'title'
    const response = await fetch("/ideas", { // send POST request to the backend
        method: "POST", // HTTP method
        headers: { "Content-Type": "application/json" }, // denoting that data submitted is in JSON
        body: JSON.stringify({ title: title }) // the actual text getting put into the db
    });

    if (response.ok) {
        document.querySelector("#title").value = ""; // clear the input box
        list.replaceChildren(); // clear everything first because we are about to reload
        await loadIdeas(); // display new list of all ideas
    }

});




