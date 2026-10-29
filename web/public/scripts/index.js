// Main dashboard logic: live GPIO states, control switches, sensor cards/gauges,
// readings table and delete-data flow. Everything that needs the signed-in user
// lives inside setupUI(), which auth.js calls on every auth state change.

// convert epochtime to JavaScript Date object
function epochToJsDate(epochTime) {
  return new Date(epochTime * 1000);
}

// convert time to human-readable format YYYY/MM/DD HH:MM:SS
function epochToDateTime(epochTime) {
  var epochDate = new Date(epochToJsDate(epochTime));
  var dateTime = epochDate.getFullYear() + "/" +
    ("00" + (epochDate.getMonth() + 1)).slice(-2) + "/" +
    ("00" + epochDate.getDate()).slice(-2) + " " +
    ("00" + epochDate.getHours()).slice(-2) + ":" +
    ("00" + epochDate.getMinutes()).slice(-2) + ":" +
    ("00" + epochDate.getSeconds()).slice(-2);

  return dateTime;
}

// DOM elements
const loginElement = document.querySelector('#login-form');
const contentElement = document.querySelector("#content-sign-in");
const userDetailsElement = document.querySelector('#user-details');
const authBarElement = document.querySelector('#authentication-bar');
const deleteButtonElement = document.getElementById('delete-button');
const deleteModalElement = document.getElementById('delete-modal');
const deleteDataFormElement = document.querySelector('#delete-data-form');
const viewDataButtonElement = document.getElementById('view-data-button');
const hideDataButtonElement = document.getElementById('hide-data-button');
const tableContainerElement = document.querySelector('#table-container');
const loadDataButtonElement = document.getElementById('load-data');
const cardsCheckboxElement = document.querySelector('input[name=cards-checkbox]');
const gaugesCheckboxElement = document.querySelector('input[name=gauges-checkbox]');

// DOM elements for sensor readings
const gaugesReadingsElement = document.querySelector("#gauges-div");
const cardElement = document.getElementById('cardElement');
const tempElement = document.getElementById("temp");
const humElement = document.getElementById("hum");
const lightElement = document.getElementById("light");
const updateElement = document.getElementById("lastUpdate");

// Elements for GPIO states
const stateElement1 = document.getElementById("state1");
const stateElement2 = document.getElementById("state2");
const stateElement3 = document.getElementById("state3");
const stateElement4 = document.getElementById("state4");
const stateElement5 = document.getElementById("state5");
const stateElement6 = document.getElementById("state6");
const stateElement7 = document.getElementById("state7");
const stateElement8 = document.getElementById("state8");
const stateElement9 = document.getElementById("state9");
const stateElement10 = document.getElementById("state10");

// Button Elements
const bathSW = document.getElementById('bathSW');
const bedroom1SW = document.getElementById('bedroom1SW');
const bedroom2SW = document.getElementById('bedroom2SW');
const Hall1SW = document.getElementById('Hall1SW');
const Hall2SW = document.getElementById('Hall2SW');
const Hall3SW = document.getElementById('Hall3SW');
const lightout = document.getElementById('lightout');
const fan = document.getElementById('fan');
const AL = document.getElementById('AL');
const AF = document.getElementById('AF');

// Database path for GPIO states
var dbPathOutput1 = 'board/outputs/12';
var dbPathOutput2 = 'board/outputs/13';
var dbPathOutput3 = 'board/outputs/14';
var dbPathOutput4 = 'board/outputs/15';
var dbPathOutput5 = 'board/outputs/2';
var dbPathOutput6 = 'board/outputs/4';
var dbPathOutput7 = 'board/outputs/25';
var dbPathOutput8 = 'board/outputs/26';
var dbPathOutput9 = 'board/outputs/AutoFan';
var dbPathOutput10 = 'board/outputs/AutoLight';

// Database references
var dbRefOutput1 = firebase.database().ref().child(dbPathOutput1);
var dbRefOutput2 = firebase.database().ref().child(dbPathOutput2);
var dbRefOutput3 = firebase.database().ref().child(dbPathOutput3);
var dbRefOutput4 = firebase.database().ref().child(dbPathOutput4);
var dbRefOutput5 = firebase.database().ref().child(dbPathOutput5);
var dbRefOutput6 = firebase.database().ref().child(dbPathOutput6);
var dbRefOutput7 = firebase.database().ref().child(dbPathOutput7);
var dbRefOutput8 = firebase.database().ref().child(dbPathOutput8);
var dbRefOutput9 = firebase.database().ref().child(dbPathOutput9);
var dbRefOutput10 = firebase.database().ref().child(dbPathOutput10);

