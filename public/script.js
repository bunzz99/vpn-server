// Simple client-side functionality
document.addEventListener('DOMContentLoaded', function() {
    // Test API endpoints
    const testButtons = document.querySelectorAll('.endpoint-card a');
    
    testButtons.forEach(button => {
        if (button.getAttribute('href').startsWith('/api/')) {
            button.addEventListener('click', async function(e) {
                e.preventDefault();
                const url = this.getAttribute('href');
                
                try {
                    const response = await fetch(url);
                    const data = await response.text();
                    console.log('API Response:', data);
                    alert('Check console for response data');
                } catch (error) {
                    console.error('API Error:', error);
                    alert('Error testing API - check console');
                }
            });
        }
    });
    
    // Add some interactive effects
    const cards = document.querySelectorAll('.endpoint-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});
