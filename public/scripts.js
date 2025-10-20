document.addEventListener('DOMContentLoaded', () => {
    // ---- Lógica de Autenticación y Event Listeners ----
    const token = localStorage.getItem('token');
    if (window.location.pathname.includes('dashboard') && !token) {
        window.location.href = '/index.html';
    }
    if (window.location.pathname.includes('dashboard') && token) {
        fetchProfile();
    }

    // --- Event Listeners Centralizados ---
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/index.html';
    });
    // ... (otros listeners para el dashboard) ...
    document.getElementById('createRoleForm')?.addEventListener('submit', createRole);
    document.getElementById('editUserForm')?.addEventListener('submit', updateUser);
    document.getElementById('changePasswordForm')?.addEventListener('submit', changePassword);
    document.getElementById('editRoleForm')?.addEventListener('submit', updateRole);
    document.getElementById('createPermissionForm')?.addEventListener('submit', createPermission);
    document.getElementById('editPermissionForm')?.addEventListener('submit', updatePermission);
    document.getElementById('assignRoleBtn')?.addEventListener('click', assignRoleToUser);
    document.getElementById('assignPermissionBtn')?.addEventListener('click', assignPermissionToRole);
    document.getElementById('newPermResourceSelect')?.addEventListener('change', (e) => {
    document.getElementById('newPermResourceOtherContainer').style.display = e.target.value === 'other' ? 'block' : 'none';
    });
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
    document.querySelectorAll('.auth-page input').forEach(input => {
        input.addEventListener('input', () => {
            const errorDiv = document.getElementById('auth-error');
            if (errorDiv) errorDiv.style.display = 'none';
        });
    });
});

// ---- Funciones de Utilidad (Toast y API Fetch) ----
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { if (container.contains(toast)) container.removeChild(toast); }, 500);
    }, 5000);
}

async function apiFetch(url, options = {}) {
    // ... (código de apiFetch sin cambios) ...
    const token = localStorage.getItem('token');
    options.headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers };
    if (options.body && typeof options.body !== 'string') options.body = JSON.stringify(options.body);
    try {
        const res = await fetch(url, options);
        if (res.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/index.html';
            throw new Error('Sesión expirada');
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ocurrió un error en la API');
        return data;
    } catch (error) {
        console.error('Error en apiFetch:', error.message);
        throw error;
    }
}

// ---- Funciones de Perfil y Autenticación (CON PREVENTDEFAULT AL INICIO) ----
async function fetchProfile() {
    // ... (código de fetchProfile sin cambios) ...
    try {
        const data = await apiFetch('/api/auth/profile');
        const userInfo = document.getElementById('userInfo');
        userInfo.innerHTML = `<p><strong>ID:</strong> ${data.user.id}</p><p><strong>Username:</strong> ${data.user.username}</p><p><strong>Email:</strong> ${data.user.email}</p><p><strong>Roles:</strong> ${data.user.roles.map(r => r.name).join(', ')}</p>`;
        if (data.user.roles.some(r => r.name === 'admin')) {
            document.getElementById('admin-panel').style.display = 'block';
            fetchUsers(); fetchRoles(); fetchPermissions();
        }
    } catch (error) { showToast(error.message, 'error'); }
}

async function handleLogin(e) {
    e.preventDefault(); // <-- **ASEGÚRATE QUE ESTA SEA LA PRIMERA LÍNEA**
    const errorDiv = document.getElementById('auth-error');
    errorDiv.style.display = 'none';
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const data = await apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard.html';
    } catch (error) {
        errorDiv.textContent = error.message === 'Invalid credentials' ? 'Credenciales incorrectas. Verifica tu email y contraseña.' : error.message;
        errorDiv.style.display = 'block';
    }
}

async function handleRegister(e) {
    e.preventDefault(); // <-- **ASEGÚRATE QUE ESTA SEA LA PRIMERA LÍNEA**
    const errorDiv = document.getElementById('auth-error');
    errorDiv.style.display = 'none';
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await apiFetch('/api/auth/register', { method: 'POST', body: { username, email, password } });
        alert('Usuario registrado con éxito. Ahora puedes iniciar sesión.');
        window.location.href = '/index.html';
    } catch (error) {
        errorDiv.textContent = error.message === 'User already exists' ? 'Este correo electrónico ya está registrado.' : error.message;
        errorDiv.style.display = 'block';
    }
}

