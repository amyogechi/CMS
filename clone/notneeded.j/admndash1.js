  
        // Sample complaint data (In real application, this would come from database)
        const complaintsData = [
            {
                id: 'CMP-001',
                subject: 'Website login issues',
                customer: 'John Smith',
                email: 'john.smith@email.com',
                phone: '+1234567890',
                status: 'pending',
                priority: 'high',
                date: '2024-03-15',
                description: 'Unable to login to the website. Password reset is not working properly. This has been an ongoing issue for the past 3 days.',
                category: 'Technical'
            },
            {
                id: 'CMP-002',
                subject: 'Product delivery delayed',
                customer: 'Sarah Johnson',
                email: 'sarah.j@email.com',
                phone: '+1234567891',
                status: 'in-progress',
                priority: 'medium',
                date: '2024-03-14',
                description: 'My order #12345 was supposed to be delivered 5 days ago but still hasn\'t arrived. No tracking updates provided.',
                category: 'Delivery'
            },
            {
                id: 'CMP-003',
                subject: 'Billing discrepancy',
                customer: 'Mike Wilson',
                email: 'mike.w@email.com',
                phone: '+1234567892',
                status: 'resolved',
                priority: 'low',
                date: '2024-03-13',
                description: 'Found incorrect charges on my last invoice. Need clarification on service fees.',
                category: 'Billing'
            },
             {
                id: 'CMP-003',
                subject: 'Billing discrepancy',
                customer: 'Mike Wilson',
                email: 'mike.w@email.com',
                phone: '+1234567892',
                status: 'resolved',
                priority: 'low',
                date: '2024-03-13',
                description: 'Found incorrect charges on my last invoice. Need clarification on service fees.',
                category: 'Billing'
            },
            {
                id: 'CMP-004',
                subject: 'App crashing frequently',
                customer: 'Emma Davis',
                email: 'emma.d@email.com',
                phone: '+1234567893',
                status: 'pending',
                priority: 'high',
                date: '2024-03-15',
                description: 'Mobile app crashes every time I try to access my account settings. Using iPhone 12.',
                category: 'Technical'
            },
            {
                id: 'CMP-005',
                subject: 'Poor customer service',
                customer: 'David Brown',
                email: 'david.b@email.com',
                phone: '+1234567894',
                status: 'rejected',
                priority: 'medium',
                date: '2024-03-12',
                description: 'Called customer service 3 times and received unhelpful responses each time. Very disappointed.',
                category: 'Service'
            },
            {
                id: 'CMP-006',
                subject: 'Refund request not processed',
                customer: 'Lisa Anderson',
                email: 'lisa.a@email.com',
                phone: '+1234567895',
                status: 'in-progress',
                priority: 'medium',
                date: '2024-03-11',
                description: 'Requested refund 2 weeks ago for cancelled service but haven\'t received it yet.',
                category: 'Billing'
            }
        ];

        // Global variables
        let currentPage = 1;
        const itemsPerPage = 6;
        let filteredComplaints = [...complaintsData];

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            updateStatistics();
            displayComplaints();
            setupEventListeners();
        });

        // Update statistics
        function updateStatistics() {
            const total = complaintsData.length;
            const pending = complaintsData.filter(c => c.status === 'pending').length;
            const resolved = complaintsData.filter(c => c.status === 'resolved').length;
            const rejected = complaintsData.filter(c => c.status === 'rejected').length;

            document.getElementById('totalComplaints').textContent = total;
            document.getElementById('pendingComplaints').textContent = pending;
            document.getElementById('resolvedComplaints').textContent = resolved;
            document.getElementById('rejectedComplaints').textContent = rejected;
        }

        // Display complaints in table
        function displayComplaints() {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedComplaints = filteredComplaints.slice(startIndex, endIndex);

            const tbody = document.getElementById('complaintsTableBody');
            
            if (paginatedComplaints.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="no-data">
                            <i class="fas fa-inbox"></i>
                            <div>No complaints found</div>
                        </td>
                    </tr>
                `;
                document.getElementById('pagination').innerHTML = '';
                return;
            }

            tbody.innerHTML = paginatedComplaints.map(complaint => `
                <tr>
                    <td><span class="complaint-id">${complaint.id}</span></td>
                    <td><span class="complaint-subject" title="${complaint.subject}">${complaint.subject}</span></td>
                    <td>${complaint.customer}</td>
                    <td><span class="status-badge status-${complaint.status}">${complaint.status.replace('-', ' ')}</span></td>
                    

                    <td>${formatDate(complaint.date)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-view" onclick="viewComplaint('${complaint.id}')">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn btn-update" onclick="updateStatus('${complaint.id}')">
                                <i class="fas fa-edit"></i> Update
                            </button>
                            <button class="btn btn-delete" onclick="deleteComplaint('${complaint.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            updatePagination();
        }

        // Setup event listeners
        function setupEventListeners() {
            // Search functionality
            document.getElementById('searchInput').addEventListener('input', handleSearch);
            
            // Filter functionality
            document.getElementById('statusFilter').addEventListener('change', handleFilter);
            document.getElementById('priorityFilter').addEventListener('change', handleFilter);
            
            // Modal close functionality
            document.querySelector('.close').addEventListener('click', closeModal);
            window.addEventListener('click', function(e) {
                const modal = document.getElementById('complaintModal');
                if (e.target === modal) {
                    closeModal();
                }
            });
        }

        // Handle search
        function handleSearch() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            applyFilters(searchTerm);
        }

        // Handle filters
        function handleFilter() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            applyFilters(searchTerm);
        }

        // Apply filters and search
        function applyFilters(searchTerm = '') {
            const statusFilter = document.getElementById('statusFilter').value;
            const priorityFilter = document.getElementById('priorityFilter').value;

            filteredComplaints = complaintsData.filter(complaint => {
                const matchesSearch = searchTerm === '' || 
                    complaint.subject.toLowerCase().includes(searchTerm) ||
                    complaint.customer.toLowerCase().includes(searchTerm) ||
                    complaint.id.toLowerCase().includes(searchTerm);

                const matchesStatus = statusFilter === '' || complaint.status === statusFilter;
                const matchesPriority = priorityFilter === '' || complaint.priority === priorityFilter;

                return matchesSearch && matchesStatus && matchesPriority;
            });

            currentPage = 1;
            displayComplaints();
        }

        // Update pagination
        function updatePagination() {
            const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
            const pagination = document.getElementById('pagination');

            if (totalPages <= 1) {
                pagination.innerHTML = '';
                return;
            }

            let paginationHTML = '';

            // Previous button
            paginationHTML += `
                <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
            `;

            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                if (i === currentPage) {
                    paginationHTML += `<button class="active">${i}</button>`;
                } else {
                    paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
                }
            }

            // Next button
            paginationHTML += `
                <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            `;

            pagination.innerHTML = paginationHTML;
        }

        // Change page
        function changePage(page) {
            const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
            if (page >= 1 && page <= totalPages) {
                currentPage = page;
                displayComplaints();
            }
        }

        // View complaint details
        function viewComplaint(complaintId) {
            const complaint = complaintsData.find(c => c.id === complaintId);
            if (!complaint) return;

            const detailsHTML = `
                <div class="detail-group">
                    <div class="detail-label">Complaint ID:</div>
                    <div class="detail-value">${complaint.id}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Subject:</div>
                    <div class="detail-value">${complaint.subject}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Customer Name:</div>
                    <div class="detail-value">${complaint.customer}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value">${complaint.email}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Phone:</div>
                    <div class="detail-value">${complaint.phone}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">
                        <span class="status-badge status-${complaint.status}">${complaint.status.replace('-', ' ')}</span>
                    </div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Priority:</div>
                    <div class="detail-value">
                        <span class="priority-badge priority-${complaint.priority}">${complaint.priority}</span>
                    </div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Category:</div>
                    <div class="detail-value">${complaint.category}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Date Submitted:</div>
                    <div class="detail-value">${formatDate(complaint.date)}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Description:</div>
                    <div class="detail-value">${complaint.description}</div>
                </div>
            `;

            document.getElementById('complaintDetails').innerHTML = detailsHTML;
            document.getElementById('complaintModal').style.display = 'block';
        }

        // Update complaint status
        function updateStatus(complaintId) {
            const complaint = complaintsData.find(c => c.id === complaintId);
            if (!complaint) return;

            const newStatus = prompt(
                `Current status: ${complaint.status}\nEnter new status (pending/in-progress/resolved/rejected):`,
                complaint.status
            );

            if (newStatus && ['pending', 'in-progress', 'resolved', 'rejected'].includes(newStatus.toLowerCase())) {
                complaint.status = newStatus.toLowerCase();
                updateStatistics();
                displayComplaints();
                alert(`Status updated successfully for ${complaintId}`);
            } else if (newStatus !== null) {
                alert('Invalid status. Please use: pending, in-progress, resolved, or rejected');
            }
        }

        // Delete complaint
        function deleteComplaint(complaintId) {
            if (confirm(`Are you sure you want to delete complaint ${complaintId}?`)) {
                const index = complaintsData.findIndex(c => c.id === complaintId);
                if (index !== -1) {
                    complaintsData.splice(index, 1);
                    applyFilters(document.getElementById('searchInput').value.toLowerCase());
                    updateStatistics();
                    alert(`Complaint ${complaintId} deleted successfully`);
                }
            }
        }

        // Close modal
        function closeModal() {
            document.getElementById('complaintModal').style.display = 'none';
        }

        // Format date
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }