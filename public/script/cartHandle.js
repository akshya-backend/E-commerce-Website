import { showSuccessMssge, showErrorNotification } from "./messageHandler.js";
document.querySelector('#formMethod').addEventListener('submit', (e)=>handleSubmit(e),{once:true});

var stripe =  await Stripe('pk_test_51PFJFs074WWBAY8duBBXGs0mloLauwxBc6dij0dpBMAJjSE05nN7vEqTrV1EGSUAscucwGrLZuhz8XBo00IA4z0Y00Z23A1Irk');
let stripeELE;
const listBtn = document.querySelectorAll(".removeBtn");
listBtn.forEach((button) => {
    button.addEventListener('click', () => {
    console.log(button.id);
    removeItem(button)
})
});

async function removeItem(button) {
    try {
        const response = await fetch(`/remove-From-cart/${button.id}`, {
            method: 'PUT',
        });
        const res = await response.json();

        if (res.status) {
                const element=document.getElementById(button.id)
                const total=document.getElementById('total')
                total.textContent =`Total: ₹${res.totalPrice}`
                element.remove();
                showSuccessMssge(res.message);
                
            } else {
                showErrorNotification(res.message);
            }
        }
     catch (error) {
        console.error('Error updating quantity:', error);
    }}


    document.querySelectorAll('.cart-item').forEach(item => {
        const quantityInput = item.querySelector('input');
        const incrementBtn = item.querySelector('.increment');
        const decrementBtn = item.querySelector('.decrement');
        const productId=item.querySelector('#quantity').getAttribute('data')
        const price = parseFloat(item.querySelector('.cart-item-price').innerText.replace('₹', ''));
        const subtotal = item.querySelector('.subtotal');

        // Update subtotal and total when quantity changes
        const updateSubtotal = () => {
            const quantity = parseInt(quantityInput.value);
            const total = price * quantity;
            subtotal.innerText = `Subtotal :₹${total.toFixed(2)}`;
            updateTotal();
        };

        // Update total price
        const updateTotal = () => {
            const totalElements = document.querySelectorAll('.subtotal');
            let total = 0;
            totalElements.forEach(element => {
                total += parseFloat(element.innerText.split('₹')[1]);
            });
            document.querySelector('.total').innerText = `Total: ₹${total}`;
        };

        // Increment button click handler
        incrementBtn.addEventListener('click', () => {
            let quantity = parseInt(quantityInput.value) + 1;
            if (quantity <= 10) { // Check if quantity is less than or equal to 10
                quantityInput.value = quantity;
                updateSubtotal();
                appendQuantity(productId); // Send updated quantity to backend
            }
        });

        // Decrement button click handler
        decrementBtn.addEventListener('click', () => {
            if (parseInt(quantityInput.value) > 1) {
                quantityInput.value = parseInt(quantityInput.value) - 1;
                updateSubtotal();
                Decrement(productId); // Send updated quantity to backend
            }
        });

        // Function to send quantity to backend
        const appendQuantity = async (id) => {
            const productId =id ; // Replace with actual product ID
            try {
                const response = await fetch(`/add-to-cart/${productId}`, {
                    method: 'POST',
                });
                const res=  await response.json()
                if (res.status) {
                    console.log("successfully added");
                    return;
                }
            } catch (error) {
                console.error('Error updating quantity:', error);
            }
        };

        // Update subtotal on page load
        updateSubtotal();
    });
    const Decrement = async (id) => {
            try {
                const response = await fetch(`/decrease-qty/${id}`, {
                    method: 'PUT',
                });
                if (!response.ok) {
                    throw new Error('Failed to update quantity');
                }
            } catch (error) {
                console.error('Error updating quantity:', error);
            }
        };


   // Initialize Stripe
async function initStripe() {
    try {
        const elements = stripe.elements();
        stripeELE = elements.create('card', {
            style: {
                base: {
                    iconColor: 'black',
                    color: 'black',
                    fontWeight: '500',
                    fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
                    fontSize: '16px',
                    fontSmoothing: 'antialiased',
                    ':-webkit-autofill': {
                        color: '#fce883',
                    },
                    '::placeholder': {
                        color: 'black',
                    },
                },
                invalid: {
                    iconColor: '#FFC7EE',
                    color: '#FFC7EE',
                },
            },
        });
        document.querySelector('#cardDetailsContainer').style.display = 'block';
        stripeELE.mount('#cardDetailsContainer');
    } catch (error) {
        console.error('Error initializing Stripe:', error);
        // Handle error, show error message to the user
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    try {
        const token = stripeELE ? (await stripe.createToken(stripeELE)).token : null;
        
        const type = stripeELE ? false : true;
        await orderHandler(token ? token.id : null, type);
    } catch (error) {
        console.error('Error submitting form:', error);
        showErrorNotification('Please Enter Valid Details')
    }
}

// Handle order processing
async function orderHandler(id, type) {
    try {
        const response = await fetch('/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: id, paymentType: type }),
        });
        if (!response.ok) {
            throw new Error('Failed to process order');
        }
        const res = await response.json();
        if (res.status) {
            showSuccessMssge(res.message)
            const emptyDiv=`  <h1>No item in the cart</h1> `
            const element=document.querySelector('#formMethod')
            element.innerHTML=emptyDiv;
        } else {
            showErrorNotification(res.message)
        }
    } catch (error) {
        console.error('Error processing order:', error);
        // Handle error, show error message to the user
    }
}

// Event listener for form submission

// Event listener for payment method change
document.querySelector('#paymentMethod').addEventListener('change', (e) => {
    if (e.target.value === 'card') {
        initStripe();
    } else {
        document.querySelector('#cardDetailsContainer').style.display = 'none';
        if (stripeELE) {
            stripeELE.destroy();
        }
    }
});
