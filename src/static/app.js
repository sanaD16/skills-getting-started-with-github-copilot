document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        const participants = details.participants && details.participants.length
          ? details.participants
          : ["No participants yet"];

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-box">
            <p class="participants-title">Participants</p>
            <ul class="participants-list">
              ${participants
                .map((participant) => {
                  const isEmptyState = participant === "No participants yet";
                  return `
                    <li class="participant-item ${isEmptyState ? "participant-empty" : ""}">
                      <span class="participant-name">${participant}</span>
                      ${isEmptyState ? "" : `<button
                        type="button"
                        class="participant-remove"
                        aria-label="Remove ${participant} from ${name}"
                        data-activity="${name}"
                        data-email="${participant}"
                        title="Remove participant"
                      >
                        <span aria-hidden="true">✕</span>
                      </button>`}
                    </li>
                  `;
                })
                .join("")}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);

        activityCard.querySelectorAll(".participant-remove").forEach((button) => {
          button.addEventListener("click", async () => {
            const email = button.dataset.email;
            const selectedActivity = button.dataset.activity;

            try {
              const response = await fetch(
                `/activities/${encodeURIComponent(selectedActivity)}/unregister?email=${encodeURIComponent(email)}`,
                {
                  method: "DELETE",
                }
              );

              const result = await response.json();

              if (response.ok) {
                messageDiv.textContent = result.message;
                messageDiv.className = "success";
              } else {
                messageDiv.textContent = result.detail || "Failed to unregister participant.";
                messageDiv.className = "error";
              }

              messageDiv.classList.remove("hidden");
              setTimeout(() => {
                messageDiv.classList.add("hidden");
              }, 5000);

              fetchActivities();
            } catch (error) {
              messageDiv.textContent = "Failed to unregister participant.";
              messageDiv.className = "error";
              messageDiv.classList.remove("hidden");
              console.error("Error unregistering participant:", error);
            }
          });
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  fetchActivities();
});