// MANAGE LOGIN/LOGOUT UI
const setupUI = (user) => {
  if (user) {
    //toggle UI elements
    loginElement.style.display = 'none';
    contentElement.style.display = 'block';
    authBarElement.style.display = 'block';
    userDetailsElement.style.display = 'block';
    userDetailsElement.innerHTML = user.email;

    // get user UID to get data from database
    var uid = user.uid;
    console.log(uid);

    // Database paths (with user UID)
    var dbPath = 'UsersData/' + uid.toString() + '/readings';

    // Database references
    var dbRef = firebase.database().ref(dbPath);

    //Update states depending on the database value
    dbRefOutput1.on('value', snap => {
      if (snap.val() == 1) {
        stateElement1.innerText = "ON";
      } else {
        stateElement1.innerText = "OFF";
      }
    });

    dbRefOutput2.on('value', snap => {
      if (snap.val() == 1) {
        stateElement2.innerText = "ON";
      } else {
        stateElement2.innerText = "OFF";
      }
    });

    dbRefOutput3.on('value', snap => {
      if (snap.val() == 1) {
        stateElement3.innerText = "ON";
      } else {
        stateElement3.innerText = "OFF";
      }
    });

    dbRefOutput4.on('value', snap => {
      if (snap.val() == 1) {
        stateElement4.innerText = "ON";
      } else {
        stateElement4.innerText = "OFF";
      }
    });

    dbRefOutput5.on('value', snap => {
      if (snap.val() == 1) {
        stateElement5.innerText = "ON";
      } else {
        stateElement5.innerText = "OFF";
      }
    });

    dbRefOutput6.on('value', snap => {
      if (snap.val() == 1) {
        stateElement6.innerText = "ON";
      } else {
        stateElement6.innerText = "OFF";
      }
    });

    dbRefOutput7.on('value', snap => {
      if (snap.val() == 1) {
        stateElement7.innerText = "ON";
      } else {
        stateElement7.innerText = "OFF";
      }
    });

    dbRefOutput8.on('value', snap => {
      if (snap.val() == 1) {
        stateElement8.innerText = "OFF";
      } else {
        stateElement8.innerText = "ON";
      }
    });

    dbRefOutput9.on('value', snap => {
      if (snap.val() == 1) {
        stateElement9.innerText = "Manual";
      } else {
        stateElement9.innerText = "Auto";
      }
    });

    dbRefOutput10.on('value', snap => {
      if (snap.val() == 1) {
        stateElement10.innerText = "Manual";
      } else {
        stateElement10.innerText = "Auto";
      }
    });

    // Update database upon button click
    bathSW.onclick = () => {
      if (bathSW.checked) {
        dbRefOutput1.set(1);
      } else {
        dbRefOutput1.set(0);
      }
    }

    bedroom1SW.onclick = () => {
      if (bedroom1SW.checked) {
        dbRefOutput2.set(1);
      } else {
        dbRefOutput2.set(0);
      }
    }

    bedroom2SW.onclick = () => {
      if (bedroom2SW.checked) {
        dbRefOutput3.set(1);
      } else {
        dbRefOutput3.set(0);
      }
    }

    Hall1SW.onclick = () => {
      if (Hall1SW.checked) {
        dbRefOutput4.set(1);
      } else {
        dbRefOutput4.set(0);
      }
    }

    Hall2SW.onclick = () => {
      if (Hall2SW.checked) {
        dbRefOutput5.set(1);
      } else {
        dbRefOutput5.set(0);
      }
    }

    Hall3SW.onclick = () => {
      if (Hall3SW.checked) {
        dbRefOutput6.set(1);
      } else {
        dbRefOutput6.set(0);
      }
    }

    lightout.onclick = () => {
      if (lightout.checked) {
        dbRefOutput7.set(1);
      } else {
        dbRefOutput7.set(0);
      }
    }

    fan.onclick = () => {
      if (fan.checked) {
        dbRefOutput8.set(0);
      } else {
        dbRefOutput8.set(1);
      }
    }

    AF.onclick = () => {
      if (AF.checked) {
        dbRefOutput9.set(1);
      } else {
        dbRefOutput9.set(0);
      }
    }

    AL.onclick = () => {
      if (AL.checked) {
        dbRefOutput10.set(1);
      } else {
        dbRefOutput10.set(0);
      }
    }

    //CHECKBOXES
    // Checkbox (cards for sensor readings)
    cardsCheckboxElement.addEventListener('change', (e) => {
      if (cardsCheckboxElement.checked) {
        cardElement.style.display = 'block';
      } else {
        cardElement.style.display = 'none';
      }
    });
    // Checkbox (gauges for sensor readings)
    gaugesCheckboxElement.addEventListener('change', (e) => {
      if (gaugesCheckboxElement.checked) {
        gaugesReadingsElement.style.display = 'block';
      } else {
        gaugesReadingsElement.style.display = 'none';
      }
    });

    // CARDS
    // Get the latest readings and display on cards
    dbRef.orderByKey().limitToLast(1).on('child_added', snapshot => {
      var jsonData = snapshot.toJSON();
      var temperature = jsonData.temperature;
      var humidity = jsonData.humidity;
      var light = jsonData.light;
      var timestamp = jsonData.timestamp;
      // Update DOM elements
      tempElement.innerHTML = temperature;
      humElement.innerHTML = humidity;
      lightElement.innerHTML = light;

      updateElement.innerHTML = epochToDateTime(timestamp);
    });

    // GAUGES
    // Get the latest readings and display on gauges
    dbRef.orderByKey().limitToLast(1).on('child_added', snapshot => {
      var jsonData = snapshot.toJSON();
      var temperature = jsonData.temperature;
      var humidity = jsonData.humidity;
      var timestamp = jsonData.timestamp;
      // Update DOM elements
      var gaugeT = createTemperatureGauge();
      var gaugeH = createHumidityGauge();
      gaugeT.draw();
      gaugeH.draw();
      gaugeT.value = temperature;
      gaugeH.value = humidity;
      updateElement.innerHTML = epochToDateTime(timestamp);
    });

    // DELETE DATA
    // Add event listener to open modal when click on "Delete Data" button
    deleteButtonElement.addEventListener('click', e => {
      console.log("Remove data");
      e.preventDefault();
      deleteModalElement.style.display = "block";
    });

    // Add event listener when delete form is submitted
    deleteDataFormElement.addEventListener('submit', (e) => {
      // delete data (readings)
      dbRef.remove();
    });

    // TABLE
    var lastReadingTimestamp; //saves last timestamp displayed on the table
    // Function that creates the table with the first 100 readings
    function createTable() {
      // append all data to the table
      var firstRun = true;
      dbRef.orderByKey().limitToLast(100).on('child_added', function (snapshot) {
        if (snapshot.exists()) {
          var jsonData = snapshot.toJSON();
          console.log(jsonData);
          var temperature = jsonData.temperature;
          var humidity = jsonData.humidity;
          var light = jsonData.light;
          var timestamp = jsonData.timestamp;
          var content = '';
          content += '<tr>';
          content += '<td>' + epochToDateTime(timestamp) + '</td>';
          content += '<td>' + temperature + '</td>';
          content += '<td>' + humidity + '</td>';
          content += '<td>' + light + '</td>';
          content += '</tr>';
          $('#tbody').prepend(content);
          // Save lastReadingTimestamp --> corresponds to the first timestamp on the returned snapshot data
          if (firstRun) {
            lastReadingTimestamp = timestamp;
            firstRun = false;
            console.log(lastReadingTimestamp);
          }
        }
      });
    }

    // append readings to table (after pressing More results... button)
    function appendToTable() {
      var dataList = []; // saves list of readings returned by the snapshot (oldest-->newest)
      var reversedList = []; // the same as previous, but reversed (newest--> oldest)
      console.log("APPEND");
      dbRef.orderByKey().limitToLast(100).endAt(lastReadingTimestamp).once('value', function (snapshot) {
        // convert the snapshot to JSON
        if (snapshot.exists()) {
          snapshot.forEach(element => {
            var jsonData = element.toJSON();
            dataList.push(jsonData); // create a list with all data
          });
          lastReadingTimestamp = dataList[0].timestamp; //oldest timestamp corresponds to the first on the list (oldest --> newest)
          reversedList = dataList.reverse(); // reverse the order of the list (newest data --> oldest data)

          var firstTime = true;
          // loop through all elements of the list and append to table (newest elements first)
          reversedList.forEach(element => {
            if (firstTime) { // ignore first reading (it's already on the table from the previous query)
              firstTime = false;
            } else {
              var temperature = element.temperature;
              var humidity = element.humidity;
              var timestamp = element.timestamp;
              var content = '';
              content += '<tr>';
              content += '<td>' + epochToDateTime(timestamp) + '</td>';
              content += '<td>' + temperature + '</td>';
              content += '<td>' + humidity + '</td>';
              content += '</tr>';
              $('#tbody').append(content);
            }
          });
        }
      });
    }

    viewDataButtonElement.addEventListener('click', (e) => {
      // Toggle DOM elements
      tableContainerElement.style.display = 'block';
      viewDataButtonElement.style.display = 'none';
      hideDataButtonElement.style.display = 'inline-block';
      loadDataButtonElement.style.display = 'inline-block';
      createTable();
    });

    loadDataButtonElement.addEventListener('click', (e) => {
      appendToTable();
    });

    hideDataButtonElement.addEventListener('click', (e) => {
      viewDataButtonElement.style.display = 'inline-block';
      hideDataButtonElement.style.display = 'none';
    });

    // IF USER IS LOGGED OUT
  } else {
    // toggle UI elements
    loginElement.style.display = 'block';
    authBarElement.style.display = 'none';
    userDetailsElement.style.display = 'none';
    contentElement.style.display = 'none';
  }
}
