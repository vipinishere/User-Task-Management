async function searchUser() {
  console.log("hello");
  const name = document.getElementById("userInput").value;
  if (name.length < 2) return; // min 2 letters

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
