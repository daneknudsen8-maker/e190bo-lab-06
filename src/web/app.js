const list = document.querySelector("#ideas"); // create variable that references the element with #ideas in the html
async function loadIdeas() { //create an async function
 const response = await fetch("/ideas"); // GET request, wait for response before continuing to run this code
 const ideas = await response.json(); // convert response into javascript
 for (const idea of ideas) { // basically just display all current ideas
 const li = document.createElement("li");
 li.textContent = `${idea.title} (${idea.vote_count} votes)`;
 list.append(li);
 }
}
loadIdeas();

const form = document.querySelector("#idea-form");

form.addEventListener("submit", async (event) => {
    event.preventDefault();
});
