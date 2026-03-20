// ─────────────────────────────────────────
// 1. Connect to Supabase
// ─────────────────────────────────────────
const supabaseClient = window.supabase.createClient(
  'https://uhnybipmfdiwczkkskax.supabase.co',
  'sb_publishable_SburUvvdU0Aj-OFxcrqIWw_LkNCAQEm'
)

// ─────────────────────────────────────────
// 2. Get DOM elements
// ─────────────────────────────────────────
const nameInput    = document.getElementById('name')
const messageInput = document.getElementById('message')
const submitBtn    = document.getElementById('submit-btn')
const formError    = document.getElementById('form-error')
const messagesList = document.getElementById('messages-list')
const loading      = document.getElementById('loading')

// ─────────────────────────────────────────
// 3. Create a message card element
// ─────────────────────────────────────────
function createCard(msg) {
  const card = document.createElement('div')
  card.className = 'message-card'
  card.innerHTML = `
    <p class="message-name">${msg.name}</p>
    <p class="message-text">${msg.message}</p>
  `
  return card
}

// ─────────────────────────────────────────
// 4. Load messages from Supabase (initial load only)
// ─────────────────────────────────────────
async function loadMessages() {
  loading.classList.remove('hidden')
  messagesList.innerHTML = ''

  try {
    const { data, error } = await supabaseClient
      .from('messages')
      .select('*')
      .order('id', { ascending: false })

    if (error) throw error

    loading.classList.add('hidden')

    if (data.length === 0) {
      messagesList.innerHTML = '<p class="empty">No messages yet — be the first!</p>'
      return
    }

    data.forEach(function(msg) {
      messagesList.appendChild(createCard(msg))
    })

  } catch (err) {
    loading.classList.add('hidden')
    messagesList.innerHTML = '<p class="empty">Could not load messages. Please refresh.</p>'
    console.error('Load error:', err)
  }
}

// ─────────────────────────────────────────
// 5. Prepend a new card with slide-down animation
// ─────────────────────────────────────────
function prependCard(msg) {
  // Remove "no messages" placeholder if present
  const empty = messagesList.querySelector('.empty')
  if (empty) empty.remove()

  const card = createCard(msg)
  card.classList.add('card-enter')

  // Insert at the top
  messagesList.insertBefore(card, messagesList.firstChild)

  // Trigger animation on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      card.classList.add('card-enter-active')
    })
  })
}

// ─────────────────────────────────────────
// 6. Submit a new message
// ─────────────────────────────────────────
submitBtn.addEventListener('click', async function() {
  const name    = nameInput.value.trim()
  const message = messageInput.value.trim()

  // Validation
  formError.classList.add('hidden')
  if (!name || !message) {
    formError.textContent = 'Please enter both your name and a message.'
    formError.classList.remove('hidden')
    return
  }

  // Disable button while submitting
  submitBtn.disabled = true
  submitBtn.textContent = 'Sending…'

  try {
    const { error } = await supabaseClient
      .from('messages')
      .insert({ name, message })

    if (error) throw error

    // Only update the DOM after confirmed save
    nameInput.value    = ''
    messageInput.value = ''
    prependCard({ name, message })

  } catch (err) {
    formError.textContent = 'Something went wrong. Please try again.'
    formError.classList.remove('hidden')
    console.error('Submit error:', err)
  } finally {
    submitBtn.disabled    = false
    submitBtn.textContent = 'Send Message'
  }
})

// ─────────────────────────────────────────
// 7. Load messages on page open
// ─────────────────────────────────────────
loadMessages()