// ---- El resto de las funciones (sin cambios) ----
// (Aquí van todas las demás funciones: fetchUsers, openEditUserModal, etc.)
// ...
async function fetchUsers() {
    try {
        const { users } = await apiFetch('/api/users');
        const userList = document.getElementById('userList');
        userList.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('li');
            li.innerHTML = `<div class="list-info">${user.username} <small>${user.email}</small></div>`;
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'list-actions';
            actionsDiv.innerHTML = `<button class="btn-edit"><i class="fas fa-edit"></i> Editar</button><button class="btn-password"><i class="fas fa-key"></i> Clave</button><button class="btn-manage"><i class="fas fa-users-cog"></i> Roles</button><button class="btn-delete"><i class="fas fa-trash"></i> Eliminar</button>`;
            actionsDiv.querySelector('.btn-edit').addEventListener('click', () => openEditUserModal(user));
            actionsDiv.querySelector('.btn-password').addEventListener('click', () => openChangePasswordModal(user.id, user.username));
            actionsDiv.querySelector('.btn-manage').addEventListener('click', () => openManageUserRolesModal(user.id));
            actionsDiv.querySelector('.btn-delete').addEventListener('click', () => deleteUser(user.id));
            li.appendChild(actionsDiv);
            userList.appendChild(li);
        });
    } catch (error) { showToast(error.message, 'error'); }
}

function openEditUserModal(user) {
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserActive').checked = user.is_active;
    document.getElementById('editUserModal').style.display = 'block';
}

async function updateUser(e) {
    e.preventDefault();
    const id = document.getElementById('editUserId').value;
    const userData = { username: document.getElementById('editUsername').value, email: document.getElementById('editUserEmail').value, is_active: document.getElementById('editUserActive').checked };
    try {
        await apiFetch(`/api/users/${id}`, { method: 'PUT', body: userData });
        showToast('Usuario actualizado', 'success');
        closeModal('editUserModal'); fetchUsers();
    } catch (error) { showToast(error.message, 'error'); }
}

async function deleteUser(userId) {
    if (!confirm('¿Estás seguro?')) return;
    try {
        await apiFetch(`/api/users/${userId}`, { method: 'DELETE' });
        showToast('Usuario eliminado', 'success'); fetchUsers();
    } catch (error) { showToast(error.message, 'error'); }
}

function openChangePasswordModal(userId, username) {
    document.getElementById('changePassUserId').value = userId;
    document.getElementById('changePasswordTitle').innerHTML = `<i class="fas fa-lock"></i> Cambiar Contraseña de: ${username}`;
    document.getElementById('changePasswordForm').reset();
    document.getElementById('changePasswordModal').style.display = 'block';
}

async function changePassword(e) {
    e.preventDefault();
    const id = document.getElementById('changePassUserId').value;
    const newPassword = document.getElementById('newPassword').value;
    try {
        await apiFetch(`/api/users/${id}/change-password`, { method: 'POST', body: { newPassword } });
        showToast('Contraseña actualizada', 'success');
        closeModal('changePasswordModal');
    } catch (error) { showToast(error.message, 'error'); }
}

async function openManageUserRolesModal(userId) {
    document.getElementById('manageRolesUserId').value = userId;
    try {
        const [{ roles: userRoles }, { roles: allRoles }] = await Promise.all([apiFetch(`/api/users/${userId}/roles`), apiFetch('/api/roles')]);
        const userRoleIds = userRoles.map(r => r.id);
        const userRolesList = document.getElementById('userRolesList');
        userRolesList.innerHTML = userRoles.length === 0 ? '<p>Sin roles asignados.</p>' : '';
        userRoles.forEach(role => {
            const p = document.createElement('p');
            p.textContent = role.name;
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', () => removeRoleFromUser(userId, role.id));
            p.appendChild(removeBtn);
            userRolesList.appendChild(p);
        });
        const rolesToAssign = document.getElementById('rolesToAssign');
        rolesToAssign.innerHTML = '';
        allRoles.filter(role => !userRoleIds.includes(role.id)).forEach(role => rolesToAssign.innerHTML += `<option value="${role.id}">${role.name}</option>`);
        document.getElementById('manageUserRolesModal').style.display = 'block';
    } catch (error) { showToast(error.message, 'error'); }
}

