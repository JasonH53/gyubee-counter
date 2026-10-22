import './style.css'

const COLORS = ['#e4572e', '#29a3a3', '#f3a712', '#6c5ce7', '#2e86de', '#e84393', '#20bf6b', '#a0522d']

const app = document.querySelector('#app')

// All state lives in memory, so a refresh starts over.
let players = []

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

function showSetup() {
  app.innerHTML = `
    <main class="setup">
      <h1>🍖 Plate Counter</h1>
      <p>Who's at the table?</p>
      <form id="setup-form">
        <div id="names"></div>
        <button type="button" id="add" class="secondary">+ Add person</button>
        <button type="submit" class="primary">Start eating</button>
      </form>
    </main>
  `
  const names = app.querySelector('#names')

  const addInput = (focus = true) => {
    const row = document.createElement('div')
    row.className = 'name-row'
    row.innerHTML = `
      <input type="text" placeholder="Name" maxlength="20" autocomplete="off" />
      <button type="button" class="remove" aria-label="Remove">✕</button>
    `
    row.querySelector('.remove').onclick = () => {
      if (names.children.length > 1) row.remove()
    }
    names.append(row)
    if (focus) row.querySelector('input').focus()
  }

  for (let i = 0; i < 4; i++) addInput(false)
  names.querySelector('input').focus()

  app.querySelector('#add').onclick = () => {
    if (names.children.length < COLORS.length) addInput()
  }

  app.querySelector('#setup-form').onsubmit = (e) => {
    e.preventDefault()
    const entered = [...names.querySelectorAll('input')].map((i) => i.value.trim()).filter(Boolean)
    if (entered.length === 0) return
    players = entered.map((name, i) => ({ name, plates: 0, color: COLORS[i] }))
    showTally()
  }
}

function showTally() {
  const cols = players.length <= 2 ? 1 : 2
  app.innerHTML = `
    <main class="tally" style="--cols: ${cols}">
      ${players
        .map(
          (p, i) => `
        <button class="quadrant" data-i="${i}" style="--color: ${p.color}">
          <span class="name">${escapeHtml(p.name)}</span>
          <span class="count">${p.plates}</span>
          <span class="undo" data-undo="${i}" aria-label="Remove a plate">−1</span>
        </button>`
        )
        .join('')}
      <button class="end" aria-label="End session" title="End session">🏁</button>
    </main>
  `

  // Odd player count: let the last quadrant fill the empty space.
  if (cols === 2 && players.length % 2 === 1) {
    ;[...app.querySelectorAll('.quadrant')].at(-1).style.gridColumn = 'span 2'
  }

  app.querySelectorAll('.quadrant').forEach((q) => {
    q.onclick = (e) => {
      const i = Number(q.dataset.i)
      if (e.target.dataset.undo !== undefined) {
        players[i].plates = Math.max(0, players[i].plates - 1)
      } else {
        players[i].plates++
        q.classList.remove('bump')
        void q.offsetWidth
        q.classList.add('bump')
      }
      q.querySelector('.count').textContent = players[i].plates
    }
  })

  app.querySelector('.end').onclick = () => {
    if (confirm('End the session?')) showResults()
  }
}

function showResults() {
  const ranked = [...players].sort((a, b) => b.plates - a.plates)
  const total = players.reduce((sum, p) => sum + p.plates, 0)
  const top = ranked[0].plates
  app.innerHTML = `
    <main class="results">
      <h1>Final Score</h1>
      <ol>
        ${ranked
          .map(
            (p) => `
          <li style="--color: ${p.color}">
            <span class="name">${p.plates === top && top > 0 ? '👑 ' : ''}${escapeHtml(p.name)}</span>
            <span class="count">${p.plates}</span>
          </li>`
          )
          .join('')}
      </ol>
      <p class="total">Total: <strong>${total}</strong> plate${total === 1 ? '' : 's'}</p>
      <button class="primary" id="again">New session</button>
    </main>
  `
  app.querySelector('#again').onclick = () => {
    players = []
    showSetup()
  }
}

showSetup()
