const request = fetch("http://localhost:3000/api/generate-function", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        nameLanguage: "JavaScript"
    })
});

request.then((response) => {
    const json = response.json();
    return json;
}).then((json) => {
    console.log(json.message);
});