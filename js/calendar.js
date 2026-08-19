// ========================
// File: js/calendar.js
// Dynamic Booking Calendar
// ========================
// --- DOM Elements ---
const calendarGrid = document.getElementById("calendarGrid");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const selectedDateText = document.getElementById("selectedDateText");
const timeSlots = document.getElementById("timeSlots");
const bookingForm = document.getElementById("bookingForm");
const customerName = document.getElementById("customerName");
const customerServce = document.getElementById("customerService");
const selectedTimeInput = document.getElementById("selectedTimeInput");
const bookingMessage = document.getElementById("bookingMessage");

// --- Calendar State ---
const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDate = null;
let selectedTime = "";

// --- Time Slot Data ---
const weekdaySlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
];
const saturdaySlots = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
];

// Example booked data for practice
const bookedAppointments = {
    "2026-03-28": ["10:00 AM", "2:00 PM"],
    "2026-03-29": [],
};

// --- Helpers ---
const getMonthName = (monthIndex) => {
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    return monthNames[monthIndex];
};

const formatDateKey = (year, month, day) => {
    const safemonth = String(month +1).padStart(2, "0"); // Javascript's Date object numbers months 0-11. This function adds 1 to each month to make it 'human' readable.
    const safeDay = String(day).padStart(2, "0"); // pads the string on the left with "0" unti lit's 2 characters long. 8 -> 08, but 12 stays 12 (already 2 characters long.)
    return `${year}-${safemonth}-${safeDay}`;
};

const formatReadableDate = (year, month, day) => {
    const date = new Date(year, month, day);
    return date.toLocaleDateString("en-US", {
        weekday: "long", // full name e.g. Monday, "short" -> Mon
        month: "long", // full name e.g. August, "short" -> Aug
        day: "numeric", // just the number e.g. 3
        year: "numeric", // full 4-digit year, e.g. 2026
    });
};

const isPastDate = (year, month, day) => { // determines which days are in the past to 'grey' out on calendar
    const compareDate = new Date(year, month, day);
    compareDate.setHours(0, 0, 0, 0);
    const todayOnly = new Date();
    todayOnly.setHours(0, 0, 0, 0);
    return compareDate < todayOnly; 
};

const isClosedDay = (year, month, day) => {
    const date = new Date(year, month, day);
    const weekday = date.getDay();
    // Sunday closed
    if (weekday === 0) {
        return true;
    }
    return false;
};

const getSlotsForDate = (year, month, day) => {
    const date = new Date(year, month, day);
    const weekday = date.getDay();
    if (weekday === 6) {
        return saturdaySlots;
    }
    if (weekday === 0) {
        return [];
    }
    return weekdaySlots;
};

// --- Render Calendar ---
const renderCalendar = () => {
    // The Guard clause
    if (!calendarGrid || !calendarMonthLabel) return;
    // if the calendar or monthLabel is not available, don't run!

    // Update the label and clear the old content
    calendarMonthLabel.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
    calendarGrid.innerHTML = "";

    // Figuring out the grid shape
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Padding with empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-empty";
        calendarGrid.appendChild(emptyCell);
    }

    // Building each day button
    for (let day = 1; day <= daysInMonth; day++) {
        const dayButton = document.createElement("button");
        dayButton.textContent = day;
        dayButton.className = "calendar-day";
        const dateKey = formatDateKey(currentYear, currentMonth, day);

        // Conditionally adding classes (styling hooks based on state)
        if (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        ) {
            dayButton.classList.add("today"); // gives the current day button a beige outline
        }

        if (
            isPastDate(currentYear, currentMonth, day) ||
            isClosedDay(currentYear, currentMonth, day)
        ) {
            dayButton.classList.add("disabled"); // greys out the days past and sundays when closed
        }

        if (
            selectedDate &&
            selectedDate.year === currentYear &&
            selectedDate.month === currentMonth &&
            selectedDate.day === day
        ) {
            dayButton.classList.add("selected"); // adds the 'selected' class to the date clicked
        }

        // The click handler (a closure)
        dayButton.addEventListener("click", () => {
            if (isPastDate(currentYear, currentMonth, day)) return; // extra insurance
            if (isClosedDay(currentYear, currentMonth, day)) return;
            selectedDate = { // fills in the key/value pairs based on date selected by user
                year: currentYear, 
                month: currentMonth,
                day: day,
                key: dateKey, // "2026-06-17" format as a string
            }; // this object is used to store the appointments and prevent double-booking
            selectedTime = "";
            selectedTimeInput.value = "";
            selectedDateText.textContent = formatReadableDate(
                currentYear,
                currentMonth,
                day,
            );
            renderCalendar(); // recalling this function after listeners are added to each button
            renderTimeSlots(); // recalling this function to render the timeSlots
            bookingMessage.textContent = "";
            bookingMessage.className = "booking-message";
        });
        calendarGrid.appendChild(dayButton); // where all buttons are added to the calendar
    }
};

