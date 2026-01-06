function loadData() {
    return fetch('travel_recommendation_api.json')
    .then(response => {
        if (!response.ok) {
            throw(new Error(`HTTP Error: ${response.status}`));
        }
        return response.json();
    })
    .catch(error => console.log('Error loading JSON: ', error));
}


function normalizeWord(word) {
    let normalized = word.toLowerCase().trim();
    // Remove trailing 's' or 'es' for comparison
    if (normalized.endsWith('ies')) {
        normalized = normalized.slice(0, -3) + 'y';
    } else if (normalized.endsWith('es')) {
        normalized = normalized.slice(0, -2);
    } else if (normalized.endsWith('s')) {
        normalized = normalized.slice(0, -1);
    }
    return normalized;
}

function cleanSearchInput() {
    const el = document.getElementById("search");
    el.value = "";
}

function isNested(obj) {
    const keys = Object.keys(obj);
    return keys.some(x => typeof(obj[x]) == 'object');
}


function validateObj(obj) {
    const fields = ["name", "imageUrl", "description"];
    keys = Object.keys(obj);

    for (f of fields) {
        if (!keys.includes(f)) {
            return false
        }
    }
    return true
}

function findLastNode(obj) {
    const keys = Object.keys(obj);

    for (_key of keys) {
        if (isNested(obj[_key])) {
            return findLastNode(obj[_key])
        }
    }
    return obj
}


function getObjDesc(obj) {
    if (!isNested(obj) && validateObj(obj)) {
        return obj
    }
    return findLastNode(obj).map(getObjDesc)
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function selectResultsSlice(data, nRecords = 2) {
    dataSize = data.length
    let res = []
    let k = 0
    // Handle empty array
    if (!data || data.length === 0) {
        return [];
    }
    // Ensure nRecords doesn't exceed array length
    nRecords = Math.min(nRecords, dataSize);
    
    for (let i = 0; i < nRecords; i++) {
        x = getRandomInt(0, dataSize - 1)
        if (x !== k) {
            k = x;
            res.push(data[x]);
        } else {
            i--;
        }
    }
    return res
}


function search(data, keyword) {
    const normalizedSearch = normalizeWord(keyword);
    const keys = Object.keys(data);
    
    const matchingKey = keys.find(key => {
        const normalizedKey = normalizeWord(key);
        return normalizedKey === normalizedSearch || 
               normalizedKey.startsWith(normalizedSearch) ||
               normalizedSearch.startsWith(normalizedKey);
    });
    
    if (matchingKey) {
        const result = data[matchingKey];
        const output = selectResultsSlice(result.map(getObjDesc).flat(), 2); // select a slice of 2 items
        displaySearchResults(output);
    } else {
        alert('Unfortunately there is no information on this request');
    }
    cleanSearchInput();
}


function displaySearchResults(data) {
    clearSearchResults(); // Clear previous results
    const searchResults = document.getElementById('search-results');
    
    for (const obj of data) {
        const resultItem = document.createElement('div');
        resultItem.classList.add('search-result-item');
        resultItem.innerHTML = `
            <h3>${obj.name}</h3>
            <img src="${obj.imageUrl}" alt="${obj.name}">
            <p>${obj.description}</p>
            <button>Visit</button>
        `;
        searchResults.appendChild(resultItem);
    }
}

function clearSearchResults() {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';
}


document.addEventListener('DOMContentLoaded', async() => {
    data = await loadData();
})

document.getElementById('searchBtn').addEventListener('click', async() => search(
    data,
    document.getElementById('search').value
))

document.getElementById('resetBtn').addEventListener('click', async() => clearSearchResults())