// Add this script tag to your HTML head section:
// <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

let selectedAmount = 0;
let selectedPlan = '';
let selectedMethod = '';

// Your Razorpay API Key
const RAZORPAY_KEY = "ARAMpEabSFIimqSXwSFFyQIpHjnwkqfV0l8PA5WtoNEVgbX2R_q88P3BbX0_Gwapkx4eOIOzIUt1GAYO";

// Price card selection
document.querySelectorAll('.price-card').forEach(card => {
    card.addEventListener('click', function() {
        // Remove previous selection
        document.querySelectorAll('.price-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection to current card
        this.classList.add('selected');
        
        // Update selected values
        selectedAmount = parseInt(this.dataset.amount);
        selectedPlan = this.dataset.plan;
        
        // Update UI
        document.getElementById('selected-plan').textContent = selectedPlan;
        document.getElementById('total-amount').textContent = `₹${selectedAmount}`;
        
        updatePayButton();
    });
});

// Payment method selection
document.querySelectorAll('.method-card').forEach(card => {
    card.addEventListener('click', function() {
        // Remove previous selection
        document.querySelectorAll('.method-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection to current card
        this.classList.add('selected');
        
        // Update selected method
        selectedMethod = this.dataset.method;
        updatePayButton();
    });
});

function updatePayButton() {
    const payBtn = document.getElementById('pay-btn');
    if (selectedAmount > 0 && selectedMethod) {
        payBtn.innerHTML = `Pay ₹${selectedAmount} <div class="loading" id="loading"></div>`;
        payBtn.disabled = false;
        payBtn.style.opacity = '1';
    } else {
        payBtn.innerHTML = `Complete Payment <div class="loading" id="loading"></div>`;
        payBtn.disabled = selectedAmount === 0 || !selectedMethod;
        payBtn.style.opacity = payBtn.disabled ? '0.6' : '1';
    }
}

function processPayment() {
    if (selectedAmount === 0) {
        alert('Please select a payment plan first!');
        return;
    }
    
    if (!selectedMethod) {
        alert('Please select a payment method!');
        return;
    }

    // Show loading state
    const loading = document.getElementById('loading');
    const payBtn = document.getElementById('pay-btn');
    
    loading.style.display = 'inline-block';
    payBtn.disabled = true;
    payBtn.style.opacity = '0.7';
    payBtn.innerHTML = `Processing... <div class="loading" id="loading" style="display: inline-block;"></div>`;

    // Create Razorpay payment
    const options = {
        key: RAZORPAY_KEY,
        amount: selectedAmount * 100, // Amount in paise (multiply by 100)
        currency: 'INR',
        name: 'Luxe Premium',
        description: `${selectedPlan} - Premium Experience`,
        image: 'https://your-logo-url.com/logo.png', // Optional: Add your logo URL
        handler: function (response) {
            // Payment successful
            console.log('Payment successful:', response);
            
            // Hide payment form and show success
            document.querySelector('.payment-options').style.display = 'none';
            document.getElementById('success-animation').style.display = 'block';
            
            // Show completion message
            setTimeout(() => {
                alert(`🎉 Payment Successful!\n\nPayment ID: ${response.razorpay_payment_id}\nPlan: ${selectedPlan}\nAmount: ₹${selectedAmount}\n\nWelcome to Luxe Premium!`);
                
                // Optional: Send payment details to your server
                sendPaymentToServer(response);
                
            }, 1000);
        },
        prefill: {
            name: 'Customer Name', // You can collect this from a form
            email: 'customer@example.com', // You can collect this from a form
            contact: '9999999999' // You can collect this from a form
        },
        notes: {
            plan: selectedPlan,
            method: selectedMethod
        },
        theme: {
            color: '#6366f1'
        },
        modal: {
            ondismiss: function() {
                // Payment cancelled or failed
                console.log('Payment cancelled');
                resetPaymentButton();
            }
        }
    };

    const rzp = new Razorpay(options);
    
    rzp.on('payment.failed', function (response) {
        // Payment failed
        console.error('Payment failed:', response.error);
        alert(`Payment Failed!\n\nError: ${response.error.description}\nCode: ${response.error.code}`);
        resetPaymentButton();
    });

    // Open Razorpay checkout
    rzp.open();
}

function resetPaymentButton() {
    const loading = document.getElementById('loading');
    const payBtn = document.getElementById('pay-btn');
    
    loading.style.display = 'none';
    payBtn.disabled = false;
    payBtn.style.opacity = '1';
    updatePayButton();
}

// Optional: Send payment details to your server for verification
function sendPaymentToServer(paymentResponse) {
    // Replace with your server endpoint
    const serverEndpoint = 'https://your-server.com/verify-payment';
    
    const paymentData = {
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        amount: selectedAmount,
        plan: selectedPlan,
        method: selectedMethod
    };

    fetch(serverEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Payment verified:', data);
        // Handle server response
    })
    .catch(error => {
        console.error('Error verifying payment:', error);
    });
}

function goBack() {
    if (confirm('Are you sure you want to go back? Your selection will be lost.')) {
        window.history.back();
    }
}

// Add hover effects
document.querySelectorAll('.price-card, .method-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        if (!this.classList.contains('selected')) {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        }
    });
    
    card.addEventListener('mouseleave', function() {
        if (!this.classList.contains('selected')) {
            this.style.transform = 'translateY(0) scale(1)';
        }
    });
});

// Initialize button state
updatePayButton();