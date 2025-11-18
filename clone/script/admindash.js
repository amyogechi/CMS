
async function loadComplaints() {
    try {
        const res = await fetch('/api/complaints');
        let complaints = await res.json();

        // --- Update stats cards ---
        const total = complaints.length;
        const pending = complaints.filter(c => c.status === 'pending' || !c.status).length;
        const resolved = complaints.filter(c => c.status === 'resolved').length;
        const progress = complaints.filter(c => c.status === 'in-progress').length;
        const anonymous = complaints.filter(c => c.anonymous).length;


        document.getElementById('totalComplaints').innerText = total;
        document.getElementById('pendingComplaints').innerText = pending;
        document.getElementById('resolvedComplaints').innerText = resolved;
        document.getElementById('progressComplaints').innerText = progress;
        document.getElementById('anonymosComplaints').innerText = anonymous;

        // Store globally so delegated view-btn can access it
        window.filteredComplaints = complaints;

        // search and filter values
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value.toLowerCase();

        // Apply search + status filter
        complaints = complaints.filter(c => {
            const status = (c.status || 'pending').toLowerCase();
            const title = (c.title || '').toLowerCase();
            const name = (c.name || '').toLowerCase();
            const regno = (c.regno || '').toLowerCase();

            const matchesSearch =
                title.includes(searchInput) ||
                name.includes(searchInput) ||
                regno.includes(searchInput) ||
                status.includes(searchInput);

            const matchesStatus = !statusFilter || !statusFilter ||
                (statusFilter === "anonymous" ? c.anonymous === true : status === statusFilter);

            return matchesSearch && matchesStatus;
        });


        window.filteredComplaints = complaints; // update filtered list

        const tbody = document.getElementById('complaintsTableBody');
        tbody.innerHTML = ''; // clear existing rows

        complaints.forEach((complaint, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${complaint.title}</td>
                <td>${complaint.name}</td>
                <td>${complaint.regno}</td>
                <td>
                
                  <span class="status-badge ${complaint.status || 'pending'}">
                    ${complaint.status || 'pending'}
                  </span>
                </td>
                <td>${new Date(complaint.createdAt).toLocaleString()}</td>
                <td>
                  <button class="view-btn" data-id="${complaint._id}">View</button>
                  <button class="update-btn" data-id="${complaint._id}" ${complaint.status === 'resolved' ? 'disabled' : ''}>
                    Update
                  </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Error loading complaints:", err);
    }
}

// Update button click
document.getElementById('complaintsTableBody').addEventListener('click', async (e) => {
    if (e.target && e.target.classList.contains('update-btn')) {
        const btn = e.target;
        btn.disabled = true; // prevent double click
        btn.innerText = "Updating...";

        const id = btn.dataset.id;
        try {
            const res = await fetch(`/api/complaints/${id}/advance`, { method: 'PUT' });
            const data = await res.json();
            alert(data.message);
            loadComplaints(); // refresh table
        } catch (err) {
            console.error("Frontend advance error:", err);
            alert("Server error while advancing status");
        } finally {
            btn.disabled = false;
            btn.innerText = "Updated...";
        }
    }
});


// View button click
document.getElementById('complaintsTableBody').addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('view-btn')) {
        const id = e.target.dataset.id;
        const complaint = window.filteredComplaints.find(c => c._id === id);
        if (complaint) {
            const modal = document.getElementById('complaintModal');
            const detailsDiv = document.getElementById('complaintDetails');
            detailsDiv.innerHTML = `
                <p><strong>Complaint From:</strong> ${complaint.name} (${complaint.regno})</p>
                <p><strong>Email:</strong> ${complaint.email}</p>
                <p><strong>Department:</strong> ${complaint.department}</p>
                <p><strong>Title:</strong> ${complaint.title}</p>
                <p><strong>Details:</strong> ${complaint.details}</p>
                <p><strong>Status:</strong> ${complaint.status || 'pending'}</p>
                <p><strong>Submitted On:</strong> ${new Date(complaint.createdAt).toLocaleString()}</p>
                ${complaint.file ? `<p><strong>File:</strong> <a href="/${complaint.file}" target="_blank">Download</a></p>` : ''}
            `;
            modal.style.display = 'block';
        }
    }
});


// Close modal
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('complaintModal').style.display = 'none';
});

// Load complaints on page load
window.addEventListener('DOMContentLoaded', loadComplaints);

// Add search and filter event listeners
document.getElementById('searchInput').addEventListener('input', loadComplaints);
document.getElementById('statusFilter').addEventListener('change', loadComplaints);