// Function to handle project filtering based on category
function filterProjects(category) {
    // Select all project cards
    const projectCards = document.querySelectorAll('.project-card');
    
    // Iterate over each card
    projectCards.forEach(card => {
        // Get the category data attribute from the card
        const cardCategory = card.getAttribute('data-category');
        
        // Check if the current category is 'all' OR if the card's category matches the filter category
        if (category === 'all' || cardCategory === category) {
            // If it matches, make sure the card is visible
            card.classList.remove('hidden');
        } else {
            // If it doesn't match, hide the card
            card.classList.add('hidden');
        }
    });
}

// Function to attach event listeners to filter buttons
function setupFilterListeners() {
    // Select all filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Attach a click event listener to each button
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 1. Get the filter value (e.g., 'automation', 'data')
            const filterValue = button.getAttribute('data-filter');
            
            // 2. Perform the filtering operation
            filterProjects(filterValue);
            
            // 3. Update the 'active' class for visual feedback
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

// Run the setup function once the document is fully loaded
document.addEventListener('DOMContentLoaded', setupFilterListeners);