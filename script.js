var createBtn = document.querySelector(".reminders__create-auth");
var addBtn = document.querySelector(".reminders__add");
var changeBtn = document.querySelector(".reminders__change");
var delBtn = document.querySelector(".reminders__delete");
var newBtn = document.querySelector(".reminders__new");
var btnAll = document.querySelectorAll(".btn");
var form = document.querySelector(".reminders__form");
var reminderText = form.querySelector(".reminders__text");
var reminderDate = form.querySelector(".reminders__date");
var url = "https://europe-west1-st-testcase.cloudfunctions.net";
var userId;
var dateNear;
var reminderNear;
var timerId;
var currentReminderId = null;
var template = document.querySelector("#reminder").content;
var reminderItem = template.querySelector(".reminders__item");
var reminderList = document.querySelector(".reminders__list");

document.addEventListener("click", function(evt) {
	var target = evt.target;

	if (target === createBtn) {
		auth();
	}

	if (target === changeBtn && currentReminderId && userId) {
		var reminder = JSON.stringify({
			note: reminderText.value,
			date: reminderDate.value
		});
		changeReminder(userId, currentReminderId, reminder);
		reminderText.value = "";
		reminderDate.value = "";
		currentReminderId = null;
	}

	if (target === delBtn && currentReminderId && userId) {
		deleteReminder(userId, currentReminderId);
		reminderText.value = "";
		reminderDate.value = "";
		currentReminderId = null;
	}

	if (target === newBtn && userId) {
		currentReminderId = null;
	}


	if (target.parentNode.classList.contains("reminders__item")) {
		var reminder = target.parentNode;
		reminderText.value  = reminder.children[1].textContent;
		reminderDate.value  = reminder.getAttribute("data-date");
		currentReminderId = reminder.getAttribute("id");
	}	
})

form.addEventListener("submit", function(evt) {
	evt.preventDefault();
	if (reminderText.value && reminderDate.value  && userId) {
		var reminder = JSON.stringify({
			note: reminderText.value,
			date: reminderDate.value
		});
		addReminder(userId, reminder);
		reminderText.value = "";
		reminderDate.value = "";
	}
})

async function auth() {
		var response = await fetch(url + "/api/auth", {
			method: 'POST',
			body: null
		});
	if (response.ok) {
		var result = await response.json();
		userId = result.id;
		console.log(userId);
		for (var i = 0; i < btnAll.length; i++) {
			btnAll[i].classList.remove("btn--disabled");
		}
	} else {
		alert("Ошибка HTTP: " + response.status);
	}	
}

async function getReminders(userId) {
	var response = await fetch(url + "/api/reminders?userId=" + userId);
	if (response.ok) {
		var result = await response.json();
		showAllReminders(result);
	} else {
		alert("Ошибка HTTP: " + response.status);
	}	
}

async function addReminder(userId, reminder) {
	var response = await fetch(url + "/api/reminders?userId=" + userId, {
		method: 'POST',
		headers: {'Content-Type': 'application/json;charset=utf-8'},
		body: reminder
	});
	if (response.ok) {
		getReminders(userId);
	} else {
		alert("Ошибка HTTP: " + response.status);
	}	
}

async function changeReminder(userId, reminderId, reminder) {
	var response = await fetch(url + "/api/reminders/" + reminderId + "?userId=" + userId, {
		method: 'PUT',
		headers: {'Content-Type': 'application/json;charset=utf-8'},
		body: reminder
	});
	if (response.ok) {
		getReminders(userId);
	} else {
		alert("Ошибка HTTP: " + response.status);
	}
}

async function deleteReminder(userId, reminderId) {
	var response = await fetch(url + "/api/reminders/" + reminderId + "?userId=" + userId, {
		method: 'DELETE',
		});
	if (response.ok) {
		getReminders(userId);
	} else {
		alert("Ошибка HTTP: " + response.status);
	}	
}

function showAllReminders (arr) {
	var dateNow = new Date().getTime() - new Date().getTimezoneOffset() * 60000;
	var reminderNear = null;
	if (timerId) {
		clearInterval(timerId);
	}
	reminderList.innerHTML="";
	for (var i = 0; i < arr.length; i++) {
		var newReminder = reminderItem.cloneNode(true);
		var dateDiff = Date.parse(arr[i].date) - dateNow; 
		var date = new Date(Date.parse(arr[i].date) + new Date().getTimezoneOffset() * 60000);
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		if (month < 10) month = "0" + month;
		if (day < 10) day = "0" + day;
		if (hours < 10) hours = "0" + hours;
		if (minutes < 10) minutes = "0" + minutes;
// находим ближайшее событие
		if(!reminderNear && Date.parse(arr[i].date) > dateNow) {
			reminderNear = arr[i];
		}
		if (dateDiff > 0 && Date.parse(arr[i].date) < Date.parse(reminderNear.date)) {
			reminderNear = arr[i];
		}
// 		
		newReminder.children[0].textContent = year + "-" + month + "-" + day + " " + hours + ":" + minutes;
		newReminder.children[1].textContent = arr[i].note;
		newReminder.setAttribute("id", arr[i].id);
		newReminder.setAttribute("data-date", arr[i].date.substr(0, 16));

		checkPassed(Date.parse(arr[i].date), newReminder);

		reminderList.append(newReminder);
	}
	timerId = setInterval(checkDate, 30000, reminderNear);
}

function checkPassed (date, reminder) {
 	var dateNow = new Date().getTime() - new Date().getTimezoneOffset() * 60000;
 	if (date < dateNow) {
 		reminder.classList.add('reminders__item--passed')
 	}
}

function checkDate (reminder) {
	if(reminder) {
		var dateNow = new Date().getTime() - new Date().getTimezoneOffset() * 60000;
	 	if (Date.parse(reminder.date) - dateNow < 0 ) {
	 		alert(reminder.note);
	 		getReminders(userId);
	 	}
	}
}