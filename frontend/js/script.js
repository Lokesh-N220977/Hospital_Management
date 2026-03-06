document.addEventListener('DOMContentLoaded', () => {
    // Determine the current page to set active menu and sidebar items
    const path = window.location.pathname;
    const page = path.split("/").pop();

    console.log("Current page:", page);

    // Sidebar menu items based on dashboard type
    const patientMenu = [
        { name: 'Dashboard', icon: 'fas fa-home', link: 'patient_dashboard.html' },
        { name: 'Book Appointment', icon: 'fas fa-calendar-plus', link: 'appointment.html' },
        { name: 'My Appointments', icon: 'fas fa-calendar-check', link: '#' },
        { name: 'Visit History', icon: 'fas fa-history', link: 'visit_history.html' },
        { name: 'Profile', icon: 'fas fa-user', link: '#' },
    ];

    const adminMenu = [
        { name: 'Dashboard', icon: 'fas fa-chart-line', link: 'admin_dashboard.html' },
        { name: 'Manage Patients', icon: 'fas fa-users', link: '#' },
        { name: 'Manage Doctors', icon: 'fas fa-user-md', link: '#' },
        { name: 'Appointments', icon: 'fas fa-calendar-alt', link: '#' },
        { name: 'Analytics', icon: 'fas fa-poll', link: 'analytics.html' },
        { name: 'Settings', icon: 'fas fa-cog', link: '#' },
    ];

    const menuContainer = document.getElementById('sidebar-menu');
    
    if (menuContainer) {
        let menuItems = [];
        if (page.includes('admin') || page.includes('analytics')) {
            menuItems = adminMenu;
        } else {
            menuItems = patientMenu;
        }

        menuItems.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = item.link;
            if (page === item.link) a.classList.add('active');
            
            a.innerHTML = `<i class="${item.icon}"></i> <span>${item.name}</span>`;
            li.appendChild(a);
            menuContainer.appendChild(li);
        });
    }

    // Handle Login Simulation
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const role = document.getElementById('role').value;
            if (role === 'admin') {
                window.location.href = 'admin_dashboard.html';
            } else {
                window.location.href = 'patient_dashboard.html';
            }
        });
    }
});