// --- Render Time Slots ---
const renderTimeSlots = () => { // fills in the time-slot buttons for whatever date the user picked
    if (!timeSlots) return;
    timeSlots.innerHTML = "";
    if (!selectedDate) { // catches if the date wasn't selected first, forces date selection before time selection
        timeSlots.innerHTML = `<p class="selected-date-text">Choose a date first.</p>`;
        return;
    }
    const slots = getSlotsForDate( // passes available hours for the day against date selected by user
        selectedDate.year,
        selectedDate.month,
        selectedDate.day,
    );
    const bookedForDay = bookedAppointments[selectedDate.key] || []; // looks up what times are already booked for this specific date. returns undefined if nothing's been booked yet. 
    // checks if there are previous bookings for the selected date and if not, returns an empty array
    if (slots.length === 0) {
        timeSlots.innerHTML = `<p class="selected-date-text">No appointments available for this date.</p>`; 
        return; // a redundancy just in case the CSS class or JS Guard gets loosened later by another dev (real world thinking)
    }
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            const slotBtn = document.createElement("button");
            slotBtn.type = "button";
            slotBtn.textContent = slot;
            slotBtn.className = "time-slot-btn";
            if (bookedForDay.includes(slot)) {
                slotBtn.classList.add("disabled");
                slotBtn.disabled = true;
                slotBtn.textContent = `${slot} - Booked`;
            }
            if (selectedTime === slot) {
                slotBtn.classList.add("selected");
            }
            slotBtn.addEventListener("click", () => {
                selectedTime = slot;
                selectedTimeInput.value = slot;
                renderTimeSlots();
            });
            timeSlots.appendChild(slotBtn);
        }
};;

// --- Month Navigation ---
if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", () => {
        currentMonth--; // decrements the month by 1 on click
        if (currentMonth < 0) { // handles year boundary
            currentMonth = 11; // if month is jan(0) and is decremented it doesn't go to -1, it goes to 11(dec)
            currentYear--; // decrements the year by 1
        }
        renderCalendar(); // re-runs renderCalendar() function from earlier that builds the whole grid
    });
}
if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
}

// --- Booking Submit ---
if (bookingForm) {
    bookingForm.addEventListener("submit", (event) => {
        event.preventDefault(); // prevents default behaviors for all events
        const nameValue = customerName.value.trim(); // trim() removes whitespace around a string, e.g. " Tyler " becomes "Tyler" preventing copy/paste spaces from being included as part of their name
        const serviceValue = customerServce.value;
        const timeValue = selectedTimeInput.value;
        if (
            nameValue === "" ||
            serviceValue === "" ||
            !selectedDate ||
            timeValue === ""
        ) {
            bookingMessage.textContent = "Please choose a date, time, name, and service.";
            bookingMessage.className = "booking-message-error";
            return;
        }
        if (!bookedAppointments[selectedDate.key]) { // reads as 'if there's no array yet for this date...'
            bookedAppointments[selectedDate.key] = []; // ...then create one
        }
        if (bookedAppointments[selectedDate.key].includes(timeValue)) {
            bookingMessage.textContent = "That time was just taken. Please choose another.";
            bookingMessage.className = "booking-message error";
            renderTimeSlots();
            return;
        }
        bookedAppointments[selectedDate.key].push(timeValue); // adds the time value to the booked appointments array
        bookingMessage.textContent = `${nameValue}, your ${serviceValue} appointment is booked for ${formatReadableDate(
            selectedDate.year,
            selectedDate.month,
            selectedDate.day,
        )} at ${timeValue}.`;
        bookingMessage.className = "booking-message success";
        bookingForm.reset();
        selectedTime = "";
        selectedTimeInput.value = "";
        renderTimeSlots();
    });
}

// --- App Start ---
renderCalendar();
renderTimeSlots();
