async function searchUser() {
  const name = document.getElementById("userInput").value;
  if (name.length < 1) return; // min 2 letters

  const res = await fetch(`/user/search?name=${name}`);
  const users = await res.json();

  let list = document.getElementById("userList");
  list.innerHTML = "";

  users.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = user.name + " (" + user.email + ")";
    li.onclick = () => {
      document.getElementById("userInput").value = user.name;
      document.getElementById("userId").value = user._id; // hidden input for DB
      list.innerHTML = "";
    };
    list.appendChild(li);
  });
}

const urlParams = new URLSearchParams(window.location.search);
const stat = urlParams.get("status");
const encodedMessage = urlParams.get("message");

if (stat && encodedMessage) {
  // 2. Decode the message (replace + with space, and decode URI components)
  const message = decodeURIComponent(encodedMessage.replace(/\+/g, " "));

  let iconType = "";
  let titleText = "";

  // 3. Determine SweetAlert properties based on status
  if (stat === "success") {
    iconType = "success";
    titleText = "Success!";
  } else if (stat === "error" || status === "fail") {
    iconType = "error";
    titleText = "Oops...";
  } else if (stat === "info") {
    iconType = "info";
    titleText = "Information";
  }

  // 4. Trigger SweetAlert
  if (iconType) {
    Swal.fire({
      icon: iconType,
      title: titleText,
      text: message,
      confirmButtonText: "OK",
    });
  }

  // 5. Clean the URL (Crucial for preventing the alert from reappearing on refresh)
  // This removes the query parameters without reloading the page.
  const cleanUrl =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname;
  window.history.replaceState(null, "", cleanUrl);
}

async function confirmDelete(e) {
  e.preventDefault();

  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    e.target.submit();
  } else {
    return false;
  }

  console.log("Confirmed, continuing operation...");
}
