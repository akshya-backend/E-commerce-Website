import { showSuccessMssge, showErrorNotification } from "./messageHandler.js";

  document.addEventListener('DOMContentLoaded', function() {
    const editButtons = document.querySelectorAll('.edit-btn');

    function toggleEditable(fieldId) {
      const field = document.getElementById(fieldId);
      field.contentEditable = field.contentEditable === 'false' ? 'true' : 'false';
      field.classList.toggle('editable');
      if (field.contentEditable === 'true') {
        field.focus();
      }
    }

    function sendPutRequest(fieldId, fieldValue) {
      const data = { fieldId, fieldValue };
      const requestOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
      fetch('/updateProfile', requestOptions)
        .then(async response => {
          const res=await response.json()
          if (res.status) {
            showSuccessMssge(res.message)
          } else {
            showErrorNotification(res.message)
          }
        })
        .catch(error => {
          console.error('Error during PUT request:', error.message);
          showErrorNotification(error.message)
        });
    }

    editButtons.forEach(button => {
      button.addEventListener('click', function() {
        const fieldId = this.getAttribute('data-field');
        toggleEditable(fieldId);
      });
    });

    // Handling phone edit button
    const phoneEditBtn = document.getElementById('phoneEditBtn');
    phoneEditBtn.addEventListener('click', function() {
      toggleEditable('phone');
    });

    // Adding focusout event listener to the editable spans
    const editableSpans = document.querySelectorAll('.editable');
    editableSpans.forEach(span => {
      span.addEventListener('focusout', function() {
        const fieldId = this.id;
        const fieldValue = this.innerText;
        sendPutRequest(fieldId, fieldValue);
      });
    });
  });

  const uploadBtn = document.getElementById('setPic');
  const fileInput = document.getElementById('fileInput');
  const profilePic = document.getElementById('profilePic');
  
  uploadBtn.addEventListener('click', function() {
    
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
  
      fileInput.addEventListener('change', async function(event) {
          const file = event.target.files[0];
          if (!file) return;
  
          const formData = new FormData();
          formData.append('file', file);
          showLoadingScreen()
          try {
              const response = await fetch('/updateProfilePic', {
                  method: 'POST',
                  body: formData
              })
              const res = await response.json();
              if (res.status) {
                   hideLoadingScreen()
                   profilePic.src=res.imageUrl
                   showSuccessMssge(res.message)
              } else {
                showErrorNotification(res.message)
              }
              // Handle successful upload
          } catch (error) {
              console.error('Error uploading profile picture:', error);
              // Handle error
          }
      });
  
      fileInput.click(); // Trigger click event on file input
  });
  

//  invoice 
document.getElementById('invoice')?.addEventListener('click', async function(e) {
  const data = e.target.getAttribute('data');
  console.log(data);

  try {
    showLoadingScreen()
      const response = await fetch('/invoice', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ orderId: data })
      });
      const res=await response.json()
      if (res.status) {
         showSuccessMssge("Invoice sent successfully to your email.")
         hideLoadingScreen()

      } else {
        showErrorNotification("Unable to download the invoice ")
      }

      // Use easyinvoice's download function to download the PDF
  } catch (error) {
    hideLoadingScreen()

      console.error('Error downloading invoice:', error);
  }
});
// cancel order

document.getElementById('cancelOrder')?.addEventListener('click',async (e)=>{
  const data = e.target.getAttribute('data');
  console.log(data);
  try {
      const response = await fetch('/orderCancel', {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ orderId: data })
      });
      const res=await response.json()
        showErrorNotification("Order Cancelled ")
        const deleteElement=document.getElementById(data)
        deleteElement.remove()

      // Use easyinvoice's download function to download the PDF
  } catch (error) {
      console.error('Error downloading invoice:', error);
  }

})

// message 


function showLoadingScreen() {
  document.getElementById('main-body').style.filter = 'blur(10px)'
  document.getElementById('loadingScreen').style.display = 'block';
}

// Hide loading screen and enable change button
function hideLoadingScreen() {
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('main-body').style.filter = 'none';
}