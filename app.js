// --- DATA STATE ---
        let accounts = JSON.parse(localStorage.getItem('tradingTrackerAccounts')) || [];
        let transactions = JSON.parse(localStorage.getItem('tradingTrackerTransactions')) || [];

        // --- INIT ---
        const today = new Date();
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        const toInputDate = (d) => d.toISOString().split('T')[0];

        document.getElementById('filter-start').value = toInputDate(firstDayOfYear);
        document.getElementById('filter-end').value = toInputDate(today);

        // Listeners
        document.getElementById('filter-start').addEventListener('change', renderDashboard);
        document.getElementById('filter-end').addEventListener('change', renderDashboard);

        const saveData = () => {
            localStorage.setItem('tradingTrackerAccounts', JSON.stringify(accounts));
            localStorage.setItem('tradingTrackerTransactions', JSON.stringify(transactions));
            renderAll();
        };

        // --- NAVIGATION & UI ---
        function showSection(sectionId) {
            document.querySelectorAll('[id^="section-"]').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
            
            document.getElementById(`section-${sectionId}`).classList.remove('hidden');
            document.getElementById(`nav-${sectionId}`).classList.add('active');
            
            document.getElementById('dashboard-date-picker').style.display = sectionId === 'dashboard' ? 'flex' : 'none';
            document.getElementById('page-title').innerText = sectionId === 'dashboard' ? 'Dashboard' : 'Cuentas';

            if(sectionId === 'dashboard') renderDashboard();
            if(sectionId === 'cuentas') applyFilters(); 
        }

        function openModal(id) { 
            document.getElementById(id).classList.remove('hidden'); 
            document.body.classList.add('modal-active');
        }
        function closeModal(id) { 
            document.getElementById(id).classList.add('hidden'); 
            document.body.classList.remove('modal-active');
        }

        // --- ACCOUNT MANAGEMENT (CREATE & EDIT) ---
        function openAccountModal(isEdit = false, accId = null) {
            const form = document.getElementById('form-account');
            const title = document.getElementById('modal-account-title');
            
            if (isEdit && accId) {
                const acc = accounts.find(a => a.id === accId);
                title.innerText = "Editar Cuenta";
                document.getElementById('acc-id').value = acc.id;
                document.getElementById('acc-firm').value = acc.firm;
                document.getElementById('acc-name').value = acc.name;
                document.getElementById('acc-type').value = acc.type;
                document.getElementById('acc-status').value = acc.status;
                document.getElementById('acc-date').value = acc.createdAt;
                
                document.getElementById('acc-cost').value = ''; 
                document.getElementById('cost-field-group').style.display = 'none'; 
            } else {
                title.innerText = "Nueva Cuenta";
                form.reset();
                document.getElementById('acc-id').value = '';
                document.getElementById('acc-date').valueAsDate = new Date();
                document.getElementById('cost-field-group').style.display = 'block';
            }
            openModal('modal-account');
        }

        document.getElementById('form-account').addEventListener('submit', (e) => {
            e.preventDefault();
            const idInput = document.getElementById('acc-id').value;
            const dateInput = document.getElementById('acc-date').value;
            
            if (idInput) {
                // EDIT MODE
                const accIndex = accounts.findIndex(a => a.id == idInput);
                if (accIndex > -1) {
                    accounts[accIndex].firm = document.getElementById('acc-firm').value;
                    accounts[accIndex].name = document.getElementById('acc-name').value;
                    accounts[accIndex].type = document.getElementById('acc-type').value;
                    accounts[accIndex].status = document.getElementById('acc-status').value;
                    accounts[accIndex].createdAt = dateInput;
                }
            } else {
                // CREATE MODE
                const newAccount = {
                    id: Date.now(),
                    firm: document.getElementById('acc-firm').value,
                    name: document.getElementById('acc-name').value,
                    type: document.getElementById('acc-type').value,
                    status: document.getElementById('acc-status').value,
                    createdAt: dateInput
                };
                accounts.push(newAccount);

                const cost = parseFloat(document.getElementById('acc-cost').value);
                if(cost > 0) {
                    transactions.push({
                        id: Date.now() + 1,
                        accountId: newAccount.id,
                        type: 'Gasto',
                        amount: cost,
                        date: dateInput
                    });
                }
            }
            saveData();
            closeModal('modal-account');
        });

        // --- TRANSACTIONS ---
        function openTransactionModal(accId, accName) {
            document.getElementById('trans-acc-id').value = accId;
            document.getElementById('trans-subtitle').innerText = `Cuenta: ${accName}`;
            document.getElementById('form-transaction').reset();
            document.querySelector('input[name="transType"][value="Retiro"]').checked = true;
            document.getElementById('trans-date').valueAsDate = new Date();
            openModal('modal-transaction');
        }

        document.getElementById('form-transaction').addEventListener('submit', (e) => {
            e.preventDefault();
            const type = document.querySelector('input[name="transType"]:checked').value;
            transactions.push({
                id: Date.now(),
                accountId: parseInt(document.getElementById('trans-acc-id').value),
                type: type,
                amount: parseFloat(document.getElementById('trans-amount').value),
                date: document.getElementById('trans-date').value
            });
            saveData();
            closeModal('modal-transaction');
        });

        function deleteAccount(id) {
            if(confirm('¿Seguro que quieres borrar esta cuenta? Se perderá todo su historial.')) {
                accounts = accounts.filter(a => a.id !== id);
                transactions = transactions.filter(t => t.accountId !== id);
                saveData();
            }
        }

        // --- FILTERING ---
        let currentTypeFilter = 'all';
        let currentStatusFilter = 'all';

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.filterType;
                const value = e.target.dataset.filterValue;
                document.querySelectorAll(`.filter-btn[data-filter-type="${type}"]`).forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                if (type === 'type') currentTypeFilter = value;
                if (type === 'status') currentStatusFilter = value;
                applyFilters();
            });
        });

        function applyFilters() {
            let filtered = accounts;
            if (currentTypeFilter !== 'all') filtered = filtered.filter(acc => acc.type === currentTypeFilter);
            if (currentStatusFilter !== 'all') filtered = filtered.filter(acc => acc.status === currentStatusFilter);
            renderAccountsTable(filtered);
        }

        // --- RENDERING ---
        function renderAll() {
            applyFilters();
            renderDashboard();
        }

        function getAccountFinancials(accId) {
            const accTrans = transactions.filter(t => t.accountId === accId);
            const expenses = accTrans.filter(t => t.type === 'Gasto').reduce((sum, t) => sum + t.amount, 0);
            const winnings = accTrans.filter(t => t.type === 'Retiro').reduce((sum, t) => sum + t.amount, 0);
            return { expenses, winnings, profit: winnings - expenses };
        }

        function renderAccountsTable(list) {
            const tbody = document.getElementById('accounts-table-body');
            tbody.innerHTML = '';
            
            if(list.length === 0) {
                document.getElementById('empty-state').classList.remove('hidden');
                return;
            }
            document.getElementById('empty-state').classList.add('hidden');

            list.forEach(acc => {
                const fin = getAccountFinancials(acc.id);
                
                // Styles
                const typeBadge = acc.type === 'Live' 
                    ? '<span class="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800 border border-green-200">Live</span>' 
                    : '<span class="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">Evaluación</span>';
                
                let statusBadgeClass = 'bg-gray-100 text-gray-800';
                if(acc.status === 'Activa') statusBadgeClass = 'bg-blue-100 text-blue-800 border border-blue-200';
                if(acc.status === 'Passed') statusBadgeClass = 'bg-purple-100 text-purple-800 border border-purple-200';
                if(acc.status === 'Suspendida') statusBadgeClass = 'bg-red-100 text-red-800 border border-red-200';

                const tr = document.createElement('tr');
                tr.className = "hover:bg-gray-50 transition border-b border-gray-100 last:border-0";
                tr.innerHTML = `
                    <td class="px-6 py-4 font-medium text-gray-900">${acc.name}</td>
                    <td class="px-6 py-4">${typeBadge}</td>
                    <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs font-semibold ${statusBadgeClass}">${acc.status}</span></td>
                    <td class="px-6 py-4 text-gray-500">${acc.firm}</td>
                    <td class="px-6 py-4 text-right text-red-500 font-mono">-${fin.expenses.toFixed(2)}€</td>
                    <td class="px-6 py-4 text-right text-green-500 font-mono">+${fin.winnings.toFixed(2)}€</td>
                    <td class="px-6 py-4 text-right font-bold font-mono ${fin.profit >= 0 ? 'text-green-700' : 'text-red-600'}">${fin.profit.toFixed(2)}€</td>
                    <td class="px-6 py-4 text-center">
                        <div class="flex items-center justify-center gap-2">
                            <button onclick="openTransactionModal(${acc.id}, '${acc.name}')" title="Añadir Dinero/Gasto" class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition"><i class="fa-solid fa-circle-dollar-to-slot text-lg"></i></button>
                            <button onclick="openAccountModal(true, ${acc.id})" title="Editar Cuenta" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="deleteAccount(${acc.id})" title="Eliminar" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function renderDashboard() {
            const startDate = document.getElementById('filter-start').value;
            const endDate = document.getElementById('filter-end').value;
            const isInDateRange = (dateStr) => dateStr && dateStr >= startDate && dateStr <= endDate;

            const filteredTrans = transactions.filter(t => isInDateRange(t.date));
            const accountsInRange = accounts.filter(a => isInDateRange(a.createdAt));

            const evalsTotal = accountsInRange.filter(a => a.type === 'Evaluación').length;
            const liveTotal = accountsInRange.filter(a => a.type === 'Live').length;
            
            const activeEvals = accounts.filter(a => a.type === 'Evaluación' && a.status === 'Activa').length;
            const activeLive = accounts.filter(a => a.type === 'Live' && a.status === 'Activa').length;

            document.getElementById('total-evals').innerText = evalsTotal;
            document.getElementById('evals-active').innerText = `${activeEvals} en progreso`;
            document.getElementById('total-live').innerText = liveTotal;
            document.getElementById('live-active').innerText = `${activeLive} activas`;

            // Money Logic
            const expenses = filteredTrans.filter(t => t.type === 'Gasto').reduce((sum, t) => sum + t.amount, 0);
            const winnings = filteredTrans.filter(t => t.type === 'Retiro').reduce((sum, t) => sum + t.amount, 0);
            const net = winnings - expenses;
            const withdrawalCount = filteredTrans.filter(t => t.type === 'Retiro').length;

            // --- CORRECCIÓN MATEMÁTICA FUNDING RATIO ---
            // Solo contamos Evaluaciones que ya tienen veredicto final
            const evalsInRange = accountsInRange.filter(a => a.type === 'Evaluación');
            const passedCount = evalsInRange.filter(a => a.status === 'Passed').length;
            const suspendedCount = evalsInRange.filter(a => a.status === 'Suspendida').length;
            
            const totalDecided = passedCount + suspendedCount;
            // Ratio = Passed / (Passed + Suspended)
            const ratio = totalDecided > 0 ? (passedCount / totalDecided) * 100 : 0;

            document.getElementById('total-expenses').innerText = formatCurrency(expenses);
            document.getElementById('total-winnings').innerText = formatCurrency(winnings);
            document.getElementById('net-profit').innerText = formatCurrency(net);
            document.getElementById('net-profit').className = `text-3xl font-bold ${net >= 0 ? 'text-gray-800' : 'text-red-600'}`;
            
            const roi = expenses > 0 ? (net / expenses) * 100 : 0;
            document.getElementById('roi-percent').innerText = `ROI: ${roi.toFixed(1)}%`;
            
            document.getElementById('total-retiros-count').innerText = `Retiros: ${withdrawalCount}`;
            document.getElementById('funding-ratio').innerText = `${ratio.toFixed(1)}%`;

            renderTopFirms(filteredTrans);
            renderChart(filteredTrans);
        }

        function renderTopFirms(filteredTrans) {
            const firms = {};
            filteredTrans.forEach(t => {
                const acc = accounts.find(a => a.id === t.accountId);
                if (!acc) return; 
                if(!firms[acc.firm]) firms[acc.firm] = { expenses: 0, winnings: 0, withdrawals: 0 };
                
                if (t.type === 'Gasto') firms[acc.firm].expenses += t.amount;
                else if (t.type === 'Retiro') {
                    firms[acc.firm].winnings += t.amount;
                    firms[acc.firm].withdrawals += 1;
                }
            });

            const firmArray = Object.keys(firms).map(key => ({
                name: key,
                roi: firms[key].expenses > 0 ? ((firms[key].winnings - firms[key].expenses) / firms[key].expenses) * 100 : 0,
                winnings: firms[key].winnings,
                withdrawals: firms[key].withdrawals
            }));

            const injectList = (list, elementId, isRoi) => {
                const el = document.getElementById(elementId);
                if(list.length === 0) { el.innerHTML = '<p class="text-sm text-gray-400 italic">Sin datos</p>'; return; }
                
                el.innerHTML = list.map((f, i) => `
                    <div class="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0">
                        <div class="flex items-center gap-3">
                            <span class="font-bold text-gray-300 text-lg w-4">${i+1}</span>
                            <span class="font-medium text-gray-700">${f.name}</span>
                        </div>
                        <div class="text-right">
                            <div class="font-bold ${isRoi ? 'text-green-600' : 'text-gray-800'}">${isRoi ? f.roi.toFixed(1) + '%' : formatCurrency(f.winnings)}</div>
                            <div class="text-xs text-gray-400">${isRoi ? formatCurrency(f.winnings) : f.withdrawals + ' retiros'}</div>
                        </div>
                    </div>
                `).join('');
            };

            injectList([...firmArray].sort((a,b) => b.roi - a.roi).slice(0, 3), 'top-roi-list', true);
            injectList([...firmArray].sort((a,b) => b.winnings - a.winnings).slice(0, 3), 'top-withdrawals-list', false);
        }

        let myChart = null;
        function renderChart(filteredTrans) {
            const ctx = document.getElementById('capitalChart').getContext('2d');
            const sortedTrans = [...filteredTrans].sort((a,b) => new Date(a.date) - new Date(b.date));
            
            const labels = [];
            const dataPoints = [];
            let currentCapital = 0; 
            
            sortedTrans.forEach(t => {
                labels.push(t.date);
                if (t.type === 'Retiro') currentCapital += t.amount;
                else currentCapital -= t.amount;
                dataPoints.push(currentCapital);
            });

            if(myChart) myChart.destroy();
            
            let gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(124, 58, 237, 0.4)');
            gradient.addColorStop(1, 'rgba(124, 58, 237, 0.0)');

            myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels.length ? labels : ['Inicio'],
                    datasets: [{
                        label: 'Net P&L',
                        data: dataPoints.length ? dataPoints : [0],
                        borderColor: '#7c3aed',
                        backgroundColor: gradient,
                        borderWidth: 2,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#7c3aed',
                        pointBorderWidth: 2,
                        fill: true,
                        tension: 0.35,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { display: false },
                        tooltip: { 
                            callbacks: { label: (c) => formatCurrency(c.raw) },
                            backgroundColor: '#1f2937',
                            padding: 10,
                            cornerRadius: 8
                        }
                    },
                    scales: {
                        x: { display: false },
                        y: { 
                            grid: { color: '#f3f4f6', borderDash: [5, 5] },
                            ticks: { callback: (v) => v + '€', font: {size: 10} }
                        }
                    },
                    interaction: { intersect: false, mode: 'index' }
                }
            });
        }

        function formatCurrency(num) {
            return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(num);
        }

        showSection('dashboard');
// Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('tradingTrackerDarkMode', isDark);
    
    const btn = document.getElementById('darkModeBtn');
    if(btn) {
        btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    }
    
    // Update Chart.js if exists
    if (typeof Chart !== 'undefined') {
        Chart.defaults.color = isDark ? '#9ca3af' : '#6b7280';
        Chart.defaults.borderColor = isDark ? '#374151' : '#f3f4f6';
        if(typeof renderChart === 'function') {
            renderChart();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const isDark = localStorage.getItem('tradingTrackerDarkMode') === 'true';
    if(isDark) {
        document.body.classList.add('dark-mode');
        const btn = document.getElementById('darkModeBtn');
        if(btn) btn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        
        if (typeof Chart !== 'undefined') {
            Chart.defaults.color = '#9ca3af';
            Chart.defaults.borderColor = '#374151';
        }
    }
});