async function assignRoleToUser() {
    const userId = document.getElementById('manageRolesUserId').value;
    const roleId = document.getElementById('rolesToAssign').value;
    if (!roleId) return showToast('No hay roles para asignar', 'error');
    try {
        await apiFetch('/api/users/assign-role', { method: 'POST', body: { userId: parseInt(userId), roleId: parseInt(roleId) } });
        showToast('Rol asignado', 'success'); openManageUserRolesModal(userId);
    } catch (error) { showToast(error.message, 'error'); }
}

async function removeRoleFromUser(userId, roleId) {
    try {
        await apiFetch('/api/users/remove-role', { method: 'POST', body: { userId, roleId } });
        showToast('Rol removido', 'success'); openManageUserRolesModal(userId);
    } catch (error) { showToast(error.message, 'error'); }
}

async function fetchRoles() {
    try {
        const { roles } = await apiFetch('/api/roles');
        const roleList = document.getElementById('roleList');
        roleList.innerHTML = '';
        roles.forEach(role => {
            const li = document.createElement('li');
            li.innerHTML = `<div class="list-info">${role.name} <small>${role.description || 'Sin descripción'}</small></div>`;
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'list-actions';
            actionsDiv.innerHTML = `<button class="btn-edit"><i class="fas fa-edit"></i> Editar</button><button class="btn-delete"><i class="fas fa-trash"></i> Eliminar</button>`;
            actionsDiv.querySelector('.btn-edit').addEventListener('click', () => openEditRoleModal(role.id));
            actionsDiv.querySelector('.btn-delete').addEventListener('click', () => deleteRole(role.id));
            li.appendChild(actionsDiv);
            roleList.appendChild(li);
        });
    } catch (error) { showToast(error.message, 'error'); }
}

async function createRole(e) {
    e.preventDefault();
    const roleData = { name: document.getElementById('newRoleName').value, description: document.getElementById('newRoleDescription').value };
    try {
        await apiFetch('/api/roles', { method: 'POST', body: roleData });
        showToast('Rol creado', 'success'); fetchRoles(); e.target.reset();
    } catch (error) { showToast(error.message, 'error'); }
}

async function deleteRole(roleId) {
    if (!confirm('¿Estás seguro?')) return;
    try {
        await apiFetch(`/api/roles/${roleId}`, { method: 'DELETE' });
        showToast('Rol eliminado', 'success'); fetchRoles();
    } catch (error) { showToast(error.message, 'error'); }
}

async function openEditRoleModal(roleId) {
    try {
        const [{ role }, { permissions: allPermissions }] = await Promise.all([apiFetch(`/api/roles/${roleId}`), apiFetch('/api/permissions')]);
        const rolePermissionIds = role.permissions.map(p => p.id);
        document.getElementById('editRoleId').value = role.id;
        document.getElementById('editRoleName').value = role.name;
        document.getElementById('editRoleDescription').value = role.description || '';
        const rolePermissionsList = document.getElementById('rolePermissionsList');
        rolePermissionsList.innerHTML = role.permissions.length === 0 ? '<p>Sin permisos asignados.</p>' : '';
        role.permissions.forEach(perm => {
            const p = document.createElement('p');
            p.textContent = perm.name;
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', () => removePermissionFromRole(role.id, perm.id));
            p.appendChild(removeBtn);
            rolePermissionsList.appendChild(p);
        });
        const permissionsToAssign = document.getElementById('permissionsToAssign');
        permissionsToAssign.innerHTML = '';
        allPermissions.filter(perm => !rolePermissionIds.includes(perm.id)).forEach(perm => permissionsToAssign.innerHTML += `<option value="${perm.id}">${perm.name}</option>`);
        document.querySelector('.permission-assignment-container').style.display = 'block';
        document.getElementById('editRoleModal').style.display = 'block';
    } catch (error) { showToast(error.message, 'error'); }
}

async function updateRole(e) {
    e.preventDefault();
    const id = document.getElementById('editRoleId').value;
    const roleData = { name: document.getElementById('editRoleName').value, description: document.getElementById('editRoleDescription').value };
    try {
        await apiFetch(`/api/roles/${id}`, { method: 'PUT', body: roleData });
        showToast('Rol actualizado', 'success'); closeModal('editRoleModal'); fetchRoles();
    } catch (error) { showToast(error.message, 'error'); }
}

