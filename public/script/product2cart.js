import { showErrorNotification, showSuccessMssge } from "./messageHandler.js";

const buttons = document.querySelectorAll(".submit");
buttons.forEach(button => {
    button.addEventListener("click", async () => {
        const getID = button.getAttribute("id");
        try {
            const res = await fetch(`/add-to-cart/${getID}`, { method: 'POST' });
            const response=await res.json()
            console.log(response);
            if (response.status) {
                updateCartIcon();
                showSuccessMssge("Item Added Successfully");
                updateCartItemCount(response.result.cart.items.length);
            } else {
                showErrorNotification(response.message)
            }
        } catch (error) {
            console.error('An error occurred while updating the cart:', error);
        }
    });
});

function updateCartIcon() {
    const cartIcon = document.querySelector(".cart-icon");
    cartIcon.classList.add("shake");
    setTimeout(() => {
        cartIcon.classList.remove("shake");
    }, 500);
}



function updateCartItemCount(count) {
    document.getElementById("count").textContent = count;
}

