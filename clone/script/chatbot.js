function sendMessage() {
  const msg = document.getElementById("chat-input").value;
  if (!msg) return;

  addMessage("user", msg);
  document.getElementById("chat-input").value = "";

  botReply(msg);
}

function addMessage(sender, text, isLoading = false) {
  const body = document.getElementById("chat-body");
  const msgElem = document.createElement("div");

  msgElem.className = sender === "user" ? "user-msg" : "bot-msg";
  msgElem.textContent = text;

  if (isLoading) {
    msgElem.classList.add("loading"); // optional for CSS animation
  }

  body.appendChild(msgElem);
  body.scrollTop = body.scrollHeight;

  return msgElem; // return element so we can replace text later
}

async function botReply(input) {
  input = input.toLowerCase();

  // Show "Bot is typing..." message
  const loadingMsg = addMessage("bot", "Typing...", true);

  // Simulate delay (1–2 seconds)
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Remove the loading text
  loadingMsg.remove();

  // --- Now generate actual response ---
  let reply = "";

  if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
    reply = "Hello! How can I assist you today?";
  }
  else if (input.includes("submit") && input.includes("complaint") ||
           input.includes("complaint form") ||
           input.includes("anonymous")) {
    reply = "To submit a complaint, go to the Complaints page and fill out the form. Anonymous complaints are also allowed.";
  }
  else if (input.includes("status") && input.includes("complaint") ||
           input.includes("track") && input.includes("complaint") ||
           input.includes("my complaints")) {
    reply = "To check your complaint status, you can enter your Complaint ID. When the complaint id is not visable, please reload the page!!!";
  }
   else if (input.includes("The") && input.includes("complaint id is not available") ||
           input.includes("The") && input.includes("complaint id is not visable") ||
           input.includes("my complaints")) {
    reply = "When the complaint id is not visable, please reload the page!!!";
  }
  else if (input.includes("support") || input.includes("contact") || input.includes("help")) {
    reply = "For support, you can contact the admin via email at support@school.com or call 0800-000-4567.";
  }
  else if (input.includes("register") || input.includes("create account")) {
    reply = "To register an account, go to the registration page and fill in your details.";
  }
  else  if (input.includes("how to file a complaint") || input.includes("how to submit a complaint")) {
    reply = `To file a complaint: Fill in the complaint form with details; Submit the form.
     You will receive a Complaint ID for tracking.  Would you like help with anything else`;
  }
  else if (/^[a-f0-9]{24}$/i.test(input)) { // matches MongoDB ObjectId
  try {
    const response = await fetch(`/api/complaint-status/${input}`);
    const data = await response.json();
    if (data.status) {
      reply = `Status for complaint "${data.title}": is ${data.status}${data.anonymous ? " (Anonymous)" : ""}`;
    } else {
      reply = data.message || "Complaint ID not found.";
    }
  } catch (err) {
    console.error(err);
    reply = "Could not fetch complaint status. Please try again later.";
  }
}

  else {
    reply = "I'm not sure I understand. You can ask me things like:\n- How do I submit a complaint?\n- How do I check complaint status?\n- The complaint id is not visable\n- How do I register an account?\n- Support contact";
  }

  // Add the final reply
  addMessage("bot", reply);
}


function toggleChatbot() {
  const box = document.getElementById("chatbot");
  box.classList.toggle("hidden");
}































// Example: pass the logged-in user's registration number
// loadUserComplaints("CS2025/001");


