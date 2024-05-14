import { showErrorNotification, showSuccessMssge } from "./messageHandler.js";

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.container').addEventListener('click', async (event) => {
    if (event.target.classList.contains('delivery-btn')) {
      const id = event.target.getAttribute('data');
      try {
        const response = await fetch('/item-delivered', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        const res = await response.json();

        if (res.status) {
          showSuccessMssge(res.message);
          document.getElementById(id).remove();
        } else {
          showErrorNotification("Unable to deliver the item.");
        }
      } catch (error) {
        showErrorNotification("An error occurred. Please try again.");
        console.error("Error delivering item:", error);
      }
    }
  });
});
