import { showSuccessMssge, showErrorNotification } from "./messageHandler.js";

document.getElementById('editbtn').addEventListener('click', searchProduct)



 async function searchProduct() {
    var productId = document.getElementById("productIdInput").value;
    const response = await fetch('/edit-Product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id:productId }),
      });

      const res = await response.json();

      if (res.status) {
        showSuccessMssge(res.message);
        var productDetails = {
            image: res.product.image, // URL of the product image
            name:res.product.product_name ,
            price: res.product.product_price,
            id:res.product._id
          };
          displayProduct(productDetails);
      } else {
        showErrorNotification("Unable to deliver the item.");
      }
   
  }

  function displayProduct(productDetails) {
    var productBox = document.getElementById("productBox");
    document.getElementById("productImage").src = productDetails.image;
    document.getElementById("productName").value = productDetails.name;
    document.getElementById("productPrice").value= productDetails.price;
    document.getElementById("hiddenData").value=productDetails.id
    productBox.style.display = "flex";
  }

  