(function () {
  const theme = localStorage.getItem('portal_theme') || 'dark'
  document.documentElement.classList.toggle('dark', theme === 'dark')
})()
