```javascript
const API_BASE = "/api";

async function request(path, options = {}) {
    const response = await fetch(API_BASE + path, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
}

function showMessage(message, isError = false) {
    const element = document.getElementById("message");

    if (element) {
        element.textContent = message;
        element.style.color = isError ? "#c93636" : "#18794e";
    }
}

function normalizeDate(value) {
    return value ? value.replace("T", " ") : "";
}

async function loadFlights() {
    try {
        const data = await request("/flights");
        const tableBody = document.getElementById("flightsTableBody");

        tableBody.innerHTML = "";

        data.flights.forEach(flight => {
            const row = document.createElement("tr");

            [
                flight.flight_identifier,
                flight.departure_location,
                flight.destination_location,
                normalizeDate(flight.scheduled_departure),
                normalizeDate(flight.scheduled_arrival),
                flight.aircraft_model,
                flight.seating_capacity,
                flight.crew_count
            ].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });

        showMessage(`${data.flights.length} flight(s) loaded.`);
    } catch (error) {
        showMessage(error.message, true);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const apiStatus = document.getElementById("apiStatus");

    if (apiStatus) {
        request("/health")
            .then(() => apiStatus.textContent = "API Healthy")
            .catch(() => apiStatus.textContent = "API Unavailable");
    }

    const addForm = document.getElementById("addFlightForm");

    if (addForm) {
        addForm.addEventListener("submit", async function(event) {
            event.preventDefault();

            const data = {
                flight_identifier: document.getElementById("flightIdentifier").value,
                departure_location: document.getElementById("departureLocation").value,
                destination_location: document.getElementById("destinationLocation").value,
                scheduled_departure: document.getElementById("scheduledDeparture").value,
                scheduled_arrival: document.getElementById("scheduledArrival").value,
                aircraft_model: document.getElementById("aircraftModel").value,
                seating_capacity: Number(document.getElementById("seatingCapacity").value),
                crew_count: Number(document.getElementById("crewCount").value)
            };

            try {
                const response = await request("/flights", {
                    method: "POST",
                    body: JSON.stringify(data)
                });

                showMessage(response.message);
                addForm.reset();
            } catch (error) {
                showMessage(error.message, true);
            }
        });
    }

    const deleteForm = document.getElementById("deleteFlightForm");

    if (deleteForm) {
        deleteForm.addEventListener("submit", async function(event) {
            event.preventDefault();

            const flightIdentifier =
                document.getElementById("deleteFlightIdentifier").value.trim();

            try {
                const response = await request(
                    `/flights/${encodeURIComponent(flightIdentifier)}`,
                    { method: "DELETE" }
                );

                showMessage(response.message);
                deleteForm.reset();
            } catch (error) {
                showMessage(error.message, true);
            }
        });
    }

    const loadButton = document.getElementById("loadFlights");

    if (loadButton) {
        loadButton.addEventListener("click", loadFlights);
        loadFlights();
    }
});
```
