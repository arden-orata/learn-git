// ─────────────────────────────────────────
// 1. Connect to Supabase
// ─────────────────────────────────────────
const supabase = window.supabase.createClient(
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
// 3. Load messages from Supabase
// ─────────────────────────────────────────
async function loadMessages() {
  loading.classList.remove('hidden')
  messagesList.innerHTML = ''

  try {
    const { data, error } = await supabase
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
      const card = document.createElement('div')
      card.className = 'message-card'
      card.innerHTML = `
        <p class="message-name">${msg.name}</p>
        <p class="message-text">${msg.message}</p>
      `
      messagesList.appendChild(card)
    })

  } catch (err) {
    loading.classList.add('hidden')
    messagesList.innerHTML = '<p class="empty">Could not load messages. Please refresh.</p>'
    console.error('Load error:', err)
  }
}

// ─────────────────────────────────────────
// 4. Submit a new message
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
    const { error } = await supabase
      .from('messages')
      .insert({ name, message })

    if (error) throw error

    // Clear form
    nameInput.value    = ''
    messageInput.value = ''

    // Reload messages to show the new one
    await loadMessages()

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
// 5. Load messages on page open
// ─────────────────────────────────────────
loadMessages()
