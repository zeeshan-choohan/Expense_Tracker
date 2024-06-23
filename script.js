// Function to fetch expenses from local storage
function fetchExpenses() {
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    return expenses;
}

// Function to save expenses to local storage
function saveExpenses(expenses) {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Function to fetch budget from local storage
function fetchBudget() {
    let budget = JSON.parse(localStorage.getItem('budget')) || 0;
    return budget;
}

// Function to save budget to local storage
function saveBudget(budget) {
    localStorage.setItem('budget', JSON.stringify(budget));
}

// Function to add expense
function addExpense(date, amount, description) {
    let expenses = fetchExpenses();
    expenses.push({ date, amount, description });
    saveExpenses(expenses);
}

// Function to edit expense by index
function editExpense(index, date, amount, description) {
    let expenses = fetchExpenses();
    expenses[index] = { date, amount, description };
    saveExpenses(expenses);
}

// Function to delete expense by index
function deleteExpense(index) {
    let expenses = fetchExpenses();
    expenses.splice(index, 1);
    saveExpenses(expenses);
}

// Function to populate expenses list in UI
function populateExpenses() {
    const expensesList = document.getElementById('expensesList');
    expensesList.innerHTML = '';
    let expenses = fetchExpenses();
    expenses.forEach((expense, index) => {
        const expenseItem = document.createElement('div');
        expenseItem.classList.add('expense-item');
        expenseItem.innerHTML = `
            <div>
                <span><strong>Date:</strong> ${expense.date}</span>
                <span><strong>Amount:</strong> $${expense.amount}</span>
                <span><strong>Description:</strong> ${expense.description}</span>
            </div>
            <div>
                <button class="edit-btn" data-index="${index}">Edit</button>
                <button class="delete-btn" data-index="${index}">Delete</button>
            </div>
        `;
        expensesList.appendChild(expenseItem);
    });

    // Add event listeners to edit and delete buttons
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            const expense = expenses[index];
            // Prefill form with existing data for editing
            document.getElementById('expenseDate').value = expense.date;
            document.getElementById('expenseAmount').value = expense.amount;
            document.getElementById('expenseDescription').value = expense.description;
            // Change form submit button to Update
            document.getElementById('expenseSubmitBtn').innerText = 'Update';
            document.getElementById('expenseSubmitBtn').dataset.index = index;
        });
    });

    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            deleteExpense(index);
            populateExpenses();
        });
    });

    // Update reports
    updateBudgetOverview();
    updateBudgetTracking();
    updateFinancialReports();
}

// Function to update budget overview
function updateBudgetOverview() {
    const budgetOverviewData = document.getElementById('budgetOverviewData');
    const expenses = fetchExpenses();
    const totalBudget = fetchBudget();
    const totalSpent = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const remainingBudget = totalBudget - totalSpent;

    budgetOverviewData.innerHTML = `
        <p><strong>Total Budget:</strong> $${totalBudget.toFixed(2)}</p>
        <p><strong>Total Spent:</strong> $${totalSpent.toFixed(2)}</p>
        <p><strong>Remaining Budget:</strong> $${remainingBudget.toFixed(2)}</p>
    `;
}

// Function to update budget tracking
function updateBudgetTracking() {
    const budgetTrackingResults = document.getElementById('budgetTrackingResults');
    const expenses = fetchExpenses();
    const monthlyExpenses = {};

    expenses.forEach(expense => {
        const month = new Date(expense.date).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!monthlyExpenses[month]) {
            monthlyExpenses[month] = 0;
        }
        monthlyExpenses[month] += parseFloat(expense.amount);
    });

    budgetTrackingResults.innerHTML = Object.entries(monthlyExpenses).map(([month, amount]) => `
        <p><strong>${month}:</strong> $${amount.toFixed(2)}</p>
    `).join('');
}

// Function to update financial reports
function updateFinancialReports() {
    const financialReportsData = document.getElementById('financialReportsData');
    const expenses = fetchExpenses();
    const categories = {};

    expenses.forEach(expense => {
        const description = expense.description;
        if (!categories[description]) {
            categories[description] = 0;
        }
        categories[description] += parseFloat(expense.amount);
    });

    financialReportsData.innerHTML = Object.entries(categories).map(([description, amount]) => `
        <p><strong>${description}:</strong> $${amount.toFixed(2)}</p>
    `).join('');
}

// Event listener for saving budget
document.getElementById('saveBudget').addEventListener('click', () => {
    const totalBudget = parseFloat(document.getElementById('totalBudget').value);
    saveBudget(totalBudget);
    updateBudgetOverview();
});

// Function to handle form submission (adding or editing expense)
const expenseForm = document.getElementById('expenseForm');
expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = expenseForm.querySelector('#expenseDate').value;
    const amount = parseFloat(expenseForm.querySelector('#expenseAmount').value).toFixed(2);
    const description = expenseForm.querySelector('#expenseDescription').value;
    const submitBtn = document.getElementById('expenseSubmitBtn');

    if (submitBtn.innerText === 'Update') {
        const index = submitBtn.dataset.index;
        editExpense(index, date, amount, description);
        submitBtn.innerText = 'Add Expense';
        delete submitBtn.dataset.index;
    } else {
        addExpense(date, amount, description);
    }

    populateExpenses();
    expenseForm.reset();
});

// Function to generate and download PDF summary
document.getElementById('download-pdf-button').addEventListener('click', async function() {
    try {
        // Create a new PDF document
        const { PDFDocument, rgb } = PDFLib;
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const fontSize = 12;

        // Example content, replace with your actual dynamic data
        const totalBudget = fetchBudget().toFixed(2);
        const expenses = fetchExpenses();
        const totalSpent = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0).toFixed(2);
        const remainingBudget = (totalBudget - totalSpent).toFixed(2);

        // Define table headers
        const headers = ['Serial No.', 'Date', 'Amount', 'Expense'];
        const summaryText = ['Expense Summary'];

        // Add content to the PDF
        let y = 750;
        page.drawText(summaryText[0], { x: 50, y, size: 20 });
        y -= 30;

        // Draw table headers
        headers.forEach((header, index) => {
            page.drawText(header, { x: 50 + index * 130, y, size: fontSize });
        });
        y -= 20;

        // Draw expense data
        expenses.forEach((expense, index) => {
            const row = [index + 1, expense.date, `$${expense.amount}`, expense.description];
            row.forEach((cell, cellIndex) => {
                page.drawText(cell.toString(), { x: 50 + cellIndex * 130, y, size: fontSize });
            });
            y -= 20;
        });

        // Add totals at the bottom
        page.drawText(`Total Amount: $${totalBudget}`, { x: 50, y: y - 20, size: fontSize });
        page.drawText(`Remaining Amount: $${remainingBudget}`, { x: 400, y: y - 20, size: fontSize });

        // Serialize PDF to bytes (Uint8Array)
        const pdfBytes = await pdfDoc.save();

        // Create blob from PDF bytes
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        // Create download link and trigger click
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'budget_summary.pdf';
        link.click();
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
    }
});

// Initial population of expenses list
populateExpenses();
