const input = document.getElementById('input');
const addBtn = document.getElementById('addBtn');

const parked = document.getElementById('parked');
const processing = document.getElementById('processing');
const done = document.getElementById('done');


function clearLists() {
    parked.innerHTML = '';
    processing.innerHTML = '';
    done.innerHTML = '';
}


// ---------- формат дати ----------

function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleString('uk-UA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}


// ---------- скільки часу лежить ----------

function timeAgo(dateString) {

    const now = new Date();
    const past = new Date(dateString);

    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return diff + " сек";

    const min = Math.floor(diff / 60);
    if (min < 60) return min + " хв";

    const hours = Math.floor(min / 60);
    if (hours < 24) return hours + " год";

    const days = Math.floor(hours / 24);
    if (days < 30) return days + " дн";

    const months = Math.floor(days / 30);
    if (months < 12) return months + " міс";

    const years = Math.floor(months / 12);
    return years + " р";
}


// ---------- створення елемента ----------

function createIdeaElement(idea) {

    const div = document.createElement('div');
    div.className = 'idea';

    div.innerHTML = `

        <div class="idea-text">
            ${idea.text}
        </div>

        <div class="idea-meta">
            ${formatDate(idea.date)}
            |
            лежить: ${timeAgo(idea.date)}
        </div>

        <div class="idea-actions">

            <button data-action="parked">P</button>

            <button data-action="processing">→</button>

            <button data-action="done">✔</button>

            <button data-action="delete">✖</button>

        </div>
    `;


    div.querySelectorAll('button').forEach(button => {

        button.addEventListener('click', async () => {

            const action = button.dataset.action;

            if (action === 'delete') {
                await removeIdea(idea.id);
                return;
            }

            await updateIdea(idea.id, action);

        });

    });

    return div;
}


// ---------- load ----------

async function loadIdeas() {

    try {

        const response = await fetch('/api/ideas', {
            cache: 'no-store'
        });

        const ideas = await response.json();

        clearLists();

        ideas.forEach(idea => {

            const el = createIdeaElement(idea);

            if (idea.status === 'parked') {
                parked.appendChild(el);
            }

            if (idea.status === 'processing') {
                processing.appendChild(el);
            }

            if (idea.status === 'done') {
                done.appendChild(el);
            }

        });

    } catch (err) {

        console.log(err);

    }

}


// ---------- add ----------

async function addIdea() {

    const text = input.value.trim();

    if (!text) return;

    await fetch('/api/ideas', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            text
        })

    });

    input.value = '';

    loadIdeas();

}


// ---------- update ----------

async function updateIdea(id, status) {

    await fetch('/api/ideas/' + id, {

        method: 'PUT',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            status
        })

    });

    loadIdeas();

}


// ---------- delete ----------

async function removeIdea(id) {

    await fetch('/api/ideas/' + id, {
        method: 'DELETE'
    });

    loadIdeas();

}


// ---------- events ----------

addBtn.addEventListener('click', addIdea);


input.addEventListener('keydown', (e) => {

    if (e.ctrlKey && e.key === 'Enter') {
        addIdea();
    }

});


document.addEventListener('DOMContentLoaded', () => {

    loadIdeas();

});
