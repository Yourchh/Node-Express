document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (window.location.pathname.includes('dashboard') && !token) {
        window.location.href = '/index.html';
    }

    if (window.location.pathname.includes('dashboard') && token) {
        fetchProfile(token);
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                window.location.href = '/dashboard.html';
            } else {
                alert(data.error);
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Usuario registrado con éxito');
                window.location.href = '/index.html';
            } else {
                alert(data.error);
            }
        });
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = '/index.html';
        });
    }
});

async function fetchProfile(token) {
    const res = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
        const userInfo = document.getElementById('userInfo');
        userInfo.innerHTML = `
            <p><strong>ID:</strong> ${data.user.id}</p>
            <p><strong>Username:</strong> ${data.user.username}</p>
            <p><strong>Email:</strong> ${data.user.email}</p>
            <p><strong>Roles:</strong> ${data.user.roles.map(r => r.name).join(', ')}</p>
        `;

        if (data.user.roles.some(r => r.name === 'admin')) {
            document.getElementById('admin-panel').style.display = 'block';
            fetchUsers(token);
            fetchRoles(token);
        }
    } else {
        localStorage.removeItem('token');
        window.location.href = '/index.html';
    }
}

async function fetchUsers(token) {
    const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    data.users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.username} (${user.email})`;
        userList.appendChild(li);
    });
}

async function fetchRoles(token) {
    const res = await fetch('/api/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const roleList = document.getElementById('roleList');
    roleList.innerHTML = '';
    data.roles.forEach(role => {
        const li = document.createElement('li');
        li.textContent = `${role.name}`;
        roleList.appendChild(li);
    });
}