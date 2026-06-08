(function() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  const links = document.querySelectorAll('.sidebar-link');
  const path = window.location.pathname;
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== '/MedVaultWeb/' && path.includes(href.replace(/\/?$/, ''))) {
      link.classList.add('active');
    } else if (href === '/MedVaultWeb/' && (path === '/MedVaultWeb/' || path === '/MedVaultWeb/index.html')) {
      link.classList.add('active');
    }
  });
})();
