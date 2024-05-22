// Element references
const radioButtons = document.querySelectorAll('input[name="Whatsapp1"]');
let numberInput = document.getElementById("phoneInput");
let messageInput = document.getElementById("messageInput");
let inputFile = document.getElementById("inputFile");
let sent = document.getElementById("sent");
let totalNumbers = document.getElementById("total");
let percentage = document.getElementById("percentage");
let messageAlert = document.querySelector(".message");
let sendbtn = document.getElementById("sendBtn");
let delay = document.getElementById("delay");

let method = "text";
let numbers = [];
let numIndex = 0;
let intervalId;

document.addEventListener("DOMContentLoaded", () => {
  initializeEventListeners();
  toggelCheckLoadButton(false);
});

function initializeEventListeners() {
  radioButtons.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.checked) {
        method = radio.id;
        if (method === "api") {
          swal({
            title: "Beta Version",
            text: "The message will only sent to saved numbers on the device",
            icon: "info",
          });
        }
        document.body.classList.toggle("web");
      }
    });
  });

  inputFile.addEventListener("change", handleFileUpload);
  sendbtn.addEventListener("click", send);
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      numbers = extractNumbersFromCSV(content);
      if (numbers.length) {
        numberInput.value = numbers[0];
        totalNumbers.innerHTML = numbers.length;
        messageAlert.classList.add("show");
      }
    };
    reader.readAsText(file);
  }
}

function extractNumbersFromCSV(content) {
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];

  const header = lines[0].split(/[,;\t]/).map((h) => h.trim().toLowerCase());
  const numberIndex = header.indexOf("number");

  if (numberIndex === -1) {
    swal({
      title: "Number not found",
      text: "Please ensure that your file has a 'number' column",
      icon: "error",
    });
    return [];
  }

  swal({
    title: "Uploaded",
    text: "Successfully detected the 'number' column",
    icon: "success",
  });

  const numbersSet = new Set(
    lines
      .slice(1)
      .map((line) => {
        const cells = line.split(/[,;\t]/).map((cell) => cell.trim());
        return parseFloat(cells[numberIndex]);
      })
      .filter((num) => !isNaN(num))
  );

  return Array.from(numbersSet);
}

function init() {
  let times = 0;
  intervalId = setInterval(() => {
    times++;
    fetchData(
      `https://trigger.macrodroid.com/665214b2-b010-4d7e-a34d-3ab90275b5f7/birthday?number=${numberInput.value}&type=${method}`,
      (error) => {
        if (error) {
          console.error("Error fetching data:", error);
        } else {
          numIndex++;
          updateProgress();
        }

        if (times >= numbers.length) {
          clearInterval(intervalId);
          completeTask();
        }
      }
    );
  }, delay.value || 5000);
  return intervalId;
}

function cancelSend() {
  clearInterval(intervalId);
  toggelCheckLoadButton(false);
  swal({
    title: "Task Cancelled",
    text: "Click to resume to start again",
    icon: "error",
  });
}

function send() {
  if (!checkDelay()) return;
  // alert(numberInput.value.length)
  if (inputFile.value) {
    init();
    toggelCheckLoadButton(true);
  } else {
    if (!numberInput.value) {
      swal({
        title: "Invalid Mobile",
        text: "The mobile number cannot be empty. Please enter a valid mobile number.",
        icon: "info",
      });
      return; // Exit the function if the input is empty
    }

    // Check if the input length is not exactly 10 characters
    if (numberInput.value.length !== 10) {
      swal({
        title: "Invalid Mobile",
        text: "The mobile number must be exactly 10 digits long. Please check and try again.",
        icon: "info",
      });
      return; // Exit the function if the input length is not 10 characters
    }
    sendbtn.innerHTML = '<i class="fa fa-circle-o-notch fa-spin"></i>Sending';
    fetchData(
      `https://trigger.macrodroid.com/665214b2-b010-4d7e-a34d-3ab90275b5f7/birthday?number=${
        numberInput.value
      }&type=${method}&name=${encodeURIComponent(messageInput.value)}`,
      (error) => {
        if (error) {
          console.error("Error fetching data:", error);
        } else {
          swal({
            title: "Sent",
            text: `Successfully message sent to ${numberInput.value}`,
            icon: "success",
          });
          sendbtn.innerHTML = "Send";
        }
      }
    );
  }
}

function completeTask() {
  swal({
    title: "Task Completed",
    text: "Successfully sent messages to all numbers",
    icon: "success",
  });
  messageAlert.classList.remove("show");
  numIndex = 0;
  numbers = [];
  inputFile.value = null;
  numberInput.value = null;
}

function updateProgress() {
  sent.innerHTML = numIndex;
  numberInput.value = numbers[numIndex];
  let progress = Math.floor((numIndex * 100) / numbers.length);
  percentage.innerHTML = `${progress}%`;
}

function fetchData(url, callback) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        ThrowErr();
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then((data) => callback(null, data))
    .catch((error) => {
      console.error("Fetch error:", error);
      ThrowErr();
      callback(error, null);
    });
}

function toggelCheckLoadButton(state) {
  let check = document.getElementById("check");
  let loader = document.getElementById("loader");
  if (state) {
    check.style.display = "none";
    loader.style.display = "block";
  } else {
    check.style.display = "block";
    loader.style.display = "none";
  }
}

function checkDelay() {
  const value = delay.value;
  if (value > 1000 && value < 15000) {
    return true;
  } else {
    swal({
      title: "INVALID",
      text: "Delay should be between 1000 & 15000",
      icon: "error",
    });
    delay.value = null;
    return false;
  }
}

function ThrowErr() {
  swal({
    title: "Error",
    text: "That's an error. That's all we know. Maybe try again later",
    icon: "error",
  });
  sendbtn.innerHTML = "Send";
}