async function assignPermissionToRole() {
    const roleId = document.getElementById('editRoleId').value;
    const permissionId = document.getElementById('permissionsToAssign').value;
    if (!permissionId) return showToast('No hay permisos para asignar', 'error');
    try {
        await apiFetch('/api/roles/assign-permission', { method: 'POST', body: { roleId: parseInt(roleId), permissionId: parseInt(permissionId) } });
        showToast('Permiso asignado', 'success'); openEditRoleModal(roleId);
    } catch (error) { showToast(error.message, 'error'); }
}

async function removePermissionFromRole(roleId, permissionId) {
    try {
        await apiFetch('/api/roles/remove-permission', { method: 'POST', body: { roleId, permissionId } });
        showToast('Permiso removido', 'success'); openEditRoleModal(roleId);
    } catch (error) { showToast(error.message, 'error'); }
}

async function fetchPermissions() {
    try {
        const { permissions } = await apiFetch('/api/permissions');
        const permissionList = document.getElementById('permissionList');
        permissionList.innerHTML = '';
        permissions.forEach(perm => {
            const li = document.createElement('li');
            li.innerHTML = `<div class="list-info">${perm.name} <small>${perm.description || 'Sin descripción'}</small></div>`;
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'list-actions';
            actionsDiv.innerHTML = `<button class="btn-edit"><i class="fas fa-edit"></i> Editar</button><button class="btn-delete"><i class="fas fa-trash"></i> Eliminar</button>`;
            actionsDiv.querySelector('.btn-edit').addEventListener('click', () => openEditPermissionModal(perm));
            actionsDiv.querySelector('.btn-delete').addEventListener('click', () => deletePermission(perm.id));
            li.appendChild(actionsDiv);
            permissionList.appendChild(li);
        });
    } catch (error) { showToast('Error al cargar permisos: ' + error.message, 'error'); }
}

async function createPermission(e) {
    e.preventDefault();
    const form = e.target;
    let resource = document.getElementById('newPermResourceSelect').value;
    if (resource === 'other') resource = document.getElementById('newPermResourceOther').value;
    if (!resource) return showToast('Debe especificar un recurso', 'error');
    const checkedActions = Array.from(document.querySelectorAll('input[name="permAction"]:checked'));
    if (checkedActions.length === 0) return showToast('Debe seleccionar al menos una acción', 'error');
    const creationPromises = checkedActions.map(checkbox => {
        const action = checkbox.value;
        const permData = { name: `${resource.toLowerCase()}:${action.toLowerCase()}`, description: `Permite la acción ${action} sobre el recurso ${resource}`, resource: resource.toLowerCase(), action };
        return apiFetch('/api/permissions', { method: 'POST', body: permData });
    });
    try {
        const results = await Promise.all(creationPromises);
        const createdCount = results.filter(r => r && r.permission).length;
        showToast(`${createdCount} permiso(s) nuevo(s) creado(s).`, 'success');
        if (createdCount > 0) { fetchPermissions(); fetchRoles(); }
        form.reset();
        document.getElementById('newPermResourceOtherContainer').style.display = 'none';
    } catch (error) { showToast('Error al crear permisos: ' + error.message, 'error'); }
}

function openEditPermissionModal(permission) {
    document.getElementById('editPermId').value = permission.id;
    document.getElementById('editPermName').value = permission.name;
    document.getElementById('editPermDesc').value = permission.description;
    document.getElementById('editPermResource').value = permission.resource;
    document.getElementById('editPermAction').value = permission.action;
    document.getElementById('editPermissionModal').style.display = 'block';
}

async function updatePermission(e) {
    e.preventDefault();
    const id = document.getElementById('editPermId').value;
    const permData = { name: document.getElementById('editPermName').value, description: document.getElementById('editPermDesc').value, resource: document.getElementById('editPermResource').value, action: document.getElementById('editPermAction').value };
    try {
        await apiFetch(`/api/permissions/${id}`, { method: 'PUT', body: permData });
        showToast('Permiso actualizado', 'success'); closeModal('editPermissionModal'); fetchPermissions(); fetchRoles();
    } catch (error) { showToast(error.message, 'error'); }
}

async function deletePermission(permissionId) {
    if (!confirm('¿Estás seguro?')) return;
    try {
        await apiFetch(`/api/permissions/${permissionId}`, { method: 'DELETE' });
        showToast('Permiso eliminado', 'success'); fetchPermissions(); fetchRoles();
    } catch (error) { showToast(error.message, 'error'); }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}