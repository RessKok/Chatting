const toggleSwitch = document.querySelector('#dark-mode-toggle-checkbox');
const chatContainer = document.querySelector('.chat-container');

toggleSwitch.addEventListener('change', function () {
    if (this.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-mode');
        chatContainer.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        chatContainer.classList.remove('light-mode');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.classList.remove('dark-mode');
        chatContainer.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        chatContainer.classList.add('light-mode');
    }
});
